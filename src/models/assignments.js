import db from '../database'
import programs from './programs'

const getTrainerAssignments = (trainerId) => {
    return db.any('select a.id, a.fk_client as client_id, a.fk_trainer as trainer_id, "as".value as status from assignments as a inner join assignment_statuses "as" on a.status = "as".id where a.fk_trainer = $1 order by id asc', [trainerId])
}

const getClientAssignments = (clientId) => {
    return db.any('select a.id, a.fk_client as client_id, a.fk_trainer as trainer_id, "as".value as status from assignments as a inner join assignment_statuses "as" on a.status = "as".id where a.fk_client = $1 order by id asc', [clientId])
}

const getAssignment = (assignmentId) => {
    return db.oneOrNone('select a.id, a.fk_client as client_id, a.fk_trainer as trainer_id, "as".value as status from assignments as a inner join assignment_statuses "as" on a.status = "as".id where a.id = $1', [assignmentId])
}

const getClientTrainerAssignment = (clientId, trainerId) => {
    return db.oneOrNone('select a.id, a.fk_client as client_id, a.fk_trainer as trainer_id, "as".value as status from assignments as a inner join assignment_statuses "as" on a.status = "as".id where a.fk_client = $1 and a.fk_trainer = $2', [clientId, trainerId])
}

const createAssignment = (clientId, trainerId) => {
    return db.task(t => {
        return db.one('insert into assignments (status, fk_client, fk_trainer) VALUES (1, $1, $2) returning id;', [clientId, trainerId])
            .then(assignment => {
                return getAssignment(assignment.id)
            })
    })
}

const updateAssignment = (assignmentId, status) => {
    return db.none('update assignments set status = $1 where id = $2', [status, assignmentId])
}

const deleteAssignment = (assignmentId) => {
    return db.none('delete from assignments where id = $1', [assignmentId])
}

const getAssignmentStatuses = () => {
    return db.any('select * from assignment_statuses;')
}

const isTrainerInvolvedInAssignment = (assignmentId, trainerId) => {
    return db.one('select exists(select * from assignments where id = $1 and fk_trainer = $2);', [assignmentId, trainerId])
}

const isClientInvolvedInAssignment = (assignmentId, clientId) => {
    return db.one('select exists(select * from assignments where id = $1 and fk_client = $2);', [assignmentId, clientId])
}

module.exports = {
    getTrainerAssignments,
    getClientAssignments,
    getAssignment,
    getClientTrainerAssignment,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getAssignmentStatuses,
    isClientInvolvedInAssignment,
    isTrainerInvolvedInAssignment,
    programs
}