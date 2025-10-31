/**
 * Application Tracking Screen
 * Comprehensive dashboard for tracking adoption application status
 */

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logger } from '@pawfectmatch/core';
import { matchesAPI } from '../../services/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type AdoptionStackParamList = {
  ApplicationTracking: { applicationId?: string };
};

type Props = NativeStackScreenProps<AdoptionStackParamList, 'ApplicationTracking'>;

interface ApplicationStatus {
  id: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed' | 'withdrawn';
  petId: string;
  petName: string;
  petPhoto?: string;
  submittedAt: string;
  reviewedAt?: string;
  completedAt?: string;
  reviewNotes?: string;
  nextSteps?: string[];
  progress: number; // 0-100
}

interface StatusItem {
  key: string;
  label: string;
  status: ApplicationStatus['status'];
  icon: string;
  date?: string;
  notes?: string;
}

const ApplicationTrackingScreen = ({ navigation, route }: Props) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { applicationId } = route.params || {};

  const [application, setApplication] = useState<ApplicationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApplication = useCallback(async () => {
    if (!applicationId) {
      // Load all applications for user
      try {
        // In a real implementation, this would use the actual adoption API
        // For now, we'll create a mock application for demonstration
        const mockApplication: ApplicationStatus = {
          id: 'app_123',
          status: 'under_review',
          petId: 'pet_456',
          petName: 'Buddy',
          submittedAt: new Date().toISOString(),
          progress: 50,
          nextSteps: [
            'Owner is reviewing your application',
            'Background check in progress',
            'Reference checks pending',
          ],
        };
        setApplication(mockApplication);
      } catch (err) {
        logger.error('Failed to load applications', { error: err });
        setError(err instanceof Error ? err.message : 'Failed to load applications');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // In a real implementation, this would fetch the specific application
      // For now, create a mock application
      const mockApplication: ApplicationStatus = {
        id: applicationId,
        status: 'under_review',
        petId: 'pet_456',
        petName: 'Buddy',
        submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 50,
        nextSteps: [
          'Owner is reviewing your application',
          'Background check in progress',
          'Reference checks pending',
        ],
      };
      setApplication(mockApplication);
    } catch (err) {
      logger.error('Failed to load application', { error: err });
      setError(err instanceof Error ? err.message : 'Failed to load application');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void loadApplication();
  }, [loadApplication]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    void loadApplication();
  }, [loadApplication]);

  const getStatusColor = (status: ApplicationStatus['status']) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return theme.colors.success;
      case 'rejected':
      case 'withdrawn':
        return theme.colors.danger;
      case 'under_review':
        return theme.colors.warning;
      default:
        return theme.colors.info;
    }
  };

  const getStatusIcon = (status: ApplicationStatus['status']) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'checkmark-circle';
      case 'rejected':
      case 'withdrawn':
        return 'close-circle';
      case 'under_review':
        return 'time';
      default:
        return 'hourglass';
    }
  };

  const getStatusItems = (app: ApplicationStatus): StatusItem[] => {
    const items: StatusItem[] = [
      {
        key: 'submitted',
        label: 'Application Submitted',
        status: 'pending',
        icon: 'send',
        date: app.submittedAt,
      },
    ];

    if (app.status !== 'pending') {
      items.push({
        key: 'under_review',
        label: 'Under Review',
        status: 'under_review',
        icon: 'eye',
        date: app.reviewedAt,
      });
    }

    if (app.status === 'approved' || app.status === 'completed') {
      items.push({
        key: 'approved',
        label: 'Application Approved',
        status: 'approved',
        icon: 'checkmark-circle',
        date: app.reviewedAt,
      });

      if (app.status === 'completed') {
        items.push({
          key: 'completed',
          label: 'Adoption Completed',
          status: 'completed',
          icon: 'checkmark-done-circle',
          date: app.completedAt,
        });
      }
    } else if (app.status === 'rejected') {
      items.push({
        key: 'rejected',
        label: 'Application Rejected',
        status: 'rejected',
        icon: 'close-circle',
        date: app.reviewedAt,
        notes: app.reviewNotes,
      });
    }

    return items;
  };

  if (isLoading && !application) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onMuted }]}>
            Loading application...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !application) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.danger} />
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={loadApplication}
          >
            <Text style={[styles.retryButtonText, { color: theme.colors.onPrimary }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!application) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
        <View style={styles.centerContainer}>
          <Ionicons name="document-outline" size={48} color={theme.colors.onMuted} />
          <Text style={[styles.emptyText, { color: theme.colors.onMuted }]}>
            No applications found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusItems = getStatusItems(application);
  const currentStatusIndex = statusItems.findIndex((item) => item.status === application.status);
  const statusColor = getStatusColor(application.status);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          Application Status
        </Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <View>
            {/* Application Summary */}
            <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={styles.summaryHeader}>
                <View>
                  <Text style={[styles.petName, { color: theme.colors.onSurface }]}>
                    {application.petName}
                  </Text>
                  <Text style={[styles.applicationId, { color: theme.colors.onMuted }]}>
                    Application #{application.id.slice(-8)}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                  <Ionicons
                    name={getStatusIcon(application.status)}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.statusBadgeText}>
                    {application.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressSection}>
                <View style={[styles.progressBar, { backgroundColor: theme.colors.bg }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${application.progress}%`,
                        backgroundColor: statusColor,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: theme.colors.onMuted }]}>
                  {application.progress}% Complete
                </Text>
              </View>
            </View>

            {/* Status Timeline */}
            <View style={[styles.timelineCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Application Timeline
              </Text>
              {statusItems.map((item, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;

                return (
                  <View key={item.key} style={styles.timelineItem}>
                    <View style={styles.timelineConnector}>
                      <View
                        style={[
                          styles.timelineDot,
                          {
                            backgroundColor: isCompleted ? statusColor : theme.colors.border,
                            borderColor: isCurrent ? statusColor : theme.colors.border,
                            borderWidth: isCurrent ? 3 : 0,
                          },
                        ]}
                      >
                        <Ionicons
                          name={item.icon as any}
                          size={16}
                          color={isCompleted ? '#FFFFFF' : theme.colors.onMuted}
                        />
                      </View>
                      {index < statusItems.length - 1 && (
                        <View
                          style={[
                            styles.timelineLine,
                            {
                              backgroundColor: isCompleted ? statusColor : theme.colors.border,
                            },
                          ]}
                        />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={[styles.timelineLabel, { color: theme.colors.onSurface }]}>
                        {item.label}
                      </Text>
                      {item.date && (
                        <Text style={[styles.timelineDate, { color: theme.colors.onMuted }]}>
                          {new Date(item.date).toLocaleDateString()}
                        </Text>
                      )}
                      {item.notes && (
                        <Text style={[styles.timelineNotes, { color: theme.colors.onMuted }]}>
                          {item.notes}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Next Steps */}
            {application.nextSteps && application.nextSteps.length > 0 && (
              <View style={[styles.nextStepsCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Next Steps
                </Text>
                {application.nextSteps.map((step, index) => (
                  <View key={index} style={styles.nextStepItem}>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
                    <Text style={[styles.nextStepText, { color: theme.colors.onSurface }]}>
                      {step}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
        contentContainerStyle={styles.content}
      />
    </SafeAreaView>
  );
};

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    loadingText: {
      fontSize: 16,
      marginTop: theme.spacing.md,
    },
    errorText: {
      fontSize: 16,
      textAlign: 'center',
      marginTop: theme.spacing.md,
    },
    emptyText: {
      fontSize: 16,
      textAlign: 'center',
      marginTop: theme.spacing.md,
    },
    retryButton: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.radii.md,
      marginTop: theme.spacing.lg,
    },
    retryButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      gap: theme.spacing.md,
    },
    backButton: {
      padding: theme.spacing.xs,
    },
    headerTitle: {
      flex: 1,
      fontSize: 20,
      fontWeight: 'bold',
    },
    placeholder: {
      width: 32,
    },
    content: {
      padding: theme.spacing.lg,
      gap: theme.spacing.lg,
    },
    summaryCard: {
      borderRadius: theme.radii.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      marginBottom: theme.spacing.lg,
    },
    summaryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.md,
    },
    petName: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: theme.spacing.xs,
    },
    applicationId: {
      fontSize: 14,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radii.full,
      gap: theme.spacing.xs,
    },
    statusBadgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    progressSection: {
      marginTop: theme.spacing.md,
    },
    progressBar: {
      height: 8,
      borderRadius: theme.radii.full,
      overflow: 'hidden',
      marginBottom: theme.spacing.xs,
    },
    progressFill: {
      height: '100%',
      borderRadius: theme.radii.full,
    },
    progressText: {
      fontSize: 12,
      textAlign: 'right',
    },
    timelineCard: {
      borderRadius: theme.radii.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: theme.spacing.md,
    },
    timelineItem: {
      flexDirection: 'row',
      marginBottom: theme.spacing.lg,
    },
    timelineConnector: {
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    timelineDot: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    timelineLine: {
      width: 2,
      flex: 1,
      minHeight: 40,
      marginTop: theme.spacing.xs,
    },
    timelineContent: {
      flex: 1,
    },
    timelineLabel: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
    },
    timelineDate: {
      fontSize: 14,
      marginBottom: theme.spacing.xs,
    },
    timelineNotes: {
      fontSize: 14,
      fontStyle: 'italic',
    },
    nextStepsCard: {
      borderRadius: theme.radii.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
    },
    nextStepItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    nextStepText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 22,
    },
  });
}

export default ApplicationTrackingScreen;

