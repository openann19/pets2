# Wireframe Integration System

## Overview

The Wireframe Integration System provides rapid prototyping and wireframing capabilities for the PawfectMatch pet-first mobile app. This system allows developers and designers to quickly iterate on UI designs, test user flows, and create interactive wireframes for design handoffs.

## Features

### 🎨 Wireframe Modes
- **Wireframe Mode**: Shows simplified gray boxes and lines representing UI elements
- **Mockup Mode**: Displays styled components with placeholder content
- **Production Mode**: Normal app behavior with real data

### 🔧 Development Tools
- **Wireframe Controls**: Floating panel for toggling modes and settings
- **Grid Overlay**: Visual grid for alignment and spacing
- **Measurement Tools**: Display component dimensions and spacing
- **Interactive Mode**: Enable/disable user interactions in wireframe mode

### 📱 Wireframe Components
- `WireframeScreen`: Container for screen layouts
- `WireframeCard`: Reusable card component with wireframe/mockup variants
- `WireframePetCard`: Pet-specific card component
- Mock data generators for testing

### 📊 Export Capabilities
- **HTML Export**: Generate interactive wireframes for web viewing
- **JSON Export**: Structured data for design tools
- **Design Tokens**: Comprehensive design system documentation

## Quick Start

### 1. Enable Wireframing

The wireframe system is automatically enabled in development mode. Access the controls by tapping the "Wireframe" button in the bottom-right corner of any screen.

### 2. Toggle Modes

Use the wireframe controls panel to switch between:
- **Production**: Normal app with real data
- **Wireframe**: Simplified gray boxes
- **Mockup**: Styled components with mock data

### 3. Export Wireframes

Generate design assets using npm scripts:

```bash
# Export Playdate Discovery wireframe
pnpm wireframe:export-playdate

# Export Pet Profile wireframe
pnpm wireframe:export-profile

# Generate design tokens documentation
pnpm wireframe:generate-tokens
```

## Usage in Components

### Basic Wireframe Component

```typescript
import { WireframeCard, useWireframe } from '../components/wireframe';

function MyScreen() {
  const wireframe = useWireframe();

  return (
    <WireframeCard
      title="Search Filters"
      height={120}
      content={
        <Text>Distance, preferences, etc.</Text>
      }
    />
  );
}
```

### Wireframe Screen Layout

```typescript
import { WireframeScreen } from '../components/wireframe';

function PetDiscoveryScreen() {
  return (
    <WireframeScreen
      title="Find Playmates"
      showHeader={true}
      showTabs={true}
      tabLabels={['Nearby', 'Compatible', 'Favorites']}
    >
      {/* Screen content */}
    </WireframeScreen>
  );
}
```

### Conditional Rendering

```typescript
function PetCard({ pet }) {
  const wireframe = useWireframe();

  if (wireframe.theme === 'wireframe') {
    return <WireframePetCard pet={pet} />;
  }

  return <RealPetCard pet={pet} />;
}
```

## Configuration

### WireframeProvider Setup

```typescript
import { WireframeProvider } from './components/wireframe';

function App() {
  return (
    <WireframeProvider
      config={{
        enabled: __DEV__, // Auto-enable in development
        theme: 'wireframe',
        showGrid: true,
        dataSource: 'mock',
      }}
    >
      <AppContent />
    </WireframeProvider>
  );
}
```

### Wireframe Settings

The system persists settings in development mode:
- Settings are stored in `localStorage`
- Automatically restored on app reload
- Can be reset by clearing localStorage

## Wireframe Screens

### Available Screens

1. **WireframePlaydateDiscovery**: Interactive wireframe of the playdate discovery flow
2. **EnhancedPetProfile**: Pet profile management interface
3. **HealthPassport**: Health tracking and vaccination records
4. **SafetyWelfare**: Community rules and incident reporting

### Accessing Wireframe Screens

Wireframe screens are available in development builds:

```typescript
// Navigate to wireframe version
navigation.navigate('WireframePlaydateDiscovery', { petId: 'demo-pet' });
```

## Export Formats

### HTML Export

