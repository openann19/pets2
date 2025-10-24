export declare const useInteractionSystem: () => never;
export declare const InteractionProvider: ({ children }: {
    children: any;
}) => JSX.Element;
export declare const EnhancedInteractive: ({ id, children, className, onClick, disabled, loading, variant, size, effects, apiOperation, tooltip, "aria-label": ariaLabel, "aria-describedby": ariaDescribedBy, role, tabIndex, }: {
    id: any;
    children: any;
    className?: string | undefined;
    onClick: any;
    disabled?: boolean | undefined;
    loading?: boolean | undefined;
    variant?: string | undefined;
    size?: string | undefined;
    effects?: {
        hover: boolean;
        magnetic: boolean;
        tilt: boolean;
        glow: boolean;
        ripple: boolean;
        sound: boolean;
        haptic: boolean;
        shimmer: boolean;
        particles: boolean;
    } | undefined;
    apiOperation: any;
    tooltip: any;
    "aria-label": any;
    "aria-describedby": any;
    role: any;
    tabIndex: any;
}) => JSX.Element;
export declare const EnhancedButton: ({ variant, icon, iconPosition, fullWidth, className, ...props }: {
    [x: string]: any;
    variant?: string | undefined;
    icon: any;
    iconPosition?: string | undefined;
    fullWidth?: boolean | undefined;
    className?: string | undefined;
}) => JSX.Element;
export declare const EnhancedCard: ({ variant, padding, className, ...props }: {
    [x: string]: any;
    variant?: string | undefined;
    padding?: string | undefined;
    className?: string | undefined;
}) => JSX.Element;
export { InteractionProvider as default, EnhancedInteractive, EnhancedButton, EnhancedCard, };
//# sourceMappingURL=AdvancedInteractionSystem.d.ts.map