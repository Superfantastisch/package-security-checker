import { InputValidator, SecurityCheckError } from '../validation';

describe('InputValidator Security Tests', () => {
  describe('validatePackageName', () => {
    it('should accept valid package names', () => {
      expect(InputValidator.validatePackageName('valid-package')).toBe(true);
      expect(InputValidator.validatePackageName('@scope/package')).toBe(true);
      expect(InputValidator.validatePackageName('package123')).toBe(true);
    });

    it('should reject invalid package names', () => {
      expect(InputValidator.validatePackageName('')).toBe(false);
      expect(InputValidator.validatePackageName('invalid package')).toBe(false);
      expect(InputValidator.validatePackageName('@invalid/')).toBe(false);
      expect(InputValidator.validatePackageName('UPPERCASE')).toBe(false);
    });

    it('should reject overly long package names', () => {
      const longName = 'a'.repeat(300);
      expect(InputValidator.validatePackageName(longName)).toBe(false);
    });
  });

  describe('validateVersion', () => {
    it('should accept valid versions', () => {
      expect(InputValidator.validateVersion('1.0.0')).toBe(true);
      expect(InputValidator.validateVersion('1.0.0-beta.1')).toBe(true);
      expect(InputValidator.validateVersion('1.0.0+build.123')).toBe(true);
    });

    it('should reject invalid versions', () => {
      expect(InputValidator.validateVersion('')).toBe(false);
      expect(InputValidator.validateVersion('1.0')).toBe(false);
      expect(InputValidator.validateVersion('v1.0.0')).toBe(false);
    });
  });

  describe('validatePath', () => {
    it('should accept valid paths', () => {
      expect(() => InputValidator.validatePath('./package-lock.json')).not.toThrow();
      expect(() => InputValidator.validatePath('package-lock.json')).not.toThrow();
    });

    it('should reject path traversal attempts', () => {
      expect(() => InputValidator.validatePath('../package-lock.json')).toThrow(SecurityCheckError);
      expect(() => InputValidator.validatePath('../../../etc/passwd')).toThrow(SecurityCheckError);
      expect(() => InputValidator.validatePath('~/package-lock.json')).toThrow(SecurityCheckError);
    });

    it('should reject null bytes', () => {
      expect(() => InputValidator.validatePath('package-lock.json\0')).toThrow(SecurityCheckError);
    });
  });

  describe('validatePackageString', () => {
    it('should accept valid package strings', () => {
      expect(() => InputValidator.validatePackageString('package@1.0.0')).not.toThrow();
      expect(() => InputValidator.validatePackageString('@scope/package@2.0.0')).not.toThrow();
    });

    it('should reject invalid package strings', () => {
      expect(() => InputValidator.validatePackageString('')).toThrow(SecurityCheckError);
      expect(() => InputValidator.validatePackageString('package')).toThrow(SecurityCheckError);
      expect(() => InputValidator.validatePackageString('@package')).toThrow(SecurityCheckError);
    });

    it('should reject overly long package strings', () => {
      const longString = 'a'.repeat(2000);
      expect(() => InputValidator.validatePackageString(`${longString}@1.0.0`)).toThrow(SecurityCheckError);
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const result = InputValidator.safeJsonParse('{"name": "test", "version": "1.0.0"}');
      expect(result).toEqual({ name: 'test', version: '1.0.0' });
    });

    it('should prevent prototype pollution', () => {
      const maliciousJson = '{"__proto__": {"isAdmin": true}}';
      const result = InputValidator.safeJsonParse(maliciousJson);
      expect(result).toEqual({});
      expect(({} as any).isAdmin).toBeUndefined();
    });

    it('should reject invalid JSON', () => {
      expect(() => InputValidator.safeJsonParse('invalid json')).toThrow(SecurityCheckError);
    });
  });

  describe('validateArguments', () => {
    it('should accept valid arguments', () => {
      expect(() => InputValidator.validateArguments(['package-lock.json'])).not.toThrow();
    });

    it('should reject empty arguments', () => {
      expect(() => InputValidator.validateArguments([])).toThrow(SecurityCheckError);
    });

    it('should reject null bytes in arguments', () => {
      expect(() => InputValidator.validateArguments(['package-lock.json\0'])).toThrow(SecurityCheckError);
    });
  });
});

describe('SecurityCheckError', () => {
  it('should create error with code and details', () => {
    const error = new SecurityCheckError('Test error', 'TEST_CODE', { detail: 'test' });
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.details).toEqual({ detail: 'test' });
    expect(error.name).toBe('SecurityCheckError');
  });
});
