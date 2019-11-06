import { Router } from 'express';
import { check, validationResult } from 'express-validator';
import models from '../models';

const router = Router();

router.param('clientId', (req, res, next) => {
    let client = models.clients.find(it => it.user_details.id == req.params.clientId)
    if (client) {
        req.client = client
        next()
    } else {
        res.sendStatus(404)
    }
})

router.get('/', (req, res) => {
    res.send(models.clients)
})

router.post('/', [
    check('username').isString(),
    check('role').isIn(["client", "trainer"]),
    check('display_name').isString(),
    check('email').isEmail(),
    check('phone').optional(),
    check('age').isInt(),
    check('gender').isString(),
    check('height').isInt(),
    check('weight').isNumeric(),
], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        handleBadRequest(errors, res)
    } else {
        res.send({
            "user_details": {
                id: 123,
                username: req.body['username'],
                role: req.body['role'],
                display_name: req.body['display_name'],
                email: req.body['email'],
                phone: req.body['phone']
            },
            age: req.body['age'],
            gender: req.body['gender'],
            height: req.body['height'],
            weight: req.body['weight']
        })
    }
})

router.get('/:clientId', (req, res) => {
    res.send(req.client)
});

router.put('/:clientId', [
    check('username').isString(),
    check('role').isIn(["client", "trainer"]),
    check('display_name').isString(),
    check('email').isEmail(),
    check('phone').optional(),
    check('age').isInt(),
    check('gender').isString(),
    check('height').isInt(),
    check('weight').isNumeric(),
], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        handleBadRequest(errors, res)
    } else {
        res.sendStatus(204)
    }
})

router.delete('/:clientId', (req, res) => {
    res.sendStatus(204)
});

router.get('/:clientId/trainers', (req, res) => {
    res.send(models.assignments.filter(it =>
        it.client.user_details.id == req.params.clientId
    ))
});

router.get('/:clientId/programs', (req, res) => {
    res.send(models.programs.filter(it =>
        it.client_id == req.params.clientId
    ))
});

function handleBadRequest(errors, res) {
    res.status(400).send({
        errors: errors.array()
    })
};

export default router;