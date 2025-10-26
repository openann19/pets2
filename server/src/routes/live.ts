import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { LiveStream } from "../models/LiveStream";
import { createPublisherToken, createSubscriberToken, startRecording, stopRecording, createIngress } from "../services/livekitService";
import { isValidObjectId } from "mongoose";
import logger from "../utils/logger";

interface AuthRequest extends Request {
  user?: any;
  userId?: string;
}

const router: Router = Router();

/**
 * POST /api/live/start
 * Start a new live stream
 */
router.post("/start", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, tags, coverUrl } = req.body as { title?: string; tags?: string[]; coverUrl?: string };
    const roomName = `live_${req.user!.id}_${Date.now()}`;
    const { token, url } = await createPublisherToken(req.user!.id, roomName);

    const doc = await LiveStream.create({
      ownerId: req.user!.id,
      roomName,
      title: (title ?? "").slice(0, 120),
      coverUrl,
      tags: Array.isArray(tags) ? tags.slice(0, 10) : [],
      isLive: true,
      startedAt: new Date(),
      viewers: 0,
    });

    logger.info("Live stream started", { streamId: doc._id, ownerId: req.user!.id });

    res.json({ streamId: doc._id, roomName, token, url });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/live/stop
 * Stop a live stream
 */
router.post("/stop", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { streamId } = req.body;
    if (!isValidObjectId(streamId)) {
      return res.status(400).json({ error: "Invalid streamId" });
    }

    const stream = await LiveStream.findById(streamId);
    if (!stream || String(stream.ownerId) !== req.user!.id) {
      return res.status(404).json({ error: "Stream not found or unauthorized" });
    }

    stream.isLive = false;
    stream.endedAt = new Date();
    await stream.save();

    logger.info("Live stream stopped", { streamId, ownerId: req.user!.id });

    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/live/active
 * Get list of active live streams
 */
router.get("/active", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await LiveStream.find({ isLive: true })
      .sort({ startedAt: -1 })
      .limit(100)
      .lean();

    res.json({ items });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/live/:id/watch
 * Get subscriber token to watch a stream
 */
router.get("/:id/watch", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid stream ID" });
    }

    const stream = await LiveStream.findById(id).lean();
    if (!stream || !stream.isLive) {
      return res.status(404).json({ error: "Stream not live" });
    }

    // Check if viewer is blocked
    if (stream.blockedUserIds.some((bid: any) => String(bid) === req.user!.id)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { token, url } = await createSubscriberToken(req.user!.id, stream.roomName);
    res.json({
      roomName: stream.roomName,
      token,
      url,
      title: stream.title,
      coverUrl: stream.coverUrl,
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/live/:id/end
 * Admin kill-switch to end any stream
 */
router.post("/:id/end", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid stream ID" });
    }

    const stream = await LiveStream.findById(id);
    if (!stream) {
      return res.status(404).json({ error: "Stream not found" });
    }

    stream.isLive = false;
    stream.endedAt = new Date();
    await stream.save();

    logger.info("Live stream terminated by admin", { streamId: id, adminId: req.user!.id });

    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/live/:id/ingress
 * Create RTMP Ingress for desktop encoders
 */
router.post("/:id/ingress", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid stream ID" });
    }

    const stream = await LiveStream.findById(id);
    if (!stream || String(stream.ownerId) !== req.user!.id) {
      return res.status(404).json({ error: "Stream not found or unauthorized" });
    }

    if (!stream.isLive) {
      return res.status(400).json({ error: "Stream is not live" });
    }

    const ingressId = `ingress_${id}`;
    const ingressResult = await createIngress(stream.roomName, ingressId);

    stream.ingress = {
      enabled: true,
      rtmpUrl: ingressResult.rtmpUrl,
      streamKey: ingressResult.streamKey,
      ingressId: ingressResult.ingressId,
    };
    await stream.save();

    logger.info("RTMP Ingress created", { streamId: id, rtmpUrl: ingressResult.rtmpUrl, ingressId: ingressResult.ingressId });

    res.json({ rtmpUrl: ingressResult.rtmpUrl, streamKey: ingressResult.streamKey, ingressId: ingressResult.ingressId });
  } catch (e) {
    logger.error("Failed to create Ingress", { error: e });
    next(e);
  }
});

/**
 * POST /api/live/:id/recording/start
 * Start recording a live stream
 */
router.post("/:id/recording/start", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid stream ID" });
    }

    const stream = await LiveStream.findById(id);
    if (!stream || String(stream.ownerId) !== req.user!.id) {
      return res.status(404).json({ error: "Stream not found or unauthorized" });
    }

    if (!stream.isLive) {
      return res.status(400).json({ error: "Stream is not live" });
    }

    if (!stream.roomName) {
      return res.status(400).json({ error: "Stream has no room name" });
    }

    const recordingResult = await startRecording(stream.roomName, String(id));
    const egressId = recordingResult.egressId;

    stream.recording = {
      status: "recording",
      egressId,
      startedAt: new Date(),
    };
    await stream.save();

    logger.info("Recording started", { streamId: id, egressId });

    res.json({ egressId });
  } catch (e) {
    logger.error("Failed to start recording", { error: e });
    next(e);
  }
});

