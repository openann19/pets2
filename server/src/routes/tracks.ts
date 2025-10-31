/**
 * Tracks Routes for PawReels
 */

import { Router } from 'express';
import { db } from '../db';
import { getErrorMessage } from '../../utils/errorHandler';

const router = Router();

/**
 * GET /tracks
 * List all active tracks
 */
router.get('/', async (req, res) => {
  try {
    const genre = req.query.genre;
    const mood = req.query.mood;
    
    let query = 'select * from "Track" where is_active = true and license_expiry > now()';
    const params: any[] = [];
    
    if (genre) {
      query += ' and genre = $1';
      params.push(genre);
    } else if (mood) {
      query += ' and mood = $1';
      params.push(mood);
    }
    
    query += ' order by created_at desc';
    
    const tracks = await db.any(query, params);
    
    res.json(tracks.map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      bpm: t.bpm,
      duration: t.duration_ms,
      waveformJson: t.waveform_json,
      genre: t.genre,
      mood: t.mood,
      url: t.url,
    })));
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
});

/**
 * GET /tracks/:id
 * Get track by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const track = await db.oneOrNone('select * from "Track" where id = $1', [req.params.id]);
    
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    // Check license
    if (new Date(track.license_expiry) < new Date()) {
      return res.status(403).json({ error: 'Track license has expired' });
    }
    
    res.json({
      id: track.id,
      title: track.title,
      artist: track.artist,
      bpm: track.bpm,
      duration: track.duration_ms,
      url: track.url,
      waveformJson: track.waveform_json,
      genre: track.genre,
      mood: track.mood,
    });
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
});

export default router;
