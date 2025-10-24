/**
 * Navigation types for PawfectMatch Mobile App
 */

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
  Swipe: undefined;
  Matches: undefined;
  Chat: {
    matchId: string;
    petId: string;
    matchedPetId: string;
  };
  Profile: undefined;
  PetProfile: {
    petId: string;
  };
  EditPet: {
    petId?: string;
  };
  Settings: undefined;
  Premium: undefined;
  Camera: undefined;
  Map: undefined;
  VideoCall: {
    matchId: string;
    roomId: string;
  };
};

export type TabParamList = {
  Swipe: undefined;
  Matches: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: {
    token: string;
  };
};

// Navigation prop types
export type NavigationProp<T extends keyof RootStackParamList> = {
  navigate: (screen: T, params?: RootStackParamList[T]) => void;
  goBack: () => void;
  reset: (state: Record<string, unknown>) => void;
};

export type RouteProp<T extends keyof RootStackParamList> = {
  params: RootStackParamList[T];
};

// Screen component props
export type ScreenProps<T extends keyof RootStackParamList> = {
  navigation: NavigationProp<T>;
  route: RouteProp<T>;
};

// Tab navigation props
export type TabNavigationProp<T extends keyof TabParamList> = {
  navigate: (screen: T, params?: TabParamList[T]) => void;
  goBack: () => void;
};

export type TabRouteProp<T extends keyof TabParamList> = {
  params: TabParamList[T];
};

export type TabScreenProps<T extends keyof TabParamList> = {
  navigation: TabNavigationProp<T>;
  route: TabRouteProp<T>;
};
