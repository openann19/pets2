/*
 * Simple Theme Migration Script
 * Replaces Theme. with theme. and moves StyleSheet.create inside components
 */

const fs = require('fs');
const path = require('path');
const glob = require('fast-glob');

// Token drift mappings
const tokenMappings = [
  { from: '.colors.primary[500]', to: '.colors.primary' },
  { from: '.colors.text.secondary', to: '.colors.textMuted' },
  { from: '.colors.background', to: '.colors.bg' },
  { from: '.borderRadius', to: '.radius' },
  { from: '.colors.status.error', to: '.colors.danger' },
  { from: '.colors.status.success', to: '.colors.success' },
  { from: '.colors.status.warning', to: '.colors.warning' }
];

// Get all tsx files in the screens directory
const files = glob.sync('apps/mobile/src/screens/**/*.tsx', {
  cwd: path.resolve(__dirname, '..'),
  absolute: true
});

console.log(`Found ${files.length} files to process`);

let processedFiles = 0;
let filesWithThemeRefs = 0;

for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Check if file contains Theme references
    if (!content.includes('Theme.')) {
      continue;
    }
    
    filesWithThemeRefs++;
    
    // Replace Theme. with theme.
    content = content.replace(/Theme\./g, 'theme.');
    
    // Apply token drift mappings
    for (const mapping of tokenMappings) {
      content = content.replace(new RegExp(mapping.from.replace(/\./g, '\\.'), 'g'), mapping.to);
    }
    
    // Add useTheme import if not present and Theme was used
    if (originalContent.includes('Theme.') && !content.includes('useTheme')) {
      // Find existing theme import and replace it
      content = content.replace(
        /import\s*{\s*[^}]*Theme[^}]*}\s*from\s*['"][^'"]*theme\/unified-theme['"]/g,
        "import { useTheme } from '../theme/Provider'"
      );
      
      // If no replacement was made, add the import at the top
      if (!content.includes('useTheme')) {
        content = "import { useTheme } from '../theme/Provider';\n" + content;
      }
    }
    
    // If we're not in dry mode, write the file
    const argv = process.argv.slice(2);
    const dry = argv.includes("--dry");
    
    if (!dry && content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Processed: ${path.relative(process.cwd(), file)}`);
      processedFiles++;
    } else if (content !== originalContent) {
      console.log(`Would process: ${path.relative(process.cwd(), file)}`);
    }
    
  } catch (error) {
    console.error(`Error processing file ${file}:`, error.message);
  }
}

console.log(`Found Theme references in ${filesWithThemeRefs} files`);
if (processedFiles > 0) {
  console.log(`Processed ${processedFiles} files`);
}

// Create a simple report
const report = {
  scanned: files.length,
  filesWithThemeReferences: filesWithThemeRefs,
  processedFiles: processedFiles
};

fs.writeFileSync(
  path.resolve(__dirname, '../theme-migrate-report.json'), 
  JSON.stringify(report, null, 2)
);

console.log("✅ Theme migration report written to theme-migrate-report.json");
