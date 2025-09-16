const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const chalk = require('chalk');
const inquirer = require('inquirer');

const CONFIG_PATH = path.join(os.homedir(), '.loro-cli-config.json');

async function configCommand(options) {
  try {
    // Load existing config or create default
    let config = await loadConfig();

    if (options.list) {
      // Display current configuration
      console.log(chalk.cyan('Current Loro CLI Configuration:'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(`API Key: ${config.apiKey ? chalk.green('***' + config.apiKey.slice(-4)) : chalk.yellow('Not set')}`);
      console.log(`API URL: ${chalk.blue(config.apiUrl)}`);
      console.log(`Config file: ${chalk.gray(CONFIG_PATH)}`);
      return;
    }

    if (options.reset) {
      // Reset to default configuration
      config = getDefaultConfig();
      await saveConfig(config);
      console.log(chalk.green('✓ Configuration reset to defaults'));
      return;
    }

    // Interactive configuration if no options provided
    if (!options.apiKey && !options.apiUrl) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'apiKey',
          message: 'Enter your Loro API key:',
          default: config.apiKey,
          validate: (input) => {
            if (!input && !config.apiKey) {
              return 'API key is required';
            }
            return true;
          }
        },
        {
          type: 'input',
          name: 'apiUrl',
          message: 'Enter Loro API URL:',
          default: config.apiUrl
        }
      ]);

      config.apiKey = answers.apiKey || config.apiKey;
      config.apiUrl = answers.apiUrl || config.apiUrl;
    } else {
      // Update specific values from options
      if (options.apiKey) {
        config.apiKey = options.apiKey;
      }
      if (options.apiUrl) {
        config.apiUrl = options.apiUrl;
      }
    }

    // Save configuration
    await saveConfig(config);
    console.log(chalk.green('✓ Configuration saved successfully'));

  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

async function loadConfig() {
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Return default config if file doesn't exist
    return getDefaultConfig();
  }
}

async function saveConfig(config) {
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function getDefaultConfig() {
  return {
    apiKey: process.env.LORO_API_KEY || '',
    apiUrl: process.env.LORO_API_URL || 'https://api.lorotemplates.com'
  };
}

// Export config loader for use in other commands
configCommand.loadConfig = loadConfig;

module.exports = configCommand;