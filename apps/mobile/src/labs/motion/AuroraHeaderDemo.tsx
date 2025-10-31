/**
 * AuroraHeaderDemo – demo for aurora sheen effect
 */

import React from 'react';
import { View, Text } from 'react-native';
import { AuroraSheen } from '@/chrome/AuroraSheen';

export default function AuroraHeaderDemo() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <View style={{ height: 60, justifyContent: 'flex-end', paddingHorizontal: 12, paddingBottom: 8 }}>
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18 }}>PawfectMatch</Text>
      </View>
      <AuroraSheen height={60} />
    </View>
  );
}

