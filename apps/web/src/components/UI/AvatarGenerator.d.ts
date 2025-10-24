export declare function AvatarGenerator({ name, size, className, showInitials, gradient, }: {
    name: any;
    size?: string | undefined;
    className?: string | undefined;
    showInitials?: boolean | undefined;
    gradient: any;
}): JSX.Element;
export declare function PetAvatar({ petName, species, personality, size, className, ...props }: {
    [x: string]: any;
    petName: any;
    species?: string | undefined;
    personality?: string | undefined;
    size?: string | undefined;
    className?: string | undefined;
}): JSX.Element;
export declare function UserAvatar({ user, size, className, fallbackToInitials, ...props }: {
    [x: string]: any;
    user: any;
    size?: string | undefined;
    className?: string | undefined;
    fallbackToInitials?: boolean | undefined;
}): JSX.Element;
export declare function AvatarGroup({ items, maxVisible, size, className, }: {
    items: any;
    maxVisible?: number | undefined;
    size?: string | undefined;
    className?: string | undefined;
}): JSX.Element;
//# sourceMappingURL=AvatarGenerator.d.ts.map