//// Core modules

//// External modules
const { DataTypes } = require('sequelize');

//// Modules

module.exports = {
    attributes: {
        formId: {
            type: DataTypes.NUMBER
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
        evaluatorCourse: {
            type: DataTypes.STRING
        },
        evaluatorYearLevel: {
            type: DataTypes.NUMBER // 1,2,3,4
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
            type: DataTypes.NUMBER
        },
        a2: {
            type: DataTypes.NUMBER
        },
        a3: {
            type: DataTypes.NUMBER
        },
        a4: {
            type: DataTypes.NUMBER
        },
        a5: {
            type: DataTypes.NUMBER
        },
        b1: {
            type: DataTypes.NUMBER
        },
        b2: {
            type: DataTypes.NUMBER
        },
        b3: {
            type: DataTypes.NUMBER
        },
        b4: {
            type: DataTypes.NUMBER
        },
        b5: {
            type: DataTypes.NUMBER
        },
        c1: {
            type: DataTypes.NUMBER
        },
        c2: {
            type: DataTypes.NUMBER
        },
        c3: {
            type: DataTypes.NUMBER
        },
        c4: {
            type: DataTypes.NUMBER
        },
        c5: {
            type: DataTypes.NUMBER
        },
        d1: {
            type: DataTypes.NUMBER
        },
        d2: {
            type: DataTypes.NUMBER
        },
        d3: {
            type: DataTypes.NUMBER
        },
        d4: {
            type: DataTypes.NUMBER
        },
        d5: {
            type: DataTypes.NUMBER
        },
    },
    options: { timestamps: true }
}