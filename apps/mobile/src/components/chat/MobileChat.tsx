import { Ionicons } from "@expo/vector-icons";
import type { Message } from "@pawfectmatch/core";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { MessageBubble } from "./MessageBubble";
import { MobileVoiceRecorder } from "./MobileVoiceRecorder";

interface MobileChatProps {
  messages: Message[];
  onSendMessage: (content: string, type?: Message["messageType"]) => void;
  currentUserId: string;
  otherUserName: string;
}

export function MobileChat({
  messages,
  onSendMessage,
  currentUserId,
  otherUserName,
}: MobileChatProps): React.JSX.Element {
  const { colors } = useTheme();
  const [inputText, setInputText] = useState("");
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSendText = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim(), "text");
      setInputText("");
    }
  };

  const handleVoiceMessage = (audioBlob: Blob, _duration: number) => {
    // For mobile, we'll create a data URL for the blob
    const reader = new FileReader();
    reader.onload = () => {
      const audioUrl = reader.result as string;
      onSendMessage(audioUrl, "voice");
    };
    reader.readAsDataURL(audioBlob);
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }) => {
    if (e.nativeEvent.key === "Enter") {
      handleSendText();
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {otherUserName}
        </Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isOwnMessage={item.sender._id === currentUserId}
            currentUserId={currentUserId}
          />
        )}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: colors.background, color: colors.text },
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder={`Message ${otherUserName}...`}
            placeholderTextColor={colors.gray500}
            multiline
            maxLength={500}
            onKeyPress={handleKeyPress}
          />

          <TouchableOpacity
            style={[styles.voiceButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              setShowVoiceRecorder(true);
            }}
          >
            <Ionicons name="mic" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim()
                  ? colors.primary
                  : colors.gray400,
              },
            ]}
            onPress={handleSendText}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Voice Recorder Modal */}
      {showVoiceRecorder ? (
        <MobileVoiceRecorder
          onSend={handleVoiceMessage}
          onCancel={() => {
            setShowVoiceRecorder(false);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    padding: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    minHeight: 40,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
