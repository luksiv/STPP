import { Router } from 'express';
import { check, validationResult } from 'express-validator';
import models from '../models';

const router = Router();

router.param('programId', function (req, res, next) {
    let program = models.programs.find(it =>
        it.program_id == req.params.programId
    )
    if (program) {
        req.program = program
        next()
    } else {
        res.sendStatus(404)
    }
});

router.get('/', (req, res) => {
    let programs = models.programs
    let clientId = req.query.clientId
    let trainerId = req.query.trainerId
    if(clientId) {
        programs = programs.filter ( it => it.client_id == clientId )
    }
    if(trainerId) {
        programs = programs.filter ( it => it.trainer_id == trainerId )
    }
    res.send(programs)
});

router.post('/', [
    check('client_id').isNumeric(),
    check('trainer_id').isNumeric(),
    check('title').not().isEmpty(),
    check('description').optional(),
    check('plans').optional(),
    check('plans.*.day_number').isNumeric(),
    check('plans.*.meals.*.name').not().isEmpty(),
    check('plans.*.meals.*.description').optional(),
    check('plans.*.meals.*.meal_number').isNumeric(),
    check('plans.*.exercises.*.name').not().isEmpty(),
    check('plans.*.exercises.*.sets').not().isEmpty(),
    check('plans.*.exercises.*.reps').not().isEmpty(),
    check('plans.*.exercises.*.description').optional()
], (req, res) => {
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        handleBadRequest(errors, res)
    } else {
        res.send({
            program_id: 101,
            client_id: req.body['client_id'],
            trainer_id: req.body['trainer_id'],
            title: req.body['title'],
            description: req.body['description'],
            plans: req.body['plans']
        })
    }
});

router.get('/:programId', (req, res) => {
    res.send(req.program)
});

router.put('/:programId', [
    check('client_id').isNumeric(),
    check('trainer_id').isNumeric(),
    check('title').not().isEmpty(),
    check('description').optional(),
    check('plans').optional(),
    check('plans.*.day_number').isNumeric(),
    check('plans.*.meals.*.name').not().isEmpty(),
    check('plans.*.meals.*.description').optional(),
    check('plans.*.meals.*.meal_number').isNumeric(),
    check('plans.*.exercises.*.name').not().isEmpty(),
    check('plans.*.exercises.*.sets').not().isEmpty(),
    check('plans.*.exercises.*.reps').not().isEmpty(),
    check('plans.*.exercises.*.description').optional()
], (req, res) => {
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        handleBadRequest(errors, res)
    } else {
        res.sendStatus(204)
    }
});

router.delete('/:programId', (req, res) => {
    res.sendStatus(204)
});

function handleBadRequest(errors, res) {
    res.status(400).send({
        errors: errors.array()
    })
};

export default router;