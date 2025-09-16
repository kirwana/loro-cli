const fs = require('fs').promises;
const path = require('path');

async function loadDataFile(filePath, format) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const detectedFormat = format || detectFormat(filePath, content);

    switch (detectedFormat) {
      case 'json':
        return JSON.parse(content);
      case 'xml':
        // For XML, return as string (the API will handle XML parsing)
        return content;
      case 'text':
      default:
        // For text, return as is
        return content;
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Data file not found: ${filePath}`);
    } else if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in data file: ${error.message}`);
    }
    throw error;
  }
}

function detectFormat(filePath, content) {
  // Try to detect by file extension
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.json':
      return 'json';
    case '.xml':
      return 'xml';
    case '.txt':
      return 'text';
  }

  // Try to detect by content
  const trimmed = content.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json';
  } else if (trimmed.startsWith('<?xml') || trimmed.startsWith('<')) {
    return 'xml';
  }

  return 'text';
}

function formatOutput(data, format) {
  switch (format) {
    case 'json':
      if (typeof data === 'string') {
        try {
          // Try to parse and pretty-print JSON
          return JSON.stringify(JSON.parse(data), null, 2);
        } catch {
          return data;
        }
      }
      return JSON.stringify(data, null, 2);

    case 'xml':
    case 'text':
    default:
      return typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
  }
}

module.exports = {
  loadDataFile,
  detectFormat,
  formatOutput
};