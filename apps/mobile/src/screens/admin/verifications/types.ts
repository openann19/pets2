/**
 * Admin Verifications Screen Types
 */

export interface Verification {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'identity' | 'pet_ownership' | 'veterinary' | 'breeder';
  status: 'pending' | 'approved' | 'rejected' | 'requires_info';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  documents: {
    id: string;
    type: 'photo_id' | 'pet_registration' | 'vet_certificate' | 'breeder_license' | 'other';
    url: string;
    name: string;
  }[];
  notes?: string;
  rejectionReason?: string;
  additionalInfoRequested?: string;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: string;
}

export interface VerificationsApiResponse {
  verifications?: Verification[];
}

export type VerificationFilter = 'pending' | 'high_priority' | 'all';

