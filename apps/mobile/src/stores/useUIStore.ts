import { create } from "zustand";
import type { Tokens } from "@pawfectmatch/design-tokens";

export type ThemeMode = "light" | "dark" | "system";

export type NotificationCounts = {
  messages: number;
  matches: number;
  likes: number;
  [key: string]: number;
};

interface UIState {
  theme: string;
  themeMode: ThemeMode;
  isDark: boolean;
  setTheme: (theme: string) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setSystemColorScheme: (colorScheme: "light" | "dark" | null | undefined) => void;
  toggleTheme: () => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  notificationCounts: NotificationCounts;
  updateNotificationCounts: (counts: Partial<NotificationCounts>) => void;
  updateNotificationCount: (type: keyof NotificationCounts, count: number) => void;
  incrementNotificationCount: (type: keyof NotificationCounts) => void;
  decrementNotificationCount: (type: keyof NotificationCounts) => void;
  clearNotificationCount: (type: keyof NotificationCounts) => void;
  getTotalNotificationCount: () => number;
  clearAllNotificationCounts: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: "",
  themeMode: "light",
  isDark: false,
  setTheme: (theme) => { set({ theme }); },
  setThemeMode: (mode) => { 
    set({ themeMode: mode, isDark: mode === "dark" }); 
  },
  setSystemColorScheme: (colorScheme) => {
    const state = get();
    if (state.themeMode === "system" && colorScheme) {
      set({ isDark: colorScheme === "dark" });
    }
  },
  toggleTheme: () => { 
    set((state) => {
      const newMode = state.themeMode === "light" ? "dark" : "light";
      return { themeMode: newMode, isDark: newMode === "dark" };
    }); 
  },
  isLoading: false,
  setLoading: (loading) => { set({ isLoading: loading }); },
  error: null,
  setError: (error) => { set({ error }); },
  notificationCounts: { messages: 0, matches: 0, likes: 0 },
  updateNotificationCounts: (counts) => { 
    set((state) => { 
      const updated = { ...state.notificationCounts };
      for (const [key, value] of Object.entries(counts)) {
        if (value !== undefined) {
          updated[key] = value;
        }
      }
      return { notificationCounts: updated };
    }); 
  },
  updateNotificationCount: (type, count) => {
    set((state) => ({
      notificationCounts: { ...state.notificationCounts, [type]: count }
    }));
  },
  incrementNotificationCount: (type) => {
    set((state) => ({
      notificationCounts: {
        ...state.notificationCounts,
        [type]: (state.notificationCounts[type] || 0) + 1
      }
    }));
  },
  decrementNotificationCount: (type) => {
    set((state) => ({
      notificationCounts: {
        ...state.notificationCounts,
        [type]: Math.max(0, (state.notificationCounts[type] || 0) - 1)
      }
    }));
  },
  clearNotificationCount: (type) => {
    set((state) => ({
      notificationCounts: { ...state.notificationCounts, [type]: 0 }
    }));
  },
  getTotalNotificationCount: () => {
    const state = get();
    return Object.values(state.notificationCounts).reduce((sum, count) => sum + count, 0);
  },
  clearAllNotificationCounts: () => { 
    set({ notificationCounts: { messages: 0, matches: 0, likes: 0 } }); 
  },
}));
