//// Core modules

//// External modules
const { DataTypes } = require('sequelize');

//// Modules

module.exports = {
    attributes: {
        key: {
            type: DataTypes.STRING
        },
        name: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.STRING
        },
        permissions: {
            type: DataTypes.JSON
        },
    },
    options: { 
        timestamps: true,
        updatedAt: false
    }
}