/**
 * Attachment Preview Component
 * Displays preview of attachments before sending
 */

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../theme/Provider";
import { Theme } from '../../theme/unified-theme';

export interface AttachmentPreviewProps {
  uri: string;
  type: "image" | "video" | "file";
  name?: string;
  size?: number;
  onRemove: () => void;
  uploading?: boolean;
}

export function AttachmentPreview({
  uri,
  type,
  name,
  size,
  onRemove,
  uploading = false,
}: AttachmentPreviewProps): JSX.Element {
  const { colors } = useTheme();

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string): string => {
    switch (fileType) {
      case "image":
        return "image";
      case "video":
        return "videocam";
      case "file":
      default:
        return "document";
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={StyleSheet.flatten([
          styles.preview,
          { backgroundColor: colors.background },
        ])}
      >
        {type === "image" && (
          <Image source={{ uri }} style={styles.image} resizeMode="cover" />
        )}

        {type !== "image" && (
          <View style={styles.fileIcon}>
            <Ionicons
              name={getFileIcon(type) as any}
              size={40}
              color={colors.primary}
            />
          </View>
        )}

        {uploading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onRemove}
          accessibilityLabel="Remove attachment"
          accessibilityRole="button"
        >
          <Ionicons name="close-circle" size={24} color="Theme.colors.neutral[0]" />
        </TouchableOpacity>
      </View>

      {name && (
        <Text
          style={StyleSheet.flatten([
            styles.fileName,
            { color: colors.textMuted },
          ])}
        >
          {name}
        </Text>
      )}

      {size && (
        <Text
          style={StyleSheet.flatten([
            styles.fileSize,
            { color: colors.textMuted },
          ])}
        >
          {formatFileSize(size)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginBottom: 8,
  },
  preview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  fileIcon: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
  },
  fileName: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  fileSize: {
    fontSize: 10,
    marginTop: 2,
    textAlign: "center",
  },
});
