import { Ionicons } from '@expo/vector-icons';
import type { AppTheme } from '@mobile/src/theme';
import { useTheme } from '@mobile/src/theme';
import { logger } from '@pawfectmatch/core';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { request } from '../../services/api';

// Runtime theme has radius (not radii) and bgAlt/surfaceAlt in colors
type RuntimeTheme = AppTheme & {
  radius: {
    'xs': number;
    'sm': number;
    'md': number;
    'lg': number;
    'xl': number;
    '2xl': number;
    'full': number;
    'pill': number;
    'none': number;
  };
  colors: AppTheme['colors'] & { bgAlt?: string; surfaceAlt?: string };
  palette?: {
    gradients?: {
      primary?: readonly [string, string];
      success?: readonly [string, string];
      info?: readonly [string, string];
      danger?: readonly [string, string];
    };
  };
};

type AdoptionStackParamList = {
  PetDetails: { petId: string };
};

type PetDetailsScreenProps = NativeStackScreenProps<AdoptionStackParamList, 'PetDetails'>;

interface PetDetails {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  size: string;
  description: string;
  photos: string[];
  personalityTags: string[];
  healthInfo: {
    vaccinated: boolean;
    spayedNeutered: boolean;
    microchipped: boolean;
  };
  status: 'active' | 'pending' | 'adopted' | 'paused';
  applications: number;
  views: number;
  featured: boolean;
  listedAt: string;
}

