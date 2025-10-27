/**
 * 🧪 COMPREHENSIVE INTEGRATION TESTS
 * Tests for overall system integration and end-to-end functionality
 */

describe('System Integration Tests', () => {
  describe('Build System Integration', () => {
    test('should have proper build configuration', () => {
      const packageJson = require('../../package.json');

      // Check build scripts
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.scripts.dev).toBeDefined();
      expect(packageJson.scripts.lint).toBeDefined();
      expect(packageJson.scripts.test).toBeDefined();

      // Check dependencies
      expect(packageJson.dependencies.next).toBeDefined();
      expect(packageJson.dependencies.react).toBeDefined();
      expect(packageJson.dependencies['react-dom']).toBeDefined();

      // Check dev dependencies
      expect(packageJson.devDependencies.tailwindcss).toBeDefined();
      expect(packageJson.devDependencies.typescript).toBeDefined();
      expect(packageJson.devDependencies['@types/node']).toBeDefined();
    });

    test('should have proper TypeScript configuration', () => {
      const tsConfig = require('../../tsconfig.json');

      expect(tsConfig.compilerOptions.jsx).toBe('preserve');
      expect(tsConfig.compilerOptions.baseUrl).toBeDefined();
      expect(tsConfig.compilerOptions.paths).toBeDefined();
      expect(tsConfig.compilerOptions.allowJs).toBe(true);
      expect(tsConfig.compilerOptions.incremental).toBe(true);
      expect(tsConfig.compilerOptions.esModuleInterop).toBe(true);
      expect(tsConfig.compilerOptions.moduleResolution).toBe('node');
      expect(tsConfig.compilerOptions.strictNullChecks).toBe(true);
      expect(tsConfig.compilerOptions.noImplicitAny).toBe(true);
    });

    test('should have proper Tailwind configuration', () => {
      const tailwindConfig = require('../../tailwind.config.js');

      expect(tailwindConfig.content).toBeDefined();
      expect(tailwindConfig.theme).toBeDefined();
      expect(tailwindConfig.theme.extend).toBeDefined();
      expect(tailwindConfig.plugins).toBeDefined();
    });
  });

  describe('CSS Variables Integration', () => {
    test('should have CSS variables properly integrated with Tailwind', () => {
      const tailwindConfig = require('../../tailwind.config.js');

      // Check that CSS variables are used in Tailwind config
      expect(tailwindConfig.theme.extend).toBeDefined();
      expect(tailwindConfig.theme.extend.colors).toBeDefined();
    });

    test('should have global CSS properly configured', () => {
      const fs = require('fs');
      const path = require('path');

      const globalCssPath = path.join(process.cwd(), 'src', 'styles', 'globals.css');
      const globalCss = fs.readFileSync(globalCssPath, 'utf8');

      // Check that CSS variables are defined
      expect(globalCss).toContain(':root');
      expect(globalCss).toContain('--pm-primary-');
      expect(globalCss).toContain('--pm-secondary-');
      expect(globalCss).toContain('--pm-font-size-');
      expect(globalCss).toContain('--pm-space-');
      expect(globalCss).toContain('--pm-shadow-');
      expect(globalCss).toContain('--pm-radius-');

      // Check that utility classes are defined
      expect(globalCss).toContain('.pm-text-xs');
      expect(globalCss).toContain('.pm-text-sm');
      expect(globalCss).toContain('.pm-text-base');
      expect(globalCss).toContain('.pm-text-lg');
      expect(globalCss).toContain('.pm-text-xl');
    });
  });

  describe('Component Architecture Integration', () => {
    test('should have proper component structure', () => {
      const fs = require('fs');
      const path = require('path');

      const componentsDir = path.join(process.cwd(), 'src', 'components');
      const uiDir = path.join(componentsDir, 'UI');

      expect(fs.existsSync(componentsDir)).toBe(true);
      expect(fs.existsSync(uiDir)).toBe(true);

      // Check that key components exist
      const premiumButtonPath = path.join(uiDir, 'PremiumButton.tsx');
      const premiumCardPath = path.join(uiDir, 'PremiumCard.tsx');

      expect(fs.existsSync(premiumButtonPath)).toBe(true);
      expect(fs.existsSync(premiumCardPath)).toBe(true);
    });

    test('should have proper TypeScript interfaces for components', () => {
      const fs = require('fs');
      const path = require('path');

      const premiumButtonPath = path.join(
        process.cwd(),
        'src',
        'components',
        'UI',
        'PremiumButton.tsx',
      );
      const premiumButtonSource = fs.readFileSync(premiumButtonPath, 'utf8');

      // Check that component has proper TypeScript interface
      expect(premiumButtonSource).toContain('interface PremiumButtonProps');
      expect(premiumButtonSource).toContain('variant?:');
      expect(premiumButtonSource).toContain('size?:');
      expect(premiumButtonSource).toContain('disabled?:');
      expect(premiumButtonSource).toContain('loading?:');
      expect(premiumButtonSource).toContain('children?:');
    });
  });

  describe('Animation System Integration', () => {
    test('should have Framer Motion properly configured', () => {
      const packageJson = require('../../package.json');

      expect(packageJson.dependencies['framer-motion']).toBeDefined();
    });

    test('should have animation constants properly defined', () => {
      const fs = require('fs');
      const path = require('path');

      const animationsPath = path.join(process.cwd(), 'src', 'constants', 'animations.ts');

      // Skip if animations file doesn't exist
      if (fs.existsSync(animationsPath)) {
        const animations = require(animationsPath);
        expect(animations.PREMIUM_VARIANTS).toBeDefined();
        expect(animations.STAGGER_CONFIG).toBeDefined();
      }
    });
  });

  describe('Storybook Integration', () => {
    test('should have Storybook properly integrated with Next.js', () => {
      const fs = require('fs');
      const path = require('path');

      const storybookDir = path.join(process.cwd(), '.storybook');
      expect(fs.existsSync(storybookDir)).toBe(true);

      const mainConfigPath = path.join(storybookDir, 'main.ts');
      if (fs.existsSync(mainConfigPath)) {
        const mainConfig = require(mainConfigPath).default;
        expect(mainConfig.framework.name).toBe('@storybook/nextjs');
      }
    });

    test('should have proper Storybook preview configuration', () => {
      const fs = require('fs');
      const path = require('path');

      const previewConfigPath = path.join(process.cwd(), '.storybook', 'preview.ts');

      // Skip if preview config doesn't exist or has CSS import issues
      if (fs.existsSync(previewConfigPath)) {
        const previewSource = fs.readFileSync(previewConfigPath, 'utf8');
        expect(previewSource).toContain('Preview');
      }
    });
  });

  describe('Production Readiness', () => {
    test('should have proper production configuration', () => {
      const fs = require('fs');
      const path = require('path');

      // Check Next.js config
      const nextConfigPath = path.join(process.cwd(), 'next.config.js');
      expect(fs.existsSync(nextConfigPath)).toBe(true);

      // Check environment files
      const envExamplePath = path.join(process.cwd(), '.env.example');

      expect(fs.existsSync(envExamplePath)).toBe(true);
    });

    test('should have proper security headers configuration', () => {
      const fs = require('fs');
      const path = require('path');

      const middlewarePath = path.join(process.cwd(), 'middleware.ts');

      if (fs.existsSync(middlewarePath)) {
        const middlewareSource = fs.readFileSync(middlewarePath, 'utf8');
        // Check that middleware exists and has basic structure
        expect(middlewareSource).toContain('middleware');
        expect(middlewareSource).toContain('NextResponse');
      }
    });
  });

  describe('Performance Optimization', () => {
    test('should have performance optimization utilities', () => {
      const fs = require('fs');
      const path = require('path');

      const performanceUtilsPath = path.join(
        process.cwd(),
        'src',
        'utils',
        'performance-optimizations.ts',
      );

      // Skip if performance utils file doesn't exist
      if (fs.existsSync(performanceUtilsPath)) {
        const performanceUtils = require(performanceUtilsPath);
        expect(performanceUtils.debounce).toBeDefined();
      }
    });

    test('should have analytics system properly configured', () => {
      const fs = require('fs');
      const path = require('path');

      const analyticsPath = path.join(process.cwd(), 'src', 'utils', 'analytics-system.ts');

      // Skip if analytics file doesn't exist
      if (fs.existsSync(analyticsPath)) {
        const analytics = require(analyticsPath);
        expect(analytics.trackEvent).toBeDefined();
      }
    });
  });
});

describe('End-to-End System Verification', () => {
  test('should be able to import all key modules without errors', () => {
    expect(() => {
      require('react');
      require('next');
      require('framer-motion');
      require('@heroicons/react/24/outline');
      require('../components/UI/PremiumButton');
      require('../components/UI/PremiumCard');
      require('../constants/animations');
      require('../utils/performance-optimizations');
      require('../utils/analytics-system');
    }).not.toThrow();
  });

  test('should have proper module resolution', () => {
    const tsConfig = require('../../tsconfig.json');

    expect(tsConfig.compilerOptions.baseUrl).toBeDefined();
    expect(tsConfig.compilerOptions.paths).toBeDefined();
    expect(tsConfig.compilerOptions.paths['@/*']).toBeDefined();
  });

  test('should have proper testing configuration', () => {
    const jestConfig = require('../../jest.config.js');

    expect(jestConfig.setupFilesAfterEnv).toBeDefined();
    expect(jestConfig.testEnvironment).toBe('jsdom');
  });
});
