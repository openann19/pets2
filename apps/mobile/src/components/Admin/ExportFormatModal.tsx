/**
 * Export Format Selection Modal
 * Allows users to choose export format and time range
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { getExtendedColors } from '@/theme/adapters';
import type { ViewStyle, TextStyle } from 'react-native';

interface ExportOption {
  id: 'json' | 'csv' | 'pdf';
  title: string;
  description: string;
  icon: string;
}

interface TimeRangeOption {
  id: string;
  label: string;
  value: string;
}

interface ExportFormatModalProps {
  visible: boolean;
  onClose: () => void;
  onExport: (format: 'json' | 'csv' | 'pdf', timeRange: string) => void;
  isLoading?: boolean;
}

const exportFormats: ExportOption[] = [
  {
    id: 'json',
    title: 'JSON',
    description: 'Structured data format, ideal for developers',
    icon: 'code',
  },
  {
    id: 'csv',
    title: 'CSV',
    description: 'Spreadsheet format, perfect for Excel/Google Sheets',
    icon: 'grid',
  },
  {
    id: 'pdf',
    description: 'Professional report format for presentations',
    icon: 'document-text',
    title: 'PDF',
  },
];

const timeRanges: TimeRangeOption[] = [
  { id: '7d', label: 'Last 7 days', value: '7d' },
  { id: '30d', label: 'Last 30 days', value: '30d' },
  { id: '90d', label: 'Last 3 months', value: '90d' },
  { id: '365d', label: 'Last year', value: '365d' },
  { id: 'all', label: 'All time', value: 'all' },
];

export const ExportFormatModal: React.FC<ExportFormatModalProps> = ({
  visible,
  onClose,
  onExport,
  isLoading = false,
}) => {
  const theme = useTheme();
  const extendedColors = getExtendedColors(theme);
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('30d');

  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    } as ViewStyle,
    container: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.radii.xl,
      borderTopRightRadius: theme.radii.xl,
      maxHeight: '80%',
    } as ViewStyle,
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    } as ViewStyle,
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
    } as TextStyle,
    closeButton: {
      padding: theme.spacing.sm,
    } as ViewStyle,
    content: {
      padding: theme.spacing.lg,
    } as ViewStyle,
    section: {
      marginBottom: theme.spacing.xl,
    } as ViewStyle,
    sectionTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    } as TextStyle,
    formatGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    } as ViewStyle,
    formatOption: {
      flex: 1,
      minWidth: '45%',
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
    } as ViewStyle,
    selectedFormat: {
      borderColor: extendedColors.primary,
      backgroundColor: `${extendedColors.primary}10`,
    } as ViewStyle,
    formatHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    } as ViewStyle,
    formatIcon: {
      marginRight: theme.spacing.sm,
      color: theme.colors.onSurface,
    } as TextStyle,
    selectedIcon: {
      color: extendedColors.primary,
    } as TextStyle,
    formatTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
    } as TextStyle,
    formatDescription: {
      fontSize: 14,
      color: theme.colors.onMuted,
      lineHeight: 20,
    } as TextStyle,
    timeRangeGrid: {
      gap: theme.spacing.sm,
    } as ViewStyle,
    timeRangeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.surface,
    } as ViewStyle,
    selectedTimeRange: {
      borderColor: extendedColors.primary,
      backgroundColor: `${extendedColors.primary}10`,
    } as ViewStyle,
    timeRangeLabel: {
      fontSize: 16,
      color: theme.colors.onSurface,
    } as TextStyle,
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,
    selectedRadio: {
      borderColor: extendedColors.primary,
    } as ViewStyle,
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: extendedColors.primary,
    } as ViewStyle,
    footer: {
      padding: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    } as ViewStyle,
    exportButton: {
      backgroundColor: extendedColors.primary,
      borderRadius: theme.radii.lg,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,
    exportButtonDisabled: {
      backgroundColor: theme.colors.border,
    } as ViewStyle,
    exportButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: theme.spacing.sm,
    } as TextStyle,
  });

  const handleExport = () => {
    onExport(selectedFormat, selectedTimeRange);
  };

  const renderFormatOption = (format: ExportOption) => {
    const isSelected = selectedFormat === format.id;

    return (
      <TouchableOpacity
        key={format.id}
        style={[styles.formatOption, isSelected && styles.selectedFormat]}
        onPress={() => setSelectedFormat(format.id)}
        disabled={isLoading}
      >
        <View style={styles.formatHeader}>
          <Ionicons
            name={format.icon as any}
            size={20}
            style={[styles.formatIcon, isSelected && styles.selectedIcon]}
          />
          <Text style={styles.formatTitle}>{format.title}</Text>
        </View>
        <Text style={styles.formatDescription}>{format.description}</Text>
      </TouchableOpacity>
    );
  };

  const renderTimeRangeOption = (range: TimeRangeOption) => {
    const isSelected = selectedTimeRange === range.value;

    return (
      <TouchableOpacity
        key={range.id}
        style={[styles.timeRangeOption, isSelected && styles.selectedTimeRange]}
        onPress={() => setSelectedTimeRange(range.value)}
        disabled={isLoading}
      >
        <Text style={styles.timeRangeLabel}>{range.label}</Text>
        <View style={[styles.radio, isSelected && styles.selectedRadio]}>
          {isSelected && <View style={styles.radioDot} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modal}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Export Analytics Data</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={isLoading}
            >
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Format Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Export Format</Text>
              <View style={styles.formatGrid}>{exportFormats.map(renderFormatOption)}</View>
            </View>

            {/* Time Range Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Time Range</Text>
              <View style={styles.timeRangeGrid}>{timeRanges.map(renderTimeRangeOption)}</View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.exportButton, isLoading && styles.exportButtonDisabled]}
              onPress={handleExport}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Ionicons
                    name="refresh"
                    size={20}
                    color={theme.colors.onPrimary}
                  />
                  <Text style={styles.exportButtonText}>Exporting...</Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="download"
                    size={20}
                    color={theme.colors.onPrimary}
                  />
                  <Text style={styles.exportButtonText}>Export Data</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};