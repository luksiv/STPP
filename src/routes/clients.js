import Router from 'express-promise-router';
import {check, validationResult} from 'express-validator';
import db from '../models';
import {errors as errorHandler} from '../handlers'
import crypto from "crypto";

const router = Router();

router.param('clientId', (req, res, next) => {
    db.clients.getClient(req.params.clientId)
        .then(client => {
            if (client) {
                req.client = client;
                next()
            } else {
                errorHandler.sendNotFoundError(res)
            }
        })
        .catch(e => {
            handleOtherError(res, e)
        })
});

// todo fix
// router.get('/:genders', (req, res) => {
//     db.clients.getGenders()
//         .then(genders => {
//             res.json(genders)
//         })
//         .catch(e => {
//             handleOtherError(res, e)
//         })
// })

router.get('/',
    requireAuthorization,
    requireRoleTrainer,
    (req, res) => {
        db.clients.getClients()
            .then(clients => res.json(clients))
            .catch(e => handleOtherError(res, e))
    });

router.post('/',
    [
        check('username').exists().isString(),
        check('password').exists().isString(),
        check('user_role').exists().isIn([1, 2, '1', '2']),
        check('first_name').exists().isString(),
        check('last_name').exists().isString(),
        check('email_address').exists().isString(),
        check('phone_number').optional({nullable: true}).isString(),
        check('age').exists().isString(),
        check('gender').optional({nullable: true}).isString(),
        check('weight').optional({nullable: true}).isNumeric(),
        check('height').optional({nullable: true}).isNumeric(),
    ],
    (req, res) => {
        validateInputs(req, res, () => {
            let passwordHash = crypto.createHash('sha256').update(req.body.password).digest('base64');
            let clientDetails = {
                username: req.body.username,
                password: passwordHash,
                userRole: req.body.user_role,
                firstName: req.body.first_name,
                lastName: req.body.last_name,
                emailAddress: req.body.email_address,
                phoneNumber: req.body.phone_number,
                age: req.body.age,
                gender: req.body.gender,
                weight: req.body.weight,
                height: req.body.height
            };
            db.users.isUsernameUsed(clientDetails.username)
                .then(isUsed => {
                    if (isUsed.exists) {
                        errorHandler.sendConflictError(res, 'Username is already used')
                    } else {
                        db.users.isEmailUsed(clientDetails.emailAddress)
                            .then(isUsed => {
                                if (isUsed.exists) {
                                    errorHandler.sendConflictError(res, 'Email is already used')
                                } else {
                                    db.clients.createClient(clientDetails)
                                        .then(result => {
                                            res.status(201).json(result)
                                        })
                                        .catch(e => {
                                            handleOtherError(res, e)
                                        })
                                }
                            })
                            .catch(e => {
                                handleOtherError(res, e)
                            })
                    }
                })
                .catch(e => {
                    handleOtherError(res, e)
                })
        })
    });

router.get('/:clientId',
    requireAuthorization,
    (req, res) => {
    console.log(req.user.role)
        console.log(req.user.id)
        console.log(req.params.clientId)
        if (req.user.role == 'Client' && req.user.id == req.params.clientId) {
            res.json(req.client)
        } else if (req.user.role == 'Trainer') {
            let trainerId = req.user.id
            db.assignments.getClientTrainerAssignment(req.params.clientId, trainerId)
                .then(assignment => {
                    if (assignment) {
                        if (assignment.status in ['Canceled', ['Rejected']]) {
                            errorHandler.sendForbiddenError(res)
                        } else {
                            res.json(req.client)
                        }
                    } else {
                        errorHandler.sendForbiddenError(res)
                    }
                })
                .catch(e => {
                    handleOtherError(res, e)
                })
        } else {
            errorHandler.sendForbiddenError(res)
        }
    });

router.put('/:clientId',
    requireAuthorization,
    requireValidClientId,
    [
        check('first_name').exists().isString(),
        check('last_name').exists().isString(),
        check('email_address').optional({nullable: true}).isString(),
        check('phone_number').optional({nullable: true}).isString(),
        check('age').exists().isString(),
        check('gender').optional({nullable: true}).isString(),
        check('weight').optional({nullable: true}).isNumeric(),
        check('height').optional({nullable: true}).isNumeric(),
    ],
    (req, res) => {
        validateInputs(req, res, () => {
            let clientDetails = {
                firstName: req.body.first_name,
                lastName: req.body.last_name,
                emailAddress: req.body.email_address,
                phoneNumber: req.body.phone_number,
                age: req.body.age,
                gender: req.body.gender,
                weight: req.body.weight,
                height: req.body.height
            };
            db.users.isEmailUsed(clientDetails.emailAddress, req.params.clientId)
                .then(isUsed => {
                    if (isUsed.exists) {
                        errorHandler.sendConflictError(res, 'Email is already used')
                    } else {
                        db.clients.updateClient(req.params.clientId, clientDetails)
                            .then(result => {
                                res.status(204).send()
                            })
                            .catch(e => {
                                handleOtherError(res, e)
                            })
                    }
                })
                .catch(e => {
                    handleOtherError(res, e)
                })
        })
    });

router.delete('/:clientId',
    requireAuthorization,
    requireValidClientId,
    (req, res) => {
        db.clients.deleteClient(req.params.clientId)
            .then(() => {
                res.status(204).send()
            })
            .catch(e => {
                handleOtherError(res, e)
            })
    });

function validateInputs(req, res, callback) {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        errorHandler.sendBadRequestError(res, errors.array())
    } else {
        callback()
    }
}

function handleOtherError(res, e) {
    console.log(e);
    errorHandler.sendInternalError(res)
}

function requireAuthorization(req, res, next) {
    if (!req.user) {
        errorHandler.sendUnauthorizedError(res)
    } else {
        next()
    }
}

function requireRoleTrainer(req, res, next) {
    if (req.user.role != 'Trainer') {
        errorHandler.sendForbiddenError(res)
    } else {
        next()
    }
}

function requireValidClientId(req, res, next) {
    if (req.user.id != req.params.clientId) {
        console.log(req.user.id)
        console.log(req.params.clientId)
        errorHandler.sendForbiddenError(res)
    } else {
        next()
    }
}


export default router;