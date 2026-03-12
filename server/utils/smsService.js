const twilio = require('twilio');

/**
 * SMS Service for Cotton Disease Detection Notifications
 * Uses Twilio to send SMS notifications to farmers
 */

let twilioClient = null;

/**
 * Initialize Twilio client
 */
function initializeSMS() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    // Check if credentials are missing or placeholder values
    if (!accountSid || !authToken || !phoneNumber) {
      console.warn('⚠️ SMS Service: Twilio credentials not configured. SMS notifications will be skipped.');
      return false;
    }

    // Check if credentials are placeholder values
    if (accountSid.includes('your_twilio') || authToken.includes('your_twilio') || phoneNumber.includes('your_twilio')) {
      console.warn('⚠️ SMS Service: Twilio credentials appear to be placeholder values. Please set valid credentials in .env');
      console.warn('   Example: TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      return false;
    }

    // Validate account SID format
    if (!accountSid.startsWith('AC')) {
      console.warn('⚠️ SMS Service: Invalid Twilio Account SID format (must start with AC). SMS notifications will be skipped.');
      return false;
    }

    twilioClient = twilio(accountSid, authToken);
    console.log('✓ Twilio SMS Service initialized successfully');
    return true;
  } catch (error) {
    console.warn('⚠️ SMS Service: Failed to initialize Twilio:', error.message);
    console.warn('   SMS notifications will be skipped. This is non-critical.');
    return false;
  }
}

/**
 * Format disease detection into farmer-friendly SMS
 * @param {Object} detectionData - Detection result from Groq API
 * @param {String} farmName - Farmer's farm name
 * @returns {String} Formatted SMS text
 */
function formatDetectionSMS(detectionData, farmName) {
  const {
    disease_name,
    severity_level,
    chemical_control,
    fertilizer_recommendation,
    farmer_note_simple_language
  } = detectionData;

  // Extract chemical product name
  let chemicalAction = 'Consult agronomist';
  if (chemical_control) {
    if (typeof chemical_control === 'object' && chemical_control.recommended_product) {
      chemicalAction = chemical_control.recommended_product;
    } else if (typeof chemical_control === 'string') {
      chemicalAction = chemical_control;
    }
  }

  // Extract fertilizer recommendation
  let fertilizerSuggestion = 'Balanced NPK';
  if (fertilizer_recommendation) {
    if (typeof fertilizer_recommendation === 'object' && fertilizer_recommendation.recommended_fertilizer) {
      fertilizerSuggestion = fertilizer_recommendation.recommended_fertilizer;
    } else if (typeof fertilizer_recommendation === 'string') {
      fertilizerSuggestion = fertilizer_recommendation;
    }
  }

  // Format severity into emoji/indicator
  const severityIndicator = {
    'Low': '🟢',
    'Medium': '🟡',
    'High': '🔴',
    'Severe': '⚠️',
    'Critical': '🚨',
    'Mild': '🟢',
    'Moderate': '🟡'
  }[severity_level] || '📋';

  // Build SMS message - keeping it concise and actionable
  const smsText = 
    `${severityIndicator} Cotton Disease Alert\n` +
    `Disease: ${disease_name}\n` +
    `Severity: ${severity_level}\n` +
    `Action: ${chemicalAction}\n` +
    `Fertilizer: ${fertilizerSuggestion}\n` +
    `Check app for details. Reply HELP for support.`;

  return smsText;
}

/**
 * Send SMS notification to farmer
 * @param {String} phoneNumber - Farmer's phone number (E.164 format: +1234567890)
 * @param {Object} detectionData - Detection data with disease info
 * @param {String} farmName - Farmer's farm name
 * @returns {Promise<Object>} SMS send result
 */
