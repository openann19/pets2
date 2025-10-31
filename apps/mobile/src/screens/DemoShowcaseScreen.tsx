import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import { ScreenShell } from '../ui/layout/ScreenShell';
import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import { MatchCard } from '../components/matches/MatchCard';
import { MessageList } from '../components/chat/MessageList';
import { QuickReplies } from '../components/chat/QuickReplies';
import { EliteCard, EliteButton } from '../components';
import { demoMatches, demoLikedYou } from '../demo/fixtures/matches';
import { demoChatThread, demoQuickReplies } from '../demo/fixtures/chatThreads';
import { demoAdoptionItems } from '../demo/fixtures/adoptionItems';
import { demoMapPins } from '../demo/fixtures/mapPins';
import { demoPets } from '../demo/fixtures/pets';
import { useDemoMode } from '../demo/DemoModeProvider';
import type { RootStackScreenProps } from '../navigation/types';

const DemoShowcaseScreen = ({ navigation }: RootStackScreenProps<'DemoShowcase'>): React.ReactElement => {
  const theme = useTheme();
  const { enabled } = useDemoMode();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: 'Demo Showcase',
            subtitle: enabled
              ? 'Demo data is active and ready to explore.'
              : 'Enable demo mode to power offline data.',
            showBackButton: true,
            onBackPress: () => navigation.goBack(),
          })}
        />
      }
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        {!enabled && (
          <EliteCard style={styles.banner}>
            <Text style={styles.bannerTitle}>Demo mode is currently disabled.</Text>
            <Text style={styles.bannerBody}>
              Run with `EXPO_PUBLIC_DEMO_MODE=true` or use the `pnpm --filter @pawfectmatch/mobile demo`
              script to load offline fixtures and mock network adapters.
            </Text>
          </EliteCard>
        )}

        {renderSection(
          'Highlighted Matches',
          <View style={styles.cardGrid}>
            {demoMatches.map((match) => (
              <MatchCard
                key={match._id}
                match={match}
                onPress={() =>
                  navigation.navigate('Chat', { matchId: match._id, petName: match.petName })
                }
              />
            ))}
          </View>,
        )}

        {renderSection(
          'People Who Liked You',
          <View style={styles.cardGrid}>
            {demoLikedYou.map((match) => (
              <MatchCard
                key={match._id}
                match={match}
                onPress={() => navigation.navigate('Matches')}
              />
            ))}
          </View>,
        )}

        {renderSection(
          'Conversation Snapshot',
          <View style={styles.chatContainer}>
            <MessageList
              messages={demoChatThread.messages}
              typingUsers={['Buddy is typing...']}
              isOnline={true}
              currentUserId="current-user"
              matchId={demoChatThread.matchId}
            />
            <QuickReplies
              replies={demoQuickReplies}
              onReplySelect={() => undefined}
              visible={true}
            />
          </View>,
        )}

        {renderSection(
          'Adoption Spotlight',
          <View style={styles.adoptionGrid}>
            {demoAdoptionItems.map((item) => {
              const pet = demoPets.find((candidate) => candidate.id === item.petId);
              return (
                <EliteCard
                  key={item.id}
                  style={styles.adoptionCard}
                >
                  <Text style={styles.adoptionTitle}>{pet?.name ?? 'Featured Pet'}</Text>
                  {pet?.description ? (
                    <Text style={styles.adoptionBody}>{pet.description}</Text>
                  ) : null}
                  <Text style={styles.adoptionMeta}>Status: {item.status}</Text>
                </EliteCard>
              );
            })}
          </View>,
        )}

        {renderSection(
          'Discovery Map Pins',
          <EliteCard style={styles.mapCard}>
            {demoMapPins.map((pin) => (
              <View
                key={pin.id}
                style={styles.mapRow}
              >
                <Text style={styles.mapLabel}>{pin.label}</Text>
                <Text style={styles.mapMeta}>{pin.type}</Text>
              </View>
            ))}
          </EliteCard>,
        )}

        <View style={styles.actions}>
          <EliteButton
            title="Open Matches"
            variant="primary"
            onPress={() => navigation.navigate('Matches')}
          />
          <EliteButton
            title="Preview Chat"
            variant="secondary"
            onPress={() =>
              navigation.navigate('Chat', { matchId: demoChatThread.matchId, petName: 'Buddy' })
            }
          />
          <EliteButton
            title="Back to Home"
            variant="ghost"
            onPress={() => navigation.navigate('Home')}
          />
        </View>
      </ScrollView>
    </ScreenShell>
  );
};

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
    },
    content: {
      gap: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    section: {
      gap: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: theme.typography.h2.size,
      lineHeight: theme.typography.h2.lineHeight,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
    },
    cardGrid: {
      gap: theme.spacing.md,
    },
    chatContainer: {
      borderRadius: theme.radii.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: `${theme.colors.border}80`,
      backgroundColor: theme.colors.surface,
    },
    adoptionGrid: {
      gap: theme.spacing.md,
    },
    adoptionCard: {
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    adoptionTitle: {
      fontSize: theme.typography.body.size,
      lineHeight: theme.typography.body.lineHeight,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    adoptionBody: {
      color: theme.colors.onMuted,
      lineHeight: theme.typography.body.lineHeight,
    },
    adoptionMeta: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    mapCard: {
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    mapRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    mapLabel: {
      color: theme.colors.onSurface,
      fontWeight: '600',
    },
    mapMeta: {
      color: theme.colors.onMuted,
      textTransform: 'capitalize',
    },
    actions: {
      gap: theme.spacing.md,
    },
    banner: {
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
      backgroundColor: `${theme.colors.warning}10`,
      borderColor: `${theme.colors.warning}50`,
      borderWidth: 1,
    },
    bannerTitle: {
      color: theme.colors.warning,
      fontWeight: '700',
      fontSize: theme.typography.body.size,
      lineHeight: theme.typography.body.lineHeight,
    },
    bannerBody: {
      color: theme.colors.onMuted,
      lineHeight: theme.typography.body.lineHeight,
    },
  });

export default DemoShowcaseScreen;
