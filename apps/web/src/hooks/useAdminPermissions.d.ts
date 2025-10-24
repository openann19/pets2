export declare function useAdminPermissions(): {
    user: null;
    isLoading: boolean;
    isAdmin: boolean;
    hasPermission: (permission: any) => boolean;
    hasAnyPermission: (permissionList: any) => any;
    hasAllPermissions: (permissionList: any) => any;
    hasRole: (role: any) => boolean;
    getUserPermissions: () => any;
};
export declare const PermissionGuard: ({ permission, requireAll, fallback, children, }: {
    permission: any;
    requireAll?: boolean | undefined;
    fallback?: null | undefined;
    children: any;
}) => JSX.Element;
export declare const RoleGuard: ({ role, fallback, children }: {
    role: any;
    fallback?: null | undefined;
    children: any;
}) => JSX.Element;
//# sourceMappingURL=useAdminPermissions.d.ts.map