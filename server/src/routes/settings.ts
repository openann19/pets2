import type { Request, Response } from "express";
import { Router } from "express";
import { authenticateToken } from "../middleware/auth";

const r: Router = Router();

interface AuthenticatedRequest extends Request {
  userId: string;
}

r.get("/settings/me", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const User = (await import('../models/User')).default;
    
    const user = await User.findById(userId).select('preferences settings').lean();
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({
      success: true,
      data: {
        notifications: {
          matches: user.preferences?.notifications?.matches ?? true,
          messages: user.preferences?.notifications?.messages ?? true,
          likes: user.preferences?.notifications?.likes ?? true,
          activity: user.preferences?.notifications?.activity ?? false,
          push: user.preferences?.notifications?.push ?? true,
          email: user.preferences?.notifications?.email ?? true,
        },
        preferences: {
          maxDistance: user.preferences?.maxDistance ?? 50,
          ageRange: user.preferences?.ageRange ?? { min: 0, max: 20 },
          species: user.preferences?.species ?? ['dog', 'cat'],
          intents: user.preferences?.intents ?? ['adoption', 'mating', 'playdate'],
        },
        settings: user.settings || {},
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

r.patch("/settings/me", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const User = (await import('../models/User')).default;
    
    const { notifications, preferences, settings } = req.body;
    
    const update: Record<string, unknown> = { updatedAt: new Date() };
    
    if (notifications) {
      update['preferences.notifications'] = notifications;
    }
    
    if (preferences) {
      if (preferences.maxDistance !== undefined) {
        update['preferences.maxDistance'] = preferences.maxDistance;
      }
      if (preferences.ageRange) {
        update['preferences.ageRange'] = preferences.ageRange;
      }
      if (preferences.species) {
        update['preferences.species'] = preferences.species;
      }
      if (preferences.intents) {
        update['preferences.intents'] = preferences.intents;
      }
    }
    
    if (settings) {
      update.settings = settings;
    }
    
    await User.findByIdAndUpdate(userId, { $set: update });
    
    res.json({
      success: true,
      data: {
        notifications,
        preferences,
        settings,
        updatedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
});

export default r;
