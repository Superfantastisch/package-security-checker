import { affectedPackagesMap, parsePackageString, packageUtils } from '../affected-list';

describe('affected-list', () => {
  beforeEach(() => {
    // Clear the map before each test
    affectedPackagesMap.clear();
    jest.clearAllMocks();
  });

  describe('parsePackageString', () => {
    it('should parse a valid package string correctly', () => {
      const result = parsePackageString('package-name@1.2.3');
      
      expect(result).toEqual({
        name: 'package-name',
        version: '1.2.3',
        fullName: 'package-name@1.2.3'
      });
    });

    it('should parse scoped package names correctly', () => {
      const result = parsePackageString('@scope/package-name@2.0.0');
      
      expect(result).toEqual({
        name: '@scope/package-name',
        version: '2.0.0',
        fullName: '@scope/package-name@2.0.0'
      });
    });

    it('should handle packages with multiple @ symbols', () => {
      const result = parsePackageString('@scope/package@name@1.0.0');
      
      expect(result).toEqual({
        name: '@scope/package@name',
        version: '1.0.0',
        fullName: '@scope/package@name@1.0.0'
      });
    });

    it('should handle version with pre-release identifiers', () => {
      const result = parsePackageString('package@1.0.0-beta.1');
      
      expect(result).toEqual({
        name: 'package',
        version: '1.0.0-beta.1',
        fullName: 'package@1.0.0-beta.1'
      });
    });

    it('should throw error for package string without @ symbol', () => {
      expect(() => {
        parsePackageString('package-name');
      }).toThrow('Invalid package format: package-name');
    });

    it('should throw error for empty package string', () => {
      expect(() => {
        parsePackageString('');
      }).toThrow('Invalid package format: ');
    });

    it('should handle package string ending with @ (empty version)', () => {
      const result = parsePackageString('package-name@');
      
      expect(result).toEqual({
        name: 'package-name',
        version: '',
        fullName: 'package-name@'
      });
    });
  });

  describe('TypeScript file loading and Map population', () => {
    it('should load packages from TypeScript file and populate the map', () => {
      // Clear the map first
      affectedPackagesMap.clear();
      
      // Manually populate with test data to simulate the TypeScript loading
      const testPackages = [
        'package1@1.0.0',
        '@scope/package2@2.0.0',
        'package3@3.0.0'
      ];

      testPackages.forEach(packageString => {
        try {
          const packageInfo = parsePackageString(packageString);
          affectedPackagesMap.set(packageInfo.fullName, packageInfo);
        } catch (error) {
          console.error(`Error parsing package: ${packageString}`, error);
        }
      });

      expect(affectedPackagesMap.size).toBe(3);
      expect(affectedPackagesMap.has('package1@1.0.0')).toBe(true);
      expect(affectedPackagesMap.has('@scope/package2@2.0.0')).toBe(true);
      expect(affectedPackagesMap.has('package3@3.0.0')).toBe(true);
    });

    it('should handle invalid package strings gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Clear the map first
      affectedPackagesMap.clear();
      
      // Test with mixed valid and invalid packages
      const testPackages = [
        'valid-package@1.0.0',
        'invalid-package-without-version',
        'another-valid@2.0.0'
      ];

      testPackages.forEach(packageString => {
        try {
          const packageInfo = parsePackageString(packageString);
          affectedPackagesMap.set(packageInfo.fullName, packageInfo);
        } catch (error) {
          console.error(`Error parsing package: ${packageString}`, error);
        }
      });

      expect(affectedPackagesMap.size).toBe(2);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error parsing package: invalid-package-without-version',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle empty package list gracefully', () => {
      // Clear the map first
      affectedPackagesMap.clear();
      
      // Test with empty array
      const testPackages: string[] = [];

      testPackages.forEach(packageString => {
        try {
          const packageInfo = parsePackageString(packageString);
          affectedPackagesMap.set(packageInfo.fullName, packageInfo);
        } catch (error) {
          console.error(`Error parsing package: ${packageString}`, error);
        }
      });

      expect(affectedPackagesMap.size).toBe(0);
    });
  });

  describe('packageUtils', () => {
    beforeEach(() => {
      // Manually populate the map for utility function tests
      affectedPackagesMap.set('package1@1.0.0', {
        name: 'package1',
        version: '1.0.0',
        fullName: 'package1@1.0.0'
      });
      affectedPackagesMap.set('package1@2.0.0', {
        name: 'package1',
        version: '2.0.0',
        fullName: 'package1@2.0.0'
      });
      affectedPackagesMap.set('@scope/package2@1.5.0', {
        name: '@scope/package2',
        version: '1.5.0',
        fullName: '@scope/package2@1.5.0'
      });
      affectedPackagesMap.set('package3@3.0.0', {
        name: 'package3',
        version: '3.0.0',
        fullName: 'package3@3.0.0'
      });
    });

    describe('getPackagesByName', () => {
      it('should return all packages with the given name', () => {
        const result = packageUtils.getPackagesByName('package1');
        
        expect(result).toHaveLength(2);
        expect(result).toEqual([
          { name: 'package1', version: '1.0.0', fullName: 'package1@1.0.0' },
          { name: 'package1', version: '2.0.0', fullName: 'package1@2.0.0' }
        ]);
      });

      it('should return empty array for non-existent package name', () => {
        const result = packageUtils.getPackagesByName('non-existent');
        
        expect(result).toHaveLength(0);
        expect(result).toEqual([]);
      });

      it('should handle scoped package names', () => {
        const result = packageUtils.getPackagesByName('@scope/package2');
        
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          name: '@scope/package2',
          version: '1.5.0',
          fullName: '@scope/package2@1.5.0'
        });
      });
    });

    describe('getLatestVersion', () => {
      it('should return the latest version of a package', () => {
        const result = packageUtils.getLatestVersion('package1');
        
        expect(result).toEqual({
          name: 'package1',
          version: '2.0.0',
          fullName: 'package1@2.0.0'
        });
      });

      it('should return undefined for non-existent package', () => {
        const result = packageUtils.getLatestVersion('non-existent');
        
        expect(result).toBeUndefined();
      });

      it('should handle single version correctly', () => {
        const result = packageUtils.getLatestVersion('package3');
        
        expect(result).toEqual({
          name: 'package3',
          version: '3.0.0',
          fullName: 'package3@3.0.0'
        });
      });

      it('should handle complex version numbers correctly', () => {
        // Add more complex versions
        affectedPackagesMap.set('complex@1.0.0-beta.1', {
          name: 'complex',
          version: '1.0.0-beta.1',
          fullName: 'complex@1.0.0-beta.1'
        });
        affectedPackagesMap.set('complex@1.0.0', {
          name: 'complex',
          version: '1.0.0',
          fullName: 'complex@1.0.0'
        });
        affectedPackagesMap.set('complex@1.0.1', {
          name: 'complex',
          version: '1.0.1',
          fullName: 'complex@1.0.1'
        });

        const result = packageUtils.getLatestVersion('complex');
        
        expect(result?.version).toBe('1.0.1');
      });
    });

    describe('hasPackage', () => {
      it('should return true for existing package', () => {
        expect(packageUtils.hasPackage('package1@1.0.0')).toBe(true);
        expect(packageUtils.hasPackage('@scope/package2@1.5.0')).toBe(true);
      });

      it('should return false for non-existent package', () => {
        expect(packageUtils.hasPackage('non-existent@1.0.0')).toBe(false);
        expect(packageUtils.hasPackage('package1@999.0.0')).toBe(false);
      });
    });

    describe('getAllPackageNames', () => {
      it('should return all unique package names sorted alphabetically', () => {
        const result = packageUtils.getAllPackageNames();
        
        expect(result).toEqual(['@scope/package2', 'package1', 'package3']);
      });

      it('should return empty array when map is empty', () => {
        affectedPackagesMap.clear();
        
        const result = packageUtils.getAllPackageNames();
        
        expect(result).toEqual([]);
      });
    });

    describe('getTotalCount', () => {
      it('should return the total number of packages in the map', () => {
        const result = packageUtils.getTotalCount();
        
        expect(result).toBe(4);
      });

      it('should return 0 when map is empty', () => {
        affectedPackagesMap.clear();
        
        const result = packageUtils.getTotalCount();
        
        expect(result).toBe(0);
      });
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle packages with very long names', () => {
      const longName = 'a'.repeat(1000);
      const result = parsePackageString(`${longName}@1.0.0`);
      
      expect(result.name).toBe(longName);
      expect(result.version).toBe('1.0.0');
    });

    it('should handle packages with very long versions', () => {
      const longVersion = '1.0.0-' + 'a'.repeat(1000);
      const result = parsePackageString(`package@${longVersion}`);
      
      expect(result.name).toBe('package');
      expect(result.version).toBe(longVersion);
    });

    it('should handle packages with special characters in names', () => {
      const specialName = 'package-with-dashes_and.underscores';
      const result = parsePackageString(`${specialName}@1.0.0`);
      
      expect(result.name).toBe(specialName);
      expect(result.version).toBe('1.0.0');
    });

    it('should handle packages with special characters in versions', () => {
      const specialVersion = '1.0.0-alpha.1+build.123';
      const result = parsePackageString(`package@${specialVersion}`);
      
      expect(result.name).toBe('package');
      expect(result.version).toBe(specialVersion);
    });
  });
});
