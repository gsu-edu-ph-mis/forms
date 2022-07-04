//// Core modules

//// External modules
const session = require('express-session') // Session engine
const SQLiteStore = require('connect-sqlite3')(session); // Save session to sqlite db

const sessionStorage = new SQLiteStore(CONFIG.session.store)

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