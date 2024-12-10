//// Core modules

//// External modules
const { DataTypes } = require('sequelize')

//// Modules
const { safeParseJSON } = require('../util')


module.exports = (modelName, sequelize) => {
    return sequelize.define(modelName, {
        firstName: {
            type: DataTypes.STRING,
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
            type: DataTypes.STRING,
            __hidden: true,
        },
        salt: {
            type: DataTypes.STRING,
            __hidden: true,
        },
        roles: {
            type: DataTypes.JSON,
            get() {
                const rawValue = this.getDataValue('roles');
                if (typeof rawValue === 'string') {
                    return safeParseJSON(rawValue)
                } else if (typeof rawValue === 'object') {
                    return rawValue
                }
                return [];
            },
        },
        permissions: {
            type: DataTypes.JSON,
            get() {
                const rawValue = this.getDataValue('permissions');
                if (typeof rawValue === 'string') {
                    return safeParseJSON(rawValue)
                } else if (typeof rawValue === 'object') {
                    return rawValue
                }
                return [];
            },
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: 0
        },
    }, {
        // Other model options go here
    })
}