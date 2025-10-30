# AI Components - Storybook Stories

## Overview

This directory contains comprehensive Storybook stories for the AI Bio
generation components, providing interactive documentation and testing
capabilities.

## Components with Stories

### 1. PetInfoForm (`PetInfoForm.stories.tsx`)

**Purpose**: Form component for collecting pet information (name, breed, age,
personality)

**Stories Available**:

- **Default**: Empty form ready for input
- **FilledOut**: Form with all fields completed
- **WithValidationErrors**: Shows error states for required fields
- **PartialInput**: Some fields filled, others empty
- **LongPersonalityText**: Demonstrates character counting
- **Interactive**: Fully interactive demonstration

**Features Demonstrated**:

- Real-time validation
- Character counting
- Error state displays
- Various input scenarios

### 2. ToneSelector (`ToneSelector.stories.tsx`)

**Purpose**: Visual selector for choosing AI bio generation tone

**Stories Available**:

- **Playful**: Playful tone selected
- **Professional**: Professional tone selected
- **Casual**: Casual tone selected
- **Romantic**: Romantic tone selected
- **Mysterious**: Mysterious tone selected
- **NoSelection**: Default state
- **Interactive**: Clickable tone selection

**Features Demonstrated**:

- Visual card selection
- Selected state with checkmark
- All 5 tone variations
- Interactive selection

### 3. BioResults (`BioResults.stories.tsx`)

**Purpose**: Displays AI-generated bio with analysis and actions

**Stories Available**:

- **PlayfulBio**: Bio with playful tone
- **ProfessionalBio**: Bio with professional tone
- **CasualBio**: Bio with casual tone
- **RomanticBio**: Bio with romantic tone
- **MysteriousBio**: Bio with mysterious tone
- **HighScore**: Very high match score (95+)
- **MediumScore**: Medium match score (60-80)
- **LowScore**: Low match score (<50)
- **AllTones**: Carousel showing all variations

**Features Demonstrated**:

- Bio text display
- Sentiment analysis
- Match score with color coding
- Keywords/traits display
- Copy, save, and regenerate actions
- Score variations

### 4. AIBioScreen (`AIBioScreen.stories.tsx`)

**Purpose**: Complete screen integration showing full user flow

**Stories Available**:

- **DefaultScreen**: Empty form state
- **GeneratingState**: Loading/generating state
- **WithGeneratedBio**: Results display state
- **InteractiveFlow**: Full interactive flow
- **ErrorState**: Error handling state

**Features Demonstrated**:

- Complete user journey
- State transitions
- Error handling
- Full integration

## Mock Data

Mock data and fixtures are available in `src/stories/mocks/bioMocks.ts`:

### Mock Bios

- `mockBioPlayful`: Playful tone bio
- `mockBioProfessional`: Professional tone bio
- `mockBioCasual`: Casual tone bio
- `mockBioRomantic`: Romantic tone bio
- `mockBioMysterious`: Mysterious tone bio
- `mockBios`: Array of all mock bios

### Mock Form Data

- `mockFormData.empty`: Empty form state
- `mockFormData.valid`: Complete valid data
- `mockFormData.partial`: Partial data
- `mockFormData.withPhoto`: Form with photo

### Mock Validation

- `mockValidationErrors`: No errors
- `mockValidationErrorsWithErrors`: All fields have errors

## Running Stories

```bash
# Start Storybook dev server
pnpm storybook

# Build Storybook
pnpm storybook:build

# Reset Storybook cache
pnpm storybook:reset
```

## Best Practices

### 1. Story Naming

- Use descriptive names that indicate the story's purpose
- Include the component name in the title
- Use PascalCase for story names

### 2. Story Organization

- Group related stories together
- Use clear categories (AI, Components, etc.)
- Provide comprehensive notes for each story

### 3. Interactive Stories

- Include at least one interactive story per component
- Use action() from @storybook/addon-actions for event tracking
- Provide mock implementations for dependencies

### 4. Mock Data

- Create realistic mock data
- Include edge cases and variations
- Keep mocks in dedicated files for reusability

### 5. Documentation

- Add markdown notes to each story
- Document props and their purposes
- Include usage examples in notes

## Integration with Tests

Stories complement unit tests by providing:

- Visual regression testing
- Interactive component exploration
- Documentation for developers
- Design system reference

## Accessibility

All stories include:

- Proper accessibility labels
- Touchable/clickable elements
- ARIA attributes where applicable
- Screen reader friendly

## Performance

Stories are optimized for:

- Fast loading times
- Minimal re-renders
- Efficient mock data
- Smooth interactions

## Contributing

When adding new stories:

1. Create mock data for new components
2. Add comprehensive stories showing all states
3. Include interactive demonstrations
4. Update this README
5. Add notes explaining the component

## Troubleshooting

### Storybook won't start

```bash
pnpm storybook:reset
pnpm install
pnpm storybook
```

### Stories not appearing

- Check file naming: `*.stories.tsx`
- Verify imports are correct
- Check story file is in correct directory

### Mock data errors

- Verify mock imports
- Check TypeScript types
- Ensure mock structure matches component props

## Resources

- [Storybook Documentation](https://storybook.js.org/docs/react-native/welcome)
- [React Native Storybook](https://github.com/storybookjs/react-native)
- [Storybook Addons](https://storybook.js.org/addons)
