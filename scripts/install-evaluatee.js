/**
 * Insert defaults
 * Usage: node scripts/install-evaluatee.js
 */
//// Core modules
const path = require('path');

//// External modules
const lodash = require('lodash');
const pigura = require('pigura');

//// Modules


//// First things first
//// Save full path of our root app directory and load config and credentials
global.APP_DIR = path.resolve(__dirname + '/../').replace(/\\/g, '/'); // Turn back slash to slash for cross-platform compat
global.ENV = lodash.get(process, 'env.NODE_ENV', 'dev')

const configLoader = new pigura.ConfigLoader({
    configName: './configs/config.json',
    appDir: APP_DIR,
    env: ENV,
    logging: true
})
global.CONFIG = configLoader.getConfig()

const credLoader = new pigura.ConfigLoader({
    configName: './credentials/credentials.json',
    appDir: APP_DIR,
    env: ENV,
    logging: true
})
global.CRED = credLoader.getConfig()

const dbConn = require('../data/src/db-connect');
let adminsList = require('./install-data/evaluatee-list'); // Do not remove semi-colon


; (async () => {
    let dbInstance = await dbConn.connect()

    try {
        let Evaluatee = require('../data/src/models/evaluatee')('Evaluatee', dbInstance)
        await Evaluatee.drop()
        await Evaluatee.sync()

        console.log('Clearing evaluatees...')

        let logs = []
        let promises = lodash.map(adminsList, (o) => {

            let evaluatee = Evaluatee.build({
                prefix: o.prefix,
                firstName: o.firstName,
                middleName: o.middleName,
                lastName: o.lastName,
                suffix: o.suffix,
                position: o.position,
                gender: o.gender,
                birthDate: o.birthDate,
            });
            logs.push(`"${o.lastName}"`)
            return evaluatee.save()
        })
        await Promise.all(promises)

        console.log(`Inserted ${promises.length} evaluatee(s).`)

    } catch (err) {
        console.error(err)
    } finally {
        dbInstance.close();
    }
})()