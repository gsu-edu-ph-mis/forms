//// Core modules

//// External modules
const express = require('express')
const flash = require('kisapmata')
const lodash = require('lodash')
const moment = require('moment')

//// Modules
const middlewares = require('../middlewares');
const pdf = require('../pdf');

// Router
let router = express.Router()

router.use('/survey', middlewares.requireAuthUser)

router.get('/survey/:surveyId/preview', async (req, res, next) => {
	try {
		return res.redirect(`/survey/${req.params.surveyId}/preview/${CRED.pdf.secret}`)
	} catch (err) {
		next(err)
	}
});

router.get('/survey/:surveyId/pdf', async (req, res, next) => {
	try {
		let buff = await pdf.pageToPdf(`${CONFIG.app.url}/survey/${req.params.surveyId}/preview/${CRED.pdf.secret}`)

		res.set('Content-Disposition', `attachment; filename="response.pdf"`)
		res.set('Content-Type', 'application/pdf')
		return res.send(buff)
	} catch (err) {
		next(err)
	}
});

module.exports = router;