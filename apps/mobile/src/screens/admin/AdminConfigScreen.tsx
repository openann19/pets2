/**
 * Admin Configuration Management Screen
 * Comprehensive UI for managing all API configurations and service settings
 * REFACTORED: Extracted hooks and components for better maintainability
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { ConfigModal, ServiceConfigCard } from './config/components';
import { useAdminConfig } from './config/hooks';

interface AdminConfigScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export default function AdminConfigScreen({
  navigation,
}: AdminConfigScreenProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  // Wireframe state
  const [wireframeEnabled, setWireframeEnabled] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pawfectmatch-wireframe') || '{}').enabled ?? false;
    } catch {
      return false;
    }
  });

  const [wireframeTheme, setWireframeTheme] = useState<'wireframe' | 'mockup' | 'production'>(() => {
    try {
      return JSON.parse(localStorage.getItem('pawfectmatch-wireframe') || '{}').theme ?? 'production';
    } catch {
      return 'production';
    }
  });

  const {
    services,
    loading,
    saving,
    selectedService,
    configValues,
    openServiceConfig,
    closeServiceConfig,
    updateConfigValue,
    saveConfiguration,
  } = useAdminConfig();

  // Wireframe management functions
  const toggleWireframe = () => {
    const newEnabled = !wireframeEnabled;
    setWireframeEnabled(newEnabled);

    const config = {
      enabled: newEnabled,
      theme: wireframeTheme,
      showGrid: true,
      showMeasurements: false,
      interactiveMode: true,
      dataSource: 'mock' as const,
    };

    localStorage.setItem('pawfectmatch-wireframe', JSON.stringify(config));

    Alert.alert(
      'Wireframe System',
      `${newEnabled ? 'Enabled' : 'Disabled'} wireframe system globally`,
      [
        {
          text: 'OK',
          onPress: () => {
            if (newEnabled) {
              Alert.alert(
                'Wireframe Active',
                'Wireframe controls are now available in the app.\n\nTap the "Wireframe" button in the bottom-right corner to access controls.',
                [{ text: 'Got it' }]
              );
            }
          },
        },
      ]
    );
  };

  const changeWireframeTheme = (theme: 'wireframe' | 'mockup' | 'production') => {
    setWireframeTheme(theme);

    const config = {
      enabled: wireframeEnabled,
      theme,
      showGrid: true,
      showMeasurements: false,
      interactiveMode: true,
      dataSource: 'mock' as const,
    };

    localStorage.setItem('pawfectmatch-wireframe', JSON.stringify(config));

    Alert.alert('Wireframe Theme', `Changed to ${theme} mode`);
  };

  const exportWireframes = () => {
    Alert.alert(
      'Export Wireframes',
      'Choose export format:',
      [
        {
          text: 'HTML (Interactive)',
          onPress: () => {
            Alert.alert('Export Started', 'HTML wireframes will be generated in the wireframes/ directory');
          },
        },
        {
          text: 'JSON (Design Tools)',
          onPress: () => {
            Alert.alert('Export Started', 'JSON specifications will be generated for design tools');
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
          />
          <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
            Loading configurations...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          testID="AdminConfigScreen-button-back"
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          API Configuration
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Services List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Development Tools Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            🛠️ Development Tools
          </Text>

          {/* Wireframe System */}
          <View style={[styles.configItem, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View style={styles.configItemContent}>
              <View style={styles.configItemText}>
                <Text style={[styles.configItemTitle, { color: theme.colors.onSurface }]}>
                  Wireframe System
                </Text>
                <Text style={[styles.configItemSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                  Enable rapid prototyping and design validation tools
                </Text>
              </View>
              <Switch
                value={wireframeEnabled}
                onValueChange={toggleWireframe}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary + '80',
                }}
                thumbColor={wireframeEnabled ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
            </View>

            {wireframeEnabled && (
              <View style={styles.wireframeOptions}>
                <Text style={[styles.wireframeOptionsTitle, { color: theme.colors.onSurface }]}>
                  Theme Mode
                </Text>
                <View style={styles.themeButtons}>
                  {[
                    { key: 'production', label: 'Production', icon: '🎨' },
                    { key: 'wireframe', label: 'Wireframe', icon: '📐' },
                    { key: 'mockup', label: 'Mockup', icon: '🎭' },
                  ].map(({ key, label, icon }) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.themeButton,
                        {
                          backgroundColor: wireframeTheme === key
                            ? theme.colors.primary
                            : theme.colors.surface,
                          borderColor: theme.colors.border,
                        },
                      ]}
                      onPress={() => changeWireframeTheme(key as any)}
                    >
                      <Text style={styles.themeIcon}>{icon}</Text>
                      <Text
                        style={[
                          styles.themeButtonText,
                          {
                            color: wireframeTheme === key
                              ? theme.colors.onPrimary
                              : theme.colors.onSurface,
                          },
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.exportButton, { backgroundColor: theme.colors.secondary }]}
                  onPress={exportWireframes}
                >
                  <Ionicons name="download" size={20} color={theme.colors.onSecondary} />
                  <Text style={[styles.exportButtonText, { color: theme.colors.onSecondary }]}>
                    Export Wireframes
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* API Services Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            🔧 API Services
          </Text>

          {services.map((service) => (
            <ServiceConfigCard
              key={service.id}
              service={service}
              onPress={openServiceConfig}
            />
          ))}
        </View>
      </ScrollView>

      {/* Configuration Modal */}
      <ConfigModal
        visible={selectedService !== null}
        service={selectedService}
        configValues={configValues}
        saving={saving}
        onClose={closeServiceConfig}
        onSave={saveConfiguration}
        onFieldChange={updateConfigValue}
      />
    </SafeAreaView>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.body.size,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      marginRight: theme.spacing.md,
    },
    headerTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.xl,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.h3.size,
      fontWeight: theme.typography.h3.weight,
      marginBottom: theme.spacing.lg,
    },
    configItem: {
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    configItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    configItemText: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    configItemTitle: {
      fontSize: theme.typography.bodyLarge.size,
      fontWeight: theme.typography.bodyLarge.weight,
      marginBottom: theme.spacing.xs,
    },
    configItemSubtitle: {
      fontSize: theme.typography.bodySmall.size,
      lineHeight: theme.typography.bodySmall.lineHeight,
    },
    wireframeOptions: {
      marginTop: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    wireframeOptionsTitle: {
      fontSize: theme.typography.bodyLarge.size,
      fontWeight: theme.typography.bodyLarge.weight,
      marginBottom: theme.spacing.md,
    },
    themeButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    themeButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    themeIcon: {
      fontSize: 16,
    },
    themeButtonText: {
      fontSize: theme.typography.bodySmall.size,
      fontWeight: theme.typography.bodySmall.weight,
      textAlign: 'center',
    },
    exportButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radii.md,
      gap: theme.spacing.sm,
    },
    exportButtonText: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.body.weight,
    },
  });
