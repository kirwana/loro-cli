const chalk = require('chalk');
const ora = require('ora');
const LoroClient = require('../lib/loro-client');
const { loadDataFile, writeOutputFile } = require('../utils/file-utils');
const config = require('../utils/config');

module.exports = async function remoteCommand(guid, options) {
  const spinner = ora('Processing remote template').start();

  try {
    // Get API configuration
    const apiConfig = await config.load();
    const apiKey = options.apiKey || apiConfig.apiKey || process.env.LORO_API_KEY;
    const apiUrl = options.apiUrl || apiConfig.apiUrl || 'https://api.lorotemplates.com';

    if (!apiKey) {
      spinner.fail('API key required. Set it with: loro config --api-key YOUR_KEY');
      process.exit(1);
    }

    const client = new LoroClient(apiUrl, apiKey);

    // Load data if provided
    let data = {};
    if (options.data) {
      spinner.text = 'Loading data file...';
      data = await loadDataFile(options.data, options.inputFormat);
    }

    // Get and optionally display template
    if (options.showTemplate) {
      spinner.text = 'Fetching template content...';
      try {
        const template = await client.getTemplate(guid);
        spinner.succeed('Template fetched');
        console.log(chalk.cyan('\n--- Template Content ---'));
        console.log(template.content);
        console.log(chalk.cyan('--- End Template ---\n'));

        // Restart spinner for transformation
        spinner.start('Transforming template...');
      } catch (error) {
        spinner.warn('Could not fetch template content for display');
        spinner.start('Proceeding with transformation...');
      }
    } else {
      spinner.text = 'Transforming template...';
    }

    // Transform using GUID
    const result = await client.transformByGuid(guid, data, {
      outputFormat: options.format || 'json',
      inputFormat: options.inputFormat || 'json'
    });

    spinner.succeed('Template transformed successfully');

    // Handle output
    if (options.output) {
      await writeOutputFile(options.output, result, options.format);
      console.log(chalk.green(`Output written to: ${options.output}`));
    } else {
      console.log(result);
    }

    if (options.verbose) {
      console.log(chalk.dim('\nTransformation details:'));
      console.log(chalk.dim(`- Template GUID: ${guid}`));
      console.log(chalk.dim(`- Input format: ${options.inputFormat || 'json'}`));
      console.log(chalk.dim(`- Output format: ${options.format || 'json'}`));
      console.log(chalk.dim(`- Data file: ${options.data || 'none'}`));
    }

  } catch (error) {
    spinner.fail('Transformation failed');

    if (options.verbose) {
      console.error(chalk.red('\nError details:'), error.message);
      if (error.response) {
        console.error(chalk.red('Status:'), error.response.status);
        console.error(chalk.red('Response:'), error.response.data);
      }
    } else {
      console.error(chalk.red('Error:'), error.message);
    }

    process.exit(1);
  }
};