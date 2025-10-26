import React, { useCallback, useMemo, useEffect, useRef, useState } from "react";
import { View, FlatList, TextInput, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useExtendedTheme } from "../../hooks/useExtendedTheme";
import { MessageBubbleEnhanced } from "./MessageBubbleEnhanced";
import { MessageInput } from "./MessageInput";
import { SendSparkle, type SendSparkleHandle } from "../feedback/SendSparkle";
import { useShake } from "../../hooks/useShake";
import { useThreadJump } from "../../hooks/useThreadJump";
import ReplyPreviewBar, { type ReplyTarget } from "./ReplyPreviewBar";
import type { Message } from "@pawfectmatch/core";

interface MobileChatProps {
  messages: Message[];
  onSendMessage: (content: string, type?: Message["messageType"], replyTo?: { _id: string; author?: string; text?: string }) => void;
  currentUserId: string;
  otherUserName: string;
  matchId: string; // Added for attachments and voice notes
  onReply?: (message: Message) => void;
  onCopy?: (message: Message) => void;
  onReact?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onShowReadBy?: (message: Message) => void;
}

const ROW_HEIGHT = 80;

export function MobileChat({ 
  messages, 
  onSendMessage, 
  currentUserId, 
  otherUserName,
  matchId,
  onReply,
  onCopy,
  onReact,
  onDelete,
  onShowReadBy,
}: MobileChatProps) {
  const { colors, isDark } = useExtendedTheme();
  const [inputText, setInputText] = useState("");
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [highlightId, setHighlightId] = useState<string | undefined>(undefined);
  const flatListRef = useRef<FlatList<Message>>(null);
  
  // Advanced send animations
  const sendScale = useSharedValue(1);
  const sendBtnStyle = useAnimatedStyle(() => ({ transform: [{ scale: sendScale.value }] }));
  const sparkleRef = useRef<SendSparkleHandle>(null);
  const { style: inputShakeStyle, trigger: triggerShake } = useShake(10, 260);

  const pressBounce = useCallback(() => {
    "worklet";
    sendScale.value = 0.92;
    sendScale.value = withSpring(1, { damping: 14, stiffness: 380 });
  }, [sendScale]);

  const data = useMemo(() => [...messages].reverse(), [messages]);

  // Wire jump-to-thread functionality
  const { jumpTo } = useThreadJump(flatListRef, data, (id) => {
    setHighlightId(id);
    // clear highlight after a moment so future jumps re-trigger
    setTimeout(() => setHighlightId(undefined), 1200);
  });

  const handleReplyFromBubble = useCallback((m: Message) => {
    const authorName = m.sender?.firstName 
      ? `${m.sender.firstName}${m.sender.lastName ? ` ${m.sender.lastName}` : ''}`
      : (m.sender?._id === currentUserId ? "You" : "User");
    setReplyTarget({
      id: m._id,
      author: authorName,
      text: m.messageType === "text" ? m.content : (m.messageType ?? "Media"),
    });
  }, [currentUserId]);

  const keyExtractor = useCallback((m: Message) => m._id, []);
  const getItemLayout = useCallback((data: ArrayLike<Message> | null | undefined, index: number) => ({
    length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index
  }), []);

  const renderItem = useCallback(({ item }: { item: Message }) => (
    <MessageBubbleEnhanced
      message={item}
      isOwnMessage={item.sender._id === currentUserId}
      currentUserId={currentUserId}
      highlightId={highlightId}
      onReply={onReply || handleReplyFromBubble}
      onCopy={onCopy}
      onReact={onReact}
      onDelete={onDelete}
      onShowReadBy={onShowReadBy}
    />
  ), [currentUserId, highlightId, onReply, onCopy, onReact, onDelete, onShowReadBy, handleReplyFromBubble]);

  // only keep auto-scroll when user is near the bottom
  const isNearBottom = useRef(true);
  const onScroll = useCallback((e: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const pad = 64;
    isNearBottom.current =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - pad;
  }, []);

  const handleSendText = useCallback(async () => {
    const v = inputText.trim();
    if (!v) return;
    
    // optimistic bounce
    pressBounce();
    
    try {
      // Include reply target if set
      const replyToPayload = replyTarget ? {
        _id: replyTarget.id,
        author: replyTarget.author,
        text: replyTarget.text,
      } : undefined;
      
      onSendMessage(v, "text", replyToPayload);
      setInputText("");
      setReplyTarget(null); // Clear reply target after sending
      sparkleRef.current?.burst();
    } catch {
      triggerShake();
    }
    
    requestAnimationFrame(() => flatListRef.current?.scrollToEnd({ animated: true }));
  }, [inputText, replyTarget, onSendMessage, pressBounce, triggerShake]);

  useEffect(() => {
    if (isNearBottom.current && messages.length) {
      requestAnimationFrame(() => flatListRef.current?.scrollToEnd({ animated: true }));
    }
  }, [messages.length]);

  const handleVoiceMessage = useCallback((audioBlob: Blob, _duration: number) => {
    // Convert blob to base64 or handle appropriately
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      onSendMessage(base64data, "voice");
      requestAnimationFrame(() => flatListRef.current?.scrollToEnd({ animated: true }));
    };
    reader.readAsDataURL(audioBlob);
  }, [onSendMessage]);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.bgElevated }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{otherUserName}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        inverted
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.bg }}
        contentContainerStyle={styles.messagesContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={14}
        maxToRenderPerBatch={12}
        windowSize={8}
        removeClippedSubviews
      />

      <View style={[styles.inputContainer, { backgroundColor: colors.bgElevated }]}>
        {/* Reply Preview Bar */}
        {replyTarget ? (
          <ReplyPreviewBar
            target={replyTarget}
            visible
            onCancel={() => setReplyTarget(null)}
            onPress={() => {
              jumpTo(replyTarget.id);
            }}
            bg={isDark ? "#181818" : "#f9fafb"}
            border={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}
            text={isDark ? "#fff" : "#111"}
            sub={isDark ? "#9ca3af" : "#666"}
          />
        ) : null}

        {/* Enhanced Message Input with Attachments & Voice Notes */}
        <MessageInput
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSendText}
          placeholder={`Message ${otherUserName}...`}
          matchId={matchId}
          onAttachmentSent={() => {
            sparkleRef.current?.burst();
          }}
          onVoiceNoteSent={() => {
            sparkleRef.current?.burst();
          }}
        />
        
        {/* Send Sparkle Effect */}
        <SendSparkle ref={sparkleRef} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" },
  headerTitle: { fontSize: 18, fontWeight: "600", textAlign: "center" },
  messagesContent: { paddingVertical: 12 },
  inputContainer: { borderTopWidth: 1, borderTopColor: "#e0e0e0", padding: 16 },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginTop: 8 },
  textInput: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100, minHeight: 40 },
  voiceButton: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  sendButton: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
});
