import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

interface SafetyCenterScreenProps {
  navigation: {
    goBack: () => void;
  };
}

interface SafetyOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
}

function SafetyCenterScreen({ navigation }: SafetyCenterScreenProps): JSX.Element {
  const { colors: _colors } = useTheme();
  const [emergencyMode, setEmergencyMode] = useState(false);

  const safetyOptions: SafetyOption[] = [
    {
      id: 'report',
      title: 'Report User',
      description: 'Report inappropriate behavior or content',
      icon: 'flag-outline',
      color: '#EF4444',
      action: () => {
        Alert.alert('Report User', 'This feature is coming soon. Please contact support for urgent issues.');
      },
    },
    {
      id: 'block',
      title: 'Block & Report',
      description: 'Block a user and report their behavior',
      icon: 'person-remove-outline',
      color: '#F59E0B',
      action: () => {
        navigation.goBack(); // Navigate back to profile where blocking is handled
      },
    },
    {
      id: 'privacy',
      title: 'Privacy Settings',
      description: 'Control who can see your profile and contact you',
      icon: 'lock-closed-outline',
      color: '#10B981',
      action: () => {
        Alert.alert('Privacy Settings', 'Navigate to Privacy Settings screen (coming soon)');
      },
    },
    {
      id: 'emergency',
      title: 'Emergency Contacts',
      description: 'Set up emergency contacts for safety',
      icon: 'call-outline',
      color: '#8B5CF6',
      action: () => {
        Alert.alert('Emergency Contacts', 'Emergency contact setup coming soon');
      },
    },
    {
      id: 'safety-tips',
      title: 'Safety Tips',
      description: 'Learn about online safety and best practices',
      icon: 'shield-checkmark-outline',
      color: '#06B6D4',
      action: () => {
        Alert.alert('Safety Tips', 'Safety tips and guidelines will be available soon');
      },
    },
  ];

  const handleEmergencyMode = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => { });
    Alert.alert(
      emergencyMode ? 'Disable Emergency Mode' : 'Enable Emergency Mode',
      emergencyMode
        ? 'This will restore normal app functionality.'
        : 'Emergency mode will limit interactions and enhance safety features.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: emergencyMode ? 'Disable' : 'Enable',
          style: emergencyMode ? 'default' : 'destructive',
          onPress: () => {
            setEmergencyMode(!emergencyMode);
            Alert.alert(
              'Emergency Mode',
              emergencyMode ? 'Emergency mode disabled' : 'Emergency mode enabled. Stay safe!'
            );
          },
        },
      ]
    );
  }, [emergencyMode]);

  const handleSafetyOption = useCallback((option: SafetyOption) => {
    Haptics.selectionAsync().catch(() => { });
    option.action();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e3c72', '#2a5298', '#3b82f6']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
              navigation.goBack();
            }}
          >
            <BlurView intensity={20} style={styles.backButtonBlur}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Safety Center</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Emergency Mode Banner */}
        <BlurView intensity={15} style={styles.emergencyBanner}>
          <View style={styles.emergencyContent}>
            <Ionicons
              name={emergencyMode ? "shield-checkmark" : "warning-outline"}
              size={24}
              color={emergencyMode ? "#10B981" : "#EF4444"}
            />
            <View style={styles.emergencyText}>
              <Text style={styles.emergencyTitle}>
                {emergencyMode ? 'Emergency Mode Active' : 'Emergency Mode Available'}
              </Text>
              <Text style={styles.emergencySubtitle}>
                {emergencyMode
                  ? 'Enhanced safety features are enabled'
                  : 'Activate for additional safety measures'
                }
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.emergencyButton, { backgroundColor: emergencyMode ? '#10B981' : '#EF4444' }]}
              onPress={handleEmergencyMode}
            >
              <Text style={styles.emergencyButtonText}>
                {emergencyMode ? 'Active' : 'Activate'}
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* Safety Options */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Safety Tools</Text>

          {safetyOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={() => { handleSafetyOption(option); }}
            >
              <BlurView intensity={20} style={styles.optionBlur}>
                <View style={styles.optionContent}>
                  <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                    <Ionicons name={option.icon} size={24} color="white" />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
                </View>
              </BlurView>
            </TouchableOpacity>
          ))}

          {/* Quick Actions */}
          <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Quick Actions</Text>

          <TouchableOpacity style={styles.quickActionCard}>
            <BlurView intensity={20} style={styles.quickActionBlur}>
              <View style={styles.quickActionContent}>
                <Ionicons name="help-buoy-outline" size={24} color="#3B82F6" />
                <View style={styles.quickActionText}>
                  <Text style={styles.quickActionTitle}>Contact Support</Text>
                  <Text style={styles.quickActionDescription}>Get help with safety concerns</Text>
                </View>
                <Ionicons name="open-outline" size={20} color="rgba(255,255,255,0.6)" />
              </View>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard}>
            <BlurView intensity={20} style={styles.quickActionBlur}>
              <View style={styles.quickActionContent}>
                <Ionicons name="document-text-outline" size={24} color="#10B981" />
                <View style={styles.quickActionText}>
                  <Text style={styles.quickActionTitle}>Safety Guidelines</Text>
                  <Text style={styles.quickActionDescription}>Read our community guidelines</Text>
                </View>
                <Ionicons name="open-outline" size={20} color="rgba(255,255,255,0.6)" />
              </View>
            </BlurView>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  emergencyBanner: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  emergencyText: {
    flex: 1,
    marginLeft: 12,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  emergencySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  emergencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  optionCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionBlur: {
    padding: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  quickActionCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionBlur: {
    padding: 16,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    flex: 1,
    marginLeft: 16,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  quickActionDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
});

export default SafetyCenterScreen;
