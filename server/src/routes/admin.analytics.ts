import type { Request, Response } from "express";
import { Router } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { getEventCounts } from "../services/analytics";
import logger from "../utils/logger";

const router = Router();

/**
 * GET /api/admin/analytics/realtime
 * Returns real-time analytics data
 */
router.get("/realtime", authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const since = new Date(Date.now() - 60 * 60 * 1000); // Last hour

    const events = await getEventCounts(since);

    // Get recent errors from Sentry or error logs
    const errors: string[] = []; // Placeholder - would integrate with error tracking

    res.json({
      success: true,
      data: {
        events,
        errors,
        timeframe: "last_hour",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error("Failed to get realtime analytics", { error: errorMessage });
    res.status(500).json({ success: false, error: "Failed to fetch analytics" });
  }
});

/**
 * GET /api/admin/analytics/events
 * Get events with optional filtering
 */
router.get("/events", authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { hours = 24, names } = req.query;
    const since = new Date(Date.now() - Number(hours) * 60 * 60 * 1000);
    const eventNames = names ? String(names).split(",") : undefined;

    const events = await getEventCounts(since, eventNames);

    res.json({
      success: true,
      data: {
        events,
        timeframe: `${hours} hours`,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error("Failed to get events", { error: errorMessage });
    res.status(500).json({ success: false, error: "Failed to fetch events" });
  }
});

export default router;

