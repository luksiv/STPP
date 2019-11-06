import {errors as errorHandler} from "../handlers";

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

module.exports = {
    requireAuthorization,
    requireRoleTrainer,
    requireValidUserId
}