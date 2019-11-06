import { Router } from 'express';
import { check, validationResult } from 'express-validator';
import models from '../models';

const router = Router();

router.param('trainerId', (req, res, next) => {
    let trainer = models.trainers.find(it => it.user_details.id == req.params.trainerId)
    if (trainer) {
        req.trainer = trainer
        next()
    } else {
        res.sendStatus(404)
    }
})

router.param('clientId', (req, res, next) => {
    let client = models.clients.find(it =>
        it.user_details.id == req.params.clientId)
    if (client) {
        req.client = client
        next()
    } else {
        res.sendStatus(404)
    }
})
router.param('serviceId', (req, res, next) => {
    let service = models.trainerServices.find(it => it.trainer_id == req.params.trainerId && it.service_id == req.params.serviceId)
    if (service) {
        req.service = service
        next()
    } else {
        res.sendStatus(404)
    }
})
router.param('certificationId', (req, res, next) => {
    let certification = models.trainerServicesCertifications.find(it => it.certification_id == req.params.certificationId)
    if (certification) {
        req.certification = certification
        next()
    } else {
        res.sendStatus(404)
    }
})

router.get('/', (req, res) => {
    res.send(models.trainers);
});

router.post('/', [
    check('username').isString(),
    check('role').isIn(["client", "trainer"]),
    check('display_name').isString(),
    check('email').isEmail(),
    check('phone').optional(),
    check('education').optional(),
    check('experience').optional(),
    check('certified').isBoolean()
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
            education: req.body['education'],
            experience: req.body['experience'],
            certified: req.body['certified']
        })
    }
})

router.get('/:trainerId', (req, res) => {
    res.send(req.trainer)
});

router.put('/:trainerId', [
    check('username').isString(),
    check('role').isIn(["client", "trainer"]),
    check('display_name').isString(),
    check('email').isEmail(),
    check('phone').optional(),
    check('education').optional(),
    check('experience').optional(),
    check('certified').isBoolean()
], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        handleBadRequest(errors, res)
    } else {
        res.sendStatus(204)
    }
})

router.delete('/:trainerId', (req, res) => {
    res.sendStatus(204)
});

router.get('/:trainerId/assignments', (req, res) => {
    res.send(models.assignments.filter(it =>
        it.trainer.user_details.id == req.params.trainerId
    ))
});

router.post('/:trainerId/assignments', [
    check('client_id').isInt(),
    check('status').equals("waiting_for_approval")
], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        handleBadRequest(errors, res)
    } else {
        let client = models.clients.find(it =>
            it.user_details.id == req.body['client_id']
        )
        if (client) {
            res.send({
                trainer: trainer,
                client: client,
                status: req.body['status']
            })
        } else {
            res.sendStatus(404)
        }
    }
});

router.put('/:trainerId/assignments/:clientId', [
    check('status').isIn(["waiting_for_approval", "approved", "rejected"])
], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        handleBadRequest(errors, res)
    } else {
        let assignment = models.assignments.find(it =>
            it.client.user_details.id == req.params.clientId
            && it.trainer.user_details.id == req.params.trainerId
        )
        if (assignment) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }
});

router.delete('/:trainerId/assignments/:clientId', (req, res) => {
    let assignment = models.assignments.find(it =>
        it.client.user_details.id == req.params.clientId
        && it.trainer.user_details.id == req.params.trainerId
    )
    if (assignment) {
        res.sendStatus(204)
    } else {
        res.sendStatus(404)
    }
});

router.get('/:trainerId/clients', (req, res) => {
    res.send(
        models.assignments.filter(it =>
            it.trainer.user_details.id == req.params.trainerId
        ).map(it => it.client)
    )
});

router.get('/:trainerId/services', (req, res) => {
    res.send(models.trainerServices.filter(it => it.trainer_id == req.params.trainerId))
});

router.post('/:trainerId/services', [
    check('title').isAlphanumeric(),
    check('price').isNumeric()
], (req, res) => {
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        handleBadRequest(errors, res)
    } else {
        res.send({
            service_id: 101,
            trainer_id: req.params.trainerId,
            title: req.body['title'],
            description: req.body['description'],
            price: req.body['price']
        })
    }
});

router.get('/:trainerId/services/:serviceId', (req, res) => {
    res.send(req.service)
});

router.put('/:trainerId/services/:serviceId', [
    check('title').isAlphanumeric(),
    check('price').isNumeric()
], (req, res) => {
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        handleBadRequest(errors, res)
    } else {
        res.sendStatus(204)
    }
});

router.delete('/:trainerId/services/:serviceId', (req, res) => {
    res.sendStatus(204)
});

// TrainerServiceCertifications

router.get('/:trainerId/services/:serviceId/certifications', (req, res) => {
    res.send(models.trainerServicesCertifications.filter(it => it.service_id == req.params.serviceId))
});

router.post('/:trainerId/services:serviceId/certifications', [
    check('service_id').isNumeric(),
    check('issuing_institution').not().isEmpty(),
    check('issuing_timestamp').isNumeric(),
    check('expiration_timestamp').optional()
], (req, res) => {
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        handleBadRequest(errors, res)
    } else {
        res.send({
            certification_id: 200,
            service_id: req.params.serviceId,
            issuing_institution: req.body['tiissuing_institutiontle'],
            issuing_timestamp: req.body['issuing_timestamp'],
            expiration_timestamp: req.body['expiration_timestamp']
        })
    }
});

router.get('/:trainerId/services/:serviceId/certifications/:certificationId', (req, res) => {
    res.send(req.certification)
});

router.put('/:trainerId/services/:serviceId/certifications/:certificationId', [
    check('service_id').isNumeric(),
    check('issuing_institution').not().isEmpty(),
    check('issuing_timestamp').isNumeric(),
    check('expiration_timestamp').optional()
], (req, res) => {
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        handleBadRequest(errors, res)
    } else {
        res.sendStatus(204)
    }
});

router.delete('/:trainerId/services/:serviceId/certifications/:certificationId', (req, res) => {
    res.sendStatus(204)
});

function handleBadRequest(errors, res) {
    res.status(400).send({
        errors: errors.array()
    })
};

export default router;