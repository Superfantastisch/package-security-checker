"use strict";
/**
 * Security validation utilities for package security checker
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputValidator = exports.SecurityCheckError = void 0;
class SecurityCheckError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'SecurityCheckError';
    }
}
exports.SecurityCheckError = SecurityCheckError;
class InputValidator {
    /**
     * Validates package name format according to npm standards
     */
    static validatePackageName(name) {
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
    static validateVersion(version) {
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
    static validatePath(inputPath) {
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
    static validatePackageString(packageString) {
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
    static validateArguments(args) {
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
    static safeJsonParse(jsonString) {
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
        }
        catch (error) {
            throw new SecurityCheckError(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`, 'JSON_PARSE_ERROR');
        }
    }
    /**
     * Validates file size before reading
     */
    static validateFileSize(filePath) {
        const fs = require('fs');
        const stats = fs.statSync(filePath);
        if (stats.size > this.MAX_FILE_SIZE) {
            throw new SecurityCheckError(`File too large: ${stats.size} bytes (max: ${this.MAX_FILE_SIZE} bytes)`, 'FILE_TOO_LARGE');
        }
    }
    /**
     * Validates that a file exists and is readable
     */
    static validateFileExists(filePath) {
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
exports.InputValidator = InputValidator;
// Maximum file size: 50MB
InputValidator.MAX_FILE_SIZE = 50 * 1024 * 1024;
// Maximum package name length
InputValidator.MAX_PACKAGE_NAME_LENGTH = 214;
// Maximum version length
InputValidator.MAX_VERSION_LENGTH = 100;
// Maximum total package string length
InputValidator.MAX_PACKAGE_STRING_LENGTH = 1000;
//# sourceMappingURL=validation.js.map