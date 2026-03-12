import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import locationData from '../../data/locationData.json';
import api from '../../utils/api';

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const roleFromState = location.state?.role || 'farmer';

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: roleFromState,
    district: '',
    taluka: '',
    village: '',
    pincode: ''
  });

  // OTP flow state
  const [step, setStep] = useState(1); // 1=form, 2=otp, 3=success
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedID, setGeneratedID] = useState('');

  // Location dropdown state
  const [talukas, setTalukas] = useState([]);
  const [villages, setVillages] = useState([]);

  // Initialize reCAPTCHA ONCE on mount — with proper cleanup
  useEffect(() => {
    // Create container outside React DOM
    let container = document.getElementById('recaptcha-container-reg');
    if (!container) {
      container = document.createElement('div');
      container.id = 'recaptcha-container-reg';
      document.body.appendChild(container);
    }

    // Clear any existing verifier to avoid stale DOM refs
    if (window.recaptchaVerifierReg) {
      try {
        window.recaptchaVerifierReg.clear();
      } catch (e) {
        // ignore clear errors
      }
      window.recaptchaVerifierReg = null;
    }

    try {
      window.recaptchaVerifierReg = new RecaptchaVerifier(auth, 'recaptcha-container-reg', {
        size: 'invisible',
        callback: () => console.log('[Register] reCAPTCHA solved'),
        'expired-callback': () => {
          console.log('[Register] reCAPTCHA expired');
        }
      });
    } catch (e) {
      console.warn('[Register] reCAPTCHA init error (safe to ignore in dev):', e.message);
    }

    return () => {
      // Cleanup on unmount
      if (window.recaptchaVerifierReg) {
        try {
          window.recaptchaVerifierReg.clear();
        } catch (e) {
          // ignore
        }
        window.recaptchaVerifierReg = null;
      }
    };
  }, []);

  // District change → populate talukas
  const handleDistrictChange = (e) => {
    const district = e.target.value;
    setFormData(prev => ({ ...prev, district, taluka: '', village: '' }));
    const found = locationData.districts.find(d => d.name === district);
    setTalukas(found ? found.talukas : []);
    setVillages([]);
  };

  // Taluka change → populate villages
  const handleTalukaChange = (e) => {
    const taluka = e.target.value;
    setFormData(prev => ({ ...prev, taluka, village: '' }));
    const found = talukas.find(t => t.name === taluka);
    setVillages(found ? found.villages : []);
  };

  // STEP 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    const { name, phone, role, district, taluka, village, pincode } = formData;
    if (!name || !phone || !role || !district || !taluka || !village || !pincode) {
      setError('Please fill all fields');
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setError('Enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const phoneNumber = `+91${phone}`;
      const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifierReg);
      setConfirmationResult(result);
      setStep(2);
    } catch (err) {
      console.error('OTP send error:', err.code, err.message, err);
      if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a few minutes.');
      } else if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number format.');
      } else if (err.code === 'auth/quota-exceeded') {
        setError('SMS quota exceeded. Try again later.');
      } else {
        setError(`Failed to send OTP: ${err.code || err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP and Register
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      // Verify OTP with Firebase
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();

      // Send registration data to backend with Firebase token
      const response = await api.post('/auth/register', {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        district: formData.district,
        taluka: formData.taluka,
        village: formData.village,
        pincode: formData.pincode
      }, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      const user = response.data.user;
      setGeneratedID(user.customID);
      setStep(3);
    } catch (err) {
      console.error('OTP verify / register error:', err.code, err.message, err);
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP. Please check and try again.');
      } else if (err.code === 'auth/code-expired') {
        setError('OTP expired. Go back and send a new OTP.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(`Verification failed: ${err.code || err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---

  const inputClass = 'w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors bg-white';
  const btnClass = 'w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">

        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>

        <h2 className="text-2xl font-bold text-green-700 mb-1 text-center">
          🌾 Register on GOFaRm
        </h2>
        <p className="text-gray-500 text-sm text-center mb-6">
          {step === 1 && 'Fill in your details to get your Farmer/Retailer ID'}
          {step === 2 && 'Enter the OTP sent to your phone'}
          {step === 3 && 'Registration successful!'}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Phone Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border-2 border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-gray-500 text-sm">+91</span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className={`${inputClass} rounded-l-none`}
                  placeholder="10-digit number"
                  required
                  pattern="[0-9]{10}"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className={inputClass}
              >
                <option value="farmer">🌾 Farmer</option>
                <option value="retailer">🏪 Retailer</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">District</label>
              <select value={formData.district} onChange={handleDistrictChange} className={inputClass} required>
                <option value="">Select District</option>
                {locationData.districts.map((d) => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Taluka</label>
              <select
                value={formData.taluka}
                onChange={handleTalukaChange}
                className={inputClass}
                required
                disabled={!formData.district}
              >
                <option value="">Select Taluka</option>
                {talukas.map((t) => (
                  <option key={t.name} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Village</label>
              <select
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className={inputClass}
                required
                disabled={!formData.taluka}
              >
                <option value="">Select Village</option>
                {villages.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Pincode</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                className={inputClass}
                placeholder="6-digit pincode"
                required
                pattern="[0-9]{6}"
              />
            </div>

            <button type="submit" className={btnClass} disabled={loading}>
              {loading ? '⏳ Sending OTP...' : '📱 Send OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="text-center mb-2">
              <p className="text-gray-600 text-sm">
                OTP sent to <strong>+91 {formData.phone}</strong>
              </p>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className={`${inputClass} text-center text-2xl tracking-widest`}
                placeholder="● ● ● ● ● ●"
                maxLength={6}
                autoFocus
              />
            </div>
            <button type="submit" className={btnClass} disabled={loading}>
              {loading ? '⏳ Verifying...' : '✅ Verify & Register'}
            </button>
            <button
              type="button"
              onClick={() => { setStep(1); setOtp(''); setError(''); }}
              className="w-full text-gray-500 hover:text-gray-700 text-sm py-2"
            >
              ← Go back & change details
            </button>
          </form>
        )}

        {/* STEP 3: Success */}
        {step === 3 && (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-2">🎉</div>
            <h3 className="text-xl font-bold text-green-700">Registration Successful!</h3>
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Your {formData.role === 'farmer' ? 'Farmer' : 'Retailer'} ID is:</p>
              <p className="text-3xl font-bold text-green-700 tracking-wider">{generatedID}</p>
            </div>
            <p className="text-red-600 font-semibold text-sm">
              ⚠️ Please save this ID. You will need it to log in.
            </p>
            <button
              onClick={() => navigate('/login', { state: { customID: generatedID } })}
              className={btnClass}
            >
              Go to Login →
            </button>
          </div>
        )}

        {step !== 3 && (
          <p className="text-center text-gray-600 mt-6 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 font-semibold hover:underline">
              Login here
            </Link>
          </p>
        )}

      </div>
    </div>
  );
};

export default Register;
