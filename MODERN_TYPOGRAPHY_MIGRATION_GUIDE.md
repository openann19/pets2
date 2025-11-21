# ModernTypography Migration Guide

## Overview

This guide provides comprehensive instructions for migrating from regular React Native `Text` components to the new `ModernTypography` system. The ModernTypography system provides consistent typography, gradient text support, animations, and better theme integration.

## Migration Status

### ✅ Completed Migrations
- **ProfileScreen.tsx** - User profile management
- **PremiumScreen.tsx** - Subscription and billing
- **LoginScreen.tsx** - Authentication flow
- **RegisterScreen.tsx** - User registration

### 🔄 High Priority Candidates
- **HomeScreen.tsx** - Main dashboard
- **SettingsScreen.tsx** - App settings
- **MatchesScreen.tsx** - Match management
- **ChatScreen.tsx** - Messaging interface
- **MyPetsScreen.tsx** - Pet management
- **CreatePetScreen.tsx** - Pet creation
- **StoriesScreen.tsx** - Social features

### 📋 Remaining Screens (67 total)
See audit results below for complete list of screens requiring migration.

## Step-by-Step Migration Process

### 1. Import ModernTypography Components

Replace the Text import:
```typescript
// ❌ Old way
import { Text } from "react-native";

// ✅ New way
import { 
  ModernText, 
  Heading1, 
  Heading2, 
  Heading3, 
  Heading4, 
  Heading5, 
  Heading6,
  Body, 
  BodyLarge, 
  BodySmall, 
  Caption,
  Overline,
  ButtonText,
  Label,
  GradientHeading,
  GradientText,
  HolographicText,
  AnimatedHeading,
  AnimatedText
} from "../components/typography/ModernTypography";
```

### 2. Component Mapping Guide

| Use Case | Old Component | New Component | Example |
|----------|--------------|--------------|---------|
| Page titles | `<Text style={styles.title}>` | `<Heading1>` | `<Heading1>Welcome</Heading1>` |
| Section headers | `<Text style={styles.header}>` | `<Heading2>` or `<Heading3>` | `<Heading2>Settings</Heading2>` |
| Card titles | `<Text style={styles.cardTitle}>` | `<Heading4>` or `<Heading5>` | `<Heading4>Pet Profile</Heading4>` |
| Body text | `<Text style={styles.body}>` | `<Body>` | `<Body>Description text</Body>` |
| Small text | `<Text style={styles.small}>` | `<BodySmall>` | `<BodySmall>Last updated</BodySmall>` |
| Labels | `<Text style={styles.label}>` | `<Label>` | `<Label>Email</Label>` |
| Captions | `<Text style={styles.caption}>` | `<Caption>` | `<Caption>Optional</Caption>` |
| Button text | `<Text style={styles.button}>` | `<ButtonText>` | `<ButtonText>Submit</ButtonText>` |
| Gradient text | `<Text style={styles.gradient}>` | `<GradientText>` | `<GradientText>Premium</GradientText>` |
| Animated text | `<Text style={styles.animated}>` | `<AnimatedText>` | `<AnimatedText>Welcome!</AnimatedText>` |

### 3. Style Migration

#### Remove Text-specific Styles
```typescript
// ❌ Remove these from StyleSheet
const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  body: {
    fontSize: 16,
    color: '#6b7280',
  },
  // ... other text styles
});

// ✅ Keep only layout styles
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  // ... layout styles only
});
```

#### Use ModernTypography Props Instead
```typescript
// ❌ Old way with styles
<Text style={styles.title}>Welcome</Text>

// ✅ New way with props
<Heading1 color="primary">Welcome</Heading1>
<Heading2 weight="semibold" color="secondary">Subtitle</Heading2>
<Body color="tertiary">Description text</Body>
```

### 4. Advanced Features

