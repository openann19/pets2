import { useThemeContext } from "./ThemeProvider";

export function useTheme() {
  return useThemeContext().theme;
}

export function useThemeName() {
  return useThemeContext().name;
}

export function useSetTheme() {
  return useThemeContext().setThemeName;
}
