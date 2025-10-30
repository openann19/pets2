import { useTheme } from '@mobile/src/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { changeLanguage, resetLanguageToDevice } from '../../i18n/detectors';

type Lang = 'en' | 'bg';

const STORAGE_OVERRIDE_KEY = 'i18n.lang.override';

export const LanguageSwitcher: React.FC = () => {
  const theme = useTheme();
  const { i18n, t } = useTranslation('common');

  const [busy, setBusy] = useState<Lang | 'reset' | null>(null);
  const [followingDevice, setFollowingDevice] = useState(true);

  const current: Lang = i18n.language.startsWith('bg') ? 'bg' : 'en';

  // Check if following device language
  useEffect(() => {
    const checkOverride = async () => {
      const override = (await AsyncStorage.getItem(STORAGE_OVERRIDE_KEY)) === '1';
      setFollowingDevice(!override);
    };
    checkOverride();
  }, [i18n.language]);

  const onChange = useCallback(
    async (lang: Lang) => {
      if (busy || current === lang) return;
      try {
        setBusy(lang);
        await changeLanguage(lang);
        setFollowingDevice(false);
      } finally {
        setBusy(null);
      }
    },
    [busy, current],
  );

  const onResetToDevice = useCallback(async () => {
    if (busy !== null || followingDevice) return;
    try {
      setBusy('reset' as const);
      await resetLanguageToDevice();
      setFollowingDevice(true);
    } finally {
      setBusy(null);
    }
  }, [busy, followingDevice]);

  const styles = makeStyles(theme);

  const items: Array<{ lang: Lang; key: string; testID: string }> = [
    { lang: 'en', key: 'language.english', testID: 'language-en' },
    { lang: 'bg', key: 'language.bulgarian', testID: 'language-bg' },
  ];

  return (
    <View style={styles.wrapper}>
      <View
        style={styles.container}
        accessible
        accessibilityRole="radiogroup"
      >
        {items.map(({ lang, key, testID }) => {
          const selected = current === lang;
          return (
            <Pressable
              key={lang}
              testID={testID}
              onPress={() => onChange(lang)}
              accessibilityRole="radio"
              accessibilityLabel={t(key)}
              accessibilityState={{ selected, disabled: !!busy }}
              style={({ pressed }) => [
                styles.button,
                selected ? styles.buttonActive : styles.buttonInactive,
                pressed && styles.buttonPressed,
                busy && styles.buttonDisabled,
              ]}
              disabled={!!busy}
            >
              <Text
                style={[
                  styles.buttonText,
                  selected ? styles.buttonTextActive : styles.buttonTextInactive,
                ]}
              >
                {t(key)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {!followingDevice && (
        <Pressable
          testID="language-device"
          onPress={onResetToDevice}
          accessibilityRole="button"
          accessibilityLabel={t('language.device')}
          accessibilityState={{ disabled: !!busy }}
          style={({ pressed }) => [
            styles.resetButton,
            pressed && styles.resetButtonPressed,
            busy && styles.resetButtonDisabled,
          ]}
          disabled={!!busy}
        >
          <Text style={styles.resetButtonText}>{t('language.device')}</Text>
        </Pressable>
      )}
    </View>
  );
};

const makeStyles = (theme: any) =>
  StyleSheet.create({
    wrapper: { marginVertical: 12 },
    container: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    button: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: theme.radii.md,
      borderWidth: 2,
      alignItems: 'center',
    },
    buttonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    buttonInactive: {
      backgroundColor: theme.colors.bg,
      borderColor: theme.colors.border,
    },
    buttonPressed: { opacity: 0.9 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { fontSize: 14, fontWeight: '600' },
    buttonTextActive: { color: theme.colors.primaryText },
    buttonTextInactive: { color: theme.colors.onSurface },
    resetButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.border,
      alignItems: 'center',
    },
    resetButtonPressed: { opacity: 0.8 },
    resetButtonDisabled: { opacity: 0.6 },
    resetButtonText: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
  });