#### Gradient Text
```typescript
// ✅ Use predefined gradients
<GradientHeading>Premium Features</GradientHeading>
<GradientText gradient="primary">Highlighted text</GradientText>
<HolographicText>Special effect text</HolographicText>

// ✅ Custom gradients
<ModernText gradientColors={['#ff6b6b', '#4ecdc4']}>
  Custom gradient
</ModernText>
```

#### Animated Text
```typescript
// ✅ Entrance animations
<AnimatedHeading animationType="fadeInUp">
  Welcome!
</AnimatedHeading>

<AnimatedText animationType="slideInLeft">
  Animated content
</AnimatedText>

// ✅ Custom animations
<ModernText 
  animated 
  animationType="scaleIn"
  variant="h2"
>
  Scaled animation
</ModernText>
```

#### Color System
```typescript
// ✅ Semantic colors
<ModernText color="primary">Primary text</ModernText>
<ModernText color="secondary">Secondary text</ModernText>
<ModernText color="tertiary">Tertiary text</ModernText>
<ModernText color="inverse">Inverse text</ModernText>
```

### 5. Common Migration Patterns

#### Header Sections
```typescript
// ❌ Old way
<View style={styles.header}>
  <Text style={styles.headerTitle}>Profile</Text>
  <Text style={styles.headerSubtitle}>Manage your account</Text>
</View>

// ✅ New way
<View style={styles.header}>
  <Heading1>Profile</Heading1>
  <Body color="secondary">Manage your account</Body>
</View>
```

#### Card Content
```typescript
// ❌ Old way
<View style={styles.card}>
  <Text style={styles.cardTitle}>Pet Name</Text>
  <Text style={styles.cardDescription}>Description text</Text>
  <Text style={styles.cardMeta}>Last updated: Today</Text>
</View>

// ✅ New way
<View style={styles.card}>
  <Heading4>Pet Name</Heading4>
  <Body>Description text</Body>
  <Caption>Last updated: Today</Caption>
</View>
```

#### Form Elements
```typescript
// ❌ Old way
<Text style={styles.label}>Email Address</Text>
<TextInput style={styles.input} />
<Text style={styles.error}>Invalid email</Text>

// ✅ New way
<Label>Email Address</Label>
<TextInput style={styles.input} />
<Caption color="error">Invalid email</Caption>
```

#### Button Text
```typescript
// ❌ Old way
<TouchableOpacity style={styles.button}>
  <Text style={styles.buttonText}>Submit</Text>
</TouchableOpacity>

// ✅ New way
<TouchableOpacity style={styles.button}>
  <ButtonText>Submit</ButtonText>
</TouchableOpacity>
```

### 6. Performance Considerations

#### Memoization
```typescript
// ✅ ModernTypography components are already memoized
<ModernText variant="h1">Title</ModernText>

// ✅ For custom components, wrap with memo
const MyComponent = React.memo(() => (
  <Heading1>Memoized title</Heading1>
));
```

#### Conditional Rendering
```typescript
// ✅ Efficient conditional rendering
{isLoading ? (
  <Body color="secondary">Loading...</Body>
) : (
  <Heading2>Content loaded</Heading2>
)}
```

### 7. Testing Migration

#### Visual Testing
1. Compare before/after screenshots
2. Test on different screen sizes
3. Verify dark/light theme compatibility
4. Check gradient rendering
5. Test animations

#### Functional Testing
1. Verify text accessibility
2. Test touch targets
3. Check text selection
4. Validate screen reader support

### 8. Common Issues and Solutions

#### Issue: Text not rendering
**Solution**: Ensure ModernTypography is properly imported and components are used correctly.

#### Issue: Styles not applying
**Solution**: Use ModernTypography props instead of custom styles for typography.

#### Issue: Gradients not showing
**Solution**: Check that gradient colors are valid and MaskedView is properly configured.

#### Issue: Animations not working
**Solution**: Verify animation props are correctly set and entrance animations are triggered.

### 9. Migration Checklist

For each screen migration:

