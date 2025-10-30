/**
 * CreateReelScreen - PawReels Creator
 * 3-step flow: Media → Template → Track → Render
 */

import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Share,
} from 'react-native';
import { useTheme } from '@mobile/theme';
import { useTranslation } from 'react-i18next';
import { useReduceMotion } from '../hooks/useReducedMotion';
import { API_BASE_URL } from '../config/environment';
import * as ImagePicker from 'expo-image-picker';
import { logger } from '../services/logger';

const API_URL = API_BASE_URL;

type Template = { id: string; name: string; minClips: number; maxClips: number; jsonSpec: any };
type Track = { id: string; title: string; artist: string; bpm: number; url: string };
type Reel = {
  id: string;
  status: 'draft' | 'rendering' | 'public' | 'flagged' | 'removed';
  mp4_url?: string;
  poster_url?: string;
};
type Clip = { uri: string; startMs: number; endMs: number; thumb?: string };

async function api<T>(path: string, init?: RequestInit) {
  const r = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()) as T;
}

const listTemplates = () => api<Template[]>('/templates');
const listTracks = () => api<Track[]>('/tracks');
const createReel = (body: any) =>
  api<Reel>('/reels', { method: 'POST', body: JSON.stringify(body) });
const setClips = (id: string, clips: any[]) =>
  api<Reel>(`/reels/${id}/clips`, { method: 'PUT', body: JSON.stringify({ clips }) });
const renderReel = (id: string) => api<Reel>(`/reels/${id}/render`, { method: 'POST' });
const getReel = (id: string) => api<Reel>(`/reels/${id}`);

async function pickClips(): Promise<Clip[]> {
  try {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant permission to access your media library to create reels.',
      );
      return [];
    }

    // Launch image/video picker with multiple selection
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Allow both images and videos
      allowsMultipleSelection: true,
      quality: 0.8,
      videoMaxDuration: 60, // Max 60 seconds per clip
      allowsEditing: false, // We'll handle editing in the reel creation flow
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return [];
    }

    // Convert assets to Clip format
    const clips: Clip[] = result.assets.map((asset) => {
      // For videos, extract duration; for images, use a default duration
      const duration = asset.duration ? asset.duration * 1000 : 3000; // Default 3 seconds for images

      return {
        uri: asset.uri,
        startMs: 0,
        endMs: Math.min(duration, 60000), // Cap at 60 seconds
        thumb: asset.thumbnailUri || asset.uri, // Use thumbnail if available
      };
    });

    logger.info('Clips selected for reel', { count: clips.length });
    return clips;
  } catch (error) {
    logger.error('Error picking clips for reel', { error });
    Alert.alert('Error', 'Failed to pick media. Please try again.');
    return [];
  }
}

