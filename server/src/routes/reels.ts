/**
 * Reels Routes for PawReels
 */

import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { addRenderJob } from '../services/queue';

const router = Router();

const createReelSchema = z.object({
  templateId: z.string().uuid(),
  trackId: z.string().uuid(),
  locale: z.string().default('en'),
  watermark: z.boolean().default(true),
  remixOfId: z.string().uuid().optional(),
});

const addClipsSchema = z.object({
  clips: z.array(z.object({
    order: z.number().int().min(0),
    srcUrl: z.string().url(),
    startMs: z.number().int().min(0).default(0),
    endMs: z.number().int(),
    captionJson: z.record(z.unknown()).optional(),
  })).min(1),
});

/**
 * POST /reels
 * Create a new reel draft
 */
router.post('/', async (req, res) => {
  try {
    const body = createReelSchema.parse(req.body);
    
    // Get first user (in prod, use auth)
    const user = await db.one('select id from "User" order by created_at limit 1');
    
    const reel = await db.one(
      `insert into "Reel"(owner_id, template_id, track_id, locale, watermark, remix_of_id, status)
       values($1, $2, $3, $4, $5, $6, 'draft')
       returning *`,
      [user.id, body.templateId, body.trackId, body.locale, body.watermark, body.remixOfId]
    );
    
    if (body.remixOfId) {
      await db.none(
        'insert into "RemixEdge"(parent_id, child_id) values($1, $2)',
        [body.remixOfId, reel.id]
      );
    }
    
    res.json(reel);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * PUT /reels/:id/clips
 * Add clips to a reel
 */
router.put('/:id/clips', async (req, res) => {
  try {
    const { id } = req.params;
    const body = addClipsSchema.parse(req.body);
    
    // Delete existing clips
    await db.none('delete from "Clip" where reel_id = $1', [id]);
    
    // Insert new clips
    for (const clip of body.clips) {
      await db.none(
        'insert into "Clip"(reel_id, "order", src_url, start_ms, end_ms, caption_json) values($1, $2, $3, $4, $5, $6)',
        [id, clip.order, clip.srcUrl, clip.startMs, clip.endMs, clip.captionJson || null]
      );
    }
    
    res.json({ ok: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * POST /reels/:id/render
 * Queue reel for rendering
 */
router.post('/:id/render', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Update status to rendering
    await db.none('update "Reel" set status = \'rendering\' where id = $1', [id]);
    
    // Add to render queue
    await addRenderJob({ reelId: id });
    
    res.json({ queued: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * GET /reels/:id
 * Get reel by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const reel = await db.oneOrNone('select * from "Reel" where id = $1', [req.params.id]);
    
    if (!reel) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    // Get clips
    const clips = await db.any(
      'select * from "Clip" where reel_id = $1 order by "order"',
      [req.params.id]
    );
    
    res.json({ ...reel, clips });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * POST /reels/:id/remix
 * Create remix of a reel
 */
router.post('/:id/remix', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get original reel
    const original = await db.one('select * from "Reel" where id = $1', [id]);
    
    // Create remix
    const user = await db.one('select id from "User" order by created_at limit 1');
    
    const remix = await db.one(
      `insert into "Reel"(owner_id, template_id, track_id, remix_of_id, status)
       values($1, $2, $3, $4, 'draft')
       returning *`,
      [user.id, original.template_id, original.track_id, original.id]
    );
    
    // Create remix edge
    await db.none(
      'insert into "RemixEdge"(parent_id, child_id) values($1, $2)',
      [id, remix.id]
    );
    
    res.json(remix);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * GET /reels
 * List public reels (feed)
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = parseInt(req.query.skip as string) || 0;
    
    const reels = await db.any(
      'select * from "Reel" where status = \'public\' order by created_at desc limit $1 offset $2',
      [limit, skip]
    );
    
    res.json(reels);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * GET /render-context/:reelId
 * Return context for render worker (spec, clips, track, vars)
 */
router.get('/render-context/:reelId', async (req, res) => {
  try {
    const { reelId } = req.params;
    
    const reel = await db.one('select * from "Reel" where id = $1', [reelId]);
    const clips = await db.any('select * from "Clip" where reel_id = $1 order by "order"', [reelId]);
    const template = await db.one('select * from "Template" where id = $1', [reel.template_id]);
    const track = await db.one('select * from "Track" where id = $1', [reel.track_id]);
    
    res.json({
      spec: template.json_spec,
      clips: clips.map(c => ({ url: c.src_url })),
      track: { url: track.url },
      vars: {}, // TODO: extract from spec.overlays
      durationMs: reel.duration_ms,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * POST /render-callback/:reelId
 * Callback from render worker to mark reel as public
 */
router.post('/render-callback/:reelId', async (req, res) => {
  try {
    const { reelId } = req.params;
    const { mp4Url, posterUrl, durationMs } = req.body;
    
    await db.none(
      'update "Reel" set status = \'public\', mp4_url = $1, poster_url = $2, duration_ms = $3, updated_at = now() where id = $4',
      [mp4Url, posterUrl, durationMs, reelId]
    );
    
    res.json({ ok: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
