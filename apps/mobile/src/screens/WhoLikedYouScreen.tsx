/**
 * Who Liked You Screen
 * Premium feature that displays users who have liked your pet profiles
 */

import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/theme';
import { useTranslation } from 'react-i18next';
import { AdvancedHeader, HeaderConfigs } from '../../components/Advanced/AdvancedHeader';
import { ScreenShell } from '../../ui/layout/ScreenShell';
import { useReduceMotion } from '../../hooks/useReducedMotion';
import type { RootStackScreenProps } from '../../navigation/types';
import { useWhoLikedYouScreen } from '../../hooks/screens/useWhoLikedYouScreen';
import { LikedUserItem } from './components/LikedUserItem';
import {
  PremiumGateSection,
  LoadingSection,
  ErrorSection,
  EmptySection,
} from './components/WhoLikedYouSections';

type WhoLikedYouScreenProps = RootStackScreenProps<'WhoLikedYou'>;

export default function WhoLikedYouScreen({ navigation }: WhoLikedYouScreenProps): React.JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const reducedMotion = useReduceMotion();

  const {
    canUse,
    reason,
    likes,
    isLoading,
    error,
    isRefetching,
    refetch,
    handleUserPress,
    handleUpgrade,
  } = useWhoLikedYouScreen(navigation);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    content: {
      flex: 1,
      padding: theme.spacing.md,
    },
    statsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statsText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
  });

  // Premium gate UI
  if (!canUse) {
    return <PremiumGateSection reason={reason} navigation={navigation} />;
  }

  // Loading state
  if (isLoading) {
    return <LoadingSection navigation={navigation} />;
  }

  // Error state
  if (error) {
    return <ErrorSection error={error} onRetry={() => refetch()} navigation={navigation} />;
  }

  // Empty state
  if (likes.length === 0) {
    return <EmptySection navigation={navigation} />;
  }

  // Success state with list
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
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.content}>
          {/* Stats Card */}
          <Animated.View
            entering={reducedMotion ? undefined : FadeInDown.duration(200)}
            style={styles.statsCard}
          >
            <Text style={styles.statsText}>
              {likes.length} {likes.length === 1 ? t('whoLikedYou.person', 'person') : t('whoLikedYou.people', 'people')}{' '}
              {t('whoLikedYou.likedYourPets', 'liked your pets')}
            </Text>
          </Animated.View>

          {/* Likes List */}
          <FlatList
            data={likes}
            renderItem={({ item, index }) => (
              <Animated.View
                entering={reducedMotion ? undefined : FadeInDown.duration(250).delay(index * 50)}
              >
                <LikedUserItem like={item} onPress={handleUserPress} />
              </Animated.View>
            )}
            keyExtractor={(item) => item.userId}
            contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => refetch()}
                tintColor={theme.colors.primary}
              />
            }
            showsVerticalScrollIndicator={false}
            testID="who-liked-you-list"
          />
        </View>
      </SafeAreaView>
    </ScreenShell>
  );
}
