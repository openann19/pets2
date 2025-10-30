import { Ionicons } from '@expo/vector-icons';
import type { AppTheme } from '@mobile/theme';
import { useTheme } from '@mobile/theme';
import { logger } from '@pawfectmatch/core';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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

const { width: screenWidth } = Dimensions.get('window');

type AdoptionStackParamList = {
  ApplicationReview: { applicationId: string };
};

type ApplicationReviewScreenProps = NativeStackScreenProps<
  AdoptionStackParamList,
  'ApplicationReview'
>;

interface Application {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantLocation: string;
  applicantExperience: string;
  homeType: string;
  hasChildren: boolean;
  hasOtherPets: boolean;
  yardSize: string;
  workSchedule: string;
  applicationDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'interview';
  petName: string;
  petPhoto: string;
  notes: string;
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

const ApplicationReviewScreen = ({ navigation, route }: ApplicationReviewScreenProps) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { applicationId } = route.params;
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApplication = async () => {
      try {
        setIsLoading(true);
        // Fetch application details from API
        const applicationData = await request<Application>(
          `/api/adoption/applications/${applicationId}`,
          {
            method: 'GET',
          },
        );

        setApplication(applicationData);
      } catch (error) {
        logger.error('Failed to load application:', { error });
        Alert.alert('Error', 'Failed to load application details');
      } finally {
        setIsLoading(false);
      }
    };

