/**
 * Navigation Types for Mobile App
 * Comprehensive type definitions for all navigation screens
 */

import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ReactNode } from "react";

// Root Stack Navigator Types
import VerificationCenterScreen from '../screens/VerificationCenterScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  Main: undefined;
  Chat: { matchId: string; petName: string };
  Profile: { userId?: string };
  PetProfile: { petId: string };
  Swipe: undefined;
  Matches: undefined;
  Map: undefined;
  Home: undefined;
  Settings: undefined;
  Community: undefined;
  MyPets: undefined;
  CreatePet: undefined;
  AdoptionManager: undefined;
  Premium: undefined;
  PremiumSuccess: { sessionId?: string };
  PremiumCancel: undefined;
  Subscription: undefined;
  AIBio: undefined;
  AIPhotoAnalyzer: undefined;
  AICompatibility: { petAId?: string; petBId?: string };
  MemoryWeave: undefined | {
    matchId: string;
    petName: string;
    memories?: unknown[];
  };
  ARScentTrails:
    | undefined
    | {
        initialLocation?: {
          latitude: number;
          longitude: number;
        } | null;
      };
  AdoptionApplication: { petId: string; petName: string };
  PetProfileSetup: undefined;
  ManageSubscription: undefined;
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminAnalytics: undefined;
  AdminBilling: undefined;
  AdminSecurity: undefined;
  MainTabs: undefined;
  SubscriptionManager: undefined;
  SubscriptionSuccess: { sessionId?: string };
  PrivacySettings: undefined;
  BlockedUsers: undefined;
  SafetyCenter: undefined;
  VerificationCenter: undefined;
  NotificationPreferences: undefined;
  HelpSupport: undefined;
  AboutTermsPrivacy: undefined;
  DeactivateAccount: undefined;
  AdvancedFilters: undefined;
  ModerationTools: undefined;
  EditProfile: undefined;
  CreateListing: { petId?: string };
  AdminChats: undefined;
  AdminUploads: undefined;
  AdminVerifications: undefined;
  AdminServices: undefined;
  GoLive: undefined;
  LiveViewer: { streamId: string };
  LiveBrowse: undefined;
  UIDemo: undefined;
  ComponentTest: undefined;
  NewComponentsTest: undefined;
  MigrationExample: undefined;
  PremiumDemo: undefined;
  [key: string]: undefined | object;
};

// Tab Navigator Types
export type TabParamList = {
  Home: undefined;
  Swipe: undefined;
  Matches: undefined;
  Map: undefined;
  Profile: undefined;
  AdoptionManager: undefined;
  Premium: undefined;
  BreedSelection: { onBreedSelected: (selectedBreeds: string[]) => void };
};

// Onboarding Stack Types
export type OnboardingStackParamList = {
  Welcome: undefined;
  UserIntent: undefined;
  PetProfileSetup: { userIntent: string };
  PreferencesSetup: { userIntent: string };
  [key: string]: undefined | { userIntent: string };
};

// Admin Stack Types
export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminAnalytics: undefined;
  AdminBilling: undefined;
  AdminSecurity: undefined;
  AdminChats: undefined;
  AdminUploads: undefined;
  AdminVerifications: undefined;
  AdminServices: undefined;
};