/**
 * POST /api/live/:id/recording/stop
 * Stop recording a live stream
 */
router.post("/:id/recording/stop", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid stream ID" });
    }

    const stream = await LiveStream.findById(id);
    if (!stream || String(stream.ownerId) !== req.user!.id) {
      return res.status(404).json({ error: "Stream not found or unauthorized" });
    }

    if (!stream.recording?.egressId) {
      return res.status(400).json({ error: "No active recording" });
    }

    await stopRecording(stream.recording.egressId);
    stream.recording.status = "uploading";
    stream.recording.completedAt = new Date();
    await stream.save();

    logger.info("Recording stopped", { streamId: id, egressId: stream.recording.egressId });

    res.json({ success: true });
  } catch (e) {
    logger.error("Failed to stop recording", { error: e });
    next(e);
  }
});

/**
 * POST /api/live/:id/pin-message
 * Pin a message in live stream chat
 */
router.post("/:id/pin-message", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { messageId, content } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid stream ID" });
    }

    const stream = await LiveStream.findById(id);
    if (!stream) {
      return res.status(404).json({ error: "Stream not found" });
    }

    // Only owner can pin messages
    if (String(stream.ownerId) !== req.user!.id) {
      return res.status(403).json({ error: "Only stream owner can pin messages" });
    }

    // Add pinned message
    stream.pinnedMessages.push({
      messageId,
      authorId: req.user!.id,
      content: content || "",
      timestamp: new Date(),
    });

    // Limit to last 5 pinned messages
    if (stream.pinnedMessages.length > 5) {
      stream.pinnedMessages = stream.pinnedMessages.slice(-5);
    }

    await stream.save();

    logger.info("Message pinned", { streamId: id, messageId });

    res.json({ success: true, pinnedMessages: stream.pinnedMessages });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/live/:id/vod
 * Get VOD (Video On Demand) for a completed stream
 */
router.get("/:id/vod", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid stream ID" });
    }

    const stream = await LiveStream.findById(id).lean();
    if (!stream) {
      return res.status(404).json({ error: "Stream not found" });
    }

    if (!stream.vod) {
      return res.status(404).json({ error: "VOD not available" });
    }

    res.json({ vod: stream.vod });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/live/:id/status
 * Get current status of a live stream
 */
router.get("/:id/status", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid stream ID" });
    }

    const stream = await LiveStream.findById(id).select([
      "isLive",
      "viewers",
      "peakViewers",
      "startedAt",
      "endedAt",
      "title",
      "totalGifts",
      "recording.status",
      "vod.status",
    ]).lean();

    if (!stream) {
      return res.status(404).json({ error: "Stream not found" });
    }

    res.json({
      streamId: id,
      isLive: stream.isLive,
      viewers: stream.viewers || 0,
      peakViewers: stream.peakViewers || 0,
      totalGifts: stream.totalGifts || 0,
      recordingStatus: stream.recording?.status || "none",
      vodStatus: stream.vod?.status || "none",
      startedAt: stream.startedAt,
      endedAt: stream.endedAt,
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/live/:id/report
 * Report a live stream for moderation
 */
router.post("/:id/report", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { type, reason, description, evidence } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid stream ID" });
    }

    if (!type || !reason) {
      return res.status(400).json({ error: "Report type and reason are required" });
    }

    const stream = await LiveStream.findById(id);
    if (!stream) {
      return res.status(404).json({ error: "Stream not found" });
    }

    // Create report
    const reportModel = (await import("../models/Report")).default;
    const report = await reportModel.create({
      reporterId: req.user!.id,
      reportedUserId: stream.ownerId,
      type,
      category: "other",
      reason,
      description,
      evidence: evidence || [],
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        reportSource: "mobile",
      },
      tags: ["live_stream", id],
    });

    logger.info("Live stream reported", { 
      streamId: id,
      reporterId: req.user!.id,
      reportType: type
    });

    res.json({ 
      success: true,
      reportId: report._id,
      message: "Report submitted successfully" 
    });
  } catch (e) {
    logger.error("Failed to report stream", { error: e, userId: req.user!.id });
    next(e);
  }
});

export default router;

