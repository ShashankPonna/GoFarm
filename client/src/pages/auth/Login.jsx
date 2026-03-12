import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore(state => state.setAuth);

  // Pre-fill customID if coming from registration
  const idFromState = location.state?.customID || '';

  const [step, setStep] = useState(1); // 1=enter Phone, 2=enter OTP
  const [phone, setPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Timer logic for Resend OTP
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // STEP 1: Send OTP to phone number
  const handleGetOTP = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      // Send OTP via Twilio Backend
      const response = await api.post('/auth/send-otp', { phone: phone.trim() });
      
      setUserName(response.data.name || '');
      toast.success('OTP sent successfully!');
      setStep(2);
      setResendTimer(60); // 60 seconds cooldown
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 404) {
        setError('No account found with this phone number. Please register.');
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
      // Verify OTP with backend
      const response = await api.post('/auth/verify-otp', {
        phone,
        otp
      });

      const { user, token } = response.data;

      // Store auth state
      setAuth(user, token);
      toast.success(`Welcome back, ${user.name}!`);

      // Redirect based on role
      if (user.role === 'farmer') {
        navigate('/farmer/dashboard');
      } else if (user.role === 'retailer') {
        navigate('/retailer/options');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('OTP verify error:', err);
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
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
          {step === 1 ? 'Enter your registered phone number' : `OTP sent to ${phone}`}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* STEP 1: Enter Phone Number */}
        {step === 1 && (
          <form onSubmit={handleGetOTP} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Phone Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                  +91
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className={`${inputClass} rounded-l-none text-center text-lg tracking-wider`}
                  placeholder="9876543210"
                  autoFocus
                  required
                />
              </div>
            </div>
            <button type="submit" className={btnClass} disabled={loading}>
              {loading ? '⏳ Processing...' : '📱 Get OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center mb-2">
              <p className="text-sm text-gray-600">Welcome back, <strong>{userName}</strong></p>
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
            
            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-xs text-gray-400">Resend OTP in {resendTimer}s</p>
              ) : (
                <button
                  type="button"
                  onClick={handleGetOTP}
                  className="text-xs text-green-600 hover:underline font-semibold"
                  disabled={loading}
                >
                  Didn't receive code? Resend
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => { setStep(1); setOtp(''); setError(''); }}
              className="w-full text-gray-500 hover:text-gray-700 text-sm py-2"
            >
              ← Change Number
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

