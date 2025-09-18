"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageUtils = exports.affectedPackagesMap = void 0;
exports.parsePackageString = parsePackageString;
const affected_packages_list_1 = require("./affected-packages-list");
const validation_1 = require("./validation");
// Typed Map for storing affected packages
const affectedPackagesMap = new Map();
exports.affectedPackagesMap = affectedPackagesMap;
// Function to load package data from TypeScript file
function loadPackageDataFromTS() {
    try {
        return affected_packages_list_1.affectedPackagesList;
    }
    catch (error) {
        console.error('Error reading TypeScript file:', error);
        // Fallback to empty array if TS file can't be read
        return [];
    }
}
// Load package data from TypeScript file
const packageData = loadPackageDataFromTS();
// Function to parse package string and create PackageInfo object
function parsePackageString(packageString) {
    // Validate the package string format
    validation_1.InputValidator.validatePackageString(packageString);
    const lastAtIndex = packageString.lastIndexOf('@');
    if (lastAtIndex === -1) {
        throw new validation_1.SecurityCheckError(`Invalid package format: ${packageString}`, 'INVALID_PACKAGE_FORMAT');
    }
    const name = packageString.substring(0, lastAtIndex);
    const version = packageString.substring(lastAtIndex + 1);
    return {
        name,
        version,
        fullName: packageString
    };
}
// Populate the Map with parsed package data
packageData.forEach(packageString => {
    try {
        const packageInfo = parsePackageString(packageString);
        affectedPackagesMap.set(packageInfo.fullName, packageInfo);
    }
    catch (error) {
        if (error instanceof validation_1.SecurityCheckError) {
            console.error(`Security error parsing package: ${packageString}`, error.message);
        }
        else {
            console.error(`Error parsing package: ${packageString}`, error);
        }
    }
});
// Utility functions for working with the Map
exports.packageUtils = {
    // Get all packages by name (returns array of versions)
    getPackagesByName: (name) => {
        if (!name || typeof name !== 'string') {
            throw new validation_1.SecurityCheckError('Package name must be a non-empty string', 'INVALID_PACKAGE_NAME_INPUT');
        }
        return Array.from(affectedPackagesMap.values()).filter(pkg => pkg.name === name);
    },
    // Get latest version of a package
    getLatestVersion: (name) => {
        if (!name || typeof name !== 'string') {
            throw new validation_1.SecurityCheckError('Package name must be a non-empty string', 'INVALID_PACKAGE_NAME_INPUT');
        }
        const packages = Array.from(affectedPackagesMap.values()).filter(pkg => pkg.name === name);
        return packages.sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }))[0];
    },
    // Check if a package exists
    hasPackage: (fullName) => {
        if (!fullName || typeof fullName !== 'string') {
            return false; // Return false for invalid input instead of throwing
        }
        return affectedPackagesMap.has(fullName);
    },
    // Get all unique package names
    getAllPackageNames: () => {
        const names = new Set();
        affectedPackagesMap.forEach(pkg => names.add(pkg.name));
        return Array.from(names).sort();
    },
    // Get total count
    getTotalCount: () => {
        return affectedPackagesMap.size;
    }
};
//# sourceMappingURL=affected-list.js.map