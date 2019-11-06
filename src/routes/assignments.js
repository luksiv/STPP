import Router from 'express-promise-router';
import {check, validationResult} from 'express-validator';
import db from '../models';
import {errors as errorHandler} from '../handlers'
import crypto from "crypto";

const router = Router();

router.param('assignmentId', (req, res, next) => {
    db.assignments.getAssignment(req.params.assignmentId)
        .then(assignment => {
            if (assignment) {
                req.assignment = assignment;
                next()
            } else {
                errorHandler.sendNotFoundError(res)
            }
        })
        .catch(e => {
            handleOtherError(res, e)
        })
});

router.param('programId', (req, res, next) => {
    db.assignments.programs.getProgram(req.params.programId)
        .then(program => {
            if (program) {
                req.program = program;
                next()
            } else {
                errorHandler.sendNotFoundError(res)
            }
        })
        .catch(e => {
            handleOtherError(res, e)
        })
});

router.param('planId', (req, res, next) => {
    db.assignments.programs.plans.getPlan(req.params.planId)
        .then(plan => {
            if (plan) {
                req.plan = plan;
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
// router.get('/statuses', (req, res) => {
//     db.assignments.getAssignmentStatuses()
//         .then(statuses => {
//             res.json(statuses)
//         })
//         .catch(e => {
//             handleOtherError(res, e)
//         })
// })

//region Assignments endpoints
router.get('/',
    requireAuthorization,
    (req, res) => {
        let assignmentsPromise;
        if (req.user.role == 'Trainer') {
            assignmentsPromise = db.assignments.getTrainerAssignments(req.user.id)
        } else {
            assignmentsPromise = db.assignments.getClientAssignments(req.user.id)
        }
        assignmentsPromise
            .then(assignments => {
                res.json(assignments)
            })
            .catch(e => {
                handleOtherError(res, e)
            });
    });

router.post('/',
    requireAuthorization,
    requireRoleClient,
    [
        check('trainer_id').exists().isString(),
    ],
    (req, res) => {
        validateInputs(req, res, () => {
            db.users.isUserTrainer(req.body.trainer_id)
                .then(isTrainer => {
                    if (isTrainer.exists) {
                        db.assignments.getClientTrainerAssignment(req.user.id, req.body.trainer_id)
                            .then(assignment => {
                                if (assignment) {
                                    errorHandler.sendConflictError(res, 'assignment already exists')
                                } else {
                                    db.assignments.createAssignment(req.user.id, req.body.trainer_id)
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
                    } else {
                        errorHandler.sendConflictError(res, 'trainer_id is not a trainer')
                    }
                })
                .catch(e => {
                    handleOtherError(res, e)
                })
        })
    });

router.get('/:assignmentId',
    requireAuthorization,
    requireAccessToAssignment,
    (req, res) => {
        res.json(req.assignment)
    });

router.put('/:assignmentId',
    requireAuthorization,
    requireAccessToAssignment,
    [
        check('status').exists().isIn([2, 3, 4, '2', '3', '4'])
    ],
    (req, res) => {
        validateInputs(req, res, () => {
            db.assignments.updateAssignment(req.assignment.id, req.body.status)
                .then(() => {
                    res.status(204).send()
                })
                .catch(e => {
                    handleOtherError(res, e)
                })
        })
    });

router.delete('/:assignmentId',
    requireAuthorization,
    requireAccessToAssignment,
    (req, res) => {
        db.assignments.deleteAssignment(req.assignment.id)
            .then(() => {
                res.status(204).send()
            })
            .catch(e => {
                handleOtherError(res, e)
            })
    });
//endregion

//region Programs endpoints
router.get('/:assignmentId/programs', requireAuthorization, requireAccessToAssignment, (req, res) => {
    db.assignments.programs.getPrograms(req.assignment.id)
        .then(programs => {
            res.json(programs)
        })
        .catch(e => {
            handleOtherError(res, e)
        })
});

router.post('/:assignmentId/programs',
    requireAuthorization,
    requireAccessToAssignment,
    requireRoleTrainer,
    [
        check('title').exists().isString(),
        check('description').optional({nullable: true}).isString()
    ],
    (req, res) => {
        validateInputs(req, res, () => {
            let programDetails = {
                title: req.body.title,
                description: req.body.description
            };
            db.assignments.programs.createProgram(req.assignment.id, programDetails)
                .then(program => {
                    res.status(201).json(program)
                })
                .catch(e => {
                    handleOtherError(res, e)
                })
        })
    });

router.get('/:assignmentId/programs/:programId', requireAuthorization, requireAccessToAssignment, (req, res) => {
    res.json(req.program)
});

router.put('/:assignmentId/programs/:programId',
    requireAuthorization,
    requireAccessToAssignment,
    requireRoleTrainer,
    [
        check('title').exists().isString(),
        check('description').optional({nullable: true}).isString()
    ],
    (req, res) => {
        validateInputs(req, res, () => {
            let programDetails = {
                title: req.body.title,
                description: req.body.description
            };
            db.assignments.programs.updateProgram(req.program.id, programDetails)
                .then(program => {
                    res.status(204).send()
                })
                .catch(e => {
                    handleOtherError(res, e)
                })
        })
    });

router.delete('/:assignmentId/programs/:programId', requireAuthorization, requireAccessToAssignment, requireRoleTrainer, (req, res) => {
    db.assignments.programs.deleteProgram(req.program.id)
        .then(() => {
            res.status(204).send()
        })
        .catch(e => {
            handleOtherError(res, e)
        })
});
//endregion

//region Plans endpoints
router.get('/:assignmentId/programs/:programId/plans', requireAuthorization, requireAccessToAssignment, (req, res) => {
    db.assignments.programs.plans.getPlans(req.program.id)
        .then(plans => {
            res.json(plans)
        })
        .catch(e => {
            handleOtherError(res, e)
        })
})
router.post('/:assignmentId/programs/:programId/plans',
    requireAuthorization,
    requireAccessToAssignment,
    requireRoleTrainer,
    [
        check('day_number').exists().isString(),
        check('description').exists().isString(),
        check('exercises').optional({nullable: true}).isString(),
        check('meals').optional({nullable: true}).isString(),

    ],
    (req, res) => {
        validateInputs(req, res, () => {
            let planDetails = {
                dayNumber: req.body.day_number,
                description: req.body.description,
                exercises: req.body.exercises,
                meals: req.body.meals,
            };
            db.assignments.programs.plans.createPlan(req.program.id, planDetails)
                .then(program => {
                    res.status(201).json(program)
                })
                .catch(e => {
                    handleOtherError(res, e)
                })
        })
    })

router.get('/:assignmentId/programs/:programId/plans/:planId', requireAuthorization, requireAccessToAssignment, (req, res) => {
    res.send(req.plan)
})

router.put('/:assignmentId/programs/:programId/plans/:planId',
    requireAuthorization,
    requireAccessToAssignment,
    requireRoleTrainer,
    [
        check('day_number').exists().isString(),
        check('description').exists().isString(),
        check('exercises').optional({nullable: true}).isString(),
        check('meals').optional({nullable: true}).isString(),
    ],
    (req, res) => {
        validateInputs(req, res, () => {
            let planDetails = {
                dayNumber: req.body.day_number,
                description: req.body.description,
                exercises: req.body.exercises,
                meals: req.body.meals,
            };
            db.assignments.programs.plans.updatePlan(req.plan.id, planDetails)
                .then(() => {
                    res.status(204).send()
                })
                .catch(e => {
                    handleOtherError(res, e)
                })
        })
    })

router.delete('/:assignmentId/programs/:programId/plans/:planId', requireAuthorization, requireAccessToAssignment, requireRoleTrainer, (req, res) => {
    db.assignments.programs.deleteProgram(req.program.id)
        .then(() => {
            res.status(204).send()
        })
        .catch(e => {
            handleOtherError(res, e)
        })
})

//endregion

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

function requireAccessToAssignment(req, res, next) {
    let assignmentPromise;
    if (req.user.role == 'Trainer') {
        assignmentPromise = db.assignments.isTrainerInvolvedInAssignment(req.params.assignmentId, req.user.id)
    } else {
        assignmentPromise = db.assignments.isClientInvolvedInAssignment(req.params.assignmentId, req.user.id)
    }
    assignmentPromise
        .then(isInvolved => {
            if (isInvolved.exists) {
                next()
            } else {
                errorHandler.sendForbiddenError(res)
            }
        })
        .catch(e => {
            handleOtherError(res, e)
        })
}

function requireRoleTrainer(req, res, next) {
    if (req.user.role != 'Trainer') {
        errorHandler.sendForbiddenError(res)
    } else {
        next()
    }
}

function requireRoleClient(req, res, next) {
    if (req.user.role != 'Client') {
        errorHandler.sendForbiddenError(res)
    } else {
        next()
    }
}

function requireValidClientId(req, res, next) {
    if (req.user.id != req.params.clientId) {
        errorHandler.sendForbiddenError(res)
    } else {
        next()
    }
}


export default router;