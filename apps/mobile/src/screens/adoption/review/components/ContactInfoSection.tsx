/**
 * Contact Information Section Component
 */

import { BlurView } from 'expo-blur';
import React, { useMemo } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { logger } from '@pawfectmatch/core';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { Application } from '../types';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    section: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.md,
    },
    sectionCard: {
      borderRadius: theme.radii.md,
      overflow: 'hidden',
      padding: theme.spacing.md,
    },
    contactInfo: {
      gap: theme.spacing.md,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    contactText: {
      fontSize: theme.typography.body.size,
      flex: 1,
    },
  });
}

interface ContactInfoSectionProps {
  application: Application;
}

export const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({ application }) => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors } = theme;

  const handleContactEmail = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const emailUrl = `mailto:${application.applicantEmail}?subject=Adoption Application - ${application.petName}`;
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
        logger.info('Email opened', { email: application.applicantEmail });
      }
    } catch (error) {
      logger.error('Failed to open email', { error });
    }
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Contact Information</Text>
      <BlurView intensity={20} style={styles.sectionCard}>
        <View style={styles.contactInfo}>
          <TouchableOpacity
            style={styles.contactItem}
            onPress={handleContactEmail}
            accessibilityLabel={`Email ${application.applicantEmail}`}
            accessibilityRole="link"
          >
            <Ionicons
              name="mail"
              size={20}
              color={colors.info}
            />
            <Text style={[styles.contactText, { color: colors.onSurface }]}>
              {application.applicantEmail}
            </Text>
          </TouchableOpacity>
          <View style={styles.contactItem}>
            <Ionicons
              name="call"
              size={20}
              color={colors.success}
            />
            <Text style={[styles.contactText, { color: colors.onSurface }]}>
              {application.applicantPhone}
            </Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons
              name="location"
              size={20}
              color={colors.danger}
            />
            <Text style={[styles.contactText, { color: colors.onSurface }]}>
              {application.applicantLocation}
            </Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
};

