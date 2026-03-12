const dotenv = require('dotenv');
const path = require('path');
const twilio = require('twilio');

dotenv.config({ path: path.join(__dirname, '../.env') });

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

console.log('--- Twilio Config Check ---');
console.log('ACCOUNT_SID:', ACCOUNT_SID ? '✅ Found' : '❌ Missing');
console.log('AUTH_TOKEN:', AUTH_TOKEN ? '✅ Found' : '❌ Missing');
console.log('SERVICE_SID:', SERVICE_SID ? '✅ Found' : '❌ Missing');

if (!ACCOUNT_SID || !AUTH_TOKEN || !SERVICE_SID) {
  console.log('\n⚠️ Keys missing. System will run in MOCK MODE (OTP 123456).');
} else {
  const client = twilio(ACCOUNT_SID, AUTH_TOKEN);
  console.log('\n🚀 Testing actual Twilio connection...');
  
  // Just try to fetch the service as a connectivity test
  client.verify.v2.services(SERVICE_SID)
    .fetch()
    .then(service => {
      console.log('✅ Connection Successful! Service Name:', service.friendlyName);
    })
    .catch(err => {
      console.error('❌ Connection Failed:', err.message);
    });
}
