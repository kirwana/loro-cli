# Loro CLI

Command-line interface for the Loro Template transformation service.

## Installation

### From NPM (when published)
```bash
npm install -g loro-cli
```

### From Source
```bash
git clone https://github.com/yourusername/loro-cli.git
cd loro-cli
npm install
npm link
```

## Configuration

Before using the CLI, configure your API credentials:

```bash
# Interactive configuration
loro config

# Or set directly
loro config --api-key YOUR_API_KEY
loro config --api-url https://api.lorotemplates.com

# View current configuration
loro config --list
```

Alternatively, you can set environment variables:
- `LORO_API_KEY` - Your Loro API key
- `LORO_API_URL` - Loro API endpoint (default: https://api.lorotemplates.com)

## Usage

### Transform a Template

Transform a local template file with data:

```bash
# Basic transformation
loro transform template.scriban -d data.json

# With output file
loro transform template.scriban -d data.json -o output.txt

# Specify formats
loro transform template.scriban -d data.xml -i xml -f json -o output.json

# Use template from Loro service
loro transform -t template-id-123 -d data.json

# Verbose output
loro transform template.scriban -d data.json --verbose
```

### List Available Templates

```bash
# List templates from Loro service
loro list

# Search templates
loro list -s "invoice"

# Show more templates
loro list -l 20

# Output as JSON
loro list --json
```

### Validate Template Syntax

```bash
# Basic validation
loro validate template.scriban

# Validate with test data
loro validate template.scriban -d test-data.json

# Verbose validation
loro validate template.scriban --verbose
```

## Command Reference

### `loro transform`

Transform a template with provided data.

**Options:**
- `-d, --data <path>` - Path to data file (JSON/XML/text)
- `-o, --output <path>` - Output file path (default: stdout)
- `-f, --format <format>` - Output format: json, xml, text (default: json)
- `-i, --input-format <format>` - Input data format: json, xml, text (default: json)
- `-t, --template-id <id>` - Use template from Loro service
- `-k, --api-key <key>` - API key (overrides config)
- `--api-url <url>` - API URL (overrides config)
- `--verbose` - Show detailed output

### `loro config`

Configure Loro CLI settings.

**Options:**
- `-k, --api-key <key>` - Set API key
- `-u, --api-url <url>` - Set API URL
- `-l, --list` - List current configuration
- `-r, --reset` - Reset to default configuration

### `loro list`

List available templates from Loro service.

**Options:**
- `-l, --limit <number>` - Number of templates to show (default: 10)
- `-s, --search <query>` - Search templates by name or description
- `--json` - Output in JSON format

### `loro validate`

Validate Scriban template syntax.

**Options:**
- `-d, --data <path>` - Optional: Test with sample data
- `--verbose` - Show detailed validation output

## Examples

### Example 1: Simple Template Transformation

Create a template file `greeting.scriban`:
```
Hello {{ name }}!
Today is {{ date }}.
```

Create data file `data.json`:
```json
{
  "name": "John Doe",
  "date": "2024-01-15"
}
```

Transform:
```bash
loro transform greeting.scriban -d data.json
```

Output:
```
Hello John Doe!
Today is 2024-01-15.
```

### Example 2: Invoice Template

```bash
# List available invoice templates
loro list -s invoice

# Use a template from the service
loro transform -t invoice-template-001 -d order-data.json -o invoice.html
```

### Example 3: Batch Processing

```bash
#!/bin/bash
# Process multiple data files with the same template

for datafile in data/*.json; do
  output="${datafile%.json}.html"
  loro transform template.scriban -d "$datafile" -o "$output"
  echo "Processed: $datafile -> $output"
done
```

## Troubleshooting

### API Key Issues
If you get authentication errors:
1. Check your API key: `loro config --list`
2. Ensure the key is valid in your Loro dashboard
3. Try setting the key again: `loro config --api-key YOUR_KEY`

### Network Issues
If you can't reach the API:
1. Check your internet connection
2. Verify the API URL: `loro config --list`
3. Try the default URL: `loro config --api-url https://api.lorotemplates.com`

### Template Syntax Errors
Use the validate command to check templates:
```bash
loro validate template.scriban --verbose
```

## Development

### Running Tests
```bash
npm test
```

### Building
```bash
npm run build
```

### Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT

## Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/loro-cli/issues
- Documentation: https://lorotemplates.com/docs/cli
- Email: support@lorotemplates.com