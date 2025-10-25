/**
 * i18n Provider Component
 * Provides i18n context to the app
 */

import React, { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import * as Localization from "expo-localization";

import i18n from "../../i18n";

interface I18nProviderProps {
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  useEffect(() => {
    // Listen for device locale changes
    const subscription = Localization.addListener(() => {
      // Optionally update language when device locale changes
      // For now, we keep user preference
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default I18nProvider;
