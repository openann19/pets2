import { Platform } from 'react-native'
import { logger } from '@pawfectmatch/core';
;
// @ts-ignore - react-native-purchases is optional
import Purchases from 'react-native-purchases';

export async function initRevenueCat(userId?: string) {
  try {
    await Purchases.configure({
      apiKey: Platform.select({
        ios: process.env.EXPO_PUBLIC_RC_IOS!,
        android: process.env.EXPO_PUBLIC_RC_ANDROID!,
      })!,
      appUserID: userId,
    });
  } catch (e) {
    logger.warn('RevenueCat not available:', { e });
  }
}
