import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LanguageSelection = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  
  // Get the selected role from the previous page
  const selectedRole = location.state?.role;

  // Initialize with current language or default to English
  useEffect(() => {
    if (i18n && i18n.language) {
      setSelectedLanguage(i18n.language);
    }
  }, [i18n]);

  const languages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      description: 'Continue in English',
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50'
    },
    {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिंदी',
      flag: '🇮🇳',
      description: 'हिंदी में जारी रखें',
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-50'
    },
    {
      code: 'mr',
      name: 'Marathi',
      nativeName: 'मराठी',
      flag: '🇮🇳',
      description: 'मराठीत सुरू ठेवा',
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50'
    }
  ];

  const handleLanguageSelect = (languageCode) => {
    setSelectedLanguage(languageCode);
  };

  const handleContinue = async () => {
    try {
      // Set the selected language
      if (i18n && typeof i18n.changeLanguage === 'function') {
        await i18n.changeLanguage(selectedLanguage);
      } else {
        // Fallback: set language in localStorage directly
        localStorage.setItem('i18nextLng', selectedLanguage);
      }
      
      // Navigate to register with both role and language
      navigate('/register', { 
        state: { 
          role: selectedRole,
          language: selectedLanguage 
        } 
      });
    } catch (error) {
      console.error('Error changing language:', error);
      // Still navigate even if language change fails
      navigate('/register', { 
        state: { 
          role: selectedRole,
          language: selectedLanguage 
        } 
      });
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  // If no role is selected, redirect back to role selection
  if (!selectedRole) {
    navigate('/');
    return null;
  }

  const getRoleInfo = (role) => {
    const roleInfo = {
      farmer: {
        icon: '👨‍🌾',
        title: 'Farmer',
        titleHi: 'किसान',
        titleMr: 'शेतकरी'
      },
      retailer: {
        icon: '🏪',
        title: 'Retailer',
        titleHi: 'खुदरा विक्रेता',
        titleMr: 'किरकोळ विक्रेता'
      },
      consumer: {
        icon: '🛒',
        title: 'Consumer',
        titleHi: 'उपभोक्ता',
        titleMr: 'ग्राहक'
      }
    };
    return roleInfo[role] || roleInfo.farmer;
  };

  const roleInfo = getRoleInfo(selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-emerald-300 flex items-center justify-center p-6">
      <div className="bg-white bg-opacity-90 rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-4xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <h2 className="text-5xl font-extrabold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-amber-500">🌾GO</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">FaRm</span>
          </h2>
        </div>

        {/* Selected Role Display */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-green-100 rounded-full px-6 py-3 mb-4">
            <span className="text-3xl mr-3">{roleInfo.icon}</span>
            <div className="text-left">
              <p className="text-sm text-green-600 font-medium">Selected Role</p>
              <p className="text-lg font-bold text-green-800">{roleInfo.title}</p>
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Choose Your Language</h1>
          <p className="text-lg text-green-600 font-medium">Select your preferred language to continue</p>
          <p className="text-sm text-gray-500 mt-2">आपनी पसंदीदा भाषा चुनें | आपली आवडती भाषा निवडा</p>
        </div>

        {/* Language Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {languages.map((language) => (
            <div
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              className={`group cursor-pointer transform transition-all duration-500 hover:scale-105 ${
                selectedLanguage === language.code ? 'scale-105' : ''
              }`}
            >
              <div className={`bg-gradient-to-br ${language.bgGradient} rounded-3xl shadow-2xl p-6 h-full flex flex-col items-center border-4 transition-all duration-500 ${
                selectedLanguage === language.code 
                  ? 'border-green-400 shadow-green-200' 
                  : 'border-transparent hover:border-green-300'
              }`}>
                {/* Flag */}
                <div className="text-6xl mb-4 group-hover:scale-125 transition-transform duration-500">
                  {language.flag}
                </div>
                
                {/* Language Name */}
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{language.nativeName}</h3>
                <p className="text-lg text-gray-600 mb-4">{language.name}</p>
                
                {/* Description */}
                <p className="text-center text-gray-600 mb-4 text-sm">{language.description}</p>
                
                {/* Selection Indicator */}
                {selectedLanguage === language.code && (
                  <div className="flex items-center text-green-600 font-bold">
                    <i className="fas fa-check-circle mr-2"></i>
                    <span>Selected</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={handleBack}
            className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-1"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Role Selection
          </button>
          
          <button 
            onClick={handleContinue}
            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-1 text-lg"
          >
            <i className="fas fa-arrow-right mr-2"></i>
            Continue Registration
          </button>
        </div>

        {/* Language Preview */}
        <div className="mt-8 text-center">
          <div className="bg-gray-100 rounded-xl p-4 inline-block">
            <p className="text-sm text-gray-600 mb-2">Preview in selected language:</p>
            <div className="font-bold text-lg">
              {selectedLanguage === 'en' && `Welcome, ${roleInfo.title}!`}
              {selectedLanguage === 'hi' && `स्वागत है, ${roleInfo.titleHi}!`}
              {selectedLanguage === 'mr' && `स्वागत आहे, ${roleInfo.titleMr}!`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelection;