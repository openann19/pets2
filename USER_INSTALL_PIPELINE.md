# 📱 PawfectMatch Mobile - User Installation Pipeline

## Overview
Complete flow of what happens from the moment a user installs the app until they're fully set up.

---

## Stage 1: App Installation & Native Initialization

### What Happens:
1. **User downloads app** from App Store or Google Play
2. **Native app installation** - OS installs the app bundle
3. **App launch** - System calls the app entry point

### Entry Point:
```typescript
// apps/mobile/App.tsx (line 215-228)
export default function App(): React.ReactElement {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <AppNavigator />
          </NavigationContainer>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
```

### Services Initialized (in parallel):
- **ThemeProvider** - Loads theme configuration
- **QueryClient** - Sets up React Query for data fetching
- **GestureHandler** - Initializes gesture handling
- **NavigationContainer** - Sets up React Navigation

---

## Stage 2: Navigation & Initial Route Determination

### Current Configuration:
```100:101:apps/mobile/src/App.tsx
    initialRouteName="Home"
    screenOptions={{ headerShown: false }}
```

**Note**: Currently starts at "Home" by default. No authentication guard implemented.

### Available Routes:
```103:117:apps/mobile/src/App.tsx
    {/* Authentication Screens */}
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

    {/* Main Tab Navigator (with EnhancedTabBar) */}
    <Stack.Screen name="Home" component={BottomTabNavigator} />
    <Stack.Screen name="Main" component={HomeScreen} />
    <Stack.Screen name="Swipe" component={SwipeScreen} options={screenTransitions.fluid} />
    <Stack.Screen name="Matches" component={MatchesScreen} options={screenTransitions.fluid} />
    <Stack.Screen name="Profile" component={ProfileScreen} options={screenTransitions.scale} />
    <Stack.Screen name="Settings" component={SettingsScreen} options={screenTransitions.fluid} />
    <Stack.Screen name="Chat" component={ChatScreen} options={screenTransitions.fluid} />
```

---

## Stage 3: User Authentication Flow

### A. First-Time User Path (No Account)

#### Step 1: Login Screen
```21:30:apps/mobile/src/screens/LoginScreen.tsx
const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const {
    values,
    errors,
    setValue,
    handleSubmit,
    navigateToRegister,
    navigateToForgotPassword,
  } = useLoginScreen({ navigation });
```

**What User Sees**:
- PawfectMatch logo
- Email input field
- Password input field
- "Forgot password?" link
- "Sign In" button
- "Don't have an account? Sign Up" link

#### Step 2: User Clicks "Sign Up"
Navigates to `RegisterScreen`

#### Step 3: Registration Screen
```19:21:apps/mobile/src/screens/RegisterScreen.tsx
const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const { values, errors, setValue, handleSubmit, navigateToLogin } =
    useRegisterScreen({ navigation });
```

**Registration Form Fields**:
- Email
- First Name
- Last Name
- Date of Birth (YYYY-MM-DD)
- Password (must be 8+ chars, uppercase, lowercase, number, special character)
- Confirm Password

#### Step 4: Submit Registration
```113:173:apps/mobile/src/hooks/screens/useRegisterScreen.ts
  const handleRegister = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setLoading(true);

    try {
      logger.info("Registration attempt:", { email: values.email });

      // Validate password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(values.password)) {
        throw new AuthError(
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
        );
      }

      const response = await authService.register({
        email: values.email,
        password: values.password,
        name: `${values.firstName} ${values.lastName}`,
        confirmPassword: values.confirmPassword,
      });

      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );

      logger.info("Registration successful", { userId: response.user.id });

      Alert.alert(
        "Registration Successful",
        "Your account has been created successfully. You can now log in.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
            style: "default",
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
```

**Backend Call**:
```415:441:apps/mobile/src/services/AuthService.ts
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validate password confirmation
      if (data.password !== data.confirmPassword) {
        throw new AuthError("Passwords do not match");
      }

      const registerData = {
        email: data.email,
        password: data.password,
        name: data.name,
      };
      const response = await api.request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(registerData),
      });

      // Store authentication data securely
      await this.storeAuthData(response);

      logger.info("User registered successfully", { userId: response.user.id });
      return response;
    } catch (error) {
      logger.error("Registration failed", { error, email: data.email });
      throw new AuthError("Registration failed. Please try again.", error);
    }
  }
```

**What Gets Stored**:
```434:435:apps/mobile/src/services/AuthService.ts
      // Store authentication data securely
      await this.storeAuthData(response);
```

Auth store updates:
```32:48:apps/mobile/src/stores/useAuthStore.ts
export const useAuthStore = create<AuthState>()(
  persist(
    immer((set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      // Update user data
      setUser: (user: User | null) =>
        set((state) => {
          state.user = user;
          state.isAuthenticated = user !== null;
          return state;
        }),
```

