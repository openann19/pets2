Here’s a copy-paste master brief to build PawReels v1.0+—an AI-powered, collaborative video system that feels magical, ships fast, and beats CapCut where it counts (speed, auto-magic, collab, pet-smart polish).

🚀 PawReels — Ultra Brief to Outperform CapCut (COPY/PASTE)
North Star

Create → Remix → Share loop in < 2 minutes.

Output looks like a pro editor did it, from a phone.

Pet-smart AI (segmentation, highlights) + frictionless collab.

1) Signature Differentiators

Pet-Smart Auto Edit

Detects pets, best angles, cutest moments (tail wag, eye contact, jumps).

Auto highlights + slo-mo on peaks; fur-enhance + eye-sparkle filters.

One-Tap Story Brain

“Make it emotional/funny/epic.” AI writes beat-timed storyline, stickers, captions (EN/BG).

Instant Collab + Duet Remix

Any reel has Remix / Duet. Co-edit with friends; CRDT live sessions.

“Team template” so creators publish reusable formats (with attribution).

Share Superpowers

Ending CTA chip (Adopt/Follow/Join Challenge) + deep link + QR.

Exports for IG/TikTok/Snap/YT Shorts in perfect specs (9:16/1:1/16:9).

2) Experience (User Flows)

Create: Pick clips/photos → choose Template (preview instantly) → choose Track → optional text → Export.

Remix/Duet: Open a reel → tap Remix → drop your clip → export.

Auto-captions: 1 tap; edit inline; BG/EN toggle; brand fonts.

Smart Resize: switch aspect ratio; auto reframe via subject tracking.

3) AI Stack (practical + fast)

On-device:

Pet segmentation (MobileNet/DeepLab distilled).

Shot detection, best frame scoring, smile/eye contact, action peaks.

Beat alignment (tempo estimation or template markers).

Server (optional):

Whisper-small for captions (fallback on-device if allowed).

NSFW/violence eg. MobileNet-V3 head on frames.

Face anonymize toggle (mosaic), license normalization.

Promptable Styles (safe):

“Funny / Tender / Epic” changes cuts, overlays, captions tone.

Guardrails: no cloning voices w/o explicit consent; only licensed tracks.

4) Template Engine (beats CapCut on speed + reuse)

JSON spec (deterministic, BPM-timed), no brittle auto-beats.

Slots: clip, text, sticker, effect with timed params.

Variants: upbeat / heartfelt / funny (3–5 to start).

Authoring: internal “Template Studio” web (drag timeline → exports JSON + thumbnail).

{
  "version": 1,
  "canvas": { "w": 1080, "h": 1920, "fps": 30, "bg": "#000" },
  "music": { "trackId": "trk_001", "bpm": 120, "offsetMs": 300 },
  "timeline": [
    { "t": 0, "slot": "clip", "index": 0, "durMs": 1000, "transOut": "dip" },
    { "t": 1000, "slot": "clip", "index": 1, "durMs": 900, "transOut": "cut" }
  ],
  "overlays": [
    { "t": 0, "type": "text", "key": "title", "style": "titleLg", "pos": ["50%","12%"] },
    { "t": -800, "type": "cta", "variant": "adopt" }
  ],
  "fx": [
    { "t": 500, "type": "zoomPunch", "amount": 0.08, "duration": 300 },
    { "t": 1200, "type": "furEnhance", "strength": 0.6 }
  ]
}

5) Rendering Architecture (fast preview, pristine export)

Preview Graph (client): RN + react-native-video (or AVPlayer/Exo under the hood), overlay UI, Reanimated for GPU transforms.

Export:

Server render (default) FFmpeg (libx264/HEVC), LUTs, drawtext, overlays.

On-device fallback (≤10s): ffmpeg-kit-react-native.

Smart transcode presets: IG/TikTok/Snap/YouTube; loudness to -14 LUFS; 48kHz audio.

Targets

Preview loads < 300ms.

Server export 5–15s for 10–30s reels.

Crash-free on low-end Android.

6) Audio Engine

Track bank (licensed); waveform JSON + beat markers.

Auto ducking vs speech; hard cuts at beat.

SFX against actions (bark/jump), subtle.

7) Effects (pet-centric + tasteful)

Subject-aware reframing (keep pet centered).

Fur Enhance, Eye Sparkle, Pawtrail (particle tail on jumps).

Speed ramps with optical-flow blur; motion-matched captions.

