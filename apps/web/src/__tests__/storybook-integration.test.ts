/**
 * 🧪 COMPREHENSIVE STORYBOOK INTEGRATION TESTS
 * Tests for Storybook configuration, component stories, and documentation
 */

import {} from '@testing-library/react';
import React from 'react';
import PremiumButton from '../components/ui/PremiumButton';

describe('Storybook Integration Tests', () => {
  describe('Storybook Configuration', () => {
    test('should have proper Storybook dependencies installed', () => {
      // Check that Storybook packages are available
      expect(require('@storybook/react')).toBeDefined();
      expect(require('@storybook/nextjs')).toBeDefined();
      expect(require('@storybook/addon-essentials')).toBeDefined();
      expect(require('@storybook/addon-a11y')).toBeDefined();
      expect(require('@storybook/addon-interactions')).toBeDefined();
    });

    test('should have Storybook configuration files', () => {
      // Check that main Storybook config exists
      const fs = require('fs');
      const path = require('path');

      const mainConfigPath = path.join(process.cwd(), '.storybook', 'main.ts');
      const previewConfigPath = path.join(process.cwd(), '.storybook', 'preview.ts');

      expect(fs.existsSync(mainConfigPath)).toBe(true);
      expect(fs.existsSync(previewConfigPath)).toBe(true);
    });

    test('should have proper Storybook scripts in package.json', () => {
      const packageJson = require('../../package.json');

      expect(packageJson.scripts.storybook).toBeDefined();
      expect(packageJson.scripts['build-storybook']).toBeDefined();
      expect(packageJson.scripts.storybook).toContain('storybook dev');
      expect(packageJson.scripts['build-storybook']).toContain('storybook build');
    });
  });

  describe('Component Story Integration', () => {
    test('PremiumButton component should render with all variants', () => {
      // Test primary variant
      const { rerender } = render(
        React.createElement(PremiumButton, { variant: 'primary' }, 'Test Button'),
      );
      expect(screen.getByText('Test Button')).toBeInTheDocument();

      // Test secondary variant
      rerender(React.createElement(PremiumButton, { variant: 'secondary' }, 'Secondary Button'));
      expect(screen.getByText('Secondary Button')).toBeInTheDocument();

      // Test glass variant
      rerender(React.createElement(PremiumButton, { variant: 'glass' }, 'Glass Button'));
      expect(screen.getByText('Glass Button')).toBeInTheDocument();
    });

    test('PremiumButton should handle different sizes', () => {
      const { rerender } = render(
        React.createElement(PremiumButton, { size: 'sm' }, 'Small Button'),
      );
      const button = screen.getByText('Small Button');
      expect(button).toBeInTheDocument();

      rerender(React.createElement(PremiumButton, { size: 'lg' }, 'Large Button'));
      expect(screen.getByText('Large Button')).toBeInTheDocument();
    });

    test('PremiumButton should handle disabled state', () => {
      render(React.createElement(PremiumButton, { disabled: true }, 'Disabled Button'));
      const button = screen.getByText('Disabled Button');
      expect(button).toBeDisabled();
    });

    test('PremiumButton should handle loading state', () => {
      render(React.createElement(PremiumButton, { loading: true }, 'Loading Button'));
      const button = screen.getByText('Loading Button');
      expect(button).toBeInTheDocument();
      // Should have loading indicator
      expect(button.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Storybook Addons Integration', () => {
    test('should have accessibility addon configured', () => {
      const mainConfig = require('../../.storybook/main.ts').default;
      expect(mainConfig.addons).toContain('@storybook/addon-a11y');
    });

    test('should have interactions addon configured', () => {
      const mainConfig = require('../../.storybook/main.ts').default;
      expect(mainConfig.addons).toContain('@storybook/addon-interactions');
    });

    test('should have viewport addon configured', () => {
      const mainConfig = require('../../.storybook/main.ts').default;
      expect(mainConfig.addons).toContain('@storybook/addon-viewport');
    });

    test('should have essentials addon configured', () => {
      const mainConfig = require('../../.storybook/main.ts').default;
      expect(mainConfig.addons).toContain('@storybook/addon-essentials');
    });
  });

  describe('Storybook Stories Structure', () => {
    test('should have PremiumButton stories file', () => {
      const fs = require('fs');
      const path = require('path');

      const storiesPath = path.join(
        process.cwd(),
        'src',
        'components',
        'UI',
        'PremiumButton.stories.tsx',
      );
      expect(fs.existsSync(storiesPath)).toBe(true);
    });

    test('PremiumButton stories should export all variants', () => {
      const stories = require('../components/UI/PremiumButton.stories.tsx').default;

      // Check that stories export contains all expected variants
      expect(stories).toHaveProperty('Primary');
      expect(stories).toHaveProperty('Secondary');
      expect(stories).toHaveProperty('Glass');
      expect(stories).toHaveProperty('Gradient');
      expect(stories).toHaveProperty('Neon');
    });

    test('stories should have proper meta configuration', () => {
      const stories = require('../components/UI/PremiumButton.stories.tsx').default;

      expect(stories.meta).toBeDefined();
      expect(stories.meta.title).toBe('UI/PremiumButton');
      expect(stories.meta.component).toBe(PremiumButton);
    });
  });

  describe('Storybook Build Verification', () => {
    test('should be able to import Storybook components without errors', () => {
      // This test ensures that all Storybook imports work correctly
      expect(() => {
        require('@storybook/react');
        require('@storybook/nextjs');
        require('@storybook/addon-essentials');
        require('@storybook/addon-a11y');
        require('@storybook/addon-interactions');
      }).not.toThrow();
    });

    test('should have proper TypeScript configuration for Storybook', () => {
      const fs = require('fs');
      const path = require('path');

      const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));

      // Check that Storybook types are included
      expect(tsConfig.compilerOptions.types).toContain('@storybook/react');
    });
  });
});

describe('Component Documentation Tests', () => {
  test('PremiumButton should have proper prop documentation', () => {
    // Check that component has proper TypeScript interfaces
    const componentSource = require('fs').readFileSync(
      require('path').join(process.cwd(), 'src', 'components', 'UI', 'PremiumButton.tsx'),
      'utf8',
    );

    expect(componentSource).toContain('interface PremiumButtonProps');
    expect(componentSource).toContain('variant?:');
    expect(componentSource).toContain('size?:');
    expect(componentSource).toContain('disabled?:');
    expect(componentSource).toContain('loading?:');
  });

  test('stories should have proper controls configuration', () => {
    const stories = require('../components/UI/PremiumButton.stories.tsx').default;

    // Check that stories have proper argTypes for controls
    expect(stories.meta.argTypes).toBeDefined();
    expect(stories.meta.argTypes.variant).toBeDefined();
    expect(stories.meta.argTypes.size).toBeDefined();
    expect(stories.meta.argTypes.disabled).toBeDefined();
  });
});
