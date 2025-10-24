export default function PremiumBadge({ children, variant, size, glow, pulse, className, icon, iconPosition, }: {
    children: any;
    variant?: string | undefined;
    size?: string | undefined;
    glow?: boolean | undefined;
    pulse?: boolean | undefined;
    className?: string | undefined;
    icon: any;
    iconPosition?: string | undefined;
}): JSX.Element;
export declare const StatusBadge: ({ status, ...props }: {
    [x: string]: any;
    status: any;
}) => JSX.Element;
export declare const PremiumTierBadge: ({ tier, ...props }: {
    [x: string]: any;
    tier: any;
}) => JSX.Element;
//# sourceMappingURL=PremiumBadge.d.ts.map