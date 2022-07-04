//// Core modules

//// External modules
const { DataTypes } = require('sequelize');

//// Modules

module.exports = {
    attributes: {
        key: {
            type: DataTypes.STRING
        },
    },
    options: { 
        timestamps: true,
        updatedAt: false
    }
}