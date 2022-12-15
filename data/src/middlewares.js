
//// Core modules

//// External modules
const flash = require('kisapmata')
const lodash = require('lodash')
const moment = require('moment')

//// Modules

module.exports = {
    requireAuthUser: async (req, res, next) => {
        try {
            let authUserId = lodash.get(req, 'session.authUserId');
            if (!authUserId) {
                return res.redirect('/login')
            }
            let user = await req.app.locals.db.models.User.findOne({ where: { username: authUserId } });
            if (!user) {
                return res.redirect('/logout') // Prevent redirect loop when user is null
            }
            if (!user.active) {
                return res.redirect('/logout')
            }
            res.user = user;
            next();
        } catch (err) {
            next(err)
        }
    },
    // Assign view variables once - on app start
    once: (req, res, next) => {
        try {
            req.app.locals.app = {}
            req.app.locals.app.title = CONFIG.app.title;
            req.app.locals.app.description = CONFIG.description;
            req.app.locals.CONFIG = lodash.cloneDeep(CONFIG) // Config
            next();
        } catch (error) {
            next(error);
        }
    },
    // Assign view variables per request
    perRequest: async (req, res, next) => {
        try {
            res.locals.user = null
            // Authenticated user
            let authUserId = lodash.get(req, 'session.authUserId');
            if (authUserId) {
                res.locals.user = await req.app.locals.db.models.User.findOne({ where: { username: authUserId } });
            }

            res.locals.acsrf = lodash.get(req, 'session.acsrf');

            res.locals.url = req.url
            res.locals.urlPath = req.path
            res.locals.query = req.query

            // Body class
            let bodyClass = 'page' + (req.baseUrl + req.path).replace(/\//g, '-');
            bodyClass = lodash.trim(bodyClass, '-');
            bodyClass = lodash.trimEnd(bodyClass, '.html');
            res.locals.bodyClass = bodyClass; // global body class css

            // Sane titles
            if (!res.locals.title && !req.xhr) {
                let title = lodash.trim(req.originalUrl.split('/').join(' '));
                title = lodash.trim(title.replace('-', ' '));
                let words = lodash.map(title.split(' '), (word) => {
                    return lodash.capitalize(word);
                })
                title = words.join(' - ')
                if (title) {
                    res.locals.title = `${title} | ${req.app.locals.app.title} `;
                }
            }

            next();
        } catch (error) {
            next(error);
        }
    },
    antiCsrfCheck: async (req, res, next) => {
        try {
            let acsrf = lodash.get(req, 'body.acsrf')

            if (lodash.get(req, 'session.acsrf') === acsrf) {
                return next();
            }
            res.status(400).send('Cross-site request forgery error')
        } catch (err) {
            next(err);
        }
    },
}