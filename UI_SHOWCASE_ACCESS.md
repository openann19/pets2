# 🎨 UI Showcase - How to Run

## Mobile App Access

### Method 1: Direct Navigation (Recommended)

Add a button in your **Settings** screen to navigate to UI Demo:

```typescript
// In SettingsScreen.tsx, add this to settings items:

{
  id: 'ui-demo',
  title: 'UI Component Showcase',
  icon: 'brush-outline',
  type: 'navigation' as const,
  onPress: () => navigation.navigate('UIDemo'),
}
```

### Method 2: Programmatic Navigation

From any screen with navigation access:

```typescript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();

// Navigate to UI Demo
navigation.navigate('UIDemo');
```

### Method 3: Add to Dev Menu (For Testing)

If you have a dev menu/settings, add:

```typescript
{
  label: 'UI Showcase',
  onPress: () => navigation.navigate('UIDemo'),
}
```

## Web App Access

### Start the web server:

```bash
cd apps/web
npm run dev
# or
pnpm dev
# or
yarn dev
```

### Access the showcase:

Open your browser and navigate to:

```
http://localhost:3000/ui
```

Or if using a different port, check the terminal output for the exact URL.

## What You'll See

### Mobile (`UIDemo` screen):
- **Control Bar**: Theme (Light/Dark), Language (EN/BG), Density (+/-), Reduce Motion switch
- **13 Component Showcases**:
  1. Button (Primary, Secondary, Outline, Ghost, Danger)
  2. Input (Default, Label, Helper, Error states)
  3. Card (Surface, Elevated, Outlined)
  4. Badge (All color variants)
  5. Text (Typography scale)
  6. Stack (Layout with gaps)
  7. Switch (Toggle switches)
  8. Checkbox (Multi-select)
  9. Avatar (All sizes)
  10. Radio (Single-choice)
  11. Tag (Chip-style tags)
  12. Divider (Section separators)
  13. Skeleton (Loading placeholders)

### Web (`/ui` page):
- Similar control bar with theme and language toggles
- Responsive layout showing all components
- Interactive theme switching

## Features

- ✅ Live theme switching (Light/Dark)
- ✅ Language toggle (English/Bulgarian)
- ✅ Density controls (Comfortable/Compact)
- ✅ Reduce motion toggle
- ✅ Scrollable showcase
- ✅ Test IDs for E2E testing
- ✅ All components use theme tokens (no hardcoded styles)

## Running E2E Tests

Mobile tests:

```bash
cd apps/mobile
pnpm e2e
# or
npm run e2e
```

This will run the UI demo E2E tests defined in `e2e/uiDemo.e2e.ts`.

## Development Tips

1. **Add New Components**: Edit `apps/mobile/src/components/ui/v2/registry.tsx`
2. **Modify Showcase**: Edit `apps/mobile/src/screens/UIDemoScreen.tsx`
3. **Update Web**: Edit `apps/web/app/ui/page.tsx`

The registry is the single source of truth and automatically syncs across platforms!

