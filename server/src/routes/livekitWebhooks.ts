import { Router } from "express";
import { LiveStream } from "../models/LiveStream";
import logger from "../utils/logger";
import { putSimple } from "../services/s3Service";
import fetch from "node-fetch";
import { Readable } from "stream";
import crypto from "crypto";

/**
 * Configure LiveKit webhooks to POST here.
 * Set this URL in LiveKit dashboard: https://your-domain.com/api/webhooks/livekit
 */
const router: Router = Router();

/**
 * Verify LiveKit webhook signature
 */
function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.LIVEKIT_WEBHOOK_SECRET;
  if (!secret) {
    logger.warn("LIVEKIT_WEBHOOK_SECRET not configured; skipping signature verification");
    return true; // Allow in development
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Upload recording file from LiveKit to S3 and create VOD entry
 */
async function uploadRecordingToS3(
  streamId: string,
  recordingUrl: string,
  format: string = "mp4"
): Promise<{ url: string; size: number; duration?: number }> {
  try {
    logger.info("Downloading recording from LiveKit", { recordingUrl });

    // Download the recording file
    const response = await fetch(recordingUrl);
    if (!response.ok) {
      throw new Error(`Failed to download recording: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const size = buffer.length;

    // Generate S3 key
    const timestamp = Date.now();
    const s3Key = `vod/${streamId}/recording_${timestamp}.${format}`;
    const contentType = format === "mp4" ? "video/mp4" : "video/webm";

    // Upload to S3
    logger.info("Uploading recording to S3", { s3Key, size });
    const s3Url = await putSimple(s3Key, contentType, buffer);

    logger.info("Recording uploaded to S3 successfully", { s3Url, size });

    return {
      url: s3Url,
      size,
      duration: undefined, // Could parse from metadata if available
    };
  } catch (error) {
    logger.error("Failed to upload recording to S3", { error, recordingUrl });
    throw error;
  }
}

router.post("/webhooks/livekit", async (req, res, next) => {
  try {
    // Verify webhook signature for security
    const signature = req.headers["x-livekit-signature"] as string;
    const body = JSON.stringify(req.body);
    
    if (!verifyWebhookSignature(body, signature || "")) {
      logger.warn("Invalid webhook signature", { 
        hasSignature: !!signature,
        event: req.body?.event 
      });
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = req.body;

    logger.debug("LiveKit webhook received", { event: event.event, room: event.room?.name });

    switch (event.event) {
      case "room_started":
        // No-op; we mark live on start API
        break;

      case "room_finished": {
        const roomName = event.room?.name;
        if (roomName) {
          await LiveStream.findOneAndUpdate(
            { roomName },
            { isLive: false, endedAt: new Date() },
            { new: true }
          );
          logger.info("LiveKit room finished", { roomName });
        }
        break;
      }

      case "egress_started": {
        const { egressId, roomName, streamId } = event;
        logger.info("Recording started", { egressId, roomName });
        
        if (streamId) {
          await LiveStream.findOneAndUpdate(
            { _id: streamId },
            {
              "recording.status": "recording",
              "recording.egressId": egressId,
              "recording.startedAt": new Date(),
            }
          );
        }
        break;
      }

      case "egress_ended":
      case "egress_finished": {
        const { egressId, roomName, streamId } = event;
        const status = event.event === "egress_ended" ? "uploading" : "completed";
        const file = event.file;
        
        logger.info("Recording finished", { egressId, roomName, file });

        if (!streamId) {
          logger.warn("No streamId in egress event", { egressId });
          break;
        }

        const stream = await LiveStream.findById(streamId);
        if (!stream) {
          logger.warn("Stream not found for recording", { streamId, egressId });
          break;
        }

        // Update recording status
        stream.recording = {
          status,
          egressId,
          storage: {
            type: "S3",
            path: file?.path,
          },
          completedAt: new Date(),
        };

        // If recording completed with file, upload to S3 and create VOD
        if (event.event === "egress_finished" && file?.url) {
          try {
            logger.info("Uploading recording to S3", { streamId, fileUrl: file.url });
            
            const uploadResult = await uploadRecordingToS3(
              streamId,
              file.url,
              file.format || "mp4"
            );

            // Create VOD entry
            const vodId = `vod_${streamId}_${Date.now()}`;
            stream.vod = {
              vodId,
              url: uploadResult.url,
              duration: uploadResult.duration || 0,
              format: file.format || "mp4",
              size: uploadResult.size,
              uploadedAt: new Date(),
              status: "available",
            };

            // Update recording status
            stream.recording.status = "completed";
            stream.recording.storage = {
              type: "S3",
              url: uploadResult.url,
              bucket: process.env.S3_BUCKET || "pawfectmatch-media",
              path: uploadResult.url.split("/").slice(-2).join("/"),
              size: uploadResult.size,
              duration: uploadResult.duration,
              format: file.format || "mp4",
            };

            logger.info("VOD created successfully", { vodId, streamId });
          } catch (uploadError) {
            logger.error("Failed to upload recording", { error: uploadError, streamId });
            stream.recording.status = "failed";
            stream.recording.error = uploadError instanceof Error ? uploadError.message : String(uploadError);
          }
        }

        await stream.save();
        break;
      }

      case "egress_failed": {
        const { egressId, streamId, error } = event;
        logger.error("Recording failed", { egressId, error });

        if (streamId) {
          await LiveStream.findOneAndUpdate(
            { _id: streamId },
            {
              "recording.status": "failed",
              "recording.error": error || "Unknown error",
              "recording.completedAt": new Date(),
            }
          );
        }
        break;
      }

      case "participant_joined": {
        const roomName = event.room?.name;
        if (roomName) {
          const updateResult = await LiveStream.findOneAndUpdate(
            { roomName },
            { $inc: { viewers: 1 } },
            { new: true }
          );
          
          // Track peak viewers
          if (updateResult) {
            const currentViewers = updateResult.viewers || 0;
            const peakViewers = updateResult.peakViewers || 0;
            if (currentViewers > peakViewers) {
              await LiveStream.findOneAndUpdate(
                { roomName },
                { peakViewers: currentViewers }
              );
            }
          }
          
          logger.debug("Participant joined live stream", { roomName });
        }
        break;
      }

      case "participant_left": {
        const roomName = event.room?.name;
        if (roomName) {
          // Safely decrement viewer count with floor at 0
          const stream = await LiveStream.findOne({ roomName });
          if (stream && stream.viewers > 0) {
            stream.viewers = Math.max(0, stream.viewers - 1);
            await stream.save();
          }
          logger.debug("Participant left live stream", { roomName, viewers: stream?.viewers });
        }
        break;
      }

      default:
        logger.debug("Unhandled LiveKit webhook event", { event: event.event });
        break;
    }

    res.json({ received: true });
  } catch (e) {
    logger.error("LiveKit webhook error", { error: e });
    next(e);
  }
});

export default router;

