export declare const useNotification: () => {
    permission: string;
    requestPermission: () => Promise<string>;
    showNotification: () => Promise<void>;
    isSupported: boolean;
};
export declare const NotificationProvider: ({ children }: {
    children: any;
}) => JSX.Element;
//# sourceMappingURL=NotificationProvider.d.ts.map