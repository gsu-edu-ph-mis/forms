//// Core modules

//// External modules
const express = require('express')
const flash = require('kisapmata')
const lodash = require('lodash')
const moment = require('moment')

//// Modules
const middlewares = require('../middlewares');
const api = require('../api');

// Router
let router = express.Router()

router.use('/forms', middlewares.requireAuthUser)

router.get('/forms/all', async (req, res, next) => {
    try {
        let {username, password} = res.user

        let forms = await api.get(`${CONFIG.app.api}/forms?categories=${CONFIG.bac.catId}`, {
			auth: {
				username: username,
				password: password
			}
		})
		let promises = []
		forms.forEach((form)=>{
			promises.push(api.get(`${CONFIG.app.api}/categories?include=${form.categories.filter(c=> c != CONFIG.bac.catId).join(',')}`))
		})
		let results = await Promise.all(promises)
		forms = forms.map((form, i)=>{
			form.categories = results[i] // Array of cat (all props)
			results[i] = results[i].map((r)=>{
				return r.name
			})
			form.categories2 = results[i] // Array of cat names
			form.isDeletable = moment.utc().diff(moment.utc(form.date), CONFIG.deleteWindow.unit) <= CONFIG.deleteWindow.value
			return form
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

router.get('/forms/create', async (req, res, next) => {
    try {
		let {username, password} = res.user
		let categories = await api.get(`${CONFIG.app.api}/categories?parent=${CONFIG.bac.catId}`, {
			auth: {
				username: username,
				password: password
			}
		})
		
        let data = {
			categories: categories,
			now: moment()
		}
        res.render('forms/create.html', data)
    } catch (err) {
        next(err)
    }
});
router.post('/forms/create', async (req, res, next) => {
    try {
		let {username, password} = res.user
		
		let categories = [CONFIG.bac.catId]
		let category = lodash.get(req, 'body.category')
		if(category){
			if(!Array.isArray(category)){
				category = [category]
			}
		} else {
			category = []
		}

		categories = categories.concat(...category)

        let body = {
			status: 'publish',
			title: lodash.get(req, 'body.title'),
			content: `<iframe src="${lodash.get(req, 'body.link')}" width="100%" height="480" allow="autoplay"></iframe>`,
			categories: `${CONFIG.bac.catId},${categories}`,
			date: moment(lodash.get(req, 'body.date')).hour(moment().hours()).minutes(moment().minutes()).toDate(),
		}
		//return res.send(body)
        let form = await api.form(`${CONFIG.app.api}/forms`, body, {
			auth: {
				username: username,
				password: password
			}
		})
        flash.ok(req, 'forms', `Published ${form.title.raw}.`)
        res.redirect(`/forms/all`)
    } catch (err) {
        next(err);
    }
});

router.get('/forms/delete/:formId', async (req, res, next) => {
    try {
		let {username, password} = res.user
		
		let formId = lodash.get(req, 'params.formId')
		if(!formId){
			throw new Error('Missing form id.')
		}
		
        let form = await api.delete(`${CONFIG.app.api}/forms/${formId}?force=1`, {
			auth: {
				username: username,
				password: password
			}
		})
        flash.ok(req, 'form', `Deleted form titled "${form.previous.title.raw}".`)
        res.redirect(`/form/all`)
    } catch (err) {
        next(err);
    }
});



module.exports = router;