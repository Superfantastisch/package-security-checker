import { affectedPackagesList } from '../affected-packages-list';

// Type definitions for package data
interface PackageInfo {
  name: string;
  version: string;
  fullName: string; // package@version format
}

// Typed Map for storing affected packages
const affectedPackagesMap = new Map<string, PackageInfo>();

// Function to load package data from TypeScript file
function loadPackageDataFromTS(): string[] {
  try {
    return affectedPackagesList;
  } catch (error) {
    console.error('Error reading TypeScript file:', error);
    // Fallback to empty array if TS file can't be read
    return [];
  }
}

// Load package data from TypeScript file
const packageData = loadPackageDataFromTS();

// Function to parse package string and create PackageInfo object
function parsePackageString(packageString: string): PackageInfo {
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
  } catch (error) {
    console.error(`Error parsing package: ${packageString}`, error);
  }
});

// Export the typed Map and related types
export { affectedPackagesMap, PackageInfo, parsePackageString };

// Utility functions for working with the Map
export const packageUtils = {
  // Get all packages by name (returns array of versions)
  getPackagesByName: (name: string): PackageInfo[] => {
    return Array.from(affectedPackagesMap.values()).filter(pkg => pkg.name === name);
  },
  
  // Get latest version of a package
  getLatestVersion: (name: string): PackageInfo | undefined => {
    const packages = Array.from(affectedPackagesMap.values()).filter(pkg => pkg.name === name);
    return packages.sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }))[0];
  },
  
  // Check if a package exists
  hasPackage: (fullName: string): boolean => {
    return affectedPackagesMap.has(fullName);
  },
  
  // Get all unique package names
  getAllPackageNames: (): string[] => {
    const names = new Set<string>();
    affectedPackagesMap.forEach(pkg => names.add(pkg.name));
    return Array.from(names).sort();
  },
  
  // Get total count
  getTotalCount: (): number => {
    return affectedPackagesMap.size;
  }
};