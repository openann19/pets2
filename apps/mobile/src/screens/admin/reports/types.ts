/**
 * Types for Admin Reports Screen
 */

export interface UserReport {
  id: string;
  type: 'user' | 'content' | 'chat' | 'pet' | 'other';
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reportedUserId?: string;
  reportedUserName?: string;
  reportedPetId?: string;
  reportedPetName?: string;
  reason: string;
  description: string;
  submittedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export type ReportFilter = 'all' | 'pending' | 'reviewing' | 'resolved' | 'dismissed';
export type ReportTypeFilter = 'all' | 'user' | 'content' | 'chat' | 'pet' | 'other';
export type ReportPriorityFilter = 'all' | 'low' | 'medium' | 'high' | 'urgent';
