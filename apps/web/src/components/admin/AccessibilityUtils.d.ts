export declare function useAnnouncement(): {};
export declare function AnnouncementProvider({ children }: {
    children: any;
}): JSX.Element;
export declare function useFocusManagement(): {
    saveFocus: () => void;
    restoreFocus: () => void;
};
export declare function useReducedMotion(): boolean;
export declare function useHighContrastMode(): boolean;
export declare function AccessibleButton({ children, className, onClick, ariaLabel, ...props }: {
    [x: string]: any;
    children: any;
    className?: string | undefined;
    onClick: any;
    ariaLabel: any;
}): JSX.Element;
export declare function SkipLink({ href, children }: {
    href?: string | undefined;
    children?: string | undefined;
}): JSX.Element;
export declare function AriaLiveRegion({ children, priority }: {
    children: any;
    priority?: string | undefined;
}): JSX.Element;
export declare function AccessibleModal({ isOpen, onClose, title, children, className }: {
    isOpen: any;
    onClose: any;
    title: any;
    children: any;
    className?: string | undefined;
}): JSX.Element;
//# sourceMappingURL=AccessibilityUtils.d.ts.map