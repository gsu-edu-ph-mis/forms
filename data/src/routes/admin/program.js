//// Core modules

//// External modules
const express = require('express')
const flash = require('kisapmata')

//// Modules
const middlewares = require('../../middlewares')

// Router
let router = express.Router()

router.use('/admin', middlewares.requireAuthUser)

router.get('/admin/programs', middlewares.guardRoute(['read_all_program']), async (req, res, next) => {
    try {
        let rows = await req.app.locals.db.models.Program.findAll({
            where: {},
            order: [
                ['collegeId', 'ASC'],
                ['name', 'ASC']
            ],
            raw: true
        });

        rows = rows.map(program => {
            let college = req.app.locals.colleges.find(college => {
                return college.id === program.collegeId
            })
            program.college = college
            return program
        })
        let data = {
            flash: flash.get(req, 'program'),
            rows: rows
        }
        res.render('admin/programs/all.html', data);
    } catch (err) {
        next(err);
    }
});

router.get('/admin/programs/create', middlewares.guardRoute(['create_program']), async (req, res, next) => {
    try {
        let data = {
            flash: flash.get(req, 'program'),
        }
        res.render('admin/programs/create.html', data);
    } catch (err) {
        next(err);
    }
});

router.post('/admin/programs', middlewares.guardRoute(['create_program']), middlewares.antiCsrfCheck, async (req, res, next) => {
    try {
        let data = req.body

        let program = await req.app.locals.db.models.Program.create({
            name: data.name,
            code: data.code,
            campus: data.campus,
            active: data.active ?? false,
            collegeId: data.collegeId,
            createdBy: res.user.id,
        });

        flash.ok(req, 'program', 'Program created.')
        res.redirect(`/admin/programs/` + program.id)
    } catch (err) {
        next(err);
    }
});

router.get('/admin/programs/:programId', middlewares.guardRoute(['update_program']), async (req, res, next) => {
    try {
        let program = await req.app.locals.db.models.Program.findOne({
            where: {
                id: req.params.programId
            }
        });
        if (!program) {
            throw new Error('Program not found.')
        }

        let data = {
            flash: flash.get(req, 'program'),
            program: program
        }
        res.render(`admin/programs/update.html`, data)
    } catch (err) {
        next(err);
    }
});

router.put('/admin/programs/:programId', middlewares.guardRoute(['update_program']), middlewares.antiCsrfCheck, async (req, res, next) => {
    try {
        let program = await req.app.locals.db.models.Program.findOne({
            where: {
                id: req.params.programId
            }
        });
        if (!program) {
            throw new Error('Program not found.')
        }

        let data = req.body

        await req.app.locals.db.models.Program.update({
            name: data.name,
            code: data.code,
            campus: data.campus,
            active: data.active ?? false,
            collegeId: data.collegeId,
        },
            {
                where: {
                    id: program.id
                }
            });

        flash.ok(req, 'program', 'Program updated.')
        res.redirect(`/admin/programs/` + program.id)
    } catch (err) {
        next(err);
    }
});

router.get('/admin/programs/:programId/delete', middlewares.guardRoute(['delete_program']), async (req, res, next) => {
    try {
        let program = await req.app.locals.db.models.Program.findOne({
            where: {
                id: req.params.programId
            }
        });
        if (!program) {
            throw new Error('Program not found.')
        }

        let data = {
            program: program
        }
        res.render(`admin/programs/delete.html`, data)
    } catch (err) {
        next(err);
    }
});

router.delete('/admin/programs/:programId', middlewares.guardRoute(['delete_program']), middlewares.antiCsrfCheck, async (req, res, next) => {
    try {
        let program = await req.app.locals.db.models.Program.findOne({
            where: {
                id: req.params.programId
            }
        });
        if (!program) {
            throw new Error('Program not found.')
        }

        await program.destroy()

        flash.ok(req, 'program', 'Program deleted.')
        res.redirect(`/admin/programs`)
    } catch (err) {
        next(err);
    }
});

module.exports = router;