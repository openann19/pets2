import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';
import i18n from './index';

export type Lang = 'en' | 'bg';

const STORAGE_KEY = 'i18n.lang';
const STORAGE_OVERRIDE_KEY = 'i18n.lang.override'; // "1" when user explicitly chose a lang

const SUPPORTED: Lang[] = ['en', 'bg'];

const normalize = (lng?: string | null): Lang => {
  const v = (lng || '').toLowerCase();
  if (v.startsWith('bg')) return 'bg';
  return SUPPORTED.includes(v as Lang) ? (v as Lang) : 'en';
};

const deviceLanguage = (): Lang => {
  const dev = RNLocalize.getLocales?.()[0];
  return normalize(dev?.languageTag || dev?.languageCode || 'en');
};

/** Read persisted language if user set an override. */
export const getStoredLanguage = async (): Promise<Lang | null> => {
  const [lng, override] = await AsyncStorage.multiGet([STORAGE_KEY, STORAGE_OVERRIDE_KEY]);
  if (override?.[1] === '1' && lng?.[1]) return normalize(lng[1]);
  return null;
};

/** Resolve initial language: stored override → device → 'en'. */
export const getInitialLanguage = async (): Promise<Lang> => {
  return (await getStoredLanguage()) ?? deviceLanguage();
};

/** Persist and switch language (explicit user override). */
export const changeLanguage = async (lang: Lang): Promise<void> => {
  const next = normalize(lang);
  await AsyncStorage.multiSet([[STORAGE_KEY, next], [STORAGE_OVERRIDE_KEY, '1']]);
  await i18n.changeLanguage(next);
};

/** Clear override and follow device locale again. */
export const resetLanguageToDevice = async (): Promise<void> => {
  await AsyncStorage.multiRemove([STORAGE_KEY, STORAGE_OVERRIDE_KEY]);
  await i18n.changeLanguage(deviceLanguage());
};

/**
 * Wire RNLocalize 'change' listener.
 * If user has NOT set an override, automatically follow device changes.
 */
export const wireDeviceLocaleListener = (): void => {
  const onChange = async () => {
    const override = (await AsyncStorage.getItem(STORAGE_OVERRIDE_KEY)) === '1';
    if (!override) {
      await i18n.changeLanguage(deviceLanguage());
    }
  };
  // @ts-expect-error RNLocalize typing supports addEventListener('change', cb)
  RNLocalize.addEventListener('change', onChange);
};
