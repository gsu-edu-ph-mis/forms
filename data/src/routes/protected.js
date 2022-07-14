//// Core modules

//// External modules
const express = require('express')
const lodash = require('lodash')
const moment = require('moment')
const sharp = require('sharp')

//// Modules
const middlewares = require('../middlewares');
const pdf = require('../pdf')

// Router
let router = express.Router()

router.get('/', middlewares.requireAuthUser, async (req, res, next) => {
	try {
		res.redirect('/form/all');
	} catch (err) {
		next(err);
	}
});

router.get('/survey/thank-you', async (req, res, next) => {
	return res.render('form/thanks.html')
})

router.get('/survey/:formUniqueKey', async (req, res, next) => {
	try {

		let form = await req.app.locals.db.main.Form.findOne({
			where: {
				uniqueKey: req.params.formUniqueKey
			},
			raw: true,
		})
		if (!form) {
			throw new Error('Not found.')
		}

		let evaluatees = await req.app.locals.db.main.Evaluatee.findAll({ raw: true })

		let ratingPeriods = Array.from({ length: 10 }, (_, i) => i)
		ratingPeriods = ratingPeriods.map((o) => {
			let start = moment().year()
			return `${start - 10 + o}-${start - 10 + o + 1}`
		})
		ratingPeriods.reverse()

		let questionGroups = {
			A: {
				title: 'Commitment',
				questions:
					[
						"Demonstrate sensitivity to student's ability to attend and absorb content information.",
						"Integrates sensitivity to his/her learning objectives with those of the students in a collaborative process.",
						"Makes self available to students beyond official time.",
						"Regularly engages with the class on the scheduled time and well-prepared to complete the learning activities.",
						"Keeps accurate records of students' performance and prompt submission of the same.",
					]
			},
			B: {
				title: 'Knowledge of Subject Matter',
				questions:
					[
						"Demonstrates mastery of the subject matter (explain the subject matter without relying solely on prescribed textbook).",
						"Draws and shares information on the state of the art of theory and practice in his/her discipline.",
						"Integrates subjects to practical circumstances and learning intents/purposes of students.",
						"Explains the relevance of present topics to the previous lessons, and relates the subject matter to relevant current issues and/or daily life activities.",
						"Demonstrates up-to-date knowledge and/or awareness on current trends and issues of the subject.",
					]
			},
			C: {
				title: 'Teaching for Independent Learning',
				questions:
					[
						"Creates teaching strategies that allow students to practice using concepts they need to understand (interactive discussion).",
						"Enhances students' self-esteem and/or give due recognition to students' performance/potentials.",
						"Allows students to create their own course with objectives and realistically defined student-professor rules and make them accountable for their performance.",
						"Allows students to think independently and make their own decisions and holding them accountable for their performance based largely on their success in executing decisions.",
						"Encourages students to learn beyond what is required and help/guide the students how to apply the concepts learned.",
					]
			},
			D: {
				title: 'Management of Learning',
				questions:
					[
						"Creates opportunities for intensive and/or contribution of students in class activities",
						"Assumes roles as facilitator, resource person, coach, inquisitor, integrator, referee in drawing students to contribute to knowledge and understanding of the concepts at hands.",
						"Designs and implements learning conditions and experiences that promotes healthy exchange and/or confrontations.",
						"Structures/Re-structures learning and teaching-learning context to enhance attainment of collective learning objectives.",
						"Uses appropriate teaching modality (e.g. google classroom, lecture presentation, recorded videos, etc.)",
					]
			}
		}
		// return res.send(ratingPeriods)

		evaluatees = evaluatees.map((e) => {
			e.photo = e.firstName.toLowerCase().trim().replace(/\s/g, '').replace(/ñ/, 'n').replace(/Ñ/, 'N')
			e.photo += '.' + e.lastName.toLowerCase().trim().replace(/\s/g, '').replace(/ñ/, 'n').replace(/Ñ/, 'N')
			e.photo += `.jpg`
			e.name = `${e.prefix} ${e.firstName} ${e.lastName}`
			return e
		})

		// return res.send(questionGroups)
		let answers = {
			A1: null,
			A2: null,
			A3: null,
			A4: null,
			A5: null,
			B1: null,
			B2: null,
			B3: null,
			B4: null,
			B5: null,
			C1: null,
			C2: null,
			C3: null,
			C4: null,
			C5: null,
			D1: null,
			D2: null,
			D3: null,
			D4: null,
			D5: null,
		}
		answers = lodash.mapValues(answers, a => {
			return 5
		})
		// answers.B2 = null
		// answers.D5 = null
		let data = {
			now: moment(),
			form: form,
			questionGroups: questionGroups,
			ratingPeriods: ratingPeriods,
			evaluatees: evaluatees,
			answers: answers,
		}
		res.render('form/teaching-effectiveness.html', data)
	} catch (err) {
		next(err)
	}
});

