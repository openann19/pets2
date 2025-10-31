const fs = require('fs');
const path = require('path');

// Enhanced bundle analyzer with detailed reporting
function analyzeBundleSizes() {
  console.log('=== Bundle Size Analysis ===');
  
  let totalWebSize = 0;
  let totalServerSize = 0;
  
  // Web bundles
  const webDistPath = path.join(__dirname, '../apps/web/.next/static/chunks');
  if (fs.existsSync(webDistPath)) {
    const webFiles = fs.readdirSync(webDistPath);
    console.log('\nWeb Bundles:');
    webFiles
      .filter(file => file.endsWith('.js'))
      .forEach(file => {
        const stats = fs.statSync(path.join(webDistPath, file));
        const sizeInKB = (stats.size / 1024).toFixed(2);
        totalWebSize += stats.size;
        console.log(`  ${file} - ${sizeInKB}KB`);
      });
    
    console.log(`\nTotal Web Bundle Size: ${(totalWebSize / 1024).toFixed(2)}KB`);
  }
  
  // Server bundles
  const serverDistPath = path.join(__dirname, '../server/dist');
  if (fs.existsSync(serverDistPath)) {
    const serverFiles = fs.readdirSync(serverDistPath);
    console.log('\nServer Bundles:');
    serverFiles
      .filter(file => file.endsWith('.js'))
      .forEach(file => {
        const stats = fs.statSync(path.join(serverDistPath, file));
        const sizeInKB = (stats.size / 1024).toFixed(2);
        totalServerSize += stats.size;
        console.log(`  ${file} - ${sizeInKB}KB`);
      });
    
    console.log(`\nTotal Server Bundle Size: ${(totalServerSize / 1024).toFixed(2)}KB`);
  }
  
  // Animation-related bundles
  const animationFiles = [
    'packages/ui/src/hooks/usePawfectAnimations.ts',
    'packages/ui/src/hooks/usePremiumAnimations.ts',
    'packages/ui/src/hooks/useMemoryLeakDetection.ts',
    'packages/ui/src/theme/animations.css'
  ];
  
  console.log('\nAnimation System Files:');
  let totalAnimationSize = 0;
  
  animationFiles.forEach(file => {
    const filePath = path.join(__dirname, '../', file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const sizeInKB = (stats.size / 1024).toFixed(2);
      totalAnimationSize += stats.size;
      console.log(`  ${file} - ${sizeInKB}KB`);
    } else {
      console.log(`  ${file} - Not found`);
    }
  });
  
  console.log(`\nTotal Animation System Size: ${(totalAnimationSize / 1024).toFixed(2)}KB`);
  
  console.log('\n=== Analysis Complete ===');
}

analyzeBundleSizes();