LUTs: Pastel / Cinematic / Night.

Stickers: BG/EN packs; dynamic color from theme.

8) Collaboration & Remix

Remix graph: parent → child edges, auto credits.

Split-screen / Picture-in-Picture duet templates.

Live co-edit (CRDT)—optional v1.1: two users edit same draft.

9) Growth Loops

End-card CTA chip + deep link (paw.app/reel/:id?ref=USER).

Share to TikTok/IG/Snap + Poster OG card for web.

Weekly Remix Challenges (city leaderboard, badges).

Template Marketplace (later): creators publish & get featured.

10) Compliance, Safety, Moderation

Licensed tracks only (store licenseId, expiry).

Auto moderation: frame sampler → NSFW/violence score; queue if flagged.

Report/appeal flow; watermark includes brand + track credit.

Face blur toggle for privacy.

11) Metrics & SLAs

KPI:

Reels created/user

Remix rate (child/parent) ≥ 10%

Share rate ≥ 30%

Install CVR from deep link ≥ 8%

Perf: preview < 300ms, export < 15s (30s reel), crash-free > 99.9%.

Quality: SSIM ≥ 0.96 vs source; audio loudness within -13 to -15 LUFS.

12) Minimal Data Model
User(id, handle, locale, refCode)
Track(id, title, bpm, duration, licenseId, licenseExpiry, url, waveformJson)
Template(id, name, jsonSpec, thumbUrl, minClips, maxClips, tags[])
Reel(id, ownerId, templateId, trackId, srcJson, mp4Url, posterUrl,
     remixOfId?, status: draft|rendering|public|flagged|removed,
     duration, locale, watermark, createdAt, kpiShares, kpiInstalls)
Clip(id, reelId, order, srcUrl, startMs, endMs, captionJson?)
RemixEdge(parentId, childId, createdAt)
ShareEvent(id, reelId, channel, referrerUserId?, createdAt)
ModerationFlag(id, reelId, kind, score, status, notes)

13) APIs (thin, battle-tested)

GET /templates

GET /tracks

POST /uploads/sign → signed URLs for clips

POST /reels → create draft

PUT /reels/:id/clips → set clips + trims + captions

POST /reels/:id/render → enqueue render

GET /reels/:id → status + URLs

POST /reels/:id/remix → create child

POST /shares → record channel/ref

POST /moderation/webhook → set flagged/approved

Deep Links

paw.app/reel/:id?ref=:ref (QR uses same).

Open in app (watch page) or web landing with OG card.

14) Client Implementation Notes

RN Creator: 3 steps (Media → Template → Track) then “Make Magic”.

Auto mode: runs pet-smart highlight, captions, stickers—user edits if wanted.

BG/EN localization first-class (captions, stickers, end card).

Reduce-motion: swap heavy transitions for fades; keep 60fps.

Use FlashList for galleries; no frame drops.

15) Admin & Studio

Reels table: search, status, preview, takedown.

Templates: visual editor → exports JSON; A/B flags.

Tracks: upload, license fields, enable/disable.

Challenges: weekly configs, prizes, featured templates.

Analytics: funnel dashboards; per-template K-factor.

16) Analytics Events (name → payload)

reel_create_start { templateId, trackId }

reel_create_complete { reelId, duration, clipCount }

reel_render_start/complete { reelId, renderMs }

reel_share_click { reelId, channel }

deeplink_open { path, ref }

install_attributed { ref, source: 'reel' }

remix_click { reelId }

remix_create_complete { parentId, childId }

moderation_flagged { reelId, kind, score }

17) Sprint Plan (2 weeks)

Week 1

Templates (3 presets) + track bank (10 tracks).

RN Creator flow (preview graph).

/uploads/sign, /reels, /reels/:id/render, /templates, /tracks.

Server render (FFmpeg) with overlays/drawtext/LUTs; S3/GCS.

Deep link open/watch page.

Auto captions (Whisper small) + BG/EN text.

Week 2

Remix flow (+ child graph).

CTA end card + share presets + QR.

NSFW moderation worker + admin table.

Pet-smart highlight pass (action/smile/eye contact heuristic v1).

Metrics dashboard; A/B template feature flags.

Polish perf; crash-free.

18) Risk & Mitigation

Music licenses: block export if license expired; show fallback tracks.

Device heat: keep heavy export on server; throttle previews.

GPS & privacy in reels: strip EXIF, blur faces on request.

