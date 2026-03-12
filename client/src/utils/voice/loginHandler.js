/**
 * Login Handler
 * Handles voice-based auto-fill for login form
 */

class LoginHandler {
  constructor() {
    this.formFields = {
      emailInput: null,
      passwordInput: null,
    };
    this.isLoginPage = false;
  }

  /**
   * Register form fields (call this when Login page mounts)
   * @param {object} fields - Object containing input refs: { emailInput, passwordInput }
   */
  registerFormFields(fields) {
    this.formFields = {
      emailInput: fields.emailInput || null,
      passwordInput: fields.passwordInput || null,
    };
    this.isLoginPage = true;
    console.log('[Voice] Login form fields registered');
  }

  /**
   * Unregister form fields (call when component unmounts)
   */
  unregisterFormFields() {
    this.formFields = {
      emailInput: null,
      passwordInput: null,
    };
    this.isLoginPage = false;
  }

  /**
   * Handle transcript on login page
   * @param {string} transcript - Speech-to-text transcript
   */
  handleTranscript(transcript) {
    console.log('[Voice Login] handleTranscript called with:', transcript);
    console.log('[Voice Login] isLoginPage:', this.isLoginPage);
    console.log('[Voice Login] formFields:', {
      emailInput: this.formFields.emailInput ? 'present' : 'null',
      passwordInput: this.formFields.passwordInput ? 'present' : 'null'
    });
    
    if (!this.isLoginPage) {
      console.log('[Voice Login] Not on login page, ignoring');
      return;
    }
    
    if (!transcript) {
      console.log('[Voice Login] No transcript provided');
      return;
    }

    const lowerTranscript = transcript.toLowerCase().trim();
    console.log('[Voice Login] Processing:', lowerTranscript);

    // Extract and fill email
    this.extractAndFillEmail(lowerTranscript);

    // Extract and fill password
    this.extractAndFillPassword(lowerTranscript);
  }

  /**
   * Extract email from transcript and fill input
   * Patterns: "my email is john@example.com", "email john at example dot com"
   */
  extractAndFillEmail(transcript) {
    if (!this.formFields.emailInput) return;

    const lowerTranscript = transcript.toLowerCase();

    // Pattern 1: Direct email format in transcript
    let match = lowerTranscript.match(/([a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,})/);
    if (match && match[1]) {
      this.setInputValue(this.formFields.emailInput, match[1]);
      console.log('[Voice] Filled email:', match[1]);
      return;
    }

    // Pattern 2: "email is ..."
    match = lowerTranscript.match(/email\s+(?:is\s+)?([a-z0-9@._+-]+)(?:\s+(?:password|and|my)|$)/);
    if (match && match[1]) {
      const email = match[1].replace(/\s+/g, '');
      this.setInputValue(this.formFields.emailInput, email);
      console.log('[Voice] Filled email:', email);
      return;
    }

    // Pattern 3: Email spelled out as "john at example dot com"
    match = lowerTranscript.match(/my email is (.+?)(?:\s+password|\s+and my|\s+my password|$)/);
    if (match && match[1]) {
      let email = match[1]
        .replace(/\s+at\s+/gi, '@')
        .replace(/\s+dot\s+/gi, '.')
        .replace(/\s+/g, '');
      
      if (email.includes('@')) {
        this.setInputValue(this.formFields.emailInput, email);
        console.log('[Voice] Filled email:', email);
      }
    }
  }

  /**
   * Set input value and trigger change event so React detects it
   */
  setInputValue(input, value) {
    if (!input) return;
    input.value = value;
    input.focus();
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Extract password from transcript and fill input
   * Patterns: "password is 12345", "my password is abc123"
   */
  extractAndFillPassword(transcript) {
    if (!this.formFields.passwordInput) return;

    const lowerTranscript = transcript.toLowerCase();

    // Pattern: "password is ..."
    let match = lowerTranscript.match(/password\s+(?:is\s+)?([a-z0-9!@#$%^&*]+)(?:\s+|$)/);
    if (match && match[1]) {
      const password = match[1].trim();
      this.setInputValue(this.formFields.passwordInput, password);
      console.log('[Voice] Filled password (length: ' + password.length + ')');
      return;
    }

    // Pattern: "my password is ..."
    match = lowerTranscript.match(/my password\s+(?:is\s+)?([a-z0-9!@#$%^&*]+)(?:\s+|$)/);
    if (match && match[1]) {
      const password = match[1].trim();
      this.setInputValue(this.formFields.passwordInput, password);
      console.log('[Voice] Filled password (length: ' + password.length + ')');
    }
  }
}

// Create singleton instance
const loginHandler = new LoginHandler();

export default loginHandler;
