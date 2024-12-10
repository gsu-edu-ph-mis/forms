//// Core modules

//// External modules
const { DataTypes } = require('sequelize');

//// Modules

module.exports = (modelName, sequelize) => {
    return sequelize.define(modelName, {
        formId: {
            type: DataTypes.INTEGER
        },
        evaluatee: {
            type: DataTypes.STRING
        },
        evaluatorType: {
            type: DataTypes.STRING // self, peer, student, supervisor
        },
        evaluatorName: {
            type: DataTypes.STRING
        },
        evaluatorEmail: {
            type: DataTypes.STRING
        },
        evaluatorPosition: {
            type: DataTypes.STRING
        },
        evaluatorSubject: {
            type: DataTypes.STRING
        },
        evaluatorCourse: {
            type: DataTypes.STRING
        },
        evaluatorYearLevel: {
            type: DataTypes.INTEGER // 1,2,3,4
        },
        evaluatorSection: {
            type: DataTypes.STRING // A,B
        },
        evaluatorSignature: {
            type: DataTypes.STRING // base64 image
        },
        comments: {
            type: DataTypes.STRING // Acad rank of person being evaluated
        },
        a1: {
            type: DataTypes.INTEGER
        },
        a2: {
            type: DataTypes.INTEGER
        },
        a3: {
            type: DataTypes.INTEGER
        },
        a4: {
            type: DataTypes.INTEGER
        },
        a5: {
            type: DataTypes.INTEGER
        },
        b1: {
            type: DataTypes.INTEGER
        },
        b2: {
            type: DataTypes.INTEGER
        },
        b3: {
            type: DataTypes.INTEGER
        },
        b4: {
            type: DataTypes.INTEGER
        },
        b5: {
            type: DataTypes.INTEGER
        },
        c1: {
            type: DataTypes.INTEGER
        },
        c2: {
            type: DataTypes.INTEGER
        },
        c3: {
            type: DataTypes.INTEGER
        },
        c4: {
            type: DataTypes.INTEGER
        },
        c5: {
            type: DataTypes.INTEGER
        },
        d1: {
            type: DataTypes.INTEGER
        },
        d2: {
            type: DataTypes.INTEGER
        },
        d3: {
            type: DataTypes.INTEGER
        },
        d4: {
            type: DataTypes.INTEGER
        },
        d5: {
            type: DataTypes.INTEGER
        },
    }, {
        // Other model options go here
        timestamps: true
    })
}