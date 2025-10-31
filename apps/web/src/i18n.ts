import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import basic locale files (we'll expand this later)
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    ns: ['common', 'auth'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    returnEmptyString: false,
  });

export default i18n;
//# sourceMappingURL=i18n.js.map