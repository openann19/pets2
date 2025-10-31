/**
 * i18n Instance
 * Separate module to avoid circular dependency with detectors
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import namespaces for each language
import bgCommon from './locales/bg/common.json';
import bgAuth from './locales/bg/auth.json';
import bgMap from './locales/bg/map.json';
import bgChat from './locales/bg/chat.json';
import bgPremium from './locales/bg/premium.json';
import bgReels from './locales/bg/reels.json';

import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enMap from './locales/en/map.json';
import enChat from './locales/en/chat.json';
import enPremium from './locales/en/premium.json';
import enReels from './locales/en/reels.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    map: enMap,
    chat: enChat,
    premium: enPremium,
    reels: enReels,
  },
  bg: {
    common: bgCommon,
    auth: bgAuth,
    map: bgMap,
    chat: bgChat,
    premium: bgPremium,
    reels: bgReels,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en', // temp; we'll set real value below
  fallbackLng: 'en',
  ns: ['common', 'auth', 'map', 'chat', 'premium', 'reels'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

export default i18n;

