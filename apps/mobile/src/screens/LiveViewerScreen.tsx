import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import io from 'socket.io-client';
import { FLAGS } from '../config/flags';
import { api } from '../services/api';
import { logger } from '../services/logger';

interface LiveViewerScreenProps {
  navigation: any;
}

interface RouteParams {
  streamId?: string;
}

export default function LiveViewerScreen({}: LiveViewerScreenProps) {
  const theme = useTheme();
  const route = useRoute();
  const { streamId } = (route.params as RouteParams) || {};

  // Dynamic styles that depend on theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
    },
    videoArea: {
      flex: 2,
      backgroundColor: '#1a1a1a',
    },
    videoPlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    hint: {
      color: '#fff',
      opacity: 0.6,
      marginTop: 12,
      fontSize: 16,
    },
    viewerCount: {
      color: '#fff',
      opacity: 0.5,
      marginTop: 8,
      fontSize: 14,
    },
    chat: {
      flex: 1,
      backgroundColor: '#111',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: 12,
      maxHeight: 300,
    },
    chatHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    chatTitle: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
    message: {
      padding: 8,
      marginVertical: 2,
      borderRadius: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    messageText: {
      color: '#fff',
      fontSize: 14,
    },
    emptyChat: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      color: '#666',
      fontSize: 14,
    },
    inputRow: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
      paddingTop: 8,
    },
    input: {
      flex: 1,
      backgroundColor: '#1c1c1c',
      color: '#fff',
      padding: 10,
      borderRadius: 10,
      fontSize: 14,
      maxHeight: 100,
    },
    sendButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: '#fff',
      marginTop: 12,
      opacity: 0.7,
    },
    errorText: {
      color: '#ef4444',
      fontSize: 16,
      textAlign: 'center',
    },
  });

  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<Array<{ id: string; text: string; ts: number }>>([]);
  const [text, setText] = useState('');
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const [viewerCount, setViewerCount] = useState(0);

  const watchQuery = useQuery({
    queryKey: ['live-watch', streamId],
    queryFn: async () => {
      const data = await api.request(`/live/${streamId}/watch`, { method: 'GET' });
      return data as {
        roomName: string;
        token: string;
        url: string;
        title: string;
        coverUrl: string;
      };
    },
    enabled: !!streamId && FLAGS.GO_LIVE,
  });

  useEffect(() => {
    if (!watchQuery.data || !watchQuery.data.roomName) return;

    const { url, token, roomName } = watchQuery.data;
    const baseUrl = url.replace('/', '');
    const socket = io(`http://${baseUrl}/live:${roomName}`, {
      transports: ['websocket'],
    });

    socket.on('chat:message', (m: any) => {
      setMessages((prev) => [{ id: String(m.ts), text: m.text, ts: m.ts }, ...prev]);
    });

    socket.on('reaction', ({ emoji, ts }: { emoji: string; ts: number }) => {
      // Handle reaction
      logger.info('Live reaction received', { emoji, timestamp: String(ts) });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [watchQuery.data]);

  if (!streamId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No stream ID provided</Text>
      </View>
    );
  }

  if (watchQuery.isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#fff"
        />
        <Text style={styles.loadingText}>Connecting to stream...</Text>
      </View>
    );
  }

  if (watchQuery.error || !FLAGS.GO_LIVE) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to connect to stream</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.videoArea}>
        {/* Placeholder for video view */}
        <View style={styles.videoPlaceholder}>
          <Ionicons
            name="videocam"
            size={48}
            color="#fff"
            style={{ opacity: 0.5 }}
          />
          <Text style={styles.hint}>Live Stream</Text>
          <Text style={styles.viewerCount}>{viewerCount} viewers</Text>
        </View>
      </View>

      <View style={styles.chat}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatTitle}>Live Chat</Text>
          <TouchableOpacity
            testID="clear-chat-button"
            accessibilityLabel="Clear chat messages"
            accessibilityRole="button"
            onPress={() => {
              setMessages([]);
            }}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        <FlatList
          style={{ flex: 1 }}
          inverted
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <View style={styles.message}>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyText}>No messages yet</Text>
            </View>
          }
        />

        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Say hi..."
            placeholderTextColor="#666"
            style={styles.input}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={styles.sendButton}
            testID="send-message-button"
            accessibilityLabel="Send message"
            accessibilityRole="button"
            onPress={() => {
              if (!text.trim()) return;
              socketRef.current?.emit('chat:message', { text });
              setText('');
            }}
            disabled={!text.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
