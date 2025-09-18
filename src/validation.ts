/**
 * Security validation utilities for package security checker
 */

export class SecurityCheckError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'SecurityCheckError';
  }
}

export class InputValidator {
  // Maximum file size: 50MB
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024;
  
  // Maximum package name length
  private static readonly MAX_PACKAGE_NAME_LENGTH = 214;
  
  // Maximum version length
  private static readonly MAX_VERSION_LENGTH = 100;
  
  // Maximum total package string length
  private static readonly MAX_PACKAGE_STRING_LENGTH = 1000;

  /**
   * Validates package name format according to npm standards
   */
  static validatePackageName(name: string): boolean {
    if (!name || typeof name !== 'string') {
      return false;
    }
    
    if (name.length > this.MAX_PACKAGE_NAME_LENGTH) {
      return false;
    }
    
    // NPM package name regex: scoped or unscoped (allows @ in scoped packages)
    const npmPackageNameRegex = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
    return npmPackageNameRegex.test(name);
  }

  /**
   * Validates semantic version format
   */
  static validateVersion(version: string): boolean {
    if (!version || typeof version !== 'string') {
      return false;
    }
    
    if (version.length > this.MAX_VERSION_LENGTH) {
      return false;
    }
    
    // Semantic version regex (supports pre-release and build metadata)
    const semverRegex = /^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
    return semverRegex.test(version);
  }

  /**
   * Validates and sanitizes file paths to prevent directory traversal
   */
  static validatePath(inputPath: string): string {
    if (!inputPath || typeof inputPath !== 'string') {
      throw new SecurityCheckError('Path must be a non-empty string', 'INVALID_PATH');
    }

    // Check for null bytes first
    if (inputPath.includes('\0')) {
      throw new SecurityCheckError('Null bytes not allowed in path', 'NULL_BYTES_IN_PATH');
    }
    
    const sanitizedPath = inputPath;
    
    // Resolve and normalize the path
    const resolvedPath = require('path').resolve(sanitizedPath);
    const normalizedPath = require('path').normalize(resolvedPath);
    
    // Prevent directory traversal attacks
    if (normalizedPath.includes('..') || normalizedPath.includes('~')) {
      throw new SecurityCheckError('Path traversal detected', 'PATH_TRAVERSAL');
    }
    
    // Prevent absolute paths in certain contexts
    if (normalizedPath.startsWith('/') && !normalizedPath.startsWith(process.cwd())) {
      throw new SecurityCheckError('Absolute paths outside working directory not allowed', 'ABSOLUTE_PATH');
    }
    
    return normalizedPath;
  }

  /**
   * Validates package string format
   */
  static validatePackageString(packageString: string): void {
    if (!packageString || typeof packageString !== 'string') {
      throw new SecurityCheckError('Package string must be a non-empty string', 'INVALID_PACKAGE_STRING');
    }
    
    if (packageString.length > this.MAX_PACKAGE_STRING_LENGTH) {
      throw new SecurityCheckError('Package string too long', 'PACKAGE_STRING_TOO_LONG');
    }
    
    const lastAtIndex = packageString.lastIndexOf('@');
    if (lastAtIndex === -1 || lastAtIndex === 0) {
      throw new SecurityCheckError(`Invalid package format: ${packageString}`, 'INVALID_PACKAGE_FORMAT');
    }
    
    const name = packageString.substring(0, lastAtIndex);
    const version = packageString.substring(lastAtIndex + 1);
    
    if (!this.validatePackageName(name)) {
      throw new SecurityCheckError(`Invalid package name format: ${name}`, 'INVALID_PACKAGE_NAME');
    }
    
    if (!this.validateVersion(version)) {
      throw new SecurityCheckError(`Invalid version format: ${version}`, 'INVALID_VERSION');
    }
  }

  /**
   * Validates CLI arguments
   */
  static validateArguments(args: string[]): string {
    if (!args || args.length === 0) {
      throw new SecurityCheckError('No arguments provided', 'NO_ARGUMENTS');
    }
    
    const packageLockPath = args[0];
    
    if (typeof packageLockPath !== 'string' || packageLockPath.length === 0) {
      throw new SecurityCheckError('Invalid path provided', 'INVALID_PATH_ARGUMENT');
    }
    
    // Basic path validation
    if (packageLockPath.includes('\0')) {
      throw new SecurityCheckError('Null bytes not allowed in path', 'NULL_BYTES_IN_PATH');
    }
    
    return packageLockPath;
  }

  /**
   * Safe JSON parsing with prototype pollution protection
   */
  static safeJsonParse<T>(jsonString: string): T {
    if (!jsonString || typeof jsonString !== 'string') {
      throw new SecurityCheckError('JSON string must be a non-empty string', 'INVALID_JSON_INPUT');
    }
    
    try {
      return JSON.parse(jsonString, (key, value) => {
        // Prevent prototype pollution
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
          return undefined;
        }
        return value;
      });
    } catch (error) {
      throw new SecurityCheckError(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`, 'JSON_PARSE_ERROR');
    }
  }

  /**
   * Validates file size before reading
   */
  static validateFileSize(filePath: string): void {
    const fs = require('fs');
    const stats = fs.statSync(filePath);
    
    if (stats.size > this.MAX_FILE_SIZE) {
      throw new SecurityCheckError(
        `File too large: ${stats.size} bytes (max: ${this.MAX_FILE_SIZE} bytes)`, 
        'FILE_TOO_LARGE'
      );
    }
  }

  /**
   * Validates that a file exists and is readable
   */
  static validateFileExists(filePath: string): void {
    const fs = require('fs');
    
    if (!fs.existsSync(filePath)) {
      throw new SecurityCheckError(`File not found: ${filePath}`, 'FILE_NOT_FOUND');
    }
    
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      throw new SecurityCheckError(`Path is not a file: ${filePath}`, 'NOT_A_FILE');
    }
  }
}
