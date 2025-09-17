/**
 * Reads a package-lock.json file and extracts all installed packages
 * @param packageLockPath - Path to the package-lock.json file
 * @returns Array of package names in format "package@version"
 */
export declare function getInstalledPackages(packageLockPath: string): string[];
/**
 * Convenience function to find package-lock.json in a directory
 * @param directoryPath - Path to the directory to search
 * @returns Array of package names in format "package@version"
 */
export declare function getInstalledPackagesFromDirectory(directoryPath: string): string[];
/**
 * Get installed packages and filter for affected ones
 * @param packageLockPath - Path to the package-lock.json file
 * @param hasPackageFunction - Function to check if a package is affected
 * @returns Object containing all packages and affected packages
 */
export declare function getAffectedPackages(packageLockPath: string, hasPackageFunction: (fullName: string) => boolean): {
    allPackages: string[];
    affectedPackages: string[];
};
//# sourceMappingURL=security-check.d.ts.map