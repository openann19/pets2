import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { VideoView } from 'livekit-react-native';
import { useLiveStream } from '../../hooks/useLiveStream';
import { useNavigation, useRoute } from '@react-navigation/native';

interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
}

export function LiveStreamViewerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { streamId } = route.params as { streamId: string };
  
  const {
    room,
    isConnected,
    participants,
    viewerCount,
    error,
    watchStream,
    sendChatMessage,
    sendReaction,
  } = useLiveStream();

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [pinnedMessages, setPinnedMessages] = useState<any[]>([]);

  useEffect(() => {
    if (streamId) {
      watchStream(streamId);
    }

    return () => {
      // Cleanup handled in hook
    };
  }, [streamId]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendChatMessage(messageInput);
      setMessageInput('');
    }
  };

  const handleReaction = (emoji: string) => {
    sendReaction(emoji);
  };

  const quickReactions = ['❤️', '🔥', '😍', '👏', '🎉'];

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Connecting...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with live indicator */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Text style={styles.viewerCount}>{viewerCount} watching</Text>
      </View>

      {/* Video streams */}
      <View style={styles.videoContainer}>
        {participants.length > 0 ? (
          participants.map((participant) => {
            const videoTrack = participant.videoTrackPublications.values().next().value?.track;
            return (
              videoTrack ? (
                <VideoView
                  key={participant.sid}
                  style={styles.videoStream}
                  track={videoTrack}
                />
              ) : (
                <View key={participant.sid} style={styles.noStreamView}>
                  <Text style={styles.noStreamText}>No video</Text>
                </View>
              )
            );
          })
        ) : (
          <View style={styles.noStreamView}>
            <Text style={styles.noStreamText}>Waiting for stream...</Text>
          </View>
        )}
      </View>

      {/* Pinned messages */}
      {pinnedMessages.length > 0 && (
        <View style={styles.pinnedContainer}>
          <Text style={styles.pinnedLabel}>📌 Pinned</Text>
          <FlatList
            data={pinnedMessages}
            horizontal
            keyExtractor={(item) => item.messageId}
            renderItem={({ item }) => (
              <View style={styles.pinnedMessage}>
                <Text style={styles.pinnedText}>{item.content}</Text>
              </View>
            )}
          />
        </View>
      )}

      {/* Quick reactions */}
      <View style={styles.reactionsContainer}>
        {quickReactions.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            style={styles.reactionButton}
            onPress={() => handleReaction(emoji)}
          >
            <Text style={styles.reactionEmoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chat input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={messageInput}
            onChangeText={setMessageInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Chat messages */}
      <View style={styles.chatContainer}>
        <FlatList
          data={chatMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.chatMessage}>
              <Text style={styles.chatContent}>{item.content}</Text>
            </View>
          )}
          inverted
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  closeButton: {
    color: '#fff',
    fontSize: 24,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff0000',
    marginRight: 6,
  },
  liveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  viewerCount: {
    color: '#fff',
    fontSize: 12,
  },
  videoContainer: {
    flex: 1,
  },
  videoStream: {
    flex: 1,
    backgroundColor: '#000',
  },
  noStreamView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noStreamText: {
    color: '#fff',
    fontSize: 16,
  },
  pinnedContainer: {
    backgroundColor: 'rgba(255,255,0,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  pinnedLabel: {
    color: '#ff0',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pinnedMessage: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  pinnedText: {
    color: '#fff',
    fontSize: 12,
  },
  reactionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  reactionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionEmoji: {
    fontSize: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  chatContainer: {
    maxHeight: 150,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  chatMessage: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  chatContent: {
    color: '#fff',
    fontSize: 14,
  },
});

