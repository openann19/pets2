import { create } from "zustand";
import { Tokens } from "@pawfectmatch/design-tokens";

export type ThemeMode = "light" | "dark" | "system";

export type NotificationCounts = {
  messages: number;
  matches: number;
  likes: number;
  [key: string]: number;
};

interface UIState {
  theme: keyof Tokens;
  themeMode: ThemeMode;
  setTheme: (theme: keyof Tokens) => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  notificationCounts: NotificationCounts;
  updateNotificationCounts: (counts: Partial<NotificationCounts>) => void;
  clearAllNotificationCounts: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: "light",
  themeMode: "light",
  setTheme: (theme) => { set({ theme }); },
  setThemeMode: (mode) => { set({ themeMode: mode }); },
  toggleTheme: () => { 
    set((state) => ({ 
      themeMode: state.themeMode === "light" ? "dark" : "light" 
    })); 
  },
  isLoading: false,
  setLoading: (loading) => { set({ isLoading: loading }); },
  error: null,
  setError: (error) => { set({ error }); },
  notificationCounts: { messages: 0, matches: 0, likes: 0 },
  updateNotificationCounts: (counts) => { 
    set((state) => ({ 
      notificationCounts: { ...state.notificationCounts, ...counts } 
    })); 
  },
  clearAllNotificationCounts: () => { 
    set({ notificationCounts: { messages: 0, matches: 0, likes: 0 } }); 
  },
}));
