# Storybook Configuration - Mobile App

## Overview

This directory contains Storybook configuration for the mobile app, enabling interactive component development, testing, and documentation.

## Files

### `main.ts`
Main Storybook configuration file defining:
- Story paths and patterns
- Addons (controls, actions, notes, backgrounds)
- Framework setup
- Global settings

### `preview.ts`
Preview configuration with:
- Global decorators (SafeAreaProvider wrapper)
- Default parameters (controls, backgrounds, actions)
- Custom styling for story container

## Available Addons

### Controls Addon
Interactive controls for testing component props dynamically.

**Usage**:
```typescript
argTypes: {
  selectedTone: {
    control: 'select',
    options: ['playful', 'professional'],
  },
}
```

### Actions Addon
Captures component events and logs them.

**Usage**:
```typescript
import { action } from '@storybook/addon-actions';

onPress={action('onPress')}
```

### Notes Addon
Documentation with markdown support.

**Usage**:
```typescript
parameters: {
  notes: {
    markdown: `# Component Documentation...`,
  },
}
```

### Backgrounds Addon
Test components against different backgrounds.

**Available**:
- Light (default)
- Dark
- Premium gradient

## Running Storybook

### Development Mode
```bash
cd apps/mobile
pnpm storybook
```

Opens Storybook on http://localhost:7007

### Build
```bash
cd apps/mobile
pnpm storybook:build
```

Builds static Storybook for deployment.

### Reset Cache
```bash
cd apps/mobile
pnpm storybook:reset
```

Clears Storybook cache if experiencing issues.

## Creating New Stories

### File Naming
Stories must be named `*.stories.tsx` or `*.story.tsx` and placed in the same directory as the component.

### Basic Story Structure
```typescript
import type { Meta, StoryObj } from '@storybook/react-native';
import { MyComponent } from './MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'Category/MyComponent',
  component: MyComponent,
};

export default meta;

type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: {
    prop1: 'value1',
  },
};
```

### Best Practices

1. **Comprehensive Coverage**
   - Include all component states
   - Show error states
   - Include loading states
   - Demonstrate edge cases

2. **Interactive Stories**
   - At least one fully interactive story
   - Use action() for event tracking
   - Provide realistic mock data

3. **Documentation**
   - Add markdown notes
   - Document props and usage
   - Include examples

4. **Organization**
   - Group related components
   - Use clear hierarchy
   - Consistent naming

## Story Organization

Stories are organized by category:

```
src/
├── components/
│   └── ai/
│       ├── PetInfoForm.stories.tsx
│       ├── ToneSelector.stories.tsx
│       └── BioResults.stories.tsx
├── screens/
│   └── AIBioScreen.stories.tsx
└── stories/
    ├── mocks/
    │   └── bioMocks.ts
    └── index.ts
```

## Mock Data

Mock data is centralized in `src/stories/mocks/`:
- Reusable across stories
- Consistent with API responses
- Realistic and comprehensive

## Global Decorators

### SafeAreaProvider
Wraps all stories with proper safe area handling for React Native.

## Customization

### Adding Backgrounds
Edit `preview.ts`:
```typescript
backgrounds: {
  default: 'light',
  values: [
    { name: 'custom', value: '#color' },
  ],
}
```

### Adding Decorators
Edit `preview.ts`:
```typescript
decorators: [
  withSafeArea,
  MyCustomDecorator,
],
```

## Troubleshooting

### Stories Not Appearing
- Check file naming matches `*.stories.tsx`
- Verify file is in correct directory
- Check imports are correct
- Run `pnpm storybook:reset`

### Build Errors
- Clear cache: `pnpm storybook:reset`
- Check for TypeScript errors
- Verify all imports resolve
- Update dependencies

### Performance Issues
- Limit complex mock data
- Use minimal re-renders
- Optimize decorators
- Consider lazy loading

## Integration

### With Tests
Stories complement unit tests by providing:
- Visual regression testing
- Interactive exploration
- Documentation

### With CI
Add Storybook build to CI pipeline:
```yaml
- run: cd apps/mobile && pnpm storybook:build
```

### With Deployment
Host Storybook for team access:
```bash
# Build
pnpm storybook:build

# Deploy to hosting service
# (Netlify, Vercel, etc.)
```

## Resources

- [Storybook React Native](https://github.com/storybookjs/react-native)
- [Storybook Documentation](https://storybook.js.org/docs/react-native/welcome)
- [React Native Addons](https://storybook.js.org/addons)

## Contributing

When adding stories:
1. Follow the established patterns
2. Include comprehensive documentation
3. Add mock data if needed
4. Update this README
5. Test thoroughly

## Support

For issues or questions:
1. Check Storybook documentation
2. Review existing stories for examples
3. Ask team for guidance
4. Open issue if needed

