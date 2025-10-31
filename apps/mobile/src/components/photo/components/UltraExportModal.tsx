/**
 * Ultra Export Modal Component
 * Displays ultra export variants in a modal
 */
import React from 'react';
import { View, StyleSheet, Text, Modal, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { BouncePressable } from '../../micro';
import { SmartImage } from '../../common/SmartImage';

interface UltraVariant {
  outUri: string;
  ratio: string;
  kind: string;
  method: string;
}

interface UltraExportModalProps {
  visible: boolean;
  variants: UltraVariant[];
  onClose: () => void;
  onSaveAll: () => void;
}

export const UltraExportModal: React.FC<UltraExportModalProps> = ({
  visible,
  variants,
  onClose,
  onSaveAll,
}) => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        modalOverlay: {
          flex: 1,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          backgroundColor: 'rgba(0,0,0,0.5)',
        },
        modalContainer: {
          backgroundColor: theme.colors.surface,
          margin: theme.spacing.md,
          borderRadius: theme.radii.lg,
          padding: theme.spacing.md,
          maxWidth: 400,
          maxHeight: '80%',
        },
        modalContent: {
          flex: 1,
        },
        modalHeader: {
          flexDirection: 'row' as const,
          justifyContent: 'space-between' as const,
          alignItems: 'center' as const,
          marginBottom: theme.spacing.md,
        },
        modalTitle: {
          fontSize: 18,
          fontWeight: 'bold' as const,
          marginBottom: theme.spacing.md,
          textAlign: 'center' as const,
          color: theme.colors.onSurface,
        },
        modalScroll: {
          maxHeight: 400,
        },
        modalSubtitle: {
          fontSize: 14,
          color: theme.colors.onMuted,
          marginBottom: theme.spacing.md,
          textAlign: 'center' as const,
        },
        ratioSection: {
          marginBottom: theme.spacing.lg,
        },
        ratioTitle: {
          fontSize: 14,
          fontWeight: '600' as const,
          color: theme.colors.onSurface,
          marginBottom: theme.spacing.sm,
        },
        variantGrid: {
          flexDirection: 'row' as const,
          flexWrap: 'wrap' as const,
          gap: theme.spacing.sm,
        },
        variantCard: {
          width: '48%',
          backgroundColor: theme.colors.surfaceAlt || theme.colors.surface,
          borderRadius: theme.radii.md,
          overflow: 'hidden' as const,
          marginBottom: theme.spacing.sm,
        },
        variantImage: {
          width: '100%',
          aspectRatio: 1,
        },
        variantKind: {
          fontSize: 10,
          color: theme.colors.onMuted,
          padding: theme.spacing.xs,
        },
        variantMethod: {
          fontSize: 10,
          color: theme.colors.onMuted,
          paddingHorizontal: theme.spacing.xs,
          paddingBottom: theme.spacing.xs,
        },
        modalFooter: {
          flexDirection: 'row' as const,
          justifyContent: 'space-around' as const,
          marginTop: theme.spacing.md,
        },
        modalButton: {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radii.md,
          minWidth: 100,
        },
        modalButtonSecondary: {
          backgroundColor: theme.colors.surface,
        },
        modalButtonPrimary: {
          backgroundColor: theme.colors.primary,
        },
        modalButtonText: {
          fontSize: 16,
          fontWeight: '600' as const,
          textAlign: 'center' as const,
          color: theme.colors.onSurface,
        },
      }),
    [theme],
  );

  const ratioLabels: Record<string, string> = {
    '1:1': '1080x1080',
    '4:5': '1080x1350',
    '9:16': '1080x1920',
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={80} style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Export Complete</Text>
            <BouncePressable onPress={onClose} style={{ padding: theme.spacing.sm }}>
              <Ionicons name="close" size={24} color={theme.colors.onSurface} />
            </BouncePressable>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalSubtitle}>Generated {variants.length} publish-ready variants</Text>

            {/* Group by ratio */}
            {['1:1', '4:5', '9:16'].map((ratio) => {
              const ratioVariants = variants.filter((v) => v.ratio === ratio);
              if (ratioVariants.length === 0) return null;

              return (
                <View key={ratio} style={styles.ratioSection}>
                  <Text style={styles.ratioTitle}>
                    {ratio} ({ratioLabels[ratio]})
                  </Text>
                  <View style={styles.variantGrid}>
                    {ratioVariants.map((variant, idx) => (
                      <View key={idx} style={styles.variantCard}>
                        <SmartImage source={{ uri: variant.outUri }} style={styles.variantImage} rounded={8} />
                        <Text style={styles.variantKind}>{variant.kind}</Text>
                        <Text style={styles.variantMethod}>{variant.method}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.modalFooter}>
            <BouncePressable onPress={onClose} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </BouncePressable>
            <BouncePressable
              onPress={onSaveAll}
              style={[styles.modalButton, styles.modalButtonPrimary]}
            >
              <Text style={styles.modalButtonText}>Save All</Text>
            </BouncePressable>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