export default function CreateReelScreen() {
  const theme = useTheme();
  const { t } = useTranslation('reels');
  const reducedMotion = useReduceMotion();
  const styles = makeStyles(theme);

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [clips, setClipsState] = useState<Clip[]>([]);
  const [reel, setReel] = useState<Reel | null>(null);
  const [loading, setLoading] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [tpls, trks] = await Promise.all([listTemplates(), listTracks()]);
        setTemplates(tpls);
        setTracks(trks);
      } catch (error) {
        console.error('Failed to load data:', error);
        Alert.alert('Error', 'Failed to load templates and tracks');
      }
    })();
  }, []);

  const canNext = useMemo(() => {
    if (step === 0) return clips.length > 0;
    if (step === 1) return !!selectedTemplate;
    if (step === 2) return !!selectedTrack;
    return true;
  }, [step, clips, selectedTemplate, selectedTrack]);

  async function onPickMedia() {
    try {
      const picked = await pickClips();
      setClipsState(picked);
    } catch (error) {
      console.error('Failed to pick media:', error);
      Alert.alert('Error', 'Failed to pick media');
    }
  }

  async function onRender() {
    if (!selectedTemplate || !selectedTrack || clips.length === 0) return;

    setLoading(true);
    setRenderProgress(0);

    try {
      // Step 1: Create reel
      const draft = await createReel({
        templateId: selectedTemplate.id,
        trackId: selectedTrack.id,
        locale: 'en',
        watermark: true,
      });

      // Step 2: Add clips
      await setClips(
        draft.id,
        clips.map((c, i) => ({
          order: i,
          srcUrl: c.uri,
          startMs: c.startMs,
          endMs: c.endMs,
        })),
      );

      // Step 3: Queue render
      await renderReel(draft.id);
      setReel(draft);

      // Step 4: Poll for completion
      let attempts = 0;
      while (attempts < 60) {
        const r = await getReel(draft.id);
        setRenderProgress(attempts * (100 / 60));

        if (r.status === 'public') {
          setReel(r);
          setStep(3);
          setLoading(false);
          return;
        } else if (r.status === 'flagged' || r.status === 'removed') {
          Alert.alert('Error', 'Reel was flagged or removed');
          setLoading(false);
          return;
        }

        await new Promise((res) => setTimeout(res, 2000));
        attempts++;
      }

      Alert.alert('Timeout', 'Render took too long');
      setLoading(false);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      logger.error('Render failed:', { error: errorObj });
      Alert.alert('Error', 'Failed to render reel');
      setLoading(false);
    }
  }

  const handleShare = async () => {
    if (!reel || !reel.mp4_url) {
      Alert.alert('Error', 'Reel is not ready to share yet.');
      return;
    }

    try {
      const shareUrl = reel.mp4_url;
      const result = await Share.share({
        message: `Check out my PawReel! ${shareUrl}`,
        url: shareUrl,
        title: 'Share PawReel',
      });

      if (result.action === Share.sharedAction) {
        logger.info('Reel shared successfully', { reelId: reel.id, platform: result.activityType });
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to share reel', { error: errorObj });
      Alert.alert('Error', 'Failed to share reel. Please try again.');
    }
  };

  const handleRemix = () => {
    // Remix functionality - create a new reel using the same template and clips
    Alert.alert('Remix Reel', 'This will create a new reel using the same template. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remix',
        onPress: async () => {
          try {
            // Reset to step 0 but keep the selected template and clips
            setStep(0);
            setReel(null);
            logger.info('Remix reel initiated', { originalReelId: reel?.id });
          } catch (error) {
            const errorObj = error instanceof Error ? error : new Error(String(error));
            logger.error('Failed to remix reel', { error: errorObj });
            Alert.alert('Error', 'Failed to create remix. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <View
      style={styles.root}
      testID="create-reel-screen"
      accessibilityLabel="Create reel screen"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={styles.headerText}
          testID="create-reel-step-title"
          accessibilityRole="header"
          accessibilityLabel={
            step === 0
              ? t('step_media')
              : step === 1
                ? t('step_template')
                : step === 2
                  ? t('step_music')
                  : t('step_share')
          }
        >
          {step === 0 && t('step_media')}
          {step === 1 && t('step_template')}
          {step === 2 && t('step_music')}
          {step === 3 && t('step_share')}
        </Text>
        {step < 3 &&
          (reducedMotion ? (
            <Text
              style={styles.progressLabel}
              accessibilityRole="text"
              testID="create-reel-progress-label"
            >
              {t('progress_label', { current: step + 1, total: 4 })}
            </Text>
          ) : (
            <View
              style={styles.progressBar}
              accessibilityRole="progressbar"
              accessibilityValue={{
                min: 0,
                max: 3,
                now: step + 1,
                text: `${step + 1} of 3 steps completed`,
              }}
              testID="create-reel-progress-bar"
            >
              <View style={[styles.progressFill, { width: `${((step + 1) / 3) * 100}%` }]} />
            </View>
          ))}
        {loading && (
          <View style={styles.renderProgress}>
            <Text style={styles.renderProgressText}>
              Rendering... {Math.floor(renderProgress)}%
            </Text>
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              accessibilityLabel="Rendering reel"
            />
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        testID="create-reel-scroll-view"
        accessibilityRole="scrollbar"
        accessibilityLabel="Create reel steps"
      >
        {/* Step 0: Pick Media */}
        {step === 0 && (
          <View style={styles.section}>
            <Pressable
              style={styles.primaryBtn}
              onPress={onPickMedia}
              testID="create-reel-pick-media"
              accessibilityRole="button"
              accessibilityLabel={t('pick_media')}
            >
              <Text style={styles.primaryBtnText}>{t('pick_media')}</Text>
            </Pressable>
            {clips.length > 0 && (
              <View style={styles.clipsList}>
                {clips.map((clip, index) => (
                  <View
                    key={index}
                    style={styles.clipItem}
                    accessibilityRole="image"
                    accessibilityLabel={t('clip_label', { index: index + 1 })}
                  >
                    {clip.thumb ? (
                      <Image
                        source={{ uri: clip.thumb }}
                        style={styles.clipThumb}
                      />
                    ) : (
                      <View style={styles.clipPlaceholder} />
                    )}
                    <Text style={styles.clipText}>{t('clip_label', { index: index + 1 })}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Step 1: Select Template */}
        {step === 1 && (
          <View style={styles.section}>
            {templates.map((template) => (
              <Pressable
                key={template.id}
                style={[styles.card, selectedTemplate?.id === template.id && styles.cardActive]}
                onPress={() => setSelectedTemplate(template)}
                testID={`create-reel-template-${template.id}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedTemplate?.id === template.id }}
                accessibilityLabel={template.name}
              >
                <Text style={styles.cardTitle}>{template.name}</Text>
                <Text style={styles.cardSub}>
                  {t('clips_range', { min: template.minClips, max: template.maxClips })}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Step 2: Select Track */}
        {step === 2 && (
          <View style={styles.section}>
            {tracks.map((track) => (
              <Pressable
                key={track.id}
                style={[styles.card, selectedTrack?.id === track.id && styles.cardActive]}
                onPress={() => setSelectedTrack(track)}
                testID={`create-reel-track-${track.id}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedTrack?.id === track.id }}
                accessibilityLabel={`${track.title} by ${track.artist}`}
              >
                <Text style={styles.cardTitle}>{track.title}</Text>
                <Text style={styles.cardSub}>
                  {track.artist} • {t('bpm', { bpm: track.bpm })}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Step 3: Share Result */}
        {step === 3 && reel?.mp4_url && (
          <View style={styles.section}>
            <View style={styles.videoContainer}>
              {/* Video preview would go here */}
              <View style={styles.videoPlaceholder}>
                <Text style={styles.videoText}>🎬 Reel Ready!</Text>
                <Text style={styles.videoUrl}>{reel.mp4_url}</Text>
              </View>
            </View>
            <View style={styles.actionRow}>
              <Pressable
                style={styles.primaryBtn}
                onPress={handleShare}
                testID="create-reel-share"
                accessibilityRole="button"
                accessibilityLabel={t('share')}
              >
                <Text style={styles.primaryBtnText}>{t('share')}</Text>
              </Pressable>
              <Pressable
                style={styles.ghostBtn}
                onPress={handleRemix}
                testID="create-reel-remix"
                accessibilityRole="button"
                accessibilityLabel={t('remix')}
              >
                <Text style={styles.ghostBtnText}>{t('remix')}</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Actions */}
      <View
        style={styles.footer}
        accessibilityRole="menubar"
        testID="create-reel-footer"
      >
        {step > 0 && (
          <Pressable
            style={styles.ghostBtn}
            onPress={() => setStep((s) => (s - 1) as any)}
            testID="create-reel-back"
            accessibilityRole="button"
            accessibilityLabel={t('back')}
          >
            <Text style={styles.ghostBtnText}>{t('back')}</Text>
          </Pressable>
        )}
        {step < 3 && (
          <Pressable
            style={[styles.primaryBtn, !canNext && styles.primaryBtnDisabled]}
            onPress={() => (step < 2 ? setStep((s) => (s + 1) as any) : onRender())}
            disabled={!canNext || loading}
            testID="create-reel-next"
            accessibilityRole="button"
            accessibilityLabel={step < 2 ? t('next') : t('make_magic')}
            accessibilityState={{ disabled: !canNext || loading }}
          >
            {loading ? (
              <ActivityIndicator
                color={theme.colors.onPrimary}
                accessibilityLabel="Loading"
              />
            ) : (
              <Text style={styles.primaryBtnText}>{step < 2 ? t('next') : t('make_magic')}</Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.bg },
    header: {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing['4xl'],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerText: {
      fontSize: theme.typography.h1.size,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    progressLabel: {
      color: theme.colors.onMuted,
      fontSize: theme.typography.body.size * 0.875,
      marginBottom: theme.spacing.sm,
    },
    progressBar: {
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: theme.radii.xs,
      overflow: 'hidden',
    },
    progressFill: { height: '100%', backgroundColor: theme.colors.primary },
    renderProgress: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    renderProgressText: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.body.size * 0.875,
    },
    content: { flex: 1, padding: theme.spacing.lg },
    section: { gap: theme.spacing.lg },
    videoContainer: {
      width: '100%',
      height: 420,
      backgroundColor: theme.colors.bg,
      borderRadius: theme.radii.lg,
      overflow: 'hidden',
    },
    videoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    videoText: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.h1.size,
      fontWeight: theme.typography.h1.weight,
    },
    videoUrl: {
      color: theme.colors.onMuted,
      fontSize: theme.typography.body.size * 0.75,
      marginTop: theme.spacing.sm,
    },
    actionRow: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.lg },
    primaryBtn: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.lg,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
    },
    primaryBtnDisabled: { opacity: 0.5 },
    primaryBtnText: {
      color: theme.colors.onPrimary,
      fontWeight: theme.typography.h1.weight,
      fontSize: theme.typography.body.size,
    },
    ghostBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.lg,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
    },
    ghostBtnText: {
      color: theme.colors.onSurface,
      fontWeight: theme.typography.h1.weight,
      fontSize: theme.typography.body.size,
    },
    card: {
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.lg,
      marginBottom: theme.spacing.md,
    },
    cardActive: { borderColor: theme.colors.primary, borderWidth: 2 },
    cardTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onSurface,
    },
    cardSub: {
      fontSize: theme.typography.body.size * 0.875,
      color: theme.colors.onMuted,
      marginTop: theme.spacing.xs,
    },
    clipsList: { flexDirection: 'row', gap: theme.spacing.md },
    clipItem: { gap: theme.spacing.sm },
    clipThumb: {
      width: 80,
      height: 120,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.bg,
    },
    clipPlaceholder: {
      width: 80,
      height: 120,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.border,
    },
    clipText: {
      fontSize: theme.typography.body.size * 0.75,
      color: theme.colors.onSurface,
      textAlign: 'center',
    },
    footer: {
      padding: theme.spacing.lg,
      flexDirection: 'row',
      gap: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
  });
