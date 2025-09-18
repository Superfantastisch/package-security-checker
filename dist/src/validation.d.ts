/**
 * Security validation utilities for package security checker
 */
export declare class SecurityCheckError extends Error {
    code: string;
    details?: any | undefined;
    constructor(message: string, code: string, details?: any | undefined);
}
export declare class InputValidator {
    private static readonly MAX_FILE_SIZE;
    private static readonly MAX_PACKAGE_NAME_LENGTH;
    private static readonly MAX_VERSION_LENGTH;
    private static readonly MAX_PACKAGE_STRING_LENGTH;
    /**
     * Validates package name format according to npm standards
     */
    static validatePackageName(name: string): boolean;
    /**
     * Validates semantic version format
     */
    static validateVersion(version: string): boolean;
    /**
     * Validates and sanitizes file paths to prevent directory traversal
     */
    static validatePath(inputPath: string): string;
    /**
     * Validates package string format
     */
    static validatePackageString(packageString: string): void;
    /**
     * Validates CLI arguments
     */
    static validateArguments(args: string[]): string;
    /**
     * Safe JSON parsing with prototype pollution protection
     */
    static safeJsonParse<T>(jsonString: string): T;
    /**
     * Validates file size before reading
     */
    static validateFileSize(filePath: string): void;
    /**
     * Validates that a file exists and is readable
     */
    static validateFileExists(filePath: string): void;
}
//# sourceMappingURL=validation.d.ts.map