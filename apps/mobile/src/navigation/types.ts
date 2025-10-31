/**
 * Navigation Types for Mobile App
 * Comprehensive type definitions for all navigation screens
 */

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type {
  NavigationAction,
  NavigationState,
  RouteProp as RNRouteProp,
  EventArg,
  NavigationContainerRef,
  ParamListBase,
  LinkingOptions,
  Theme,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ViewStyle, TextStyle } from 'react-native';

export type RootStackParamList = {
  Login: { redirectTo?: string; redirectParams?: unknown } | undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  Welcome: undefined;
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
  Stories: undefined;
  Leaderboard: undefined;
  MyPets: undefined;
  CreatePet: undefined;
  AdoptionManager: undefined;
  Premium: undefined;
  PremiumSuccess: { sessionId?: string };
  PremiumCancel: undefined;
  Subscription: undefined;
  SubscriptionManager: undefined;
  AIBio: undefined;
  AIPhotoAnalyzer: undefined;
  AICompatibility: { petAId?: string; petBId?: string };
  MemoryWeave: { matchId: string; petName: string; memories?: unknown[] } | undefined;
  ARScentTrails: { initialLocation?: { latitude: number; longitude: number } | null } | undefined;
  AdoptionApplication: { petId: string; petName: string };
  PetProfileSetup: undefined;
  ManageSubscription: undefined;
  WhoLikedYou: undefined;
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminAnalytics: undefined;
  AdminBilling: undefined;
  // Pet-First Enhanced Screens
  EnhancedPetProfile: { petId?: string; isNew?: boolean };
  PlaydateDiscovery: { petId: string };
  PackBuilder: { hostPetId: string; initialMatch?: unknown };
  PetFriendlyMap: { filter?: 'parks' | 'vets' | 'groomers' | 'all' };
  MeetupDetails: { meetupId: string };
  VenueDetails: { venueId: string };
  HealthPassport: { petId: string };
  LostPetAlert: { petId?: string };
  SafetyWelfare: { reportType?: 'incident' | 'rule_violation' | 'health_disclosure' };
  // Wireframe Screens (Development Only)
  WireframePlaydateDiscovery: { petId?: string };
  WireframeDemo: undefined;
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
  Referral: { code?: string } | undefined;
  IAPShop: undefined;
  CreateListing: { petId?: string };
  AdminChats: undefined;
  AdminUploads: undefined;
  AdminVerifications: undefined;
  AdminServices: undefined;
  AdminConfig: undefined;
  GoLive: undefined;
  LiveViewer: { streamId: string };
  LiveBrowse: undefined;
  UIDemo: undefined;
  ComponentTest: undefined;
  NewComponentsTest: undefined;
  MigrationExample: undefined;
  PremiumDemo: undefined;
  PreviewCode: undefined;
  DemoShowcase: undefined;
  MotionLab: undefined; // Development screen for testing animations
  [key: string]: undefined | object;
};

// Tab Navigator Types
export type TabParamList = {
  Home: undefined;
  Swipe: undefined;
  Pawfiles: undefined; // Pet-first replacement for generic "Pets"
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
  AnalyticsConfig: undefined;
  AdminBilling: undefined;
  AdminSecurity: undefined;
  AdminChats: undefined;
  AdminUploads: undefined;
  AdminVerifications: undefined;
  AdminServices: undefined;
  AdminConfig: undefined;
  AdminReports: undefined;
  AdminSupport: undefined;
};

