export default function NavigationUnderline({ items, activeItem, variant, size, className, onItemClick }: {
    items: any;
    activeItem: any;
    variant?: string | undefined;
    size?: string | undefined;
    className?: string | undefined;
    onItemClick: any;
}): JSX.Element;
export declare function useNavigation(items: any): {
    activeItem: any;
    setActive: (itemId: any) => void;
    getActiveItem: () => any;
    items: any;
};
export declare const NAVIGATION_ITEMS: {
    main: {
        id: string;
        label: string;
        href: string;
        icon: JSX.Element;
    }[];
    admin: {
        id: string;
        label: string;
        href: string;
        icon: JSX.Element;
    }[];
};
//# sourceMappingURL=NavigationUnderline.d.ts.map