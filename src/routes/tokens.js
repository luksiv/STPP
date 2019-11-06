import Router from 'express-promise-router';
import {check, validationResult} from 'express-validator';
import db from '../models';
import {errors as errorHandler} from '../handlers'
import crypto from "crypto";
import * as jwt from "jsonwebtoken";
import 'dotenv/config'

const router = Router();

router.post('/',
    [
        check('identifier').exists().isString(),
        check('password').exists().isString()
    ],
    (req, res) => {
        validateInputs(req, res, () => {
            let passwordHash = crypto.createHash('sha256').update(req.body.password).digest('base64');
            db.users.findUser(req.body.identifier, passwordHash)
                .then(user => {
                    if (user) {
                        let token = jwt.sign(user, process.env.JWTSECRET, {expiresIn: 86400});
                        res.json({
                            token: token
                        })
                    } else {
                        errorHandler.sendNotFoundError(res)
                    }
                })
                .catch(e => {
                    handleOtherError(res, e)
                })
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
    console.log(e)
    errorHandler.sendInternalError(res)
}

export default router;