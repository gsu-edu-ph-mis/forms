//// Core modules

//// External modules
const { DataTypes } = require('sequelize');

//// Modules

module.exports = {
    attributes: {
        roles: {
            type: DataTypes.JSON
        },
        permissions: {
            type: DataTypes.JSON
        },
        firstName: {
            type: DataTypes.STRING
        },
        middleName: {
            type: DataTypes.STRING
        },
        lastName: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING
        },
        username: {
            type: DataTypes.STRING
        },
        passwordHash: {
            type: DataTypes.STRING
        },
        salt: {
            type: DataTypes.STRING
        },
        active: {
            type: DataTypes.BOOLEAN
        },
    },
    options: { timestamps: true }
}