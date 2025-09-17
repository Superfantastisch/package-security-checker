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
exports.packageUtils = exports.affectedPackagesMap = void 0;
exports.parsePackageString = parsePackageString;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Typed Map for storing affected packages
const affectedPackagesMap = new Map();
exports.affectedPackagesMap = affectedPackagesMap;
// Function to load package data from CSV file
function loadPackageDataFromCSV() {
    try {
        const csvPath = path.join(__dirname, '..', 'affected-list.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        // Split by newlines and filter out empty lines and header
        const lines = csvContent.split('\n').filter(line => line.trim() && line !== 'package_name');
        return lines;
    }
    catch (error) {
        console.error('Error reading CSV file:', error);
        // Fallback to empty array if CSV can't be read
        return [];
    }
}
// Load package data from CSV file
const packageData = loadPackageDataFromCSV();
// Function to parse package string and create PackageInfo object
function parsePackageString(packageString) {
    const lastAtIndex = packageString.lastIndexOf('@');
    if (lastAtIndex === -1) {
        throw new Error(`Invalid package format: ${packageString}`);
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
        console.error(`Error parsing package: ${packageString}`, error);
    }
});
// Utility functions for working with the Map
exports.packageUtils = {
    // Get all packages by name (returns array of versions)
    getPackagesByName: (name) => {
        return Array.from(affectedPackagesMap.values()).filter(pkg => pkg.name === name);
    },
    // Get latest version of a package
    getLatestVersion: (name) => {
        const packages = Array.from(affectedPackagesMap.values()).filter(pkg => pkg.name === name);
        return packages.sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }))[0];
    },
    // Check if a package exists
    hasPackage: (fullName) => {
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