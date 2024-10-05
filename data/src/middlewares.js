
//// Core modules

//// External modules
const access = require('acrb')
const lodash = require('lodash')
const moment = require('moment')

//// Modules
const uploader = require('./uploader')

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
    once: async (req, res, next) => {
        try {
            req.app.locals.app = {}
            req.app.locals.app.title = CONFIG.app.title;
            req.app.locals.app.description = CONFIG.description;
            req.app.locals.CONFIG = lodash.cloneDeep(CONFIG) // Config
            req.app.locals.colleges = await req.app.locals.db.models.College.findAll()
            req.app.locals.programs = await req.app.locals.db.models.Program.findAll({
                order: [
                    ['name', 'asc']
                ]
            })
            req.app.locals.academicYears = Array.from({ length: 10 }, (_, i) => i).map((o) => {
                let start = moment().year() + 2
                return `${start - 10 + o}-${start - 10 + o + 1}`
            }).reverse()

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
    guardRoute: (permissions, condition = 'and') => {
        return async (req, res, next) => {
            try {
                let user = res.user
                let rolesList = await req.app.locals.db.models.Role.findAll()
                if (condition === 'or') {
                    if (!access.or(user, permissions, rolesList)) {
                        return res.render('error.html', {
                            error: `Access denied. Must have one of these permissions: ${permissions.join(', ')}.`
                        })
                    }
                } else {
                    if (!access.and(user, permissions, rolesList)) {
                        return res.render('error.html', {
                            error: `Access denied. Required all these permissions: ${permissions.join(', ')}.`
                        })
                    }
                }
                next()
            } catch (err) {
                next(err)
            }
        }
    },
    getForm: (options = { raw: false }) => {
        return async (req, res, next) => {
            try {

                let form = await req.app.locals.db.models.Form.findOne({
                    where: {
                        id: req.params?.formId
                    },
                    ...options
                })
                if (!form) throw new Error('Form not found.')

                res.form = form

                next()
            } catch (err) {
                next(err)
            }
        }
    },
    getEvaluatee: (options = { raw: false }) => {
        return async (req, res, next) => {
            try {

                let evaluatee = await req.app.locals.db.models.Evaluatee.findOne({
                    where: {
                        id: req.params?.evaluateeId
                    },
                    ...options
                });
                if (!evaluatee) {
                    throw new Error('Evaluatee not found.')
                }

                res.evaluatee = evaluatee

                next()
            } catch (err) {
                next(err)
            }
        }
    },
    handleUpload: (o) => {
        return async (req, res, next) => {
            try {
                let files = lodash.get(req, 'files', [])
                let localFiles = await uploader.handleExpressUploadLocalAsync(files, CONFIG.app.dirs.upload, o.allowedMimes)
                let imageVariants = await uploader.resizeImagesAsync(localFiles, null, CONFIG.app.dirs.upload); // Resize uploaded images

                // let uploadList = uploader.generateUploadList(imageVariants, localFiles)
                let saveList = uploader.generateSaveList(imageVariants, localFiles)
                // await uploader.uploadToS3Async(uploadList)
                await uploader.deleteUploadsAsync(localFiles, [])
                req.localFiles = localFiles
                req.imageVariants = imageVariants
                req.saveList = saveList
                next()
            } catch (err) {
                next(err)
            }
        }
    },
    /**
     * 
     * @param {Array} names Array of field names found in req.body.<name>
     * @returns {object} Populate req.files.<name>
     */
    dataUrlToReqFiles: (names = []) => {
        return async (req, res, next) => {
            try {
                /**
                 * @TODO: Remove double fields "photo" when empty. Becomes array ['', ''] when no photo selected.
                 * Temporary hack
                 * */
                names.forEach((fieldName) => {
                    let fieldValue = lodash.get(req, `body.${fieldName}`)
                    if(Array.isArray(fieldValue)){
                        fieldValue = ''
                    }
                    if (fieldValue) {
                        lodash.set(req, `files.${fieldName}`, [
                            uploader.toReqFile(fieldValue)
                        ])
                    }
                })
    
                next()
            } catch (err) {
                next(err)
            }
        }
    }
}