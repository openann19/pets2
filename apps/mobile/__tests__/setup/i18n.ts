/**
 * i18n test setup
 * Configure i18n for unit and integration tests
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import all locale files
import bgCommon from '../src/i18n/locales/bg/common.json';
import bgAuth from '../src/i18n/locales/bg/auth.json';
import bgMap from '../src/i18n/locales/bg/map.json';
import bgChat from '../src/i18n/locales/bg/chat.json';
import bgPremium from '../src/i18n/locales/bg/premium.json';

import enCommon from '../src/i18n/locales/en/common.json';
import enAuth from '../src/i18n/locales/en/auth.json';
import enMap from '../src/i18n/locales/en/map.json';
import enChat from '../src/i18n/locales/en/chat.json';
import enPremium from '../src/i18n/locales/en/premium.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    map: enMap,
    chat: enChat,
    premium: enPremium,
  },
  bg: {
    common: bgCommon,
    auth: bgAuth,
    map: bgMap,
    chat: bgChat,
    premium: bgPremium,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'bg',
  fallbackLng: 'en',
  ns: ['common', 'auth', 'map', 'chat', 'premium'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

export default i18n;
