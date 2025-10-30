/**
 * UI Page Integration Tests
 * Tests theme toggle, language switch, and component rendering
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import UIDemoPage from '../page';

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'ui.theme': 'Theme',
        'ui.language': 'Language',
        'ui.buttons.primary': 'Primary',
        'ui.buttons.secondary': 'Secondary',
        'ui.buttons.outline': 'Outline',
        'ui.buttons.ghost': 'Ghost',
        'ui.badges.primary': 'Primary',
        'ui.badges.secondary': 'Secondary',
        'ui.badges.success': 'Success',
        'ui.badges.warning': 'Warning',
        'ui.badges.danger': 'Danger',
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
    },
  }),
}));

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('UI Page Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without throwing when core is present', () => {
      expect(() => {
        render(<UIDemoPage />);
      }).not.toThrow();
    });

    it('renders all UI sections', () => {
      render(<UIDemoPage />);
      
      // Check controls bar
      expect(screen.getByTestId('ui-controls')).toBeInTheDocument();
      
      // Check theme controls
      expect(screen.getByTestId('ui-theme-light')).toBeInTheDocument();
      expect(screen.getByTestId('ui-theme-dark')).toBeInTheDocument();
      
      // Check language controls
      expect(screen.getByTestId('ui-lang-en')).toBeInTheDocument();
      expect(screen.getByTestId('ui-lang-bg')).toBeInTheDocument();
      
      // Check demo sections
      expect(screen.getByTestId('ui-demo')).toBeInTheDocument();
      expect(screen.getByTestId('ui-buttons')).toBeInTheDocument();
      expect(screen.getByTestId('ui-badges')).toBeInTheDocument();
    });

    it('renders all button variants', () => {
      render(<UIDemoPage />);
      
      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Secondary')).toBeInTheDocument();
      expect(screen.getByText('Outline')).toBeInTheDocument();
      expect(screen.getByText('Ghost')).toBeInTheDocument();
    });

    it('renders all badge variants', () => {
      render(<UIDemoPage />);
      
      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Secondary')).toBeInTheDocument();
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByText('Danger')).toBeInTheDocument();
    });
  });

  describe('Theme Toggle', () => {
    it('switches theme from light to dark', () => {
      render(<UIDemoPage />);
      
      const darkButton = screen.getByTestId('ui-theme-dark');
      const lightButton = screen.getByTestId('ui-theme-light');
      
      // Initially light theme
      expect(lightButton).toHaveClass('bg-blue-600', 'text-white');
      expect(darkButton).toHaveClass('bg-transparent', 'text-gray-600');
      
      // Switch to dark theme
      fireEvent.click(darkButton);
      
      // Now dark theme should be active
      expect(darkButton).toHaveClass('bg-blue-600', 'text-white');
      expect(lightButton).toHaveClass('bg-transparent', 'text-gray-600');
    });

    it('switches theme from dark to light', () => {
      render(<UIDemoPage />);
      
      const darkButton = screen.getByTestId('ui-theme-dark');
      const lightButton = screen.getByTestId('ui-theme-light');
      
      // Switch to dark first
      fireEvent.click(darkButton);
      
      // Then switch back to light
      fireEvent.click(lightButton);
      
      // Light theme should be active again
      expect(lightButton).toHaveClass('bg-blue-600', 'text-white');
      expect(darkButton).toHaveClass('bg-transparent', 'text-gray-600');
    });

    it('updates page background when theme changes', () => {
      render(<UIDemoPage />);
      
      const container = screen.getByTestId('ui-demo').parentElement;
      const darkButton = screen.getByTestId('ui-theme-dark');
      
      // Initially light background
      expect(container).toHaveClass('bg-gray-50');
      
      // Switch to dark theme
      fireEvent.click(darkButton);
      
      // Should have dark background
      expect(container).toHaveClass('bg-gray-900');
    });
  });

  describe('Language Switch', () => {
    it('switches language from EN to BG', () => {
      render(<UIDemoPage />);
      
      const bgButton = screen.getByTestId('ui-lang-bg');
      const enButton = screen.getByTestId('ui-lang-en');
      
      // Initially EN is active
      expect(enButton).toHaveClass('bg-blue-600', 'text-white');
      expect(bgButton).toHaveClass('bg-transparent', 'text-gray-600');
      
      // Switch to BG
      fireEvent.click(bgButton);
      
      // BG should now be active
      expect(bgButton).toHaveClass('bg-blue-600', 'text-white');
      expect(enButton).toHaveClass('bg-transparent', 'text-gray-600');
    });

    it('switches language from BG to EN', () => {
      render(<UIDemoPage />);
      
      const bgButton = screen.getByTestId('ui-lang-bg');
      const enButton = screen.getByTestId('ui-lang-en');
      
      // Switch to BG first
      fireEvent.click(bgButton);
      
      // Then switch back to EN
      fireEvent.click(enButton);
      
      // EN should be active again
      expect(enButton).toHaveClass('bg-blue-600', 'text-white');
      expect(bgButton).toHaveClass('bg-transparent', 'text-gray-600');
    });
  });

  describe('Component Interactions', () => {
    it('buttons are clickable and maintain state', () => {
      render(<UIDemoPage />);
      
      const primaryButton = screen.getByText('Primary');
      
      expect(() => {
        fireEvent.click(primaryButton);
      }).not.toThrow();
    });

    it('theme and language switches work independently', () => {
      render(<UIDemoPage />);
      
      const darkButton = screen.getByTestId('ui-theme-dark');
      const bgButton = screen.getByTestId('ui-lang-bg');
      
      // Switch to dark theme
      fireEvent.click(darkButton);
      expect(darkButton).toHaveClass('bg-blue-600');
      
      // Switch to BG language
      fireEvent.click(bgButton);
      expect(bgButton).toHaveClass('bg-blue-600');
      
      // Both should be active
      expect(darkButton).toHaveClass('bg-blue-600');
      expect(bgButton).toHaveClass('bg-blue-600');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<UIDemoPage />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });

    it('buttons have proper roles and are keyboard accessible', () => {
      render(<UIDemoPage />);
      
      const buttons = screen.getAllByRole('button');
      
      // All buttons should be focusable
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type');
        expect(button).toBeEnabled();
      });
    });

    it('theme toggle buttons have accessible labels', () => {
      render(<UIDemoPage />);
      
      const lightButton = screen.getByTestId('ui-theme-light');
      const darkButton = screen.getByTestId('ui-theme-dark');
      
      expect(lightButton).toHaveTextContent('Light');
      expect(darkButton).toHaveTextContent('Dark');
    });

    it('language toggle buttons have accessible labels', () => {
      render(<UIDemoPage />);
      
      const enButton = screen.getByTestId('ui-lang-en');
      const bgButton = screen.getByTestId('ui-lang-bg');
      
      expect(enButton).toHaveTextContent('EN');
      expect(bgButton).toHaveTextContent('BG');
    });
  });

  describe('Visual Hierarchy', () => {
    it('maintains proper heading structure', () => {
      render(<UIDemoPage />);
      
      const headings = screen.getAllByRole('heading');
      
      // Should have h2 headings for sections
      expect(headings).toHaveLength(2); // Button and Badge sections
      
      headings.forEach(heading => {
        expect(heading).toHaveClass('text-2xl', 'font-bold');
      });
    });

    it('provides descriptive text for sections', () => {
      render(<UIDemoPage />);
      
      // Check for section descriptions
      expect(screen.getByText(/Primary actions and interactions/)).toBeInTheDocument();
      expect(screen.getByText(/Labels and status indicators/)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('uses responsive utilities', () => {
      render(<UIDemoPage />);
      
      const controlsBar = screen.getByTestId('ui-controls');
      const demoGrid = screen.getByTestId('ui-demo');
      
      // Should use responsive classes
      expect(controlsBar).toHaveClass('flex-wrap');
      expect(demoGrid).toHaveClass('space-y-12');
    });
  });

  describe('State Management', () => {
    it('maintains theme state across re-renders', () => {
      const { rerender } = render(<UIDemoPage />);
      
      const darkButton = screen.getByTestId('ui-theme-dark');
      
      // Switch to dark theme
      fireEvent.click(darkButton);
      expect(darkButton).toHaveClass('bg-blue-600');
      
      // Re-render component
      rerender(<UIDemoPage />);
      
      // Theme should still be dark
      expect(darkButton).toHaveClass('bg-blue-600');
    });

    it('maintains language state across re-renders', () => {
      const { rerender } = render(<UIDemoPage />);
      
      const bgButton = screen.getByTestId('ui-lang-bg');
      
      // Switch to BG language
      fireEvent.click(bgButton);
      expect(bgButton).toHaveClass('bg-blue-600');
      
      // Re-render component
      rerender(<UIDemoPage />);
      
      // Language should still be BG
      expect(bgButton).toHaveClass('bg-blue-600');
    });
  });
});
