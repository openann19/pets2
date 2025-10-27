const detector = {
  type: 'languageDetector' as const,
  async: false,
  detect: () => 'en',
  init: () => {},
  cacheUserLanguage: () => {}
};
export default detector;

