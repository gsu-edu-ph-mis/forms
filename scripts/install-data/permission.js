const PERMS = require('./permissions-list'); // Do not remove semi-colon
const ALL = PERMS.ALL.map(p => {
    return { key: p }
})
module.exports = ALL