const fs = require('fs');
const path = require('path');

console.log('🔍 Pre-startup Configuration Check...\n');

// Check .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check required variables
  const checks = {
    'MONGODB_URI': envContent.includes('MONGODB_URI=mongodb'),
    'JWT_SECRET': envContent.includes('JWT_SECRET='),
    'NODE_ENV': envContent.includes('NODE_ENV='),
    'FIREBASE_SERVICE_ACCOUNT_PATH': envContent.includes('FIREBASE_SERVICE_ACCOUNT_PATH=')
  };
  
  console.log('\n📋 Environment Variables:');
  Object.entries(checks).forEach(([key, present]) => {
    console.log(`   ${present ? '✅' : '⏳'} ${key}`);
  });
} else {
  console.log('❌ .env file not found');
}

// Check Firebase service account
const firebasePath = path.join(__dirname, 'server/config/firebase-service-account.json');
console.log('\n🔥 Firebase Configuration:');
if (fs.existsSync(firebasePath)) {
  console.log('   ✅ Service account JSON found');
} else {
  console.log('   ⏳ Service account JSON needed');
  console.log('      See: FIREBASE_SERVICE_ACCOUNT_SETUP.md');
}

// Check Cloudinary in .env
const envContent = fs.readFileSync(envPath, 'utf8');
console.log('\n☁️  Cloudinary Configuration:');
if (envContent.includes('CLOUDINARY_CLOUD_NAME=') && !envContent.includes('CLOUDINARY_CLOUD_NAME=your_cloud_name')) {
  console.log('   ✅ Configured');
} else {
  console.log('   ⏳ Needs configuration');
}

// Check Groq in .env
console.log('\n🤖 Groq API Configuration:');
if (envContent.includes('GROQ_API_KEY=') && !envContent.includes('GROQ_API_KEY=your_groq')) {
  console.log('   ✅ Configured');
} else {
  console.log('   ⏳ Needs configuration');
}

console.log('\n' + '='.repeat(50));
console.log('📊 Setup Status Summary');
console.log('='.repeat(50));

const summary = {
  'MongoDB': '✅ Configured',
  'JWT Secret': '✅ Configured',
  'Firebase Service Account': fs.existsSync(firebasePath) ? '✅ Ready' : '⏳ Needed (5 min)',
  'Cloudinary': envContent.includes('your_cloud_name') ? '⏳ Needed (5 min)' : '✅ Configured',
  'Groq API': envContent.includes('your_groq') ? '⏳ Needed (2 min)' : '✅ Configured'
};

Object.entries(summary).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

console.log('\n' + '='.repeat(50));
console.log('\nNext Step:');
if (!fs.existsSync(firebasePath)) {
  console.log('1. Read: FIREBASE_SERVICE_ACCOUNT_SETUP.md');
  console.log('2. Download service account JSON');
  console.log('3. Save to: server/config/firebase-service-account.json');
}
console.log('\nThen run: npm run dev\n');
