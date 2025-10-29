import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppInfoCard } from '../components/help/AppInfoCard';
import { HelpContactCard } from '../components/help/HelpContactCard';
import { HelpOptionCard } from '../components/help/HelpOptionCard';
import { useHelpSupportData } from '../hooks/useHelpSupportData';

interface HelpSupportScreenProps {
  navigation: {
    goBack: () => void;
  };
}

function HelpSupportScreen({ navigation }: HelpSupportScreenProps): JSX.Element {
  const { helpOptions, animatedStyles, handleHelpOption, handleEmailSupport } =
    useHelpSupportData();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4facfe', '#00f2fe', '#4facfe']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            testID="HelpSupportScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              navigation.goBack();
            }}
          >
            <BlurView
              intensity={20}
              style={styles.backButtonBlur}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color="white"
              />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Actions */}
          <HelpContactCard onPress={handleEmailSupport} />

          {/* Help Options */}
          <Text style={styles.sectionTitle}>Help Topics</Text>

          {helpOptions.map((option, index) => (
            <HelpOptionCard
              key={option.id}
              option={option}
              animatedStyle={animatedStyles[index % animatedStyles.length]}
              onPress={handleHelpOption}
            />
          ))}

          {/* App Info */}
          <Text style={StyleSheet.flatten([styles.sectionTitle, { marginTop: 32 }])}>
            About PawfectMatch
          </Text>
          <AppInfoCard />
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
});

export default HelpSupportScreen;
