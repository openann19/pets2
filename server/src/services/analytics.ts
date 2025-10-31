import mongoose from "mongoose";
import logger from "../utils/logger";

// Event collection schema
interface AnalyticsEvent {
  userId?: string | null;
  name: string;
  props: Record<string, any>;
  ts: Date;
}

const eventSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  name: { type: String, required: true, index: true },
  props: { type: mongoose.Schema.Types.Mixed },
  ts: { type: Date, default: Date.now, index: true },
});

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

/**
 * Track an event in the analytics system
 */
export async function trackEvent(
  userId: string | null,
  name: string,
  props: Record<string, any> = {}
): Promise<void> {
  try {
    await Event.create({
      userId,
      name,
      props,
      ts: new Date(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error("Failed to track event", { error: errorMessage, name });
  }
}

/**
 * Get event counts for a time range
 */
export async function getEventCounts(
  since: Date,
  eventNames?: string[]
): Promise<Array<{ name: string; count: number }>> {
  try {
    const match: any = { ts: { $gte: since } };
    if (eventNames && eventNames.length > 0) {
      match.name = { $in: eventNames };
    }

    const counts = await Event.aggregate([
      { $match: match },
      { $group: { _id: "$name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);

    return counts.map(({ _id, count }) => ({ name: _id, count }));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error("Failed to get event counts", { error: errorMessage });
    return [];
  }
}

export default { trackEvent, getEventCounts };

