/**
 * Permission checks are hardcoded in route middlewares.
 * Code should be updated together with this list.
 */

//// Core modules

//// External modules

//// Modules

const OWN_ACCOUNT = [
    // Own account related - admin users
    'read_own_account',
    'update_own_password',
]

const ADMIN_ACAD = [
    'read_all_form',
    'create_form',
    'read_form',
    'update_form',
    'delete_form',

    'read_all_evaluatee',
    'create_evaluatee',
    'read_evaluatee',
    'update_evaluatee',
    'delete_evaluatee',

    'read_all_survey',
    'create_survey',
    'read_survey',
    'update_survey',
    'delete_survey',

    

    

    'read_all_instructor',
    'create_instructor',
    'read_instructor',
    'update_instructor',
    'delete_instructor',

    'read_all_student',
    'create_student',
    'read_student',
    'update_student',
    'delete_student',
]

const SYS_ADMIN = [

    'read_all_permission',
    'create_permission',
    'read_permission',
    'update_permission',
    'delete_permission',

    'read_all_role',
    'create_role',
    'read_role',
    'update_role',
    'delete_role',

    'read_all_user',
    'create_user',
    'read_user',
    'update_user',
    'delete_user',

    'read_all_college',
    'create_college',
    'read_college',
    'update_college',
    'delete_college',

    'read_all_program',
    'create_program',
    'read_program',
    'update_program',
    'delete_program',
]

const TEACHER = [
    'read_all_form',
    'create_form',
    'read_form',
    'update_form',
    'delete_form',
]

const STUDENT = [
    'read_all_form',
    'create_form',
    'read_form',
    'update_form',
    'delete_form',
]

const ALL = [...ADMIN_ACAD, ...SYS_ADMIN, ...OWN_ACCOUNT]

module.exports = {
    ADMIN_ACAD: ADMIN_ACAD,
    SYS_ADMIN: SYS_ADMIN,
    ALL: ALL,
    TEACHER: TEACHER,
    STUDENT: STUDENT,
}