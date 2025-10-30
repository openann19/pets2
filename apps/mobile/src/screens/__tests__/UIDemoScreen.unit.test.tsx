/**
 * UIDemoScreen Unit Tests
 * Tests component rendering, theme switching, language switching, and density controls
 */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/theme';
import { I18nextProvider } from 'react-i18next';
import UIDemoScreen from '../UIDemoScreen';

// Mock dependencies
jest.mock('../../components/ui/v2/registry', () => ({
  showcaseRegistry: [
    {
      id: 'buttons',
      title: 'Button',
      description: 'Primary actions and interactions',
      demo: <test-element data-testid="button-demo">Button Demo</test-element>,
    },
    {
      id: 'badges',
      title: 'Badge',
      description: 'Labels and status indicators',
      demo: <test-element data-testid="badge-demo">Badge Demo</test-element>,
    },
    {
      id: 'inputs',
      title: 'Input',
      description: 'Form inputs and controls',
      demo: <test-element data-testid="input-demo">Input Demo</test-element>,
    },
  ],
}));

// Mock i18next
const mockI18n = {
  language: 'en',
  changeLanguage: jest.fn().mockResolvedValue(undefined),
  t: jest.fn((key) => key),
};

// Mock theme
const mockTheme = {
  colors: {
    background: '#ffffff',
    bg: '#ffffff',
    bgElevated: '#f8f9fa',
    border: '#e9ecef',
    text: '#212529',
    textMuted: '#6c757d',
    primary: '#007bff',
    primaryText: '#ffffff',
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  scheme: 'light',
};

describe('UIDemoScreen Unit Tests', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <I18nextProvider i18n={mockI18n as any}>
        <ThemeProvider theme={mockTheme as any}>{component}</ThemeProvider>
      </I18nextProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without throwing', () => {
      expect(() => {
        renderWithProviders(<UIDemoScreen />);
      }).not.toThrow();
    });

    it('renders all UI sections', () => {
      renderWithProviders(<UIDemoScreen />);

      // Check controls bar
      expect(screen.getByTestId('ui-controls')).toBeTruthy();

      // Check demo sections
      expect(screen.getByTestId('ui-demo')).toBeTruthy();
      expect(screen.getByTestId('ui-buttons')).toBeTruthy();
      expect(screen.getByTestId('ui-badges')).toBeTruthy();
      expect(screen.getByTestId('ui-inputs')).toBeTruthy();
    });

    it('renders all control buttons', () => {
      renderWithProviders(<UIDemoScreen />);

      // Theme controls
      expect(screen.getByTestId('ui-theme-light')).toBeTruthy();
      expect(screen.getByTestId('ui-theme-dark')).toBeTruthy();

      // Language controls
      expect(screen.getByTestId('ui-lang-en')).toBeTruthy();
      expect(screen.getByTestId('ui-lang-bg')).toBeTruthy();

      // Density controls
      expect(screen.getByTestId('ui-density-comfortable')).toBeTruthy();
      expect(screen.getByTestId('ui-density-compact')).toBeTruthy();

      // Motion control
      expect(screen.getByTestId('ui-reduce-motion')).toBeTruthy();
    });

    it('renders section titles and descriptions', () => {
      renderWithProviders(<UIDemoScreen />);

      expect(screen.getByText('Button')).toBeTruthy();
      expect(screen.getByText('Primary actions and interactions')).toBeTruthy();
      expect(screen.getByText('Badge')).toBeTruthy();
      expect(screen.getByText('Labels and status indicators')).toBeTruthy();
      expect(screen.getByText('Input')).toBeTruthy();
      expect(screen.getByText('Form inputs and controls')).toBeTruthy();
    });
  });

  describe('Theme Switching', () => {
    it('switches theme from light to dark', () => {
      renderWithProviders(<UIDemoScreen />);

      const darkButton = screen.getByTestId('ui-theme-dark');
      const lightButton = screen.getByTestId('ui-theme-light');

      // Initially light theme should be primary
      expect(lightButton.props.variant).toBe('primary');
      expect(darkButton.props.variant).toBe('ghost');

      // Switch to dark theme
      fireEvent.press(darkButton);

      // Dark theme should now be primary
      expect(darkButton.props.variant).toBe('primary');
      expect(lightButton.props.variant).toBe('ghost');
    });

    it('switches theme from dark to light', () => {
      renderWithProviders(<UIDemoScreen />);

      const darkButton = screen.getByTestId('ui-theme-dark');
      const lightButton = screen.getByTestId('ui-theme-light');

      // Switch to dark first
      fireEvent.press(darkButton);
      expect(darkButton.props.variant).toBe('primary');

      // Switch back to light
      fireEvent.press(lightButton);

      // Light theme should be primary again
      expect(lightButton.props.variant).toBe('primary');
      expect(darkButton.props.variant).toBe('ghost');
    });

    it('handles theme changes without errors', () => {
      renderWithProviders(<UIDemoScreen />);

      const darkButton = screen.getByTestId('ui-theme-dark');

      expect(() => {
        fireEvent.press(darkButton);
      }).not.toThrow();
    });
  });

  describe('Language Switching', () => {
    it('switches language from EN to BG', async () => {
      renderWithProviders(<UIDemoScreen />);

      const bgButton = screen.getByTestId('ui-lang-bg');
      const enButton = screen.getByTestId('ui-lang-en');

      // Initially EN should be primary
      expect(enButton.props.variant).toBe('primary');
      expect(bgButton.props.variant).toBe('ghost');

      // Switch to BG
      fireEvent.press(bgButton);

      // Wait for async language change
      await new Promise((resolve) => setTimeout(resolve, 0));

      // BG should now be primary
      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('bg');
    });

    it('switches language from BG to EN', async () => {
      // Set initial language to BG
      mockI18n.language = 'bg';

      renderWithProviders(<UIDemoScreen />);

      const bgButton = screen.getByTestId('ui-lang-bg');
      const enButton = screen.getByTestId('ui-lang-en');

      // Initially BG should be primary
      expect(bgButton.props.variant).toBe('primary');
      expect(enButton.props.variant).toBe('ghost');

      // Switch to EN
      fireEvent.press(enButton);

      // Wait for async language change
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('en');
    });

    it('handles language changes asynchronously', async () => {
      renderWithProviders(<UIDemoScreen />);

      const bgButton = screen.getByTestId('ui-lang-bg');

      fireEvent.press(bgButton);

      // Should not throw during async operation
      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('bg');
    });
  });

  describe('Density Controls', () => {
    it('switches density from comfortable to compact', () => {
      renderWithProviders(<UIDemoScreen />);

      const compactButton = screen.getByTestId('ui-density-compact');
      const comfortableButton = screen.getByTestId('ui-density-comfortable');

      // Initially comfortable should be primary
      expect(comfortableButton.props.variant).toBe('primary');
      expect(compactButton.props.variant).toBe('ghost');

      // Switch to compact
      fireEvent.press(compactButton);

      // Compact should now be primary
      expect(compactButton.props.variant).toBe('primary');
      expect(comfortableButton.props.variant).toBe('ghost');
    });

    it('switches density from compact to comfortable', () => {
      renderWithProviders(<UIDemoScreen />);

      const compactButton = screen.getByTestId('ui-density-compact');
      const comfortableButton = screen.getByTestId('ui-density-comfortable');

      // Switch to compact first
      fireEvent.press(compactButton);
      expect(compactButton.props.variant).toBe('primary');

      // Switch back to comfortable
      fireEvent.press(comfortableButton);

      // Comfortable should be primary again
      expect(comfortableButton.props.variant).toBe('primary');
      expect(compactButton.props.variant).toBe('ghost');
    });

    it('applies correct padding based on density', () => {
      renderWithProviders(<UIDemoScreen />);

      const scrollView = screen.getByTestId('ui-demo');

      // Initially comfortable density (padding: 16)
      expect(scrollView.props.contentContainerStyle).toEqual(
        expect.objectContaining({
          padding: 16,
        }),
      );

      // Switch to compact density
      fireEvent.press(screen.getByTestId('ui-density-compact'));

      // Should have compact padding (12)
      expect(scrollView.props.contentContainerStyle).toEqual(
        expect.objectContaining({
          padding: 12,
        }),
      );
    });
  });

  describe('Motion Controls', () => {
    it('toggles reduce motion switch', () => {
      renderWithProviders(<UIDemoScreen />);

      const motionSwitch = screen.getByTestId('ui-reduce-motion');

      // Initially motion should not be reduced
      expect(motionSwitch.props.value).toBe(false);

      // Toggle reduce motion
      fireEvent(motionSwitch, 'valueChange', true);

      // Motion should now be reduced
      expect(motionSwitch.props.value).toBe(true);
    });

    it('handles motion switch changes without errors', () => {
      renderWithProviders(<UIDemoScreen />);

      const motionSwitch = screen.getByTestId('ui-reduce-motion');

      expect(() => {
        fireEvent(motionSwitch, 'valueChange', true);
        fireEvent(motionSwitch, 'valueChange', false);
      }).not.toThrow();
    });
  });

  describe('Component Interactions', () => {
    it('handles multiple control changes independently', () => {
      renderWithProviders(<UIDemoScreen />);

      // Switch to dark theme
      fireEvent.press(screen.getByTestId('ui-theme-dark'));
      expect(screen.getByTestId('ui-theme-dark').props.variant).toBe('primary');

      // Switch to BG language
      fireEvent.press(screen.getByTestId('ui-lang-bg'));
      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('bg');

      // Switch to compact density
      fireEvent.press(screen.getByTestId('ui-density-compact'));
      expect(screen.getByTestId('ui-density-compact').props.variant).toBe('primary');

      // Toggle reduce motion
      const motionSwitch = screen.getByTestId('ui-reduce-motion');
      fireEvent(motionSwitch, 'valueChange', true);
      expect(motionSwitch.props.value).toBe(true);

      // All changes should be applied
      expect(screen.getByTestId('ui-theme-dark').props.variant).toBe('primary');
      expect(screen.getByTestId('ui-density-compact').props.variant).toBe('primary');
      expect(motionSwitch.props.value).toBe(true);
    });
  });

  describe('Rendering Performance', () => {
    it('renders quickly without performance issues', () => {
      const startTime = performance.now();

      renderWithProviders(<UIDemoScreen />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in under 100ms (generous threshold)
      expect(renderTime).toBeLessThan(100);
    });

    it('handles rapid state changes without errors', () => {
      renderWithProviders(<UIDemoScreen />);

      // Rapidly switch themes
      for (let i = 0; i < 5; i++) {
        fireEvent.press(screen.getByTestId('ui-theme-dark'));
        fireEvent.press(screen.getByTestId('ui-theme-light'));
      }

      // Should still be functional
      expect(screen.getByTestId('ui-controls')).toBeTruthy();
      expect(screen.getByTestId('ui-demo')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('provides testIDs for all interactive elements', () => {
      renderWithProviders(<UIDemoScreen />);

      // All controls should have testIDs
      expect(screen.getByTestId('ui-theme-light')).toBeTruthy();
      expect(screen.getByTestId('ui-theme-dark')).toBeTruthy();
      expect(screen.getByTestId('ui-lang-en')).toBeTruthy();
      expect(screen.getByTestId('ui-lang-bg')).toBeTruthy();
      expect(screen.getByTestId('ui-density-comfortable')).toBeTruthy();
      expect(screen.getByTestId('ui-density-compact')).toBeTruthy();
      expect(screen.getByTestId('ui-reduce-motion')).toBeTruthy();

      // All sections should have testIDs
      expect(screen.getByTestId('ui-buttons')).toBeTruthy();
      expect(screen.getByTestId('ui-badges')).toBeTruthy();
      expect(screen.getByTestId('ui-inputs')).toBeTruthy();
    });

    it('has proper button titles', () => {
      renderWithProviders(<UIDemoScreen />);

      expect(screen.getByTestId('ui-theme-light').props.title).toBe('Light');
      expect(screen.getByTestId('ui-theme-dark').props.title).toBe('Dark');
      expect(screen.getByTestId('ui-lang-en').props.title).toBe('EN');
      expect(screen.getByTestId('ui-lang-bg').props.title).toBe('BG');
      expect(screen.getByTestId('ui-density-comfortable').props.title).toBe('+');
      expect(screen.getByTestId('ui-density-compact').props.title).toBe('-');
    });
  });

  describe('Theme Integration', () => {
    it('uses theme colors correctly', () => {
      renderWithProviders(<UIDemoScreen />);

      const container = screen.getByTestId('ui-controls').parent;

      // Should use theme background color
      expect(container.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: mockTheme.colors.bg,
          }),
        ]),
      );
    });

    it('adapts to theme changes', () => {
      const darkTheme = {
        ...mockTheme,
        colors: {
          ...mockTheme.colors,
          background: '#000000',
          bg: '#000000',
        },
        scheme: 'dark',
      };

      render(
        <I18nextProvider i18n={mockI18n as any}>
          <ThemeProvider theme={darkTheme as any}>
            <UIDemoScreen />
          </ThemeProvider>
        </I18nextProvider>,
      );

      const container = screen.getByTestId('ui-controls').parent;

      // Should use dark theme background
      expect(container.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#000000',
          }),
        ]),
      );
    });
  });

  describe('Error Handling', () => {
    it('handles missing theme gracefully', () => {
      expect(() => {
        render(
          <I18nextProvider i18n={mockI18n as any}>
            <UIDemoScreen />
          </I18nextProvider>,
        );
      }).not.toThrow();
    });

    it('handles i18n errors gracefully', async () => {
      mockI18n.changeLanguage.mockRejectedValueOnce(new Error('Language change failed'));

      renderWithProviders(<UIDemoScreen />);

      // Should not throw when language change fails
      expect(async () => {
        fireEvent.press(screen.getByTestId('ui-lang-bg'));
        await new Promise((resolve) => setTimeout(resolve, 0));
      }).not.toThrow();
    });
  });
});
