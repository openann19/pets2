/**
 * Who Liked You Screen State Sections
 * Reusable components for different screen states
 */

import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mobile/theme';
import { AdvancedHeader, HeaderConfigs } from '../../../components/Advanced/AdvancedHeader';
import { PremiumGate } from '../../../components/Premium/PremiumGate';
import { EmptyStates } from '../../../components/common';
import { ScreenShell } from '../../../ui/layout/ScreenShell';
import type { RootStackScreenProps } from '../../../navigation/types';

type WhoLikedYouScreenProps = RootStackScreenProps<'WhoLikedYou'>;

interface PremiumGateSectionProps {
  reason?: string;
  navigation: WhoLikedYouScreenProps['navigation'];
}

export function PremiumGateSection({ reason, navigation }: PremiumGateSectionProps): React.JSX.Element {
  const { t } = useTranslation('common');
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
  });

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: t('whoLikedYou.title', 'Who Liked You'),
            showBackButton: true,
            onBackPress: () => navigation.goBack(),
          })}
        />
      }
    >
      <View style={styles.container}>
        <PremiumGate
          feature={t('whoLikedYou.featureName', 'See Who Liked You')}
          description={reason || t('whoLikedYou.description', 'See who liked your pet profiles with Premium')}
          icon="heart"
          visible={true}
          onClose={() => navigation.goBack()}
          onUpgrade={() => {
            navigation.goBack();
            navigation.navigate('Premium');
          }}
        />
      </View>
    </ScreenShell>
  );
}

interface LoadingSectionProps {
  navigation: WhoLikedYouScreenProps['navigation'];
}

export function LoadingSection({ navigation }: LoadingSectionProps): React.JSX.Element {
  const { t } = useTranslation('common');
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.onMuted,
      marginTop: theme.spacing.md,
    },
  });

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: t('whoLikedYou.title', 'Who Liked You'),
            showBackButton: true,
            onBackPress: () => navigation.goBack(),
          })}
        />
      }
    >
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.subtitle}>{t('whoLikedYou.loading', 'Loading...')}</Text>
      </View>
    </ScreenShell>
  );
}

interface ErrorSectionProps {
  error: Error;
  onRetry: () => void;
  navigation: WhoLikedYouScreenProps['navigation'];
}

export function ErrorSection({ error, onRetry, navigation }: ErrorSectionProps): React.JSX.Element {
  const { t } = useTranslation('common');

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: t('whoLikedYou.title', 'Who Liked You'),
            showBackButton: true,
            onBackPress: () => navigation.goBack(),
          })}
        />
      }
    >
      <EmptyStates.Error
        title={t('whoLikedYou.error.title', 'Failed to load')}
        message={error.message || t('whoLikedYou.error.message', 'Please try again')}
        actionLabel={t('swipe.error.retry', 'Retry')}
        onAction={onRetry}
      />
    </ScreenShell>
  );
}

interface EmptySectionProps {
  navigation: WhoLikedYouScreenProps['navigation'];
}

export function EmptySection({ navigation }: EmptySectionProps): React.JSX.Element {
  const { t } = useTranslation('common');
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginTop: theme.spacing.lg,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.onMuted,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
  });

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: t('whoLikedYou.title', 'Who Liked You'),
            showBackButton: true,
            onBackPress: () => navigation.goBack(),
          })}
        />
      }
    >
      <View style={styles.container}>
        <Ionicons name="heart-outline" size={64} color={theme.colors.onMuted} />
        <Text style={styles.title}>{t('whoLikedYou.empty.title', 'No Likes Yet')}</Text>
        <Text style={styles.subtitle}>
          {t('whoLikedYou.empty.message', "When someone likes your pet, they'll appear here")}
        </Text>
      </View>
    </ScreenShell>
  );
}

