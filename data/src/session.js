//// Core modules

//// External modules
const session = require('express-session') // Session engine
const Sequelize = require("sequelize")
const SequelizeStore = require("connect-session-sequelize")(session.Store)

// create database, ensure 'sqlite3' in your package.json
const sequelize = new Sequelize(
  CONFIG.sequelize.connections.session.database, 
  CRED.sequelize.connections.session.username, 
  CRED.sequelize.connections.session.password, 
  CONFIG.sequelize.connections.session
)

const sessionStorage = new SequelizeStore({
  db: sequelize,
})

sessionStorage.sync()

// Use the session middleware
// See options in https://github.com/expressjs/session
module.exports = session({
    name: CONFIG.session.name,
    store: sessionStorage,
    secret: CRED.session.secret,
    cookie: CONFIG.session.cookie,
    resave: false,
    saveUninitialized: false
})