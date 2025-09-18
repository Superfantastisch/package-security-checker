#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const security_check_1 = require("./security-check");
const affected_list_1 = require("./affected-list");
const validation_1 = require("./validation");
// CLI interface for package security checker
function main() {
    try {
        const args = process.argv.slice(2);
        // Show help if no arguments or help flag
        if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
            showHelp();
            return;
        }
        // Validate arguments
        const packageLockPath = validation_1.InputValidator.validateArguments(args);
        // Check if it's a directory path
        let actualPath = packageLockPath;
        if (fs.existsSync(packageLockPath) &&
            fs.statSync(packageLockPath).isDirectory()) {
            actualPath = path.join(packageLockPath, "package-lock.json");
        }
        console.log("🔍 Package Security Checker");
        console.log("=".repeat(50));
        console.log(`📁 Checking: ${actualPath}\n`);
        // Get all packages and filter for affected ones
        const result = (0, security_check_1.getAffectedPackages)(actualPath, affected_list_1.packageUtils.hasPackage);
        console.log(`📦 Total packages found: ${result.allPackages.length}`);
        console.log(`⚠️  Affected packages: ${result.affectedPackages.length}`);
        if (result.affectedPackages.length > 0) {
            console.log("\n🚨 AFFECTED PACKAGES DETECTED:");
            console.log("-".repeat(50));
            result.affectedPackages.forEach((pkg) => {
                console.log(`  ⚠️  ${pkg}`);
            });
            console.log("\n💡 Recommendation: Update these packages to secure versions");
            process.exit(1); // Exit with error code to indicate security issues
        }
        else {
            console.log("\n✅ No affected packages found! Your project appears to be secure.");
            process.exit(0);
        }
    }
    catch (error) {
        if (error instanceof validation_1.SecurityCheckError) {
            console.error("❌ Security Error:", error.message);
            if (error.code) {
                console.error(`   Error Code: ${error.code}`);
            }
        }
        else {
            console.error("❌ Error:", error instanceof Error ? error.message : String(error));
        }
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

Security Features:
  ✅ Path validation to prevent directory traversal attacks
  ✅ File size limits to prevent DoS attacks
  ✅ Safe JSON parsing to prevent prototype pollution
  ✅ Input validation for all user inputs
  ✅ Comprehensive error handling

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
//# sourceMappingURL=index.js.map