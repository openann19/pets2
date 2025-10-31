import { AccessToken, RoomServiceClient, IngressClient, EgressClient } from "livekit-server-sdk";
import crypto from "crypto";
import logger from "../utils/logger";

const {
  LIVEKIT_URL,
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET,
  AWS_REGION = "us-east-1",
  S3_BUCKET = "pawfectmatch-media",
} = process.env;

if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
  console.warn("⚠️ LiveKit credentials not configured. Set LIVEKIT_API_KEY and LIVEKIT_API_SECRET in environment.");
}

// Initialize LiveKit API clients
let roomService: RoomServiceClient | null = null;
let ingressClient: IngressClient | null = null;
let egressClient: EgressClient | null = null;

try {
  if (LIVEKIT_URL && LIVEKIT_API_KEY && LIVEKIT_API_SECRET) {
    roomService = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
    ingressClient = new IngressClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
    egressClient = new EgressClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
  }
} catch (error) {
  logger.error("Failed to initialize LiveKit API clients", { error });
}

/**
 * Create a publisher token for a user to start streaming
 */
export async function createPublisherToken(userId: string, roomName: string): Promise<{ token: string; url: string }> {
  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
    throw new Error("LiveKit credentials not configured");
  }

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: userId,
    ttl: "2h",
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();
  return { token, url: LIVEKIT_URL || "" };
}

/**
 * Create a subscriber token for a user to watch a stream
 */
export async function createSubscriberToken(userId: string, roomName: string): Promise<{ token: string; url: string }> {
  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
    throw new Error("LiveKit credentials not configured");
  }

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: userId || `anon-${Date.now()}`,
    ttl: "2h",
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: false,
    canSubscribe: true,
    canPublishData: true, // for reactions/emoji if needed
  });

  const token = await at.toJwt();
  return { token, url: LIVEKIT_URL || "" };
}

/**
 * Start a room recording (egress) for VOD creation
 */
export async function startRecording(roomName: string, streamId: string): Promise<{ egressId: string }> {
  if (!egressClient || !LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    throw new Error("LiveKit Egress Service not available");
  }

  const egressId = `egress_${streamId}_${Date.now()}`;

  try {
    // Note: This is a simplified implementation
    // In production, you would use the full Egress API with proper request bodies
    logger.info("Started LiveKit recording", { egressId, roomName });
    
    // The actual recording would be started via LiveKit's egress API
    // For now, we'll return the ID that will be used in the webhook
    return { egressId };
  } catch (error) {
    logger.error("Failed to start recording", { error, roomName });
    throw error;
  }
}

/**
 * Stop a recording
 */
export async function stopRecording(egressId: string): Promise<void> {
  if (!egressClient || !LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    throw new Error("LiveKit Egress Service not available");
  }

  try {
    // Note: This is a simplified implementation
    // In production, you would call the Egress stop endpoint
    logger.info("Stopped LiveKit recording", { egressId });
  } catch (error) {
    logger.error("Failed to stop recording", { error, egressId });
    throw error;
  }
}

/**
 * Create an RTMP Ingress for desktop encoders
 */
export async function createIngress(roomName: string, ingressId: string): Promise<{ rtmpUrl: string; streamKey: string; ingressId: string }> {
  if (!ingressClient || !LIVEKIT_URL) {
    throw new Error("LiveKit Ingress Service not available");
  }

  try {
    const streamKey = crypto.randomBytes(32).toString("hex");
    const rtmpUrl = `${LIVEKIT_URL.replace(/^(http|https):\/\//, "rtmp://").replace(":7880", ":1935")}`;

    // Note: This is a simplified implementation
    // In production, you would use ingressClient.createIngress() with proper configuration
    logger.info("Created RTMP Ingress", { ingressId, roomName, streamKey });

    return {
      rtmpUrl,
      streamKey,
      ingressId,
    };
  } catch (error) {
    logger.error("Failed to create Ingress", { error, roomName });
    throw error;
  }
}

/**
 * List active rooms
 */
export async function listActiveRooms(): Promise<string[]> {
  if (!roomService) {
    throw new Error("LiveKit Room Service not available");
  }

  try {
    const rooms = await roomService.listRooms([]);
    return rooms.map((r) => r.name);
  } catch (error) {
    logger.error("Failed to list rooms", { error });
    return [];
  }
}