const PetDetailsScreen = ({ navigation, route }: PetDetailsScreenProps) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { petId } = route.params;
  const [pet, setPet] = useState<PetDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for now - would fetch from API
  useEffect(() => {
    const loadPetDetails = async () => {
      try {
        setIsLoading(true);
        // Fetch pet details from API
        const petData = await request<PetDetails>(`/api/adoption/pets/${petId}`, {
          method: 'GET',
        });

        setPet(petData);
      } catch (error) {
        logger.error('Failed to load pet details:', { error });
        Alert.alert('Error', 'Failed to load pet details');
      } finally {
        setIsLoading(false);
      }
    };

    loadPetDetails();
  }, [petId]);

  const handleStatusChange = (newStatus: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Change Status', `Change ${pet?.name}'s status to ${newStatus}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          if (pet) {
            setPet({ ...pet, status: newStatus as PetDetails['status'] });
            Alert.alert('Success', `Status updated to ${newStatus}`);
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'pending':
        return theme.colors.warning;
      case 'adopted':
        return theme.colors.info;
      case 'paused':
        return theme.colors.onMuted;
      default:
        return theme.colors.onMuted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return '✅';
      case 'pending':
        return '⏳';
      case 'adopted':
        return '🏠';
      case 'paused':
        return '⏸️';
      default:
        return '❓';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading pet details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={80}
            color={theme.colors.danger}
          />
          <Text style={styles.emptyTitle}>Pet Not Found</Text>
          <Text style={styles.emptySubtitle}>Unable to load pet details</Text>
          <TouchableOpacity
            style={styles.backButton}
            testID="PetDetailsScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            testID="PetDetailsScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pet Details</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              testID="PetDetailsScreen-button-1"
              accessibilityLabel="Button"
              accessibilityRole="button"
            >
              <Ionicons
                name="share-outline"
                size={20}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Photo */}
        <View style={styles.photoSection}>
          <Image
            source={{ uri: pet.photos[0] }}
            style={styles.mainPhoto}
          />
          {pet.featured && (
            <View style={styles.featuredBadge}>
              <Ionicons
                name="star"
                size={16}
                color={theme.colors.onSurface}
              />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </View>

        {/* Pet Info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.petName}>{pet.name}</Text>
            <View
              style={StyleSheet.flatten([
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(pet.status)}20` },
              ])}
            >
              <Text
                style={StyleSheet.flatten([
                  styles.statusText,
                  { color: getStatusColor(pet.status) },
                ])}
              >
                {getStatusIcon(pet.status)}{' '}
                {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
              </Text>
            </View>
          </View>

          <Text style={styles.petBreed}>{pet.breed}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{pet.applications}</Text>
              <Text style={styles.statLabel}>Applications</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{pet.views}</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{pet.featured ? '⭐' : '—'}</Text>
              <Text style={styles.statLabel}>Featured</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About {pet.name}</Text>
          <BlurView
            intensity={20}
            style={styles.sectionCard}
          >
            <Text style={styles.description}>{pet.description}</Text>
          </BlurView>
        </View>

        {/* Personality Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personality</Text>
          <BlurView
            intensity={20}
            style={styles.sectionCard}
          >
            <View style={styles.tagsContainer}>
              {pet.personalityTags.map((tag, index) => (
                <View
                  key={index}
                  style={styles.tag}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </BlurView>
        </View>

        {/* Health Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Information</Text>
          <BlurView
            intensity={20}
            style={styles.sectionCard}
          >
            <View style={styles.healthInfo}>
              <View style={styles.healthItem}>
                <Ionicons
                  name={pet.healthInfo.vaccinated ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={pet.healthInfo.vaccinated ? theme.colors.success : theme.colors.danger}
                />
                <Text style={styles.healthText}>Vaccinated</Text>
              </View>
              <View style={styles.healthItem}>
                <Ionicons
                  name={pet.healthInfo.spayedNeutered ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={pet.healthInfo.spayedNeutered ? theme.colors.success : theme.colors.danger}
                />
                <Text style={styles.healthText}>Spayed/Neutered</Text>
              </View>
              <View style={styles.healthItem}>
                <Ionicons
                  name={pet.healthInfo.microchipped ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={pet.healthInfo.microchipped ? theme.colors.success : theme.colors.danger}
                />
                <Text style={styles.healthText}>Microchipped</Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              testID="PetDetailsScreen-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => {
                Alert.alert('Coming Soon', 'Application review feature coming soon!');
              }}
            >
              <LinearGradient
                colors={theme.palette?.gradients?.info ?? [theme.colors.info, theme.colors.info]}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons
                  name="document-text"
                  size={24}
                  color={theme.colors.onSurface}
                />
                <Text style={styles.actionText}>Review Applications</Text>
                <Text style={styles.actionCount}>({pet.applications})</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              testID="PetDetailsScreen-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => {
                Alert.alert('Edit', 'Edit pet details coming soon!');
              }}
            >
              <LinearGradient
                colors={
                  theme.palette?.gradients?.success ?? [theme.colors.success, theme.colors.success]
                }
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons
                  name="create"
                  size={24}
                  color={theme.colors.onSurface}
                />
                <Text style={styles.actionText}>Edit Details</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage Status</Text>
          <BlurView
            intensity={20}
            style={styles.sectionCard}
          >
            <View style={styles.statusOptions}>
              {['active', 'pending', 'adopted', 'paused'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={StyleSheet.flatten([
                    styles.statusOption,
                    pet.status === status && styles.statusOptionActive,
                  ])}
                  testID="PetDetailsScreen-button-2"
                  accessibilityLabel="Interactive element"
                  accessibilityRole="button"
                  onPress={() => {
                    handleStatusChange(status);
                  }}
                >
                  <Text
                    style={StyleSheet.flatten([
                      styles.statusOptionText,
                      pet.status === status && styles.statusOptionTextActive,
                    ])}
                  >
                    {getStatusIcon(status)} {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

function makeStyles(theme: AppTheme) {
  const themeRuntime = theme as RuntimeTheme;

  return {
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    scrollView: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    loadingText: {
      fontSize: 18,
      color: theme.colors.onMuted,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      paddingHorizontal: theme.spacing.xl,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: theme.colors.onSurface,
      marginTop: theme.spacing.lg,
    },
    emptySubtitle: {
      fontSize: 16,
      color: theme.colors.onMuted,
      textAlign: 'center' as const,
      marginTop: theme.spacing.sm,
    },
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: theme.colors.onSurface,
    },
    headerActions: {
      flexDirection: 'row' as const,
      gap: theme.spacing.sm,
    },
    headerButton: {
      padding: theme.spacing.xs,
    },
    photoSection: {
      position: 'relative' as const,
    },
    mainPhoto: {
      width: '100%' as const,
      height: 300,
      resizeMode: 'cover' as const,
    },
    featuredBadge: {
      position: 'absolute' as const,
      top: theme.spacing.lg,
      left: theme.spacing.lg,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: theme.colors.warning,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: themeRuntime.radius.lg,
    },
    featuredText: {
      color: theme.colors.onSurface,
      fontSize: 12,
      fontWeight: 'bold' as const,
      marginLeft: theme.spacing.xs,
    },
    infoSection: {
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
    },
    nameRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: theme.spacing.xs,
    },
    petName: {
      fontSize: 28,
      fontWeight: 'bold' as const,
      color: theme.colors.onSurface,
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: themeRuntime.radius.md,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600' as const,
    },
    petBreed: {
      fontSize: 18,
      color: theme.colors.onMuted,
      marginBottom: theme.spacing.md,
    },
    statsRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-around' as const,
      paddingVertical: theme.spacing.md,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
    },
    statItem: {
      alignItems: 'center' as const,
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.onMuted,
    },
    section: {
      padding: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    sectionCard: {
      borderRadius: themeRuntime.radius.md,
      overflow: 'hidden' as const,
      padding: theme.spacing.md,
    },
    description: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.onSurface,
    },
    tagsContainer: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: theme.spacing.xs,
    },
    tag: {
      backgroundColor: themeRuntime.colors.surfaceAlt ?? theme.colors.surface,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: themeRuntime.radius.lg,
    },
    tagText: {
      fontSize: 14,
      color: theme.colors.onMuted,
      fontWeight: '500' as const,
    },
    healthInfo: {
      gap: theme.spacing.sm,
    },
    healthItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: theme.spacing.sm,
    },
    healthText: {
      fontSize: 16,
      color: theme.colors.onSurface,
      fontWeight: '500' as const,
    },
    actionsGrid: {
      gap: theme.spacing.sm,
    },
    actionButton: {
      borderRadius: themeRuntime.radius.md,
      overflow: 'hidden' as const,
    },
    actionGradient: {
      padding: theme.spacing.lg,
      alignItems: 'center' as const,
    },
    actionText: {
      color: theme.colors.onSurface,
      fontSize: 16,
      fontWeight: '600' as const,
      marginTop: theme.spacing.xs,
    },
    actionCount: {
      color: theme.colors.onSurface,
      fontSize: 14,
      opacity: 0.9,
      marginTop: theme.spacing.xs,
    },
    statusOptions: {
      gap: theme.spacing.xs,
    },
    statusOption: {
      padding: theme.spacing.md,
      backgroundColor: themeRuntime.colors.surfaceAlt ?? theme.colors.surface,
      borderRadius: themeRuntime.radius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statusOptionActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    statusOptionText: {
      fontSize: 16,
      color: theme.colors.onMuted,
      fontWeight: '500' as const,
      textAlign: 'center' as const,
    },
    statusOptionTextActive: {
      color: theme.colors.onSurface,
      fontWeight: '600' as const,
    },
    backButton: {
      padding: theme.spacing.xs,
    },
    backButtonText: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '600' as const,
    },
  };
}

export default PetDetailsScreen;
