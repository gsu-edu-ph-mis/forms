/**
 * Usage:
 * 
 * node scripts/generate/_gen.js --model=data\src\models\form.js  --route=data\src\routes\admin\form.js --view=data\view\admin\form --baseRoute=admin
 * node scripts/generate/_gen.js --model=data\src\models\evaluatee.js  --route=data\src\routes\admin\evaluatee.js --view=data\view\admin\evaluatee --baseRoute=admin
 * node scripts/generate/_gen.js --model=data\src\models\college.js  --route=data\src\routes\admin\college.js --view=data\view\admin\college --baseRoute=admin
 * node scripts/generate/_gen.js --model=data\src\models\program.js  --route=data\src\routes\admin\program.js --view=data\view\admin\programs --baseRoute=admin
 * node scripts/generate/_gen.js --model=data\src\models\user.js  --route=data\src\routes\admin\user.js --view=data\view\admin\users --baseRoute=admin
 * 
 */
//// Core modules
const path = require('path')

//// External modules
const lodash = require('lodash')
const commandLineArgs = require('command-line-args');

//// Modules
const pigura = require('pigura')


//// First things first
//// Save full path of our root app directory and load config and credentials
global.APP_DIR = path.resolve(__dirname + '/../../').replace(/\\/g, '/'); // Turn back slash to slash for cross-platform compat

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

const dbConn = require(`${APP_DIR}/data/src/db-connect`);
// const { verbose } = require('sqlite3');

const optionDefinitions = [
    { name: 'model', type: String},
    { name: 'view', type: String},
    { name: 'route', type: String},

    { name: 'baseRoute', type: String},
    { name: 'output', type: String},
]
    ;
(async () => {
    let dbInstance = await dbConn.connect()

    try {
        const fs = require('fs');
        const defo = {
            model: '',
            view: '',
            route: '',
            baseRoute: '',
            output: '',
        }
        let options = commandLineArgs(optionDefinitions)
        options = { ...defo, ...options } // Mege

        // console.log(options)

        if(!options.model){
            throw new Error('Missing model.')
        }
        if(!options.view){
            throw new Error('Missing view.')
        }
        if(!options.route){
            throw new Error('Missing route.')
        }

        const modelPath = `${APP_DIR}/${options.model.replace(/\\/g, '/')}`
        const VIEW_DIR = `${APP_DIR}/${options.view.replace(/\\/g, '/')}`
        const ROUTE_PATH = `${APP_DIR}/${options.route.replace(/\\/g, '/')}`

        const modelFileBaseName = path.basename(modelPath, '.js')
        const modelVarName = lodash.camelCase(modelFileBaseName) // Camel Case: RegistrationForm => registrationForm // Useful for variable names
        const modelUrlFriend = lodash.kebabCase(modelFileBaseName) // Kebab or Param Case: RegistrationForm => registration-form // Useful for URLs
        const modelSpaceCase = lodash.startCase(modelFileBaseName) // Kebab or Param Case: RegistrationForm => Registration Form // Useful for titles and text messages
        const modelNoSpaceCase = modelSpaceCase.replace(' ', '')

        console.log({
            ...options,
            modelPath,
            VIEW_DIR,
            ROUTE_PATH,
            modelFileBaseName,
            modelVarName,
            modelUrlFriend,
            modelSpaceCase,
        })

        let modelInstance = require(`${modelPath}`)(`${modelNoSpaceCase}`, dbInstance)

        let attributes = modelInstance.getAttributes()
        
        let fields = lodash.mapValues(attributes, (f, key) => {
            f.typeName = f.type.constructor.name
            f.inputType = 'text'
            if (f.typeName !== 'STRING') {
                f.inputType = 'text'
            }
            if (f.typeName === 'JSONTYPE') {
                f.inputType = 'number'
            }
            if (f.typeName === 'DATE' || f.typeName === 'DATEONLY') {
                f.inputType = 'date'
            }
            if (f.typeName === 'ENUM') {
                f.inputType = 'select'
                f.selectOptions = f.values
            }
            if (f.__hidden) {
                f.inputType = 'hidden'
            }
            
            return f
        })
        fields = lodash.pickBy(fields, (f, key) => {
            return !['id', 'createdAt', 'updatedAt', 'deletedAt'].includes(key)
        })

        // console.log(fields)

        const nunjucksEnv = require(`${APP_DIR}/scripts/generate/view/nunjucks-env`)

        const SRC_DIR = `${APP_DIR}/scripts/generate/view/_generic`

        // All
        fs.writeFileSync(`${VIEW_DIR}/all.html`, nunjucksEnv.render(`${SRC_DIR}/all.html`, {
            ...options,
            modelVarName,
            modelUrlFriend,
            modelSpaceCase,
            fields: fields
        }))
        console.log(`Created ${VIEW_DIR}/all.html`)

        // Create
        fs.writeFileSync(`${VIEW_DIR}/create.html`, nunjucksEnv.render(`${SRC_DIR}/create.html`, {
            ...options,
            modelVarName,
            modelUrlFriend,
            modelSpaceCase,
            fields: fields
        }))
        console.log(`Created ${VIEW_DIR}/create.html`)

        // Update
        fs.writeFileSync(`${VIEW_DIR}/update.html`, nunjucksEnv.render(`${SRC_DIR}/update.html`, {
            ...options,
            modelVarName,
            modelUrlFriend,
            modelSpaceCase,
            fields: fields
        }))
        console.log(`Created ${VIEW_DIR}/update.html`)

        // Delete
        fs.writeFileSync(`${VIEW_DIR}/delete.html`, nunjucksEnv.render(`${SRC_DIR}/delete.html`, {
            ...options,
            modelVarName,
            modelUrlFriend,
            modelSpaceCase,
            fields: fields
        }))
        console.log(`Created ${VIEW_DIR}/delete.html`)


        // Route
        fs.writeFileSync(`${ROUTE_PATH}`, nunjucksEnv.render(`${SRC_DIR}/routes.html`, {
            ...options,
            modelVarName,
            modelUrlFriend,
            modelSpaceCase,
            modelNoSpaceCase,
            fields: fields
        }))
        console.log(`Created ${ROUTE_PATH}`)
        
        
        // const OUT_DIR = options.output ?? `${APP_DIR}/scripts/generate/output/${modelUrlFriend}`
        // fs.mkdirSync(OUT_DIR, { recursive: true });

        // // Controller
        // fs.writeFileSync(`${OUT_DIR}/${modelUrlFriend}.js`, nunjucksEnv.render(`${SRC_DIR}/routes.html`, {
        //     ...options,
        //     modelVarName,
        //     modelUrlFriend,
        //     modelSpaceCase,
        // }))

        // console.log(`Go to: ${OUT_DIR}/${modelUrlFriend}.js`)

    } catch (err) {
        console.error(err)
    } finally {
        dbInstance.close();
    }
})()