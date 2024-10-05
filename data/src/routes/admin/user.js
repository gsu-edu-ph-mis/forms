//// Core modules

//// External modules
const express = require('express')
const flash = require('kisapmata')

//// Modules
const middlewares = require('../../middlewares')
const passwordMan = require('../../password-man')

// Router
let router = express.Router()

router.use('/admin', middlewares.requireAuthUser)

router.get('/admin/users', middlewares.guardRoute(['read_all_user']), async (req, res, next) => {
    try {
        let rows = await req.app.locals.db.models.User.findAll({
            where: {}
        });

        let data = {
            flash: flash.get(req, 'user'),
            rows: rows
        }
        res.render('admin/users/all.html', data);
    } catch (err) {
        next(err);
    }
});

router.get('/admin/users/create', middlewares.guardRoute(['create_user']), async (req, res, next) => {
    try {

        let password = passwordMan.genPassphrase(3)
        let roles = await req.app.locals.db.models.Role.findAll()
        let data = {
            flash: flash.get(req, 'user'),
            password: password,
            roles: roles,
        }
        res.render('admin/users/create.html', data);
    } catch (err) {
        next(err);
    }
});

router.post('/admin/users', middlewares.guardRoute(['create_user']), middlewares.antiCsrfCheck, async (req, res, next) => {
    try {
        let data = req.body

        let salt = passwordMan.randomString(16)
        let passwordHash = passwordMan.hashPassword(data.password, salt)
        let permissions = []

        let user = await req.app.locals.db.models.User.create({
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName,
            email: data.email,
            username: data.username,
            passwordHash: passwordHash,
            salt: salt,
            roles: data.roles,
            permissions: permissions,
            active: data.active ?? false,
        });

        flash.ok(req, 'user', 'User created.')
        res.redirect(`/admin/users/`+ user.id )
    } catch (err) {
        next(err);
    }
});

router.get('/admin/users/:userId', middlewares.guardRoute(['update_user']), async (req, res, next) => {
    try {
        let user = await req.app.locals.db.models.User.findOne({
            where: {
                id: req.params.userId
            }
        });
        if(!user){
            throw new Error('User not found.')
        }

        let roles = await req.app.locals.db.models.Role.findAll()

        let data = {
            flash: flash.get(req, 'user'),
            roles: roles,
            user: user
        }
        res.render(`admin/users/update.html`, data)
    } catch (err) {
        next(err);
    }
});

router.put('/admin/users/:userId', middlewares.guardRoute(['update_user']), middlewares.antiCsrfCheck, async (req, res, next) => {
    try {
        let user = await req.app.locals.db.models.User.findOne({
            where: {
                id: req.params.userId
            }
        });
        if(!user){
            throw new Error('User not found.')
        }

        let data = req.body

        // return res.send(data)

        if(data.password){
            let salt = passwordMan.randomString(16)
            let passwordHash = passwordMan.hashPassword(data.password, salt)

            await req.app.locals.db.models.User.update({ 
                firstName: data.firstName,
                middleName: data.middleName,
                lastName: data.lastName,
                email: data.email,
                username: data.username,
                passwordHash: passwordHash,
                salt: salt,
                roles: data.roles,
                active: data.active ?? false,
            }, 
            {
                where: {
                    id: user.id
                }
            });

        } else {

            await req.app.locals.db.models.User.update({ 
                firstName: data.firstName,
                middleName: data.middleName,
                lastName: data.lastName,
                email: data.email,
                username: data.username,
                roles: data.roles,
                active: data.active ?? false,
            }, 
            {
                where: {
                    id: user.id
                }
            });

        }
        


        

        flash.ok(req, 'user', 'User updated.')
        res.redirect(`/admin/users/`+ user.id )
    } catch (err) {
        next(err);
    }
});

router.get('/admin/users/:userId/delete', middlewares.guardRoute(['delete_user']), async (req, res, next) => {
    try {
        let user = await req.app.locals.db.models.User.findOne({
            where: {
                id: req.params.userId
            }
        });
        if(!user){
            throw new Error('User not found.')
        }

        let data = {
            user: user
        }
        res.render(`admin/users/delete.html`, data)
    } catch (err) {
        next(err);
    }
});

router.delete('/admin/users/:userId', middlewares.guardRoute(['delete_user']), middlewares.antiCsrfCheck, async (req, res, next) => {
    try {
        let user = await req.app.locals.db.models.User.findOne({
            where: {
                id: req.params.userId
            }
        });
        if(!user){
            throw new Error('User not found.')
        }

        await user.destroy()

        flash.ok(req, 'user', 'User deleted.')
        res.redirect(`/admin/users`)
    } catch (err) {
        next(err);
    }
});

module.exports = router;