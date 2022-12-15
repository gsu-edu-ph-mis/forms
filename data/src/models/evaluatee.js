// The person being evaluated

//// Core modules

//// External modules
const { DataTypes } = require('sequelize')

//// Modules
module.exports = (modelName, sequelize) => {
    return sequelize.define(modelName, {
        prefix:  {
            type: DataTypes.STRING
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
        suffix: {
            type: DataTypes.STRING
        },
        position: {
            type: DataTypes.STRING
        },
        gender: {
            type: DataTypes.STRING
        },
        birthDate: {
            type: DataTypes.STRING
        },
    }, {
        // Other model options go here
        timestamps: true
    })
}