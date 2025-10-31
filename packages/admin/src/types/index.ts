// Shared Admin Types
export interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  status: 'active' | 'suspended' | 'banned';
  isVerified: boolean;
  createdAt: string;
  permissions: AdminPermission[];
}

export interface AdminPermission {
  resource: string;
  actions: string[];
}

export interface AdminStats {
  users: {
    total: number;
    active: number;
    suspended: number;
    banned: number;
    verified: number;
    recent24h: number;
  };
  pets: {
    total: number;
    active: number;
    recent24h: number;
  };
  matches: {
    total: number;
    active: number;
    blocked: number;
    recent24h: number;
  };
  messages: {
    total: number;
    deleted: number;
    recent24h: number;
  };
}

export interface AdminAction {
  type: 'suspend' | 'ban' | 'activate' | 'delete';
  targetId: string;
  reason?: string;
  duration?: number; // in days
}

export interface AdminFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Chat Management Types
export interface AdminChat {
  _id: string;
  user1: AdminUser;
  user2: AdminUser;
  status: 'active' | 'blocked';
  messageCount: number;
  createdAt: string;
}

export interface AdminMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  flagged: boolean;
  reviewed: boolean;
  timestamp: string;
}

// Upload/Content Moderation Types
export interface AdminUpload {
  _id: string;
  userId: AdminUser;
  type: 'profile_photo' | 'pet_photo' | 'verification';
  status: 'pending' | 'approved' | 'rejected';
  url: string;
  flagged: boolean;
  createdAt: string;
}

// Security Types
export interface SecurityAlert {
  id: string;
  type: 'suspicious_login' | 'unusual_activity' | 'security_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  details: Record<string, unknown>;
  timestamp: string;
  resolved: boolean;
}

// Analytics Types
export interface AdminAnalytics {
  period: string;
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  };
  performance: {
    apiResponseTime: number;
    databaseQueryTime: number;
    cacheHitRate: number;
  };
  security: {
    failedLogins: number;
    blockedIPs: number;
    securityAlerts: number;
  };
}

// API Response Types
export interface AdminApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Hook Types
export interface AdminHookState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface AdminActions {
  refresh: () => Promise<void>;
  update: (data: Partial<unknown>) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

// Navigation Types
export type AdminRoute =
  | 'dashboard'
  | 'users'
  | 'chats'
  | 'uploads'
  | 'analytics'
  | 'security'
  | 'settings'
  | 'billing'
  | 'moderation';