// Premium Stack Types
export type PremiumStackParamList = {
  Premium: undefined;
  Subscription: undefined;
  ManageSubscription: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type TabScreenProps<T extends keyof TabParamList> = BottomTabScreenProps<TabParamList, T>;

export type OnboardingScreenProps<T extends keyof OnboardingStackParamList> =
  NativeStackScreenProps<OnboardingStackParamList, T>;

export type AdminScreenProps<T extends keyof AdminStackParamList> = NativeStackScreenProps<
  AdminStackParamList,
  T
>;

export type PremiumScreenProps<T extends keyof PremiumStackParamList> = NativeStackScreenProps<
  PremiumStackParamList,
  T
>;

// Navigation Hook Types
// Use React Navigation's NativeStackNavigationProp for proper typing
export type NavigationProp<RouteName extends keyof RootStackParamList = keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, RouteName>;

// Route Types - Use React Navigation's RouteProp
export type RouteProp<RouteName extends keyof RootStackParamList> = RNRouteProp<
  RootStackParamList,
  RouteName
>;

// Generic Navigation Props for Components
export interface NavigationProps<RouteName extends keyof RootStackParamList = keyof RootStackParamList> {
  navigation: NavigationProp<RouteName>;
  route?: RouteProp<RouteName>;
}

// Screen Component Props
export interface ScreenProps<RouteName extends keyof RootStackParamList = keyof RootStackParamList> {
  navigation: NavigationProp<RouteName>;
  route?: RouteProp<RouteName>;
}

// Admin Screen Props Interface
export interface IAdminScreenProps<RouteName extends keyof AdminStackParamList = keyof AdminStackParamList> {
  navigation: NativeStackNavigationProp<AdminStackParamList, RouteName>;
  route?: RNRouteProp<AdminStackParamList, RouteName>;
}

// AI Screen Props
export interface AIScreenProps<RouteName extends keyof RootStackParamList = keyof RootStackParamList> {
  navigation: NavigationProp<RouteName>;
  route?: RouteProp<RouteName>;
}

// Default Navigation Props for Unknown Navigation
export interface UnknownNavigationProps {
  navigation: NativeStackNavigationProp<ParamListBase>;
  route?: RNRouteProp<ParamListBase>;
}

// Utility Types
export type ScreenName = keyof RootStackParamList;
export type TabName = keyof TabParamList;
export type AdminScreenName = keyof AdminStackParamList;
export type PremiumScreenName = keyof PremiumStackParamList;

// Navigation State Types - Use React Navigation's NavigationState
export type NavigationStateType = NavigationState<RootStackParamList>;

// Navigation Action Types - Use React Navigation's NavigationAction
export type NavigationActionType = NavigationAction;

// Navigation Listener Types - Use EventArg for proper event typing
export interface NavigationListener {
  beforeRemove?: (e: EventArg<'beforeRemove', true, { action: NavigationAction }>) => void;
  focus?: () => void;
  blur?: () => void;
  state?: (e: EventArg<'state', false, NavigationState>) => void;
}

// Screen Options Types
export interface ScreenOptions {
  title?: string;
  headerShown?: boolean;
  headerTitle?: string;
  headerLeft?: () => React.ReactNode;
  headerRight?: () => React.ReactNode;
  headerStyle?: ViewStyle;
  headerTitleStyle?: TextStyle;
  tabBarIcon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode;
  tabBarLabel?: string;
  tabBarStyle?: ViewStyle;
  tabBarActiveTintColor?: string;
  tabBarInactiveTintColor?: string;
}

// Navigation Config Types
export interface NavigationConfig {
  initialRouteName?: keyof RootStackParamList;
  screenOptions?: ScreenOptions;
  headerMode?: 'float' | 'screen' | 'none';
  gestureEnabled?: boolean;
  animationEnabled?: boolean;
}

// Route Params Types
export interface RouteParams {
  [key: string]: unknown;
}

// Navigation Events
export type NavigationEvent =
  | 'focus'
  | 'blur'
  | 'beforeRemove'
  | 'state'
  | 'transitionStart'
  | 'transitionEnd';

// Navigation Event Data - Use EventArg for proper typing
export type NavigationEventData<T extends NavigationEvent = NavigationEvent> = EventArg<
  T,
  boolean,
  Record<string, unknown>
>;

// Navigation Event Listener
export type NavigationEventListener<T extends NavigationEvent = NavigationEvent> = (
  data: NavigationEventData<T>,
) => void;

// Navigation Event Subscription
export interface NavigationEventSubscription {
  remove: () => void;
}

// Navigation Event Emitter
export interface NavigationEventEmitter {
  addListener: <T extends NavigationEvent>(
    event: T,
    listener: NavigationEventListener<T>,
  ) => NavigationEventSubscription;
  removeListener: <T extends NavigationEvent>(
    event: T,
    listener: NavigationEventListener<T>,
  ) => void;
  emit: <T extends NavigationEvent>(event: T, data?: EventArg<T, boolean, unknown>) => void;
}

// Navigation Ref Types - Use NavigationContainerRef
export type NavigationRef = NavigationContainerRef<RootStackParamList> | null;

// Navigation Container Props
export interface NavigationContainerProps {
  children: React.ReactNode;
  onStateChange?: (state: NavigationState<RootStackParamList>) => void;
  onReady?: () => void;
  fallback?: React.ReactNode;
  theme?: Theme;
  linking?: LinkingOptions<RootStackParamList>;
  independent?: boolean;
}

// Navigation Provider Props
export interface NavigationProviderProps<RouteName extends keyof RootStackParamList = keyof RootStackParamList> {
  children: React.ReactNode;
  navigation?: NavigationProp<RouteName>;
}

// Navigation Context Types
export interface NavigationContextType<RouteName extends keyof RootStackParamList = keyof RootStackParamList> {
  navigation: NavigationProp<RouteName>;
  route: RouteProp<RouteName>;
  setNavigation: (navigation: NavigationProp<RouteName>) => void;
  setRoute: (route: RouteProp<RouteName>) => void;
}

// Navigation Hook Return Types
export interface UseNavigationReturn<RouteName extends keyof RootStackParamList = keyof RootStackParamList> {
  navigation: NavigationProp<RouteName>;
  route: RouteProp<RouteName>;
  navigate: <T extends keyof RootStackParamList>(
    screen: T,
    params?: RootStackParamList[T] extends object ? RootStackParamList[T] : undefined,
  ) => void;
  goBack: () => void;
  canGoBack: () => boolean;
}

// Navigation State Hook Return Types
export interface UseNavigationStateReturn {
  state: NavigationState<RootStackParamList>;
  isFocused: boolean;
  isReady: boolean;
}

// Navigation Focus Hook Return Types
export interface UseFocusEffectReturn {
  isFocused: boolean;
  addListener: (callback: () => void) => () => void;
}

// Navigation Route Hook Return Types
export interface UseRouteReturn<RouteName extends keyof RootStackParamList> {
  route: RouteProp<RouteName>;
  params: RootStackParamList[RouteName] extends object ? RootStackParamList[RouteName] : undefined;
  setParams: (
    params: RootStackParamList[RouteName] extends object
      ? Partial<RootStackParamList[RouteName]>
      : undefined,
  ) => void;
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

// Navigation Linking Types - Use LinkingOptions from React Navigation
export type NavigationLinking = LinkingOptions<RootStackParamList>;

// Navigation Deep Linking Types - Use LinkingOptions config
export type DeepLinkConfig = LinkingOptions<RootStackParamList>['config'];

// Navigation Gesture Types
export interface NavigationGesture {
  enabled: boolean;
  direction: 'horizontal' | 'vertical';
  distance: number;
  velocity: number;
}

// Navigation Animation Types
export interface NavigationAnimation {
  enabled: boolean;
  duration: number;
  type: 'slide' | 'fade' | 'scale' | 'none';
  direction: 'left' | 'right' | 'up' | 'down';
}

// Navigation Header Types
export interface NavigationHeader {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  center?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

// Navigation Tab Bar Types
export interface NavigationTabBar {
  visible: boolean;
  style?: ViewStyle;
  activeTintColor?: string;
  inactiveTintColor?: string;
  showLabel?: boolean;
  labelStyle?: TextStyle;
  iconStyle?: ViewStyle;
  tabStyle?: ViewStyle;
}

// Navigation Drawer Types
export interface NavigationDrawer {
  open: boolean;
  width: number;
  position: 'left' | 'right';
  style?: ViewStyle;
  overlayStyle?: ViewStyle;
  contentStyle?: ViewStyle;
}

// Navigation Modal Types
export interface NavigationModal {
  visible: boolean;
  transparent: boolean;
  animationType: 'slide' | 'fade' | 'none';
  presentationStyle: 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

// Navigation Stack Types
export interface NavigationStack {
  type: 'stack';
  options?: ScreenOptions;
  children: React.ReactNode;
}

// Navigation Tab Types
export interface NavigationTab {
  type: 'tab';
  options?: ScreenOptions;
  children: React.ReactNode;
}

// Navigation Drawer Types
export interface NavigationDrawerNavigator {
  type: 'drawer';
  options?: ScreenOptions;
  children: React.ReactNode;
}

// Navigation Modal Types
export interface NavigationModalNavigator {
  type: 'modal';
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
export interface NavigationScreen<RouteName extends keyof RootStackParamList = keyof RootStackParamList> {
  name: RouteName;
  component: React.ComponentType<RootStackScreenProps<RouteName>>;
  options?: ScreenOptions;
  initialParams?: RootStackParamList[RouteName] extends object ? RootStackParamList[RouteName] : undefined;
}

// Navigation Group Types
export interface NavigationGroup {
  name: string;
  screens: NavigationScreen[];
  options?: ScreenOptions;
}

// Navigation Tree Types
export interface NavigationTree {
  type: 'tree';
  children: (NavigationScreen | NavigationGroup)[];
}

// Navigation Schema Types
export interface NavigationSchema {
  type: 'schema';
  groups: NavigationGroup[];
  screens: NavigationScreen[];
}

// Navigation Config Schema Types
export interface NavigationConfigSchema {
  type: 'config';
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
  navigate: <T extends keyof RootStackParamList>(
    screen: T,
    params?: RootStackParamList[T] extends object ? RootStackParamList[T] : undefined,
  ) => void;
  goBack: () => void;
  reset: (state: NavigationState<RootStackParamList>) => void;
  canGoBack: () => boolean;
  getCurrentRoute: () => keyof RootStackParamList | undefined;
  getCurrentParams: () => RootStackParamList[keyof RootStackParamList] | undefined;
  setParams: <T extends keyof RootStackParamList>(
    params: T extends keyof RootStackParamList
      ? RootStackParamList[T] extends object
        ? Partial<RootStackParamList[T]>
        : undefined
      : undefined,
  ) => void;
  addListener: <T extends NavigationEvent>(
    event: T,
    callback: NavigationEventListener<T>,
  ) => () => void;
  removeListener: <T extends NavigationEvent>(
    event: T,
    callback: NavigationEventListener<T>,
  ) => void;
  emit: <T extends NavigationEvent>(event: T, data?: EventArg<T, boolean, unknown>) => void;
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
export interface NavigationProviderContext<RouteName extends keyof RootStackParamList = keyof RootStackParamList> {
  service: NavigationService;
  navigation: NavigationProp<RouteName>;
  route: RouteProp<RouteName>;
  theme: NavigationTheme;
  config: NavigationConfigSchema;
  linking: NavigationLinking;
  gestures: NavigationGesture;
  animations: NavigationAnimation;
}

// Navigation Hook Context Types
export interface NavigationHookContext {
  useNavigation: <RouteName extends keyof RootStackParamList = keyof RootStackParamList>() => NavigationProp<RouteName>;
  useRoute: <RouteName extends keyof RootStackParamList>() => RouteProp<RouteName>;
  useNavigationState: () => NavigationState<RootStackParamList>;
  useFocusEffect: () => UseFocusEffectReturn;
  useIsFocused: () => boolean;
  useIsReady: () => boolean;
}

// Navigation Utility Types
export interface NavigationUtils {
  createNavigationRef: () => NavigationContainerRef<RootStackParamList>;
  createNavigationState: () => NavigationState<RootStackParamList>;
  createNavigationAction: (type: string, payload?: Record<string, unknown>) => NavigationAction;
  createNavigationEvent: <T extends NavigationEvent>(
    type: T,
    data?: Record<string, unknown>,
  ) => NavigationEventData<T>;
  createNavigationListener: <T extends NavigationEvent>(
    callback: NavigationEventListener<T>,
  ) => NavigationEventListener<T>;
  createNavigationSubscription: (remove: () => void) => NavigationEventSubscription;
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
  getMetrics: () => Record<string, number>;
  clearMetrics: () => void;
}

// Navigation Analytics Types
export interface NavigationAnalytics {
  track: (event: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
  page: (name: string, properties?: Record<string, unknown>) => void;
  group: (groupId: string, traits?: Record<string, unknown>) => void;
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
  get: <T = unknown>(key: string) => T | undefined;
  set: <T = unknown>(key: string, value: T) => void;
  delete: (key: string) => void;
  clear: () => void;
  has: (key: string) => boolean;
  keys: () => string[];
  values: () => unknown[];
  entries: () => Array<[string, unknown]>;
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
export interface NetworkState {
  isConnected: boolean;
  type: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  isInternetReachable: boolean;
}

export interface NavigationNetwork {
  isConnected: boolean;
  type: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  isInternetReachable: boolean;
  addListener: (callback: (state: NetworkState) => void) => () => void;
  removeListener: (callback: (state: NetworkState) => void) => void;
}

// Navigation Device Types
export interface NavigationDevice {
  platform: 'ios' | 'android' | 'web' | 'windows' | 'macos';
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
