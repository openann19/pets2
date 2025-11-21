/**
 * Mobile i18n Configuration
 * Internationalization setup for PawfectMatch Mobile App
 */

import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import it from "./locales/it.json";
import pt from "./locales/pt.json";
import ru from "./locales/ru.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import zh from "./locales/zh.json";

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  it: { translation: it },
  pt: { translation: pt },
  ru: { translation: ru },
  ja: { translation: ja },
  ko: { translation: ko },
  zh: { translation: zh },
};

// Get device locale
const getDeviceLocale = (): string => {
  const locale = Localization.locale;
  // Extract language code (e.g., 'en-US' -> 'en')
  return locale.split("-")[0];
};

// Fallback languages
const fallbackLng = "en";
const supportedLngs = Object.keys(resources);

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLocale(),
  fallbackLng,
  supportedLngs,

  // Debug in development
  debug: __DEV__,

  // Interpolation
  interpolation: {
    escapeValue: false, // React already escapes values
  },

  // React options
  react: {
    useSuspense: false,
  },

  // Detection options (for future web compatibility)
  detection: {
    order: ["navigator"],
  },
});

export default i18n;

// Export types
export type LanguageCode = keyof typeof resources;
export const supportedLanguages: LanguageCode[] =
  supportedLngs as LanguageCode[];
