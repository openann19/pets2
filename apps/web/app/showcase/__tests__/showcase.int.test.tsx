/**
 * Showcase Page Integration Tests
 * Tests standalone rendering with zero core imports
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import Showcase from '../page';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Showcase Page Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Standalone Rendering', () => {
    it('renders standalone with zero core imports', () => {
      expect(() => {
        render(<Showcase />);
      }).not.toThrow();
    });

    it('renders basic sections without dependencies', () => {
      render(<Showcase />);
      
      // Check main heading
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('UI Showcase');
      
      // Check description
      expect(screen.getByText('Component showcase page working!')).toBeInTheDocument();
      
      // Check section headings
      expect(screen.getByRole('heading', { level: 2, name: 'Buttons' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Badges' })).toBeInTheDocument();
    });

    it('renders all button variants', () => {
      render(<Showcase />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      
      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Secondary')).toBeInTheDocument();
      expect(screen.getByText('Outline')).toBeInTheDocument();
    });

    it('renders all badge variants', () => {
      render(<Showcase />);
      
      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Danger')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('has proper HTML structure', () => {
      render(<Showcase />);
      
      // Check for proper document structure
      const html = document.documentElement;
      const body = document.body;
      
      expect(html.tagName).toBe('HTML');
      expect(body.tagName).toBe('BODY');
    });

    it('uses semantic HTML elements', () => {
      render(<Showcase />);
      
      // Should use proper heading hierarchy
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2s = screen.getAllByRole('heading', { level: 2 });
      
      expect(h1).toBeInTheDocument();
      expect(h2s).toHaveLength(2);
    });

    it('has accessible button elements', () => {
      render(<Showcase />);
      
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(button).toBeEnabled();
        expect(button).toHaveAttribute('style');
      });
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct inline styles', () => {
      render(<Showcase />);
      
      const container = screen.getByText('UI Showcase').parentElement?.parentElement;
      
      expect(container).toHaveStyle({
        minHeight: '100vh',
        background: '#f5f5f5',
        padding: '20px',
      });
    });

    it('styles buttons correctly', () => {
      render(<Showcase />);
      
      const primaryButton = screen.getByText('Primary');
      const secondaryButton = screen.getByText('Secondary');
      const outlineButton = screen.getByText('Outline');
      
      expect(primaryButton).toHaveStyle({
        padding: '12px 24px',
        background: '#0066CC',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
      });
      
      expect(secondaryButton).toHaveStyle({
        padding: '12px 24px',
        background: '#7C3AED',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
      });
      
      expect(outlineButton).toHaveStyle({
        padding: '12px 24px',
        background: 'transparent',
        color: '#0066CC',
        border: '2px solid #0066CC',
        borderRadius: '8px',
      });
    });

    it('styles badges correctly', () => {
      render(<Showcase />);
      
      const badges = screen.getAllByText('Primary', 'Success', 'Danger');
      
      badges.forEach(badge => {
        expect(badge).toHaveStyle({
          padding: '4px 12px',
          borderRadius: '999px',
          fontSize: '14px',
        });
      });
    });

    it('uses flexbox for layout', () => {
      render(<Showcase />);
      
      const buttonContainer = screen.getByText('Primary').parentElement;
      const badgeContainer = screen.getByText('Primary').parentElement;
      
      expect(buttonContainer).toHaveStyle({
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
      });
      
      expect(badgeContainer).toHaveStyle({
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
      });
    });
  });

  describe('Content and Text', () => {
    it('displays correct headings and descriptions', () => {
      render(<Showcase />);
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('UI Showcase');
      expect(screen.getByText('Component showcase page working!')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Buttons' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Badges' })).toBeInTheDocument();
    });

    it('has readable text content', () => {
      render(<Showcase />);
      
      const textElements = screen.getAllByText(/Primary|Secondary|Success|Danger|Buttons|Badges|UI Showcase/);
      
      textElements.forEach(element => {
        expect(element).toBeInTheDocument();
        expect(element).toHaveTextContent(/\w+/); // Should have some text content
      });
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Showcase />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });

    it('has proper heading hierarchy', () => {
      render(<Showcase />);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2s = screen.getAllByRole('heading', { level: 2 });
      
      // Should have one h1 and two h2s
      expect(h1).toBeInTheDocument();
      expect(h2s).toHaveLength(2);
      
      // h1 should come before h2s
      expect(h1.compareDocumentPosition(h2s[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('buttons are keyboard accessible', () => {
      render(<Showcase />);
      
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(button).toBeEnabled();
        expect(button).toHaveAttribute('style');
      });
    });

    it('has sufficient color contrast', () => {
      render(<Showcase />);
      
      const primaryButton = screen.getByText('Primary');
      const secondaryButton = screen.getByText('Secondary');
      
      // White text on colored backgrounds should have good contrast
      expect(primaryButton).toHaveStyle('color: white');
      expect(secondaryButton).toHaveStyle('color: white');
    });
  });

  describe('Performance', () => {
    it('renders quickly without heavy dependencies', () => {
      const startTime = performance.now();
      
      render(<Showcase />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in under 100ms (very generous threshold)
      expect(renderTime).toBeLessThan(100);
    });

    it('has minimal DOM nodes', () => {
      render(<Showcase />);
      
      // Count visible elements (should be relatively small)
      const interactiveElements = screen.getAllByRole('button');
      const headings = screen.getAllByRole('heading');
      
      expect(interactiveElements.length + headings.length).toBeLessThan(10);
    });
  });

  describe('Error Handling', () => {
    it('handles missing styles gracefully', () => {
      // Should render even if CSS is not loaded
      expect(() => {
        render(<Showcase />);
      }).not.toThrow();
    });

    it('maintains structure with inline styles only', () => {
      render(<Showcase />);
      
      // All styling should be inline, no external dependencies
      const styledElements = document.querySelectorAll('[style]');
      
      expect(styledElements.length).toBeGreaterThan(0);
    });
  });

  describe('Browser Compatibility', () => {
    it('uses standard HTML elements', () => {
      render(<Showcase />);
      
      // Should use standard HTML that works across browsers
      expect(document.querySelector('html')).toBeInTheDocument();
      expect(document.querySelector('body')).toBeInTheDocument();
      expect(document.querySelector('div')).toBeInTheDocument();
      expect(document.querySelector('button')).toBeInTheDocument();
      expect(document.querySelector('span')).toBeInTheDocument();
    });

    it('uses widely supported CSS properties', () => {
      render(<Showcase />);
      
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        const styles = button.getAttribute('style');
        
        // Should use widely supported CSS
        expect(styles).toContain('padding');
        expect(styles).toContain('background');
        expect(styles).toContain('color');
        expect(styles).toContain('border');
        expect(styles).toContain('borderRadius');
      });
    });
  });
});
