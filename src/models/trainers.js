import db from '../database'
import services from './services'

const getTrainers = () => {
    return db.any('select u.id, u.first_name, u.last_name, u.phone_number, u.email_address, t.education, t.experience from trainers t inner join users u on t.fk_user = u.id where active order by id asc;')
};

const getTrainer = (trainerId) => {
    return db.oneOrNone('select u.id, u.first_name, u.last_name, u.phone_number, u.email_address, t.education, t.experience from trainers t inner join users u on t.fk_user = u.id where u.id = $1 and active;', [trainerId])
};

const createTrainer = (trainer) => {
    return db.task(t => {
        return t.one(
            'with rows as ( insert into users (username, password_hash, user_role, first_name, last_name, email_address,phone_number) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7) returning id)\n' +
            'insert into trainers (fk_user, education, experience) values ((select rows.id from rows), $8, $9) returning fk_user as id',
            [trainer.username, trainer.password, trainer.userRole, trainer.firstName, trainer.lastName, trainer.emailAddress, trainer.phoneNumber, trainer.experience, trainer.education]
        ).then(user => {
            return getTrainer(user.id)
        })
    })
};

const updateTrainer = (trainerId, trainer) => {
    return db.tx(t => {
        return t.batch([
            t.none('update users set first_name = $1, last_name = $2, email_address = $3, phone_number = $4 where id = $5;', [trainer.firstName, trainer.lastName, trainer.emailAddress, trainer.phoneNumber, trainerId]),
            t.none('update trainers set education = $1, experience = $2 where fk_user = $3;', [trainer.education, trainer.experience, trainerId])
        ]);
    })
};

const deleteTrainer = (trainerId) => {
    return db.none('update users set active = false where id = $1', [trainerId])
};

module.exports = {
    getTrainers,
    createTrainer,
    getTrainer,
    updateTrainer,
    deleteTrainer,
    services
};