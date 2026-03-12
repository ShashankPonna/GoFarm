/**
 * Registration Handler
 * Handles voice-based auto-fill for registration form
 */

class RegistrationHandler {
  constructor() {
    this.formFields = {
      nameInput: null,
      emailInput: null,
      passwordInput: null,
      sectionSelect: null,
    };
    this.setFormData = null; // ✅ For updating React state
    this.isRegistrationPage = false;
  }

  /**
   * Register form fields (call this when Registration page mounts)
   * @param {object} fields - Object containing input refs and state setter
   */
  registerFormFields(fields) {
    this.formFields = { ...this.formFields, ...fields };
    this.setFormData = fields.setFormData || null;
    this.isRegistrationPage = true;
    console.log('[Voice] Registration form fields registered');
  }

  /**
   * Unregister form fields (call when component unmounts)
   */
  unregisterFormFields() {
    this.formFields = {
      nameInput: null,
      emailInput: null,
      passwordInput: null,
      sectionSelect: null,
    };
    this.isRegistrationPage = false;
  }

  /**
   * Handle transcript on registration page
   * @param {string} transcript - Speech-to-text transcript
   */
  handleTranscript(transcript) {
    console.log('[Voice Registration] handleTranscript called with:', transcript);
    console.log('[Voice Registration] isRegistrationPage:', this.isRegistrationPage);
    console.log('[Voice Registration] formFields:', {
      nameInput: this.formFields.nameInput ? 'present' : 'null',
      emailInput: this.formFields.emailInput ? 'present' : 'null',
      passwordInput: this.formFields.passwordInput ? 'present' : 'null',
      sectionSelect: this.formFields.sectionSelect ? 'present' : 'null'
    });
    
    if (!this.isRegistrationPage) {
      console.log('[Voice Registration] Not on registration page, ignoring');
      return;
    }
    
    if (!transcript) {
      console.log('[Voice Registration] No transcript provided');
      return;
    }

    const lowerTranscript = transcript.toLowerCase().trim();
    console.log('[Voice Registration] Processing:', lowerTranscript);

    // Extract and fill name
    this.extractAndFillName(lowerTranscript);

    // Extract and fill email
    this.extractAndFillEmail(lowerTranscript);

    // Extract and fill password
    this.extractAndFillPassword(lowerTranscript);

    // Extract and fill section
    this.extractAndFillSection(lowerTranscript);
  }

  /**
   * Extract name from transcript and fill input
   * Patterns: "my name is John", "i am John", "name John"
   */
  extractAndFillName(transcript) {
    if (!this.formFields.nameInput) return;

    // Pattern 1: "my name is ..."
    let match = transcript.match(/my name is\s+([a-z\s]+?)(?:\s+(?:and|my|i|am|password|email|farmer|retailer|customer)|$)/i);
    if (match && match[1]) {
      const name = match[1].trim();
      this.setInputValue(this.formFields.nameInput, name);
      console.log('[Voice] Filled name:', name);
      return;
    }

    // Pattern 2: "i am ..."
    match = transcript.match(/i am\s+([a-z\s]+?)(?:\s+(?:and|my|password|email|farmer|retailer|customer)|$)/i);
    if (match && match[1]) {
      const name = match[1].trim();
      this.setInputValue(this.formFields.nameInput, name);
      console.log('[Voice] Filled name:', name);
      return;
    }

    // Pattern 3: "name ... " (sometimes might miss above)
    match = transcript.match(/(?:my\s+)?name\s+(?:is\s+)?([a-z\s]+?)(?:\s+(?:and|my|i|password|email|farmer|retailer|customer)|$)/i);
    if (match && match[1]) {
      const name = match[1].trim();
      this.setInputValue(this.formFields.nameInput, name);
      console.log('[Voice] Filled name:', name);
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
   * Extract email from transcript and fill input
   * Patterns: "my email is john@example.com", "email john at example dot com"
   */
  extractAndFillEmail(transcript) {
    if (!this.formFields.emailInput) return;

    const lowerTranscript = transcript.toLowerCase();

    // Pattern 1: Direct email format in transcript (rare in speech but possible with spell-out)
    let match = lowerTranscript.match(/([a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,})/);
    if (match && match[1]) {
      this.setInputValue(this.formFields.emailInput, match[1]);
      console.log('[Voice] Filled email:', match[1]);
      return;
    }

    // Pattern 2: "email is ..."
    match = lowerTranscript.match(/email\s+(?:is\s+)?([a-z0-9@._+-]+)(?:\s+(?:password|and|my)|$)/);
    if (match && match[1]) {
      const email = match[1].replace(/\s+/g, ''); // Remove spaces
      this.setInputValue(this.formFields.emailInput, email);
      console.log('[Voice] Filled email:', email);
      return;
    }

    // Pattern 3: Email spelled out as "john at example dot com"
    // This pattern converts spelled-out emails
    match = lowerTranscript.match(/my email is (.+?)(?:\s+password|\s+and my|\s+i am|$)/);
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
   * Extract password from transcript and fill input
   * Patterns: "password is 12345", "my password is abc123"
   */
  extractAndFillPassword(transcript) {
    if (!this.formFields.passwordInput) return;

    const lowerTranscript = transcript.toLowerCase();

    // Pattern: "password is ..."
    let match = lowerTranscript.match(/password\s+(?:is\s+)?([a-z0-9!@#$%^&*]+)(?:\s+(?:farmer|retailer|customer|and|i am)|$)/);
    if (match && match[1]) {
      const password = match[1].trim();
      this.setInputValue(this.formFields.passwordInput, password);
      console.log('[Voice] Filled password (length: ' + password.length + ')');
      return;
    }

    // Pattern: "my password is ..."
    match = lowerTranscript.match(/my password\s+(?:is\s+)?([a-z0-9!@#$%^&*]+)(?:\s+(?:farmer|retailer|customer|and)|$)/);
    if (match && match[1]) {
      const password = match[1].trim();
      this.setInputValue(this.formFields.passwordInput, password);
      console.log('[Voice] Filled password (length: ' + password.length + ')');
    }
  }

  /**
   * Extract section (role) from transcript and fill select
   * Patterns: "I am a farmer", "I want to register as retailer"
   */
  extractAndFillSection(transcript) {
    if (!this.formFields.sectionSelect) return;

    const lowerTranscript = transcript.toLowerCase();

    // Pattern 1: "I am a farmer/retailer/customer"
    let match = lowerTranscript.match(/(?:i am|as|register as|be|be a)\s+(?:a\s+)?(farmer|retailer|customer)/);
    if (match && match[1]) {
      const section = match[1];
      this.setInputValue(this.formFields.sectionSelect, section);
      console.log('[Voice] Filled section:', section);
      return;
    }

    // Pattern 2: "section farmer" or "role farmer"
    match = lowerTranscript.match(/(?:section|role|type|category)\s+(farmer|retailer|customer)/);
    if (match && match[1]) {
      const section = match[1];
      this.setInputValue(this.formFields.sectionSelect, section);
      console.log('[Voice] Filled section:', section);
    }
  }
}

// Create singleton instance
const registrationHandler = new RegistrationHandler();

export default registrationHandler;

