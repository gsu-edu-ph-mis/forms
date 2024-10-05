//// Core modules

//// External modules
const express = require('express')
const flash = require('kisapmata')
const moment = require('moment')
const { Op, QueryTypes } = require('sequelize')

//// Modules
const middlewares = require('../../middlewares')
const passwordMan = require('../../password-man')

// Router
let router = express.Router()

router.use('/admin', middlewares.requireAuthUser)

router.get('/admin/forms', middlewares.guardRoute(['create_form']), async (req, res, next) => {
    try {
        let rows = await req.app.locals.db.models.Form.findAll({
            where: {},
            raw: true
        });

        if (res.user.roles.includes('dean')) {
            let college = await req.app.locals.db.models.College.findOne({
                where: {
                    userId: res.user.id
                },
            });
            rows = rows.filter(row => {
                return row.collegeId === college?.id
            })

        }


        let promises = rows.map(r => {
            return req.app.locals.db.models.User.findByPk(r.createdBy);
        })
        let results = await Promise.all(promises)
        rows = rows.map((r, i) => {
            r.creator = results[i]
            return r
        })

        let data = {
            flash: flash.get(req, 'form'),
            rows: rows
        }
        res.render('admin/form/all.html', data);
    } catch (err) {
        next(err);
    }
});

router.get('/admin/forms/create', middlewares.guardRoute(['create_form']), async (req, res, next) => {
    try {

        let colleges = req.app.locals.colleges
        if (res.user.roles.includes('dean')) {
            colleges = colleges.filter(college => {
                return college.userId === res.user.id
            })
        }


        let academicYears = Array.from({ length: 10 }, (_, i) => i)
        academicYears = academicYears.map((o) => {
            let start = moment().year() + 2
            return `${start - 10 + o}-${start - 10 + o + 1}`
        })
        academicYears.reverse()

        let data = {
            flash: flash.get(req, 'form'),
            now: moment(),
            academicYears: academicYears,
            semesters: CONFIG.semesters,
            colleges: colleges,
        }
        res.render('admin/form/create.html', data);
    } catch (err) {
        next(err);
    }
});

router.post('/admin/forms', middlewares.guardRoute(['create_form']), middlewares.antiCsrfCheck, async (req, res, next) => {
    try {
        let data = req.body

        let form = await req.app.locals.db.models.Form.create({
            name: data.name,
            description: data.description,
            academicYear: data.academicYear,
            semester: data.semester,
            ratingPeriodStart: data.ratingPeriodStart,
            ratingPeriodEnd: data.ratingPeriodEnd,
            collegeId: data.collegeId,
            active: true,
            uniqueKey: passwordMan.randomString(64),
            createdBy: res.user.id,
            evaluateeIds: []
        });

        flash.ok(req, 'form', 'Form created.')
        res.redirect(`/admin/forms/` + form.id)
    } catch (err) {
        next(err);
    }
});

router.get('/admin/forms/:formId', middlewares.guardRoute(['update_form']), middlewares.getForm(), async (req, res, next) => {
    try {
        let form = res.form

        let academicYears = Array.from({ length: 10 }, (_, i) => i)
        academicYears = academicYears.map((o) => {
            let start = moment().year() + 2
            return `${start - 10 + o}-${start - 10 + o + 1}`
        })
        academicYears.reverse()

        let colleges = req.app.locals.colleges
        if (res.user.roles.includes('dean')) {
            colleges = colleges.filter(college => {
                return college.userId === res.user.id
            })
        }

        let data = {
            flash: flash.get(req, 'form'),
            form: form,
            academicYears: academicYears,
            semesters: CONFIG.semesters,
            colleges: colleges,
        }
        res.render(`admin/form/update.html`, data)
    } catch (err) {
        next(err);
    }
});