ML edge cases: manual override UI; feedback loop to improve.

19) Acceptance Criteria (MVP)

A user can create a reel in under 120s from zero to share.

Remix works end-to-end, with automatic credits.

Exports pass platform specs, look pro on first try.

BG/EN content correct; end-card deep links drive installs.

Moderation protects public feed without blocking legit content.

Developer TODO (now)

Scaffold APIs + Render service Docker (FFmpeg + fonts + stickers).

Implement 3 templates (JSON) + 10 tracks (with beat markers).

RN Creator (3 steps) + Watch page (Remix button) + Share.

Deep links + QR + OG cards.

Moderation worker + admin minimal.

Analytics wiring + dashboards.) Template JSONs (Upbeat / Heartfelt / Funny)

Save under templates/ or seed via /templates admin. All three are self-contained (include styles) and assume 1080×1920 @ 30fps. They use BPM + offsetMs for beat alignment, and a last-second CTA. Keys under text.key are i18n keys (EN/BG).

templates/upbeat.json
{
  "id": "tpl_upbeat_v1",
  "name": "Upbeat • Punchy Cuts",
  "version": 1,
  "minClips": 5,
  "maxClips": 12,
  "canvas": { "w": 1080, "h": 1920, "fps": 30, "bg": "#000000" },
  "music": { "bpm": 128, "offsetMs": 300 },
  "timeline": [
    { "t": 0,    "clip": 0, "inMs": 0, "durMs": 900,  "transOut": "dip" },
    { "t": 900,  "clip": 1, "inMs": 0, "durMs": 800,  "transOut": "cut" },
    { "t": 1700, "clip": 2, "inMs": 0, "durMs": 900,  "transOut": "slideUp" },
    { "t": 2600, "clip": 3, "inMs": 0, "durMs": 900,  "transOut": "dip" },
    { "t": 3500, "clip": 4, "inMs": 0, "durMs": 1000, "transOut": "cut" }
  ],
  "fx": [
    { "t": 400,  "type": "zoomPunch", "amount": 0.08, "duration": 220 },
    { "t": 1300, "type": "zoomPunch", "amount": 0.06, "duration": 200 },
    { "t": 2100, "type": "furEnhance", "strength": 0.6 },
    { "t": 3200, "type": "eyeSparkle", "strength": 0.7 }
  ],
  "overlays": [
    { "t": 0, "durMs": 1200, "type": "text", "key": "reels.title_upbeat", "style": "titleLg", "pos": ["50%","12%"] },
    { "t": 1800, "durMs": 600, "type": "sticker", "name": "paw", "pos": ["90%","86%"], "scale": 0.9 }
  ],
  "cta": { "variant": "adopt", "t": -1000 },
  "styles": {
    "titleLg": { "font": "Inter-Bold.ttf", "size": 64, "color": "#FFFFFF", "align": "center", "shadow": "000000CC:2:2" },
    "caption": { "font": "Inter-Medium.ttf", "size": 36, "color": "#FFFFFF", "align": "center", "bg": "#00000080", "pad": 16 }
  }
}

templates/heartfelt.json
{
  "id": "tpl_heartfelt_v1",
  "name": "Heartfelt • Smooth Moments",
  "version": 1,
  "minClips": 4,
  "maxClips": 10,
  "canvas": { "w": 1080, "h": 1920, "fps": 30, "bg": "#000000" },
  "music": { "bpm": 92, "offsetMs": 450 },
  "timeline": [
    { "t": 0,    "clip": 0, "inMs": 0, "durMs": 1400, "transOut": "fade" },
    { "t": 1400, "clip": 1, "inMs": 0, "durMs": 1400, "transOut": "fade" },
    { "t": 2800, "clip": 2, "inMs": 0, "durMs": 1500, "transOut": "slideLeft" },
    { "t": 4300, "clip": 3, "inMs": 0, "durMs": 1600, "transOut": "fade" }
  ],
  "fx": [
    { "t": 1200, "type": "vignette", "strength": 0.25 },
    { "t": 2000, "type": "softLUT", "name": "pastel" }
  ],
  "overlays": [
    { "t": 300,  "durMs": 2200, "type": "text", "key": "reels.title_heartfelt", "style": "lowerThird", "pos": ["50%","86%"] }
  ],
  "cta": { "variant": "follow", "t": -1200 },
  "styles": {
    "lowerThird": { "font": "Inter-SemiBold.ttf", "size": 40, "color": "#FFFFFF", "align": "center", "bg": "#00000066", "pad": 20, "radius": 24 }
  }
}

