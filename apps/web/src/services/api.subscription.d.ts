/**
 * Subscription API client types
 */
export interface SubscriptionData {
    id: string;
    status: string;
    plan: {
        id: string;
        name: string;
        price?: number;
    };
    currentPeriodEnd: string;
    cancelAtPeriodEnd?: boolean;
    billingCycleAnchor?: string;
}
export interface CheckoutSessionData {
    id: string;
    url: string;
    mode: string;
    status: string;
}
export interface UsageStatsData {
    currentBillingPeriod: {
        start: string;
        end: string;
    };
    usage: {
        videoCallMinutes: number;
        matchBoosts: number;
        messagesPremium: number;
    };
    limits: {
        videoCallMinutes: number;
        matchBoosts: number;
        messagesPremium: number;
    };
}
export interface CheckoutSessionRequest {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, unknown>;
    mode?: 'subscription' | 'payment';
}
export interface WebhookEventData {
    type: string;
    data: {
        object: Record<string, unknown>;
    };
}
export interface SubscriptionUpdateRequest {
    priceId: string;
    prorationBehavior?: string;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
}
export interface SubscriptionApi {
    createCheckoutSession(data: CheckoutSessionRequest): Promise<ApiResponse<CheckoutSessionData>>;
    getCurrentSubscription(): Promise<ApiResponse<{
        subscription: SubscriptionData;
    }>>;
    getUsageStats(): Promise<ApiResponse<UsageStatsData>>;
    cancelSubscription(subscriptionId: string): Promise<ApiResponse<SubscriptionData>>;
    reactivateSubscription(subscriptionId: string): Promise<ApiResponse>;
    getPlans(): Promise<ApiResponse<Array<{
        id: string;
        name: string;
        price: number;
    }>>>;
    handleWebhook(event: WebhookEventData): Promise<ApiResponse>;
    updateSubscription(subscriptionId: string, data: SubscriptionUpdateRequest): Promise<ApiResponse<SubscriptionData>>;
    updatePaymentMethod(paymentMethodId: string): Promise<ApiResponse>;
}
//# sourceMappingURL=api.subscription.d.ts.map