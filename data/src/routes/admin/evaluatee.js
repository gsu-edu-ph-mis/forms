//// Core modules
const fs = require('fs')

//// External modules
const express = require('express')
const flash = require('kisapmata')
const fileUpload = require('express-fileupload')
const { Op } = require('sequelize')

//// Modules
const middlewares = require('../../middlewares')

// Router
let router = express.Router()

router.use('/admin', middlewares.requireAuthUser) //@TODO: Require admin role 

router.get('/admin/evaluatees', middlewares.guardRoute(['create_evaluatee']), async (req, res, next) => {
    try {

        let whereClause = {}


        let rows = await req.app.locals.db.models.Evaluatee.findAll({
            where: whereClause,
            order: [['lastName', 'ASC']],
        });

        if (res.user.roles.includes('dean')) {
            let college = await req.app.locals.db.models.College.findOne({
                where: {
                    userId: res.user.id
                },
            });
            rows = rows.filter(row => {
                return row.collegeTags.map(c => parseInt(c)).includes(college?.id)
            })

        }

        let promises = rows.map((r, i) => {
            return req.app.locals.db.models.College.findAll({
                where: {
                    id: {
                        [Op.in]: r.collegeTags ?? []
                    }
                },
            });
        })
        let results = await Promise.all(promises)
        rows = rows.map((r, i) => {
            r = r.toJSON()
            r.colleges = results.at(i).map(c => c.code)
            return r
        })

        let data = {
            flash: flash.get(req, 'evaluatee'),
            rows: rows
        }
        // return res.send(data)
        res.render('admin/evaluatee/all.html', data);
    } catch (err) {
        next(err);
    }
});

router.get('/admin/evaluatees/create', middlewares.guardRoute(['create_evaluatee']), async (req, res, next) => {
    try {

        let colleges = req.app.locals.colleges
        if (res.user.roles.includes('dean')) {
            colleges = colleges.filter(college => {
                return college.userId === res.user.id
            })
        }

        let data = {
            flash: flash.get(req, 'evaluatee'),
            colleges: colleges
        }
        res.render('admin/evaluatee/create.html', data);
    } catch (err) {
        next(err);
    }
});

router.post('/admin/evaluatees', middlewares.guardRoute(['create_evaluatee']), middlewares.antiCsrfCheck, middlewares.dataUrlToReqFiles(['photo']), middlewares.handleUpload({ allowedMimes: ["image/jpeg", "image/png"] }), async (req, res, next) => {
    try {
        let data = req.body
        if (!data.firstName) {
            throw new Error('First Name is required.')
        }

        if (!data.lastName) {
            throw new Error('Last Name is required.')
        }

        if ((data?.collegeTags?.length ?? 0) <= 0) {
            throw new Error('College Tagging is required.')
        }

        if (req.imageVariants.length) {
            data.photo = `data:image/jpeg;base64, ${req.imageVariants.at(0).buffer.toString('base64')}`
        }

        // TODO: college tags check for deans

        let evaluatee = await req.app.locals.db.models.Evaluatee.create({
            prefix: data.prefix,
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName,
            suffix: data.suffix,
            position: data.position,
            gender: data.gender,
            birthDate: data.birthDate,
            photo: data.photo,
            collegeTags: data.collegeTags,
        });

        flash.ok(req, 'evaluatee', `Evaluatee "${data.lastName}, ${data.firstName}" created.`)
        res.redirect(`/admin/evaluatees/` + evaluatee.id)
    } catch (err) {
        next(err);
    }
});

router.get('/admin/evaluatees/:evaluateeId', middlewares.guardRoute(['update_evaluatee']), middlewares.getEvaluatee(), async (req, res, next) => {
    try {
        let evaluatee = res.evaluatee

        let colleges = req.app.locals.colleges
        if (res.user.roles.includes('dean')) {
            colleges = colleges.filter(college => {
                return college.userId === res.user.id
            })
        }

        let data = {
            flash: flash.get(req, 'evaluatee'),
            evaluatee: evaluatee,
            colleges: colleges,
        }
        // return res.send(data)
        res.render(`admin/evaluatee/update.html`, data)
    } catch (err) {
        next(err);
    }
});

router.put('/admin/evaluatees/:evaluateeId', middlewares.guardRoute(['update_evaluatee']), middlewares.antiCsrfCheck, middlewares.getEvaluatee(), middlewares.dataUrlToReqFiles(['photo']), middlewares.handleUpload({ allowedMimes: ["image/jpeg", "image/png"] }), async (req, res, next) => {
    try {
        let evaluatee = res.evaluatee

        let data = req.body
        if (!data.firstName) {
            throw new Error('First Name is required.')
        }

        if (!data.lastName) {
            throw new Error('Last Name is required.')
        }

        if ((data?.collegeTags?.length ?? 0) <= 0) {
            throw new Error('College Tagging is required.')
        }

        if (req.imageVariants.length) {
            data.photo = `data:image/jpeg;base64, ${req.imageVariants.at(0).buffer.toString('base64')}`
        }

        await req.app.locals.db.models.Evaluatee.update({
            prefix: data.prefix,
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName,
            suffix: data.suffix,
            position: data.position,
            gender: data.gender,
            birthDate: data.birthDate,
            photo: data.photo,
            collegeId: data.collegeId,
            collegeTags: data.collegeTags,
        },
            {
                where: {
                    id: evaluatee.id
                }
            });

        flash.ok(req, 'evaluatee', `"${data.firstName} ${data.lastName}" updated.`)
        res.redirect(`/admin/evaluatees`)
    } catch (err) {
        next(err);
    }
});

router.get('/admin/evaluatees/:evaluateeId/delete', middlewares.guardRoute(['delete_evaluatee']), async (req, res, next) => {
    try {
        let evaluatee = await req.app.locals.db.models.Evaluatee.findOne({
            where: {
                id: req.params.evaluateeId
            }
        });
        if (!evaluatee) {
            throw new Error('Evaluatee not found.')
        }

        let data = {
            evaluatee: evaluatee
        }
        res.render(`admin/evaluatee/delete.html`, data)
    } catch (err) {
        next(err);
    }
});

router.delete('/admin/evaluatees/:evaluateeId', middlewares.guardRoute(['delete_evaluatee']), middlewares.antiCsrfCheck, async (req, res, next) => {
    try {
        let evaluatee = await req.app.locals.db.models.Evaluatee.findOne({
            where: {
                id: req.params.evaluateeId
            }
        });
        if (!evaluatee) {
            throw new Error('Evaluatee not found.')
        }

        await evaluatee.destroy()

        flash.ok(req, 'evaluatee', `Evaluatee "#${req.params.evaluateeId}" deleted.`)
        res.redirect(`/admin/evaluatees`)
    } catch (err) {
        next(err);
    }
});

module.exports = router;