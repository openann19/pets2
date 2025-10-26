/**
 * useModerationToolsScreen Hook
 * Manages Moderation Tools screen state and interactions
 */
import { useNavigation } from "@react-navigation/native";
import { useModerationTools } from "../domains/safety/useModerationTools";

interface UseModerationToolsScreenReturn {
  // From domain hook
  moderationTools: any[];
  moderationStats: any;
  isRefreshing: boolean;
  handleModerationTool: (tool: any) => void;
  refreshStats: () => Promise<void>;

  // Screen-specific
  handleGoBack: () => void;
}

export const useModerationToolsScreen = (): UseModerationToolsScreenReturn => {
  const navigation = useNavigation();

  const {
    moderationTools,
    moderationStats,
    isRefreshing,
    handleModerationTool,
    refreshStats,
  } = useModerationTools();

  const handleGoBack = () => {
    navigation.goBack();
  };

  return {
    // From domain hook
    moderationTools,
    moderationStats,
    isRefreshing,
    handleModerationTool,
    refreshStats,

    // Screen-specific
    handleGoBack,
  };
};