router.put('/admin/forms/:formId', middlewares.guardRoute(['update_form']), middlewares.antiCsrfCheck, middlewares.getForm(), async (req, res, next) => {
    try {
        let form = res.form

        let data = req.body

        await req.app.locals.db.models.Form.update({
            name: data.name,
            description: data.description,
            academicYear: data.academicYear,
            semester: data.semester,
            ratingPeriodStart: data.ratingPeriodStart,
            ratingPeriodEnd: data.ratingPeriodEnd,
            collegeId: data.collegeId,
            uniqueKey: data.uniqueKey,
            createdBy: data.createdBy,

        },
            {
                where: {
                    id: form.id
                }
            });

        flash.ok(req, 'form', 'Form updated.')
        res.redirect(`/admin/forms/` + form.id)
    } catch (err) {
        next(err);
    }
});

router.patch('/admin/forms/:formId', middlewares.guardRoute(['update_form']), middlewares.antiCsrfCheck, middlewares.getForm(), async (req, res, next) => {
    try {
        let form = res.form

        let data = req.body
        // console.log(data)
        await req.app.locals.db.models.Form.update({
            ...data
        },
            {
                where: {
                    id: form.id
                }
            });

        if (req.xhr) {
            return res.send('Form updated.')
        }
        flash.ok(req, 'form', 'Form updated.')
        res.redirect(`/admin/forms/` + form.id)
    } catch (err) {
        next(err);
    }
});

