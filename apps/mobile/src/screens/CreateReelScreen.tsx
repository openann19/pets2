/**
 * CreateReelScreen - PawReels Creator
 * 3-step flow: Media → Template → Track → Render
 */

import { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { useTheme } from '@mobile/theme';
import { useTranslation } from 'react-i18next';

const API_URL = process.env['EXPO_PUBLIC_API_URL'] || 'http://localhost:3001';

type Template = { id: string; name: string; minClips: number; maxClips: number; jsonSpec: any };
type Track = { id: string; title: string; artist: string; bpm: number; url: string };
type Reel = { id: string; status: 'draft' | 'rendering' | 'public' | 'flagged' | 'removed'; mp4_url?: string; poster_url?: string };
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
const createReel = (body: any) => api<Reel>('/reels', { method: 'POST', body: JSON.stringify(body) });
const setClips = (id: string, clips: any[]) => api<Reel>(`/reels/${id}/clips`, { method: 'PUT', body: JSON.stringify({ clips }) });
const renderReel = (id: string) => api<Reel>(`/reels/${id}/render`, { method: 'POST' });
const getReel = (id: string) => api<Reel>(`/reels/${id}`);

async function pickClips(): Promise<Clip[]> {
  // TODO: Integrate with expo-image-picker or your gallery picker
  // For now, return empty array
  return [];
}

export default function CreateReelScreen() {
  const theme = useTheme();
  const { t } = useTranslation('reels');
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
        }))
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
      console.error('Render failed:', error);
      Alert.alert('Error', 'Failed to render reel');
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {step === 0 && t('step_media')}
          {step === 1 && t('step_template')}
          {step === 2 && t('step_music')}
          {step === 3 && t('step_share')}
        </Text>
        {step < 3 && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((step + 1) / 3) * 100}%` }]} />
          </View>
        )}
        {loading && (
          <View style={styles.renderProgress}>
            <Text style={styles.renderProgressText}>Rendering... {Math.floor(renderProgress)}%</Text>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Step 0: Pick Media */}
        {step === 0 && (
          <View style={styles.section}>
            <Pressable style={styles.primaryBtn} onPress={onPickMedia}>
              <Text style={styles.primaryBtnText}>{t('pick_media')}</Text>
            </Pressable>
            {clips.length > 0 && (
              <View style={styles.clipsList}>
                {clips.map((clip, index) => (
                  <View key={index} style={styles.clipItem}>
                    {clip.thumb ? (
                      <Image source={{ uri: clip.thumb }} style={styles.clipThumb} />
                    ) : (
                      <View style={styles.clipPlaceholder} />
                    )}
                    <Text style={styles.clipText}>Clip {index + 1}</Text>
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
              >
                <Text style={styles.cardTitle}>{template.name}</Text>
                <Text style={styles.cardSub}>{t('clips_range', { min: template.minClips, max: template.maxClips })}</Text>
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
              >
                <Text style={styles.cardTitle}>{track.title}</Text>
                <Text style={styles.cardSub}>{track.artist} • {t('bpm', { bpm: track.bpm })}</Text>
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
              <Pressable style={styles.primaryBtn} onPress={() => Alert.alert('Share', 'Share functionality coming soon')}>
                <Text style={styles.primaryBtnText}>{t('share')}</Text>
              </Pressable>
              <Pressable style={styles.ghostBtn} onPress={() => Alert.alert('Remix', 'Remix functionality coming soon')}>
                <Text style={styles.ghostBtnText}>{t('remix')}</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        {step > 0 && (
          <Pressable style={styles.ghostBtn} onPress={() => setStep((s) => (s - 1) as any)}>
            <Text style={styles.ghostBtnText}>{t('back')}</Text>
          </Pressable>
        )}
        {step < 3 && (
          <Pressable
            style={[styles.primaryBtn, !canNext && styles.primaryBtnDisabled]}
            onPress={() => (step < 2 ? setStep((s) => (s + 1) as any) : onRender())}
            disabled={!canNext || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
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
    header: { padding: 16, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    headerText: { fontSize: 24, fontWeight: 'bold', color: theme.colors.onSurface, marginBottom: 12 },
    progressBar: { height: 4, backgroundColor: theme.colors.border, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: theme.colors.primary },
    renderProgress: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
    renderProgressText: { color: theme.colors.onSurface, fontSize: 14 },
    content: { flex: 1, padding: 16 },
    section: { gap: 16 },
    videoContainer: { width: '100%', height: 420, backgroundColor: '#000', borderRadius: 12, overflow: 'hidden' },
    videoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    videoText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    videoUrl: { color: '#ccc', fontSize: 12, marginTop: 8 },
    actionRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
    primaryBtn: { flex: 1, backgroundColor: theme.colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    primaryBtnDisabled: { opacity: 0.5 },
    primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    ghostBtn: { flex: 1, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    ghostBtnText: { color: theme.colors.onSurface, fontWeight: '700', fontSize: 16 },
    card: { padding: 16, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, marginBottom: 12 },
    cardActive: { borderColor: theme.colors.primary, borderWidth: 2 },
    cardTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.onSurface },
    cardSub: { fontSize: 14, color: theme.colors.onMuted, marginTop: 4 },
    clipsList: { flexDirection: 'row', gap: 12 },
    clipItem: { gap: 8 },
    clipThumb: { width: 80, height: 120, borderRadius: 8, backgroundColor: '#000' },
    clipPlaceholder: { width: 80, height: 120, borderRadius: 8, backgroundColor: theme.colors.border },
    clipText: { fontSize: 12, color: theme.colors.onSurface, textAlign: 'center' },
    footer: { padding: 16, flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: theme.colors.border },
  });

