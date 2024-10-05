//// Core modules

//// External modules
const moment = require('moment')
const { DataTypes } = require('sequelize')

//// Modules
const { safeParseJSON } = require('../util')

module.exports = (modelName, sequelize) => {
    return sequelize.define(modelName, {
        prefix: {
            type: DataTypes.STRING,
            __optional: true,
        },
        firstName: {
            type: DataTypes.STRING
        },
        middleName: {
            type: DataTypes.STRING,
            __optional: true,
        },
        lastName: {
            type: DataTypes.STRING
        },
        suffix: {
            type: DataTypes.ENUM('', 'Jr.', 'II', 'III', 'IV', 'V', 'Sr.'),
            __optional: true,
        },
        position: {
            type: DataTypes.STRING,
            __optional: true,
        },
        gender: {
            type: DataTypes.ENUM('', 'M', 'F'),
            __optional: true,
        },
        birthDate: {
            type: DataTypes.DATE,
            get() {
                const rawValue = this.getDataValue('birthDate');
                const mDate = moment(rawValue)
                return (mDate.isValid()) ? mDate.format('YYYY-MM-DD') : ''
            },
            set(value) {
                if(value){
                    const mDate = moment(value)
                    if(mDate.isValid()){
                        this.setDataValue('birthDate', value)
                    }
                } else {
                    this.setDataValue('birthDate', null)
                }
            },
            __optional: true,
        },
        photo: {
            type: DataTypes.TEXT,
            __optional: true,
        },
        collegeId: {
            type: DataTypes.INTEGER
        },
        collegeTags: {
            type: DataTypes.JSON,
            get() {
                const rawValue = this.getDataValue('collegeTags');
                if (typeof rawValue === 'string') {
                    return safeParseJSON(rawValue)
                } else if (typeof rawValue === 'object') {
                    return rawValue
                }
                return [];
            },
        },
    }, {
        // Other model options go here
        timestamps: true
    })
}