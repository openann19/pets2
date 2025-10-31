/**
 * i18n Index
 * Main entry point that initializes i18n with device language
 */
import i18n from './instance';
import { getInitialLanguage, wireDeviceLocaleListener } from './detectors';

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
