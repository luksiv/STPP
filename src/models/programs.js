import db from '../database'
import plans from './plans'

const getPrograms = (assignmentId) => {
    return db.any('select id, title, description, creation_date, updated_date from programs where fk_assignment = $1', [assignmentId])
}

const getProgram = (programId) => {
    return db.oneOrNone('select id, title, description, creation_date, updated_date from programs where id = $1', [programId])
}

const createProgram = (assignmentId, program) => {
    return db.one('insert into programs (title, description, creation_date, updated_date, fk_assignment) VALUES ($1, $2, now(), now(), $3) returning id, title, description, creation_date, updated_date;',
        [program.title, program.description, assignmentId])
}

const updateProgram = (programId, program) => {
    return db.none('update programs set title = $1, description = $2, updated_date = now() where id = $3;', [program.title, program.description, programId])
}

const deleteProgram = (programId) => {
    return db.none('delete from programs where id = $1', [programId])
}

module.exports = {
    getPrograms,
    getProgram,
    createProgram,
    updateProgram,
    deleteProgram,
    plans
}