async function sendDetectionSMS(phoneNumber, detectionData, farmName = '') {
  try {
    // Check if SMS is configured
    if (!twilioClient) {
      console.log('⚠️  SMS Service not initialized. Skipping SMS notification.');
      return {
        success: false,
        skipped: true,
        message: 'SMS service not configured'
      };
    }

    // Validate phone number format
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      throw new Error('Invalid phone number provided');
    }

    // Ensure phone number is in E.164 format
    let formattedNumber = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      // If it doesn't start with +, assume it's missing country code
      // This is a safety check - ideally phone numbers should be stored in E.164 format
      if (phoneNumber.startsWith('91')) {
        // Common pattern for Indian numbers
        formattedNumber = `+${phoneNumber}`;
      } else {
        formattedNumber = `+81${phoneNumber}`; // Default fallback
      }
    }

    // Format the SMS message
    const smsMessage = formatDetectionSMS(detectionData, farmName);

    // Send SMS via Twilio
    const message = await twilioClient.messages.create({
      body: smsMessage,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber
    });

    console.log(`✓ SMS sent successfully to ${formattedNumber} (SID: ${message.sid})`);

    return {
      success: true,
      messageSid: message.sid,
      phoneNumber: formattedNumber,
      sentAt: new Date(),
      message: 'SMS notification sent to farmer'
    };
  } catch (error) {
    console.error('❌ Error sending SMS:', error.message);
    
    // Return error details but don't block the main flow
    return {
      success: false,
      error: error.message,
      phoneNumber: phoneNumber,
      sentAt: new Date(),
      message: 'Failed to send SMS notification'
    };
  }
}

/**
 * Send SMS alert for urgent situations (e.g., severe disease detected)
 * @param {String} phoneNumber - Farmer's phone number
 * @param {String} message - Custom urgent message
 * @returns {Promise<Object>} SMS send result
 */
async function sendUrgentAlertSMS(phoneNumber, message) {
  try {
    if (!twilioClient) {
      return {
        success: false,
        skipped: true,
        message: 'SMS service not configured'
      };
    }

    const urgentSMS = 
      `🚨 URGENT ALERT - COTTON DISEASE\n` +
      `${message}\n` +
      `Action required immediately. Check app for details.`;

    const smsMessage = await twilioClient.messages.create({
      body: urgentSMS,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log(`✓ Urgent SMS sent to ${phoneNumber} (SID: ${smsMessage.sid})`);

    return {
      success: true,
      messageSid: smsMessage.sid,
      phoneNumber: phoneNumber,
      sentAt: new Date(),
      message: 'Urgent SMS sent'
    };
  } catch (error) {
    console.error('❌ Error sending urgent SMS:', error.message);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send urgent SMS'
    };
  }
}

/**
 * Validate phone number format
 * @param {String} phoneNumber - Phone number to validate
 * @returns {Object} Validation result
 */
function validatePhoneNumber(phoneNumber) {
  if (!phoneNumber) {
    return { valid: false, error: 'Phone number is required' };
  }

  // Check if it's in E.164 format or common formats
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  const indiaRegex = /^(\+91|0)?[6-9]\d{9}$/;
  const generalRegex = /^\d{10,}$/;

  if (e164Regex.test(phoneNumber)) {
    return { valid: true, format: 'E.164' };
  }

  if (indiaRegex.test(phoneNumber)) {
    return { valid: true, format: 'India', normalized: `+91${phoneNumber.slice(-10)}` };
  }

  if (generalRegex.test(phoneNumber)) {
    return { valid: true, format: 'General', needsCountryCode: true };
  }

  return { valid: false, error: 'Invalid phone number format' };
}

/**
 * Normalize phone number to E.164 format
 * @param {String} phoneNumber - Phone number to normalize
 * @param {String} countryCode - Country code (default: 91 for India)
 * @returns {String} Normalized phone number
 */
function normalizePhoneNumber(phoneNumber, countryCode = '91') {
  if (!phoneNumber) return null;

  // Remove all non-numeric characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');

  // If already in E.164 format, return as is
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // Remove leading zeros
  cleaned = cleaned.replace(/^0+/, '');

  // Add country code if missing
  if (!cleaned.startsWith(countryCode)) {
    cleaned = countryCode + cleaned;
  }

  return `+${cleaned}`;
}

/**
 * Get SMS service status
 * @returns {Object} SMS service status information
 */
function getSMSStatus() {
  const isConfigured = !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );

  return {
    configured: isConfigured,
    twilioInitialized: !!twilioClient,
    accountSid: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'missing',
    authToken: process.env.TWILIO_AUTH_TOKEN ? 'configured' : 'missing',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || 'not set',
    status: isConfigured && twilioClient ? '✓ Ready' : '⚠️ Not configured'
  };
}

module.exports = {
  initializeSMS,
  sendDetectionSMS,
  sendUrgentAlertSMS,
  validatePhoneNumber,
  normalizePhoneNumber,
  formatDetectionSMS,
  getSMSStatus
};
