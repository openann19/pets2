export declare const useLoadingStates: () => never;
export declare const LoadingProvider: ({ children }: {
    children: any;
}) => JSX.Element;
export declare const UniversalLoading: ({ id, children, fallback, className }: {
    id: any;
    children: any;
    fallback: any;
    className?: string | undefined;
}) => JSX.Element;
export declare const ProgressLoading: ({ id, children, className }: {
    id: any;
    children: any;
    className?: string | undefined;
}) => JSX.Element;
export declare const useAPILoading: () => {
    startAPILoading: (operation: any, options: any) => void;
    updateAPIProgress: (operation: any, progress: any) => void;
    stopAPILoading: (operation: any) => void;
};
export declare const usePageLoading: () => {
    startPageLoading: (page: any, options: any) => void;
    stopPageLoading: (page: any) => void;
};
export declare const useFormLoading: () => {
    startFormLoading: (form: any, options: any) => void;
    stopFormLoading: (form: any) => void;
};
export declare const APILoadingWrapper: ({ operation, children, message, showProgress, className }: {
    operation: any;
    children: any;
    message: any;
    showProgress?: boolean | undefined;
    className?: string | undefined;
}) => JSX.Element;
export declare const PageLoadingWrapper: ({ page, children, skeletonType, className }: {
    page: any;
    children: any;
    skeletonType?: string | undefined;
    className?: string | undefined;
}) => JSX.Element;
export declare const FormLoadingWrapper: ({ form, children, className }: {
    form: any;
    children: any;
    className?: string | undefined;
}) => JSX.Element;
export declare const LoadingIndicator: ({ id, className }: {
    id: any;
    className?: string | undefined;
}) => JSX.Element | null;
export declare const LoadingBadge: ({ id, className }: {
    id: any;
    className?: string | undefined;
}) => JSX.Element | null;
export { LoadingProvider as default, useLoadingStates, UniversalLoading, ProgressLoading, useAPILoading, usePageLoading, useFormLoading, APILoadingWrapper, PageLoadingWrapper, FormLoadingWrapper, LoadingIndicator, LoadingBadge, };
//# sourceMappingURL=UniversalLoadingStates.d.ts.map