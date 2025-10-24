export default function BackToTopButton({ threshold, className, variant, size, showOnMobile }: {
    threshold?: number | undefined;
    className?: string | undefined;
    variant?: string | undefined;
    size?: string | undefined;
    showOnMobile?: boolean | undefined;
}): JSX.Element;
export declare function useBackToTopButton(options?: {}): {
    showButton: boolean;
    scrollToTop: () => void;
    scrollToElement: (elementId: any) => void;
    scrollToPosition: (position: any) => void;
    scrollY: number;
    scrollProgress: number;
};
//# sourceMappingURL=BackToTopButton.d.ts.map