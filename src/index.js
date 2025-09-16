#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const packageJson = require('../package.json');
const transformCommand = require('./commands/transform');
const configCommand = require('./commands/config');
const listCommand = require('./commands/list');
const validateCommand = require('./commands/validate');
const statsCommand = require('./commands/stats');

// Main CLI setup
program
  .name('loro')
  .description(chalk.cyan('Loro CLI - Transform templates with the Loro Template Service'))
  .version(packageJson.version, '-v, --version', 'Output the current version')
  .helpOption('-h, --help', 'Display help information');

// Transform command - main functionality
program
  .command('transform [template]')
  .description('Transform a template with provided data')
  .option('-d, --data <path>', 'Path to JSON/XML data file')
  .option('-o, --output <path>', 'Output file path (default: stdout)')
  .option('-f, --format <format>', 'Output format: json, xml, text (default: json)')
  .option('-i, --input-format <format>', 'Input data format: json, xml, text (default: json)')
  .option('-t, --template-id <id>', 'Use a template ID from Loro service instead of local file')
  .option('-g, --guid <guid>', 'Use a template GUID from Loro service')
  .option('-k, --api-key <key>', 'API key for Loro service (or set LORO_API_KEY env variable)')
  .option('--api-url <url>', 'Loro API URL (default: https://api.lorotemplates.com)')
  .option('--verbose', 'Show detailed output')
  .action(transformCommand);

// Config command - manage API configuration
program
  .command('config')
  .description('Configure Loro CLI settings')
  .option('-k, --api-key <key>', 'Set API key')
  .option('-u, --api-url <url>', 'Set API URL')
  .option('-l, --list', 'List current configuration')
  .option('-r, --reset', 'Reset configuration to defaults')
  .action(configCommand);

// List command - list available templates
program
  .command('list')
  .description('List available templates from Loro service')
  .option('-l, --limit <number>', 'Number of templates to show', '10')
  .option('-s, --search <query>', 'Search templates by name or description')
  .option('--json', 'Output in JSON format')
  .action(listCommand);

// Validate command - validate template syntax
program
  .command('validate <template>')
  .description('Validate a Scriban template syntax')
  .option('-d, --data <path>', 'Optional: Test with sample data')
  .option('--verbose', 'Show detailed validation output')
  .action(validateCommand);

// Remote command - use remote template by GUID
program
  .command('remote <guid>')
  .description('Transform using a remote template by GUID')
  .option('-d, --data <path>', 'Path to JSON/XML data file')
  .option('-o, --output <path>', 'Output file path (default: stdout)')
  .option('-f, --format <format>', 'Output format: json, xml, text (default: json)')
  .option('-i, --input-format <format>', 'Input data format: json, xml, text (default: json)')
  .option('-k, --api-key <key>', 'API key for Loro service (or set LORO_API_KEY env variable)')
  .option('--api-url <url>', 'Loro API URL (default: https://api.lorotemplates.com)')
  .option('--verbose', 'Show detailed output')
  .option('--show-template', 'Display the template content before transformation')
  .action(require('./commands/remote'));

// Stats command - show usage statistics
program
  .command('stats')
  .description('Show usage statistics and account information')
  .option('--json', 'Output in JSON format')
  .option('--verbose', 'Show detailed statistics')
  .action(statsCommand);

// Parse command-line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}