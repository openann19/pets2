/**
 * NotificationCenterDemo – demo for notification center sheet
 */

import React, { useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import { NotificationCenterSheet, type Notice } from '@/chrome/NotificationCenterSheet';

export default function NotificationCenterDemo() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Notice[]>([
    { id: '1', title: 'New match with Bella 🐾', unread: true },
    { id: '2', title: '3 new messages', body: 'Alex: Hey! Want to meet at the park?', unread: true },
    { id: '3', title: 'Community: 12 new posts', unread: false },
  ]);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#09090b' }}>
      <Pressable onPress={() => setOpen(true)} style={{ padding: 16, backgroundColor: '#ec4899', borderRadius: 12 }}>
        <Text style={{ color: '#fff', fontWeight: '800' }}>Open Notification Center</Text>
      </Pressable>
      <NotificationCenterSheet
        visible={open}
        data={data}
        onClose={() => setOpen(false)}
        onItemOpen={n => {
          /* navigate */
          setOpen(false);
        }}
        onItemRead={n => setData(d => d.map(x => (x.id === n.id ? { ...x, unread: false } : x)))}
      />
    </View>
  );
}

