//// Core modules

//// External modules
const { Sequelize } = require('sequelize')
const moment = require('moment')

module.exports = {
    connect: async () => {
        try {

            const sequelize = new Sequelize(CONFIG.sqlite);

            await sequelize.authenticate()
            console.log(`${moment().format('YYYY-MMM-DD hh:mm:ss A')}: Database connected.`);

            return sequelize
        } catch (error) {
            console.log('Connection error:', error.message)
        }
    },
    attachModels: async (sequelize) => {
        try {
            return {
                College: require('./models/college')('College', sequelize),
                Evaluatee: require('./models/evaluatee')('Evaluatee', sequelize),
                Form: require('./models/form')('Form', sequelize),
                Permission: require('./models/permission')('Permission', sequelize),
                Program: require('./models/program')('Program', sequelize),
                Role: require('./models/role')('Role', sequelize),
                Survey: require('./models/survey')('Survey', sequelize),
                User: require('./models/user')('User', sequelize),

            }
        } catch (error) {
            console.log('Connection error:', error.message)
        }
    }
}