templates/funny.json
{
  "id": "tpl_funny_v1",
  "name": "Funny • Quick Cuts + Emojis",
  "version": 1,
  "minClips": 6,
  "maxClips": 16,
  "canvas": { "w": 1080, "h": 1920, "fps": 30, "bg": "#000000" },
  "music": { "bpm": 140, "offsetMs": 250 },
  "timeline": [
    { "t": 0,    "clip": 0, "inMs": 0, "durMs": 700, "transOut": "cut" },
    { "t": 700,  "clip": 1, "inMs": 0, "durMs": 650, "transOut": "slideUp" },
    { "t": 1350, "clip": 2, "inMs": 0, "durMs": 700, "transOut": "dip" },
    { "t": 2050, "clip": 3, "inMs": 0, "durMs": 650, "transOut": "cut" },
    { "t": 2700, "clip": 4, "inMs": 0, "durMs": 700, "transOut": "slideRight" },
    { "t": 3400, "clip": 5, "inMs": 0, "durMs": 700, "transOut": "cut" }
  ],
  "fx": [
    { "t": 600,  "type": "jumboSticker", "name": "lol", "pos": ["20%","15%"], "scale": 1.2, "duration": 400 },
    { "t": 1900, "type": "shake", "amplitude": 6, "duration": 260 },
    { "t": 3000, "type": "zoomPunch", "amount": 0.09, "duration": 180 }
  ],
  "overlays": [
    { "t": 1000, "durMs": 800, "type": "text", "key": "reels.caption_funny1", "style": "comic", "pos": ["50%","14%"] },
    { "t": 2600, "durMs": 800, "type": "text", "key": "reels.caption_funny2", "style": "comic", "pos": ["52%","84%"] }
  ],
  "cta": { "variant": "challenge", "t": -900 },
  "styles": {
    "comic": { "font": "Inter-Black.ttf", "size": 56, "color": "#FFFFFF", "stroke": "#000000", "strokeW": 6, "align": "center" }
  }
}

2) FFmpeg filter graphs (drop-in render presets)

These show clean, reproducible exports for each template using xfade transitions + overlays + captions. Replace clipX.mp4, track.mp3, and font paths. Keep -pix_fmt yuv420p for social compatibility.

A) Upbeat (5 clips, dip/cut/slideUp)
ffmpeg \
  -i track.mp3 \
  -i clip0.mp4 -i clip1.mp4 -i clip2.mp4 -i clip3.mp4 -i clip4.mp4 \
  -loop 1 -t 10 -i stickers/paw.png \
  -vf "scale=1080:1920" -y \
  -filter_complex "
    [1:v]scale=1080:1920,format=yuv420p,setpts=PTS-STARTPTS[v0];
    [2:v]scale=1080:1920,format=yuv420p,setpts=PTS-STARTPTS[v1];
    [3:v]scale=1080:1920,format=yuv420p,setpts=PTS-STARTPTS[v2];
    [4:v]scale=1080:1920,format=yuv420p,setpts=PTS-STARTPTS[v3];
    [5:v]scale=1080:1920,format=yuv420p,setpts=PTS-STARTPTS[v4];

    [v0]trim=0:0.9,setpts=PTS-STARTPTS[a0];
    [v1]trim=0:0.8,setpts=PTS-STARTPTS[a1];
    [v2]trim=0:0.9,setpts=PTS-STARTPTS[a2];
    [v3]trim=0:0.9,setpts=PTS-STARTPTS[a3];
    [v4]trim=0:1.0,setpts=PTS-STARTPTS[a4];

    [a0][a1]xfade=transition=fade:duration=0.20:offset=0.90[x1];
    [x1][a2]xfade=transition=slideup:duration=0.20:offset=1.70[x2];
    [x2][a3]xfade=transition=fadeblack:duration=0.20:offset=2.60[x3];
    [x3][a4]xfade=transition=fade:duration=0.20:offset=3.50[base];

    [base]drawtext=fontfile=assets/fonts/Inter-Bold.ttf:text='${REEL_TITLE}':x=(w-text_w)/2:y=0.12*h:fontsize=64:fontcolor=white:shadowx=2:shadowy=2:shadowcolor=0x000000AA[txt];

    [txt][6:v]overlay=x=0.9*w-w*0.09:y=0.86*h-h*0.09:enable='between(t,1.8,2.4)'[vout]
  " \
  -map "[vout]" -map 0:a \
  -r 30 -pix_fmt yuv420p -c:v libx264 -preset veryfast -crf 20 \
  -c:a aac -b:a 192k -shortest out_upbeat.mp4

