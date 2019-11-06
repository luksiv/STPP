// 4xx

const sendBadRequestError = (res, errors) => {
    res.status(400).json({
        error: 'invalid_parameters',
        message: 'Some required parameter is missing or it\'s format is invalid',
        errors: errors
    })
};

const sendUnauthorizedError = (res) => {
    res.status(401).json({
        error: 'unauthorized',
        message: 'You have not provided any credentials or they are invalid'
    })
};

const sendForbiddenError = (res) => {
    res.status(403).json({
        error: 'forbidden',
        message: 'Access Denied'
    })
};

const sendNotFoundError = (res) => {
    res.status(404).json({
        error: 'not_found',
        message: 'Resource was not found'
    })
}

const sendConflictError = (res, message) => {
    res.status(409).json({
        error: 'conflict',
        message: message
    })
}

// 5xx

function sendInternalError(res) {
    res.status(500).json({
        error: 'internal_server_error',
        message: 'Internal server error'
    });
};

module.exports = {
    sendBadRequestError,
    sendUnauthorizedError,
    sendForbiddenError,
    sendNotFoundError,
    sendConflictError,
    sendInternalError
}