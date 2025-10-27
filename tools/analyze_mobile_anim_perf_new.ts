import fs from 'fs';
import path from 'path';

// Define the structure for our findings
const findings = [];

// Function to parse grep output and extract relevant information
function parseGrepOutput(filePath, category) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  lines.forEach(line => {
    if (line.trim()) {
      const [file, lineNum, match] = line.split(':');
      findings.push({
        file: file.replace('../../', ''),
        category: category,
        evidence: `line:${lineNum}`,
        notes: match || 'N/A'
      });
    }
  });
}

// Parse all grep output files
const grepFiles = [
  { path: 'mobile_anim_perf_inventory/GREPLOGS/animations.txt', category: 'animation' },
  { path: 'mobile_anim_perf_inventory/GREPLOGS/gestures.txt', category: 'animation' },
  { path: 'mobile_anim_perf_inventory/GREPLOGS/moti_lottie.txt', category: 'animation' },
  { path: 'mobile_anim_perf_inventory/GREPLOGS/shared_element.txt', category: 'transition' },
  { path: 'mobile_anim_perf_inventory/GREPLOGS/navigation.txt', category: 'transition' },
  { path: 'mobile_anim_perf_inventory/GREPLOGS/lists.txt', category: 'performance' },
  { path: 'mobile_anim_perf_inventory/GREPLOGS/memoization.txt', category: 'performance' },
  { path: 'mobile_anim_perf_inventory/GREPLOGS/list_props.txt', category: 'performance' },
  { path: 'mobile_anim_perf_inventory/GREPLOGS/styles.txt', category: 'layout' },
  { path: 'mobile_anim_perf_inventory/GREPLOGS/colors_raw.txt', category: 'colors' },
  { path: 'mobile_anim_perf_inventory/GREPLOGS/tokens.txt', category: 'colors' },
  { path: 'mobile_anim_perf_inventory/GREPLOGS/micro.txt', category: 'micro-interaction' }
];

grepFiles.forEach(file => {
  if (fs.existsSync(file.path)) {
    parseGrepOutput(file.path, file.category);
  } else {
    console.log(`File not found: ${file.path}`);
  }
});

// Write findings to ANIM_PERF_INDEX.json
fs.writeFileSync('mobile_anim_perf_inventory/ANIM_PERF_INDEX.json', JSON.stringify(findings, null, 2));

console.log('Analysis complete. Findings written to ANIM_PERF_INDEX.json');
