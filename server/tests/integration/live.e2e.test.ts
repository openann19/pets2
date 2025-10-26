import request from "supertest";
import { app } from "../../server";
import mongoose from "mongoose";
import { LiveStream } from "../../src/models/LiveStream";
import { generateTokens } from "../../src/middleware/auth";
import User from "../../src/models/User";

describe("Live Streaming Routes", () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
    // Create test user
    const user = await User.create({
      email: "test@live.com",
      password: "hashedPassword",
      fullName: "Test User",
      isActive: true,
      isBlocked: false,
    });

    userId = user._id.toString();
    token = generateTokens(userId).accessToken;
  });

  afterAll(async () => {
    await User.deleteMany({ email: "test@live.com" });
    await LiveStream.deleteMany({});
    await mongoose.connection.close();
  });

  describe("POST /api/live/start", () => {
    it("should start a live stream successfully", async () => {
      const res = await request(app)
        .post("/api/live/start")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Test Stream", tags: ["test", "demo"] })
        .expect(200);

      expect(res.body.streamId).toBeTruthy();
      expect(res.body.roomName).toMatch(/^live_/);
      expect(res.body.token).toBeTruthy();
      expect(res.body.url).toBeTruthy();

      // Verify stream was created in database
      const stream = await LiveStream.findOne({ roomName: res.body.roomName });
      expect(stream).toBeTruthy();
      expect(stream?.isLive).toBe(true);
      expect(stream?.title).toBe("Test Stream");
    });

    it("should reject request without authentication", async () => {
      await request(app)
        .post("/api/live/start")
        .send({ title: "Test Stream" })
        .expect(401);
    });

    it("should handle title truncation to 120 chars", async () => {
      const longTitle = "a".repeat(150);
      const res = await request(app)
        .post("/api/live/start")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: longTitle })
        .expect(200);

      const stream = await LiveStream.findOne({ _id: res.body.streamId });
      expect(stream?.title?.length).toBeLessThanOrEqual(120);
    });
  });

  describe("POST /api/live/stop", () => {
    it("should stop a live stream successfully", async () => {
      // Create a stream first
      const startRes = await request(app)
        .post("/api/live/start")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Stream to Stop" })
        .expect(200);

      const streamId = startRes.body.streamId;

      // Stop the stream
      await request(app)
        .post("/api/live/stop")
        .set("Authorization", `Bearer ${token}`)
        .send({ streamId })
        .expect(200);

      // Verify stream was stopped
      const stream = await LiveStream.findById(streamId);
      expect(stream?.isLive).toBe(false);
      expect(stream?.endedAt).toBeTruthy();
    });

    it("should reject stopping another user's stream", async () => {
      // Create a stream with the first user
      const startRes = await request(app)
        .post("/api/live/start")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Protected Stream" })
        .expect(200);

      // Create a second user
      const user2 = await User.create({
        email: "test2@live.com",
        password: "hashedPassword",
        fullName: "Test User 2",
        isActive: true,
        isBlocked: false,
      });

      const token2 = generateTokens(user2._id.toString()).accessToken;

      // Try to stop the first user's stream
      await request(app)
        .post("/api/live/stop")
        .set("Authorization", `Bearer ${token2}`)
        .send({ streamId: startRes.body.streamId })
        .expect(404);

      // Cleanup
      await User.deleteMany({ email: "test2@live.com" });
    });

    it("should reject invalid streamId", async () => {
      await request(app)
        .post("/api/live/stop")
        .set("Authorization", `Bearer ${token}`)
        .send({ streamId: "invalid" })
        .expect(400);
    });
  });

  describe("GET /api/live/active", () => {
    it("should return list of active streams", async () => {
      // Create multiple streams
      await LiveStream.create({
        ownerId: new mongoose.Types.ObjectId(userId),
        roomName: "live_test1",
        title: "Stream 1",
        isLive: true,
        startedAt: new Date(),
        viewers: 5,
      });

      await LiveStream.create({
        ownerId: new mongoose.Types.ObjectId(userId),
        roomName: "live_test2",
        title: "Stream 2",
        isLive: true,
        startedAt: new Date(),
        viewers: 10,
      });

      // Create an inactive stream (should not appear)
      await LiveStream.create({
        ownerId: new mongoose.Types.ObjectId(userId),
        roomName: "live_test3",
        title: "Stream 3",
        isLive: false,
        startedAt: new Date(),
        viewers: 0,
      });

      const res = await request(app)
        .get("/api/live/active")
        .expect(200);

      expect(res.body.items).toHaveLength(2);
      expect(res.body.items[0].title).toBe("Stream 2"); // Should be sorted by start time desc
      expect(res.body.items[1].title).toBe("Stream 1");
    });

    it("should work without authentication", async () => {
      await request(app).get("/api/live/active").expect(200);
    });

    it("should limit results to 100 streams", async () => {
      // Create 110 streams
      const streams = Array.from({ length: 110 }, (_, i) => ({
        ownerId: new mongoose.Types.ObjectId(userId),
        roomName: `live_test_bulk_${i}`,
        title: `Stream ${i}`,
        isLive: true,
        startedAt: new Date(),
        viewers: 0,
      }));

      await LiveStream.insertMany(streams);

      const res = await request(app)
        .get("/api/live/active")
        .expect(200);

      expect(res.body.items.length).toBeLessThanOrEqual(100);
    });
  });

  describe("GET /api/live/:id/watch", () => {
    it("should return subscriber token for a live stream", async () => {
      // Create a stream
      const stream = await LiveStream.create({
        ownerId: new mongoose.Types.ObjectId(userId),
        roomName: "live_watch_test",
        title: "Watch Test Stream",
        isLive: true,
        startedAt: new Date(),
        viewers: 0,
      });

      const res = await request(app)
        .get(`/api/live/${stream._id}/watch`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.roomName).toBe("live_watch_test");
      expect(res.body.token).toBeTruthy();
      expect(res.body.url).toBeTruthy();
      expect(res.body.title).toBe("Watch Test Stream");
    });

    it("should reject watching non-live stream", async () => {
      const stream = await LiveStream.create({
        ownerId: new mongoose.Types.ObjectId(userId),
        roomName: "live_inactive_test",
        title: "Inactive Stream",
        isLive: false,
        startedAt: new Date(),
        viewers: 0,
      });

      await request(app)
        .get(`/api/live/${stream._id}/watch`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });

    it("should reject watching blocked stream", async () => {
      // Create a stream with blocked user
      const blockedUserId = new mongoose.Types.ObjectId(userId);
      const stream = await LiveStream.create({
        ownerId: new mongoose.Types.ObjectId(),
        roomName: "live_blocked_test",
        title: "Blocked Stream",
        isLive: true,
        startedAt: new Date(),
        viewers: 0,
        blockedUserIds: [blockedUserId],
      });

      await request(app)
        .get(`/api/live/${stream._id}/watch`)
        .set("Authorization", `Bearer ${token}`)
        .expect(403);
    });

    it("should require authentication", async () => {
      const stream = await LiveStream.create({
        ownerId: new mongoose.Types.ObjectId(userId),
        roomName: "live_auth_test",
        title: "Auth Test Stream",
        isLive: true,
        startedAt: new Date(),
        viewers: 0,
      });

      await request(app)
        .get(`/api/live/${stream._id}/watch`)
        .expect(401);
    });

    it("should reject invalid stream ID", async () => {
      await request(app)
        .get("/api/live/invalid/watch")
        .set("Authorization", `Bearer ${token}`)
        .expect(400);
    });
  });

  describe("POST /api/live/:id/end (Admin)", () => {
    it("should allow admin to end any stream", async () => {
      // Make user an admin
      await User.findByIdAndUpdate(userId, { role: "administrator" });

      // Create a stream
      const stream = await LiveStream.create({
        ownerId: new mongoose.Types.ObjectId(),
        roomName: "live_admin_end",
        title: "Admin End Test",
        isLive: true,
        startedAt: new Date(),
        viewers: 15,
      });

      await request(app)
        .post(`/api/live/${stream._id}/end`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Verify stream was stopped
      const updatedStream = await LiveStream.findById(stream._id);
      expect(updatedStream?.isLive).toBe(false);
      expect(updatedStream?.endedAt).toBeTruthy();
    });

    it("should reject non-admin attempts", async () => {
      // Make user non-admin
      await User.findByIdAndUpdate(userId, { role: "user" });

      const stream = await LiveStream.create({
        ownerId: new mongoose.Types.ObjectId(),
        roomName: "live_nonadmin_end",
        title: "Non-Admin End Test",
        isLive: true,
        startedAt: new Date(),
        viewers: 5,
      });

      await request(app)
        .post(`/api/live/${stream._id}/end`)
        .set("Authorization", `Bearer ${token}`)
        .expect(403);
    });

    it("should handle non-existent stream", async () => {
      await User.findByIdAndUpdate(userId, { role: "administrator" });

      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .post(`/api/live/${fakeId}/end`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });
  });
});

