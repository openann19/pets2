/**
 * Voice Note Recorder Component
 * Records and sends voice notes using chatService
 */

import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { chatService } from "../../services/chatService";

interface VoiceRecorderProps {
  matchId: string;
  onVoiceNoteSent?: () => void;
  disabled?: boolean;
}

export function VoiceRecorder({
  matchId,
  onVoiceNoteSent,
  disabled = false,
}: VoiceRecorderProps): React.JSX.Element {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const durationTimer = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
      }
      stopRecording();
    };
  }, []);

  const startRecording = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start duration counter
      durationTimer.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

    } catch (error) {
      Alert.alert(
        "Permission Needed",
        "Microphone access is required to record voice notes."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
        durationTimer.current = null;
      }
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setDuration(0);
    setAudioBlob(null);
    audioChunksRef.current = [];
  };

  const sendVoiceNote = async () => {
    if (!audioBlob || isSending) return;

    setIsSending(true);
    try {
      await chatService.sendVoiceNote(matchId, audioBlob, duration);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onVoiceNoteSent?.();
      
      // Reset state
      setAudioBlob(null);
      setDuration(0);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to send voice note. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handlePressIn = () => {
    if (!disabled && !isRecording) {
      startRecording();
    }
  };

  const handlePressOut = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.recordButton, isRecording && styles.recordButtonActive]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Ionicons
          name={isRecording ? "stop" : "mic"}
          size={24}
          color={isRecording ? "#EF4444" : "#FFF"}
        />
      </TouchableOpacity>

      {isRecording && (
        <Text style={styles.duration}>{formatDuration(duration)}</Text>
      )}

      {!isRecording && audioBlob && (
        <View style={styles.audioPreview}>
          <Text style={styles.audioInfo}>Voice note ({formatDuration(duration)})</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={cancelRecording}
            >
              <Ionicons name="close" size={20} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.sendButton]}
              onPress={sendVoiceNote}
              disabled={isSending}
            >
              <Ionicons 
                name={isSending ? "hourglass" : "send"} 
                size={20} 
                color={isSending ? "#9CA3AF" : "#10B981"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isSending && (
        <Text style={styles.sending}>Sending...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 8,
  },
  recordButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonActive: {
    backgroundColor: "#DC2626",
  },
  duration: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
  },
  audioPreview: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 12,
    minWidth: 200,
  },
  audioInfo: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#374151",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sendButton: {
    backgroundColor: "#D1FAE5",
  },
  sending: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
  },
});

