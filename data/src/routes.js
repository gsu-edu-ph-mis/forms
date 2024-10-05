//// Core modules

//// External modules
const express = require('express');

//// Modules

// Routes
let router = express.Router();
router.use(require('./routes/public'));
router.use(require('./routes/protected'));
router.use(require('./routes/form'));
router.use(require('./routes/admin/college'));
router.use(require('./routes/admin/evaluatee'));
router.use(require('./routes/admin/form'));
router.use(require('./routes/admin/program'));
router.use(require('./routes/admin/user'));
router.use(require('./routes/survey'));

// 404 Page
router.use((req, res) => {
    res.status(404)
    if (req.xhr || /^\/api\//.test(req.originalUrl)) {
        return res.send("Page not found.")
    }
    res.render('error.html', { error: "Page not found." });
});


module.exports = router;