router.post('/survey/:formUniqueKey', async (req, res, next) => {
	try {
		let form = await req.app.locals.db.main.Form.findOne({
			where: {
				uniqueKey: req.params.formUniqueKey
			},
			raw: true,
		})
		if (!form) {
			throw new Error('Not found.')
		}

		let base64 = lodash.get(req.body.evaluatorSignature.split(';base64,'), '1', '')
		if (base64) {
			let buffer = Buffer.from(base64, 'base64');
			buffer = await sharp(buffer).trim().toBuffer()
			base64 = `data:image/png;base64,` + buffer.toString('base64')
		}


		let survey = await req.app.locals.db.main.Survey.create({
			formId: 1,
			evaluatee: req.body.evaluatee,
			evaluatorType: req.body.evaluatorType,
			evaluatorName: req.body.evaluatorName,
			evaluatorEmail: req.body.evaluatorEmail,
			evaluatorCourse: req.body.evaluatorCourse,
			evaluatorYearLevel: req.body.evaluatorYearLevel,
			evaluatorSection: req.body.evaluatorSection,
			evaluatorSignature: base64,
			comments: req.body.comments,
			a1: req.body.A1,
			a2: req.body.A2,
			a3: req.body.A3,
			a4: req.body.A4,
			a5: req.body.A5,
			b1: req.body.B1,
			b2: req.body.B2,
			b3: req.body.B3,
			b4: req.body.B4,
			b5: req.body.B5,
			c1: req.body.C1,
			c2: req.body.C2,
			c3: req.body.C3,
			c4: req.body.C4,
			c5: req.body.C5,
			d1: req.body.D1,
			d2: req.body.D2,
			d3: req.body.D3,
			d4: req.body.D4,
			d5: req.body.D5,
		})
		res.redirect('/survey/thank-you')
	} catch (err) {
		next(err)
	}
});

router.get('/survey/:surveyId/preview/:key', async (req, res, next) => {
	try {
		if(req.params.key !== CRED.pdf.secret){
			throw new Error('Invalid key.')
		}
		let survey = await req.app.locals.db.main.Survey.findOne({
			where: {
				id: req.params.surveyId
			},
			raw: true
		})
		if (!survey) {
			throw new Error('Not found.')
		}
		let form = await req.app.locals.db.main.Form.findOne({
			where: {
				id: survey.formId
			},
			raw: true
		})
		let evaluatee = await req.app.locals.db.main.Evaluatee.findOne({
			where: {
				id: survey.evaluatee
			},
			raw: true
		})
		let questionGroups = {
			A: {
				title: 'Commitment',
				questions:
					[
						"Demonstrate sensitivity to student's ability to attend and absorb content information.",
						"Integrates sensitivity to his/her learning objectives with those of the students in a collaborative process.",
						"Makes self available to students beyond official time.",
						"Regularly engages with the class on the scheduled time and well-prepared to complete the learning activities.",
						"Keeps accurate records of students' performance and prompt submission of the same.",
					]
			},
			B: {
				title: 'Knowledge of Subject Matter',
				questions:
					[
						"Demonstrates mastery of the subject matter (explain the subject matter without relying solely on prescribed textbook).",
						"Draws and shares information on the state of the art of theory and practice in his/her discipline.",
						"Integrates subjects to practical circumstances and learning intents/purposes of students.",
						"Explains the relevance of present topics to the previous lessons, and relates the subject matter to relevant current issues and/or daily life activities.",
						"Demonstrates up-to-date knowledge and/or awareness on current trends and issues of the subject.",
					]
			},
			C: {
				title: 'Teaching for Independent Learning',
				questions:
					[
						"Creates teaching strategies that allow students to practice using concepts they need to understand (interactive discussion).",
						"Enhances students' self-esteem and/or give due recognition to students' performance/potentials.",
						"Allows students to create their own course with objectives and realistically defined student-professor rules and make them accountable for their performance.",
						"Allows students to think independently and make their own decisions and holding them accountable for their performance based largely on their success in executing decisions.",
						"Encourages students to learn beyond what is required and help/guide the students how to apply the concepts learned.",
					]
			},
			D: {
				title: 'Management of Learning',
				questions:
					[
						"Creates opportunities for intensive and/or contribution of students in class activities",
						"Assumes roles as facilitator, resource person, coach, inquisitor, integrator, referee in drawing students to contribute to knowledge and understanding of the concepts at hands.",
						"Designs and implements learning conditions and experiences that promotes healthy exchange and/or confrontations.",
						"Structures/Re-structures learning and teaching-learning context to enhance attainment of collective learning objectives.",
						"Uses appropriate teaching modality (e.g. google classroom, lecture presentation, recorded videos, etc.)",
					]
			}
		}

		let scores = {
			A: {
				total: survey.a1 + survey.a2 + survey.a3 + survey.a4 + survey.a5
			},
			B: {
				total: survey.b1 + survey.b2 + survey.b3 + survey.b4 + survey.b5
			},
			C: {
				total: survey.c1 + survey.c2 + survey.c3 + survey.c4 + survey.c5
			},
			D: {
				total: survey.d1 + survey.d2 + survey.d3 + survey.d4 + survey.d5
			}
		}
		scores.total = scores.A.total + scores.B.total + scores.C.total + scores.D.total
		let data = {
			survey: survey,
			form: form,
			evaluatee: evaluatee,
			questionGroups: questionGroups,
			scores: scores
		}
		// return res.send(scores)
		return res.render('form/survey.html', data)
	} catch (err) {
		next(err)
	}
});



// View s3 object using html page
router.get('/file-viewer/:bucket/:prefix/:key', middlewares.requireAuthUser, async (req, res, next) => {
	try {
		let bucket = lodash.get(req, "params.bucket", "");
		let prefix = lodash.get(req, "params.prefix", "");
		let key = lodash.get(req, "params.key", "");

		let url = s3.getSignedUrl('getObject', {
			Bucket: bucket,
			Key: prefix + '/' + key
		})

		res.render('file-viewer.html', {
			url: url,
		});
	} catch (err) {
		next(err);
	}
});

// Get s3 object content
router.get('/file-getter/:bucket/:prefix/:key', async (req, res, next) => {
	try {
		let bucket = lodash.get(req, "params.bucket", "");
		let prefix = lodash.get(req, "params.prefix", "");
		let key = lodash.get(req, "params.key", "");

		let url = s3.getSignedUrl('getObject', {
			Bucket: bucket,
			Key: prefix + '/' + key,
		})

		res.redirect(url);
	} catch (err) {
		next(err);
	}
});

module.exports = router;