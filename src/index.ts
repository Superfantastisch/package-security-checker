#!/usr/bin/env node

import * as path from "path";
import * as fs from "fs";
import { getAffectedPackages } from "./security-check";
import { packageUtils } from "./affected-list";

// CLI interface for package security checker
function main() {
  const args = process.argv.slice(2);

  // Show help if no arguments or help flag
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    showHelp();
    return;
  }

  const packageLockPath = args[0];

  // Validate the path
  if (!packageLockPath) {
    console.error("❌ Error: Please provide a path to package-lock.json file");
    console.log("\nUsage: npx package-security-checker <path-to-package-lock.json>");
    console.log("Example: npx package-security-checker ./package-lock.json");
    console.log("Example: npx package-security-checker /path/to/project/package-lock.json");
    process.exit(1);
  }

  // Check if it's a directory path
  let actualPath = packageLockPath;
  if (
    fs.existsSync(packageLockPath) &&
    fs.statSync(packageLockPath).isDirectory()
  ) {
    actualPath = path.join(packageLockPath, "package-lock.json");
  }

  try {
    console.log("🔍 Package Security Checker");
    console.log("=".repeat(50));
    console.log(`📁 Checking: ${actualPath}\n`);

    // Get all packages and filter for affected ones
    const result = getAffectedPackages(actualPath, packageUtils.hasPackage);

    console.log(`📦 Total packages found: ${result.allPackages.length}`);
    console.log(`⚠️  Affected packages: ${result.affectedPackages.length}`);

    if (result.affectedPackages.length > 0) {
      console.log("\n🚨 AFFECTED PACKAGES DETECTED:");
      console.log("-".repeat(50));
      result.affectedPackages.forEach((pkg) => {
        console.log(`  ⚠️  ${pkg}`);
      });
      console.log(
        "\n💡 Recommendation: Update these packages to secure versions"
      );
      process.exit(1); // Exit with error code to indicate security issues
    } else {
      console.log(
        "\n✅ No affected packages found! Your project appears to be secure."
      );
      process.exit(0);
    }
  } catch (error) {
    console.error(
      "❌ Error:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
🔍 Package Security Checker
============================

This tool checks your package-lock.json file for packages that may contain malware
or security vulnerabilities.

Usage:
  npx package-security-checker <path-to-package-lock.json>
  npx package-security-checker <directory-containing-package-lock.json>

Examples:
  npx package-security-checker ./package-lock.json
  npx package-security-checker /path/to/project/package-lock.json
  npx package-security-checker /path/to/project/                    # Will look for package-lock.json in the directory

Options:
  --help, -h    Show this help message

The tool will:
  ✅ Read all packages from the package-lock.json file
  🔍 Check them against the known affected packages list
  ⚠️  Report any potentially malicious packages found
  📊 Show summary statistics

Exit codes:
  0 - No affected packages found (secure)
  1 - Affected packages found or error occurred
`);
}

// Run the CLI
main();
