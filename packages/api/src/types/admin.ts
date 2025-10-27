import { z } from 'zod';

/**
 * Admin Role Schema
 */
export const AdminRoleSchema = z.enum(['superadmin', 'support', 'moderator', 'finance', 'analyst']);

export type AdminRole = z.infer<typeof AdminRoleSchema>;

/**
 * Audit Log Schema
 */
export const AuditLogSchema = z.object({
  id: z.string(),
  at: z.date(),
  adminId: z.string(),
  ip: z.string().optional(),
  action: z.string(),
  target: z.string().optional(),
  before: z.record(z.any()).optional(),
  after: z.record(z.any()).optional(),
  reason: z.string().optional(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

/**
 * Admin Session Schema
 */
export const AdminSessionSchema = z.object({
  id: z.string(),
  adminId: z.string(),
  role: AdminRoleSchema,
  expiresAt: z.date(),
  createdAt: z.date(),
});

export type AdminSession = z.infer<typeof AdminSessionSchema>;

/**
 * Permission Schema
 */
export const PermissionSchema = z.enum([
  'users:read',
  'users:write',
  'users:delete',
  'chats:read',
  'chats:moderate',
  'chats:export',
  'billing:read',
  'billing:write',
  'billing:refund',
  'analytics:read',
  'analytics:export',
  'flags:read',
  'flags:write',
  'health:read',
  'settings:read',
  'settings:write',
  'audit:read',
  'impersonate',
]);

export type Permission = z.infer<typeof PermissionSchema>;

/**
 * Role Permissions Map
 */
export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  superadmin: [
    'users:read', 'users:write', 'users:delete',
    'chats:read', 'chats:moderate', 'chats:export',
    'billing:read', 'billing:write', 'billing:refund',
    'analytics:read', 'analytics:export',
    'flags:read', 'flags:write',
    'health:read',
    'settings:read', 'settings:write',
    'audit:read',
    'impersonate',
  ],
  support: [
    'users:read',
    'chats:read',
    'billing:read',
    'analytics:read',
    'audit:read',
  ],
  moderator: [
    'users:read', 'users:write',
    'chats:read', 'chats:moderate', 'chats:export',
    'flags:read',
    'audit:read',
  ],
  finance: [
    'users:read',
    'billing:read', 'billing:write', 'billing:refund',
    'analytics:read', 'analytics:export',
    'audit:read',
  ],
  analyst: [
    'users:read',
    'chats:read',
    'analytics:read', 'analytics:export',
    'flags:read',
    'health:read',
    'audit:read',
  ],
};
