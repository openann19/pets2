export default function PullToRefresh({ onRefresh, threshold, resistance, children, className, disabled, showPawAnimation }: {
    onRefresh: any;
    threshold?: number | undefined;
    resistance?: number | undefined;
    children: any;
    className?: string | undefined;
    disabled?: boolean | undefined;
    showPawAnimation?: boolean | undefined;
}): JSX.Element;
export declare function usePullToRefresh(onRefresh: any): {
    isRefreshing: boolean;
    lastRefresh: null;
    timeSinceLastRefresh: number | null;
    handleRefresh: () => Promise<void>;
    canRefresh: boolean;
};
//# sourceMappingURL=PullToRefresh.d.ts.map