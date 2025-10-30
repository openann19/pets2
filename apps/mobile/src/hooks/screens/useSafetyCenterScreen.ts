/**
 * useSafetyCenterScreen Hook
 * Manages Safety Center screen state and interactions
 */
import { useTheme } from '@mobile/theme';
import { useNavigation } from '@react-navigation/native';
import { useSafetyCenter } from '../domains/safety/useSafetyCenter';

interface SafetyOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
}

interface UseSafetyCenterScreenReturn {
  // From domain hook
  emergencyMode: boolean;
  safetyOptions: SafetyOption[];
  isReporting: boolean;
  toggleEmergencyMode: () => Promise<void>;
  handleSafetyOption: (option: SafetyOption) => void;
  contactSupport: () => void;
  viewSafetyGuidelines: () => void;

  // Screen-specific
  colors: any;
  handleGoBack: () => void;
}

export const useSafetyCenterScreen = (): UseSafetyCenterScreenReturn => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const {
    emergencyMode,
    safetyOptions,
    isReporting,
    toggleEmergencyMode,
    handleSafetyOption,
    contactSupport,
    viewSafetyGuidelines,
  } = useSafetyCenter();

  const handleGoBack = () => {
    navigation.goBack();
  };

  return {
    // From domain hook
    emergencyMode,
    safetyOptions,
    isReporting,
    toggleEmergencyMode,
    handleSafetyOption,
    contactSupport,
    viewSafetyGuidelines,

    // Screen-specific
    colors,
    handleGoBack,
  };
};
