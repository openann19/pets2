/**
 * Admin Uploads Types
 */

export interface Upload {
  id: string;
  userId: string;
  userName: string;
  petId?: string;
  petName?: string;
  type: "profile" | "pet" | "verification";
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  status: "pending" | "approved" | "rejected";
  flagged: boolean;
  flagReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  metadata?: {
    fileSize: number;
    dimensions?: { width: number; height: number };
    contentType: string;
  };
}

export type UploadFilter = "pending" | "flagged" | "all";

