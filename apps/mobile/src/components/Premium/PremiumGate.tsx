/**
 * Premium Gate Component
 * Controls access to premium features with elegant upgrade prompts
 */

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PremiumGateProps {
  feature: string;
  description: string;
  icon: string;
  visible: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

const PremiumGate: React.FC<PremiumGateProps> = ({
  feature,
  description,
  icon,
  visible,
  onClose,
  onUpgrade,
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const handleUpgrade = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Navigate to premium screen
      (navigation as any).navigate?.('Premium');
    }
  };

  const handleClose = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <BlurView intensity={20} style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={handleClose}
          />

          <View style={[styles.modal, { backgroundColor: (colors as any).surface ?? colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {/* Content */}
            <View style={styles.content}>
              {/* Premium Icon */}
              <LinearGradient
                colors={['#FFD700', '#FFA000']}
                style={styles.iconContainer}
              >
                <Ionicons name="star" size={30} color="#fff" />
              </LinearGradient>

              {/* Feature Icon */}
              <View style={[styles.featureIcon, { backgroundColor: `${colors.primary}20` }]}>
                <Ionicons name={icon as any} size={40} color={colors.primary} />
              </View>

              {/* Text Content */}
              <Text style={[styles.title, { color: colors.text }]}>
                Unlock {feature}
              </Text>

              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {description}
              </Text>

              {/* Premium Features List */}
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                    Unlimited access to all features
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                    Priority customer support
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                    Advanced AI matching
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={handleUpgrade}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#FF6B6B', '#FF8E8E']}
                    style={styles.upgradeButtonGradient}
                  >
                    <Ionicons name="star" size={20} color="#fff" />
                    <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.laterButton, { backgroundColor: colors.background }]}
                  onPress={handleClose}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.laterButtonText, { color: colors.textSecondary }]}>
                    Maybe Later
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

// Hook for easy premium gate usage
export const usePremiumGate = (): {
  showPremiumGate: (config: { feature: string; description: string; icon?: string }) => void;
  hidePremiumGate: () => void;
  PremiumGateComponent: React.FC;
} => {
  const [gateConfig, setGateConfig] = React.useState<{
    visible: boolean;
    feature: string;
    description: string;
    icon: string;
  }>({
    visible: false,
    feature: '',
    description: '',
    icon: 'star',
  });

  const showPremiumGate = (config: { feature: string; description: string; icon?: string }): void => {
    setGateConfig(prev => ({
      ...prev,
      visible: true,
      feature: config.feature,
      description: config.description,
      icon: config.icon ?? 'star',
    }));
  };

  const hidePremiumGate = (): void => {
    setGateConfig(prev => ({ ...prev, visible: false }));
  };

  const PremiumGateComponent: React.FC = () => (
    <PremiumGate
      visible={gateConfig.visible}
      feature={gateConfig.feature}
      description={gateConfig.description}
      icon={gateConfig.icon}
      onClose={hidePremiumGate}
    />
  );

  return {
    showPremiumGate,
    hidePremiumGate,
    PremiumGateComponent,
  };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    width: SCREEN_WIDTH - 40,
    maxWidth: 400,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 0,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  content: {
    padding: 20,
    paddingTop: 0,
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  featuresList: {
    width: '100%',
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  upgradeButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  laterButton: {
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  laterButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PremiumGate;
