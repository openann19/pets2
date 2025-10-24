# PawfectMatch UI Component Library

A modern, accessible UI component library designed for PawfectMatch applications.

## Features

- ✅ Fully accessible components (WCAG 2.2 compliant)
- 🌙 Dark mode support
- 📱 Responsive by default
- 🎭 Multiple design variants
- ♿️ Respects user preferences (reduced motion, contrast, etc.)
- ✨ Modern animation system
- 🏆 Premium look & feel

## Components

### Textarea

The Textarea component is a modern input field with the following features:

- Multiple design variants (default, outline, filled, minimal, floating, neumorphic)
- Automatic height adjustment
- Character and word counting
- Accessibility features
- Animation effects with reduced motion support
- Error and success states
- Dark mode support
- Custom styling options

#### Usage

```tsx
import { Textarea } from '@pawfectmatch/ui';

function MyForm() {
  const [value, setValue] = React.useState('');
  
  return (
    <Textarea
      label="Your message"
      value={value}
      onChange={setValue}
      variant="neumorphic"
      autoGrow
      maxLength={500}
      showCharCount
      helperText="Tell us about your pet"
    />
  );
}
```

#### Accessibility Features

- Proper labeling
- ARIA attributes
- Focus indicators
- Error announcements
- Screen reader support
- Keyboard navigation
- Motion preferences respect

### Accessibility Hooks

The UI library includes several hooks to help with accessibility:

- `useMediaQuery` - For responsive design
- `usePrefersReducedMotion` - For respecting motion preferences
- `usePrefersDarkMode` - For dark mode detection
- `useContrastCheck` - For ensuring proper color contrast

## Development

### Adding a new component

1. Create a new directory under `src/components`
2. Implement the component with proper TypeScript typing
3. Ensure accessibility features
4. Add tests
5. Update documentation

### Testing

Run tests with:

```
pnpm test
```

## License

Proprietary - PawfectMatch © 2025
