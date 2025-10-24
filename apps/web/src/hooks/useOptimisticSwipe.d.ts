import { ApiResponse, SwipeFilters } from '@/types/common';
interface OptimisticSwipeOptions {
    onSuccess?: (data: ApiResponse<SwipeResult>) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
}
export declare function useOptimisticSwipe(options?: OptimisticSwipeOptions): {
    swipe: (petId: string, action: "like" | "pass" | "superlike") => void;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
};
export declare function useSwipeQueue(filters?: SwipeFilters): {
    queryKey: (string | SwipeFilters | undefined)[];
    queryFn: () => Promise<{
        success: boolean;
        data: unknown;
        error?: string;
    }>;
    staleTime: number;
    gcTime: number;
    retry: number;
    retryDelay: (attemptIndex: number) => number;
};
export declare function useMatches(): {
    queryKey: string[];
    queryFn: () => any;
    staleTime: number;
    gcTime: number;
    retry: number;
};
export {};
//# sourceMappingURL=useOptimisticSwipe.d.ts.map