/**
 * Post Preview Component
 * Shows a preview of the post before submission
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import type { PostCreationData } from '../../services/postCreationService';

interface PostPreviewProps {
  postData: PostCreationData;
  onClose: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export const PostPreview: React.FC<PostPreviewProps> = ({
  postData,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
    },
    closeButton: {
      padding: theme.spacing.sm,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    contentText: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onSurface,
      lineHeight: theme.typography.body.size * 1.5,
    },
    imageGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    imageContainer: {
      width: '48%',
      aspectRatio: 1,
      borderRadius: theme.radii.md,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    activityCard: {
      backgroundColor: theme.palette.brand[100] || theme.colors.primary + '10',
      borderRadius: theme.radii.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    activityTitle: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.primary,
      marginBottom: theme.spacing.sm,
    },
    activityDescription: {
      fontSize: theme.typography.body.size * 0.875,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    activityDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    activityDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    activityDetailText: {
      fontSize: theme.typography.body.size * 0.75,
      color: theme.colors.onMuted,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    tag: {
      backgroundColor: theme.colors.bg,
      borderRadius: theme.radii.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tagText: {
      fontSize: theme.typography.body.size * 0.75,
      color: theme.colors.onSurface,
    },
    footer: {
      padding: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radii.lg,
    },
    cancelButton: {
      backgroundColor: theme.colors.bg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
    },
    cancelButtonText: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
    },
    submitButtonText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
    },
    buttonIcon: {
      marginRight: theme.spacing.sm,
    },
    disabledButton: {
      opacity: 0.6,
    },
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Preview Post</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Ionicons
            name="close"
            size={24}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Content Section */}
        {postData.content && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content</Text>
            <Text style={styles.contentText}>{postData.content}</Text>
          </View>
        )}

        {/* Images Section */}
        {postData.images && postData.images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Images ({postData.images.length})</Text>
            <View style={styles.imageGrid}>
              {postData.images.map((image, index) => (
                <View
                  key={index}
                  style={styles.imageContainer}
                >
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Activity Section */}
        {postData.activityDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity Details</Text>
            <View style={styles.activityCard}>
              <Text style={styles.activityTitle}>{postData.activityDetails.title}</Text>
              <Text style={styles.activityDescription}>{postData.activityDetails.description}</Text>
              <View style={styles.activityDetails}>
                <View style={styles.activityDetail}>
                  <Ionicons
                    name="calendar"
                    size={16}
                    color={theme.colors.onMuted}
                  />
                  <Text style={styles.activityDetailText}>
                    {formatDate(postData.activityDetails.date)}
                  </Text>
                </View>
                {postData.activityDetails.location && (
                  <View style={styles.activityDetail}>
                    <Ionicons
                      name="location"
                      size={16}
                      color={theme.colors.onMuted}
                    />
                    <Text style={styles.activityDetailText}>
                      {postData.activityDetails.location}
                    </Text>
                  </View>
                )}
                {postData.activityDetails.maxParticipants && (
                  <View style={styles.activityDetail}>
                    <Ionicons
                      name="people"
                      size={16}
                      color={theme.colors.onMuted}
                    />
                    <Text style={styles.activityDetailText}>
                      Max {postData.activityDetails.maxParticipants}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Tags Section */}
        {postData.tags && postData.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {postData.tags.map((tag, index) => (
                <View
                  key={index}
                  style={styles.tag}
                >
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton, isLoading && styles.disabledButton]}
            onPress={onSubmit}
            disabled={isLoading}
          >
            <Ionicons
              name="send"
              size={18}
              color={theme.colors.onPrimary}
              style={styles.buttonIcon}
            />
            <Text style={styles.submitButtonText}>{isLoading ? 'Posting...' : 'Post'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
