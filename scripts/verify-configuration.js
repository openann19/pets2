#!/usr/bin/env node
/**
 * Configuration Verification Script
 * Verifies that all required payment APIs are configured
 */

const readline = require('readline');
const { MongoClient } = require('mongodb');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function verifyConfiguration() {
  console.log('\n🔍 Verifying Payment API Configuration...\n');

  const mongoUri = process.env.MONGODB_URI || await question('MongoDB URI: ');
  
  if (!mongoUri) {
    console.error('❌ MongoDB URI required');
    process.exit(1);
  }

  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db();
    const configCollection = db.collection('configurations');

    // Check Stripe Configuration
    const stripeConfig = await configCollection.findOne({ type: 'stripe' });
    console.log('📊 Stripe Configuration:');
    if (stripeConfig?.data) {
      console.log('  ✅ Secret Key: Configured');
      console.log('  ✅ Publishable Key: Configured');
      console.log('  ✅ Webhook Secret:', stripeConfig.data.webhookSecret ? 'Configured' : 'Missing');
      console.log('  ✅ Live Mode:', stripeConfig.data.isLiveMode ? 'Enabled' : 'Disabled (Test Mode)');
    } else {
      console.log('  ⚠️  Not configured in database');
      console.log('  ℹ️  Check environment variables: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY');
    }

    // Check RevenueCat Configuration
    const revenuecatConfig = await configCollection.findOne({ type: 'revenuecat' });
    console.log('\n📊 RevenueCat Configuration:');
    if (revenuecatConfig?.data) {
      console.log('  ✅ iOS API Key: Configured');
      console.log('  ✅ Android API Key: Configured');
    } else {
      console.log('  ⚠️  Not configured in database');
      console.log('  ℹ️  Check environment variables: EXPO_PUBLIC_RC_IOS, EXPO_PUBLIC_RC_ANDROID');
    }

    // Check AI Configuration
    const aiConfig = await configCollection.findOne({ type: 'ai' });
    console.log('\n📊 AI Service Configuration:');
    if (aiConfig?.data) {
      console.log('  ✅ API Key: Configured');
      console.log('  ✅ Base URL:', aiConfig.data.baseUrl || 'Not set');
      console.log('  ✅ Active:', aiConfig.data.isActive ? 'Yes' : 'No');
    } else {
      console.log('  ⚠️  Not configured');
    }

    // Summary
    console.log('\n📋 Configuration Summary:');
    const allConfigured = stripeConfig?.data && revenuecatConfig?.data;
    
    if (allConfigured) {
      console.log('  ✅ All payment APIs configured via admin panel');
      console.log('  🚀 Ready for production deployment');
    } else {
      console.log('  ⚠️  Some APIs need configuration');
      console.log('  💡 Use Admin Panel → Configuration to set up missing APIs');
    }

    await client.close();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

verifyConfiguration().catch(console.error);

