//// Core modules

//// External modules
const express = require('express')
const flash = require('kisapmata')

//// Modules
const middlewares = require('../../middlewares')

// Router
let router = express.Router()

router.use('/admin', middlewares.requireAuthUser)

router.get('/admin/colleges', middlewares.guardRoute(['read_all_college']), async (req, res, next) => {
    try {
        let rows = await req.app.locals.db.models.College.findAll({
            where: {}
        });

        // Get deans
        let users = await req.app.locals.db.models.User.findAll({
            where: {
                active: true
            }
        })
        let deans = users.filter(user => {
            return user.roles.filter(role => role === 'dean').length > 0
        })

        rows = rows.map(row => {
            row = row.get({ plain: true })
            row.dean = deans.find(dean => dean.id === row.userId)
            return row
        })
        let data = {
            flash: flash.get(req, 'college'),
            rows: rows
        }
        res.render('admin/college/all.html', data);
    } catch (err) {
        next(err);
    }
});

router.get('/admin/colleges/create', middlewares.guardRoute(['create_college']), async (req, res, next) => {
    try {

        // Get deans
        let users = await req.app.locals.db.models.User.findAll({
            where: {
                active: true
            }
        })
        let deans = users.filter(user => {
            return user.roles.filter(role => role === 'dean').length > 0
        })

        let data = {
            flash: flash.get(req, 'college'),
            deans: deans,
        }
        res.render('admin/college/create.html', data);
    } catch (err) {
        next(err);
    }
});

router.post('/admin/colleges', middlewares.guardRoute(['create_college']), middlewares.antiCsrfCheck, async (req, res, next) => {
    try {
        let data = req.body

        let college = await req.app.locals.db.models.College.create({
            name: data.name,
            code: data.code,
            userId: data.userId,
        });

        flash.ok(req, 'college', 'College created.')
        res.redirect(`/admin/colleges/` + college.id)
    } catch (err) {
        next(err);
    }
});

router.get('/admin/colleges/:collegeId', middlewares.guardRoute(['update_college']), async (req, res, next) => {
    try {
        let college = await req.app.locals.db.models.College.findOne({
            where: {
                id: req.params.collegeId
            }
        });
        if (!college) {
            throw new Error('College not found.')
        }

        // Get deans
        let users = await req.app.locals.db.models.User.findAll({
            where: {
                active: true
            }
        })
        let deans = users.filter(user => {
            return user.roles.filter(role => role === 'dean').length > 0
        })
        let data = {
            flash: flash.get(req, 'college'),
            college: college,
            deans: deans,
        }
        res.render(`admin/college/update.html`, data)
    } catch (err) {
        next(err);
    }
});

router.put('/admin/colleges/:collegeId', middlewares.guardRoute(['update_college']), middlewares.antiCsrfCheck, async (req, res, next) => {
    try {
        let college = await req.app.locals.db.models.College.findOne({
            where: {
                id: req.params.collegeId
            }
        });
        if (!college) {
            throw new Error('College not found.')
        }

        let data = req.body

        await req.app.locals.db.models.College.update({
            name: data.name,
            code: data.code,
            userId: data.userId,
        },
            {
                where: {
                    id: college.id
                }
            });

        flash.ok(req, 'college', 'College updated.')
        res.redirect(`/admin/colleges/` + college.id)
    } catch (err) {
        next(err);
    }
});

router.get('/admin/colleges/:collegeId/delete', middlewares.guardRoute(['delete_college']), async (req, res, next) => {
    try {
        let college = await req.app.locals.db.models.College.findOne({
            where: {
                id: req.params.collegeId
            }
        });
        if (!college) {
            throw new Error('College not found.')
        }

        let data = {
            college: college
        }
        res.render(`admin/college/delete.html`, data)
    } catch (err) {
        next(err);
    }
});

router.delete('/admin/colleges/:collegeId', middlewares.guardRoute(['delete_college']), middlewares.antiCsrfCheck, async (req, res, next) => {
    try {
        let college = await req.app.locals.db.models.College.findOne({
            where: {
                id: req.params.collegeId
            }
        });
        if (!college) {
            throw new Error('College not found.')
        }

        await college.destroy()

        flash.ok(req, 'college', 'College deleted.')
        res.redirect(`/admin/colleges`)
    } catch (err) {
        next(err);
    }
});

module.exports = router;