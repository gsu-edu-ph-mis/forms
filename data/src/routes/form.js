//// Core modules

//// External modules
const express = require('express')
const flash = require('kisapmata')
const lodash = require('lodash')
const moment = require('moment')

//// Modules
const middlewares = require('../middlewares');
const passwordMan = require('../password-man');

// Router
let router = express.Router()

router.use('/form', middlewares.requireAuthUser)

router.get('/form/all', async (req, res, next) => {
	try {
		let forms = await req.app.locals.db.main.Form.findAll({
			raw: true
		})

		let promises = forms.map(form => {
			return req.app.locals.db.main.Survey.count({
				where: {
					formId: form.id
				}
			})
		})
		let results = await Promise.all(promises)
		forms = forms.map((o, i) => {

			o.surveysCount = results[i]
			return o
		})


		let data = {
			flash: flash.get(req, 'form'),
			forms: forms
		}
		// return res.send(data)
		res.render('form/all.html', data)
	} catch (err) {
		next(err);
	}
});

// 
router.get('/form/create', async (req, res, next) => {
	try {

		let academicYears = Array.from({ length: 10 }, (_, i) => i)
		academicYears = academicYears.map((o) => {
			let start = moment().year()
			return `${start - 10 + o}-${start - 10 + o + 1}`
		})
		academicYears.reverse()
		// return res.send(academicYears)
		let data = {
			now: moment(),
			academicYears: academicYears
		}
		res.render('form/create.html', data)
	} catch (err) {
		next(err)
	}
});
router.post('/form/create', async (req, res, next) => {
	try {
		let user = res.user

		let form = await req.app.locals.db.main.Form.create({
			name: req.body.name,
			description: req.body.description,
			academicYear: req.body.academicYear,
			semester: req.body.semester,
			ratingPeriodStart: req.body.ratingPeriodStart,
			ratingPeriodEnd: req.body.ratingPeriodEnd,
			uniqueKey: passwordMan.randomString(64),
			createdBy: user.id,
		})

		flash.ok(req, 'form', `Created form ${form.name}.`)
		res.redirect(`/form/all`)
	} catch (err) {
		next(err);
	}
});

// 
router.get('/form/:formId/update', async (req, res, next) => {
	try {
		let form = await req.app.locals.db.main.Form.findOne({
			where: {
				id: req.params.formId
			}
		})
		if (!form) {
			throw new Error('Not found')
		}
		let academicYears = Array.from({ length: 10 }, (_, i) => i)
		academicYears = academicYears.map((o) => {
			let start = moment().year()
			return `${start - 10 + o}-${start - 10 + o + 1}`
		})
		academicYears.reverse()
		// return res.send(academicYears)
		let data = {
			form: form,
			now: moment(),
			academicYears: academicYears
		}
		res.render('form/update.html', data)
	} catch (err) {
		next(err)
	}
});
router.post('/form/:formId/update/', async (req, res, next) => {
	try {
		let form = await req.app.locals.db.main.Form.findOne({
			where: {
				id: req.params.formId
			}
		})
		if (!form) {
			throw new Error('Not found')
		}

		form.set({
			name: req.body.name,
			academicYear: req.body.academicYear,
			semester: req.body.semester,
			ratingPeriodStart: req.body.ratingPeriodStart,
			ratingPeriodEnd: req.body.ratingPeriodEnd,
		})
		await form.save()

		flash.ok(req, 'form', `Updated form ${form.name}.`)
		res.redirect(`/form/all`)
	} catch (err) {
		next(err);
	}
});

router.get('/form/:formId/delete', async (req, res, next) => {
	try {
		let form = await req.app.locals.db.main.Form.findOne({
			where: {
				id: req.params.formId
			}
		})
		if (!form) {
			throw new Error('Not found')
		}

		await form.destroy()

		flash.ok(req, 'form', `Deleted form ${form.name}.`)
		res.redirect(`/form/all`)
	} catch (err) {
		next(err);
	}
})

router.get('/form/:formId/surveys', async (req, res, next) => {
	try {
		let form = await req.app.locals.db.main.Form.findOne({
			where: {
				id: req.params.formId
			}
		})
		if (!form) {
			throw new Error('Not found')
		}

		let surveys = await req.app.locals.db.main.Survey.findAll({
			where: {
				formId: form.id
			}
		})

		let promises = surveys.map(s => {
			return req.app.locals.db.main.Evaluatee.findOne({
				where: {
					id: s.evaluatee
				}
			})
		})
		let results = await Promise.all(promises)
		surveys = surveys.map((s,i) => {
			s.evaluatee = results[i]
			s.a = s.a1 + s.a2 + s.a3 + s.a4 + s.a5
			s.b = s.b1 + s.b2 + s.b3 + s.b4 + s.b5
			s.c = s.c1 + s.c2 + s.c3 + s.c4 + s.c5
			s.d = s.d1 + s.d2 + s.d3 + s.d4 + s.d5

			s.score = s.a + s.b + s.c + s.d
			return s
		})
		let data = {
			form: form,
			surveys: surveys,
		}
		// return res.send(surveys)
		res.render('form/surveys.html', data)
	} catch (err) {
		next(err);
	}
});

module.exports = router;