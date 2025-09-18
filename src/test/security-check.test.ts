import { getInstalledPackages, getAffectedPackages } from '../security-check';
import * as path from 'path';
import { affectedPackagesList } from '../affected-packages-list';
import { SecurityCheckError } from '../validation';

// Mock function that uses affected-packages-list.ts as the source of affected packages
function createMockAffectedPackagesChecker(): (packageName: string) => boolean {
  const affectedPackages = affectedPackagesList;
  
  return (packageName: string) => affectedPackages.includes(packageName);
}

describe('Security Check Functions', () => {
  describe('getInstalledPackages', () => {
    it('should extract packages from package-lock.json', () => {
      const testFile = path.join(__dirname, 'test2-package-lock.json');
      const packages = getInstalledPackages(testFile);
      
      // Should contain the affected package we added
      expect(packages).toContain('@ahmedhfarag/ngx-perfect-scrollbar@20.0.20');
      
      // Should contain other packages from the test file
      expect(packages).toContain('typescript@5.9.2');
      expect(packages).toContain('ts-node@10.9.2');
    });

    it('should handle empty package-lock.json gracefully', () => {
      const testFile = path.join(__dirname, 'test1-package-lock.json');
      const packages = getInstalledPackages(testFile);
      
      // Should return an array (even if empty)
      expect(Array.isArray(packages)).toBe(true);
      expect(packages.length).toBeGreaterThan(0);
    });

    it('should extract packages from complex package-lock.json', () => {
      const testFile = path.join(__dirname, 'test3-package-lock.json');
      const packages = getInstalledPackages(testFile);
      
      // Should contain multiple packages
      expect(packages.length).toBeGreaterThan(10);
      
      // Should contain some expected packages
      expect(packages).toContain('@ahmedhfarag/ngx-perfect-scrollbar@20.0.20');
      expect(packages).toContain('@ctrl/ngx-codemirror@7.0.1');
      expect(packages).toContain('ngx-bootstrap@18.1.4');
    });
  });

  describe('getAffectedPackages', () => {
    const mockHasPackage = createMockAffectedPackagesChecker();

    it('should identify affected packages from test1-package-lock.json with no affected packages', () => {
      const testFile = path.join(__dirname, 'test1-package-lock.json');
      const result = getAffectedPackages(testFile, mockHasPackage);
      
      expect(result.affectedPackages).toHaveLength(0);
      expect(result.allPackages.length).toBeGreaterThan(0);
      expect(result.affectedPackages).toEqual([]);
    });

    it('should identify affected packages from test2-package-lock.json', () => {
      const testFile = path.join(__dirname, 'test2-package-lock.json');
      const result = getAffectedPackages(testFile, mockHasPackage);
      
      // Should find exactly one affected package
      expect(result.affectedPackages).toHaveLength(1);
      expect(result.affectedPackages[0]).toBe('@ahmedhfarag/ngx-perfect-scrollbar@20.0.20');
      
      // Should have multiple total packages
      expect(result.allPackages.length).toBeGreaterThan(1);
      
      // All affected packages should be in the all packages list
      result.affectedPackages.forEach(affectedPkg => {
        expect(result.allPackages).toContain(affectedPkg);
      });
    });

    it('should identify multiple affected packages from test3-package-lock.json', () => {
      const testFile = path.join(__dirname, 'test3-package-lock.json');
      const result = getAffectedPackages(testFile, mockHasPackage);
      
      // Should find exactly three affected packages
      expect(result.affectedPackages).toHaveLength(3);
      
      // Check that all three expected packages are found
      const expectedPackages = [
        '@ahmedhfarag/ngx-perfect-scrollbar@20.0.20',
        '@ctrl/ngx-codemirror@7.0.1',
        'ngx-bootstrap@18.1.4'
      ];
      
      expectedPackages.forEach(expectedPkg => {
        expect(result.affectedPackages).toContain(expectedPkg);
      });
      
      // Should have multiple total packages
      expect(result.allPackages.length).toBeGreaterThan(3);
      
      // All affected packages should be in the all packages list
      result.affectedPackages.forEach(affectedPkg => {
        expect(result.allPackages).toContain(affectedPkg);
      });
    });

    it('should handle file not found error gracefully', () => {
      const nonExistentFile = path.join(__dirname, 'non-existent-package-lock.json');
      
      expect(() => {
        getAffectedPackages(nonExistentFile, mockHasPackage);
      }).toThrow(SecurityCheckError);
    });

    it('should return correct structure with affected and all packages', () => {
      const testFile = path.join(__dirname, 'test2-package-lock.json');
      const result = getAffectedPackages(testFile, mockHasPackage);
      
      // Check structure
      expect(result).toHaveProperty('affectedPackages');
      expect(result).toHaveProperty('allPackages');
      expect(Array.isArray(result.affectedPackages)).toBe(true);
      expect(Array.isArray(result.allPackages)).toBe(true);
      
      // Affected packages should be a subset of all packages
      result.affectedPackages.forEach(affectedPkg => {
        expect(result.allPackages).toContain(affectedPkg);
      });
      
      // Affected packages count should not exceed all packages count
      expect(result.affectedPackages.length).toBeLessThanOrEqual(result.allPackages.length);
    });

    it('should work with different mock affected packages checker', () => {
      // Create a custom mock that only checks for specific packages
      const customMockChecker = (packageName: string) => {
        return packageName.includes('ngx-perfect-scrollbar') || packageName.includes('typescript');
      };
      
      const testFile = path.join(__dirname, 'test2-package-lock.json');
      const result = getAffectedPackages(testFile, customMockChecker);
      
      // Should find packages matching our custom criteria
      expect(result.affectedPackages.length).toBeGreaterThan(0);
      
      // All affected packages should match our custom criteria
      result.affectedPackages.forEach(affectedPkg => {
        expect(
          affectedPkg.includes('ngx-perfect-scrollbar') || affectedPkg.includes('typescript')
        ).toBe(true);
      });
    });
  });

  describe('Security Tests', () => {
    it('should reject path traversal attempts', () => {
      expect(() => {
        getInstalledPackages('../../../etc/passwd');
      }).toThrow(SecurityCheckError);
    });

    it('should reject paths with null bytes', () => {
      expect(() => {
        getInstalledPackages('package-lock.json\0');
      }).toThrow(SecurityCheckError);
    });

    it('should handle malicious JSON with prototype pollution', () => {
      // This test would require creating a malicious package-lock.json file
      // For now, we'll test that the safeJsonParse function works correctly
      const { InputValidator } = require('../validation');
      const maliciousJson = '{"__proto__": {"isAdmin": true}}';
      const result = InputValidator.safeJsonParse(maliciousJson);
      expect(result).toEqual({});
      expect(({} as any).isAdmin).toBeUndefined();
    });
  });
});