// Evaluatees
router.get('/admin/forms/:formId/evaluatees', middlewares.guardRoute(['update_form']), middlewares.getForm(), async (req, res, next) => {
    try {
        let form = res.form

        let evaluatees = await req.app.locals.db.models.Evaluatee.findAll({
            where: {},
        });

        if (res.user.roles.includes('dean')) {
            let college = await req.app.locals.db.models.College.findOne({
                where: {
                    userId: res.user.id
                },
            });
            evaluatees = evaluatees.filter(row => {
                return row.collegeTags.map(c => parseInt(c)).includes(college.id)
            })
        }

        evaluatees = evaluatees.map(ev => {
            ev = ev.get({plain: true})
            ev.colleges = req.app.locals.colleges.filter(college => {
                return ev.collegeTags?.map(t => parseInt(t)).includes(parseInt(college.id))
            }).map(c => c.code)

            return ev
        })



        let data = {
            flash: flash.get(req, 'form'),
            form: form,
            semesters: CONFIG.semesters,
            evaluatees: evaluatees,
        }
        res.render(`admin/form/evaluatees.html`, data)
    } catch (err) {
        next(err);
    }
});
router.patch('/admin/forms/:formId/evaluatees', middlewares.guardRoute(['update_form']), middlewares.antiCsrfCheck, middlewares.getForm(), async (req, res, next) => {
    try {
        let form = res.form

        let data = req.body

        // return res.send(data)
        await req.app.locals.db.models.Form.update({
            evaluateeIds: data.evaluateeIds ?? [],
        },
            {
                where: {
                    id: form.id
                }
            });

        flash.ok(req, 'form', 'Form updated.')
        res.redirect(`/admin/forms/${form.id}/evaluatees`)
    } catch (err) {
        next(err);
    }
});
router.get('/admin/forms/:formId/evaluatees/:evaluateeId/responses', middlewares.guardRoute(['read_form']), middlewares.getForm(), middlewares.getEvaluatee(), async (req, res, next) => {
    try {
        let form = res.form
        let evaluatee = res.evaluatee
        let surveys = await req.app.locals.db.instance.query(`SELECT 
            survey.*, 
            evaluatee.id AS evaluatee_id,  
            evaluatee.firstName AS evaluatee_firstName,  
            evaluatee.middleName AS evaluatee_middleName,  
            evaluatee.lastName AS evaluatee_lastName

            FROM Survey LEFT JOIN Evaluatee ON survey.evaluatee = evaluatee.id 
            WHERE survey.formId = ${form.id} AND survey.evaluatee = ${evaluatee.id} 
            ORDER BY evaluatee.lastName;`, {
            type: QueryTypes.SELECT,
        })
        // return res.send(surveys)

        surveys = surveys.map((s, i) => {
            s.evaluatee = {
                id: s.evaluatee_id,
                firstName: s.evaluatee_firstName,
                middleName: s.evaluatee_middleName,
                lastName: s.evaluatee_lastName,
            }
            s.a = s.a1 + s.a2 + s.a3 + s.a4 + s.a5
            s.b = s.b1 + s.b2 + s.b3 + s.b4 + s.b5
            s.c = s.c1 + s.c2 + s.c3 + s.c4 + s.c5
            s.d = s.d1 + s.d2 + s.d3 + s.d4 + s.d5

            s.score = s.a + s.b + s.c + s.d
            return s
        })

        let studentEvaluations = surveys.filter(s => s.evaluatorType === 'student')
        let studentEvaluationsTotalA = studentEvaluations.map(s => s.a).reduce((accum, current) => accum + current, 0)
        let studentEvaluationsTotalB = studentEvaluations.map(s => s.b).reduce((accum, current) => accum + current, 0)
        let studentEvaluationsTotalC = studentEvaluations.map(s => s.c).reduce((accum, current) => accum + current, 0)
        let studentEvaluationsTotalD = studentEvaluations.map(s => s.d).reduce((accum, current) => accum + current, 0)
        let studentEvaluationsTotalScore = studentEvaluations.map(s => s.score).reduce((accum, current) => accum + current, 0)
        let studentEvaluationsPercentage = Math.round(studentEvaluationsTotalScore / studentEvaluations.length)

        let supervisorEvaluations = surveys.filter(s => s.evaluatorType === 'supervisor')
        let supervisorEvaluationsTotalA = supervisorEvaluations.map(s => s.a).reduce((accum, current) => accum + current, 0)
        let supervisorEvaluationsTotalB = supervisorEvaluations.map(s => s.b).reduce((accum, current) => accum + current, 0)
        let supervisorEvaluationsTotalC = supervisorEvaluations.map(s => s.c).reduce((accum, current) => accum + current, 0)
        let supervisorEvaluationsTotalD = supervisorEvaluations.map(s => s.d).reduce((accum, current) => accum + current, 0)
        let supervisorEvaluationsTotalScore = supervisorEvaluations.map(s => s.score).reduce((accum, current) => accum + current, 0)
        let supervisorEvaluationsPercentage = Math.round(supervisorEvaluationsTotalScore / supervisorEvaluations.length)

        // return res.send(surveys)
        let data = {
            form: form,
            evaluatee: evaluatee,
            surveys: surveys,
            studentEvaluations: studentEvaluations,
            studentEvaluationsTotalA: studentEvaluationsTotalA,
            studentEvaluationsTotalB: studentEvaluationsTotalB,
            studentEvaluationsTotalC: studentEvaluationsTotalC,
            studentEvaluationsTotalD: studentEvaluationsTotalD,
            studentEvaluationsTotalScore: studentEvaluationsTotalScore,
            studentEvaluationsPercentage: studentEvaluationsPercentage,

            supervisorEvaluations: supervisorEvaluations,
            supervisorEvaluationsTotalA: supervisorEvaluationsTotalA,
            supervisorEvaluationsTotalB: supervisorEvaluationsTotalB,
            supervisorEvaluationsTotalC: supervisorEvaluationsTotalC,
            supervisorEvaluationsTotalD: supervisorEvaluationsTotalD,
            supervisorEvaluationsTotalScore: supervisorEvaluationsTotalScore,
            supervisorEvaluationsPercentage: supervisorEvaluationsPercentage,
        }
        res.render(`admin/form/evaluatees/responses.html`, data)
    } catch (err) {
        next(err);
    }
});

// Share
router.get('/admin/forms/:formId/share', middlewares.guardRoute(['update_form']), middlewares.getForm(), async (req, res, next) => {
    try {
        let form = res.form

        let academicYears = Array.from({ length: 10 }, (_, i) => i)
        academicYears = academicYears.map((o) => {
            let start = moment().year() + 2
            return `${start - 10 + o}-${start - 10 + o + 1}`
        })
        academicYears.reverse()

        let evaluatees = await req.app.locals.db.models.Evaluatee.findAll({
            where: {}
        });

        let data = {
            flash: flash.get(req, 'form'),
            form: form,
            academicYears: academicYears,
            semesters: CONFIG.semesters,
            evaluatees: evaluatees,
        }
        res.render(`admin/form/share.html`, data)
    } catch (err) {
        next(err);
    }
});

