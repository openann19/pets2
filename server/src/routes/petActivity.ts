import { Router, type Request, type Response, type Router as ExpressRouter } from "express";

const r: ExpressRouter = Router();

// In-memory store example (replace with DB)
interface ActivityRecord {
  _id: string;
  petId: string;
  activity: string;
  message: string;
  lat: number;
  lng: number;
  radius: number;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  shareToMap: boolean;
}

const mem: ActivityRecord[] = [];

r.get("/pets/mine", (req: Request, res: Response) => {
  // Use auth; here return demo pets
  res.json({
    success: true,
    data: [{ _id: "pet-1", name: "Luna", breed: "Husky" }],
  });
});

r.post("/pets/activity/start", (req: Request, res: Response) => {
  const { petId, activity, message, shareToMap, location, radius } = req.body || {};
  if (!petId || !activity || !location) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }
  const rec: ActivityRecord = {
    _id: `act_${Date.now()}`,
    petId,
    activity,
    message: message || "",
    lat: location.lat,
    lng: location.lng,
    radius: radius || 500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    active: true,
    shareToMap: !!shareToMap,
  };
  mem.unshift(rec);
  res.json({ success: true, data: rec });
});

r.post("/pets/activity/end", (req: Request, res: Response) => {
  const { activityId } = req.body || {};
  const idx = mem.findIndex((a) => a._id === activityId);
  if (idx < 0) {
    return res.status(404).json({ success: false, error: "Not found" });
  }
  const activity = mem[idx];
  if (!activity) {
    return res.status(404).json({ success: false, error: "Not found" });
  }
  activity.active = false;
  activity.updatedAt = new Date().toISOString();
  res.json({ success: true, data: activity });
});

r.get("/pets/activity/history", (req: Request, res: Response) => {
  const petId = String(req.query.petId || "");
  const activities = mem.filter((a) => a.petId === petId);
  res.json({ success: true, data: activities });
});

r.post("/matches/like", (req: Request, res: Response) => {
  // Accept and return 200 to keep client simple
  res.json({ success: true });
});

export default r;

