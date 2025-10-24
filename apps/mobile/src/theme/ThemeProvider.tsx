import React, { createContext, useContext, useMemo, useState } from "react";
import type { Theme } from "./theme";
import { darkTheme, lightTheme, type ThemeName } from "./theme";
import { useColorScheme } from "../hooks/useColorScheme";

interface ThemeContextValue {
  theme: Theme;
  name: ThemeName;
  setThemeName: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeName;
}

export function ThemeProvider({
  children,
  initialTheme,
}: ThemeProviderProps): React.ReactElement {
  const systemScheme = useColorScheme();
  const [userTheme, setUserTheme] = useState<ThemeName | undefined>(
    initialTheme,
  );

  const resolvedThemeName: ThemeName =
    userTheme ?? (systemScheme === "dark" ? "dark" : "light");

  const value = useMemo<ThemeContextValue>(() => {
    const resolvedTheme = resolvedThemeName === "dark" ? darkTheme : lightTheme;

    return {
      theme: resolvedTheme,
      name: resolvedThemeName,
      setThemeName: (nextTheme: ThemeName) => {
        setUserTheme(nextTheme);
      },
    };
  }, [resolvedThemeName]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }

  return context;
}
