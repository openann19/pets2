/**
 * WIREFRAME EXPORT UTILITIES - Fixed for ES Modules
 *
 * Tools for exporting wireframes, generating documentation, and creating design assets
 * from our pet-first screens for handoffs to design teams and stakeholders.
 */

import type { ViewStyle, TextStyle, ImageStyle } from 'react-native';

// Types for wireframe export
export interface WireframeExportConfig {
  screenName: string;
  theme: 'wireframe' | 'mockup';
  includeGrid: boolean;
  includeMeasurements: boolean;
  format: 'png' | 'svg' | 'json' | 'html';
  scale: number;
}

export interface WireframeComponentSpec {
  id: string;
  type: 'container' | 'text' | 'image' | 'button' | 'input' | 'card';
  label: string;
  dimensions: { width: number; height: number };
  position: { x: number; y: number };
  styles: ViewStyle | TextStyle | ImageStyle;
  children?: WireframeComponentSpec[];
  interactions?: string[];
  notes?: string;
}

export interface WireframeScreenSpec {
  name: string;
  description: string;
  components: WireframeComponentSpec[];
  navigation?: {
    header?: boolean;
    tabs?: string[];
    backButton?: boolean;
  };
  breakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

// Wireframe to Design Asset Converter
export class WireframeExporter {
  private config: WireframeExportConfig;

  constructor(config: WireframeExportConfig) {
    this.config = config;
  }

