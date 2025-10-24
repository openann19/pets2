declare module '@stripe/stripe-react-native' {
  export interface InitPaymentSheetParams {
    merchantDisplayName: string;
    paymentIntentClientSecret: string;
    allowsDelayedPaymentMethods?: boolean;
    defaultBillingDetails?: {
      name?: string;
      email?: string;
    };
  }

  export interface PaymentSheetResult {
    error?: {
      message?: string;
    };
  }

  export function initPaymentSheet(params: InitPaymentSheetParams): Promise<PaymentSheetResult>;

  export function presentPaymentSheet(): Promise<PaymentSheetResult>;
}
