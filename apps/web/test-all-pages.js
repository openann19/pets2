#!/usr/bin/env node

const http = require('http');

const DEFAULT_PORTS = [
  Number(process.env.WEB_PORT || process.env.PORT) || 3000,
  3001,
  3002,
  3003,
  3004
];
let PORT = DEFAULT_PORTS[0];
const pages = [
  '/',
  '/login', 
  '/register',
  '/dashboard',
  '/swipe',
  '/matches',
  '/ai/bio',
  '/ai/photo',
  '/ai/compatibility',
  '/subscription',
  '/map',
  '/profile'
];

console.log('🧪 Testing all PawfectMatch pages...\n');

const testPage = (path) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const status = res.statusCode;
        const success = status >= 200 && status < 400;
        console.log(`${success ? '✅' : '❌'} ${path} - Status: ${status}`);
        resolve({ path, status, success });
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${path} - Error: ${error.message}`);
      resolve({ path, error: error.message, success: false });
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`⏱️  ${path} - Timeout`);
      resolve({ path, error: 'Timeout', success: false });
    });

    req.end();
  });
};

async function runTests() {
  console.log(`Testing on http://localhost:${PORT}\n`);
  
  const results = [];
  for (const page of pages) {
    const result = await testPage(page);
    results.push(result);
  }

  console.log('\n📊 Test Summary:');
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}/${pages.length}`);
  console.log(`❌ Failed: ${failed}/${pages.length}`);
  
  if (failed > 0) {
    console.log('\n⚠️  Failed pages:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.path}: ${r.error || `Status ${r.status}`}`);
    });
  }

  return failed === 0;
}

// Check if server is running first
const checkServerOnPort = (port) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port,
      path: '/',
      method: 'HEAD',
      timeout: 1500
    };
    const req = http.request(options, () => resolve(true));
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
};

async function main() {
  // Detect an available dev server across common ports
  for (const candidate of DEFAULT_PORTS) {
    const up = await checkServerOnPort(candidate);
    if (up) { PORT = candidate; break; }
  }
  const up = await checkServerOnPort(PORT);
  if (!up) {
    console.error(`❌ Server not running (checked ports: ${DEFAULT_PORTS.join(', ')})`);
    console.log('Please start the server with: npm run dev (set PORT if needed)');
    process.exit(1);
  }

  const success = await runTests();
  process.exit(success ? 0 : 1);
}

main();
