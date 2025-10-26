/**
 * useBlockedUsersScreen Hook
 * Manages Blocked Users screen state and interactions
 */
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../contexts/ThemeContext";
import { useBlockedUsers } from "../domains/safety/useBlockedUsers";

interface UseBlockedUsersScreenReturn {
  // From domain hook
  blockedUsers: any[];
  isLoading: boolean;
  isRefreshing: boolean;
  totalBlocked: number;
  loadBlockedUsers: (refresh?: boolean) => Promise<void>;
  unblockUser: (userId: string, userName: string) => Promise<void>;
  refreshData: () => Promise<void>;

  // Screen-specific
  colors: any;
  handleGoBack: () => void;
}

export const useBlockedUsersScreen = (): UseBlockedUsersScreenReturn => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const {
    blockedUsers,
    isLoading,
    isRefreshing,
    totalBlocked,
    loadBlockedUsers,
    unblockUser,
    refreshData,
  } = useBlockedUsers();

  const handleGoBack = () => {
    navigation.goBack();
  };

  return {
    // From domain hook
    blockedUsers,
    isLoading,
    isRefreshing,
    totalBlocked,
    loadBlockedUsers,
    unblockUser,
    refreshData,

    // Screen-specific
    colors,
    handleGoBack,
  };
};
