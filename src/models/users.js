import db from '../database'

const findUser = (identifier, password) => {
    return db.oneOrNone('select users.id, username, email_address, ur.value as role ' +
        'from users ' +
        'inner join user_roles ur on users.user_role = ur.id ' +
        'where ( username = $1 or email_address = $2 or phone_number = $3 ) and password_hash = $4;',
        [identifier, identifier, identifier, password]
    )
};

const isUsernameUsed = (username) => {
    return db.one('select exists(select 1 from users where username = $1)', [username])
};

const isEmailUsed = (email, currentUserId) => {
    if(currentUserId) {
        return db.one('select exists(select 1 from users where email_address = $1 and id != $2)', [email, currentUserId])
    } else {
        return db.one('select exists(select 1 from users where email_address = $1)', [email])
    }
};

const isUserTrainer = (userId) => {
    return db.one('select exists(select 1 from users where user_role = 2 and id = $1);', [userId])
}

module.exports = {
    findUser,
    isUsernameUsed,
    isEmailUsed,
    isUserTrainer
};