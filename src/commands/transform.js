const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const LoroClient = require('../lib/loro-client');
const { loadDataFile, formatOutput } = require('../utils/file-utils');

async function transformCommand(templatePath, options) {
  const spinner = ora('Processing template transformation').start();

  try {
    // Initialize Loro client
    const client = new LoroClient(options.apiUrl, options.apiKey);

    // Load data if provided
    let data = {};
    if (options.data) {
      spinner.text = 'Loading data file...';
      data = await loadDataFile(options.data, options.inputFormat);
    }

    // Handle different template sources
    let result;
    let templateContent;

    if (options.guid) {
      // Use GUID directly for transformation
      spinner.text = 'Transforming with remote template...';
      result = await client.transformByGuid(options.guid, data, {
        inputFormat: options.inputFormat || 'json',
        outputFormat: options.format || 'json'
      });
    } else {
      // Load template content first
      if (options.templateId) {
        // Use template ID from Loro service
        spinner.text = 'Fetching template from Loro service...';
        templateContent = await client.getTemplate(options.templateId);
      } else {
        // Load local template file
        spinner.text = 'Loading template file...';
        templateContent = await fs.readFile(templatePath, 'utf-8');
      }

      // Transform the template
      spinner.text = 'Transforming template...';
      result = await client.transform({
        template: templateContent,
        data: data,
        inputFormat: options.inputFormat || 'json',
        outputFormat: options.format || 'json'
      });
    }

    spinner.succeed('Template transformation completed');

    // Format and output the result
    const formattedOutput = formatOutput(result, options.format || 'json');

    if (options.output) {
      // Write to file
      await fs.writeFile(options.output, formattedOutput);
      console.log(chalk.green(`✓ Output written to: ${options.output}`));
    } else {
      // Output to stdout
      console.log('\n' + chalk.gray('--- Output ---'));
      console.log(formattedOutput);
    }

    if (options.verbose) {
      console.log('\n' + chalk.gray('--- Statistics ---'));
      if (options.guid) {
        console.log(`Template GUID: ${options.guid}`);
      } else if (templateContent) {
        console.log(`Template size: ${templateContent.length} bytes`);
      }
      console.log(`Data size: ${JSON.stringify(data).length} bytes`);
      console.log(`Output size: ${formattedOutput.length} bytes`);
    }

  } catch (error) {
    spinner.fail('Transformation failed');
    console.error(chalk.red('Error:'), error.message);
    if (options.verbose) {
      console.error(chalk.gray('Stack trace:'), error.stack);
    }
    process.exit(1);
  }
}

module.exports = transformCommand;