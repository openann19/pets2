export type WebProcessingReport = {
  trim?: { didTrim: boolean; msRemoved: number };
  normalize?: { targetLufs: number; appliedGainDb: number; measuredDbfs: number };
};

/**
 * Check if web audio processing is available
 * Mobile-safe: returns false if window is not available
 */
export function canProcessOnWeb(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(window.AudioContext || (window as any).webkitAudioContext);
}

type Options = {
  trimThresholdDb: number;
  trimPaddingMs: number;
  normalizeToLufs: number; // approximated via dBFS RMS
};

const rmsDb = (samples: Float32Array) => {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    const v = samples[i];
    if (v !== undefined && !isNaN(v)) sum += v * v;
  }
  const rms = Math.sqrt(sum / samples.length + 1e-12);
  return 20 * Math.log10(rms + 1e-12);
};
const dbToLinear = (db: number) => Math.pow(10, db / 20);

/**
 * Process audio on web platform using Web Audio API
 * Mobile-safe: This function should only be called if canProcessOnWeb() returns true
 */
export async function processAudioWeb(
  input: Blob,
  opts: Options,
): Promise<{ blob: Blob; report: WebProcessingReport }> {
  if (!canProcessOnWeb()) {
    throw new Error('Web audio processing is not available on this platform');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AC();
  const arrayBuf = await input.arrayBuffer();
  const decoded = await ctx.decodeAudioData(arrayBuf);

  const mono = decoded.numberOfChannels > 1 ? mixdown(decoded) : decoded.getChannelData(0);

  // Trim silence
  const sr = decoded.sampleRate;
  const threshold = dbToLinear(opts.trimThresholdDb);
  const win = Math.floor(sr * 0.02);
  const { startIdx, endIdx } = detectBounds(mono, threshold, win);
  const pad = Math.floor((opts.trimPaddingMs / 1000) * sr);
  const from = Math.max(0, startIdx - pad);
  const to = Math.min(mono.length, endIdx + pad);

  const didTrim = from > 0 || to < mono.length;
  const msRemoved = ((mono.length - (to - from)) / sr) * 1000;

  // Slice all channels
  const sliced = sliceBuffer(decoded, from, to);

  // Normalize to target (approx LUFS)
  const mono2 = sliced.numberOfChannels > 1 ? mixdown(sliced) : sliced.getChannelData(0);
  const measuredDb = rmsDb(mono2);
  const gainDb = opts.normalizeToLufs - measuredDb;
  const normalized = applyGain(sliced, dbToLinear(gainDb));

  // Export WAV
  const wav = encodeWav(normalized);
  const blob = new Blob([wav], { type: 'audio/wav' });

  ctx.close();
  return {
    blob,
    report: {
      trim: { didTrim, msRemoved: Math.max(0, Math.round(msRemoved)) },
      normalize: {
        targetLufs: opts.normalizeToLufs,
        appliedGainDb: Math.round(gainDb * 10) / 10,
        measuredDbfs: Math.round(measuredDb * 10) / 10,
      },
    },
  };
}

// helpers
function detectBounds(data: Float32Array, th: number, win: number) {
  const abs = (i: number) => {
    const val = data[i];
    return val !== undefined ? Math.abs(val) : 0;
  };
  let start = 0;
  let end = data.length - 1;

  for (let i = 0; i < data.length - win; i += win) {
    let mx = 0;
    for (let j = 0; j < win; j++) mx = Math.max(mx, abs(i + j));
    if (mx > th) {
      start = i;
      break;
    }
  }
  for (let i = data.length - win; i >= 0; i -= win) {
    let mx = 0;
    for (let j = 0; j < win; j++) mx = Math.max(mx, abs(i + j));
    if (mx > th) {
      end = i + win;
      break;
    }
  }
  if (end <= start) {
    start = 0;
    end = data.length;
  }
  return { startIdx: start, endIdx: end };
}

function sliceBuffer(buf: AudioBuffer, from: number, to: number) {
  const len = to - from;
  const out = new AudioBuffer({
    length: len,
    sampleRate: buf.sampleRate,
    numberOfChannels: buf.numberOfChannels,
  });
  for (let ch = 0; ch < buf.numberOfChannels; ch++) {
    const src = buf.getChannelData(ch).subarray(from, to);
    out.copyToChannel(src, ch, 0);
  }
  return out;
}

function mixdown(buf: AudioBuffer) {
  const len = buf.length;
  const tmp = new Float32Array(len);
  for (let ch = 0; ch < buf.numberOfChannels; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      const val = d[i];
      const curr = tmp[i];
      if (val !== undefined && curr !== undefined) {
        tmp[i] = curr + val;
      }
    }
  }
  for (let i = 0; i < len; i++) {
    const val = tmp[i];
    if (val !== undefined) {
      tmp[i] = val / buf.numberOfChannels;
    }
  }
  return tmp;
}

function applyGain(buf: AudioBuffer, g: number) {
  const out = new AudioBuffer({
    length: buf.length,
    sampleRate: buf.sampleRate,
    numberOfChannels: buf.numberOfChannels,
  });
  for (let ch = 0; ch < buf.numberOfChannels; ch++) {
    const src = buf.getChannelData(ch);
    const dst = new Float32Array(src.length);
    for (let i = 0; i < src.length; i++) {
      const val = src[i];
      let v = (val !== undefined ? val : 0) * g;
      if (v > 1) v = 1;
      if (v < -1) v = -1;
      dst[i] = v;
    }
    out.copyToChannel(dst, ch, 0);
  }
  return out;
}

function encodeWav(buf: AudioBuffer) {
  const nCh = buf.numberOfChannels;
  const sr = buf.sampleRate;
  const bytes = buf.length * nCh * 2;
  const buffer = new ArrayBuffer(44 + bytes);
  const view = new DataView(buffer);

  writeStr(view, 0, 'RIFF');
  view.setUint32(4, 36 + bytes, true);
  writeStr(view, 8, 'WAVE');
  writeStr(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, nCh, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * nCh * 2, true);
  view.setUint16(32, nCh * 2, true);
  view.setUint16(34, 16, true);
  writeStr(view, 36, 'data');
  view.setUint32(40, bytes, true);

  let offset = 44;
  const chans: Float32Array[] = [];
  for (let ch = 0; ch < nCh; ch++) chans.push(buf.getChannelData(ch));
  for (let i = 0; i < buf.length; i++) {
    for (let ch = 0; ch < nCh; ch++) {
      const val = chans[ch]?.[i];
      const s = val !== undefined ? Math.max(-1, Math.min(1, val)) : 0;
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }
  return buffer;
}
function writeStr(view: DataView, at: number, s: string) {
  for (let i = 0; i < s.length; i++) view.setUint8(at + i, s.charCodeAt(i));
}
