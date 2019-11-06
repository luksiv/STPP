import 'dotenv/config'

const promise = require('bluebird'); // or any other Promise/A+ compatible library;
const initOptions = {
    promiseLib: promise // overriding the default (ES6 Promise);
};
const pgp = require('pg-promise')(initOptions);

const cn = {
    host: process.env.PGHOST, // 'localhost' is the default;
    port: process.env.PGPORT, // 5432 is the default;
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD
};

const db = pgp(cn); // database instance;

export default db;