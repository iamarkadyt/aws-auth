require('colors')

const { login, run, config, pwd, web, reset, logout, list } = require('./actions')
const { CLI_NAME, CLI_VERSION } = require('./config')

const helpMessage = `Usage: ${`${CLI_NAME} <command>`.cyan}

Commands:
  ${`${CLI_NAME} config`.cyan}
    Use this command to configure this CLI with your HUB account credentials to enable authentication
    into downstream AWS accounts.
    
  ${`${CLI_NAME} web`.cyan}
      Use this command to authenticate into an AWS environment under a selected role in your browser.
      To use this command make sure you are logged into the HUB account in your browser first.  

  ${`${CLI_NAME} login`.cyan}
    Use this command to authenticate into an AWS environment under a selected role for programmatic
    access. Note: this only enables access to AWS through the '${CLI_NAME} run' command.
    
  ${`${CLI_NAME} logout`.cyan}
    Use this command to delete any previously written temporary AWS credentials from disk. This may
    be used as a security practice to leave no credentials behind after you're done with your work.
    
  ${`${CLI_NAME} list`.cyan}
    Use this command to list all active or expired sessions. Expired sessions are usually automatically
    removed when you run other commands that work with sessions. This command always shows all of them.

  ${`${CLI_NAME} pwd`.cyan}
    Use this command to manage the encryption passphrase that protects configuration files that store
    your AWS credential information.

  ${`${CLI_NAME} run -- <cmd>`.cyan}
    Once authenticated, use this command to run other commands with access to AWS. Access is exposed
    through variable injection which is much more secure than using plain text '~/.aws/credentials'
    file.

  ${`${CLI_NAME} reset`.cyan}
    Use this command to erase all CLI configuration files from disk. It may be useful if you messed
    something up during configuration and want to start from scratch.

  ${`${CLI_NAME} help`.cyan}
    Use this command to show this help message.

  ${`${CLI_NAME} version`.cyan}
    Use this command to print the CLI version.

Documentation and support: https://github.com/iamarkadyt/${CLI_NAME}`

function main() {
    const [command, ...args] = process.argv.slice(2)

    if (!command) {
        console.log(helpMessage)
        console.log('\nExpected to be invoked with a command but got none'.red)
        process.exit(1)
    }

    switch (command) {
        case 'help':
            console.log(helpMessage)
            process.exit(0)
        case 'version':
            console.log(CLI_VERSION)
            process.exit(0)
        case 'config':
            return config()
        case 'login':
            return login()
        case 'web':
            return web()
        case 'logout':
            return logout()
        case 'list':
            return list()
        case 'pwd':
            return pwd()
        case 'reset':
            return reset()
        case 'run':
            return run(args.slice(args.indexOf('--') + 1, args.length))
        default:
            console.log(helpMessage)
            console.log(`\nUnknown command '${command}'`.red)
            process.exit(1)
    }
}

module.exports = { main }
