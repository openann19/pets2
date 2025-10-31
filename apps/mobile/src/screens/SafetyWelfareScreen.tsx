/**
 * SAFETY & WELFARE SCREEN
 * Community rules, incident reporting, and health disclosures for safe pet interactions
 */

import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';

// Existing architecture components
import { EliteContainer, EliteHeader } from '../components/elite';

// Extracted components and hooks
import { useSafetyWelfareForm } from './safety-welfare/hooks/useSafetyWelfareForm';
import {
  TabNavigation,
  RulesTab,
  IncidentsTab,
  DisclosuresTab,
  IncidentReportModal,
  type SafetyTab,
} from './safety-welfare/components';
import type { Incident } from './safety-welfare/types';

// Types
type SafetyWelfareScreenProps = {
  navigation: any;
  route?: {
    params?: {
      reportType?: 'incident' | 'rule_violation' | 'health_disclosure';
    };
  };
};

// Mock incidents data (would come from API)
const MOCK_INCIDENTS: Incident[] = [
  {
    id: '1',
    type: 'Minor scuffle during playdate',
    location: 'Central Park',
    reportedAt: '2025-01-15T10:30:00Z',
    status: 'resolved',
    severity: 'low',
  },
  {
    id: '2',
    type: 'Unleashed dog in restricted area',
    location: 'Riverside Trail',
    reportedAt: '2025-01-14T14:20:00Z',
    status: 'investigating',
    severity: 'medium',
  },
];

export default function SafetyWelfareScreen({ navigation, route }: SafetyWelfareScreenProps) {
  const { reportType } = route?.params || {};

  // State
  const [activeTab, setActiveTab] = useState<SafetyTab>('rules');
  const [showReportModal, setShowReportModal] = useState(!!reportType);

  const formState = useSafetyWelfareForm();

  // Set initial report type if provided
  React.useEffect(() => {
    if (reportType === 'incident') {
      formState.updateReportForm('type', 'other');
    }
  }, [reportType, formState]);

  const handleSubmitReport = useCallback(async () => {
    if (!formState.reportForm.description || !formState.reportForm.contactInfo?.name) {
      Alert.alert('Incomplete Report', 'Please provide a description and contact information.');
      return;
    }

    try {
      // Submit report to API
      const response = await fetch('/api/safety/incident-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState.reportForm),
      });

      if (response.ok) {
        Alert.alert(
          'Report Submitted',
          'Thank you for helping keep our community safe. We\'ll review your report and take appropriate action.',
          [{ text: 'OK', onPress: () => setShowReportModal(false) }],
        );
        formState.resetForm();
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    }
  }, [formState]);

  return (
    <EliteContainer>
      <EliteHeader title="Safety & Welfare" />

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView style={styles.container}>
        {activeTab === 'rules' && <RulesTab onReportSafety={() => setShowReportModal(true)} />}
        {activeTab === 'incidents' && (
          <IncidentsTab incidents={MOCK_INCIDENTS} onViewAll={() => {/* Navigate */}} />
        )}
        {activeTab === 'disclosures' && (
          <DisclosuresTab onManageDisclosures={() => navigation.navigate('HealthPassport')} />
        )}
      </ScrollView>

      {/* Report Modal */}
      <IncidentReportModal
        visible={showReportModal}
        reportForm={formState.reportForm}
        onClose={() => setShowReportModal(false)}
        onUpdateForm={formState.updateReportForm}
        onSubmit={handleSubmitReport}
      />
    </EliteContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
