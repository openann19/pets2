import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import Purchases, { CustomerInfo, PurchasesOffering, PurchasesPackage } from "react-native-purchases";

type PremiumCtx = {
  isPremium: boolean;
  refresh: () => Promise<void>;
  purchase: () => Promise<void>;
  restore: () => Promise<void>;
};

const Ctx = createContext<PremiumCtx>({
  isPremium: false,
  refresh: async () => {},
  purchase: async () => {},
  restore: async () => {},
});

export const usePremium = () => useContext(Ctx);

interface PremiumProviderProps {
  children: React.ReactNode;
}

export function PremiumProvider({ children }: PremiumProviderProps) {
  const [isPremium, setIsPremium] = useState(false);

  const refresh = async () => {
    try {
      const { customerInfo } = await Purchases.getCustomerInfo();
      setIsPremium(!!customerInfo.entitlements.active["pro"]);
    } catch (error) {
      console.error("Failed to refresh premium status:", error);
    }
  };

  const purchase = async () => {
    try {
      const offerings: PurchasesOffering | null = await Purchases.getOfferings();
      const pkg: PurchasesPackage | undefined = offerings?.current?.availablePackages[0];
      if (!pkg) throw new Error("No package available");
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      setIsPremium(!!customerInfo.entitlements.active["pro"]);
    } catch (error) {
      console.error("Failed to purchase:", error);
      throw error;
    }
  };

  const restore = async () => {
    try {
      const { customerInfo } = await Purchases.restorePurchases();
      setIsPremium(!!customerInfo.entitlements.active["pro"]);
    } catch (error) {
      console.error("Failed to restore purchases:", error);
      throw error;
    }
  };

  useEffect(() => {
    refresh().catch(() => null);
  }, []);

  return <Ctx.Provider value={{ isPremium, refresh, purchase, restore }}>{children}</Ctx.Provider>;
}

export function usePremiumGate() {
  const { isPremium } = usePremium();
  return { canUsePremium: isPremium };
}

