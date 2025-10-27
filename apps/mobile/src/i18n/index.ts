import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getInitialLanguage, wireDeviceLocaleListener } from './detectors';

// Import namespaces for each language
import bgCommon from './locales/bg/common.json';
import bgAuth from './locales/bg/auth.json';
import bgMap from './locales/bg/map.json';
import bgChat from './locales/bg/chat.json';
import bgPremium from './locales/bg/premium.json';

import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enMap from './locales/en/map.json';
import enChat from './locales/en/chat.json';
import enPremium from './locales/en/premium.json';

const resources = {
  en: { 
    common: enCommon,
    auth: enAuth,
    map: enMap,
    chat: enChat,
    premium: enPremium
  },
  bg: { 
    common: bgCommon,
    auth: bgAuth,
    map: bgMap,
    chat: bgChat,
    premium: bgPremium
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',                 // temp; we'll set real value below
  fallbackLng: 'en',
  ns: ['common', 'auth', 'map', 'chat', 'premium'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

// Align with stored/device lang after init, and subscribe to device changes
(async () => {
  try {
    const initial = await getInitialLanguage();
    await i18n.changeLanguage(initial);
  } finally {
    wireDeviceLocaleListener();
  }
})();

export default i18n;

