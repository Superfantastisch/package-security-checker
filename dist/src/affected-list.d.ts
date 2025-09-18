interface PackageInfo {
    name: string;
    version: string;
    fullName: string;
}
declare const affectedPackagesMap: Map<string, PackageInfo>;
declare function parsePackageString(packageString: string): PackageInfo;
export { affectedPackagesMap, PackageInfo, parsePackageString };
export declare const packageUtils: {
    getPackagesByName: (name: string) => PackageInfo[];
    getLatestVersion: (name: string) => PackageInfo | undefined;
    hasPackage: (fullName: string) => boolean;
    getAllPackageNames: () => string[];
    getTotalCount: () => number;
};
//# sourceMappingURL=affected-list.d.ts.map