B) Heartfelt (4 clips, fades, lower third)
ffmpeg \
  -i track.mp3 \
  -i c0.mp4 -i c1.mp4 -i c2.mp4 -i c3.mp4 \
  -filter_complex "
    [1:v]scale=1080:1920,format=yuv420p,setpts=PTS-STARTPTS[v0];
    [2:v]scale=1080:1920,format=yuv420p,setpts=PTS-STARTPTS[v1];
    [3:v]scale=1080:1920,format=yuv420p,setpts=PTS-STARTPTS[v2];
    [4:v]scale=1080:1920,format=yuv420p,setpts=PTS-STARTPTS[v3];

    [v0]trim=0:1.4,setpts=PTS-STARTPTS[a0];
    [v1]trim=0:1.4,setpts=PTS-STARTPTS[a1];
    [v2]trim=0:1.5,setpts=PTS-STARTPTS[a2];
    [v3]trim=0:1.6,setpts=PTS-STARTPTS[a3];

    [a0][a1]xfade=transition=fade:duration=0.25:offset=1.40[x1];
    [x1][a2]xfade=transition=fade:duration=0.25:offset=2.80[x2];
    [x2][a3]xfade=transition=slideleft:duration=0.25:offset=4.30[base];

    [base]drawbox=x=(w/2-420):y=(h*0.86-50):w=840:h=100:color=black@0.4:t=fill, \
          drawtext=fontfile=assets/fonts/Inter-SemiBold.ttf:text='${LOWER_THIRD}':x=(w-text_w)/2:y=h*0.86-0.5*text_h:fontsize=40:fontcolor=white[final]
  " \
  -map "[final]" -map 0:a \
  -r 30 -pix_fmt yuv420p -c:v libx264 -preset veryfast -crf 21 \
  -c:a aac -b:a 160k -shortest out_heartfelt.mp4

C) Funny (6 clips, quick cuts, comic captions)
ffmpeg \
  -i track.mp3 \
  -i c0.mp4 -i c1.mp4 -i c2.mp4 -i c3.mp4 -i c4.mp4 -i c5.mp4 \
  -filter_complex "
    [1:v]scale=1080:1920,format=yuv420p,setpts=PTS-STARTPTS[v0];
    [2:v]scale=1080:1920,format=yuv420p,setpts=PTS-STARTPTS[v1];
    [3:v]scale=1080:1920,format=yuv420p,setpts=PTS-STARTPTS[v2];
    [4:v]scale=1080:1920,format=yuv420p,setpts=PTS-STARTPTS[v3];
    [5:v]scale=1080:1920,format=yuv420p,setpts=PTS-STARTPTS[v4];
    [6:v]scale=1080:1920,format=yuv420p,setpts=PTS-STARTPTS[v5];

    [v0]trim=0:0.7,setpts=PTS-STARTPTS[a0];
    [v1]trim=0:0.65,setpts=PTS-STARTPTS[a1];
    [v2]trim=0:0.7,setpts=PTS-STARTPTS[a2];
    [v3]trim=0:0.65,setpts=PTS-STARTPTS[a3];
    [v4]trim=0:0.7,setpts=PTS-STARTPTS[a4];
    [v5]trim=0:0.7,setpts=PTS-STARTPTS[a5];

    [a0][a1]xfade=transition=cut:duration=0.001:offset=0.70[x1];
    [x1][a2]xfade=transition=slideup:duration=0.20:offset=1.35[x2];
    [x2][a3]xfade=transition=cut:duration=0.001:offset=2.05[x3];
    [x3][a4]xfade=transition=slideright:duration=0.20:offset=2.70[x4];
    [x4][a5]xfade=transition=cut:duration=0.001:offset=3.40[base];

    [base]drawtext=fontfile=assets/fonts/Inter-Black.ttf:text='${CAPTION1}':x=(w-text_w)/2:y=h*0.14:fontsize=56:fontcolor=white:stroke_color=black:stroke_width=6:enable='between(t,1.0,1.8)'[t1];
    [t1]drawtext=fontfile=assets/fonts/Inter-Black.ttf:text='${CAPTION2}':x=(w-text_w)/2:y=h*0.84:fontsize=56:fontcolor=white:stroke_color=black:stroke_width=6:enable='between(t,2.6,3.4)'[final]
  " \
  -map "[final]" -map 0:a \
  -r 30 -pix_fmt yuv420p -c:v libx264 -preset veryfast -crf 20 \
  -c:a aac -b:a 192k -shortest out_funny.mp4


