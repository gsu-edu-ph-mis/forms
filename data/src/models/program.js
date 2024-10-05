//// Core modules

//// External modules
const { DataTypes } = require('sequelize')

//// Modules

module.exports = (modelName, sequelize) => {
    return sequelize.define(modelName, {
        name: {
            type: DataTypes.STRING,
        },
        code: {
            type: DataTypes.STRING,
        },
        campus: {
            type: DataTypes.ENUM('', 'BAT', 'MOS', 'SAL'),
            __optional: true,
        },
        active: {
            type: DataTypes.BOOLEAN,
        },
        collegeId: {
            type: DataTypes.INTEGER,
        },
        createdBy: {
            type: DataTypes.INTEGER,
            __hidden: true,
        },
    }, {
        // Other model options go here
    })
}
