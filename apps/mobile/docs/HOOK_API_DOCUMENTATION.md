# Hook API Documentation

## Overview

Comprehensive API documentation for all screen hooks in the PawfectMatch mobile app.

## Quick Reference

### Authentication Hooks

#### useLoginScreen
```typescript
const {
  values,
  errors,
  setValue,
  handleSubmit,
  navigateToRegister,
  navigateToForgotPassword,
} = useLoginScreen({ navigation });
```

**Returns**:
- `values`: Form values (email, password)
- `errors`: Validation errors
- `setValue`: Update form field
- `handleSubmit`: Submit login form
- `navigateToRegister`: Navigate to register screen
- `navigateToForgotPassword`: Navigate to forgot password screen

#### useRegisterScreen
```typescript
const {
  values,
  errors,
  isValid,
  setValue,
  handleSubmit,
  navigateToLogin,
} = useRegisterScreen({ navigation });
```

**Returns**:
- `values`: Form values (email, firstName, lastName, dateOfBirth, password, confirmPassword)
- `errors`: Validation errors
- `isValid`: Form validation status
- `setValue`: Update form field
- `handleSubmit`: Submit registration
- `navigateToLogin`: Navigate to login screen

#### useForgotPasswordScreen
```typescript
const {
  values,
  errors,
  isValid,
  loading,
  setValue,
  handleSubmit,
  navigateBack,
} = useForgotPasswordScreen({ navigation });
```

**Returns**:
- `values`: Form values (email)
- `errors`: Validation errors
- `isValid`: Form validation status
- `loading`: Loading state
- `setValue`: Update form field
- `handleSubmit`: Submit password reset request
- `navigateBack`: Navigate back

### Safety & Privacy Hooks

#### useBlockedUsersScreen
```typescript
const {
  blockedUsers,
  loading,
  refreshing,
  loadBlockedUsers,
  refreshBlockedUsers,
  unblockUser,
} = useBlockedUsersScreen();
```

**Returns**:
- `blockedUsers`: Array of blocked user objects
- `loading`: Loading state
- `refreshing`: Pull-to-refresh state
- `loadBlockedUsers`: Load blocked users from API
- `refreshBlockedUsers`: Refresh the user list
- `unblockUser`: Unblock a specific user

#### useAdvancedFiltersScreen
```typescript
const {
  filters,
  toggleFilter,
  resetFilters,
  saveFilters,
  getFiltersByCategory,
} = useAdvancedFiltersScreen();
```

**Returns**:
- `filters`: Array of filter options
- `toggleFilter`: Toggle a filter on/off
- `resetFilters`: Reset all filters
- `saveFilters`: Save filters to backend
- `getFiltersByCategory`: Get filters by category

#### useDeactivateAccountScreen
```typescript
const {
  reason,
  confirmText,
  loading,
  reasons,
  selectReason,
  setConfirmText,
  handleDeactivate,
  handleGoBack,
} = useDeactivateAccountScreen();
```

**Returns**:
- `reason`: Selected deactivation reason
- `confirmText`: Confirmation text input
- `loading`: Loading state
- `reasons`: Available deactivation reasons
- `selectReason`: Select a deactivation reason
- `setConfirmText`: Update confirmation text
- `handleDeactivate`: Process account deactivation
- `handleGoBack`: Navigate back

## Type Definitions

### Common Types

```typescript
interface NavigationProp {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
}

interface FormValues {
  [key: string]: string;
}

interface ValidationErrors {
  [key: string]: string;
}
```

## Best Practices

### Using Hooks

1. **Always destructure returned values**
```typescript
const { data, loading, error } = useMyHook();
```

2. **Handle loading states**
```typescript
if (loading) return <LoadingSpinner />;
```

3. **Handle errors**
```typescript
if (error) return <ErrorMessage error={error} />;
```

4. **Use useCallback for handlers**
```typescript
const handleSubmit = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

### Error Handling

All hooks implement proper error handling:
- API errors are caught and logged
- User-friendly error messages displayed
- Loading states managed properly
- Alerts shown for critical errors

### Performance

- Use `useCallback` for event handlers
- Use `useMemo` for expensive computations
- Avoid unnecessary re-renders
- Clean up subscriptions in `useEffect`

## Testing

### Unit Testing
```typescript
import { renderHook } from '@testing-library/react-native';
import { useMyScreen } from './useMyScreen';

describe('useMyScreen', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useMyScreen());
    expect(result.current.loading).toBe(true);
  });
});
```

### Integration Testing
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import MyScreen from '../screens/MyScreen';

describe('MyScreen Integration', () => {
  it('should render and interact', () => {
    const { getByText } = render(<MyScreen />);
    fireEvent.press(getByText('Submit'));
  });
});
```

## Migration Guide

When migrating a screen to use hooks:

1. Create hook file
2. Move business logic to hook
3. Update component to use hook
4. Add unit tests
5. Update documentation

## Support

For questions or issues:
- Check existing tests for examples
- Review hook source code
- Contact the development team

