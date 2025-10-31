/**
 * MatchMomentSkiaDemo – demo for Skia-draw particle burst (zero React rerenders)
 */

import React, { useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import { MatchMomentSkia } from '@/effects/particles/MatchMomentSkia';

export default function MatchMomentSkiaDemo() {
  const [show, setShow] = useState(false);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#09090b' }}>
      <Pressable onPress={() => setShow(true)} style={{ padding: 16, backgroundColor: '#ec4899', borderRadius: 12 }}>
        <Text style={{ color: '#fff', fontWeight: '800' }}>Trigger Match Moment (Skia Draw)</Text>
      </Pressable>
      {show && <MatchMomentSkia onDone={() => setShow(false)} enabled />}
    </View>
  );
}

