export default function PremiumSkeleton({ variant, width, height, className, animation, count, spacing, glassmorphism, }: {
    variant?: string | undefined;
    width: any;
    height: any;
    className?: string | undefined;
    animation?: string | undefined;
    count?: number | undefined;
    spacing?: string | undefined;
    glassmorphism?: boolean | undefined;
}): JSX.Element;
export declare const SkeletonCard: ({ className }: {
    className?: string | undefined;
}) => JSX.Element;
export declare const SkeletonProfile: ({ className }: {
    className?: string | undefined;
}) => JSX.Element;
export declare const SkeletonList: ({ count, className }: {
    count?: number | undefined;
    className?: string | undefined;
}) => JSX.Element;
export declare const SkeletonTable: ({ rows, columns, className }: {
    rows?: number | undefined;
    columns?: number | undefined;
    className?: string | undefined;
}) => JSX.Element;
//# sourceMappingURL=PremiumSkeleton.d.ts.map