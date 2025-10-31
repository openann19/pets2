/**
 * Contact Actions Component
 * Displays buttons for email, call, and message
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    contactActions: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    contactButton: {
      flex: 1,
      borderRadius: theme.radii.md,
      overflow: 'hidden',
    },
    contactButtonGradient: {
      padding: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
    },
    contactButtonText: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
    },
  });
}

interface ContactActionsProps {
  application: Application;
}

export const ContactActions: React.FC<ContactActionsProps> = ({ application }) => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;

  const handleContactEmail = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const emailUrl = `mailto:${application.applicantEmail}?subject=Adoption Application - ${application.petName}`;
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
        logger.info('Email opened', { email: application.applicantEmail });
      } else {
        Alert.alert('Email Not Available', `Please email us at ${application.applicantEmail}`);
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
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const phoneUrl = `tel:${application.applicantPhone}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        await Linking.openURL(phoneUrl);
        logger.info('Phone call initiated', { phone: application.applicantPhone });
      } else {
        Alert.alert('Call Not Available', `Please call ${application.applicantPhone}`);
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
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const smsUrl = `sms:${application.applicantPhone}`;
      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
        logger.info('SMS opened', { phone: application.applicantPhone });
      } else {
        Alert.alert('SMS Not Available', `Please send a message to ${application.applicantPhone}`);
      }
    } catch (error) {
      logger.error('Failed to open SMS', { error });
      Alert.alert(
        'Error',
        `Unable to open messaging app. Please message ${application.applicantPhone} manually.`,
      );
    }
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Contact Applicant</Text>
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContactEmail}
          testID="contact-action-email"
          accessibilityLabel="Email applicant"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={palette?.gradients?.info ?? [colors.info, colors.info]}
            style={styles.contactButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons
              name="mail"
              size={20}
              color={colors.onSurface}
            />
            <Text style={styles.contactButtonText}>Email</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContactCall}
          testID="contact-action-call"
          accessibilityLabel="Call applicant"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={palette?.gradients?.success ?? [colors.success, colors.success]}
            style={styles.contactButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons
              name="call"
              size={20}
              color={colors.onSurface}
            />
            <Text style={styles.contactButtonText}>Call</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContactMessage}
          testID="contact-action-message"
          accessibilityLabel="Message applicant"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={palette?.gradients?.info ?? [colors.info, colors.info]}
            style={styles.contactButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons
              name="chatbubble"
              size={20}
              color={colors.onSurface}
            />
            <Text style={styles.contactButtonText}>Message</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

