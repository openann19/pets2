/**
 * LiquidIndicatorFallback – React Native fallback
 */

import React from 'react';
import { View } from 'react-native';

export function LiquidIndicatorFallback({ width, height = 3 }: { width: number; height?: number }) {
  return <View style={{ width, height, backgroundColor: '#ec4899', borderRadius: height / 2 }} />;
}

