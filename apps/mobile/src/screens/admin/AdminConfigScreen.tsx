/**
 * Admin Configuration Management Screen
 * Comprehensive UI for managing all API configurations and service settings
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@mobile/theme";
import { _adminAPI } from "../../services/api";
import { errorHandler } from "../../services/errorHandler";
import { logger } from "../../services/logger";

interface ServiceConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  isConfigured: boolean;
  isActive: boolean;
  fields: ConfigField[];
  description: string;
}

interface ConfigField {
  key: string;
  label: string;
  type: "text" | "password" | "number" | "boolean" | "url";
  value: string | number | boolean;
  placeholder?: string;
  required?: boolean;
  description?: string;
  masked?: boolean;
}

interface AdminConfigScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export default function AdminConfigScreen({
  navigation,
}: AdminConfigScreenProps): React.JSX.Element {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<ServiceConfig[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceConfig | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string | number | boolean>>({});

  useEffect(() => {
    void loadConfigurations();
  }, []);

  const loadConfigurations = async (): Promise<void> => {
    try {
      setLoading(true);

      // Load all service configurations
      const [aiConfig, stripeConfig, servicesStatus] = await Promise.all([
        _adminAPI.getAIConfig().catch(() => ({ success: false, data: null })),
        _adminAPI.getStripeConfig().catch(() => ({ success: false, data: null })),
        _adminAPI.getServicesStatus().catch(() => ({ success: false, data: null })),
      ]);

      const serviceConfigs: ServiceConfig[] = [];

      // AI Service Configuration
      if (aiConfig.success && aiConfig.data) {
        const ai = aiConfig.data as {
          apiKey?: string;
          baseUrl?: string;
          model?: string;
          maxTokens?: number;
          temperature?: number;
          isConfigured?: boolean;
          isActive?: boolean;
        };
        serviceConfigs.push({
          id: "ai",
          name: "AI Service (DeepSeek)",
          icon: "sparkles",
          color: theme.colors.primary,
          isConfigured: ai.isConfigured ?? false,
          isActive: ai.isActive ?? false,
          description: "AI text generation and compatibility analysis",
          fields: [
            {
              key: "apiKey",
              label: "API Key",
              type: "password",
              value: ai.apiKey || "",
              placeholder: "sk-...",
              required: true,
              masked: true,
            },
            {
              key: "baseUrl",
              label: "Base URL",
              type: "url",
              value: ai.baseUrl || "https://api.deepseek.com",
              placeholder: "https://api.deepseek.com",
            },
            {
              key: "model",
              label: "Model",
              type: "text",
              value: ai.model || "deepseek-chat",
              placeholder: "deepseek-chat",
            },
            {
              key: "maxTokens",
              label: "Max Tokens",
              type: "number",
              value: ai.maxTokens || 4000,
              placeholder: "4000",
            },
            {
              key: "temperature",
              label: "Temperature",
              type: "number",
              value: ai.temperature || 0.7,
              placeholder: "0.7",
            },
            {
              key: "isActive",
              label: "Service Active",
              type: "boolean",
              value: ai.isActive ?? false,
            },
          ],
        });
      }

      // Stripe Configuration
      if (stripeConfig.success && stripeConfig.data) {
        const stripe = stripeConfig.data as {
          secretKey?: string;
          publishableKey?: string;
          webhookSecret?: string;
          isLiveMode?: boolean;
          isConfigured?: boolean;
        };
        serviceConfigs.push({
          id: "stripe",
          name: "Stripe Payments",
          icon: "card",
          color: theme.colors.success,
          isConfigured: stripe.isConfigured ?? false,
          isActive: stripe.isConfigured ?? false,
          description: "Payment processing and subscription management",
          fields: [
            {
              key: "secretKey",
              label: "Secret Key",
              type: "password",
              value: stripe.secretKey || "",
              placeholder: "sk_...",
              required: true,
              masked: true,
            },
            {
              key: "publishableKey",
              label: "Publishable Key",
              type: "text",
              value: stripe.publishableKey || "",
              placeholder: "pk_...",
              required: true,
            },
            {
              key: "webhookSecret",
              label: "Webhook Secret",
              type: "password",
              value: stripe.webhookSecret || "",
              placeholder: "whsec_...",
              masked: true,
            },
            {
              key: "isLiveMode",
              label: "Live Mode",
              type: "boolean",
              value: stripe.isLiveMode ?? false,
            },
          ],
        });
      }

      // External Services (from services status)
      if (servicesStatus.success && servicesStatus.data) {
        const servicesData = servicesStatus.data as Record<
          string,
          {
            status: string;
            endpoint?: string;
            isConfigured?: boolean;
            isActive?: boolean;
          }
        >;

        const serviceMetadata: Record<
          string,
          { name: string; icon: string; color: string; description: string }
        > = {
          "aws-rekognition": {
            name: "AWS Rekognition",
            icon: "eye",
            color: "#FF9900",
            description: "Content moderation and safety checks",
          },
          cloudinary: {
            name: "Cloudinary",
            icon: "cloud",
            color: "#3448C5",
            description: "Image storage and processing",
          },
          fcm: {
            name: "Firebase Cloud Messaging",
            icon: "notifications",
            color: "#FF9800",
            description: "Push notifications",
          },
          livekit: {
            name: "LiveKit",
            icon: "videocam",
            color: "#6366F1",
            description: "Live streaming",
          },
        };

        Object.entries(servicesData).forEach(([key, service]) => {
          const metadata = serviceMetadata[key.toLowerCase()];
          if (metadata) {
            serviceConfigs.push({
              id: key,
              name: metadata.name,
              icon: metadata.icon,
              color: metadata.color,
              isConfigured: service.isConfigured ?? false,
              isActive: service.isActive ?? false,
              description: metadata.description,
              fields: [
                {
                  key: "endpoint",
                  label: "Endpoint",
                  type: "url",
                  value: service.endpoint || "",
                  placeholder: "https://...",
                },
                {
                  key: "isActive",
                  label: "Service Active",
                  type: "boolean",
                  value: service.isActive ?? false,
                },
              ],
            });
          }
        });
      }

      setServices(serviceConfigs);
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : new Error("Failed to load configurations"),
        {
          component: "AdminConfigScreen",
          action: "loadConfigurations",
        },
      );
    } finally {
      setLoading(false);
    }
  };

  const openServiceConfig = useCallback((service: ServiceConfig) => {
    setSelectedService(service);
    const initialValues: Record<string, string | number | boolean> = {};
    service.fields.forEach((field) => {
      initialValues[field.key] = field.value;
    });
    setConfigValues(initialValues);
  }, []);

  const closeServiceConfig = useCallback(() => {
    setSelectedService(null);
    setConfigValues({});
  }, []);

  const updateConfigValue = useCallback(
    (key: string, value: string | number | boolean) => {
      setConfigValues((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const saveConfiguration = useCallback(async () => {
    if (!selectedService) return;

    try {
      setSaving(true);

      // Validate required fields
      const requiredFields = selectedService.fields.filter((f) => f.required);
      for (const field of requiredFields) {
        const value = configValues[field.key];
        if (value === undefined || value === null || value === "") {
          Alert.alert("Validation Error", `${field.label} is required`);
          return;
        }
      }

      // Save configuration based on service type
      let response;
      if (selectedService.id === "ai") {
        response = await _adminAPI.saveAIConfig({
          apiKey: configValues.apiKey as string,
          baseUrl: configValues.baseUrl as string,
          model: configValues.model as string,
          maxTokens: configValues.maxTokens as number,
          temperature: configValues.temperature as number,
        });
      } else if (selectedService.id === "stripe") {
        response = await _adminAPI.saveStripeConfig({
          secretKey: configValues.secretKey as string,
          publishableKey: configValues.publishableKey as string,
          webhookSecret: configValues.webhookSecret as string,
          isLiveMode: configValues.isLiveMode as boolean,
        });
      } else {
        // External service
        response = await _adminAPI.saveExternalServiceConfig({
          serviceId: selectedService.id,
          endpoint: configValues.endpoint as string,
          isActive: configValues.isActive as boolean,
        });
      }

      if (response?.success) {
        Alert.alert("Success", "Configuration saved successfully");
        closeServiceConfig();
        void loadConfigurations();
        logger.info("Configuration saved", { serviceId: selectedService.id });
      } else {
        throw new Error(response?.message || "Failed to save configuration");
      }
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : new Error("Failed to save configuration"),
        {
          component: "AdminConfigScreen",
          action: "saveConfiguration",
          metadata: { serviceId: selectedService?.id },
        },
      );
      Alert.alert("Error", "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  }, [selectedService, configValues, closeServiceConfig]);

  const renderConfigField = useCallback(
    (field: ConfigField) => {
      const value = configValues[field.key];

      switch (field.type) {
        case "boolean":
          return (
            <View key={field.key} style={styles.fieldContainer}>
              <View style={styles.switchContainer}>
                <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
                  {field.label}
                </Text>
                <Switch
                  value={value as boolean}
                  onValueChange={(val) => updateConfigValue(field.key, val)}
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primary,
                  }}
                  thumbColor={value ? theme.colors.surface : theme.colors.border}
                />
              </View>
              {field.description ? (
                <Text style={[styles.fieldDescription, { color: theme.colors.onMuted }]}>
                  {field.description}
                </Text>
              ) : null}
            </View>
          );

        case "password":
          return (
            <View key={field.key} style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
                {field.label}
                {field.required ? <Text style={{ color: theme.colors.danger }}> *</Text> : null}
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.onSurface,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={field.masked && value ? "••••••••" : (value as string)}
                onChangeText={(text) => updateConfigValue(field.key, text)}
                placeholder={field.placeholder}
                placeholderTextColor={theme.colors.onMuted}
                secureTextEntry={false}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {field.description ? (
                <Text style={[styles.fieldDescription, { color: theme.colors.onMuted }]}>
                  {field.description}
                </Text>
              ) : null}
            </View>
          );

        case "number":
          return (
            <View key={field.key} style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
                {field.label}
                {field.required ? <Text style={{ color: theme.colors.danger }}> *</Text> : null}
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.onSurface,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={String(value ?? "")}
                onChangeText={(text) => {
                  const numValue = parseFloat(text);
                  if (!isNaN(numValue)) {
                    updateConfigValue(field.key, numValue);
                  } else if (text === "") {
                    updateConfigValue(field.key, "");
                  }
                }}
                placeholder={field.placeholder}
                placeholderTextColor={theme.colors.onMuted}
                keyboardType="numeric"
              />
              {field.description ? (
                <Text style={[styles.fieldDescription, { color: theme.colors.onMuted }]}>
                  {field.description}
                </Text>
              ) : null}
            </View>
          );

        default:
          return (
            <View key={field.key} style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
                {field.label}
                {field.required ? <Text style={{ color: theme.colors.danger }}> *</Text> : null}
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.onSurface,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={String(value ?? "")}
                onChangeText={(text) => updateConfigValue(field.key, text)}
                placeholder={field.placeholder}
                placeholderTextColor={theme.colors.onMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType={field.type === "url" ? "url" : "default"}
              />
              {field.description ? (
                <Text style={[styles.fieldDescription, { color: theme.colors.onMuted }]}>
                  {field.description}
                </Text>
              ) : null}
            </View>
          );
      }
    },
    [configValues, theme, styles, updateConfigValue],
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
            Loading configurations...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          testID="AdminConfigScreen-button-back"
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          API Configuration
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Services List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[styles.serviceCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => openServiceConfig(service)}
            accessibilityRole="button"
            accessibilityLabel={`Configure ${service.name}`}
          >
            <View style={styles.serviceHeader}>
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: `${service.color}20`,
                  },
                ]}
              >
                <Ionicons name={service.icon as any} size={24} color={service.color} />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={[styles.serviceName, { color: theme.colors.onSurface }]}>
                  {service.name}
                </Text>
                <Text style={[styles.serviceDescription, { color: theme.colors.onMuted }]}>
                  {service.description}
                </Text>
              </View>
            </View>
            <View style={styles.serviceFooter}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: service.isConfigured
                      ? theme.colors.success
                      : theme.colors.warning,
                  },
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {service.isConfigured ? "Configured" : "Not Configured"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.onMuted} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Configuration Modal */}
      <Modal
        visible={selectedService !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeServiceConfig}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity
              onPress={closeServiceConfig}
              accessibilityLabel="Close configuration"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              {selectedService?.name}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalScrollContent}>
            {selectedService?.fields.map((field) => renderConfigField(field))}
          </ScrollView>

          <View style={[styles.modalFooter, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: theme.colors.border }]}
              onPress={closeServiceConfig}
              accessibilityRole="button"
            >
              <Text style={[styles.buttonText, { color: theme.colors.onSurface }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: saving ? 0.6 : 1,
                },
              ]}
              onPress={saveConfiguration}
              disabled={saving}
              accessibilityRole="button"
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.buttonText}>Save Configuration</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.body.size,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      marginRight: theme.spacing.md,
    },
    headerTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.lg,
    },
    serviceCard: {
      borderRadius: theme.radii.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      ...theme.shadows.elevation2,
    },
    serviceHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: theme.radii.full,
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.md,
    },
    serviceInfo: {
      flex: 1,
    },
    serviceName: {
      fontSize: theme.typography.h3.size,
      fontWeight: theme.typography.h3.weight,
      marginBottom: theme.spacing.xs,
    },
    serviceDescription: {
      fontSize: theme.typography.body.size * 0.875,
    },
    serviceFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.sm,
    },
    statusBadgeText: {
      color: "white",
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.body.weight,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
    },
    modalContent: {
      flex: 1,
    },
    modalScrollContent: {
      padding: theme.spacing.lg,
    },
    fieldContainer: {
      marginBottom: theme.spacing.lg,
    },
    fieldLabel: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.body.weight,
      marginBottom: theme.spacing.xs,
    },
    fieldDescription: {
      fontSize: theme.typography.body.size * 0.875,
      marginTop: theme.spacing.xs,
    },
    textInput: {
      borderWidth: 1,
      borderRadius: theme.radii.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.body.size,
    },
    switchContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    modalFooter: {
      flexDirection: "row",
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radii.md,
      alignItems: "center",
      justifyContent: "center",
    },
    saveButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radii.md,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      color: "white",
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.body.weight,
    },
  });

