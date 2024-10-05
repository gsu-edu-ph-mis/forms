
const PERMS = require('./permissions-list');

module.exports = [
    {
        "key": "sysadmin",
        "name": "System Admin",
        "description": "Can do anything.",
        "permissions": PERMS.ALL,
    },
    {
        "key": "adminacad",
        "name": "Admin Academics",
        "description": "Can do mostly everything related to student & teacher administration except system administration.",
        "permissions": PERMS.ADMIN_ACAD
    },
    {
        "key": "dean",
        "name": "College Dean",
        "description": "Can do mostly everything related to student & teacher administration of own college.",
        "permissions": PERMS.ADMIN_ACAD
    },
    {
        "key": "teacher",
        "name": "Admin Academics",
        "description": "Can encode and read grades only.",
        "permissions": PERMS.TEACHER
    },
    {
        "key": "student",
        "name": "Student",
        "description": "Can read grade only.",
        "permissions": PERMS.STUDENT
    }
]