  // Generate HTML wireframe for web viewing
  async exportToHTML(screenSpec: WireframeScreenSpec): Promise<string> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${screenSpec.name} - Wireframe</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .wireframe-container {
            max-width: 375px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .wireframe-header {
            height: 60px;
            background: #f8f9fa;
            border-bottom: 1px solid #e5e5e5;
            display: flex;
            align-items: center;
            padding: 0 16px;
        }
        .wireframe-content {
            padding: 16px;
        }
        .wireframe-component {
            margin-bottom: 12px;
            border: 1px solid #e5e5e5;
            border-radius: 4px;
            background: #f9f9f9;
            position: relative;
        }
        .wireframe-component.wireframe {
            background: #f9f9f9;
        }
        .wireframe-line {
            height: 8px;
            background: #d0d0d0;
            margin: 8px;
            border-radius: 4px;
        }
        .wireframe-button {
            height: 36px;
            background: #007AFF;
            border-radius: 6px;
            margin: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 500;
        }
        .component-label {
            position: absolute;
            top: 4px;
            right: 8px;
            font-size: 10px;
            color: #666;
            background: white;
            padding: 2px 4px;
            border-radius: 2px;
        }
        .screen-title {
            text-align: center;
            font-size: 18px;
            font-weight: 600;
            margin: 20px 0;
            color: #333;
        }
        .specs {
            margin-top: 20px;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .spec-item {
            margin-bottom: 8px;
            font-size: 14px;
        }
        .spec-label {
            font-weight: 600;
            color: #666;
        }
    </style>
</head>
<body>
    <h1 class="screen-title">${screenSpec.name}</h1>
    <p style="text-align: center; color: #666; margin-bottom: 30px;">${screenSpec.description}</p>

    <div class="wireframe-container">
        ${screenSpec.navigation?.header ? `
        <div class="wireframe-header">
            <div class="wireframe-line" style="width: 120px;"></div>
            ${screenSpec.navigation?.backButton ? '<div class="wireframe-line" style="width: 40px; margin-left: auto;"></div>' : ''}
        </div>
        ` : ''}

        ${screenSpec.navigation?.tabs ? `
        <div style="display: flex; height: 50px; background: #f8f9fa; border-bottom: 1px solid #e5e5e5;">
            ${screenSpec.navigation.tabs.map(() => `
            <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
                <div class="wireframe-line" style="width: 60px; height: 6px;"></div>
            </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="wireframe-content">
            ${this.generateComponentHTML(screenSpec.components)}
        </div>
    </div>

    <div class="specs">
        <h3>Specifications</h3>
        <div class="spec-item">
            <span class="spec-label">Screen:</span> ${screenSpec.name}
        </div>
        <div class="spec-item">
            <span class="spec-label">Breakpoints:</span>
            Mobile: ${screenSpec.breakpoints?.mobile || 375}px,
            Tablet: ${screenSpec.breakpoints?.tablet || 768}px,
            Desktop: ${screenSpec.breakpoints?.desktop || 1024}px
        </div>
        <div class="spec-item">
            <span class="spec-label">Components:</span> ${screenSpec.components.length}
        </div>
        <div class="spec-item">
            <span class="spec-label">Theme:</span> ${this.config.theme}
        </div>
        <div class="spec-item">
            <span class="spec-label">Generated:</span> ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>`;

    return html;
  }

  private generateComponentHTML(components: WireframeComponentSpec[]): string {
    return components.map(component => {
      let html = '';

      switch (component.type) {
        case 'card':
          html = `
            <div class="wireframe-component ${this.config.theme}" style="height: ${component.dimensions.height}px;">
                <div class="component-label">${component.label}</div>
                <div class="wireframe-line" style="width: 80%;"></div>
                <div class="wireframe-line" style="width: 60%;"></div>
                ${component.children ? this.generateComponentHTML(component.children) : ''}
            </div>
          `;
          break;

        case 'button':
          html = `
            <div class="wireframe-button">
                ${component.label}
            </div>
          `;
          break;

        case 'text':
          html = `
            <div class="wireframe-line" style="width: ${component.dimensions.width || 120}px; height: 6px;"></div>
          `;
          break;

        default:
          html = `
            <div class="wireframe-component ${this.config.theme}" style="height: ${component.dimensions.height}px;">
                <div class="component-label">${component.label}</div>
                <div class="wireframe-line"></div>
            </div>
          `;
      }

      return html;
    }).join('');
  }

  // Generate JSON specification for design tools
  exportToJSON(screenSpec: WireframeScreenSpec): string {
    return JSON.stringify({
      ...screenSpec,
      exportConfig: this.config,
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
    }, null, 2);
  }

  // Generate design token documentation
  // NOTE: This function generates documentation HTML with hardcoded colors for wireframe exports.
  // This is intentional - wireframes are static documentation artifacts that don't use theme tokens.
  static generateDesignTokens(): string {
    return `
# Design Tokens - PawfectMatch

## Colors (Documentation Only - Use Theme Tokens in App Code)
- Primary: #007AFF (iOS Blue)
- Success: #28a745
- Warning: #ffc107
- Danger: #dc3545
- Background: #f8f9fa
- Text: #333333
- Text Muted: #666666

## Typography
- Header Large: 24px, 600 weight
- Header Medium: 20px, 600 weight
- Header Small: 18px, 600 weight
- Body Large: 16px, 400 weight
- Body Regular: 14px, 400 weight
- Body Small: 12px, 400 weight

## Spacing
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

## Border Radius
- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px
- full: 9999px

## Shadows
- sm: 0 1px 2px rgba(0,0,0,0.05)
- md: 0 4px 6px rgba(0,0,0,0.07)
- lg: 0 10px 15px rgba(0,0,0,0.1)
- xl: 0 20px 25px rgba(0,0,0,0.15)
    `;
  }
}

// Pre-defined screen specifications for our pet-first screens
export const wireframeScreenSpecs = {
  playdateDiscovery: {
    name: 'Playdate Discovery',
    description: 'Find compatible playmates for pets based on personality and preferences',
    components: [
      {
        id: 'search-filters',
        type: 'card',
        label: 'Search Filters',
        dimensions: { width: 343, height: 120 },
        position: { x: 16, y: 80 },
        styles: {},
        interactions: ['toggle-filters', 'apply-filters'],
      },
      {
        id: 'pet-match-card',
        type: 'card',
        label: 'Pet Match Card',
        dimensions: { width: 343, height: 140 },
        position: { x: 16, y: 220 },
        styles: {},
        interactions: ['view-details', 'send-message', 'create-playdate'],
        children: [
          {
            id: 'pet-photo',
            type: 'image',
            label: 'Pet Photo',
            dimensions: { width: 60, height: 60 },
            position: { x: 16, y: 16 },
            styles: { borderRadius: 30 },
          },
          {
            id: 'compatibility-score',
            type: 'text',
            label: '95% Match',
            dimensions: { width: 80, height: 20 },
            position: { x: 247, y: 16 },
            styles: { fontWeight: '600', color: 'green' }, // Match score color
          },
          {
            id: 'message-button',
            type: 'button',
            label: '💬 Message',
            dimensions: { width: 80, height: 36 },
            position: { x: 16, y: 88 },
            styles: { backgroundColor: 'blue', borderRadius: 6 }, // Primary button color
            interactions: ['navigate-to-chat'],
          },
          {
            id: 'playdate-button',
            type: 'button',
            label: '🐾 Playdate',
            dimensions: { width: 100, height: 36 },
            position: { x: 227, y: 88 },
            styles: { borderColor: 'blue', borderWidth: 1, borderRadius: 6 }, // Primary button border
            interactions: ['create-playdate'],
          },
        ],
      },
    ],
    navigation: {
      header: true,
      backButton: true,
    },
    breakpoints: {
      mobile: 375,
      tablet: 768,
      desktop: 1024,
    },
  },

  enhancedPetProfile: {
    name: 'Enhanced Pet Profile',
    description: 'Comprehensive pet profile with personality, health, and availability',
    components: [
      {
        id: 'profile-header',
        type: 'container',
        label: 'Profile Header',
        dimensions: { width: 343, height: 80 },
        position: { x: 16, y: 16 },
        styles: { flexDirection: 'row', alignItems: 'center' },
      },
      {
        id: 'tab-navigation',
        type: 'container',
        label: 'Tab Navigation',
        dimensions: { width: 343, height: 50 },
        position: { x: 16, y: 116 },
        styles: { flexDirection: 'row' },
      },
      {
        id: 'play-style-selector',
        type: 'container',
        label: 'Play Style Selector',
        dimensions: { width: 343, height: 100 },
        position: { x: 16, y: 186 },
        styles: { flexDirection: 'row', flexWrap: 'wrap' },
        interactions: ['toggle-play-style'],
      },
    ],
    navigation: {
      header: true,
      tabs: ['Profile', 'Health', 'Availability', 'Safety'],
    },
  },
};

// Export utility functions
export const createWireframeExporter = (config: WireframeExportConfig) =>
  new WireframeExporter(config);

export const exportScreenToHTML = async (screenName: keyof typeof wireframeScreenSpecs, config: WireframeExportConfig) => {
  const exporter = new WireframeExporter(config);
  const spec = wireframeScreenSpecs[screenName];
  return exporter.exportToHTML(spec);
};

export const exportScreenToJSON = (screenName: keyof typeof wireframeScreenSpecs, config: WireframeExportConfig) => {
  const exporter = new WireframeExporter(config);
  const spec = wireframeScreenSpecs[screenName];
  return exporter.exportToJSON(spec);
};

// Quick export functions for development
export const quickExportPlaydateDiscovery = () =>
  exportScreenToHTML('playdateDiscovery', {
    screenName: 'playdate-discovery',
    theme: 'wireframe',
    includeGrid: true,
    includeMeasurements: true,
    format: 'html',
    scale: 1,
  });

export const quickExportPetProfile = () =>
  exportScreenToHTML('enhancedPetProfile', {
    screenName: 'enhanced-pet-profile',
    theme: 'wireframe',
    includeGrid: true,
    includeMeasurements: true,
    format: 'html',
    scale: 1,
  });
