/**
 * Speech Recognition Engine
 * Core module for handling speech-to-text conversion
 * Uses browser-native Web Speech API
 */

class SpeechEngine {
  constructor() {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported in this browser');
      this.supported = false;
      return;
    }

    this.recognition = new SpeechRecognition();
    this.supported = true;
    this.isListening = false;
    this.transcript = '';
    this.language = 'en-IN'; // Default: English (India)
    this.listeners = []; // Callbacks for transcript events

    this.setupRecognition();
  }

  /**
   * Configure speech recognition settings
   */
  setupRecognition() {
    if (!this.supported) return;

    // Enable continuous recognition to capture longer speech
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.language;
    this.recognition.maxAlternatives = 1;

    // When speech recognition starts
    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('[Voice] 🎤 Listening started... (lang:', this.language + ')');
      this.notifyListeners({ type: 'start', transcript: '' });
    };

    // As user speaks (interim results)
    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      console.log('[Voice] onresult fired - event.results.length:', event.results.length, 'resultIndex:', event.resultIndex);

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        console.log(`[Voice] Result[${i}]: "${transcriptPart}" (confidence: ${confidence}, isFinal: ${event.results[i].isFinal})`);

        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart + ' ';
        } else {
          interimTranscript += transcriptPart;
        }
      }

      // Update transcript - trim whitespace
      if (finalTranscript.trim()) {
        this.transcript = finalTranscript.trim();
        console.log('[Voice] ✅ FINAL TRANSCRIPT SET:', this.transcript);
      }

      // Notify listeners
      const currentTranscript = this.transcript || interimTranscript;
      const isFinal = this.transcript.length > 0;

      this.notifyListeners({
        type: 'result',
        transcript: currentTranscript,
        isFinal: isFinal,
        interim: interimTranscript
      });
    };

    // When speech recognition ends
    this.recognition.onend = () => {
      this.isListening = false;
      console.log('[Voice] 🏁 Listening ended');
      console.log('[Voice] Final transcript at end:', this.transcript || '(empty)');
      
      // Notify with final result - even if empty, to trigger any pending handlers
      this.notifyListeners({
        type: 'end',
        transcript: this.transcript,
        isFinal: true
      });
    };

    // Error handling
    this.recognition.onerror = (event) => {
      console.error('[Voice] ❌ ERROR:', event.error);
      
      // Special handling for common errors
      if (event.error === 'no-speech') {
        console.error('[Voice] No speech detected - did you speak? Check microphone!');
      } else if (event.error === 'network') {
        console.error('[Voice] Network error - check internet connection');
      } else if (event.error === 'not-allowed') {
        console.error('[Voice] Microphone permission denied - check browser permissions');
      } else if (event.error === 'audio-capture') {
        console.error('[Voice] Audio capture failed - check microphone is connected');
      }
      
      this.notifyListeners({
        type: 'error',
        error: event.error,
        transcript: this.transcript
      });
    };
  }

  /**
   * Start listening
   */
  start() {
    if (!this.supported) {
      console.warn('Speech Recognition not supported');
      return;
    }

    this.transcript = ''; // Reset transcript
    this.recognition.lang = this.language; // Set language
    this.recognition.start();
  }

  /**
   * Stop listening
   */
  stop() {
    if (!this.supported) return;
    this.recognition.stop();
  }

  /**
   * Abort listening
   */
  abort() {
    if (!this.supported) return;
    this.recognition.abort();
  }

  /**
   * Set language for speech recognition
   * @param {string} lang - Language code (e.g., 'en-IN', 'hi-IN', 'mr-IN')
   */
  setLanguage(lang) {
    this.language = lang;
    console.log('[Voice] Language set to:', lang);
  }

  /**
   * Get current transcript
   */
  getTranscript() {
    return this.transcript;
  }

  /**
   * Check if currently listening
   */
  getIsListening() {
    return this.isListening;
  }

  /**
   * Register callback for transcript events
   * @param {function} callback - Function to call on transcript event
   */
  onTranscript(callback) {
    console.log('[Voice] Registering transcript listener (total listeners:', this.listeners.length + 1 + ')');
    this.listeners.push(callback);
    console.log('[Voice] ✅ Listener registered successfully');
  }

  /**
   * Remove callback
   * @param {function} callback - Callback to remove
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  /**
   * Notify all listeners of transcript change
   * @param {object} data - Event data
   */
  notifyListeners(data) {
    console.log(`[Voice] Notifying ${this.listeners.length} listener(s) - type: ${data.type}, isFinal: ${data.isFinal}, transcript: "${data.transcript}"`);
    this.listeners.forEach((callback, index) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[Voice] Listener[${index}] error:`, error);
      }
    });
  }

  /**
   * Text-to-Speech using browser's SpeechSynthesis API
   * @param {string} text - Text to speak
   * @param {string} lang - Language code
   */
  speak(text, lang = 'en-IN') {
    if (!window.speechSynthesis) {
      console.warn('Speech Synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1; // Normal speed
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);

    return utterance;
  }

  /**
   * Check if browser supports speech recognition
   */
  isSupported() {
    return this.supported;
  }
}

// Create singleton instance
const speechEngine = new SpeechEngine();

export default speechEngine;
