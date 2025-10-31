/**
 * MatchMomentDemo – demo for particle burst effect
 */

import React, { useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import { MatchMoment } from '@/effects/particles/MatchMoment';

export default function MatchMomentDemo() {
  const [show, setShow] = useState(false);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#09090b' }}>
      <Pressable onPress={() => setShow(true)} style={{ padding: 16, backgroundColor: '#ec4899', borderRadius: 12 }}>
        <Text style={{ color: '#fff', fontWeight: '800' }}>Trigger Match Moment</Text>
      </Pressable>
      {show && <MatchMoment onDone={() => setShow(false)} enabled />}
    </View>
  );
}