Generates interactive HTML wireframes that can be:
- Opened in any web browser
- Shared with stakeholders
- Used for design reviews
- Printed for documentation

### JSON Export

Structured data format containing:
- Component specifications
- Layout information
- Interaction definitions
- Design system references

### Design Tokens

Comprehensive documentation of:
- Color system
- Typography scale
- Spacing system
- Border radius values
- Shadow definitions

## Development Workflow

### 1. Create Wireframe Version

```typescript
// Create WireframeMyScreen.tsx
import { WireframeScreen, WireframeCard } from '../components/wireframe';

export default function WireframeMyScreen() {
  return (
    <WireframeScreen title="My Feature">
      <WireframeCard title="Main Content" height={200} />
      <WireframeCard title="Secondary Content" height={150} />
    </WireframeScreen>
  );
}
```

### 2. Add to Navigation

```typescript
// In navigation/types.ts
WireframeMyScreen: { param?: string };

// In App.tsx
import WireframeMyScreen from './screens/WireframeMyScreen';

// Add to Stack.Navigator
<Stack.Screen
  name="WireframeMyScreen"
  component={WireframeMyScreen}
  options={screenTransitions.fluid}
/>
```

### 3. Export and Share

```bash
pnpm wireframe:export-my-screen
# Generates wireframes/my-screen.html
```

## Best Practices

### Component Design
- Use semantic component names in wireframe mode
- Include interaction hints in component labels
- Maintain consistent spacing and sizing
- Use realistic content dimensions

### Data Handling
- Provide meaningful mock data
- Include edge cases and loading states
- Show error states when relevant
- Use realistic user-generated content

### Export Strategy
- Export wireframes before design reviews
- Include multiple interaction states
- Document assumptions and constraints
- Version control wireframe exports

## Troubleshooting

### Common Issues

**Wireframe controls not showing**
- Ensure WireframeProvider wraps the app
- Check that `__DEV__` is true
- Verify localStorage settings

**Components not switching modes**
- Import `useWireframe` hook
- Check conditional rendering logic
- Verify theme prop usage

**Export scripts failing**
- Ensure `tsx` is installed: `pnpm add tsx -D`
- Check file permissions on wireframes directory
- Verify TypeScript compilation

## File Structure

```
src/components/wireframe/
├── WireframeSystem.tsx      # Context and provider
├── WireframeComponents.tsx  # Reusable components
└── index.ts                 # Main exports

src/utils/
└── wireframeExport.ts       # Export utilities

src/screens/
└── Wireframe*.tsx          # Wireframe screen versions

scripts/
├── wireframe-export-*.ts    # Export scripts
└── wireframe-generate-tokens.ts

wireframes/
├── playdate-discovery.html
├── enhanced-pet-profile.html
└── ...

docs/
└── DESIGN_TOKENS.md
```

## API Reference

### WireframeProvider Props
- `config`: Partial wireframe configuration
- `children`: React components to wrap

### useWireframe Hook
Returns current wireframe configuration:
- `enabled`: boolean
- `theme`: 'wireframe' | 'mockup' | 'production'
- `showGrid`: boolean
- `showMeasurements`: boolean
- `interactiveMode`: boolean
- `dataSource`: 'mock' | 'api' | 'hybrid'

### WireframeCard Props
- `title`: Component label
- `content`: Optional React content
- `interactive`: Enable interactions (default: true)
- `height`: Component height

### WireframeScreen Props
- `title`: Screen title
- `children`: Screen content
- `showHeader`: Show header bar
- `showTabs`: Show tab navigation
- `tabLabels`: Array of tab labels

## Contributing

### Adding New Wireframe Components

1. Create component in `WireframeComponents.tsx`
2. Add conditional rendering logic
3. Export from `index.ts`
4. Update documentation

### Adding New Wireframe Screens

1. Create `Wireframe[ScreenName].tsx`
2. Add to navigation types
3. Register in App.tsx Stack.Navigator
4. Create export script if needed
5. Update documentation

The wireframe system is designed to be extensible and maintainable, following the same patterns as the main application architecture.
