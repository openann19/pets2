export declare function AnimatedButton({ children, variant, size, loading, success, haptic, className, onClick, disabled, ...props }: {
    [x: string]: any;
    children: any;
    variant?: string | undefined;
    size?: string | undefined;
    loading?: boolean | undefined;
    success?: boolean | undefined;
    haptic?: boolean | undefined;
    className?: string | undefined;
    onClick: any;
    disabled: any;
}): JSX.Element;
export declare function AnimatedCard({ children, hoverable, clickable, haptic, className, onClick, ...props }: {
    [x: string]: any;
    children: any;
    hoverable?: boolean | undefined;
    clickable?: boolean | undefined;
    haptic?: boolean | undefined;
    className?: string | undefined;
    onClick: any;
}): JSX.Element;
export declare function AnimatedIcon({ children, bounce, pulse, spin, className, ...props }: {
    [x: string]: any;
    children: any;
    bounce?: boolean | undefined;
    pulse?: boolean | undefined;
    spin?: boolean | undefined;
    className?: string | undefined;
}): JSX.Element;
export declare function LoadingSpinner({ size, color, className }: {
    size?: string | undefined;
    color?: string | undefined;
    className?: string | undefined;
}): JSX.Element;
export declare function SuccessCheckmark({ size, color, className }: {
    size?: string | undefined;
    color?: string | undefined;
    className?: string | undefined;
}): JSX.Element;
export declare function ProgressBar({ progress, color, height, className, showPercentage, }: {
    progress: any;
    color?: string | undefined;
    height?: string | undefined;
    className?: string | undefined;
    showPercentage?: boolean | undefined;
}): JSX.Element;
export declare function Badge({ children, pulse, variant, className, ...props }: {
    [x: string]: any;
    children: any;
    pulse?: boolean | undefined;
    variant?: string | undefined;
    className?: string | undefined;
}): JSX.Element;
export declare function NotificationDot({ count, pulse, className }: {
    count: any;
    pulse?: boolean | undefined;
    className?: string | undefined;
}): JSX.Element;
export declare function Skeleton({ width, height, circle, className }: {
    width?: string | undefined;
    height?: string | undefined;
    circle?: boolean | undefined;
    className?: string | undefined;
}): JSX.Element;
export declare function Tooltip({ children, content, position }: {
    children: any;
    content: any;
    position?: string | undefined;
}): JSX.Element;
/**
 * Hook to detect reduced motion preference
 */
export declare function usePrefersReducedMotion(): boolean;
//# sourceMappingURL=MicroInteractions.d.ts.map