router.patch('/admin/forms/:formId/share', middlewares.guardRoute(['update_form']), middlewares.antiCsrfCheck, middlewares.getForm(), async (req, res, next) => {
    try {
        let form = res.form

        let data = req.body

        // return res.send(data)
        await req.app.locals.db.models.Form.update({
            evaluateeIds: data.evaluateeIds,
        },
            {
                where: {
                    id: form.id
                }
            });

        flash.ok(req, 'form', 'Form updated.')
        res.redirect(`/admin/forms/${form.id}/share`)
    } catch (err) {
        next(err);
    }
});


// Delete
router.get('/admin/forms/:formId/delete', middlewares.guardRoute(['delete_form']), middlewares.getForm(), async (req, res, next) => {
    try {
        let form = res.form

        let data = {
            form: form
        }
        res.render(`admin/form/delete.html`, data)
    } catch (err) {
        next(err);
    }
});
router.delete('/admin/forms/:formId', middlewares.guardRoute(['delete_form']), middlewares.antiCsrfCheck, middlewares.getForm(), async (req, res, next) => {
    try {
        let form = res.form

        await form.destroy()

        flash.ok(req, 'form', 'Form deleted.')
        res.redirect(`/admin/forms`)
    } catch (err) {
        next(err);
    }
});

// Responses
router.get('/admin/forms/:formId/responses', middlewares.guardRoute(['update_form']), middlewares.getForm(), async (req, res, next) => {
    try {
        let form = res.form

        let surveys = await req.app.locals.db.instance.query(`SELECT 
            survey.*, 
            evaluatee.id AS evaluatee_id,  
            evaluatee.firstName AS evaluatee_firstName,  
            evaluatee.middleName AS evaluatee_middleName,  
            evaluatee.lastName AS evaluatee_lastName

            FROM Survey LEFT JOIN Evaluatee ON survey.evaluatee = evaluatee.id WHERE survey.formId = ${form.id} ORDER BY evaluatee.lastName;`, {
            type: QueryTypes.SELECT,
        })

        surveys = surveys.map((s, i) => {
            s.evaluatee = {
                id: s.evaluatee_id,
                firstName: s.evaluatee_firstName,
                middleName: s.evaluatee_middleName,
                lastName: s.evaluatee_lastName,
            }
            s.a = s.a1 + s.a2 + s.a3 + s.a4 + s.a5
            s.b = s.b1 + s.b2 + s.b3 + s.b4 + s.b5
            s.c = s.c1 + s.c2 + s.c3 + s.c4 + s.c5
            s.d = s.d1 + s.d2 + s.d3 + s.d4 + s.d5

            s.score = s.a + s.b + s.c + s.d
            return s
        })
        // return res.send(surveys)

        let evaluations = surveys
        let evaluationsTotalA = evaluations.map(s => s.a).reduce((accum, current) => accum + current, 0)
        let evaluationsTotalB = evaluations.map(s => s.b).reduce((accum, current) => accum + current, 0)
        let evaluationsTotalC = evaluations.map(s => s.c).reduce((accum, current) => accum + current, 0)
        let evaluationsTotalD = evaluations.map(s => s.d).reduce((accum, current) => accum + current, 0)
        let evaluationsTotalScore = evaluations.map(s => s.score).reduce((accum, current) => accum + current, 0)
        let evaluationsPercentage = Math.round(evaluationsTotalScore / evaluations.length)


        let data = {
            flash: flash.get(req, 'form'),
            form: form,
            surveys: surveys,
            evaluationsTotalA: evaluationsTotalA,
            evaluationsTotalB: evaluationsTotalB,
            evaluationsTotalC: evaluationsTotalC,
            evaluationsTotalD: evaluationsTotalD,
            evaluationsTotalScore: evaluationsTotalScore,
            evaluationsPercentage: evaluationsPercentage,
        }
        res.render(`admin/form/responses.html`, data)
    } catch (err) {
        next(err);
    }
});

module.exports = router;