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

router.get('/form/:formUniqueKey', async (req, res, next) => {
	try {
		let form = await req.app.locals.db.models.Form.findOne({
			where: {
				uniqueKey: req.params?.formUniqueKey
			},
		})
		if (!form) {
			throw new Error('Form not found.')
		}

		if (!form.active) {
			throw new Error('This form is no longer accepting responses.')
		}

		if (!form.collegeId) {
			throw new Error('This form must have a chosen college.')
		}

		let evaluatees = await req.app.locals.db.models.Evaluatee.findAll({ 
			where: {},
			raw: true,
			order: [
				['lastName', 'ASC']
			],
		})
		evaluatees = evaluatees.filter(e => {
			return form.evaluateeIds?.includes(e.id)
		})
		if(evaluatees.length <= 0){
			throw new Error('Form does not contain evaluatees.')
		}

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
						"Regularly comes to class on time, well-groomed and well-prepared to complete assigned responsibilities.",
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
						"Creates opportunities for intensive and/ or contribution of students in class activities (e.g. breaks, class into dyads, triads, or buzz/ task groups).",
						"Assumes roles as facilitator, resource person, coach, inquisitor, integrator, referee in drawing students to contribute to knowledge and understanding of the concepts at hands.",
						"Designs and implements learning conditions and experiences that promotes healthy exchange and/or confrontations.",
						"Structures/Re-structures learning and teaching-learning context to enhance attainment of collective learning objectives.",
						"Use of instructional materials (audio/ video materials: fieldtrips, film showing, computer aided instruction and etc.) to reinforce learning processes.",
					]
			}
		}
		// return res.send(ratingPeriods)

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

		let programs = await req.app.locals.db.models.Program.findAll({
			where: {
				collegeId: form.collegeId
			},
			order: [
				['name', 'ASC']
			]
		})
		let data = {
			now: moment(),
			form: form,
			questionGroups: questionGroups,
			ratingPeriods: ratingPeriods,
			evaluatees: evaluatees,
			answers: answers,
			programs: programs,
		}
		res.render('form/teaching-effectiveness.html', data)
	} catch (err) {
		next(err)
	}
});
module.exports = router;