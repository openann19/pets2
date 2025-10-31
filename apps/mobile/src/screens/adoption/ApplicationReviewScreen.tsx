/**
 * Application Review Screen
 * Refactored: Uses extracted components and hooks
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@mobile/theme';
import {
  ApplicationEmptyState,
  ApplicationHeader,
  ApplicationLoadingState,
  ApplicationStatusCard,
  ContactActions,
  ContactInfoSection,
  ExperienceSection,
  HomeLifestyleSection,
  NotesSection,
  QuestionsSection,
  StatusActions,
} from './review/components';
import { useApplicationReview } from './review/hooks';

type AdoptionStackParamList = {
  ApplicationReview: { applicationId: string };
};

type ApplicationReviewScreenProps = NativeStackScreenProps<
  AdoptionStackParamList,
  'ApplicationReview'
>;

const ApplicationReviewScreen = ({ navigation, route }: ApplicationReviewScreenProps) => {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const { applicationId } = route.params;
  const { application, isLoading, updateStatus } = useApplicationReview({ applicationId });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ApplicationLoadingState />
      </SafeAreaView>
    );
  }

  if (!application) {
    return (
      <SafeAreaView style={styles.container}>
        <ApplicationEmptyState onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ApplicationHeader onBack={() => navigation.goBack()} />
        <ApplicationStatusCard application={application} />
        <ContactInfoSection application={application} />
        <HomeLifestyleSection application={application} />
        <ExperienceSection application={application} />
        <QuestionsSection application={application} />
        <NotesSection application={application} />
        <StatusActions onStatusChange={updateStatus} />
        <ContactActions application={application} />
      </ScrollView>
    </SafeAreaView>
  );
};

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    scrollView: {
      flex: 1,
    },
  });
}

export default ApplicationReviewScreen;