#### Step 5: Navigate to Login
After registration, user is returned to Login screen with their credentials auto-filled.

#### Step 6: User Logs In
```78:98:apps/mobile/src/hooks/screens/useLoginScreen.ts
  const handleLogin = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setLoading(true);
    
    try {
      logger.info("Login attempt:", { email: values.email });

      const response = await authService.login({
        email: values.email,
        password: values.password,
      });

      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );

      logger.info("Login successful", { userId: response.user.id });

      // Navigate to Home on successful login
      navigation.navigate("Home");
```

---

## Stage 4: Main App Experience (Post-Login)

### Bottom Tab Navigator
```29:42:apps/mobile/src/navigation/BottomTabNavigator.tsx
export default function BottomTabNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      tabBar={(props) => <UltraTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeWrapper} />
      <Tab.Screen name="Swipe" component={SwipeWrapper} />
      <Tab.Screen name="Matches" component={MatchesWrapper} />
      <Tab.Screen name="Map" component={MapWrapper} />
      <Tab.Screen name="Profile" component={ProfileWrapper} />
    </Tab.Navigator>
  );
}
```

### Home Screen Features
```46:62:apps/mobile/src/screens/HomeScreen.tsx
export default function HomeScreen() {
  const { user } = useAuthStore();
  const scrollRef = useRef<ScrollView>(null);
  const { onScroll, getOffset } = useScrollOffsetTracker();

  const {
    stats,
    refreshing,
    onRefresh,
    handleProfilePress,
    handleSettingsPress,
    handleSwipePress,
    handleMatchesPress,
    handleMessagesPress,
    handleMyPetsPress,
    handleCreatePetPress,
    handleCommunityPress,
  } = useHomeScreen();
```

**Available Actions**:
- **Swipe** - Browse pets and swipe to match
- **Matches** - View mutual matches
- **Messages** - Chat with matches
- **Profile** - View/edit profile
- **Community** - Explore community features
- **Premium** - Upgrade for premium features

---

## Stage 5: Background Services Initialization

### Services That Initialize on App Launch:

#### 1. **Asset Preloader**
```42:53:apps/mobile/src/services/AssetPreloader.ts
  async preloadCriticalAssets(): Promise<void> {
    if (this.preloadPromise) {
      return this.preloadPromise;
    }

    // Perform preloading
    this.preloadPromise = this.performPreloading();

    return this.preloadPromise;
  }
```

**Purpose**: Preloads critical images and fonts for smooth UX

#### 2. **Offline Sync Service**
```55:73:apps/mobile/src/services/OfflineSyncService.ts
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load persisted queue
      await this.loadQueue();

      // Setup network monitoring
      this.setupNetworkMonitoring();

      // Start background sync
      this.startBackgroundSync();

      this.isInitialized = true;
      logger.info("Offline sync service initialized");
    } catch (error) {
      logger.error("Failed to initialize offline sync service", { error });
    }
  }
```

**Purpose**: Manages offline data synchronization

#### 3. **Notification Service**
```36:99:apps/mobile/src/services/notifications.ts
  async initialize(): Promise<string | null> {
    try {
      // Check if device supports notifications
      if (!Device.isDevice) {
        logger.warn("Must use physical device for Push Notifications");
        return null;
      }

      // Get existing permission status
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not granted
      if (String(existingStatus) !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (String(finalStatus) !== "granted") {
        logger.warn("Failed to get push token for push notification!");
        return null;
      }

      // Get the token
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;
      this.expoPushToken = token;

      // Store token locally
      await AsyncStorage.setItem("expo_push_token", token);

      // Register token with backend
      try {
        const deviceId = await this.getDeviceId();
        await this.registerTokenWithBackend(token, deviceId);
      } catch (error) {
        logger.warn("Failed to register push token with backend", { error });
        // Non-critical - continue without backend registration
      }

      // Configure notification channel for Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF6B6B",
        });

        // Create specific channels for different notification types
        await this.createNotificationChannels();
      }

      // Set up listeners
      this.setupListeners();
```

**Purpose**: Request push notification permissions and set up notification handlers

