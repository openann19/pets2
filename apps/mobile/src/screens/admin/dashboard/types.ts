/**
 * Admin Dashboard Types
 */

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

export interface SystemHealth {
  status: string;
  uptime: number;
  database: {
    status: string;
    connected: boolean;
  };
  memory: {
    used: number;
    total: number;
    external: number;
  };
  environment: string;
}

