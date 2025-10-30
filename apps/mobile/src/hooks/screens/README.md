# Screen Hooks Documentation

## Overview

This directory contains all screen-specific hooks that manage business logic,
state, and API calls for the PawfectMatch mobile app screens. These hooks follow
React's best practices and provide a clean separation between UI and business
logic.

## Architecture

### Hook Pattern

Each screen hook follows this pattern:

```typescript
export function useMyScreen(options: UseMyScreenOptions): UseMyScreenReturn {
  // State management
  // Business logic
  // API calls
  // Navigation handlers

  return {
    // State
    // Actions
  };
}
```

## Hook Categories

### Authentication Hooks

- **useLoginScreen** - Login functionality
- **useRegisterScreen** - Registration flow
- **useForgotPasswordScreen** - Password reset
- **useResetPasswordScreen** - Password reset confirmation

### Core Feature Hooks

- **useHomeScreen** - Home screen stats and data
- **useSwipeScreen** - Swipe card interactions
- **useMatchesScreen** - Matches listing
- **useChatScreen** - Chat functionality
- **useProfileScreen** - User profile management

### Pet Management Hooks

- **useMyPetsScreen** - Pet list management
- **useCreatePetScreen** - Pet creation
- **useEditPetScreen** - Pet editing

### AI Feature Hooks

- **useAIBioScreen** - AI bio generation
- **useAICompatibilityScreen** - Compatibility analysis
- **useAIPhotoAnalyzerScreen** - Photo analysis

### Premium Feature Hooks

- **usePremiumScreen** - Premium subscription management
- **useSubscriptionManagerScreen** - Subscription details

### Safety & Privacy Hooks

- **useBlockedUsersScreen** - Blocked users management
- **useAdvancedFiltersScreen** - Advanced filtering
- **useDeactivateAccountScreen** - Account deactivation
- **usePrivacySettingsScreen** - Privacy controls
- **useSafetyCenterScreen** - Safety features

### Admin Hooks

- **useAdminDashboardScreen** - Admin dashboard
- **useAdminAnalyticsScreen** - Analytics
- **useAdminSecurityScreen** - Security management

## Usage Examples

### Basic Hook Usage

```typescript
import { useHomeScreen } from '../hooks/screens/useHomeScreen';

function HomeScreen() {
  const {
    stats,
    refreshing,
    onRefresh,
    handleProfilePress,
  } = useHomeScreen();

  return (
    <View>
      <Text>{stats.totalMatches}</Text>
      <Button onPress={onRefresh} />
    </View>
  );
}
```

### Hook with API Calls

```typescript
import { useBlockedUsersScreen } from '../hooks/screens/useBlockedUsersScreen';

function BlockedUsersScreen() {
  const {
    blockedUsers,
    loading,
    loadBlockedUsers,
    unblockUser,
  } = useBlockedUsersScreen();

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  return (
    <View>
      {blockedUsers.map(user => (
        <TouchableOpacity onPress={() => unblockUser(user.id)}>
          <Text>{user.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

## Best Practices

### 1. State Management

- Use useState for local component state
- Use useCallback for memoized functions
- Use useMemo for computed values
- Handle loading and error states

### 2. API Calls

- Always handle errors
- Provide loading states
- Use optimistic updates when appropriate
- Implement retry logic for critical operations

### 3. Navigation

- Return navigation handlers from hooks
- Keep navigation logic in hooks
- Don't pass navigation object directly to UI

### 4. Error Handling

- Use Alert.alert for user notifications
- Log errors appropriately
- Provide user-friendly error messages
- Handle network errors gracefully

### 5. Performance

- Use useCallback for event handlers
- Use useMemo for expensive computations
- Avoid unnecessary re-renders
- Implement proper cleanup in useEffect

## Testing

Each hook should have comprehensive unit tests:

- Initial state tests
- Action handler tests
- API integration tests
- Error handling tests

Example test structure:

```typescript
describe('useMyScreen', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useMyScreen());
    expect(result.current.loading).toBe(true);
  });

  it('should handle successful API calls', async () => {
    // Test implementation
  });

  it('should handle errors gracefully', async () => {
    // Test implementation
  });
});
```

## Migration Notes

When migrating a screen to use hooks:

1. Extract business logic from the component
2. Create a hook file in this directory
3. Move state management to the hook
4. Move API calls to the hook
5. Return state and handlers from the hook
6. Update the component to use the hook
7. Add unit tests for the hook

## Contributing

When adding new hooks:

- Follow the existing patterns
- Add TypeScript interfaces
- Include error handling
- Add unit tests
- Update this documentation
- Export the hook in index.ts
