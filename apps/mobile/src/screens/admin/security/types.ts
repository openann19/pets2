/**
 * Admin Security Screen Types
 */

export interface SecurityAlert {
  id: string;
  type:
    | 'suspicious_login'
    | 'blocked_ip'
    | 'reported_content'
    | 'spam_detected'
    | 'data_breach'
    | 'unusual_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  location?: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface SecurityMetrics {
  totalAlerts: number;
  criticalAlerts: number;
  highAlerts: number;
  mediumAlerts: number;
  lowAlerts: number;
  resolvedAlerts: number;
  pendingAlerts: number;
  suspiciousLogins: number;
  blockedIPs: number;
  reportedContent: number;
  spamDetected: number;
  dataBreaches: number;
  unusualActivity: number;
}

export type SecuritySeverityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';
export type SecurityTypeFilter =
  | 'all'
  | 'suspicious_login'
  | 'blocked_ip'
  | 'reported_content'
  | 'spam_detected'
  | 'data_breach'
  | 'unusual_activity';
