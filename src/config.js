const os = require('os')
const path = require('path')

/* eslint-disable import/newline-after-import */
const CLI_NAME = require('../package.json').name.split('/').pop()
const CLI_VERSION = require('../package.json').version

const globalConfig = {
    cliDir: path.join(os.homedir(), `.${CLI_NAME}`),
    cliConfigPath: path.join(os.homedir(), `.${CLI_NAME}`, 'config.json'),
    awsCredPath: path.join(os.homedir(), '.aws/credentials'),
    awsConfigPath: path.join(os.homedir(), '.aws/config'),
}

module.exports = { globalConfig, CLI_NAME, CLI_VERSION }
