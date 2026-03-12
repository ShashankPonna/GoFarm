/**
 * Navigation Handler
 * Handles voice command navigation to features
 * Detects trigger words and redirects user
 */

import speechEngine from './speechEngine';
import featureScanner from './featureScanner';

class NavigationHandler {
  constructor() {
    this.speechEngine = speechEngine;
    this.featureScanner = featureScanner;
    this.navigateCallback = null; // Will be set by React Router
    this.triggerWords = ['open', 'go to', 'go', 'show', 'navigate', 'take me to', 'visit'];
  }

  /**
   * Set the navigate callback (from React Router useNavigate)
   * @param {function} callback - React Router navigate function
   */
  setNavigateCallback(callback) {
    this.navigateCallback = callback;
  }

  /**
   * Handle transcript for voice commands
   * @param {string} transcript - Speech-to-text transcript
   */
  handleCommand(transcript) {
    if (!transcript) return;

    const lowerTranscript = transcript.toLowerCase().trim();
    console.log('[Voice Navigation] Processing command:', lowerTranscript);

    // Extract trigger word and remaining text
    const { remainingText, triggerFound } = this.extractTriggerWord(lowerTranscript);

    if (triggerFound && remainingText) {
      console.log('[Voice Navigation] Extracted command:', remainingText);
      this.navigateToFeature(remainingText);
    } else {
      // No trigger word, but try to match anyway
      const feature = this.featureScanner.matchFeature(lowerTranscript);
      if (feature) {
        console.log('[Voice Navigation] Matched feature:', feature.name);
        this.navigateToFeature(feature.name, feature);
      }
    }
  }

  /**
   * Extract trigger word from transcript
   * @param {string} transcript - Lowercased transcript
   * @returns {object} { remainingText, triggerFound }
   */
  extractTriggerWord(transcript) {
    for (let trigger of this.triggerWords) {
      if (transcript.startsWith(trigger)) {
        const remainingText = transcript.substring(trigger.length).trim();
        return { remainingText, triggerFound: true };
      }
    }

    return { remainingText: transcript, triggerFound: false };
  }

  /**
   * Navigate to feature by name
   * @param {string} featureName - Name or keyword of the feature
   * @param {object} featureObj - Optional: pre-found feature object
   */
  navigateToFeature(featureName, featureObj = null) {
    // Use provided feature object or search for it
    const feature = featureObj || this.featureScanner.matchFeature(featureName);

    if (!feature) {
      console.warn('[Voice Navigation] Feature not found:', featureName);
      this.speakFeedback('Feature not found. Please try again.', 'en-IN');
      return;
    }

    console.log('[Voice Navigation] Navigating to:', feature.name, '→', feature.route);

    // Provide feedback
    this.speakFeedback(`Opening ${feature.name} page.`, 'en-IN');

    // Navigate using React Router if callback is set
    if (this.navigateCallback) {
      setTimeout(() => {
        this.navigateCallback(feature.route);
      }, 500); // Slight delay to let user hear the feedback
    } else {
      // Fallback: direct navigation
      console.warn('[Voice Navigation] Navigate callback not set. Using direct navigation.');
      setTimeout(() => {
        window.location.href = feature.route;
      }, 500);
    }
  }

  /**
   * Provide voice feedback to user
   * @param {string} text - Text to speak
   * @param {string} lang - Language code
   */
  speakFeedback(text, lang = 'en-IN') {
    console.log('[Voice Feedback]', text);
    if (this.speechEngine && this.speechEngine.speak) {
      this.speechEngine.speak(text, lang);
    }
  }

  /**
   * Get available trigger words
   */
  getTriggerWords() {
    return this.triggerWords;
  }

  /**
   * Add custom trigger word
   */
  addTriggerWord(word) {
    if (!this.triggerWords.includes(word.toLowerCase())) {
      this.triggerWords.push(word.toLowerCase());
      console.log('[Voice Navigation] Added trigger word:', word);
    }
  }

  /**
   * Remove trigger word
   */
  removeTriggerWord(word) {
    this.triggerWords = this.triggerWords.filter(w => w !== word.toLowerCase());
  }
}

// Create singleton instance
const navigationHandler = new NavigationHandler();

export default navigationHandler;