// Premium Stack Types
export type PremiumStackParamList = {
  Premium: undefined;
  Subscription: undefined;
  ManageSubscription: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = BottomTabScreenProps<
  TabParamList,
  T
>;

export type OnboardingScreenProps<T extends keyof OnboardingStackParamList> =
  NativeStackScreenProps<OnboardingStackParamList, T>;

export type AdminScreenProps<T extends keyof AdminStackParamList> =
  NativeStackScreenProps<AdminStackParamList, T>;

export type PremiumScreenProps<T extends keyof PremiumStackParamList> =
  NativeStackScreenProps<PremiumStackParamList, T>;

// Navigation Hook Types
export interface NavigationProp {
  navigate: (screen: keyof RootStackParamList, params?: unknown) => void;
  goBack: () => void;
  reset: (state: unknown) => void;
  canGoBack: () => boolean;
  dispatch: (action: unknown) => void;
  setParams: (params: unknown) => void;
  addListener: (event: string, callback: (data: unknown) => void) => () => void;
  isFocused: () => boolean;
}

// Route Types
export interface RouteProp {
  key: string;
  name: keyof RootStackParamList;
  params?: unknown;
}

// Generic Navigation Props for Components
export interface NavigationProps {
  navigation: NavigationProp;
  route?: RouteProp;
}

// Screen Component Props
export interface ScreenProps {
  navigation: NavigationProp;
  route?: RouteProp;
}

// Admin Screen Props Interface
export interface IAdminScreenProps {
  navigation: NavigationProp;
  route?: RouteProp;
}

// AI Screen Props
export interface AIScreenProps {
  navigation: NavigationProp;
  route?: RouteProp;
}

// Default Navigation Props for Unknown Navigation
export interface UnknownNavigationProps {
  navigation: unknown;
  route?: unknown;
}

// Utility Types
export type ScreenName = keyof RootStackParamList;
export type TabName = keyof TabParamList;
export type AdminScreenName = keyof AdminStackParamList;
export type PremiumScreenName = keyof PremiumStackParamList;

// Navigation State Types
export interface NavigationState {
  index: number;
  routes: Array<{
    key: string;
    name: string;
    params?: unknown;
  }>;
}

// Navigation Action Types
export interface NavigationAction {
  type: string;
  payload?: unknown;
}

// Navigation Listener Types
export interface NavigationListener {
  beforeRemove?: (e: unknown) => void;
  focus?: () => void;
  blur?: () => void;
  state?: (e: unknown) => void;
}

// Screen Options Types
export interface ScreenOptions {
  title?: string;
  headerShown?: boolean;
  headerTitle?: string;
  headerLeft?: () => React.ReactNode;
  headerRight?: () => React.ReactNode;
  headerStyle?: unknown;
  headerTitleStyle?: unknown;
  tabBarIcon?: (props: {
    focused: boolean;
    color: string;
    size: number;
  }) => React.ReactNode;
  tabBarLabel?: string;
  tabBarStyle?: unknown;
  tabBarActiveTintColor?: string;
  tabBarInactiveTintColor?: string;
}

// Navigation Config Types
export interface NavigationConfig {
  initialRouteName?: keyof RootStackParamList;
  screenOptions?: ScreenOptions;
  headerMode?: "float" | "screen" | "none";
  gestureEnabled?: boolean;
  animationEnabled?: boolean;
}

// Route Params Types
export interface RouteParams {
  [key: string]: unknown;
}

// Navigation Events
export type NavigationEvent =
  | "focus"
  | "blur"
  | "beforeRemove"
  | "state"
  | "transitionStart"
  | "transitionEnd";

// Navigation Event Data
export interface NavigationEventData {
  type: NavigationEvent;
  data?: unknown;
  target?: string;
  canPreventDefault?: boolean;
  defaultPrevented?: boolean;
}

// Navigation Event Listener
export type NavigationEventListener = (data: NavigationEventData) => void;

// Navigation Event Subscription
export interface NavigationEventSubscription {
  remove: () => void;
}

// Navigation Event Emitter
export interface NavigationEventEmitter {
  addListener: (
    event: NavigationEvent,
    listener: NavigationEventListener,
  ) => NavigationEventSubscription;
  removeListener: (
    event: NavigationEvent,
    listener: NavigationEventListener,
  ) => void;
  emit: (event: NavigationEvent, data?: unknown) => void;
}

// Navigation Ref Types
export interface NavigationRef {
  current: NavigationProp | null;
}

// Navigation Container Props
export interface NavigationContainerProps {
  children: React.ReactNode;
  onStateChange?: (state: NavigationState) => void;
  onReady?: () => void;
  fallback?: React.ReactNode;
  theme?: unknown;
  linking?: unknown;
  independent?: boolean;
}

// Navigation Provider Props
export interface NavigationProviderProps {
  children: React.ReactNode;
  navigation?: NavigationProp;
}

// Navigation Context Types
export interface NavigationContextType {
  navigation: NavigationProp;
  route: RouteProp;
  setNavigation: (navigation: NavigationProp) => void;
  setRoute: (route: RouteProp) => void;
}

// Navigation Hook Return Types
export interface UseNavigationReturn {
  navigation: NavigationProp;
  route: RouteProp;
  navigate: (screen: keyof RootStackParamList, params?: unknown) => void;
  goBack: () => void;
  canGoBack: () => boolean;
}

// Navigation State Hook Return Types
export interface UseNavigationStateReturn {
  state: NavigationState;
  isFocused: boolean;
  isReady: boolean;
}

// Navigation Focus Hook Return Types
export interface UseFocusEffectReturn {
  isFocused: boolean;
  addListener: (callback: () => void) => () => void;
}

// Navigation Route Hook Return Types
export interface UseRouteReturn {
  route: RouteProp;
  params: unknown;
  setParams: (params: unknown) => void;
}

// Navigation Theme Types
export interface NavigationTheme {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
}

// Navigation Linking Types
export interface NavigationLinking {
  prefixes: string[];
  config: {
    screens: {
      [key: string]: {
        path: string;
        parse?: (url: string) => unknown;
        stringify?: (params: unknown) => string;
      };
    };
  };
}

// Navigation Deep Linking Types
export interface DeepLinkConfig {
  screens: {
    [key: string]: {
      path: string;
      parse?: (url: string) => Record<string, unknown>;
      stringify?: (params: unknown) => string;
    };
  };
}

// Navigation Gesture Types
export interface NavigationGesture {
  enabled: boolean;
  direction: "horizontal" | "vertical";
  distance: number;
  velocity: number;
}

// Navigation Animation Types
export interface NavigationAnimation {
  enabled: boolean;
  duration: number;
  type: "slide" | "fade" | "scale" | "none";
  direction: "left" | "right" | "up" | "down";
}

// Navigation Header Types
export interface NavigationHeader {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  center?: React.ReactNode;
  style?: unknown;
  titleStyle?: unknown;
  subtitleStyle?: unknown;
}

// Navigation Tab Bar Types
export interface NavigationTabBar {
  visible: boolean;
  style?: unknown;
  activeTintColor?: string;
  inactiveTintColor?: string;
  showLabel?: boolean;
  labelStyle?: unknown;
  iconStyle?: unknown;
  tabStyle?: unknown;
}

// Navigation Drawer Types
export interface NavigationDrawer {
  open: boolean;
  width: number;
  position: "left" | "right";
  style?: unknown;
  overlayStyle?: unknown;
  contentStyle?: unknown;
}

// Navigation Modal Types
export interface NavigationModal {
  visible: boolean;
  transparent: boolean;
  animationType: "slide" | "fade" | "none";
  presentationStyle:
    | "fullScreen"
    | "pageSheet"
    | "formSheet"
    | "overFullScreen";
  style?: unknown;
  contentStyle?: unknown;
}

// Navigation Stack Types
export interface NavigationStack {
  type: "stack";
  options?: ScreenOptions;
  children: React.ReactNode;
}

// Navigation Tab Types
export interface NavigationTab {
  type: "tab";
  options?: ScreenOptions;
  children: React.ReactNode;
}

// Navigation Drawer Types
export interface NavigationDrawerNavigator {
  type: "drawer";
  options?: ScreenOptions;
  children: React.ReactNode;
}

// Navigation Modal Types
export interface NavigationModalNavigator {
  type: "modal";
  options?: ScreenOptions;
  children: React.ReactNode;
}

// Navigation Component Types
export type NavigationComponent =
  | NavigationStack
  | NavigationTab
  | NavigationDrawerNavigator
  | NavigationModalNavigator;

// Navigation Screen Types
export interface NavigationScreen {
  name: string;
  component: React.ComponentType<unknown>;
  options?: ScreenOptions;
  initialParams?: unknown;
}

// Navigation Group Types
export interface NavigationGroup {
  name: string;
  screens: NavigationScreen[];
  options?: ScreenOptions;
}

// Navigation Tree Types
export interface NavigationTree {
  type: "tree";
  children: (NavigationScreen | NavigationGroup)[];
}

// Navigation Schema Types
export interface NavigationSchema {
  type: "schema";
  groups: NavigationGroup[];
  screens: NavigationScreen[];
}

// Navigation Config Schema Types
export interface NavigationConfigSchema {
  type: "config";
  initialRouteName: string;
  screenOptions: ScreenOptions;
  groups: NavigationGroup[];
  screens: NavigationScreen[];
}

// Navigation Builder Types
export interface NavigationBuilder {
  build: () => NavigationComponent;
  addScreen: (screen: NavigationScreen) => NavigationBuilder;
  addGroup: (group: NavigationGroup) => NavigationBuilder;
  setOptions: (options: ScreenOptions) => NavigationBuilder;
}

// Navigation Factory Types
export interface NavigationFactory {
  createStack: (screens: NavigationScreen[]) => NavigationComponent;
  createTab: (screens: NavigationScreen[]) => NavigationComponent;
  createDrawer: (screens: NavigationScreen[]) => NavigationComponent;
  createModal: (screens: NavigationScreen[]) => NavigationComponent;
}

// Navigation Registry Types
export interface NavigationRegistry {
  register: (name: string, component: React.ComponentType<unknown>) => void;
  unregister: (name: string) => void;
  get: (name: string) => React.ComponentType<unknown> | undefined;
  getAll: () => Map<string, React.ComponentType<unknown>>;
  clear: () => void;
}

// Navigation Manager Types
export interface NavigationManager {
  navigate: (screen: string, params?: unknown) => void;
  goBack: () => void;
  reset: (state: unknown) => void;
  canGoBack: () => boolean;
  getCurrentRoute: () => string;
  getCurrentParams: () => unknown;
  setParams: (params: unknown) => void;
  addListener: (event: string, callback: (data: unknown) => void) => () => void;
  removeListener: (event: string, callback: (data: unknown) => void) => void;
  emit: (event: string, data?: unknown) => void;
}

// Navigation Service Types
export interface NavigationService {
  manager: NavigationManager;
  registry: NavigationRegistry;
  factory: NavigationFactory;
  builder: NavigationBuilder;
  config: NavigationConfigSchema;
  theme: NavigationTheme;
  linking: NavigationLinking;
  gestures: NavigationGesture;
  animations: NavigationAnimation;
  headers: NavigationHeader;
  tabBars: NavigationTabBar;
  drawers: NavigationDrawer;
  modals: NavigationModal;
}

// Navigation Provider Context Types
export interface NavigationProviderContext {
  service: NavigationService;
  navigation: NavigationProp;
  route: RouteProp;
  theme: NavigationTheme;
  config: NavigationConfigSchema;
  linking: NavigationLinking;
  gestures: NavigationGesture;
  animations: NavigationAnimation;
}

// Navigation Hook Context Types
export interface NavigationHookContext {
  useNavigation: () => NavigationProp;
  useRoute: () => RouteProp;
  useNavigationState: () => NavigationState;
  useFocusEffect: () => UseFocusEffectReturn;
  useIsFocused: () => boolean;
  useIsReady: () => boolean;
}

// Navigation Utility Types
export interface NavigationUtils {
  createNavigationRef: () => NavigationRef;
  createNavigationState: () => NavigationState;
  createNavigationAction: (type: string, payload?: unknown) => NavigationAction;
  createNavigationEvent: (
    type: NavigationEvent,
    data?: unknown,
  ) => NavigationEventData;
  createNavigationListener: (
    callback: NavigationEventListener,
  ) => NavigationEventListener;
  createNavigationSubscription: (
    remove: () => void,
  ) => NavigationEventSubscription;
}

// Navigation Error Types
export interface NavigationError {
  code: string;
  message: string;
  stack?: string;
  cause?: Error;
}

// Navigation Error Handler Types
export interface NavigationErrorHandler {
  handle: (error: NavigationError) => void;
  report: (error: NavigationError) => void;
  recover: (error: NavigationError) => boolean;
}

// Navigation Performance Types
export interface NavigationPerformance {
  measure: (name: string, fn: () => void) => void;
  mark: (name: string) => void;
  measureMark: (startMark: string, endMark: string) => void;
  getMetrics: () => unknown;
  clearMetrics: () => void;
}

// Navigation Analytics Types
export interface NavigationAnalytics {
  track: (event: string, properties?: unknown) => void;
  identify: (userId: string, traits?: unknown) => void;
  page: (name: string, properties?: unknown) => void;
  group: (groupId: string, traits?: unknown) => void;
  alias: (userId: string) => void;
  reset: () => void;
}

// Navigation Security Types
export interface NavigationSecurity {
  encrypt: (data: string) => string;
  decrypt: (data: string) => string;
  hash: (data: string) => string;
  verify: (data: string, hash: string) => boolean;
  generateToken: () => string;
  validateToken: (token: string) => boolean;
}

// Navigation Cache Types
export interface NavigationCache {
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
  delete: (key: string) => void;
  clear: () => void;
  has: (key: string) => boolean;
  keys: () => string[];
  values: () => unknown[];
  entries: () => [string, unknown][];
}

// Navigation Storage Types
export interface NavigationStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  getAllKeys: () => Promise<string[]>;
  multiGet: (keys: string[]) => Promise<[string, string | null][]>;
  multiSet: (keyValuePairs: [string, string][]) => Promise<void>;
  multiRemove: (keys: string[]) => Promise<void>;
}

