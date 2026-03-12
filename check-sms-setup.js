#!/usr/bin/env node

/**
 * SMS Configuration Verification Script
 * Check if SMS service is properly configured before starting server
 */

require('dotenv').config();

console.log('\n🔍 SMS Notification Configuration Check\n');
console.log('='.repeat(50));

let allGood = true;

// Check Twilio Account SID
console.log('\n📋 Checking Twilio Account SID...');
if (process.env.TWILIO_ACCOUNT_SID) {
  console.log('✅ TWILIO_ACCOUNT_SID: Configured');
  console.log(`   Value: ${process.env.TWILIO_ACCOUNT_SID.substring(0, 10)}...`);
} else {
  console.log('⏳ TWILIO_ACCOUNT_SID: Not configured (SMS will be skipped)');
  allGood = false;
}

// Check Twilio Auth Token
console.log('\n🔐 Checking Twilio Auth Token...');
if (process.env.TWILIO_AUTH_TOKEN) {
  console.log('✅ TWILIO_AUTH_TOKEN: Configured');
  console.log(`   Value: ${process.env.TWILIO_AUTH_TOKEN.substring(0, 10)}...`);
} else {
  console.log('⏳ TWILIO_AUTH_TOKEN: Not configured (SMS will be skipped)');
  allGood = false;
}

// Check Twilio Phone Number
console.log('\n📱 Checking Twilio Phone Number...');
if (process.env.TWILIO_PHONE_NUMBER) {
  console.log('✅ TWILIO_PHONE_NUMBER: Configured');
  console.log(`   Value: ${process.env.TWILIO_PHONE_NUMBER}`);
  
  // Validate format
  const phoneRegex = /^\+\d{10,15}$/;
  if (!phoneRegex.test(process.env.TWILIO_PHONE_NUMBER)) {
    console.log('⚠️  WARNING: Phone number format may be incorrect');
    console.log('   Expected format: +1234567890 (with country code)');
  }
} else {
  console.log('⏳ TWILIO_PHONE_NUMBER: Not configured (SMS will be skipped)');
  allGood = false;
}

console.log('\n' + '='.repeat(50));

// Overall Status
console.log('\n📊 SMS Service Status:\n');

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
  console.log('✅ SMS SERVICE: READY TO USE');
  console.log('\nWhen you:');
  console.log('  1. Upload a cotton disease detection image');
  console.log('  2. System will send SMS to farmer\'s phone');
  console.log('  3. SMS includes: disease, severity, chemicals, fertilizer');
  console.log('  4. Check Twilio logs: https://console.twilio.com/logs');
} else {
  console.log('⏳ SMS SERVICE: NOT FULLY CONFIGURED');
  console.log('\nTo enable SMS notifications:');
  console.log('  1. Go to: https://www.twilio.com/console');
  console.log('  2. Get Account SID, Auth Token, and Phone Number');
  console.log('  3. Update .env file with these values');
  console.log('  4. Restart server (npm run dev)');
  console.log('\nWithout SMS config:');
  console.log('  • Disease detection will still work');
  console.log('  • SMS notifications will be skipped');
  console.log('  • No farmers will be alerted via SMS');
}

console.log('\n' + '='.repeat(50));

// Check for CottonUser model phone field
console.log('\n👤 Important: Ensure users have phone numbers\n');
console.log('When creating/updating farmers, include:');
console.log('  phone_number: "+919876543210"  // E.164 format');
console.log('\nSupported formats:');
console.log('  ✅ +919876543210 (E.164 - recommended)');
console.log('  ✅ 9876543210 (will be normalized)');
console.log('  ✅ +15551234567 (USA format)');

console.log('\n' + '='.repeat(50));

// Next Steps
console.log('\n🚀 Next Steps:\n');

if (allGood) {
  console.log('1. ✅ SMS is READY');
  console.log('2. 🚀 Start server: npm run dev');
  console.log('3. 📸 Upload detection image');
  console.log('4. 📱 Farmer receives SMS');
  console.log('5. 📊 Check Twilio logs for status');
} else {
  console.log('1. 📋 Get Twilio credentials:');
  console.log('   - Go to: https://www.twilio.com/console');
  console.log('   - Sign up (free tier available)');
  console.log('   - Copy Account SID');
  console.log('   - Copy Auth Token');
  console.log('   - Copy Phone Number');
  console.log('');
  console.log('2. ⚙️  Update .env file:');
  console.log('   - Open: .env');
  console.log('   - Fill in Twilio credentials');
  console.log('   - Save');
  console.log('');
  console.log('3. 🚀 Restart server:');
  console.log('   - npm run dev');
  console.log('');
  console.log('4. ✅ SMS will be enabled');
}

console.log('\n' + '='.repeat(50));
console.log('\n📚 Documentation: SMS_NOTIFICATION_SETUP.md');
console.log('⚙️  Quick Setup: SMS_QUICK_SETUP.md');
console.log('📋 Summary: SMS_IMPLEMENTATION_SUMMARY.md');

console.log('\n' + '='.repeat(50) + '\n');

// Return exit code based on configuration
process.exit(allGood ? 0 : 1);
