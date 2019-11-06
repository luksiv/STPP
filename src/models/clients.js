import db from '../database'

const getClients = () => {
    return db.any('select u.id, u.first_name, u.last_name, u.phone_number, u.email_address, c.age, cg.value as gender, c.height, c.weight from clients c inner join users u on c.fk_user = u.id inner join client_genders cg on c.gender = cg.id where active order by id asc;')
};

const getClient = (clientId) => {
    return db.oneOrNone('select u.id, u.first_name, u.last_name, u.phone_number, u.email_address, c.age, cg.value as gender, c.height, c.weight from clients c inner join users u on c.fk_user = u.id inner join client_genders cg on c.gender = cg.id where u.id = $1 and active;', [clientId])
};

const createClient = (client) => {
    return db.task(t => {
        return t.one(
            'with rows as ( insert into users (username, password_hash, user_role, first_name, last_name, email_address,phone_number) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7) returning id)\n' +
            'insert into clients (fk_user, age, gender, weight, height) values ((select rows.id from rows), $8, $9, $10, $11) returning fk_user as id',
            [client.username, client.password, client.userRole, client.firstName, client.lastName, client.emailAddress, client.phoneNumber, client.age, client.gender, client.weight, client.height]
        ).then(user => {
            return getClient(user.id)
        })
    })
};

const updateClient = (clientId, client) => {
    return db.tx(t => {
        return t.batch([
            t.none('update users set first_name = $1, last_name = $2, email_address = $3, phone_number = $4 where id = $5;', [client.firstName, client.lastName, client.emailAddress, client.phoneNumber, clientId]),
            t.none('update clients set age = $1, gender = $2, height = $3, weight = $4 where fk_user = $5', [client.age, client.gender, client.height, client.weight, clientId])
        ]);
    })
};

const deleteClient = (clientId) => {
    return db.none('update users set active = false where id = $1', [clientId])
};

const getGenders = () => {
    return db.any('select id, value from client_genders;')
}

module.exports = {
    getClients,
    getClient,
    createClient,
    updateClient,
    deleteClient,
    getGenders
};