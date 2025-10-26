/**
 * Test fixtures index
 * Centralized test data for consistent testing
 */

export * from './users';
export * from './pets';
export * from './matches';

// API response helpers
export const createSuccessResponse = <T>(data: T) => ({
  success: true,
  data,
  message: 'Success',
});

export const createErrorResponse = (message: string, code?: string) => ({
  success: false,
  error: message,
  code: code || 'ERROR',
});

export const createPaginatedResponse = <T>(
  items: T[],
  page = 1,
  pageSize = 20,
  total = items.length
) => ({
  success: true,
  data: {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasMore: page * pageSize < total,
    },
  },
});