// Navigation Network Types
export interface NavigationNetwork {
  isConnected: boolean;
  type: "wifi" | "cellular" | "ethernet" | "unknown";
  isInternetReachable: boolean;
  addListener: (callback: (state: unknown) => void) => () => void;
  removeListener: (callback: (state: unknown) => void) => void;
}

// Navigation Device Types
export interface NavigationDevice {
  platform: "ios" | "android" | "web" | "windows" | "macos";
  version: string;
  model: string;
  brand: string;
  isTablet: boolean;
  isEmulator: boolean;
  hasNotch: boolean;
  hasHomeIndicator: boolean;
  screenWidth: number;
  screenHeight: number;
  screenScale: number;
  statusBarHeight: number;
  navigationBarHeight: number;
}

// Navigation Environment Types
export interface NavigationEnvironment {
  isDevelopment: boolean;
  isProduction: boolean;
  isTesting: boolean;
  isDebugging: boolean;
  version: string;
  buildNumber: string;
  bundleId: string;
  appName: string;
  appVersion: string;
  deviceId: string;
  userId?: string;
  sessionId: string;
  timestamp: string;
}

// Navigation Context Types
export interface NavigationContext {
  service: NavigationService;
  provider: NavigationProviderContext;
  hooks: NavigationHookContext;
  utils: NavigationUtils;
  errors: NavigationErrorHandler;
  performance: NavigationPerformance;
  analytics: NavigationAnalytics;
  security: NavigationSecurity;
  cache: NavigationCache;
  storage: NavigationStorage;
  network: NavigationNetwork;
  device: NavigationDevice;
  environment: NavigationEnvironment;
}
