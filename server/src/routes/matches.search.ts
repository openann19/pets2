import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import Match from "../models/Match";
import Pet from "../models/Pet";
import logger from "../utils/logger";

const router = Router();

/** GET /api/matches/search?q=&species=&maxKm=&sort=recent|alpha|distance */
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const { q, species, maxKm, sort } = req.query as any;

    // Find user's matches
    const matchDocs = await Match.find({
      $or: [{ userA: userId }, { userB: userId }],
      status: "active",
    }).populate('pet1 pet2').lean();

    // Build filter for matches with additional options
    const filter: any = {
      $or: [{ userA: userId }, { userB: userId }],
      status: "active"
    };

    // Text search in pet names (if matches have pet data populated)
    if (q) {
      filter['$or'] = [
        { 'pet1.name': { $regex: q, $options: 'i' } },
        { 'pet2.name': { $regex: q, $options: 'i' } },
        { 'pet1.breed': { $regex: q, $options: 'i' } },
        { 'pet2.breed': { $regex: q, $options: 'i' } }
      ];
    }

    // Species filter
    if (species) {
      filter['$or'] = [
        ...(filter['$or'] || []),
        { 'pet1.species': species },
        { 'pet2.species': species }
      ];
    }

    // Sort options
    let sortOption: any = { createdAt: -1 }; // default: newest first
    if (sort === "alpha") sortOption = { createdAt: 1 }; // oldest first
    else if (sort === "distance" && maxKm) {
      // Distance sort requires location - implement if needed
      // For now, keep default sort
    }

    const matches = await Match.find(filter)
      .populate('pet1', 'name breed species photos location')
      .populate('pet2', 'name breed species photos location')
      .populate('userA', 'firstName lastName avatar')
      .populate('userB', 'firstName lastName avatar')
      .sort(sortOption)
      .limit(100)
      .lean();

    res.json({ success: true, data: { count: matches.length, matches } });
  } catch (e) { 
    logger.error("Matches search error:", e);
    next(e); 
  }
});

export default router;

