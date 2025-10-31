import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-native';
import { Text } from '../ui/v2/Text';
import { Button } from '../ui/v2/Button';

interface PetProfileModalProps {
  visible: boolean;
  onClose: () => void;
  matchId: string;
  petName: string;
}

export const PetProfileModal: React.FC<PetProfileModalProps> = ({
  visible,
  onClose,
  matchId: _matchId,
  petName,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('chat');

  // Mock pet data - in real app this would come from API
  const petData = {
    name: petName,
    breed: 'Golden Retriever',
    age: 3,
    size: 'Large',
    energy: 'High',
    personality: ['Friendly', 'Playful', 'Loyal'],
    activities: ['Walking', 'Fetch', 'Swimming'],
    photos: [
      'https://example.com/pet1.jpg',
      'https://example.com/pet2.jpg',
    ],
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text
              variant="h4"
              tone="text"
              style={{ color: theme.colors.onSurface }}
            >
              {t('pet_profile') || 'Pet Profile'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Pet Info */}
            <View style={styles.petInfo}>
              <View style={styles.petHeader}>
                <View style={[styles.petAvatar, { backgroundColor: theme.colors.primary }]}>
                  <Ionicons name="paw" size={32} color={theme.colors.onPrimary} />
                </View>
                <View style={styles.petDetails}>
                  <Text
                    variant="h4"
                    tone="text"
                    style={{ color: theme.colors.onSurface, marginBottom: theme.spacing.xs }}
                  >
                    {petData.name}
                  </Text>
                  <Text
                    variant="body"
                    tone="textMuted"
                  >
                    {petData.breed}
                  </Text>
                </View>
              </View>

              {/* Pet Stats */}
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                  <Text
                    variant="caption"
                    tone="textMuted"
                    style={{ marginTop: theme.spacing.xs, marginBottom: theme.spacing.xs }}
                  >
                    Age
                  </Text>
                  <Text
                    variant="body"
                    tone="text"
                  >
                    {petData.age} years
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Ionicons name="resize-outline" size={20} color={theme.colors.primary} />
                  <Text
                    variant="caption"
                    tone="textMuted"
                    style={{ marginTop: theme.spacing.xs, marginBottom: theme.spacing.xs }}
                  >
                    Size
                  </Text>
                  <Text
                    variant="body"
                    tone="text"
                  >
                    {petData.size}
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Ionicons name="flash-outline" size={20} color={theme.colors.primary} />
                  <Text
                    variant="caption"
                    tone="textMuted"
                    style={{ marginTop: theme.spacing.xs, marginBottom: theme.spacing.xs }}
                  >
                    Energy
                  </Text>
                  <Text
                    variant="body"
                    tone="text"
                  >
                    {petData.energy}
                  </Text>
                </View>
              </View>

              {/* Personality Traits */}
              <View style={styles.section}>
                <Text
                  variant="h6"
                  tone="text"
                  style={{ marginBottom: theme.spacing.sm }}
                >
                  Personality
                </Text>
                <View style={styles.tagsContainer}>
                  {petData.personality.map((trait, index) => (
                    <View
                      key={index}
                      style={[styles.tag, { backgroundColor: theme.colors.primary }]}
                    >
                      <Text
                        variant="label"
                        tone="primary"
                        style={{ color: theme.colors.onPrimary }}
                      >
                        {trait}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Favorite Activities */}
              <View style={styles.section}>
                <Text
                  variant="h6"
                  tone="text"
                  style={{ marginBottom: theme.spacing.sm }}
                >
                  Favorite Activities
                </Text>
                <View style={styles.tagsContainer}>
                  {petData.activities.map((activity, index) => (
                    <View
                      key={index}
                      style={[styles.tag, { backgroundColor: theme.colors.surface }]}
                    >
                      <Text
                        variant="label"
                        tone="text"
                      >
                        {activity}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={[styles.actions, { borderTopColor: theme.colors.border }]}>
            <Button
              title={t('share_profile') || 'Share Profile'}
              onPress={() => {
                // Share pet profile
                console.log('Sharing pet profile');
              }}
              variant="primary"
              size="md"
              fullWidth
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  petInfo: {
    padding: 20,
  },
  petHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  petAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  petDetails: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
  },
});
