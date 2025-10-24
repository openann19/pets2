import { logger } from '@pawfectmatch/core';
import { _adminAPI as adminAPI } from './adminAPI';

export type AdminUserStatus = 'active' | 'suspended' | 'banned' | 'pending';

export interface AdminUserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: AdminUserStatus;
  verified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  petsCount: number;
  matchesCount: number;
  messagesCount: number;
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdminUserStatus | 'all';
  role?: string;
  verified?: boolean;
}

export interface AdminUsersResult {
  users: AdminUserSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export type AdminUserAction = 'suspend' | 'activate' | 'ban' | 'unban';

const CACHE_TTL_MS = 30_000;
const cache = new Map<string, { timestamp: number; data: AdminUsersResult }>();

const createCacheKey = (query: AdminUsersQuery = {}): string => {
  const normalized: Record<string, string> = {};
  if (query.page !== undefined) normalized['page'] = query.page.toString();
  if (query.limit !== undefined) normalized['limit'] = query.limit.toString();
  if (query.search !== undefined && query.search !== '') normalized['search'] = query.search.toLowerCase();
  if (query.status !== undefined && query.status !== 'all') normalized['status'] = query.status;
  if (query.role !== undefined && query.role !== '') normalized['role'] = query.role;
  if (query.verified !== undefined) normalized['verified'] = query.verified ? 'true' : 'false';
  return JSON.stringify(normalized);
};

const mapUser = (user: Record<string, unknown>): AdminUserSummary => {
  return {
    id: typeof user['_id'] === 'string' ? user['_id'] : '',
    firstName: typeof user['firstName'] === 'string' ? user['firstName'] : 'Unknown',
    lastName: typeof user['lastName'] === 'string' ? user['lastName'] : 'User',
    email: typeof user['email'] === 'string' ? user['email'] : 'unknown@example.com',
    role: typeof user['role'] === 'string' ? user['role'] : 'user',
    status: (['active', 'suspended', 'banned', 'pending'] as const).includes(user['status'] as AdminUserStatus) ? (user['status'] as AdminUserStatus) : 'pending',
    verified: Boolean(user['isVerified'] ?? user['verified']),
    createdAt: typeof user['createdAt'] === 'string' ? user['createdAt'] : new Date().toISOString(),
    lastLoginAt: typeof user['lastLoginAt'] === 'string' ? user['lastLoginAt'] : undefined,
    petsCount: Array.isArray(user['pets']) ? user['pets'].length : Number(user['petsCount'] ?? 0),
    matchesCount: Number(user['matchesCount'] ?? 0),
    messagesCount: Number(user['messagesCount'] ?? 0),
  };
};

const mapResponse = (response: Record<string, unknown>): AdminUsersResult => {
  const data = response['data'] as Record<string, unknown> | undefined;
  const users = Array.isArray(data?.['users']) ? (data['users'] as Record<string, unknown>[]).map(mapUser) : [];
  const pagination = data?.['pagination'] as Record<string, unknown> | undefined;
  const paginationData = pagination ?? {};
  return {
    users,
    pagination: {
      page: Number(paginationData['page'] ?? 1),
      limit: Number(paginationData['limit'] ?? users.length),
      total: Number(paginationData['total'] ?? users.length),
      pages: Number(paginationData['pages'] ?? 1),
    },
  };
};

const isCacheValid = (entry?: { timestamp: number }): boolean => {
  if (entry === undefined) return false;
  return Date.now() - entry.timestamp < CACHE_TTL_MS;
};

export const invalidateAdminUsersCache = (): void => {
  cache.clear();
};

export const fetchAdminUsers = async (query: AdminUsersQuery = {}): Promise<AdminUsersResult> => {
  const cacheKey = createCacheKey(query);
  const cached = cache.get(cacheKey);
  if (isCacheValid(cached) && cached !== undefined) {
    return cached.data;
  }

  try {
    const params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      role?: string;
      verified?: string;
    } = {};

    if (query.page !== undefined) params.page = query.page;
    if (query.limit !== undefined) params.limit = query.limit;
    if (query.search !== undefined && query.search !== '') params.search = query.search;
    if (query.status !== undefined && query.status !== 'all') params.status = query.status;
    if (query.role !== undefined && query.role !== '') params.role = query.role;
    if (query.verified !== undefined) params.verified = query.verified ? 'true' : 'false';

    const response = await adminAPI.getUsers(params);

    const mapped = mapResponse(response as unknown as Record<string, unknown>);
    cache.set(cacheKey, { timestamp: Date.now(), data: mapped });
    return mapped;
  } catch (error: unknown) {
    cache.delete(cacheKey);
    const err = error instanceof Error ? error : new Error('Failed to fetch admin users');
    logger.error('Failed to fetch admin users', { error: err });
    throw err;
  }
};

const getDefaultReason = (action: AdminUserAction): string => {
  switch (action) {
    case 'suspend':
      return 'User suspended via mobile admin controls';
    case 'activate':
      return 'User reactivated via mobile admin controls';
    case 'ban':
      return 'User banned via mobile admin controls';
    case 'unban':
      return 'User reinstated via mobile admin controls';
  }
};

export const performAdminUserAction = async (
  userId: string,
  action: AdminUserAction,
  options?: { reason?: string; durationDays?: number }
): Promise<void> => {
  const payloadReason = options?.reason ?? getDefaultReason(action);

  try {
    if (action === 'suspend') {
      await adminAPI.suspendUser(userId, payloadReason, options?.durationDays);
    } else if (action === 'activate' || action === 'unban') {
      await adminAPI.activateUser(userId, payloadReason);
    } else {
      await adminAPI.banUser(userId, payloadReason);
    }
    invalidateAdminUsersCache();
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(`Failed to ${action} user`);
    logger.error('Admin user action failed', { action, userId, error: err });
    throw err;
  }
};

export const adminUsersService = {
  fetchAdminUsers,
  performAdminUserAction,
  invalidate: invalidateAdminUsersCache,
};

export default adminUsersService;
