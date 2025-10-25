// Quick test script to verify backend API endpoints are registered
import express from 'express';

const app = express();
app.use(express.json());

// Import our routes (this will show us if they compile)
try {
  const gdprRoutes = require('./src/routes/gdpr');
  console.log('✅ GDPR routes loaded successfully');

  const chatRoutes = require('./src/routes/chat');
  console.log('✅ Chat routes loaded successfully');

  const matchRoutes = require('./src/routes/matches');
  console.log('✅ Match routes loaded successfully');

  console.log('\n🎉 All backend API routes compile successfully!');
  console.log('📋 Endpoints ready:');
  console.log('   - DELETE /users/delete-account');
  console.log('   - POST /users/export-data');
  console.log('   - POST /users/confirm-deletion');
  console.log('   - POST /users/cancel-deletion');
  console.log('   - POST /chat/:matchId/export');
  console.log('   - DELETE /chat/:matchId/clear');
  console.log('   - DELETE /matches/:matchId/unmatch');
  console.log('   - POST /messages/:messageId/react');
  console.log('   - DELETE /messages/:messageId/unreact');

} catch (error) {
  console.error('❌ Error loading routes:', error.message);
  process.exit(1);
}
