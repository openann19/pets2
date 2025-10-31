/**
 * Templates Routes for PawReels
 */

import { Router } from 'express';
import { db } from '../db';

const router = Router();

/**
 * GET /templates
 * List all active templates
 */
router.get('/', async (req, res) => {
  try {
    const theme = req.query.theme;
    
    let query = 'select * from "Template" where is_active = true';
    const params: any[] = [];
    
    if (theme) {
      query += ' and theme = $1';
      params.push(theme);
    }
    
    query += ' order by created_at desc';
    
    const templates = await db.any(query, params);
    
    res.json(templates.map(t => ({
      id: t.id,
      name: t.name,
      jsonSpec: t.json_spec,
      thumbUrl: t.thumb_url,
      minClips: t.min_clips,
      maxClips: t.max_clips,
      theme: t.theme,
    })));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * GET /templates/:id
 * Get template by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const template = await db.oneOrNone('select * from "Template" where id = $1 and is_active = true', [req.params.id]);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json({
      id: template.id,
      name: template.name,
      jsonSpec: template.json_spec,
      thumbUrl: template.thumb_url,
      minClips: template.min_clips,
      maxClips: template.max_clips,
      theme: template.theme,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
