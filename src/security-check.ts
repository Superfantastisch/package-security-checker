import * as fs from 'fs';
import * as path from 'path';

// Interface for package-lock.json structure
interface PackageLockPackage {
  version: string;
  resolved?: string;
  integrity?: string;
  dev?: boolean;
  license?: string;
  dependencies?: Record<string, string>;
  engines?: Record<string, string>;
  bin?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, any>;
}

interface PackageLockJson {
  name: string;
  version: string;
  lockfileVersion: number;
  requires?: boolean;
  packages: Record<string, PackageLockPackage>;
}

/**
 * Reads a package-lock.json file and extracts all installed packages
 * @param packageLockPath - Path to the package-lock.json file
 * @returns Array of package names in format "package@version"
 */
export function getInstalledPackages(packageLockPath: string): string[] {
  try {
    // Check if file exists
    if (!fs.existsSync(packageLockPath)) {
      throw new Error(`Package-lock.json file not found at: ${packageLockPath}`);
    }

    // Read and parse the package-lock.json file
    const fileContent = fs.readFileSync(packageLockPath, 'utf8');
    const packageLock: PackageLockJson = JSON.parse(fileContent);

    const installedPackages: string[] = [];

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
      let packageName: string;

      if (pathParts.length === 2) {
        // Regular package: "node_modules/package-name"
        packageName = pathParts[1];
      } else if (pathParts.length === 3 && pathParts[1].startsWith('@')) {
        // Scoped package: "node_modules/@scope/package-name"
        packageName = `${pathParts[1]}/${pathParts[2]}`;
      } else {
        // Skip nested packages (sub-dependencies in their own node_modules)
        continue;
      }

      // Format as "package@version"
      const fullPackageName = `${packageName}@${packageInfo.version}`;
      installedPackages.push(fullPackageName);
    }

    return installedPackages.sort(); // Return sorted list for consistency

  } catch (error) {
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
export function getInstalledPackagesFromDirectory(directoryPath: string): string[] {
  const packageLockPath = path.join(directoryPath, 'package-lock.json');
  return getInstalledPackages(packageLockPath);
}

/**
 * Get installed packages and filter for affected ones
 * @param packageLockPath - Path to the package-lock.json file
 * @param hasPackageFunction - Function to check if a package is affected
 * @returns Object containing all packages and affected packages
 */
export function getAffectedPackages(
  packageLockPath: string, 
  hasPackageFunction: (fullName: string) => boolean
): { allPackages: string[]; affectedPackages: string[] } {
  const allPackages = getInstalledPackages(packageLockPath);
  const affectedPackages = allPackages.filter(hasPackageFunction);
  
  return {
    allPackages,
    affectedPackages
  };
}
