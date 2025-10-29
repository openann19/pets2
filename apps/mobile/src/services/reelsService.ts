/**
 * Reels API Service
 * Client for PawReels backend
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export interface Template {
  id: string;
  name: string;
  minClips: number;
  maxClips: number;
  theme?: string;
  jsonSpec: any;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  url: string;
  waveformJson?: any;
  genre?: string;
  mood?: string;
}

export interface Reel {
  id: string;
  status: 'draft' | 'rendering' | 'public' | 'flagged' | 'removed';
  mp4_url?: string;
  poster_url?: string;
  duration_ms?: number;
  owner_id: string;
  template_id: string;
  track_id: string;
  kpi_shares: number;
  kpi_installs: number;
  created_at: string;
  clips?: Clip[];
}

export interface Clip {
  id?: string;
  order: number;
  src_url: string;
  srcUrl: string;
  start_ms: number;
  startMs: number;
  end_ms: number;
  endMs: number;
  caption_json?: any;
  captionJson?: any;
}

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'API request failed');
  }

  return response.json();
}

export const reelsService = {
  /**
   * List all active templates
   */
  listTemplates: (theme?: string): Promise<Template[]> => {
    const query = theme ? `?theme=${theme}` : '';
    return fetchAPI<Template[]>(`/templates${query}`);
  },

  /**
   * Get template by ID
   */
  getTemplate: (id: string): Promise<Template> => {
    return fetchAPI<Template>(`/templates/${id}`);
  },

  /**
   * List all active tracks
   */
  listTracks: (genre?: string, mood?: string): Promise<Track[]> => {
    const params = new URLSearchParams();
    if (genre) params.append('genre', genre);
    if (mood) params.append('mood', mood);
    const query = params.toString() ? `?${params}` : '';
    return fetchAPI<Track[]>(`/tracks${query}`);
  },

  /**
   * Get track by ID
   */
  getTrack: (id: string): Promise<Track> => {
    return fetchAPI<Track>(`/tracks/${id}`);
  },

  /**
   * Create a new reel (draft)
   */
  createReel: (data: {
    templateId: string;
    trackId: string;
    locale?: string;
    watermark?: boolean;
    remixOfId?: string;
  }): Promise<Reel> => {
    return fetchAPI<Reel>('/reels', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Add clips to a reel
   */
  addClips: (reelId: string, clips: Clip[]): Promise<void> => {
    return fetchAPI<void>(`/reels/${reelId}/clips`, {
      method: 'PUT',
      body: JSON.stringify({ clips }),
    });
  },

  /**
   * Queue reel for rendering
   */
  renderReel: (reelId: string): Promise<void> => {
    return fetchAPI<void>(`/reels/${reelId}/render`, {
      method: 'POST',
    });
  },

  /**
   * Get reel by ID
   */
  getReel: (reelId: string): Promise<Reel> => {
    return fetchAPI<Reel>(`/reels/${reelId}`);
  },

  /**
   * List public reels (feed)
   */
  listReels: (limit?: number, skip?: number): Promise<Reel[]> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (skip) params.append('skip', skip.toString());
    const query = params.toString() ? `?${params}` : '';
    return fetchAPI<Reel[]>(`/reels${query}`);
  },

  /**
   * Create remix of a reel
   */
  remixReel: (originalId: string): Promise<Reel> => {
    return fetchAPI<Reel>(`/reels/${originalId}/remix`, {
      method: 'POST',
    });
  },

  /**
   * Generate presigned upload URLs
   */
  presignUpload: (
    files: { key: string; contentType?: string }[],
  ): Promise<Array<{ signedUrl: string; key: string }>> => {
    return fetchAPI(`/uploads/sign`, {
      method: 'POST',
      body: JSON.stringify({ files }),
    });
  },

  /**
   * Track share event
   */
  trackShare: (reelId: string, channel: string, referrerUserId?: string): Promise<void> => {
    return fetchAPI(`/reels/${reelId}/share`, {
      method: 'POST',
      body: JSON.stringify({ channel, referrerUserId }),
    });
  },
};
