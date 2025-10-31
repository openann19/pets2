/**
 * 🎯 EXAMPLE USAGE - NotificationCenterSheet Integration
 * 
 * Example of how to integrate NotificationCenterSheet with SmartHeader
 */

import { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { SmartHeader } from '@/chrome/SmartHeader';
import { NotificationCenterSheet } from '@/components/effects/NotificationCenterSheet';
import type { HeaderContext } from '@/chrome/actions';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export function NotificationCenterExample() {
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Match!',
      message: 'Buddy likes you back',
      timestamp: '2m ago',
      read: false,
    },
    {
      id: '2',
      title: 'Message',
      message: 'Fluffy sent you a message',
      timestamp: '5m ago',
      read: false,
    },
    {
      id: '3',
      title: 'Profile View',
      message: 'Someone viewed your profile',
      timestamp: '10m ago',
      read: true,
    },
  ]);

  const handleMarkRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const ctx: HeaderContext = {
    screen: 'Home',
    userId: 'user123',
  };

  return (
    <View style={styles.container}>
      <SmartHeader
        ctx={ctx}
        title="Home"
        scrollY={undefined}
      />

      {/* Notification button in header actions */}
      <Pressable
        style={styles.button}
        onPress={() => setNotificationsVisible(true)}
      >
        <Text style={styles.buttonText}>Open Notifications</Text>
      </Pressable>

      {/* Notification Center Sheet */}
      <NotificationCenterSheet
        visible={notificationsVisible}
        notifications={notifications}
        onClose={() => setNotificationsVisible(false)}
        onMarkRead={handleMarkRead}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  button: {
    backgroundColor: '#4ECDC4',
    padding: 16,
    borderRadius: 12,
    margin: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

