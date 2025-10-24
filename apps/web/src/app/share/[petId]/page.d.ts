export declare function generateMetadata({ params }: {
    params: any;
}): Promise<{
    title: string;
    description: string;
    openGraph?: never;
    twitter?: never;
    alternates?: never;
} | {
    title: string;
    description: string;
    openGraph: {
        title: string;
        description: string;
        images: {
            url: any;
            width: number;
            height: number;
            alt: string;
        }[];
        url: string;
        siteName: string;
        type: string;
    };
    twitter: {
        card: string;
        title: string;
        description: string;
        images: any[];
        creator: string;
    };
    alternates: {
        canonical: string;
    };
}>;
export default function SharePage({ params }: {
    params: any;
}): Promise<JSX.Element>;
//# sourceMappingURL=page.d.ts.map