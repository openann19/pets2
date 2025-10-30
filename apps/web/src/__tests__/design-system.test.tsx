import '@testing-library/jest-dom';
/**
 * 🧪 COMPREHENSIVE DESIGN SYSTEM TESTS
 * Tests for CSS variables, design tokens, and utility classes
 */

describe('Design System Integration Tests', () => {
  beforeEach(() => {
    // Load the CSS variables into test environment
    document.head.innerHTML = `
      <style>
        :root {
          --pm-primary-500: #ec4899;
          --pm-primary-600: #db2777;
          --pm-secondary-500: #0ea5e9;
          --pm-font-size-xs: 0.75rem;
          --pm-font-size-sm: 0.875rem;
          --pm-font-size-base: 1rem;
          --pm-font-size-lg: 1.125rem;
          --pm-font-size-xl: 1.25rem;
          --pm-font-size-2xl: 1.5rem;
          --pm-font-size-3xl: 1.875rem;
          --pm-font-size-4xl: 2.25rem;
          --pm-font-size-5xl: 3rem;
          --pm-font-size-6xl: 3.75rem;
          --pm-font-size-7xl: 4.5rem;
          --pm-font-size-8xl: 6rem;
          --pm-font-size-9xl: 8rem;
          
          --pm-space-1: 0.25rem;
          --pm-space-2: 0.5rem;
          --pm-space-3: 0.75rem;
          --pm-space-4: 1rem;
          --pm-space-5: 1.25rem;
          --pm-space-6: 1.5rem;
          --pm-space-8: 2rem;
          --pm-space-10: 2.5rem;
          --pm-space-12: 3rem;
          --pm-space-16: 4rem;
          --pm-space-20: 5rem;
          --pm-space-24: 6rem;
          --pm-space-32: 8rem;
          
          --pm-shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --pm-shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          --pm-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --pm-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --pm-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          --pm-shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          --pm-shadow-3xl: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
          
          --pm-radius-sm: 0.375rem;
          --pm-radius-md: 0.5rem;
          --pm-radius-lg: 0.75rem;
          --pm-radius-xl: 1rem;
          --pm-radius-2xl: 1.5rem;
          --pm-radius-3xl: 2rem;
          --pm-radius-4xl: 2.5rem;
          --pm-radius-full: 9999px;
        }
      </style>
    `;
  });

  describe('CSS Variables System', () => {
    test('should have all primary color variables defined', () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);

      expect(computedStyle.getPropertyValue('--pm-primary-500')).equal('#ec4899');
      expect(computedStyle.getPropertyValue('--pm-primary-600')).equal('#db2777');
    });

    test('should have all secondary color variables defined', () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);

      expect(computedStyle.getPropertyValue('--pm-secondary-500')).equal('#0ea5e9');
    });

    test('should have complete typography scale', () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);

      expect(computedStyle.getPropertyValue('--pm-font-size-xs')).equal('0.75rem');
      // (imports removed; should be at top level only)
      expect(computedStyle.getPropertyValue('--pm-font-size-base')).equal('1rem');
      expect(computedStyle.getPropertyValue('--pm-font-size-lg')).equal('1.125rem');
      expect(computedStyle.getPropertyValue('--pm-font-size-xl')).equal('1.25rem');
      expect(computedStyle.getPropertyValue('--pm-font-size-2xl')).equal('1.5rem');
      expect(computedStyle.getPropertyValue('--pm-font-size-3xl')).equal('1.875rem');
      expect(computedStyle.getPropertyValue('--pm-font-size-4xl')).equal('2.25rem');
      expect(computedStyle.getPropertyValue('--pm-font-size-5xl')).equal('3rem');
      expect(computedStyle.getPropertyValue('--pm-font-size-6xl')).equal('3.75rem');
      expect(computedStyle.getPropertyValue('--pm-font-size-7xl')).equal('4.5rem');
      expect(computedStyle.getPropertyValue('--pm-font-size-8xl')).equal('6rem');
      expect(computedStyle.getPropertyValue('--pm-font-size-9xl')).equal('8rem');
    });

    test('should have complete spacing scale', () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);

      expect(computedStyle.getPropertyValue('--pm-space-1')).equal('0.25rem');
      expect(computedStyle.getPropertyValue('--pm-space-2')).equal('0.5rem');
      expect(computedStyle.getPropertyValue('--pm-space-3')).equal('0.75rem');
      expect(computedStyle.getPropertyValue('--pm-space-4')).equal('1rem');
      expect(computedStyle.getPropertyValue('--pm-space-5')).equal('1.25rem');
      expect(computedStyle.getPropertyValue('--pm-space-6')).equal('1.5rem');
      expect(computedStyle.getPropertyValue('--pm-space-8')).equal('2rem');
      expect(computedStyle.getPropertyValue('--pm-space-10')).equal('2.5rem');
      expect(computedStyle.getPropertyValue('--pm-space-12')).equal('3rem');
      expect(computedStyle.getPropertyValue('--pm-space-16')).equal('4rem');
      expect(computedStyle.getPropertyValue('--pm-space-20')).equal('5rem');
      expect(computedStyle.getPropertyValue('--pm-space-24')).equal('6rem');
      expect(computedStyle.getPropertyValue('--pm-space-32')).equal('8rem');
    });

    test('should have complete shadow system', () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);

      expect(computedStyle.getPropertyValue('--pm-shadow-xs')).contain('rgba');
      expect(computedStyle.getPropertyValue('--pm-shadow-sm')).contain('rgba');
      expect(computedStyle.getPropertyValue('--pm-shadow-md')).contain('rgba');
      expect(computedStyle.getPropertyValue('--pm-shadow-lg')).contain('rgba');
      expect(computedStyle.getPropertyValue('--pm-shadow-xl')).contain('rgba');
      expect(computedStyle.getPropertyValue('--pm-shadow-2xl')).contain('rgba');
      expect(computedStyle.getPropertyValue('--pm-shadow-3xl')).contain('rgba');
    });

    test('should have complete border radius system', () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);

      expect(computedStyle.getPropertyValue('--pm-radius-sm')).equal('0.375rem');
      expect(computedStyle.getPropertyValue('--pm-radius-md')).equal('0.5rem');
      expect(computedStyle.getPropertyValue('--pm-radius-lg')).equal('0.75rem');
      expect(computedStyle.getPropertyValue('--pm-radius-xl')).equal('1rem');
      expect(computedStyle.getPropertyValue('--pm-radius-2xl')).equal('1.5rem');
      expect(computedStyle.getPropertyValue('--pm-radius-3xl')).equal('2rem');
      expect(computedStyle.getPropertyValue('--pm-radius-4xl')).equal('2.5rem');
      expect(computedStyle.getPropertyValue('--pm-radius-full')).equal('9999px');
    });
  });

  describe('Utility Classes Integration', () => {
    test('should apply typography utility classes correctly', () => {
      const element = document.createElement('div');
      element.className = 'text-xs font-medium leading-5';
      document.body.appendChild(element);

      const computedStyle = getComputedStyle(element);
      expect(computedStyle.fontSize).equal('0.75rem');
      expect(computedStyle.fontWeight).equal('500');
      expect(computedStyle.lineHeight).equal('1.25rem');
    });

    test('should apply spacing utility classes correctly', () => {
      const element = document.createElement('div');
      element.className = 'p-4 m-2';
      document.body.appendChild(element);

      const computedStyle = getComputedStyle(element);
      expect(computedStyle.padding).equal('1rem');
      expect(computedStyle.margin).equal('0.5rem');
    });

    test('should apply shadow utility classes correctly', () => {
      const element = document.createElement('div');
      element.className = 'shadow-lg';
      document.body.appendChild(element);

      const computedStyle = getComputedStyle(element);
      expect(computedStyle.boxShadow).contain('rgba');
    });
  });

  describe('Dark Mode Support', () => {
    test('should have dark mode color variables', () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);

      // Test that dark mode variables are available
      expect(!!computedStyle.getPropertyValue('--pm-dark-bg-primary')).equal(true);
      expect(!!computedStyle.getPropertyValue('--pm-dark-text-primary')).equal(true);
    });
  });
});
