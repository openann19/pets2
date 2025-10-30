/**
 * Tracks Controller for PawfectMatch PawReels
 * Handles track listing and validation
 */

import type { Request, Response } from 'express';
import Track from '../models/Track';
const logger = require('../utils/logger');

// Helper functions
function ok(res: Response, status: number, payload: Record<string, unknown>): void {
  res.status(status).json({ success: true, ...payload });
}

function fail(res: Response, status: number, message: string, meta?: Record<string, unknown>): void {
  const body: { success: boolean; message: string; meta?: Record<string, unknown> } = { success: false, message };
  if (meta && process.env.NODE_ENV !== 'production') {
    body.meta = meta;
  }
  res.status(status).json(body);
}

/**
 * List all active tracks
 * GET /api/tracks
 */
export const listTracks = async (req: Request, res: Response): Promise<void> => {
  try {
    const genre = req.query.genre as string | undefined;
    const mood = req.query.mood as string | undefined;

    let tracks;
    if (genre) {
      tracks = await Track.findByGenre(genre);
    } else if (mood) {
      tracks = await Track.findByMood(mood);
    } else {
      tracks = await Track.findActive();
    }

    const result = tracks.map((track) => ({
      id: track._id,
      title: track.title,
      artist: track.artist,
      bpm: track.bpm,
      duration: track.duration,
      waveformJson: JSON.parse(track.waveformJson),
      genre: track.genre,
      mood: track.mood,
    }));

    ok(res, 200, {
      tracks: result,
      count: result.length,
    });
  } catch (error: any) {
    logger.error('Error listing tracks:', error);
    fail(res, 500, 'Failed to list tracks');
  }
};

/**
 * Get track by ID
 * GET /api/tracks/:id
 */
export const getTrack = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const track = await Track.findById(id);
    if (!track || !track.isActive) {
      fail(res, 404, 'Track not found or inactive');
      return;
    }

    // Validate license
    const licenseValid = await Track.validateLicense(track._id);
    if (!licenseValid) {
      fail(res, 403, 'Track license has expired');
      return;
    }

    ok(res, 200, {
      track: {
        id: track._id,
        title: track.title,
        artist: track.artist,
        bpm: track.bpm,
        duration: track.duration,
        url: track.url,
        waveformJson: JSON.parse(track.waveformJson),
        genre: track.genre,
        mood: track.mood,
      },
    });
  } catch (error: any) {
    logger.error('Error getting track:', error);
    fail(res, 500, 'Failed to get track');
  }
};

