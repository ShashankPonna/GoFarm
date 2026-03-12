import React, { useState, useEffect, useRef } from 'react';
import speechEngine from '../utils/voice/speechEngine';
import registrationHandler from '../utils/voice/registrationHandler';
import loginHandler from '../utils/voice/loginHandler';
import navigationHandler from '../utils/voice/navigationHandler';
import languageSupport from '../utils/voice/languageSupport';

/**
 * VoiceButton Component
 * Floating microphone button for voice assistant
 * - Displays listening state
 * - Shows transcript in real-time
 * - Handles voice feedback text
 * - Routes voice commands to appropriate handlers
 */
const VoiceButton = ({ navigate, currentPage = 'home' }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const voiceButtonRef = useRef(null);
  const languageMenuRef = useRef(null);

  // Initialize speech engine listeners
  useEffect(() => {
    // Define handleVoiceInput inside the effect to avoid circular dependencies
    const handleVoiceInputLocal = (voiceText) => {
      try {
        console.log('[VoiceButton] Processing voice input:', voiceText);
        console.log('[VoiceButton] Current page:', currentPage);
        
        // Check if this is a navigation command
        const triggerWords = languageSupport.getTriggerWords();
        const lowerText = voiceText.toLowerCase();

        console.log('[VoiceButton] Trigger words:', triggerWords);
        console.log('[VoiceButton] Checking if any trigger word matches...');

        if (triggerWords.some(trigger => lowerText.includes(trigger.toLowerCase()))) {
          console.log('[VoiceButton] Navigation command detected, routing to navigationHandler');
          setFeedbackText('🗺️ Processing navigation command...');
          navigationHandler.handleCommand(voiceText);
        } else if (currentPage === 'registration') {
          console.log('[VoiceButton] Registration page detected, routing to registrationHandler');
          setFeedbackText('📝 Processing registration info...');
          registrationHandler.handleTranscript(voiceText);
          setFeedbackText('✅ Form field updated!');
        } else if (currentPage === 'login') {
          console.log('[VoiceButton] Login page detected, routing to loginHandler');
          setFeedbackText('🔐 Processing login info...');
          loginHandler.handleTranscript(voiceText);
          setFeedbackText('✅ Form field updated!');
        } else {
          console.log('[VoiceButton] No specific handler matched, routing to navigationHandler');
          setFeedbackText('🗺️ Processing navigation command...');
          navigationHandler.handleCommand(voiceText);
        }

        // Clear transcript after handling
        setTimeout(() => {
          setTranscript('');
          setFeedbackText('');
        }, 3000);
      } catch (err) {
        console.error('[VoiceButton] Error processing voice input:', err);
        setFeedbackText('❌ Error processing command');
        setError('Error processing voice command');
      }
    };

    const handleTranscript = (data) => {
      console.log('[VoiceButton] Transcript callback:', { type: data.type, isFinal: data.isFinal, transcript: data.transcript, interim: data.interim });
      
      // Show interim results as user is speaking
      if (data.interim && !data.isFinal) {
        setInterimTranscript(data.interim);
        setTranscript('');
      }
      
      // When final result arrives
      if (data.isFinal) {
        setTranscript(data.transcript);
        setInterimTranscript('');
        console.log('[VoiceButton] ✅ Final transcript detected:', data.transcript);
        handleVoiceInputLocal(data.transcript);
      } else if (!data.interim) {
        // Just showing the current state
        setTranscript(data.transcript);
      }
    };

    speechEngine.onTranscript(handleTranscript);
    return () => {
      // Cleanup listeners
      speechEngine.recognition.onresult = null;
      speechEngine.recognition.onerror = null;
    };
  }, [currentPage]);

  /**
   * Start listening
   */
  const startListening = () => {
    if (!speechEngine.recognition) {
      setError('Speech recognition not supported in your browser');
      return;
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');
    setFeedbackText(languageSupport.getMessage('listening'));
    setIsListening(true);

    speechEngine.setLanguage(selectedLanguage);
    speechEngine.start();
  };

  /**
   * Stop listening
   */
  const stopListening = () => {
    speechEngine.stop();
    setIsListening(false);
    setFeedbackText(languageSupport.getMessage('listeningComplete'));
    setTimeout(() => setFeedbackText(''), 1500);
  };

  /**
   * Change language
   */
  const changeLanguage = (langCode) => {
    setSelectedLanguage(langCode);
    languageSupport.setLanguage(langCode);
    speechEngine.setLanguage(langCode);
    setShowLanguageMenu(false);
  };

  /**
   * Toggle language menu
   */
  const toggleLanguageMenu = (e) => {
    e.stopPropagation();
    setShowLanguageMenu(!showLanguageMenu);
  };

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(e.target) &&
        voiceButtonRef.current &&
        !voiceButtonRef.current.contains(e.target)
      ) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Feedback text */}
      {feedbackText && (
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-pulse">
          {feedbackText}
        </div>
      )}

      {/* Transcript display */}
      {(transcript || interimTranscript) && (
        <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg max-w-xs text-sm">
          <p className="font-semibold text-blue-300 text-xs mb-1">Voice Input:</p>
          {transcript && <p className="text-white">{transcript}</p>}
          {interimTranscript && !transcript && (
            <p className="text-gray-400 italic">{interimTranscript}...</p>
          )}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          Error: {error}
        </div>
      )}

      {/* Language menu (hidden by default, shown when toggled) */}
      {showLanguageMenu && (
        <div
          ref={languageMenuRef}
          className="bg-white border border-gray-300 rounded-lg shadow-lg p-2 space-y-1 absolute bottom-16 right-0"
        >
          {languageSupport.getAvailableLanguages().map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                selectedLanguage === lang.code
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}

      {/* Main voice button container */}
      <div className="flex gap-2 items-center">
        {/* Language toggle button */}
        <button
          onClick={toggleLanguageMenu}
          className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center"
          title="Change language"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5h12M9 3v7m0 0l-3-3m3 3l3-3m6 0h12m-6 2v7m0 0l-3-3m3 3l3-3"
            />
          </svg>
          <span className="text-xs font-bold ml-1">
            {selectedLanguage.split('-')[0].toUpperCase()}
          </span>
        </button>

        {/* Microphone button */}
        <button
          ref={voiceButtonRef}
          onClick={isListening ? stopListening : startListening}
          className={`relative p-4 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center ${
            error
              ? 'bg-red-500 hover:bg-red-600'
              : isListening
              ? 'bg-blue-500 hover:bg-blue-600 animate-pulse'
              : 'bg-gray-600 hover:bg-gray-700'
          }`}
          title={isListening ? 'Stop listening' : 'Start listening'}
        >
          {error ? (
            // Error icon
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          ) : isListening ? (
            // Stop icon
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z" />
            </svg>
          ) : (
            // Mic icon
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm0-11c.55 0 1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V4c0-.55.45-1 1-1z" />
              <path d="M17 16.51c0 .89-.36 1.76-.93 2.38.57.62.93 1.46.93 2.37 0 1.97-1.69 3.58-3.76 3.74v-1.07c1.52-.18 2.68-1.45 2.68-3.09 0-.75-.36-1.44-.95-1.9.59-.44.95-1.14.95-1.85 0-1.38-1.12-2.5-2.5-2.5s-2.5 1.12-2.5 2.5c0 .71.36 1.41.95 1.85-.59.46-.95 1.15-.95 1.9 0 1.64 1.16 2.91 2.68 3.09v1.07c-2.07-.16-3.76-1.77-3.76-3.74 0-.91.36-1.75.93-2.37-.57-.62-.93-1.49-.93-2.38 0-1.97 1.69-3.58 3.76-3.74v1.07c-1.52.18-2.68 1.45-2.68 3.09z" />
            </svg>
          )}
        </button>
      </div>

      {/* Status indicator */}
      <div className="text-xs text-gray-600 text-right">
        {isListening ? (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Listening...
          </span>
        ) : (
          <span className="text-gray-500">Click to start</span>
        )}
      </div>
    </div>
  );
};

export default VoiceButton;
