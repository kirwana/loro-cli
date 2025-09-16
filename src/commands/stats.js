const chalk = require('chalk');
const ora = require('ora');
const LoroClient = require('../lib/loro-client');
const config = require('../utils/config');

async function statsCommand(options) {
  const spinner = ora('Fetching usage statistics...').start();

  try {
    // Load configuration
    const configData = await config.load();

    if (!configData.apiKey) {
      spinner.fail('API key not configured');
      console.log(chalk.yellow('\nPlease configure your API key first:'));
      console.log(chalk.gray('  loro config --api-key YOUR_API_KEY'));
      process.exit(1);
    }

    const client = new LoroClient(configData.apiUrl, configData.apiKey);

    // Fetch usage statistics from API
    const stats = await client.getUsageStats();

    spinner.succeed('Usage statistics fetched');

    if (options.json) {
      // Output as JSON
      console.log(JSON.stringify(stats, null, 2));
    } else {
      // Format as readable output
      console.log('\n' + chalk.cyan('Loro CLI Usage Statistics'));
      console.log(chalk.gray('═'.repeat(50)));

      // API Usage Stats
      if (stats.api) {
        console.log('\n' + chalk.bold('API Usage:'));
        console.log(`  Total API calls: ${chalk.green(stats.api.totalCalls || 0)}`);
        console.log(`  Templates rendered: ${chalk.green(stats.api.templatesRendered || 0)}`);
        console.log(`  Data processed: ${chalk.green(formatBytes(stats.api.dataProcessed || 0))}`);
        console.log(`  Rate limit remaining: ${chalk.yellow(stats.api.rateLimitRemaining || 'N/A')}`);
        console.log(`  Rate limit reset: ${chalk.gray(stats.api.rateLimitReset || 'N/A')}`);
      }

      // Template Usage Stats
      if (stats.templates) {
        console.log('\n' + chalk.bold('Template Usage:'));
        console.log(`  Most used template: ${chalk.blue(stats.templates.mostUsed?.name || 'N/A')}`);
        console.log(`  Total unique templates: ${chalk.green(stats.templates.uniqueCount || 0)}`);
        console.log(`  Average render time: ${chalk.yellow(stats.templates.avgRenderTime || 'N/A')}ms`);
      }

      // Recent Activity
      if (stats.recent && stats.recent.length > 0) {
        console.log('\n' + chalk.bold('Recent Activity:'));
        stats.recent.slice(0, 5).forEach((activity, index) => {
          const time = new Date(activity.timestamp).toLocaleString();
          console.log(`  ${index + 1}. ${chalk.cyan(activity.action)} - ${chalk.gray(time)}`);
          if (activity.template) {
            console.log(`     Template: ${chalk.blue(activity.template.name || activity.template.id)}`);
          }
        });
      }

      // Account Info
      if (stats.account) {
        console.log('\n' + chalk.bold('Account Information:'));
        console.log(`  Plan: ${chalk.green(stats.account.plan || 'Free')}`);
        console.log(`  API calls this month: ${chalk.yellow(stats.account.monthlyUsage || 0)}`);
        console.log(`  API call limit: ${chalk.yellow(stats.account.monthlyLimit || 'Unlimited')}`);

        if (stats.account.monthlyLimit) {
          const percentage = ((stats.account.monthlyUsage || 0) / stats.account.monthlyLimit * 100).toFixed(1);
          const color = percentage > 80 ? chalk.red : percentage > 60 ? chalk.yellow : chalk.green;
          console.log(`  Usage percentage: ${color(percentage + '%')}`);
        }
      }

      // System Info
      console.log('\n' + chalk.bold('CLI Information:'));
      console.log(`  API Endpoint: ${chalk.blue(configData.apiUrl)}`);
      console.log(`  API Key: ${chalk.gray('***' + (configData.apiKey?.slice(-4) || 'none'))}`);
      console.log(`  CLI Version: ${chalk.green(require('../../package.json').version)}`);

      if (options.verbose) {
        console.log('\n' + chalk.bold('Detailed Statistics:'));
        console.log(chalk.gray(JSON.stringify(stats, null, 2)));
      }
    }

  } catch (error) {
    spinner.fail('Failed to fetch usage statistics');

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
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = statsCommand;