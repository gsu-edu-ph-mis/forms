//// Core modules

//// External modules
const { DataTypes } = require('sequelize');

//// Modules
const { safeParseJSON } = require('../util')

module.exports = (modelName, sequelize) => {
    return sequelize.define(modelName, {
        name: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT
        },
        academicYear: {
            type: DataTypes.STRING // Eg. 2021-2022
        },
        semester: {
            type: DataTypes.INTEGER // 1 or 2 for 1st and 2nd sem
        },
        ratingPeriodStart: {
            type: DataTypes.DATEONLY // Eg. YYYY-MM-DD
        },
        ratingPeriodEnd: {
            type: DataTypes.DATEONLY // Eg. YYYY-MM-DD
        },
        collegeId: {
            type: DataTypes.INTEGER
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: 0
        },
        evaluateeIds: {
            type: DataTypes.JSON,
            get() {
                const rawValue = this.getDataValue('evaluateeIds');
                if (typeof rawValue === 'string') {
                    return safeParseJSON(rawValue)
                } else if (typeof rawValue === 'object') {
                    return rawValue
                }
                return [];
            },
            set(rawValue) {
                if (Array.isArray(rawValue)) {
                    rawValue = rawValue.map(v => {
                        try {
                            v = parseInt(v)
                        } catch (err) {
                            v = null
                        }
                        return v
                    }).filter(v => v !== null)
                }
                this.setDataValue('evaluateeIds', rawValue);
            },
        },
        uniqueKey: {
            type: DataTypes.STRING,
            __hidden: true,
        },
        createdBy: {
            type: DataTypes.INTEGER, // Author
            __hidden: true,
        },
    }, {
        // Other model options go here
        timestamps: true
    })
}