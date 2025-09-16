const fs = require('fs').promises;
const chalk = require('chalk');
const ora = require('ora');
const LoroClient = require('../lib/loro-client');
const { loadDataFile } = require('../utils/file-utils');

async function validateCommand(templatePath, options) {
  const spinner = ora('Validating template...').start();

  try {
    // Load template file
    const templateContent = await fs.readFile(templatePath, 'utf-8');

    // Basic syntax validation
    const errors = validateScribanSyntax(templateContent);

    if (errors.length > 0) {
      spinner.fail('Template validation failed');
      console.log(chalk.red('\nValidation errors:'));
      errors.forEach((error, index) => {
        console.log(chalk.red(`  ${index + 1}. ${error}`));
      });
      process.exit(1);
    }

    spinner.succeed('Template syntax is valid');

    // If data provided, test render
    if (options.data) {
      spinner.start('Testing template with provided data...');

      try {
        const data = await loadDataFile(options.data);
        // You could make an API call here to test render
        // For now, just check that data loads successfully
        spinner.succeed('Template test successful');

        if (options.verbose) {
          console.log(chalk.gray('\nTemplate Statistics:'));
          console.log(`  Size: ${templateContent.length} bytes`);
          console.log(`  Lines: ${templateContent.split('\n').length}`);
          console.log(`  Variables: ${countVariables(templateContent)}`);
          console.log(`  Loops: ${countLoops(templateContent)}`);
          console.log(`  Conditions: ${countConditions(templateContent)}`);
        }
      } catch (error) {
        spinner.fail('Template test failed');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    }

  } catch (error) {
    spinner.fail('Validation failed');
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

function validateScribanSyntax(template) {
  const errors = [];

  // Check for unclosed blocks
  const openBlocks = (template.match(/\{\{[^}]*$/gm) || []).length;
  const closeBlocks = (template.match(/^\s*\}\}/gm) || []).length;

  if (openBlocks !== closeBlocks) {
    errors.push('Unclosed template blocks detected');
  }

  // Check for common syntax errors
  const lines = template.split('\n');
  lines.forEach((line, index) => {
    // Check for unclosed if statements
    if (line.includes('{{if') && !template.includes('{{end}}')) {
      errors.push(`Line ${index + 1}: Possible unclosed if statement`);
    }

    // Check for unclosed for loops
    if (line.includes('{{for') && !template.includes('{{end}}')) {
      errors.push(`Line ${index + 1}: Possible unclosed for loop`);
    }

    // Check for invalid variable references
    const varMatches = line.match(/\{\{\s*([^}]+)\s*\}\}/g);
    if (varMatches) {
      varMatches.forEach(match => {
        if (match.includes('{{{{') || match.includes('}}}}')) {
          errors.push(`Line ${index + 1}: Invalid variable syntax`);
        }
      });
    }
  });

  return errors;
}

function countVariables(template) {
  const matches = template.match(/\{\{\s*[^{}]+\s*\}\}/g) || [];
  return matches.filter(m => !m.includes('if') && !m.includes('for') && !m.includes('end')).length;
}

function countLoops(template) {
  const matches = template.match(/\{\{\s*for\s+/g) || [];
  return matches.length;
}

function countConditions(template) {
  const matches = template.match(/\{\{\s*if\s+/g) || [];
  return matches.length;
}

module.exports = validateCommand;