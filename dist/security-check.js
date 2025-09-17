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
exports.getInstalledPackages = getInstalledPackages;
exports.getInstalledPackagesFromDirectory = getInstalledPackagesFromDirectory;
exports.getAffectedPackages = getAffectedPackages;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Reads a package-lock.json file and extracts all installed packages
 * @param packageLockPath - Path to the package-lock.json file
 * @returns Array of package names in format "package@version"
 */
function getInstalledPackages(packageLockPath) {
    try {
        // Check if file exists
        if (!fs.existsSync(packageLockPath)) {
            throw new Error(`Package-lock.json file not found at: ${packageLockPath}`);
        }
        // Read and parse the package-lock.json file
        const fileContent = fs.readFileSync(packageLockPath, 'utf8');
        const packageLock = JSON.parse(fileContent);
        const installedPackages = [];
        // Iterate through all packages in the packages object
        for (const [packagePath, packageInfo] of Object.entries(packageLock.packages)) {
            // Skip the root package (empty key)
            if (packagePath === '') {
                continue;
            }
            // Skip packages that don't have a version (like directories)
            if (!packageInfo.version) {
                continue;
            }
            // Extract package name from the path
            // Path format: "node_modules/package-name" or "node_modules/@scope/package-name"
            const pathParts = packagePath.split('/');
            let packageName;
            if (pathParts.length === 2) {
                // Regular package: "node_modules/package-name"
                packageName = pathParts[1];
            }
            else if (pathParts.length === 3 && pathParts[1].startsWith('@')) {
                // Scoped package: "node_modules/@scope/package-name"
                packageName = `${pathParts[1]}/${pathParts[2]}`;
            }
            else {
                // Skip nested packages (sub-dependencies in their own node_modules)
                continue;
            }
            // Format as "package@version"
            const fullPackageName = `${packageName}@${packageInfo.version}`;
            installedPackages.push(fullPackageName);
        }
        return installedPackages.sort(); // Return sorted list for consistency
    }
    catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error(`Invalid JSON in package-lock.json file: ${error.message}`);
        }
        throw error;
    }
}
/**
 * Convenience function to find package-lock.json in a directory
 * @param directoryPath - Path to the directory to search
 * @returns Array of package names in format "package@version"
 */
function getInstalledPackagesFromDirectory(directoryPath) {
    const packageLockPath = path.join(directoryPath, 'package-lock.json');
    return getInstalledPackages(packageLockPath);
}
/**
 * Get installed packages and filter for affected ones
 * @param packageLockPath - Path to the package-lock.json file
 * @param hasPackageFunction - Function to check if a package is affected
 * @returns Object containing all packages and affected packages
 */
function getAffectedPackages(packageLockPath, hasPackageFunction) {
    const allPackages = getInstalledPackages(packageLockPath);
    const affectedPackages = allPackages.filter(hasPackageFunction);
    return {
        allPackages,
        affectedPackages
    };
}
//# sourceMappingURL=security-check.js.map