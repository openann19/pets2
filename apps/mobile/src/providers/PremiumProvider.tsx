import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
// @ts-expect-error - react-native-purchases may not be installed
import Purchases, { CustomerInfo, PurchasesOffering, PurchasesPackage } from "react-native-purchases";
import { logger } from "../services/logger";

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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Failed to refresh premium status", { error: err });
    }
  };

  const purchase = async () => {
    try {
      const offerings: PurchasesOffering | null = await Purchases.getOfferings();
      const pkg: PurchasesPackage | undefined = offerings?.current?.availablePackages[0];
      if (!pkg) throw new Error("No package available");
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      setIsPremium(!!customerInfo.entitlements.active["pro"]);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Failed to purchase", { error: err });
      throw err;
    }
  };

  const restore = async () => {
    try {
      const { customerInfo } = await Purchases.restorePurchases();
      setIsPremium(!!customerInfo.entitlements.active["pro"]);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Failed to restore purchases", { error: err });
      throw err;
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

