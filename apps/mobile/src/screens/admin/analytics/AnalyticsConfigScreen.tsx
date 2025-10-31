/**
 * Analytics Configuration Screen
 * Allows admins to configure analytics reporting, email, and alerts
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme';
import type { AppTheme } from '../../../theme/contracts';
import { _adminAPI as adminAPI } from '@mobile/services/adminAPI';
import type { AdminScreenProps } from '../../../navigation/types';

interface AnalyticsConfig {
  reportEmails: string[];
  emailService: {
    provider: string;
    host: string;
    port: number;
    user: string;
    from: string;
    passwordConfigured: boolean;
  };
  reportSchedule: {
    dailyEnabled: boolean;
    dailyTime: string;
    weeklyEnabled: boolean;
    weeklyDay: string;
    weeklyTime: string;
    timezone: string;
  };
  alertThresholds: {
    churnRate: { warning: number; critical: number };
    conversionRate: { warning: number; critical: number };
    retentionWeek1: { warning: number; critical: number };
    retentionMonth1: { warning: number; critical: number };
  };
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    content: {
      padding: theme.spacing.lg,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      shadowColor: theme.colors.border,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    sectionDescription: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
      marginBottom: theme.spacing.lg,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      fontSize: theme.typography.body.size,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.body.weight,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    switchLabel: {
      flex: 1,
      fontSize: theme.typography.body.size,
      color: theme.colors.onSurface,
    },
    thresholdRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    thresholdInput: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md,
      padding: theme.spacing.sm,
      fontSize: theme.typography.body.size,
      color: theme.colors.onSurface,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      marginTop: theme.spacing.md,
    },
    buttonText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.body.weight,
    },
    testButton: {
      backgroundColor: theme.colors.info,
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      marginTop: theme.spacing.sm,
    },
    emailTag: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    emailTagText: {
      color: theme.colors.primary,
      fontSize: theme.typography.body.size * 0.9,
    },
    emailInputRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    addButton: {
      backgroundColor: theme.colors.success,
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      justifyContent: 'center',
      minWidth: 80,
    },
  });
}

export function AnalyticsConfigScreen({ navigation: _navigation }: AdminScreenProps<'AnalyticsConfig'>): React.JSX.Element {
  // Type assertion needed due to ESLint parser limitation with module resolution
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const themeUntyped = useTheme();
  const theme = themeUntyped as AppTheme;
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [_config, setConfig] = useState<AnalyticsConfig | null>(null);

  // Form state
  const [reportEmails, setReportEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [emailService, setEmailService] = useState({
    provider: 'nodemailer',
    host: '',
    port: 587,
    user: '',
    password: '',
    from: 'noreply@pawfectmatch.com',
  });
  const [reportSchedule, setReportSchedule] = useState({
    dailyEnabled: true,
    dailyTime: '09:00',
    weeklyEnabled: true,
    weeklyDay: 'monday',
    weeklyTime: '09:00',
    timezone: 'UTC',
  });
  const [alertThresholds, setAlertThresholds] = useState({
    churnRate: { warning: 5, critical: 10 },
    conversionRate: { warning: 10, critical: 5 },
    retentionWeek1: { warning: 50, critical: 40 },
    retentionMonth1: { warning: 30, critical: 20 },
  });

  useEffect(() => {
    void loadConfig();
  }, []);

  const loadConfig = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await adminAPI.getAnalyticsConfig();

      if (response.success && response.data) {
        const data = response.data;
        setConfig(data);
        setReportEmails(data.reportEmails);
        setEmailService({
          provider: data.emailService.provider,
          host: data.emailService.host,
          port: data.emailService.port,
          user: data.emailService.user,
          password: data.emailService.passwordConfigured ? '***configured***' : '',
          from: data.emailService.from,
        });
        setReportSchedule(data.reportSchedule);
        setAlertThresholds(data.alertThresholds);
      }
    } catch (_error) {
      Alert.alert('Error', 'Failed to load analytics configuration');
    } finally {
      setLoading(false);
    }
  };

  const addEmail = (): void => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newEmail.trim() && emailRegex.test(newEmail.trim())) {
      if (!reportEmails.includes(newEmail.trim())) {
        setReportEmails([...reportEmails, newEmail.trim()]);
        setNewEmail('');
      } else {
        Alert.alert('Duplicate Email', 'This email is already in the list');
      }
    } else {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
    }
  };

  const removeEmail = (email: string): void => {
    setReportEmails(reportEmails.filter(e => e !== email));
  };

  const saveConfig = async (): Promise<void> => {
    try {
      setSaving(true);

      const response = await adminAPI.updateAnalyticsConfig({
        reportEmails,
        emailService: {
          provider: emailService.provider,
          host: emailService.host,
          port: emailService.port,
          user: emailService.user,
          ...(emailService.password !== '***configured***' && emailService.password ? { password: emailService.password } : {}),
          from: emailService.from,
        },
        reportSchedule,
        alertThresholds,
      });

      if (response.success) {
        Alert.alert('Success', 'Analytics configuration saved successfully');
        void loadConfig();
      } else {
        Alert.alert('Error', 'Failed to save configuration');
      }
    } catch (_error) {
      Alert.alert('Error', 'Failed to save analytics configuration');
    } finally {
      setSaving(false);
    }
  };

  const testEmail = async (): Promise<void> => {
    if (!emailService.user) {
      Alert.alert('Error', 'Please configure email service first');
      return;
    }

    const testEmailAddress = reportEmails[0] || emailService.user;
    try {
      const response = await adminAPI.testEmailConfig(testEmailAddress);
      if (response.success) {
        Alert.alert('Success', `Test email sent to ${testEmailAddress}`);
      } else {
        Alert.alert('Error', 'Failed to send test email');
      }
    } catch (_error) {
      Alert.alert('Error', 'Failed to send test email');
    }
  };

  // Extract theme values for ESLint type safety
  const primaryColor: string = theme.colors.primary;
  const mdSpacing: number = theme.spacing.md;
  const bodyFontSize: number = theme.typography.body.size;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Report Emails Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Recipients</Text>
          <Text style={styles.sectionDescription}>
            Email addresses that will receive daily and weekly analytics reports
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: mdSpacing }}>
            {reportEmails.map(email => (
              <View key={email} style={styles.emailTag}>
                <TouchableOpacity onPress={() => removeEmail(email)}>
                  <Text style={styles.emailTagText}>{email} ×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.emailInputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="admin@example.com"
              placeholderTextColor={theme.colors.onMuted as string}
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.addButton} onPress={addEmail}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Email Service Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Service</Text>
          <Text style={styles.sectionDescription}>
            Configure email service for sending reports
          </Text>

          <Text style={styles.label}>Provider</Text>
          <TextInput
            style={styles.input}
            value={emailService.provider}
            onChangeText={value => setEmailService({ ...emailService, provider: value })}
            placeholder="nodemailer"
          />

          <Text style={styles.label}>SMTP Host</Text>
          <TextInput
            style={styles.input}
            value={emailService.host}
            onChangeText={value => setEmailService({ ...emailService, host: value })}
            placeholder="smtp.gmail.com"
          />

          <Text style={styles.label}>Port</Text>
          <TextInput
            style={styles.input}
            value={String(emailService.port)}
            onChangeText={value => setEmailService({ ...emailService, port: parseInt(value) || 587 })}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={emailService.user}
            onChangeText={value => setEmailService({ ...emailService, user: value })}
            placeholder="your-email@gmail.com"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={emailService.password}
            onChangeText={value => setEmailService({ ...emailService, password: value })}
            placeholder={emailService.password === '***configured***' ? 'Password configured' : 'Enter password'}
            secureTextEntry={emailService.password !== '***configured***'}
            autoCapitalize="none"
          />

          <Text style={styles.label}>From Address</Text>
          <TextInput
            style={styles.input}
            value={emailService.from}
            onChangeText={value => setEmailService({ ...emailService, from: value })}
            placeholder="noreply@pawfectmatch.com"
          />

          <TouchableOpacity style={styles.testButton} onPress={testEmail}>
            <Text style={styles.buttonText}>Send Test Email</Text>
          </TouchableOpacity>
        </View>

        {/* Report Schedule Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Schedule</Text>
          <Text style={styles.sectionDescription}>
            Configure when reports are generated and sent
          </Text>

          <View style={styles.row}>
            <Text style={styles.switchLabel}>Daily Reports</Text>
            <Switch
              value={reportSchedule.dailyEnabled}
              onValueChange={value => setReportSchedule({ ...reportSchedule, dailyEnabled: value })}
              trackColor={{ false: theme.colors.border as string, true: primaryColor }}
            />
          </View>

          {reportSchedule.dailyEnabled && (
            <>
              <Text style={styles.label}>Daily Report Time (UTC)</Text>
              <TextInput
                style={styles.input}
                value={reportSchedule.dailyTime}
                onChangeText={value => setReportSchedule({ ...reportSchedule, dailyTime: value })}
                placeholder="09:00"
              />
            </>
          )}

          <View style={styles.row}>
            <Text style={styles.switchLabel}>Weekly Reports</Text>
            <Switch
              value={reportSchedule.weeklyEnabled}
              onValueChange={value => setReportSchedule({ ...reportSchedule, weeklyEnabled: value })}
              trackColor={{ false: theme.colors.border as string, true: primaryColor }}
            />
          </View>

          {reportSchedule.weeklyEnabled && (
            <>
              <Text style={styles.label}>Weekly Report Day</Text>
              <TextInput
                style={styles.input}
                value={reportSchedule.weeklyDay}
                onChangeText={value => setReportSchedule({ ...reportSchedule, weeklyDay: value })}
                placeholder="monday"
              />

              <Text style={styles.label}>Weekly Report Time (UTC)</Text>
              <TextInput
                style={styles.input}
                value={reportSchedule.weeklyTime}
                onChangeText={value => setReportSchedule({ ...reportSchedule, weeklyTime: value })}
                placeholder="09:00"
              />
            </>
          )}
        </View>

        {/* Alert Thresholds Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Thresholds</Text>
          <Text style={styles.sectionDescription}>
            Configure when alerts are triggered for key metrics
          </Text>

          <Text style={styles.label}>Churn Rate</Text>
          <View style={styles.thresholdRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { fontSize: bodyFontSize * 0.9 }]}>
                Warning (%)
              </Text>
              <TextInput
                style={styles.thresholdInput}
                value={String(alertThresholds.churnRate.warning)}
                onChangeText={value =>
                  setAlertThresholds({
                    ...alertThresholds,
                    churnRate: { ...alertThresholds.churnRate, warning: parseFloat(value) || 0 },
                  })
                }
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { fontSize: bodyFontSize * 0.9 }]}>
                Critical (%)
              </Text>
              <TextInput
                style={styles.thresholdInput}
                value={String(alertThresholds.churnRate.critical)}
                onChangeText={value =>
                  setAlertThresholds({
                    ...alertThresholds,
                    churnRate: { ...alertThresholds.churnRate, critical: parseFloat(value) || 0 },
                  })
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>Conversion Rate</Text>
          <View style={styles.thresholdRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { fontSize: bodyFontSize * 0.9 }]}>
                Warning (%)
              </Text>
              <TextInput
                style={styles.thresholdInput}
                value={String(alertThresholds.conversionRate.warning)}
                onChangeText={value =>
                  setAlertThresholds({
                    ...alertThresholds,
                    conversionRate: { ...alertThresholds.conversionRate, warning: parseFloat(value) || 0 },
                  })
                }
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { fontSize: bodyFontSize * 0.9 }]}>
                Critical (%)
              </Text>
              <TextInput
                style={styles.thresholdInput}
                value={String(alertThresholds.conversionRate.critical)}
                onChangeText={value =>
                  setAlertThresholds({
                    ...alertThresholds,
                    conversionRate: { ...alertThresholds.conversionRate, critical: parseFloat(value) || 0 },
                  })
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>Week 1 Retention</Text>
          <View style={styles.thresholdRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { fontSize: bodyFontSize * 0.9 }]}>
                Warning (%)
              </Text>
              <TextInput
                style={styles.thresholdInput}
                value={String(alertThresholds.retentionWeek1.warning)}
                onChangeText={value =>
                  setAlertThresholds({
                    ...alertThresholds,
                    retentionWeek1: { ...alertThresholds.retentionWeek1, warning: parseFloat(value) || 0 },
                  })
                }
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { fontSize: bodyFontSize * 0.9 }]}>
                Critical (%)
              </Text>
              <TextInput
                style={styles.thresholdInput}
                value={String(alertThresholds.retentionWeek1.critical)}
                onChangeText={value =>
                  setAlertThresholds({
                    ...alertThresholds,
                    retentionWeek1: { ...alertThresholds.retentionWeek1, critical: parseFloat(value) || 0 },
                  })
                }
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.button, saving && { opacity: 0.6 }]}
          onPress={saveConfig}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={theme.colors.onPrimary as string} />
          ) : (
            <Text style={styles.buttonText}>Save Configuration</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

