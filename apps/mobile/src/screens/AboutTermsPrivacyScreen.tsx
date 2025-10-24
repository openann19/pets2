import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AboutTermsPrivacyScreenProps {
  navigation: {
    goBack: () => void;
  };
}

interface LegalDocument {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

function AboutTermsPrivacyScreen({
  navigation,
}: AboutTermsPrivacyScreenProps): JSX.Element {
  const legalDocuments: LegalDocument[] = [
    {
      id: "terms",
      title: "Terms of Service",
      description: "Rules and guidelines for using PawfectMatch",
      icon: "document-text-outline",
      action: () => {
        Alert.alert("Terms of Service", "Terms document coming soon!");
      },
    },
    {
      id: "privacy",
      title: "Privacy Policy",
      description: "How we collect and use your data",
      icon: "lock-closed-outline",
      action: () => {
        Alert.alert("Privacy Policy", "Privacy policy document coming soon!");
      },
    },
    {
      id: "gdpr",
      title: "GDPR Rights",
      description: "Your data protection rights under GDPR",
      icon: "shield-checkmark-outline",
      action: () => {
        Alert.alert("GDPR Rights", "GDPR information coming soon!");
      },
    },
    {
      id: "cookies",
      title: "Cookie Policy",
      description: "Information about our use of cookies",
      icon: "book-outline",
      action: () => {
        Alert.alert("Cookie Policy", "Cookie policy coming soon!");
      },
    },
  ];

  const handleDocument = useCallback((document: LegalDocument) => {
    Haptics.selectionAsync().catch(() => {});
    document.action();
  }, []);

  const handleWebsite = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    const url = "https://pawfectmatch.com";
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Website", `Visit us at ${url}`);
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#a8edea", "#fed6e3", "#a8edea"]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                () => {},
              );
              navigation.goBack();
            }}
          >
            <BlurView intensity={20} style={styles.backButtonBlur}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Legal & About</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* App Info */}
          <BlurView intensity={15} style={styles.appInfoCard}>
            <View style={styles.appIcon}>
              <Ionicons name="paw-outline" size={40} color="#3B82F6" />
            </View>
            <View style={styles.appDetails}>
              <Text style={styles.appName}>PawfectMatch</Text>
              <Text style={styles.appTagline}>
                Where Pets Find Their Perfect Match
              </Text>
              <Text style={styles.appVersion}>Version 2.5.1</Text>
            </View>
          </BlurView>

          {/* Quick Links */}
          <TouchableOpacity style={styles.websiteCard} onPress={handleWebsite}>
            <BlurView intensity={20} style={styles.websiteBlur}>
              <View style={styles.websiteContent}>
                <Ionicons name="globe-outline" size={24} color="#10B981" />
                <View style={styles.websiteText}>
                  <Text style={styles.websiteTitle}>Visit Our Website</Text>
                  <Text style={styles.websiteDescription}>
                    pawfectmatch.com
                  </Text>
                </View>
                <Ionicons
                  name="open-outline"
                  size={20}
                  color="rgba(255,255,255,0.6)"
                />
              </View>
            </BlurView>
          </TouchableOpacity>

          {/* Legal Documents */}
          <Text style={styles.sectionTitle}>Legal Documents</Text>

          {legalDocuments.map((document) => (
            <TouchableOpacity
              key={document.id}
              style={styles.documentCard}
              onPress={() => {
                handleDocument(document);
              }}
            >
              <BlurView intensity={20} style={styles.documentBlur}>
                <View style={styles.documentContent}>
                  <View
                    style={[
                      styles.documentIcon,
                      { backgroundColor: "#8B5CF6" },
                    ]}
                  >
                    <Ionicons name={document.icon} size={20} color="white" />
                  </View>
                  <View style={styles.documentText}>
                    <Text style={styles.documentTitle}>{document.title}</Text>
                    <Text style={styles.documentDescription}>
                      {document.description}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="rgba(255,255,255,0.6)"
                  />
                </View>
              </BlurView>
            </TouchableOpacity>
          ))}

          {/* Contact Info */}
          <Text style={[styles.sectionTitle, { marginTop: 32 }]}>
            Contact Information
          </Text>

          <BlurView intensity={15} style={styles.contactCard}>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={20} color="#3B82F6" />
              <Text style={styles.contactText}>support@pawfectmatch.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={20} color="#10B981" />
              <Text style={styles.contactText}>1-800-PET-MATCH</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={20} color="#F59E0B" />
              <Text style={styles.contactText}>San Francisco, CA</Text>
            </View>
          </BlurView>

          {/* Copyright */}
          <Text style={styles.copyright}>
            © 2024 PawfectMatch. All rights reserved.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  backButtonBlur: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  appInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  appDetails: {
    flex: 1,
  },
  appName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  websiteCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  websiteBlur: {
    padding: 16,
  },
  websiteContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  websiteText: {
    flex: 1,
    marginLeft: 16,
  },
  websiteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  websiteDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  documentCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  documentBlur: {
    padding: 16,
  },
  documentContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  documentText: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 20,
  },
  contactCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: "white",
    marginLeft: 12,
  },
  copyright: {
    textAlign: "center",
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 24,
    marginBottom: 32,
  },
});

export default AboutTermsPrivacyScreen;
