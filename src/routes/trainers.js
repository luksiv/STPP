import Router from 'express-promise-router';
import {check, validationResult} from 'express-validator';
import db from '../models';
import {errors as errorHandler} from '../handlers'
import crypto from "crypto";

const router = Router();

router.param('trainerId', (req, res, next) => {
    db.trainers.getTrainer(req.params.trainerId)
        .then(trainer => {
            if (trainer) {
                req.trainer = trainer;
                next()
            } else {
                errorHandler.sendNotFoundError(res)
            }
        })
        .catch(e => {
            handleOtherError(res, e)
        })
});

router.param('serviceId', (req, res, next) => {
    db.trainers.services.getService(req.params.serviceId)
        .then(service => {
            if (service) {
                req.service = service;
                next()
            } else {
                errorHandler.sendNotFoundError(res)
            }
        })
        .catch(e => {
            handleOtherError(res, e)
        })
});

router.get('/', (req, res) => {
    db.trainers.getTrainers()
        .then(trainers => res.json(trainers))
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
        check('education').optional({nullable: true}).isString(),
        check('experience').optional({nullable: true}).isString(),
    ],
    (req, res) => {
        validateInputs(req, res, () => {
            let passwordHash = crypto.createHash('sha256').update(req.body.password).digest('base64');
            let trainerDetails = {
                username: req.body.username,
                password: passwordHash,
                userRole: req.body.user_role,
                firstName: req.body.first_name,
                lastName: req.body.last_name,
                emailAddress: req.body.email_address,
                phoneNumber: req.body.phone_number,
                education: req.body.education,
                experience: req.body.experience
            };
            db.users.isUsernameUsed(trainerDetails.username)
                .then(isUsed => {
                    if (isUsed.exists) {
                        errorHandler.sendConflictError(res, 'Username is already used')
                    } else {
                        db.users.isEmailUsed(trainerDetails.emailAddress)
                            .then(isUsed => {
                                if (isUsed.exists) {
                                    errorHandler.sendConflictError(res, 'Email is already used')
                                } else {
                                    db.trainers.createTrainer(trainerDetails)
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

router.get('/:trainerId', (req, res) => {
    res.json(req.trainer)
});

router.put('/:trainerId',
    requireAuthorization,
    requireValidUserId,
    [
        check('first_name').exists().isString(),
        check('last_name').exists().isString(),
        check('email_address').optional({nullable: true}).isString(),
        check('phone_number').optional({nullable: true}).isString(),
        check('education').optional({nullable: true}).isString(),
        check('experience').optional({nullable: true}).isString(),
    ],
    (req, res) => {
        validateInputs(req, res, () => {
            let trainerDetails = {
                firstName: req.body.first_name,
                lastName: req.body.last_name,
                emailAddress: req.body.email_address,
                phoneNumber: req.body.phone_number,
                education: req.body.education,
                experience: req.body.experience
            };
            db.users.isEmailUsed(trainerDetails.emailAddress, req.params.trainerId)
                .then(isUsed => {
                    if (isUsed.exists) {
                        errorHandler.sendConflictError(res, 'Email is already used')
                    } else {
                        db.trainers.updateTrainer(req.params.trainerId, trainerDetails)
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

router.delete('/:trainerId',
    requireAuthorization,
    requireValidUserId,
    (req, res) => {
        db.trainers.deleteTrainer(req.params.trainerId)
            .then(() => {
                res.status(204).send()
            })
            .catch(e => {
                handleOtherError(res, e)
            })
    });

router.get('/:trainerId/services/', (req, res) => {
    db.trainers.services.getServices(req.trainer.id)
        .then(services => {
            res.json(services)
        })
        .catch(e => {
            handleOtherError(res, e)
        })
});

router.post('/:trainerId/services/',
    requireAuthorization,
    requireRoleTrainer,
    [
        check('title').exists().isString(),
        check('description').optional({nullable: true}).isString()
    ],
    (req, res) => {
        validateInputs(req, res, () => {
            let serviceDetails = {
                title: req.body.title,
                description: req.body.description,
                trainerId: req.trainer.id
            };
            db.trainers.services.createService(serviceDetails)
                .then(service => {
                    res.status(201).json(service)
                })
                .catch(e => {
                    handleOtherError(res, e)
                })
        })
    });

router.get('/:trainerId/services/:serviceId', (req, res) => {
    res.json(req.service)
});

router.put('/:trainerId/services/:serviceId',
    requireAuthorization,
    requireValidUserId,
    [
        check('title').exists().isString(),
        check('description').optional({nullable: true}).isString()
    ],
    (req, res) => {
        validateInputs(req, res, () => {
            let updatedService = {
                title: req.body.title,
                description: req.body.description
            };

            db.trainers.services.updateService(req.service.id, updatedService)
                .then(() => {
                    res.status(204).send()
                })
                .catch(e => {
                    handleOtherError(res, e)
                })
        })
    }
);

router.delete('/:trainerId/services/:serviceId',
    requireAuthorization,
    requireValidUserId,
    (req, res) => {
        db.trainers.services.deleteService(req.service.id)
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

function requireValidUserId(req, res, next) {
    if (req.user.id != req.params.trainerId) {
        errorHandler.sendForbiddenError(res)
    } else {
        next()
    }
}

export default router;