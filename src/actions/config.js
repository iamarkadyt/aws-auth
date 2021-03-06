const fs = require('fs')
const open = require('open')
const { ConfUtils, Utils, SchemaUtils } = require('../helpers')
const { globalConfig } = require('../config')

const Action = Object.freeze({
    CREATE_NEW: Symbol('CREATE_NEW'),
    DELETE_ONE: Symbol('DELETE_ONE'),
    EXIT_CLI: Symbol('EXIT_CLI'),
})

/**
 * Asks user to provide AWS configuration: region, secret key and key id.
 *
 * @param {*} profile (optional) profile to lookup existing configuration from
 * @returns aws configuration, as user provides it
 */
async function getAwsConfig(profile = {}) {
    const { accessKeyId } = await Utils.prompts({
        type: 'text',
        name: 'accessKeyId',
        message: 'Enter your AWS_ACCESS_KEY_ID',
        initial: Utils.lodashGet(profile, `awsCredentials.accessKeyId`),
    })
    const { secretAccessKey } = await Utils.prompts({
        type: 'text',
        name: 'secretAccessKey',
        message: 'Enter your AWS_SECRET_ACCESS_KEY',
        initial: Utils.lodashGet(profile, `awsCredentials.secretAccessKey`),
    })

    return { accessKeyId, secretAccessKey }
}

/**
 * Asks user to provide dowstream enviornment configuration (region, accountId, name etc.)
 * in JSON format.
 *
 * @param {*} profile (optional) profile to lookup existing configuration from
 * @returns environments configuration, as user provides it, otherwise null
 */
async function getEnvironments(profile = {}) {
    let result = null
    const existing = Utils.lodashGet(profile, `environments`, [])

    const { editNow } = await Utils.prompts({
        type: 'confirm',
        name: 'editNow',
        message: `${existing.length ? 'Edit' : 'Set up'} AWS environment configuration?`,
    })

    if (editNow) {
        // create the file and open for edit
        const starter = { environments: existing }
        fs.writeFileSync(globalConfig.cliInputFiles.json, JSON.stringify(starter, null, 4), { flag: 'w' })

        let passingConfig = false
        while (!passingConfig) {
            await open(globalConfig.cliInputFiles.json)

            // setup manual return listener
            await Utils.prompts({
                type: 'invisible',
                name: 'hasReturned',
                message: ["Press ENTER when you've finished editing the file TO CONTINUE"],
            })

            // parse input
            try {
                const userInput = JSON.parse(fs.readFileSync(globalConfig.cliInputFiles.json))
                SchemaUtils.validate(userInput, SchemaUtils.schemas.environments)
                passingConfig = true
                result = userInput.environments
            } catch (error) {
                if (error.name === 'SyntaxError' || error.name === 'ValidationError') {
                    console.log(`Bad JSON structure: ${error.message}`.red)
                    console.log('Please check out examples in documentation and try again'.red)
                } else {
                    throw error
                }
            }
        }
        // cleanup for security
        const content = { environments: [] }
        fs.writeFileSync(globalConfig.cliInputFiles.json, JSON.stringify(content, null, 4), { flag: 'w' })
    }

    return result
}

/**
 * CLI 'config' command handler.
 */
async function config(actionConfig) {
    const [cliConfig, passphrase] = actionConfig
    let profiles = Utils.lodashGet(cliConfig, 'profiles', [])

    /* build the menu */

    const choices = [{ title: 'Create new profile', value: Action.CREATE_NEW }]
    if (profiles.length) {
        choices.push({ title: 'Delete a profile', value: Action.DELETE_ONE })
        choices.push(...profiles.map((p, i) => ({ title: `Configure profile: ${p.name}`, value: i })))
    }
    choices.push({ title: 'Exit this CLI', value: Action.EXIT_CLI })
    const { selection } = await Utils.prompts({
        type: 'select',
        name: 'selection',
        message: 'Select an action',
        choices,
    })

    /* handle exit action */

    if (selection === Action.EXIT_CLI) {
        process.exit(0)
    }

    /* handle delete action */

    if (selection === Action.DELETE_ONE) {
        const { toDelete } = await Utils.prompts({
            type: 'select',
            name: 'toDelete',
            message: 'Select a profile to delete',
            choices: profiles.map((p, i) => ({ title: p.name, value: i })),
        })
        const { hasConfirmed } = await Utils.prompts({
            type: 'confirm',
            name: 'hasConfirmed',
            message: `Are you sure? This action is irreversible`,
        })
        if (hasConfirmed) {
            profiles = profiles.filter((el, i) => i !== toDelete)
            cliConfig.profiles = profiles
            await ConfUtils.saveCliConfig(cliConfig, passphrase)
            console.log('Profile was successfully deleted'.green)
        }
        return
    }

    /* handle create or edit actions */

    let profile
    if (selection === Action.CREATE_NEW) {
        const { profileName } = await Utils.prompts({
            type: 'text',
            name: 'profileName',
            message: 'Enter the name for the new profile',
            initial: 'default',
            validate: (name) =>
                profiles.find((p) => p.name === name) ? `Profile already exists. Choose a different name` : true,
        })

        profile = { name: profileName }
        profiles.push(profile)
    } else {
        profile = profiles[selection]
    }
    const awsCredentials = await getAwsConfig(profile)
    profile.awsCredentials = awsCredentials

    const environments = await getEnvironments(profile)
    profile.environments = environments || []

    cliConfig.profiles = profiles
    await ConfUtils.saveCliConfig(cliConfig, passphrase)

    if (selection === Action.CREATE_NEW) {
        console.log('Profile was successfully created'.green)
    }
}

// TODO this could probably become a helper
async function repeatAction() {
    const actionConfig = await ConfUtils.loadCliConfig()
    /* eslint-disable no-constant-condition */
    while (true) {
        await config(actionConfig)
    }
}

module.exports = { config: repeatAction }
