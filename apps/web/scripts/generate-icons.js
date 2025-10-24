#!/usr/bin/env node

/**
 * PWA Icon Generator
 * Generates all necessary icons for PWA from a base SVG
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Base SVG icon (PawfectMatch logo)
const baseIconSVG = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f472b6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#c084fc;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background Circle -->
  <circle cx="256" cy="256" r="240" fill="url(#grad1)" stroke="#ffffff" stroke-width="8"/>
  
  <!-- Heart Shape -->
  <path d="M256,200 C256,200 200,150 150,200 C100,250 150,300 200,350 C250,400 256,400 256,400 C256,400 262,400 312,350 C362,300 412,250 362,200 C312,150 256,200 256,200 Z" 
        fill="url(#grad2)" stroke="#ffffff" stroke-width="4"/>
  
  <!-- Paw Print -->
  <g transform="translate(200, 320)">
    <!-- Main pad -->
    <ellipse cx="56" cy="56" rx="24" ry="32" fill="#ffffff" opacity="0.9"/>
    <!-- Toe pads -->
    <ellipse cx="32" cy="32" rx="8" ry="12" fill="#ffffff" opacity="0.9"/>
    <ellipse cx="80" cy="32" rx="8" ry="12" fill="#ffffff" opacity="0.9"/>
    <ellipse cx="32" cy="80" rx="8" ry="12" fill="#ffffff" opacity="0.9"/>
    <ellipse cx="80" cy="80" rx="8" ry="12" fill="#ffffff" opacity="0.9"/>
  </g>
  
  <!-- Sparkle Effects -->
  <g fill="#ffffff" opacity="0.8">
    <path d="M100,100 L110,100 L105,90 L110,100 L120,100 L110,110 L105,120 L100,110 L90,100 Z"/>
    <path d="M400,150 L405,150 L402.5,145 L405,150 L410,150 L405,155 L402.5,160 L400,155 L395,150 Z"/>
    <path d="M150,400 L155,400 L152.5,395 L155,400 L160,400 L155,405 L152.5,410 L150,405 L145,400 Z"/>
    <path d="M380,380 L385,380 L382.5,375 L385,380 L390,380 L385,385 L382.5,390 L380,385 L375,380 Z"/>
  </g>
</svg>
`;

// Icon sizes and configurations
const iconConfigs = [
  // Standard PWA icons
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
  
  // Apple Touch Icons
  { size: 57, name: 'apple-touch-icon-57x57.png' },
  { size: 60, name: 'apple-touch-icon-60x60.png' },
  { size: 72, name: 'apple-touch-icon-72x72.png' },
  { size: 76, name: 'apple-touch-icon-76x76.png' },
  { size: 114, name: 'apple-touch-icon-114x114.png' },
  { size: 120, name: 'apple-touch-icon-120x120.png' },
  { size: 144, name: 'apple-touch-icon-144x144.png' },
  { size: 152, name: 'apple-touch-icon-152x152.png' },
  { size: 180, name: 'apple-touch-icon-180x180.png' },
  
  // Android Chrome Icons
  { size: 36, name: 'android-chrome-36x36.png' },
  { size: 48, name: 'android-chrome-48x48.png' },
  { size: 72, name: 'android-chrome-72x72.png' },
  { size: 96, name: 'android-chrome-96x96.png' },
  { size: 144, name: 'android-chrome-144x144.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
  
  // Favicon sizes
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  
  // Shortcut icons
  { size: 96, name: 'swipe-shortcut.png' },
  { size: 96, name: 'matches-shortcut.png' },
  { size: 96, name: 'chat-shortcut.png' },
];

// Shortcut icon SVGs
const shortcutIcons = {
  'swipe-shortcut.png': `
    <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="swipeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="20" fill="url(#swipeGrad)"/>
      <path d="M30,48 L66,48 M48,30 L48,66" stroke="white" stroke-width="4" stroke-linecap="round"/>
      <circle cx="48" cy="48" r="8" fill="white" opacity="0.8"/>
    </svg>
  `,
  'matches-shortcut.png': `
    <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="matchesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#16a34a;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="20" fill="url(#matchesGrad)"/>
      <path d="M30,48 C30,38 38,30 48,30 C58,30 66,38 66,48 C66,58 58,66 48,66 C38,66 30,58 30,48 Z" 
            fill="white" opacity="0.9"/>
      <path d="M40,48 L44,52 L56,40" stroke="url(#matchesGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
  'chat-shortcut.png': `
    <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="chatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="20" fill="url(#chatGrad)"/>
      <path d="M20,40 C20,32 26,26 34,26 L62,26 C70,26 76,32 76,40 L76,60 C76,68 70,74 62,74 L40,74 L20,80 L20,40 Z" 
            fill="white" opacity="0.9"/>
      <circle cx="40" cy="50" r="2" fill="url(#chatGrad)"/>
      <circle cx="48" cy="50" r="2" fill="url(#chatGrad)"/>
      <circle cx="56" cy="50" r="2" fill="url(#chatGrad)"/>
    </svg>
  `,
};

async function generateIcons() {
  console.log('🎨 Generating PWA Icons...');
  
  // Create icons directory
  const iconsDir = path.join(__dirname, '../public/icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Generate main icons
  for (const config of iconConfigs) {
    try {
      let svgContent = baseIconSVG;
      
      // Use shortcut-specific SVG for shortcut icons
      if (shortcutIcons[config.name]) {
        svgContent = shortcutIcons[config.name];
      }
      
      const buffer = await sharp(Buffer.from(svgContent))
        .resize(config.size, config.size)
        .png()
        .toBuffer();
      
      const outputPath = path.join(iconsDir, config.name);
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`✅ Generated ${config.name} (${config.size}x${config.size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${config.name}:`, error.message);
    }
  }

  // Generate favicon.ico
  try {
    const faviconBuffer = await sharp(Buffer.from(baseIconSVG))
      .resize(32, 32)
      .png()
      .toBuffer();
    
    fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), faviconBuffer);
    console.log('✅ Generated favicon.ico');
  } catch (error) {
    console.error('❌ Failed to generate favicon.ico:', error.message);
  }

  // Generate apple-touch-icon.png (180x180)
  try {
    const appleIconBuffer = await sharp(Buffer.from(baseIconSVG))
      .resize(180, 180)
      .png()
      .toBuffer();
    
    fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon.png'), appleIconBuffer);
    console.log('✅ Generated apple-touch-icon.png');
  } catch (error) {
    console.error('❌ Failed to generate apple-touch-icon.png:', error.message);
  }

  // Generate maskable icon (512x512 with safe zone)
  try {
    const maskableSVG = `
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="maskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Safe zone background -->
        <rect x="64" y="64" width="384" height="384" rx="80" fill="url(#maskGrad)"/>
        
        <!-- Heart shape (smaller for safe zone) -->
        <path d="M256,180 C256,180 220,150 190,180 C160,210 190,240 220,270 C250,300 256,300 256,300 C256,300 262,300 292,270 C322,240 352,210 322,180 C292,150 256,180 256,180 Z" 
              fill="white" opacity="0.9"/>
        
        <!-- Paw print (smaller) -->
        <g transform="translate(200, 280)">
          <ellipse cx="56" cy="56" rx="20" ry="28" fill="white" opacity="0.8"/>
          <ellipse cx="36" cy="36" rx="6" ry="10" fill="white" opacity="0.8"/>
          <ellipse cx="76" cy="36" rx="6" ry="10" fill="white" opacity="0.8"/>
          <ellipse cx="36" cy="76" rx="6" ry="10" fill="white" opacity="0.8"/>
          <ellipse cx="76" cy="76" rx="6" ry="10" fill="white" opacity="0.8"/>
        </g>
      </svg>
    `;
    
    const maskableBuffer = await sharp(Buffer.from(maskableSVG))
      .resize(512, 512)
      .png()
      .toBuffer();
    
    fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512x512.png'), maskableBuffer);
    console.log('✅ Generated maskable icon (512x512)');
  } catch (error) {
    console.error('❌ Failed to generate maskable icon:', error.message);
  }

  console.log('\n🎉 Icon generation complete!');
  console.log(`📁 Icons saved to: ${iconsDir}`);
  console.log('📋 Generated files:');
  
  // List all generated files
  const files = fs.readdirSync(iconsDir);
  files.forEach(file => {
    const stats = fs.statSync(path.join(iconsDir, file));
    console.log(`  • ${file} (${Math.round(stats.size / 1024)}KB)`);
  });
}

// Run if called directly
if (require.main === module) {
  generateIcons().catch(console.error);
}

module.exports = { generateIcons };
