import { Schema, model, Document } from "mongoose";

export interface IStreamRecording {
  status: "recording" | "uploading" | "completed" | "failed";
  egressId?: string;
  storage?: {
    type: "S3" | "Azure" | "GCS";
    path?: string;
    url?: string;
    bucket?: string;
    size?: number; // bytes
    duration?: number; // seconds
    format?: string; // mp4, webm, etc.
  };
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface IStreamVOD {
  vodId: string;
  url: string;
  thumbnailUrl?: string;
  duration: number;
  format: string;
  size: number;
  uploadedAt: Date;
  status: "uploading" | "available" | "failed";
}

export interface ILiveStream extends Document {
  ownerId: Schema.Types.ObjectId;
  roomName: string;
  title?: string;
  coverUrl?: string;
  isLive: boolean;
  startedAt?: Date;
  endedAt?: Date;
  viewers: number;
  tags: string[];
  blockedUserIds: Schema.Types.ObjectId[];
  // Recording & VOD support
  recording?: IStreamRecording;
  vod?: IStreamVOD;
  enableRecording: boolean;
  enableReplay: boolean;
  // Ingress (RTMP) support
  ingress?: {
    enabled: boolean;
    rtmpUrl?: string;
    streamKey?: string;
    ingressId?: string;
  };
  // Enhanced features
  pinnedMessages: Array<{
    messageId: string;
    authorId: Schema.Types.ObjectId;
    content: string;
    timestamp: Date;
  }>;
  totalGifts: number;
  peakViewers: number;
  createdAt: Date;
  updatedAt: Date;
}

const StreamRecordingSchema = new Schema<IStreamRecording>({
  status: { type: String, enum: ["recording", "uploading", "completed", "failed"], required: true },
  egressId: { type: String },
  storage: {
    type: { type: String, enum: ["S3", "Azure", "GCS"] },
    path: { type: String },
    url: { type: String },
    bucket: { type: String },
    size: { type: Number },
    duration: { type: Number },
    format: { type: String },
  },
  startedAt: { type: Date },
  completedAt: { type: Date },
  error: { type: String },
}, { _id: false });

const StreamVODSchema = new Schema<IStreamVOD>({
  vodId: { type: String, required: true },
  url: { type: String, required: true },
  thumbnailUrl: { type: String },
  duration: { type: Number, required: true },
  format: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["uploading", "available", "failed"], default: "uploading" },
}, { _id: false });

const PinnedMessageSchema = new Schema({
  messageId: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const IngressSchema = new Schema({
  enabled: { type: Boolean, default: false },
  rtmpUrl: { type: String },
  streamKey: { type: String },
  ingressId: { type: String },
}, { _id: false });

const LiveStreamSchema = new Schema<ILiveStream>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    roomName: { type: String, index: true, unique: true, required: true },
    title: { type: String, trim: true, maxlength: 120 },
    coverUrl: { type: String, trim: true },
    isLive: { type: Boolean, default: false, index: true },
    startedAt: { type: Date },
    endedAt: { type: Date },
    viewers: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    blockedUserIds: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    // Recording & VOD support
    recording: StreamRecordingSchema,
    vod: StreamVODSchema,
    enableRecording: { type: Boolean, default: true },
    enableReplay: { type: Boolean, default: true },
    // Ingress support
    ingress: IngressSchema,
    // Enhanced features
    pinnedMessages: { type: [PinnedMessageSchema], default: [] },
    totalGifts: { type: Number, default: 0 },
    peakViewers: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index for efficient queries on live streams sorted by start time
LiveStreamSchema.index({ isLive: 1, startedAt: -1 });

// Index for owner queries
LiveStreamSchema.index({ ownerId: 1, isLive: 1 });

export const LiveStream = model<ILiveStream>("LiveStream", LiveStreamSchema);
export default LiveStream;

