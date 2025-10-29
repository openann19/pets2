# Voice Recording Components - Ultra Stack

Fully local, no-stubs, production-ready voice note recording system with
auto-trim, normalization, and transcription.

## Components

- **VoiceRecorderUltra.web.tsx** - Web platform version with client-side DSP +
  STT
- **VoiceRecorderUltra.native.tsx** - React Native/Expo version with native
  recording
- **VoiceWaveformUltra.tsx** - Waveform visualization (shared from `../chat/`)
- **TranscriptionBadge.tsx** - Status badge (shared from `../chat/`)

## Features

### Web Platform

- ✅ Real recording via MediaRecorder API
- ✅ Auto-trim silence (-45 dBFS threshold, 120ms padding)
- ✅ Loudness normalization to ~-16 LUFS (approximated via dBFS RMS)
- ✅ Inline transcription via Web Speech API
- ✅ Export as WAV format
- ✅ Slide-to-cancel gesture
- ✅ Lock/unlock for continuous recording
- ✅ Preview with waveform visualization

### Native Platform

- ✅ Real recording via Expo AV
- ✅ Slide-to-cancel gesture
- ✅ Lock/unlock for continuous recording
- ✅ Preview with waveform visualization
- ⚠️ Native trim/normalize/STT requires additional libraries (not included)

## Usage

### Web Platform

```tsx
import { VoiceRecorderUltraWeb } from '@/components/voice';
import { chatService } from '@/services/chatService';

// Wrapper for chatService integration
const sendVoiceNoteWeb = async (
  matchId: string,
  dataOrBlob: any,
  extras?: { transcript?: string },
) => {
  // If your chatService expects FormData:
  if (dataOrBlob instanceof Blob) {
    const form = new FormData();
    form.append('file', dataOrBlob, 'voice-note.wav');
    if (extras?.transcript) form.append('transcript', extras.transcript);
    await chatService.sendVoiceNote(matchId, form);
    return;
  }
  await chatService.sendVoiceNote(matchId, dataOrBlob);
};

// In your chat component
<VoiceRecorderUltraWeb
  matchId={matchId}
  sendVoiceNote={sendVoiceNoteWeb}
  processing={{
    autoTrimSilence: true, // default: true
    trimThresholdDb: -45, // default: -45
    trimPaddingMs: 120, // default: 120
    normalizeToLufs: -16, // default: -16
  }}
  transcription={{
    enabled: true, // default: true
    interim: true, // default: true
    language: 'en-US', // optional: browser default
  }}
  maxDurationSec={120}
  minDurationSec={1}
  onVoiceNoteSent={() => console.log('Sent!')}
/>;
```

### Native Platform

```tsx
import { VoiceRecorderUltraNative } from '@/components/voice';
import { chatService } from '@/services/chatService';

<VoiceRecorderUltraNative
  matchId={matchId}
  sendVoiceNote={chatService.sendVoiceNote}
  maxDurationSec={120}
  minDurationSec={1}
  onVoiceNoteSent={() => console.log('Sent!')}
/>;
```

## Platform Detection

React Native/Expo automatically picks the right platform:

```tsx
import VoiceRecorderUltraWeb from "@/components/voice/VoiceRecorderUltra.web";
import VoiceRecorderUltraNative from "@/components/voice/VoiceRecorderUltra.native";

// Web usage
<VoiceRecorderUltraWeb {...props} />

// Native usage
<VoiceRecorderUltraNative {...props} />
```

Or use unified wrapper with platform detection in your chat component.

## Props

### Common Props (both platforms)

- `matchId: string` - The match/chat ID
- `sendVoiceNote: Function` - Your real sender (no placeholders!)
- `disabled?: boolean` - Disable recording
- `maxDurationSec?: number` - Max recording time (default: 120)
- `minDurationSec?: number` - Min recording time before send (default: 1)
- `onVoiceNoteSent?: () => void` - Callback after successful send

### Web-Only Props

- `processing?: object` - DSP options
  - `autoTrimSilence?: boolean` - Trim leading/trailing silence (default: true)
  - `trimThresholdDb?: number` - Silence threshold in dB (default: -45)
  - `trimPaddingMs?: number` - Padding around trimmed content (default: 120)
  - `normalizeToLufs?: number` - Target loudness level (default: -16)
- `transcription?: object` - STT options
  - `enabled?: boolean` - Enable Web Speech API transcription (default: true)
  - `interim?: boolean` - Show interim results (default: true)
  - `language?: string` - Language code (optional, uses browser default)

## User Experience

### Recording

- Hold mic button to record
- Lock icon to continue recording without holding
- Slide left to cancel
- Duration timer in real-time

### Preview

- Waveform visualization
- Processing badges (trim, normalize, transcribe)
- Play/pause preview
- Delete to retry
- Send button (green when ready)

### Web Processing

- Silently trims leading/trailing silence
- Normalizes loudness to ~-16 LUFS
- Generates inline transcript via Web Speech API
- Shows processing badges and transcript preview

## Integration Notes

The components are designed to work with your existing
`chatService.sendVoiceNote`:

```typescript
// Your chatService already supports both signatures:
await chatService.sendVoiceNote(matchId, formData); // Native
await chatService.sendVoiceNote(matchId, blob); // Web
```

The web component automatically handles transcript attachment:

```typescript
// If transcript exists, it's included in the FormData or Blob
form.append('transcript', transcript);
```

## No Placeholders

This stack is **fully functional** with:

- ✅ Real MediaRecorder API (web)
- ✅ Real Expo AV recording (native)
- ✅ Real client-side DSP (silence trim + normalization)
- ✅ Real Web Speech API (inline transcription)
- ✅ Real WAV encoding/export
- ✅ No "TODO" or "implement later" calls
- ✅ No fake hooks or stubs

## Future Enhancements (Optional)

If you want to add on-device processing for native:

1. Install native audio processing library (e.g.,
   `react-native-audio-recorder-player` + DSP library)
2. Install speech-to-text (e.g., `@react-native-voice/voice` or cloud API)
3. Implement native processing service matching the Web API
4. Wire through the component

But for now, **native ships clean recording/preview/send** without pretending to
have features that aren't there.

## Examples

See integration in `MessageInput.tsx` or chat screen components for real usage
examples.