#### 4. **Observability Service**
```86:120:apps/mobile/src/services/observability.ts
  initialize(): void {
    if (this.isInitialized) return;

    try {
      // Initialize Sentry for error tracking
      if (this.config.enableErrorTracking) {
        Sentry.init({
          dsn: process.env.SENTRY_DSN,
          environment: this.config.environment,
          sampleRate: this.config.sampleRate,
          beforeSend: (event) => {
            // Sanitize sensitive data before sending
            return this.sanitizeSentryEvent(event);
          },
        });
        logger.info("Sentry error tracking initialized");
      }

      // Initialize performance monitoring (constructor already starts it in dev)
      if (this.config.enablePerformanceTracking) {
        logger.info("Performance monitoring enabled");
      }

      // Initialize network monitoring
      this.initializeNetworkMonitoring();

      this.isInitialized = true;
      logger.info("Observability service initialized successfully");
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Failed to initialize observability service", {
        error: err,
      });
    }
  }
```

**Purpose**: Error tracking (Sentry) and performance monitoring

---

## Stage 6: Feature Flags

### Configuration
```7:18:apps/mobile/src/config/flags.ts
export const FLAGS = {
  // Go Live feature - controls streaming functionality
  // Backend infrastructure is ready with LiveKit integration
  // Can be disabled by setting EXPO_PUBLIC_FEATURE_GO_LIVE=false
  GO_LIVE: process.env.EXPO_PUBLIC_FEATURE_GO_LIVE !== "false", // Enable by default since implementation exists
  
  // Additional feature flags can be added here
  // PREMIUM_FEATURES: true,
  // BETA_FEATURES: false,
};
```

Currently, only **Go Live** is configured as a feature flag.

---

## Complete Installation Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INSTALLS APP                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              STAGE 1: Native App Initialization              │
│  - OS installs app bundle                                    │
│  - System launches app                                        │
│  - App.tsx renders                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          STAGE 2: Core Services Initialize                  │
│  ✅ ThemeProvider loads theme                                │
│  ✅ QueryClient sets up data fetching                        │
│  ✅ GestureHandler initializes gestures                      │
│  ✅ NavigationContainer sets up navigation                    │
│  ✅ AssetPreloader preloads images/fonts                      │
│  ✅ OfflineSyncService starts                                │
│  ✅ NotificationService requests permissions                  │
│  ✅ ObservabilityService sets up error tracking                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              STAGE 3: App Navigator Renders                  │
│  ⚠️  Current: No auth guard (starts at "Home")                │
│  📋 Should check:                                            │
│     - Is user authenticated?                                 │
│     - Has user completed onboarding?                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Current Flow (No Auth Guard)                   │
│  User lands directly on Home screen                          │
│  Can navigate to all features                               │
│  ⚠️  Should implement proper routing guard                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              INTENDED Flow (To Be Implemented)              │
│                                                              │
│  ╭───────────────────────────────────────────╮              │
│  │ IS USER AUTHENTICATED?                     │              │
│  ╰──────────────────┬────────────────────────╯              │
│                     │                                        │
│         ┌───────────┴────────────┐                           │
│         ▼                        ▼                           │
│   [NO → Login]           [YES → Check Onboarding]            │
│         │                        │                           │
│         └───────────┬────────────┘                           │
│                     │                                        │
│                     ▼                                        │
│      ╭───────────────────────────╮                           │
│      │ HAS COMPLETED ONBOARDING?  │                           │
│      ╰──────────────┬─────────────╯                           │
│                     │                                        │
│         ┌───────────┴────────────┐                           │
│         ▼                        ▼                           │
│   [NO → Onboarding]      [YES → Main App (Home)]             │
└─────────────────────────────────────────────────────────────┘
```

---

## What's Missing / To Be Implemented

### ❌ Critical Issues:

1. **No Authentication Guard**
   - App currently starts at "Home" regardless of auth state
   - Should check `useAuthStore().isAuthenticated`
   - Should redirect to Login if not authenticated

2. **No Onboarding Completion Check**
   - Onboarding screens exist but are commented out
   - Should check AsyncStorage for "onboarding_complete"
   - Should show onboarding flow for first-time users

3. **No Session Restoration**
   - Should check for stored tokens on app launch
   - Should validate token with backend
   - Should restore user session if token is valid

### 🔧 Recommended Implementation:

```typescript
// apps/mobile/src/App.tsx
// Add authentication guard component

const AuthGuard = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  useEffect(() => {
    // Check if user has completed onboarding
    // Check if user has valid session
    // Set initial route based on state
  }, []);
  
  if (isCheckingAuth || isLoading) {
    return <SplashScreen />;
  }
  
  return isAuthenticated ? <MainApp /> : <AuthFlow />;
};
```

---

## Summary

### Current State:
1. ✅ App installs and initializes core services
2. ✅ User can register and login
3. ✅ Main app features are accessible after login
4. ❌ No authentication guard (shows Home by default)
5. ❌ No onboarding flow enforcement
6. ❌ No session restoration

### Next Steps:
1. Implement authentication guard in navigation
2. Add onboarding completion check
3. Add session restoration logic
4. Test complete flow from fresh install
