export default function LocaleSwitcher({ locales, currentLocale, onLocaleChange, variant, showFlags, showNativeNames, className }: {
    locales?: {
        code: string;
        name: string;
        flag: string;
        nativeName: string;
    }[] | undefined;
    currentLocale?: string | undefined;
    onLocaleChange: any;
    variant?: string | undefined;
    showFlags?: boolean | undefined;
    showNativeNames?: boolean | undefined;
    className?: string | undefined;
}): JSX.Element;
export declare function useLocale(): {
    currentLocale: string;
    availableLocales: {
        code: string;
        name: string;
        flag: string;
        nativeName: string;
    }[];
    changeLocale: (localeCode: any) => void;
    getLocale: (code: any) => {
        code: string;
        name: string;
        flag: string;
        nativeName: string;
    } | undefined;
    getCurrentLocale: () => {
        code: string;
        name: string;
        flag: string;
        nativeName: string;
    } | undefined;
};
//# sourceMappingURL=LocaleSwitcher.d.ts.map