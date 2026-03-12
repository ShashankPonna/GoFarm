import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore(state => state.setAuth);

  // Pre-fill customID if coming from registration
  const idFromState = location.state?.customID || '';

  const [step, setStep] = useState(1); // 1=enter ID, 2=enter OTP
  const [customID, setCustomID] = useState(idFromState);
  const [, setPhone] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize reCAPTCHA ONCE on mount — never clear or recreate
  useEffect(() => {
    let container = document.getElementById('recaptcha-container-login');
    if (!container) {
      container = document.createElement('div');
      container.id = 'recaptcha-container-login';
      document.body.appendChild(container);
    }

    if (!window.recaptchaVerifierLogin) {
      window.recaptchaVerifierLogin = new RecaptchaVerifier(auth, 'recaptcha-container-login', {
        size: 'invisible',
        callback: () => console.log('[Login] reCAPTCHA solved'),
        'expired-callback': () => {
          console.log('[Login] reCAPTCHA expired');
        }
      });
    }
  }, []);

  // STEP 1: Lookup user by customID and send OTP
  const handleGetOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!customID.trim()) {
      setError('Please enter your ID');
      return;
    }

    setLoading(true);
    try {
      // Lookup phone number from backend
      const response = await api.post('/auth/login', { customID: customID.trim().toUpperCase() });
      const { phone: userPhone, maskedPhone: masked, name } = response.data;

      setPhone(userPhone);
      setMaskedPhone(masked);
      setUserName(name);

      // Send OTP via Firebase
      const phoneNumber = userPhone.startsWith('+') ? userPhone : `+91${userPhone}`;
      const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifierLogin);
      setConfirmationResult(result);
      setStep(2);
    } catch (err) {
      console.error('Login lookup error:', err);
      if (err.response?.status === 404) {
        setError('No user found with this ID. Please check and try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a few minutes.');
      } else {
        setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP and complete login
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

      // Verify login with backend
      const response = await api.post('/auth/verify-login', {}, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      const user = response.data.user;

      // Store auth state
      setAuth(user, idToken);

      // Redirect to dashboard based on role
      if (user.role === 'farmer') {
        navigate('/farmer/dashboard');
      } else if (user.role === 'retailer') {
        navigate('/retailer/options');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('OTP verify error:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP. Please check and try again.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors bg-white';
  const btnClass = 'w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">

        <h2 className="text-2xl font-bold text-green-700 mb-1 text-center">
          🔐 Login to GOFaRm
        </h2>
        <p className="text-gray-500 text-sm text-center mb-6">
          {step === 1 ? 'Enter your Farmer / Retailer ID' : `OTP sent to ${maskedPhone}`}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* STEP 1: Enter Custom ID */}
        {step === 1 && (
          <form onSubmit={handleGetOTP} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Your ID</label>
              <input
                type="text"
                value={customID}
                onChange={(e) => setCustomID(e.target.value.toUpperCase())}
                className={`${inputClass} text-center text-lg font-mono tracking-wider`}
                placeholder="FARM-XXXX or RET-XXXX"
                autoFocus
                required
              />
            </div>
            <button type="submit" className={btnClass} disabled={loading}>
              {loading ? '⏳ Sending OTP...' : '📱 Get OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center mb-2">
              <p className="text-sm text-gray-600">Welcome back, <strong>{userName}</strong></p>
              <p className="text-xs text-gray-500">ID: {customID}</p>
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
              {loading ? '⏳ Verifying...' : '✅ Verify & Login'}
            </button>
            <button
              type="button"
              onClick={() => { setStep(1); setOtp(''); setError(''); }}
              className="w-full text-gray-500 hover:text-gray-700 text-sm py-2"
            >
              ← Change ID
            </button>
          </form>
        )}

        <p className="text-center text-gray-600 mt-6 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-green-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
