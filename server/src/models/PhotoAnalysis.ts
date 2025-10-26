/**
 * PhotoAnalysis Model - Per PHOTOVERIFICATION spec
 * 
 * Stores AI analysis results for uploaded photos including:
 * - Pet detection
 * - Breed classification
 * - Quality metrics
 * - Safety moderation scores
 * - Health indicators
 */

import mongoose from 'mongoose';

export interface PhotoLabels {
  name: string;
  confidence: number;
}

export interface PhotoQuality {
  dims: { width?: number; height?: number };
  exposure: number;    // 0..1
  contrast: number;    // 0..1
  sharpness: number;   // 0..1 (blur metric inverted)
}

export interface BreedCandidate {
  name: string;
  confidence: number;
}

export interface HealthSignals {
  coatScore?: number;   // 0..1
  eyesScore?: number;   // 0..1
  postureScore?: number;// 0..1
  energyScore?: number; // 0..1
}

export interface SafetyModeration {
  labels: { label: string; confidence: number }[];
  safe: boolean;           // derived threshold
  moderationScore: number; // 0..1
}

export interface ModelVersions {
  petDetector?: string;     // model id/version
  breedClassifier?: string;
  qualityModel?: string;
  moderationModel?: string;
}

const photoAnalysisSchema = new mongoose.Schema({
  uploadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Upload',
    required: true,
    unique: true,
    index: true,
  },
  
  isPet: {
    type: Boolean,
    required: true,
  },
  
  overall: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  
  labels: [{
    name: String,
    confidence: { type: Number, min: 0, max: 1 },
  }],
  
  breedCandidates: [{
    name: String,
    confidence: { type: Number, min: 0, max: 1 },
  }],
  
  quality: {
    dims: {
      width: Number,
      height: Number,
    },
    exposure: { type: Number, min: 0, max: 1 },
    contrast: { type: Number, min: 0, max: 1 },
    sharpness: { type: Number, min: 0, max: 1 },
  },
  
  healthSignals: {
    coatScore: { type: Number, min: 0, max: 1 },
    eyesScore: { type: Number, min: 0, max: 1 },
    postureScore: { type: Number, min: 0, max: 1 },
    energyScore: { type: Number, min: 0, max: 1 },
  },
  
  safety: {
    labels: [{
      label: String,
      confidence: { type: Number, min: 0, max: 1 },
    }],
    safe: Boolean,
    moderationScore: { type: Number, min: 0, max: 1 },
  },
  
  suggestions: [String],
  
  models: {
    petDetector: String,
    breedClassifier: String,
    qualityModel: String,
    moderationModel: String,
  },
  
  analyzedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
photoAnalysisSchema.index({ uploadId: 1 });
photoAnalysisSchema.index({ isPet: 1 });
photoAnalysisSchema.index({ 'safety.safe': 1 });
photoAnalysisSchema.index({ overall: -1 });
photoAnalysisSchema.index({ createdAt: -1 });

export const PhotoAnalysis = mongoose.model('PhotoAnalysis', photoAnalysisSchema);
export default PhotoAnalysis;

