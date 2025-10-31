import type { Request, Response } from "express";
import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import Match from "../models/Match";
import Conversation from "../models/Conversation";
import Pet from "../models/Pet";
import Message from "../models/Message";
import Activity from "../models/Activity";
import logger from "../utils/logger";
import { getDashboard } from "../controllers/personalizedDashboardController";

const r: Router = Router();

// Get home stats with real database queries
r.get("/home/stats", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    // Count active matches for the user
    const matches = await Match.countDocuments({
      $or: [{ user1: userId }, { user2: userId }],
      status: "active"
    });

    // Count unread messages
    const unreadMessages = await Message.countDocuments({
      recipientId: userId,
      read: false
    });

    // Count recent likes (24 hours)
    const recentLikes = await Match.countDocuments({
      likedUserId: userId,
      createdAt: { $gte: new Date(Date.now() - 24 * 3600 * 1000) }
    });

    res.json({
      matches,
      messages: unreadMessages,
      recentLikes,
    });
  } catch (error) {
    logger.error("Failed to fetch home stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Get activity feed
r.get("/home/activity", authenticateToken, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 20), 50);
    const items = await Activity.find({ 
      audience: { $in: ["global", (req as any).userId] } 
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json({ items });
  } catch (error) {
    logger.error("Failed to fetch activity feed:", error);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
});

r.get("/home/feed", authenticateToken, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 20), 50);
    const items = await Activity.find({ 
      audience: { $in: ["global", (req as any).userId] } 
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json(items);
  } catch (error) {
    logger.error("Failed to fetch activity feed:", error);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
});

// Phase 1: Personalized Dashboard
r.get("/home/dashboard", authenticateToken, getDashboard);

export default r;
