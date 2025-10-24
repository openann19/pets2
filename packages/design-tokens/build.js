#!/usr/bin/env node

/**
 * Design Token Builder
 * Generates Tailwind config and React Native StyleSheet from tokens.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tokensPath = path.join(__dirname, 'tokens.json');
const tokensRaw = fs.readFileSync(tokensPath, 'utf-8');
const tokens = JSON.parse(tokensRaw);

// Generate Tailwind config
function generateTailwindConfig() {
  const colors = {};
  const spacing = {};
  const borderRadius = {};
  const boxShadow = {};
  const backdropBlur = {};
  const transitionDuration = {};
  const transitionTimingFunction = {};

  // Colors
  Object.entries(tokens.color).forEach(([category, shades]) => {
    if (typeof shades === 'object' && shades.value) {
      colors[category] = shades.value;
    } else {
      colors[category] = {};
      Object.entries(shades).forEach(([shade, { value }]) => {
        colors[category][shade] = value;
      });
    }
  });

  // Spacing
  Object.entries(tokens.spacing).forEach(([key, { value }]) => {
    spacing[key] = value;
  });

  // Border radius
  Object.entries(tokens.radius).forEach(([key, { value }]) => {
    borderRadius[key] = value;
  });

  // Shadows
  Object.entries(tokens.shadow).forEach(([key, { value }]) => {
    boxShadow[key] = value;
  });

  // Blur
  Object.entries(tokens.blur).forEach(([key, { value }]) => {
    backdropBlur[key] = value;
  });

  // Animation
  Object.entries(tokens.animation.duration).forEach(([key, { value }]) => {
    transitionDuration[key] = value;
  });

  Object.entries(tokens.animation.easing).forEach(([key, { value }]) => {
    transitionTimingFunction[key] = value;
  });

  const config = `// Auto-generated from design tokens - DO NOT EDIT
module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(colors, null, 6)},
      spacing: ${JSON.stringify(spacing, null, 6)},
      borderRadius: ${JSON.stringify(borderRadius, null, 6)},
      boxShadow: ${JSON.stringify(boxShadow, null, 6)},
      backdropBlur: ${JSON.stringify(backdropBlur, null, 6)},
      transitionDuration: ${JSON.stringify(transitionDuration, null, 6)},
      transitionTimingFunction: ${JSON.stringify(transitionTimingFunction, null, 6)},
    },
  },
};
`;

  fs.writeFileSync(path.join(__dirname, 'dist', 'tailwind.config.js'), config);
  console.log('✅ Generated Tailwind config');
}

// Generate React Native styles
function generateReactNativeStyles() {
  const colors = {};
  const spacing = {};
  const borderRadius = {};
  const shadows = {};

  // Colors - flatten structure
  Object.entries(tokens.color).forEach(([category, shades]) => {
    if (typeof shades === 'object' && shades.value) {
      colors[category] = shades.value;
    } else {
      Object.entries(shades).forEach(([shade, { value }]) => {
        colors[`${category}${shade}`] = value;
      });
    }
  });

  // Spacing - convert to numbers
  Object.entries(tokens.spacing).forEach(([key, { value }]) => {
    spacing[key] = parseFloat(value);
  });

  // Border radius - convert to numbers
  Object.entries(tokens.radius).forEach(([key, { value }]) => {
    if (value === '9999px') {
      borderRadius[key] = 9999;
    } else {
      borderRadius[key] = parseFloat(value);
    }
  });

  // Shadows - iOS/Android compatible
  Object.entries(tokens.shadow).forEach(([key, { value }]) => {
    // Parse shadow values for React Native
    const shadowMatch = value.match(/(\d+)px\s+(\d+)px\s+(\d+)px/);
    if (shadowMatch) {
      shadows[key] = {
        shadowOffset: { width: parseInt(shadowMatch[1]), height: parseInt(shadowMatch[2]) },
        shadowRadius: parseInt(shadowMatch[3]),
        shadowOpacity: 0.1,
        elevation: parseInt(shadowMatch[3]) / 2, // Android elevation
      };
    }
  });

  const styles = `// Auto-generated from design tokens - DO NOT EDIT
export const colors = ${JSON.stringify(colors, null, 2)};

export const spacing = ${JSON.stringify(spacing, null, 2)};

export const borderRadius = ${JSON.stringify(borderRadius, null, 2)};

export const shadows = ${JSON.stringify(shadows, null, 2)};

export const animation = {
  duration: {
    fast: 120,
    normal: 200,
    slow: 300,
  },
};
`;

  fs.writeFileSync(path.join(__dirname, 'dist', 'react-native.ts'), styles);
  console.log('✅ Generated React Native styles');
}

// Create dist directory
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath, { recursive: true });
}

// Build
generateTailwindConfig();
generateReactNativeStyles();

console.log('🎨 Design tokens built successfully!');
