//// Core modules

//// External modules
const { Sequelize } = require('sequelize')
const moment = require('moment')

module.exports = {
    connect: async () => {
        try {

            const sequelize = new Sequelize(CONFIG.sequelize);

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
                Permission: require('./models/permission')('Permission', sequelize),
                Role: require('./models/role')('Role', sequelize),
                User: require('./models/user')('User', sequelize),
                Evaluatee: require('./models/evaluatee')('Evaluatee', sequelize),
                Form: require('./models/form')('Form', sequelize),
                Survey: require('./models/survey')('Survey', sequelize),
            }
        } catch (error) {
            console.log('Connection error:', error.message)
        }
    }
}