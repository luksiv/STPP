import db from '../database'

const getPlans = (programId) => {
    return db.any('select id, day_number, description, exercises, meals from day_plans where fk_program = $1 order by day_number asc;', [programId])
}

const getPlan = (planId) => {
    return db.oneOrNone('select id, day_number, description, exercises, meals from day_plans where id = $1', [planId])
}

const createPlan = (programId, plan) => {
    return db.one('insert into day_plans (day_number, description, exercises, meals, fk_program) VALUES ($1, $2, $3, $4, $5) returning id, day_number, description, exercises, meals;',
        [plan.dayNumber, plan.description, plan.exercises, plan.meals, programId])
}

const updatePlan = (planId, plan) => {
    return db.none('update day_plans set day_number = $1, description = $2, exercises = $3, meals = $4 where id = $5;', [plan.dayNumber, plan.description, plan.exercises, plan.meals, planId])
}

const deletePlan = (planId) => {
    return db.none('delete from day_plans where id = $1', [planId])
}

module.exports = {
    getPlans,
    getPlan,
    createPlan,
    updatePlan,
    deletePlan
}