/**
 * Language Support
 * Manages multi-language configuration for voice assistant
 */

const LANGUAGES = {
  'en-IN': {
    name: 'English (India)',
    code: 'en-IN',
    triggerWords: ['open', 'go to', 'go', 'show', 'navigate', 'take me to', 'visit'],
    messages: {
      navSuccess: (featureName) => `Opening ${featureName} page.`,
      navFailed: 'Feature not found. Please try again.',
      listening: 'Listening...',
      listeningComplete: 'Done listening.',
      nameKeywords: ['my name is', 'i am', 'name'],
      emailKeywords: ['my email is', 'email'],
      passwordKeywords: ['password is', 'my password'],
      sectionKeywords: ['i am a', 'i am', 'as', 'be a', 'register as'],
      roles: ['farmer', 'retailer', 'customer'],
    },
  },
  'hi-IN': {
    name: 'Hindi',
    code: 'hi-IN',
    triggerWords: ['खोलें', 'जाएं', 'दिखाएं', 'नेविगेट करें', 'मुझे ले जाएं'],
    messages: {
      navSuccess: (featureName) => `${featureName} पृष्ठ खोल रहे हैं।`,
      navFailed: 'फीचर नहीं मिला। कृपया फिर से कोशिश करें।',
      listening: 'सुन रहे हैं...',
      listeningComplete: 'सुनना पूरा हुआ।',
      nameKeywords: ['मेरा नाम है', 'मैं हूँ', 'नाम'],
      emailKeywords: ['मेरा ईमेल है', 'ईमेल'],
      passwordKeywords: ['पासवर्ड है', 'मेरा पासवर्ड'],
      sectionKeywords: ['मैं एक', 'मैं', 'के रूप में', 'एक'],
      roles: ['किसान', 'retailer', 'ग्राहक'],
    },
  },
  'mr-IN': {
    name: 'Marathi',
    code: 'mr-IN',
    triggerWords: ['उघडा', 'जा', 'दाखवा', 'नेविगेट करा', 'मुला जा'],
    messages: {
      navSuccess: (featureName) => `${featureName} पृष्ठ उघडत आहे।`,
      navFailed: 'वैशिष्ट्य सापडले नाही. कृपया पुन्हा प्रयत्न करा.',
      listening: 'ऐकत आहे...',
      listeningComplete: 'ऐकणे पूर्ण झाले.',
      nameKeywords: ['माझे नाव आहे', 'मी आहे', 'नाव'],
      emailKeywords: ['माझा ईमेल आहे', 'ईमेल'],
      passwordKeywords: ['पासवर्ड आहे', 'माझा पासवर्ड'],
      sectionKeywords: ['मी एक', 'मी', 'म्हणून', 'एक'],
      roles: ['शेतकरी', 'retailer', 'ग्राहक'],
    },
  },
};

class LanguageSupport {
  constructor() {
    this.currentLanguage = 'en-IN';
    this.languages = LANGUAGES;
  }

  /**
   * Set current language
   * @param {string} languageCode - Language code (e.g., 'en-IN', 'hi-IN')
   */
  setLanguage(languageCode) {
    if (this.languages[languageCode]) {
      this.currentLanguage = languageCode;
      console.log('[Voice Language] Changed to:', this.languages[languageCode].name);
      return true;
    }
    console.warn('[Voice Language] Language not supported:', languageCode);
    return false;
  }

  /**
   * Get current language data
   */
  getCurrentLanguage() {
    return this.languages[this.currentLanguage];
  }

  /**
   * Get language by code
   */
  getLanguage(code) {
    return this.languages[code];
  }

  /**
   * Get all available languages
   */
  getAvailableLanguages() {
    return Object.values(this.languages);
  }

  /**
   * Get trigger words for current language
   */
  getTriggerWords() {
    return this.languages[this.currentLanguage].triggerWords;
  }

  /**
   * Get message in current language
   */
  getMessage(key, params = null) {
    const messages = this.languages[this.currentLanguage].messages;
    let message = messages[key];

    if (typeof message === 'function') {
      return message(params);
    }

    return message;
  }

  /**
   * Get keywords for voice form filling
   */
  getFormKeywords(fieldType) {
    const keywords = this.languages[this.currentLanguage].messages;
    const keywordKey = `${fieldType}Keywords`;
    return keywords[keywordKey] || [];
  }

  /**
   * Check if text matches keywords
   */
  matchesKeyword(text, fieldType) {
    const keywords = this.getFormKeywords(fieldType);
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  }
}

// Create singleton instance
const languageSupport = new LanguageSupport();

export default languageSupport;
export { LANGUAGES };
