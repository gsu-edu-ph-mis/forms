//// Core modules

//// External modules
const express = require('express')
const flash = require('kisapmata')
const lodash = require('lodash')
const moment = require('moment')

//// Modules
const middlewares = require('../middlewares');
const api = require('../api');
const db = require('../db');

// Router
let router = express.Router()

router.use('/form', middlewares.requireAuthUser)

router.get('/form/all', async (req, res, next) => {
	try {
		let forms = await req.app.locals.db.main.Form.findAll({
			raw: true
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
			academicYear: req.body.academicYear,
			semester: req.body.semester,
			ratingPeriodStart: req.body.ratingPeriodStart,
			ratingPeriodEnd: req.body.ratingPeriodEnd,
			createdBy: user.id,
		})

		flash.ok(req, 'form', `Created form ${form.name}.`)
		res.redirect(`/form/all`)
	} catch (err) {
		next(err);
	}
});

// 
router.get('/form/update/:formId', async (req, res, next) => {
	try {
		let form = await req.app.locals.db.main.Form.findOne({
			where: {
				id: req.params.formId
			}
		})
		if(!form){
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
router.post('/form/update/:formId', async (req, res, next) => {
	try {
		let form = await req.app.locals.db.main.Form.findOne({
			where: {
				id: req.params.formId
			}
		})
		if(!form){
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

router.get('/form/delete/:formId', async (req, res, next) => {
	try {
		let form = await req.app.locals.db.main.Form.findOne({
			where: {
				id: req.params.formId
			}
		})
		if(!form){
			throw new Error('Not found')
		}

		await form.destroy()

		flash.ok(req, 'form', `Deleted form ${form.name}.`)
		res.redirect(`/form/all`)
	} catch (err) {
		next(err);
	}
});

module.exports = router;