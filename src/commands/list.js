const chalk = require('chalk');
const ora = require('ora');
const LoroClient = require('../lib/loro-client');
const config = require('../utils/config');

async function listCommand(options) {
  const spinner = ora('Fetching templates...').start();

  try {
    // Load configuration
    const configData = await config.load();

    if (!configData.apiKey) {
      spinner.fail('API key not configured');
      console.log(chalk.yellow('\nPlease configure your API key first:'));
      console.log(chalk.gray('  loro config --api-key YOUR_API_KEY'));
      process.exit(1);
    }

    // Initialize client and fetch templates
    const client = new LoroClient(configData.apiUrl, configData.apiKey);
    const templates = await client.listTemplates({
      limit: parseInt(options.limit),
      search: options.search
    });

    spinner.succeed(`Found ${templates.length} template(s)`);

    if (options.json) {
      // Output as JSON
      console.log(JSON.stringify(templates, null, 2));
    } else {
      // Format as table
      if (templates.length === 0) {
        console.log(chalk.yellow('No templates found'));
        return;
      }

      console.log('\n' + chalk.cyan('Available Templates:'));
      console.log(chalk.gray('─'.repeat(80)));

      templates.forEach((template, index) => {
        console.log(`\n${chalk.bold(`${index + 1}. ${template.name}`)} ${chalk.gray(`(ID: ${template.id})`)}`);
        if (template.description) {
          console.log(`   ${chalk.gray(template.description)}`);
        }
        console.log(`   ${chalk.green('Created:')} ${new Date(template.createdAt).toLocaleDateString()}`);
        if (template.tags && template.tags.length > 0) {
          console.log(`   ${chalk.blue('Tags:')} ${template.tags.join(', ')}`);
        }
      });

      console.log('\n' + chalk.gray('─'.repeat(80)));
      console.log(chalk.gray(`Use 'loro transform -t <template-id>' to use a template`));
    }

  } catch (error) {
    spinner.fail('Failed to fetch templates');
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

module.exports = listCommand;