/**
 * Photo Upload Component
 * Production-hardened component for uploading pet photos
 * Features: Image picker integration, preview, accessibility
 */

import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, type AppTheme } from '@/theme';

interface PhotoUploadProps {
  selectedPhoto: string | null;
  onPickImage: () => Promise<void>;
}

export function PhotoUpload({ selectedPhoto, onPickImage }: PhotoUploadProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Pet Photo (Optional)</Text>
      <Text style={styles.sectionSubtitle}>Add a photo for better bio analysis</Text>
      
      <TouchableOpacity
        style={styles.photoUpload}
        onPress={onPickImage}
        accessibilityLabel="Upload pet photo"
        accessibilityRole="button"
        testID="PhotoUpload-button"
      >
        {selectedPhoto ? (
          <Image
            source={{ uri: selectedPhoto }}
            style={styles.selectedPhoto}
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons
              name="camera"
              size={40}
              color={theme.colors.onMuted}
            />
            <Text style={styles.photoPlaceholderText}>Add Photo for Better Analysis</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      padding: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    sectionSubtitle: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
      marginBottom: theme.spacing.lg,
    },
    photoUpload: {
      height: 200,
      borderRadius: theme.radii.lg,
      overflow: 'hidden',
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
    },
    selectedPhoto: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    photoPlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    photoPlaceholderText: {
      marginTop: theme.spacing.sm,
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
      textAlign: 'center',
    },
  });
}

