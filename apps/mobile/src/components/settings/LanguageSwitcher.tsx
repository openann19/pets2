/**
 * Language Switcher Component
 * Allows users to change app language
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";

import { supportedLanguages, type LanguageCode } from "../../i18n";

interface LanguageSwitcherProps {
  onLanguageChange?: (language: LanguageCode) => void;
  showCurrentLanguage?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  onLanguageChange,
  showCurrentLanguage = true,
}) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();

  const currentLanguage = i18n.language as LanguageCode;

  const languageNames: Record<LanguageCode, string> = {
    en: "English",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    it: "Italiano",
    pt: "Português",
    ru: "Русский",
    ja: "日本語",
    ko: "한국어",
    zh: "中文",
  };

  const handleLanguageChange = async (language: LanguageCode) => {
    await i18n.changeLanguage(language);
    onLanguageChange?.(language);
  };

  return (
    <View style={styles.container}>
      {showCurrentLanguage && (
        <View style={styles.currentLanguageContainer}>
          <Text
            style={[
              styles.currentLanguageLabel,
              { color: colors.text, opacity: 0.7 },
            ]}
          >
            {t("settings.currentLanguage", {
              defaultValue: "Current Language",
            })}
          </Text>
          <Text style={[styles.currentLanguage, { color: colors.text }]}>
            {languageNames[currentLanguage]}
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.languagesList}
        showsVerticalScrollIndicator={false}
      >
        {supportedLanguages.map((language: LanguageCode) => (
          <TouchableOpacity
            key={language}
            style={[
              styles.languageOption,
              {
                backgroundColor:
                  currentLanguage === language ? colors.primary : colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => handleLanguageChange(language)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.languageName,
                {
                  color: currentLanguage === language ? "#fff" : colors.text,
                },
              ]}
            >
              {languageNames[language]}
            </Text>
            {currentLanguage === language && (
              <Ionicons name="checkmark" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  currentLanguageContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  currentLanguageLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  currentLanguage: {
    fontSize: 16,
    fontWeight: "600",
  },
  languagesList: {
    flex: 1,
    padding: 16,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "500",
  },
});