Tip: for CTA, render it as the last overlay (PNG or drawtext) during the last second (t >= duration - 1).

3) React Native Creator — Screen Skeleton (wired to APIs)

Plug into apps/mobile/src/screens/CreatorScreen.tsx. Assumes you have @/theme/Provider, react-native-video, and simple API client functions.

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, FlatList, Image } from 'react-native';
import Video from 'react-native-video';
import { useTheme } from '@/theme/Provider';
import { useTranslation } from 'react-i18next';

// ---------- API client (adjust paths) ----------
type Template = { id: string; name: string; minClips: number; maxClips: number };
type Track = { id: string; title: string; bpm: number; url: string };
type Reel = { id: string; status: 'draft'|'rendering'|'public'|'flagged'|'removed'; mp4Url?: string; posterUrl?: string };

async function api<T>(path: string, init?: RequestInit) {
  const r = await fetch(`${process.env.API_URL}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers||{}) }});
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()) as T;
}
const listTemplates = () => api<Template[]>('/templates');
const listTracks = () => api<Track[]>('/tracks');
const createReel = (body: any) => api<Reel>('/reels', { method: 'POST', body: JSON.stringify(body) });
const setClips = (id: string, clips: any[]) => api<Reel>(`/reels/${id}/clips`, { method: 'PUT', body: JSON.stringify({ clips }) });
const renderReel = (id: string) => api<Reel>(`/reels/${id}/render`, { method: 'POST' });
const getReel = (id: string) => api<Reel>(`/reels/${id}`);

// ---------- Media picking (stub; replace with your picker) ----------
type LocalClip = { uri: string; startMs: number; endMs: number; thumb?: string };
async function pickClips(): Promise<LocalClip[]> {
  // integrate expo-image-picker or your gallery
  return [];
}

// ---------- Screen ----------
export default function CreatorScreen() {
  const theme = useTheme();
  const { t } = useTranslation('reels');
  const styles = makeStyles(theme);

  const [step, setStep] = useState<0|1|2|3>(0);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [clips, setClipsState] = useState<LocalClip[]>([]);
  const [reel, setReel] = useState<Reel | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [tpls, trks] = await Promise.all([listTemplates(), listTracks()]);
      setTemplates(tpls); setTracks(trks);
    })().catch(console.error);
  }, []);

  const canNext = useMemo(() => {
    if (step === 0) return clips.length > 0;
    if (step === 1) return !!selectedTemplate;
    if (step === 2) return !!selectedTrack;
    return true;
  }, [step, clips, selectedTemplate, selectedTrack]);

  async function onPickMedia() {
    const picked = await pickClips();
    setClipsState(picked);
  }

  async function onRender() {
    if (!selectedTemplate || !selectedTrack || clips.length === 0) return;
    setLoading(true);
    try {
      const draft = await createReel({ templateId: selectedTemplate.id, trackId: selectedTrack.id, locale: 'auto', watermark: true });
      await setClips(draft.id, clips.map((c, i) => ({ order: i, srcUrl: c.uri, startMs: c.startMs, endMs: c.endMs })));
      await renderReel(draft.id);
      setReel(draft);
      // poll
      let done = false;
      while (!done) {
        const r = await getReel(draft.id);
        if (r.status === 'public') { setReel(r); done = true; }
        else if (r.status === 'flagged' || r.status === 'removed') { setReel(r); done = true; }
        else { await new Promise(res => setTimeout(res, 1500)); }
      }
      setStep(3);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root} testID="creator-screen">
      {/* Stepper */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {step===0 && t('step_media')}
          {step===1 && t('step_template')}
          {step===2 && t('step_music')}
          {step===3 && t('step_share')}
        </Text>
      </View>

      {/* Content */}
      {step === 0 && (
        <View style={styles.section}>
          <Pressable style={styles.primaryBtn} onPress={onPickMedia} testID="pick-media">
            <Text style={styles.primaryBtnText}>{t('pick_media')}</Text>
          </Pressable>
          <FlatList
            data={clips}
            keyExtractor={(c, i) => `${i}`}
            horizontal
            renderItem={({ item }) => (
              <View style={styles.thumbWrap}>
                {item.thumb ? <Image source={{ uri: item.thumb }} style={styles.thumb} /> : <View style={[styles.thumb, styles.thumbPlaceholder]} />}
              </View>
            )}
          />
        </View>
      )}

      {step === 1 && (
        <FlatList
          data={templates}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.card, selectedTemplate?.id === item.id && styles.cardActive]}
              onPress={() => setSelectedTemplate(item)}
              testID={`tpl-${item.id}`}
            >
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSub}>{t('clips_range', { min: item.minClips, max: item.maxClips })}</Text>
            </Pressable>
          )}
        />
      )}

      {step === 2 && (
        <FlatList
          data={tracks}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.card, selectedTrack?.id === item.id && styles.cardActive]}
              onPress={() => setSelectedTrack(item)}
              testID={`trk-${item.id}`}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSub}>{t('bpm', { bpm: item.bpm })}</Text>
            </Pressable>
          )}
        />
      )}

      {step === 3 && reel?.mp4Url && (
        <View style={styles.section}>
          <Video
            source={{ uri: reel.mp4Url }}
            style={styles.video}
            resizeMode="cover"
            repeat
            controls
            testID="reel-preview"
          />
          <View style={styles.row}>
            <Pressable style={styles.primaryBtn} onPress={() => {/* share/export + QR */}} testID="share-reel">
              <Text style={styles.primaryBtnText}>{t('share')}</Text>
            </Pressable>
            <Pressable style={styles.ghostBtn} onPress={() => {/* remix deeplink */}} testID="remix-reel">
              <Text style={styles.ghostBtnText}>{t('remix')}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Footer actions */}
      <View style={styles.footer}>
        {step > 0 && (
          <Pressable style={styles.ghostBtn} onPress={() => setStep((s)=> (s-1) as any)} testID="prev-step">
            <Text style={styles.ghostBtnText}>{t('back')}</Text>
          </Pressable>
        )}
        {step < 3 && (
          <Pressable
            style={[styles.primaryBtn, !canNext && { opacity: 0.5 }]}
            onPress={() => (step < 2 ? setStep((s)=> (s+1) as any) : onRender())}
            disabled={!canNext || loading}
            testID="next-step"
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{step < 2 ? t('next') : t('render')}</Text>}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const makeStyles = (theme: any) => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg, padding: 16, gap: 12 },
  header: { paddingVertical: 8 },
  headerText: { color: theme.colors.text, fontSize: 20, fontWeight: '700' },
  section: { gap: 12 },
  video: { width: '100%', height: 420, backgroundColor: '#000' },
  row: { flexDirection: 'row', gap: 12, marginTop: 12 },
  primaryBtn: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  primaryBtnText: { color: theme.colors.primaryText, fontWeight: '700' },
  ghostBtn: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  ghostBtnText: { color: theme.colors.text, fontWeight: '700' },
  card: { padding: 14, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, marginBottom: 10 },
  cardActive: { borderColor: theme.colors.primary },
  cardTitle: { color: theme.colors.text, fontWeight: '700' },
  cardSub: { color: theme.colors.textMuted, marginTop: 4 },
  thumbWrap: { marginRight: 8 },
  thumb: { width: 84, height: 150, borderRadius: theme.radius.sm, backgroundColor: '#111' },
  thumbPlaceholder: { backgroundColor: theme.colors.bgAlt }
});


i18n (add to locales/en/reels.json)

{
  "step_media": "Pick Media",
  "step_template": "Choose Template",
  "step_music": "Choose Track",
  "step_share": "Share",
  "pick_media": "Pick photos/videos",
  "clips_range": "{{min}}–{{max}} clips",
  "bpm": "{{bpm}} BPM",
  "next": "Next",
  "back": "Back",
  "render": "Make Magic",
  "share": "Share",
  "remix": "Remix"
}


(BG mirror accordingly.)

Optional bonus: Render Dockerfile (FFmpeg + fonts)
FROM jrottenberg/ffmpeg:6.0-ubuntu
RUN apt-get update && apt-get install -y fonts-dejavu-core && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY assets/fonts /app/assets/fonts
COPY render-service/ /app
CMD ["node", "dist/index.js"]