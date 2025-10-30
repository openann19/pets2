export default {
  input: ['apps/mobile/src/**/*.{ts,tsx}'],
  output: 'apps/mobile/src/i18n/locales',
  options: {
    lngs: ['en', 'bg'],
    ns: ['common', 'auth', 'map', 'chat', 'premium'],
    defaultLng: 'en',
    defaultNs: 'common',
    resource: { jsonIndent: 2 },
    keySeparator: false,
    nsSeparator: false,
  }
};
