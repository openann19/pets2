/**
 * Types for Admin Services Screen
 */

export interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime: number;
  lastChecked: string;
  icon: string; // Ionicons name as string
  color: string;
  endpoint?: string;
  description: string;
}

