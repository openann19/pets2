import type { Request, Response } from "express";
import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import Match from "../models/Match";
import Conversation from "../models/Conversation";
import Pet from "../models/Pet";
import logger from "../utils/logger";

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

    // Count unread messages in conversations
    const unreadMessages = await Conversation.countDocuments({
      participants: userId,
      "messages.read": false,
      "messages.sender": { $ne: userId }
    });

    // Count user's pets
    const pets = await Pet.countDocuments({ owner: userId });

    res.json({
      matches,
      messages: unreadMessages,
      pets,
    });
  } catch (error) {
    logger.error("Failed to fetch home stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

r.get("/home/feed", authenticateToken, (req: Request, res: Response) => {
  // TODO: Query database for actual activity feed
  res.json([
    {
      id: "1",
      type: "activity",
      text: "Luna started a walk nearby",
      timestamp: new Date().toISOString(),
    },
  ]);
});

export default r;
