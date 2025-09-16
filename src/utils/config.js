const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const CONFIG_FILE = path.join(os.homedir(), '.loro-cli-config.json');

const DEFAULT_CONFIG = {
  apiKey: null,
  apiUrl: 'https://api.lorotemplates.com'
};

async function load() {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return DEFAULT_CONFIG;
    }
    throw error;
  }
}

async function save(config) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  await fs.writeFile(CONFIG_FILE, JSON.stringify(mergedConfig, null, 2));
  return mergedConfig;
}

async function reset() {
  try {
    await fs.unlink(CONFIG_FILE);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
  return DEFAULT_CONFIG;
}

module.exports = {
  load,
  save,
  reset,
  CONFIG_FILE
};