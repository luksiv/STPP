import db from '../database'

const getServices = (trainerId) => {
    return db.any('select id, title, description from services where fk_trainer = $1 order by id asc', [trainerId])
}

const getService = (serviceId) => {
    return db.oneOrNone('select id, title, description from services where id = $1', [serviceId])
}

const createService = (service) => {
    return db.one('insert into services (title, description, fk_trainer) VALUES ($1, $2, $3) returning id, title, description', [service.title, service.description, service.trainerId])
}

const updateService = (serviceId, service) => {
    return db.none('update services set title = $1, description = $2 where id = $3;', [service.title, service.description, serviceId])
}

const deleteService = (serviceId) => {
    return db.none('delete from services where id = $1', [serviceId])
}

module.exports = {
    getServices,
    createService,
    getService,
    updateService,
    deleteService
}