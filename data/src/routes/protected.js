//// Core modules

//// External modules
const express = require('express')
const lodash = require('lodash')

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
		return res.render('survey/preview.html', data)
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