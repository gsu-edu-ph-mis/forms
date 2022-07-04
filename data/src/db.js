//// Core modules

//// External modules
const Sequelize = require('sequelize')

//// Code
let cred = CRED.sequelize.connections.main
let conf = CONFIG.sequelize.connections.main

const sequelize = new Sequelize(conf.database, cred.username, cred.password, conf)

module.exports = {
    connect: async () => {
        try {
            await sequelize.authenticate()

            console.log(`Database connected to "${conf.storage}"`)

            sequelize.define('Evaluatee', require('./models/evaluatee').attributes, require('./models/evaluatee').options)
            sequelize.define('Form', require('./models/form').attributes, require('./models/form').options)
            sequelize.define('Permission', require('./models/permission').attributes, require('./models/permission').options)
            sequelize.define('Role', require('./models/role').attributes, require('./models/role').options)
            sequelize.define('Survey', require('./models/survey').attributes, require('./models/survey').options)
            sequelize.define('User', require('./models/user').attributes, require('./models/user').options)

            await sequelize.sync()

            return {
                sequelize: sequelize,
                main: sequelize.models
            }
        } catch (error) {
            console.error('Connection error:', error);
        }
    },
}