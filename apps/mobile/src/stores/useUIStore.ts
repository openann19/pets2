import { create } from "zustand";
import { Tokens } from "@pawfectmatch/design-tokens";

interface UIState {
  theme: keyof Tokens;
  setTheme: (theme: keyof Tokens) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: "light",
  setTheme: (theme) => { set({ theme }); },
  isLoading: false,
  setLoading: (loading) => { set({ isLoading: loading }); },
  error: null,
  setError: (error) => { set({ error }); },
}));
