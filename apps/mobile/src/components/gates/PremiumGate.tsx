import React from 'react';
import { View } from 'react-native';
import { usePremiumStatus } from '../../hooks/domains/premium/usePremiumStatus';

interface PremiumGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({ children, fallback }) => {
  const { isPremium } = usePremiumStatus();

  if (!isPremium) {
    return <View>{fallback || null}</View>;
  }

  return <>{children}</>;
};
