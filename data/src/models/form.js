//// Core modules

//// External modules
const { DataTypes } = require('sequelize');

//// Modules

module.exports = (modelName, sequelize) => {
    return sequelize.define(modelName, {
        name: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.STRING
        },
        academicYear: {
            type: DataTypes.STRING // Eg. 2021-2022
        },
        semester: {
            type: DataTypes.NUMBER // 1 or 2 for 1st and 2nd sem
        },
        ratingPeriodStart: {
            type: DataTypes.DATEONLY // Eg. YYYY-MM-DD
        },
        ratingPeriodEnd: {
            type: DataTypes.DATEONLY // Eg. YYYY-MM-DD
        },
        uniqueKey: {
            type: DataTypes.STRING
        },
        createdBy: {
            type: DataTypes.NUMBER // Author
        },
    }, {
        // Other model options go here
        timestamps: true
    })
}