function normalizeHex(hex) {
  const lower = hex.toLowerCase();
  // Expand shorthand: #fff -> #ffffff
  if (/^#[0-9a-f]{3}$/.test(lower)) {
    return `#${lower[1]}${lower[1]}${lower[2]}${lower[2]}${lower[3]}${lower[3]}`;
  }
  return lower;
}

console.log('Testing normalizeHex:');
console.log('#fff ->', normalizeHex('#fff'));
console.log('#111 ->', normalizeHex('#111'));
console.log('#000 ->', normalizeHex('#000'));
console.log('#ffffff ->', normalizeHex('#ffffff'));

// Test the regex
console.log('\nTesting regex:');
console.log('#fff matches 3-digit:', /^#[0-9a-f]{3}$/.test('#fff'));
console.log('#111 matches 3-digit:', /^#[0-9a-f]{3}$/.test('#111'));
console.log('#ffffff matches 6-digit:', /^#[0-9a-f]{6}$/.test('#ffffff'));
console.log('#111111 matches 6-digit:', /^#[0-9a-f]{6}$/.test('#111111'));
