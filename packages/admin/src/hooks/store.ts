import { create } from 'zustand';
import type { AdminUser, AdminStats, AdminChat, AdminUpload, AdminAnalytics, SecurityAlert } from '../types';

interface AdminState {
  // Current admin user
  currentAdmin: AdminUser | null;

  // Dashboard data
  stats: AdminStats | null;
  analytics: AdminAnalytics | null;

  // Lists with pagination
  users: AdminUser[];
  chats: AdminChat[];
  uploads: AdminUpload[];
  securityAlerts: SecurityAlert[];

  // Loading states
  loading: {
    stats: boolean;
    users: boolean;
    chats: boolean;
    uploads: boolean;
    analytics: boolean;
    security: boolean;
  };

  // Errors
  errors: {
    stats: string | null;
    users: string | null;
    chats: string | null;
    uploads: string | null;
    analytics: string | null;
    security: string | null;
  };

  // Filters
  filters: {
    users: Record<string, unknown>;
    chats: Record<string, unknown>;
    uploads: Record<string, unknown>;
    analytics: Record<string, unknown>;
    security: Record<string, unknown>;
  };

  // Actions
  setCurrentAdmin: (admin: AdminUser | null) => void;
  updateStats: (stats: AdminStats) => void;
  updateUsers: (users: AdminUser[]) => void;
  updateChats: (chats: AdminChat[]) => void;
  updateUploads: (uploads: AdminUpload[]) => void;
  updateAnalytics: (analytics: AdminAnalytics) => void;
  updateSecurityAlerts: (alerts: SecurityAlert[]) => void;

  // Loading actions
  setLoading: (section: keyof AdminState['loading'], loading: boolean) => void;
  setError: (section: keyof AdminState['errors'], error: string | null) => void;

  // Filter actions
  setFilter: (section: keyof AdminState['filters'], filters: Record<string, unknown>) => void;

  // Reset actions
  reset: () => void;
}

const initialState = {
  currentAdmin: null,
  stats: null,
  analytics: null,
  users: [],
  chats: [],
  uploads: [],
  securityAlerts: [],
  loading: {
    stats: false,
    users: false,
    chats: false,
    uploads: false,
    analytics: false,
    security: false,
  },
  errors: {
    stats: null,
    users: null,
    chats: null,
    uploads: null,
    analytics: null,
    security: null,
  },
  filters: {
    users: {},
    chats: {},
    uploads: {},
    analytics: {},
    security: {},
  },
};

export const useAdminStore = create<AdminState>((set) => ({
  ...initialState,

  setCurrentAdmin: (admin) => set({ currentAdmin: admin }),

  updateStats: (stats) => set({ stats }),
  updateUsers: (users) => set({ users }),
  updateChats: (chats) => set({ chats }),
  updateUploads: (uploads) => set({ uploads }),
  updateAnalytics: (analytics) => set({ analytics }),
  updateSecurityAlerts: (alerts) => set({ securityAlerts: alerts }),

  setLoading: (section, loading) =>
    set((state) => ({
      loading: { ...state.loading, [section]: loading },
    })),

  setError: (section, error) =>
    set((state) => ({
      errors: { ...state.errors, [section]: error },
    })),

  setFilter: (section, filters) =>
    set((state) => ({
      filters: { ...state.filters, [section]: filters },
    })),

  reset: () => set(initialState),
}));
