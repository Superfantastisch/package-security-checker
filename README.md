# Package Security Checker

This tool initially runs package checks based on the affected packages list from the source: [@https://socket.dev/blog/ongoing-supply-chain-attack-targets-crowdstrike-npm-packages](https://socket.dev/blog/ongoing-supply-chain-attack-targets-crowdstrike-npm-packages)
It is possible, that the list is currently not up to date.

> **⚠️ DISCLAIMER**: This tool is provided as-is without any guarantees. I cannot guarantee that it will work correctly or find all affected packages. This is a recommendation tool, not a guarantee of security. I will not be responsible for any damages or costs arising from affected npm packages. Use this tool as part of a comprehensive security strategy, not as your only security measure.

A Node.js CLI tool that scans your `package-lock.json` file to detect packages that may contain malware or security vulnerabilities. This tool checks your installed packages against a curated list of known affected packages.

## Features

- 🔍 **Comprehensive Scanning**: Analyzes all packages in your `package-lock.json` file
- ⚠️ **Security Detection**: Identifies packages from a curated list of known affected packages
- 📊 **Detailed Reporting**: Shows total packages scanned and affected packages found
- 🚨 **Exit Codes**: Returns appropriate exit codes for CI/CD integration
- 📁 **Flexible Input**: Accepts both file paths and directory paths
- 🎯 **Precise Matching**: Uses exact package name and version matching

## Installation

### Prerequisites

- Node.js (version 14 or higher)
- npm

### Using with npx (Recommended)

Once published to npm, you can use this tool directly with `npx` without installing it:

```bash
# Check a specific package-lock.json file
npx package-security-checker ./package-lock.json

# Check package-lock.json in a directory
npx package-security-checker /path/to/project/

# Check current directory's package-lock.json
npx package-security-checker .

# Show help
npx package-security-checker --help
```

### Global Installation (Optional)

If you plan to use this tool frequently, you can install it globally:

```bash
npm install -g package-security-checker
```

Then use it directly:

```bash
package-security-checker ./package-lock.json
```

### Local Installation (Optional)

You can also install it locally in a project:

```bash
npm install package-security-checker
npx package-security-checker ./package-lock.json
```

### Development Installation

For development or if you want to build from source:

#### Install Dependencies

```bash
npm install
```

#### Build the Project

```bash
npm run build
```

## Usage

### Basic Usage (with npx)

```bash
# Check a specific package-lock.json file
npx package-security-checker ./package-lock.json

# Check package-lock.json in a directory
npx package-security-checker /path/to/project/

# Check current directory's package-lock.json
npx package-security-checker .

# Show help
npx package-security-checker --help
```

### Command Line Options

```bash
# Show help
npx package-security-checker --help
npx package-security-checker -h
```

### Examples

```bash
# Check the package-lock.json in your current project
npx package-security-checker ./package-lock.json

# Check a different project's package-lock.json
npx package-security-checker /path/to/another/project/package-lock.json

# Check by providing just the directory (tool will look for package-lock.json)
npx package-security-checker /path/to/project/

# Check a specific file with absolute path
npx package-security-checker /absolute/path/to/package-lock.json
```

### Development Usage

If you're working with the source code:

```bash
# Check a specific package-lock.json file
npm run check ./package-lock.json

# Check package-lock.json in a directory
npm run check /path/to/project/

# Check current directory's package-lock.json
npm run check .
```

## How It Works

1. **Package Extraction**: The tool reads your `package-lock.json` file and extracts all installed packages with their exact versions
2. **Security Check**: Each package is checked against a curated database of known affected packages stored in `affected-packages-list.ts`
3. **Reporting**: The tool provides a detailed report showing:
   - Total number of packages scanned
   - Number of affected packages found
   - List of affected packages (if any)
   - Security recommendations

**Note**: The affected packages list is compiled into the built version of the tool. If you modify `affected-packages-list.ts`, you need to rebuild the project (`npm run build`) or use the development check command (`npm run check`) for changes to take effect.

## Updating the Affected Packages List

The list of affected packages is stored in `affected-packages-list.ts` in the project root. This TypeScript array format provides better type safety and easier programmatic access:

### TypeScript Array Format
The affected packages are stored as a TypeScript array with one package per line:
```typescript
export const affectedPackagesList = [
  "@ahmedhfarag/ngx-perfect-scrollbar@20.0.20",
  "@art-ws/common@2.0.28",
  "ngx-bootstrap@18.1.4",
  // ... more packages
];
```

### Adding New Affected Packages
1. Open `affected-packages-list.ts` in any text editor or IDE
2. Add new packages in the format `"package-name@version"` (with quotes and comma)
3. Save the file
4. **Important**: You must rebuild the project or use the development check option for changes to take effect:
   ```bash
   # Option 1: Rebuild and use the built version
   npm run build
   npm run start ./package-lock.json
   
   # Option 2: Use the development check (no rebuild needed)
   npm run check ./package-lock.json
   ```

### Benefits of TypeScript Array Format
- ✅ **Type Safety**: Compile-time checking ensures proper format
- ✅ **IDE Support**: Better autocomplete and syntax highlighting
- ✅ **Version Control**: Changes can be tracked in git
- ✅ **Programmatic Access**: Easy to import and use in other TypeScript files
- ✅ **Automated Updates**: Can be updated by scripts or external tools
- ✅ **Validation**: TypeScript compiler ensures proper syntax

## Output Examples

### No Security Issues Found
```
🔍 Package Security Checker
==================================================
📁 Checking: ./package-lock.json

📦 Total packages found: 1,247
⚠️  Affected packages: 0

✅ No affected packages found! Your project appears to be secure.
```

### Security Issues Detected
```
🔍 Package Security Checker
==================================================
📁 Checking: ./package-lock.json

📦 Total packages found: 1,247
⚠️  Affected packages: 3

🚨 AFFECTED PACKAGES DETECTED:
--------------------------------------------------
  ⚠️  @ahmedhfarag/ngx-perfect-scrollbar@20.0.20
  ⚠️  @ctrl/ngx-codemirror@7.0.1
  ⚠️  ngx-bootstrap@18.1.4

💡 Recommendation: Update these packages to secure versions
```

## Exit Codes

- **0**: No affected packages found (secure)
- **1**: Affected packages found or error occurred

This makes the tool suitable for integration with CI/CD pipelines and automated security checks.

## Development

### Available Scripts

```bash
# Build the TypeScript code
npm run build

# Build with watch mode
npm run build:watch

# Run the tool directly with ts-node
npm run dev

# Run tests
npm test

# Run the built version
npm start
```

### Project Structure

```
├── affected-packages-list.ts  # Database of affected packages (TypeScript array)
src/
├── index.ts                   # CLI entry point
├── security-check.ts          # Core security checking logic
├── affected-list.ts           # Loads and processes affected packages from TypeScript array
└── test/                      # Test files and test data
    ├── security-check.test.ts
    ├── test1-package-lock.json
    ├── test2-package-lock.json
    └── test3-package-lock.json
```

## Testing

The project includes comprehensive tests to ensure accuracy:

```bash
npm test
```

Tests cover:
- Package extraction from `package-lock.json` files
- Detection of affected packages
- Handling of multiple affected packages
- Edge cases and error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

ISC License

## Author

arne.seidenfaden@konvoj.de

## Security Note

This tool helps identify packages that may contain malware or security vulnerabilities. However, it should be used as part of a comprehensive security strategy, not as the only security measure. Always:

- Keep your dependencies updated
- Use additional security scanning tools
- Review package sources and maintainers
- Follow security best practices for your development environment