- [ ] Import ModernTypography components
- [ ] Replace all `<Text>` components with appropriate variants
- [ ] Remove text-specific styles from StyleSheet
- [ ] Test visual appearance
- [ ] Verify accessibility
- [ ] Check performance
- [ ] Update any related tests
- [ ] Document any custom implementations

### 10. Best Practices

1. **Consistency**: Use semantic variants (Heading1, Body, etc.) rather than custom styles
2. **Accessibility**: Always provide proper accessibility props
3. **Performance**: Leverage built-in memoization
4. **Theme Integration**: Use semantic colors for better theme support
5. **Gradients**: Use sparingly for maximum impact
6. **Animations**: Apply entrance animations thoughtfully

## Complete Screen Audit Results

### Screens Requiring Migration (67 total):

#### Core App Screens
- HomeScreen.tsx
- SettingsScreen.tsx
- MatchesScreen.tsx
- ChatScreen.tsx
- MyPetsScreen.tsx
- CreatePetScreen.tsx
- StoriesScreen.tsx

#### Authentication Screens
- ForgotPasswordScreen.tsx
- ResetPasswordScreen.tsx
- DeactivateAccountScreen.tsx

#### Premium Screens
- PremiumDemoScreen.tsx
- PremiumSuccessScreen.tsx
- PremiumCancelScreen.tsx
- ManageSubscriptionScreen.tsx

#### AI Features
- AIBioScreen.tsx
- AIBioScreen.refactored.tsx
- AIPhotoAnalyzerScreen.tsx
- AICompatibilityScreen.tsx

#### Admin Screens
- AdminDashboardScreen.tsx
- AdminUsersScreen.tsx
- AdminSecurityScreen.tsx
- AdminBillingScreen.tsx
- AdminAnalyticsScreen.tsx
- AdminVerificationsScreen.tsx
- AdminUploadsScreen.tsx
- AdminChatsScreen.tsx
- AdminNotificationsScreen.tsx
- AdminLeaderboardScreen.tsx
- AdminBiometricScreen.tsx
- AdminEnhancedFeaturesScreen.tsx

#### Onboarding Screens
- WelcomeScreen.tsx
- PetProfileSetupScreen.tsx
- UserIntentScreen.tsx
- PreferencesSetupScreen.tsx

#### Feature Screens
- MapScreen.tsx
- BlockedUsersScreen.tsx
- PrivacySettingsScreen.tsx
- MemoryWeaveScreen.tsx
- SafetyCenterScreen.tsx
- ModerationToolsScreen.tsx
- HelpSupportScreen.tsx
- EditProfileScreen.tsx
- AdvancedFiltersScreen.tsx
- AboutTermsPrivacyScreen.tsx
- NotificationPreferencesScreen.tsx

#### Adoption Screens
- PetDetailsScreen.tsx
- CreateListingScreen.tsx
- ApplicationReviewScreen.tsx
- AdoptionManagerScreen.tsx
- AdoptionContractScreen.tsx
- AdoptionApplicationScreen.tsx

#### Community Screens
- CommunityScreen.tsx
- LeaderboardScreen.tsx

#### Calling Screens
- IncomingCallScreen.tsx
- ActiveCallScreen.tsx

#### Premium Screens
- SubscriptionManagerScreen.tsx
- SubscriptionSuccessScreen.tsx

#### AR Features
- ARScentTrailsScreen.tsx

#### Test Screens
- ComponentTestScreen.tsx
- MigrationExampleScreen.tsx

## Next Steps

1. **Priority Migration**: Focus on core app screens first (Home, Settings, Matches, Chat)
2. **Batch Processing**: Group related screens for efficient migration
3. **Testing**: Implement comprehensive testing for each migrated screen
4. **Documentation**: Update component documentation as screens are migrated
5. **Performance Monitoring**: Track performance improvements post-migration

## Support

For questions or issues during migration:
1. Check this guide for common patterns
2. Review completed migrations for examples
3. Test with ModernTypography components in isolation
4. Consult the ModernTypography component documentation

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Active Migration Phase
