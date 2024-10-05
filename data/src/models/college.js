const { DataTypes } = require('sequelize')

module.exports = (modelName, sequelize) => {
    return sequelize.define(modelName, {
        name: {
            type: DataTypes.STRING,
        },
        code: {
            type: DataTypes.STRING,
        },
        userId: {
            type: DataTypes.INTEGER,
        },
    }, {
        // Other model options go here
    })
}
