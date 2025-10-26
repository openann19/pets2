/**
 * PROJECT HYPERION: MIGRATION EXAMPLE SCREEN (SIMPLIFIED)
 *
 * Simplified migration example screen to demonstrate basic patterns
 * without complex component dependencies.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from '../theme/unified-theme';

export default function MigrationExampleScreen() {
  const [useNewArchitecture, setUseNewArchitecture] = useState(true);
  const [selectedExample, setSelectedExample] = useState<
    "buttons" | "containers" | "typography"
  >("buttons");

  const renderButtonExamples = () => (
    <View style={styles.exampleSection}>
      <Text style={styles.exampleTitle}>
        {useNewArchitecture ? "New Architecture" : "Legacy Architecture"}
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>Primary Button</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={StyleSheet.flatten([styles.button, styles.secondaryButton])}
        onPress={() => {}}
      >
        <Text style={styles.buttonText}>Secondary Button</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContainerExamples = () => (
    <View style={styles.exampleSection}>
      <Text style={styles.exampleTitle}>Container Examples</Text>

      <View style={styles.container}>
        <Text>Basic Container</Text>
      </View>

      <View
        style={StyleSheet.flatten([styles.container, styles.elevatedContainer])}
      >
        <Text>Elevated Container</Text>
      </View>
    </View>
  );

  const renderTypographyExamples = () => (
    <View style={styles.exampleSection}>
      <Text style={styles.exampleTitle}>Typography Examples</Text>

      <Text style={styles.heading1}>Heading 1</Text>
      <Text style={styles.heading2}>Heading 2</Text>
      <Text style={styles.body}>Body text example</Text>
      <Text style={styles.caption}>Caption text</Text>
    </View>
  );

  const renderCurrentExample = () => {
    switch (selectedExample) {
      case "buttons":
        return renderButtonExamples();
      case "containers":
        return renderContainerExamples();
      case "typography":
        return renderTypographyExamples();
      default:
        return renderButtonExamples();
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Migration Example</Text>
        <Text style={styles.subtitle}>Compare old vs new architecture</Text>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={StyleSheet.flatten([
            styles.toggleButton,
            useNewArchitecture && styles.activeToggle,
          ])}
          onPress={() => setUseNewArchitecture(true)}
        >
          <Text style={styles.toggleText}>New Architecture</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={StyleSheet.flatten([
            styles.toggleButton,
            !useNewArchitecture && styles.activeToggle,
          ])}
          onPress={() => setUseNewArchitecture(false)}
        >
          <Text style={styles.toggleText}>Legacy</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {(["buttons", "containers", "typography"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={StyleSheet.flatten([
              styles.tab,
              selectedExample === tab && styles.activeTab,
            ])}
            onPress={() => setSelectedExample(tab)}
          >
            <Text style={styles.tabText}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderCurrentExample()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: "#007AFF",
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  exampleSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  exampleTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  elevatedContainer: {
    shadowColor: "Theme.colors.neutral[950]",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heading1: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  heading2: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
});