    loadApplication();
  }, [applicationId]);

  const handleStatusChange = (newStatus: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Update Application Status', `Change application status to ${newStatus}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            await request(`/api/adoption/applications/${applicationId}/review`, {
              method: 'POST',
              body: { status: newStatus },
            });

            if (application) {
              setApplication({ ...application, status: newStatus as any });
              Alert.alert('Success', `Application status updated to ${newStatus}`);
            }
          } catch (error) {
            logger.error('Failed to update application status:', { error });
            Alert.alert('Error', 'Failed to update application status');
          }
        },
      },
    ]);
  };

  const handleContactEmail = async () => {
    if (!application) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const emailUrl = `mailto:${application.applicantEmail}?subject=Adoption Application - ${application.petName}`;
      
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
        logger.info('Email opened', { email: application.applicantEmail });
      } else {
        Alert.alert(
          'Email Not Available',
          `Please email us at ${application.applicantEmail}`,
        );
      }
    } catch (error) {
      logger.error('Failed to open email', { error });
      Alert.alert(
        'Error',
        `Unable to open email app. Please contact ${application.applicantEmail} manually.`,
      );
    }
  };

  const handleContactCall = async () => {
    if (!application) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const phoneUrl = `tel:${application.applicantPhone}`;
      
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        await Linking.openURL(phoneUrl);
        logger.info('Phone call initiated', { phone: application.applicantPhone });
      } else {
        Alert.alert(
          'Call Not Available',
          `Please call ${application.applicantPhone}`,
        );
      }
    } catch (error) {
      logger.error('Failed to initiate call', { error });
      Alert.alert(
        'Error',
        `Unable to open phone app. Please call ${application.applicantPhone} manually.`,
      );
    }
  };

  const handleContactMessage = async () => {
    if (!application) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const smsUrl = `sms:${application.applicantPhone}`;
      
      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
        logger.info('SMS opened', { phone: application.applicantPhone });
      } else {
        Alert.alert(
          'SMS Not Available',
          `Please send a message to ${application.applicantPhone}`,
        );
      }
    } catch (error) {
      logger.error('Failed to open SMS', { error });
      Alert.alert(
        'Error',
        `Unable to open messaging app. Please message ${application.applicantPhone} manually.`,
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.colors.warning;
      case 'approved':
        return theme.colors.success;
      case 'rejected':
        return theme.colors.danger;
      case 'interview':
        return theme.colors.info;
      default:
        return theme.colors.onMuted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      case 'interview':
        return '💬';
      default:
        return '❓';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading application...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!application) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={80}
            color={theme.colors.danger}
          />
          <Text style={styles.emptyTitle}>Application Not Found</Text>
          <Text style={styles.emptySubtitle}>Unable to load application details</Text>
          <TouchableOpacity
            style={styles.backButton}
            testID="ApplicationReviewScreen-button-2"
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
            testID="ApplicationReviewScreen-button-2"
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
          <Text style={styles.headerTitle}>Application Review</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              testID="ApplicationReviewScreen-button-1"
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

        {/* Application Status */}
        <View style={styles.statusSection}>
          <BlurView
            intensity={20}
            style={styles.statusCard}
          >
            <View style={styles.statusHeader}>
              <View style={styles.petInfo}>
                <Image
                  source={{ uri: application.petPhoto }}
                  style={styles.petImage}
                />
                <View style={styles.petDetails}>
                  <Text style={styles.petName}>{application.petName}</Text>
                  <Text style={styles.applicantName}>{application.applicantName}</Text>
                </View>
              </View>
              <View
                style={StyleSheet.flatten([
                  styles.statusBadge,
                  {
                    backgroundColor: `${getStatusColor(application.status)}20`,
                  },
                ])}
              >
                <Text
                  style={StyleSheet.flatten([
                    styles.statusText,
                    { color: getStatusColor(application.status) },
                  ])}
                >
                  {getStatusIcon(application.status)}{' '}
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </Text>
              </View>
            </View>
            <Text style={styles.applicationDate}>
              Applied on {new Date(application.applicationDate).toLocaleDateString()}
            </Text>
          </BlurView>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <BlurView
            intensity={20}
            style={styles.sectionCard}
          >
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Ionicons
                  name="mail"
                  size={20}
                  color={theme.colors.info}
                />
                <Text style={styles.contactText}>{application.applicantEmail}</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons
                  name="call"
                  size={20}
                  color={theme.colors.success}
                />
                <Text style={styles.contactText}>{application.applicantPhone}</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons
                  name="location"
                  size={20}
                  color={theme.colors.danger}
                />
                <Text style={styles.contactText}>{application.applicantLocation}</Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Home & Lifestyle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Home & Lifestyle</Text>
          <BlurView
            intensity={20}
            style={styles.sectionCard}
          >
            <View style={styles.lifestyleGrid}>
              <View style={styles.lifestyleItem}>
                <Text style={styles.lifestyleLabel}>Home Type</Text>
                <Text style={styles.lifestyleValue}>{application.homeType}</Text>
              </View>
              <View style={styles.lifestyleItem}>
                <Text style={styles.lifestyleLabel}>Yard Size</Text>
                <Text style={styles.lifestyleValue}>{application.yardSize}</Text>
              </View>
              <View style={styles.lifestyleItem}>
                <Text style={styles.lifestyleLabel}>Work Schedule</Text>
                <Text style={styles.lifestyleValue}>{application.workSchedule}</Text>
              </View>
              <View style={styles.lifestyleItem}>
                <Text style={styles.lifestyleLabel}>Has Children</Text>
                <Text style={styles.lifestyleValue}>{application.hasChildren ? 'Yes' : 'No'}</Text>
              </View>
              <View style={styles.lifestyleItem}>
                <Text style={styles.lifestyleLabel}>Has Other Pets</Text>
                <Text style={styles.lifestyleValue}>{application.hasOtherPets ? 'Yes' : 'No'}</Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pet Experience</Text>
          <BlurView
            intensity={20}
            style={styles.sectionCard}
          >
            <Text style={styles.experienceText}>{application.applicantExperience}</Text>
          </BlurView>
        </View>

        {/* Application Questions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Questions</Text>
          <BlurView
            intensity={20}
            style={styles.sectionCard}
          >
            <View style={styles.questionsList}>
              {application.questions.map((qa, index) => (
                <View
                  key={index}
                  style={styles.questionItem}
                >
                  <Text style={styles.questionText}>{qa.question}</Text>
                  <Text style={styles.answerText}>{qa.answer}</Text>
                </View>
              ))}
            </View>
          </BlurView>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Notes</Text>
          <BlurView
            intensity={20}
            style={styles.sectionCard}
          >
            <Text style={styles.notesText}>
              {application.notes ||
                'No notes added yet. Add your observations about this applicant.'}
            </Text>
          </BlurView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              testID="ApplicationReviewScreen-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => {
                handleStatusChange('approved');
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
                  name="checkmark-circle"
                  size={24}
                  color={theme.colors.onSurface}
                />
                <Text style={styles.actionText}>Approve</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              testID="ApplicationReviewScreen-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => {
                handleStatusChange('interview');
              }}
            >
              <LinearGradient
                colors={theme.palette?.gradients?.info ?? [theme.colors.info, theme.colors.info]}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons
                  name="chatbubble"
                  size={24}
                  color={theme.colors.onSurface}
                />
                <Text style={styles.actionText}>Schedule Interview</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              testID="ApplicationReviewScreen-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => {
                handleStatusChange('rejected');
              }}
            >
              <LinearGradient
                colors={
                  theme.palette?.gradients?.danger ?? [theme.colors.danger, theme.colors.danger]
                }
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons
                  name="close-circle"
                  size={24}
                  color={theme.colors.onSurface}
                />
                <Text style={styles.actionText}>Reject</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Applicant</Text>
          <View style={styles.contactActions}>
            <TouchableOpacity
              style={styles.contactButton}
              testID="ApplicationReviewScreen-button-2"
              accessibilityLabel="Email applicant"
              accessibilityRole="button"
              onPress={handleContactEmail}
            >
              <LinearGradient
                colors={theme.palette?.gradients?.info ?? [theme.colors.info, theme.colors.info]}
                style={styles.contactButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons
                  name="mail"
                  size={20}
                  color={theme.colors.onSurface}
                />
                <Text style={styles.contactButtonText}>Email</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactButton}
              testID="ApplicationReviewScreen-button-2"
              accessibilityLabel="Call applicant"
              accessibilityRole="button"
              onPress={handleContactCall}
            >
              <LinearGradient
                colors={
                  theme.palette?.gradients?.success ?? [theme.colors.success, theme.colors.success]
                }
                style={styles.contactButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons
                  name="call"
                  size={20}
                  color={theme.colors.onSurface}
                />
                <Text style={styles.contactButtonText}>Call</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactButton}
              testID="ApplicationReviewScreen-button-2"
              accessibilityLabel="Message applicant"
              accessibilityRole="button"
              onPress={handleContactMessage}
            >
              <LinearGradient
                colors={theme.palette?.gradients?.info ?? [theme.colors.info, theme.colors.info]}
                style={styles.contactButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons
                  name="chatbubble"
                  size={20}
                  color={theme.colors.onSurface}
                />
                <Text style={styles.contactButtonText}>Message</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

function makeStyles(theme: AppTheme) {
  // Type assertion for runtime theme structure (radius exists at runtime, but types mismatch)
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
      fontSize: theme.typography.body.size * 1.125,
      color: theme.colors.onMuted,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      paddingHorizontal: theme.spacing.xl,
    },
    emptyTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onSurface,
      marginTop: theme.spacing.lg,
    },
    emptySubtitle: {
      fontSize: theme.typography.body.size,
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
      fontSize: theme.typography.h2.size * 0.875,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onSurface,
    },
    headerActions: {
      flexDirection: 'row' as const,
      gap: theme.spacing.sm,
    },
    headerButton: {
      padding: theme.spacing.xs,
    },
    statusSection: {
      padding: theme.spacing.lg,
    },
    statusCard: {
      borderRadius: themeRuntime.radius.md,
      overflow: 'hidden' as const,
      padding: theme.spacing.md,
    },
    statusHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: theme.spacing.xs,
    },
    petInfo: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
    petImage: {
      width: 50,
      height: 50,
      borderRadius: themeRuntime.radius.full,
      marginRight: theme.spacing.sm,
    },
    petDetails: {
      flex: 1,
    },
    petName: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: theme.colors.onSurface,
    },
    applicantName: {
      fontSize: 14,
      color: theme.colors.onMuted,
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
    applicationDate: {
      fontSize: 14,
      color: theme.colors.onMuted,
      textAlign: 'center' as const,
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
    contactInfo: {
      gap: theme.spacing.sm,
    },
    contactItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: theme.spacing.sm,
    },
    contactText: {
      fontSize: 16,
      color: theme.colors.onSurface,
      fontWeight: '500' as const,
    },
    lifestyleGrid: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: theme.spacing.sm,
    },
    lifestyleItem: {
      width: (screenWidth - theme.spacing['2xl'] - theme.spacing.sm) / 2,
      padding: theme.spacing.sm,
      backgroundColor: themeRuntime.colors.bgAlt ?? theme.colors.surface,
      borderRadius: themeRuntime.radius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    lifestyleLabel: {
      fontSize: 12,
      color: theme.colors.onMuted,
      fontWeight: '500' as const,
      marginBottom: theme.spacing.xs,
    },
    lifestyleValue: {
      fontSize: 14,
      color: theme.colors.onSurface,
      fontWeight: '600' as const,
    },
    experienceText: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.onSurface,
    },
    questionsList: {
      gap: theme.spacing.md,
    },
    questionItem: {
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    questionText: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    answerText: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.onMuted,
    },
    notesText: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.onMuted,
      fontStyle: 'italic' as const,
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
    contactActions: {
      flexDirection: 'row' as const,
      gap: theme.spacing.sm,
    },
    contactButton: {
      flex: 1,
      borderRadius: themeRuntime.radius.md,
      overflow: 'hidden' as const,
    },
    contactButtonGradient: {
      padding: theme.spacing.md,
      alignItems: 'center' as const,
    },
    contactButtonText: {
      color: theme.colors.onSurface,
      fontSize: 14,
      fontWeight: '600' as const,
      marginTop: theme.spacing.xs,
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

export default ApplicationReviewScreen;
