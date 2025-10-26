import { Platform } from "react-native";
import Purchases from "react-native-purchases";

export async function initRevenueCat(userId?: string) {
  await Purchases.configure({
    apiKey: Platform.select({
      ios: process.env.EXPO_PUBLIC_RC_IOS!,
      android: process.env.EXPO_PUBLIC_RC_ANDROID!,
    })!,
    appUserID: userId,
  });
}

