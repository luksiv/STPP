import 'dotenv/config'
import cors from 'cors'
import express from 'express';
import routes from './routes'
import logger from "morgan";
import jwt from "jwt-decode";
import mung from "express-mung";

const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Decode JWT
app.use((req, res, next) => {
    let token = req.headers['authorization'];
    try {
        let jwtPayload = jwt(token)
        let isValid = ~~(Date.now() / 1000) < jwtPayload.exp
        if (isValid) {
            req.user = jwtPayload
        }
    } catch (e) {
    }
    next()
})

app.use('/1/api/trainers', routes.trainers);
app.use('/1/api/token', routes.tokens);
app.use('/1/api/clients', routes.clients);
app.use('/1/api/assignments', routes.assignments);

// Handling 404
app.use(function (req, res) {
    res.status(404).json({
        error: 'route_not_found',
        message: 'Provided route does not exist'
    });
});

// Handling 500
app.use(function (error, req, res) {
    console.log(error)
    res.status(500).json({
        error: 'internal_server_error',
        message: 'Internal server error'
    });
});

app.listen(process.env.PORT, () =>
    console.log(`Sporti API listening is on port ${process.env.PORT}...`),
);