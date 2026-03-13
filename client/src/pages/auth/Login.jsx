import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore(state => state.setAuth);

  const idFromState = location.state?.customID || '';

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleGetOTP = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/send-otp', {
        phone: phone.trim(),
        type: 'login'
      });

      setUserName(response.data.name || '');
      toast.success('OTP sent successfully!');
      setStep(2);
      setResendTimer(60);
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

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', { phone, otp });
      const { user, token } = response.data;

      setAuth(user, token);
      toast.success(`Welcome back, ${user.name}!`);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center px-4 py-8">
      {/* Decorative elements */}
      <div className="fixed top-10 left-10 text-green-200 text-6xl opacity-30 hidden lg:block">
        <i className="fas fa-leaf"></i>
      </div>
      <div className="fixed bottom-10 right-10 text-green-200 text-8xl opacity-20 hidden lg:block" style={{ transform: 'rotate(45deg)' }}>
        <i className="fas fa-seedling"></i>
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo Area */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i className="fas fa-leaf text-white text-2xl"></i>
          </div>
          <h1 className="text-3xl font-extrabold">
            <span className="text-green-700">Go</span>
            <span className="text-amber-500">Farm</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Fresh from the farm to your table</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-card border border-gray-100/60 p-5 sm:p-7">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-1">
            {step === 1 ? 'Welcome Back!' : 'Verify OTP'}
          </h2>
          <p className="text-gray-400 text-sm text-center mb-6">
            {step === 1 ? 'Enter your registered phone number' : `Code sent to +91 ${phone}`}
          </p>

          {error && (
            <div className="alert-error mb-4 animate-scale-in">
              <i className="fas fa-exclamation-circle flex-shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Phone Number */}
          {step === 1 && (
            <form onSubmit={handleGetOTP} className="space-y-5">
              <div>
                <label className="block text-gray-600 font-semibold mb-2 text-sm">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-2.5 sm:px-4 text-xs sm:text-sm font-bold text-gray-600 bg-gray-50 border-2 border-r-0 border-gray-200 rounded-l-2xl">
                    +91
                  </span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="flex-1 px-3 sm:px-4 py-3 sm:py-3.5 border-2 border-gray-200 rounded-r-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 focus:outline-none transition-all text-center text-base sm:text-lg tracking-normal sm:tracking-widest font-medium bg-white"
                    placeholder="98765 43210"
                    autoFocus
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2 text-base"
                disabled={loading}
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Sending...</>
                ) : (
                  <><i className="fas fa-paper-plane"></i> Get OTP</>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              {userName && (
                <div className="alert-success animate-scale-in">
                  <i className="fas fa-hand-wave"></i>
                  <span>Welcome back, <strong>{userName}</strong></span>
                </div>
              )}
              <div>
                <label className="block text-gray-600 font-semibold mb-2 text-sm">Enter 6-digit OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3.5 sm:py-4 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 focus:outline-none transition-all text-center text-xl sm:text-2xl tracking-[0.3em] sm:tracking-[0.5em] font-bold bg-white"
                  placeholder="● ● ● ● ● ●"
                  maxLength={6}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2 text-base"
                disabled={loading}
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Verifying...</>
                ) : (
                  <><i className="fas fa-check-circle"></i> Verify & Login</>
                )}
              </button>

              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-xs text-gray-400">Resend OTP in <span className="font-bold text-green-600">{resendTimer}s</span></p>
                ) : (
                  <button
                    type="button"
                    onClick={handleGetOTP}
                    className="text-sm text-green-600 hover:text-green-700 font-semibold"
                    disabled={loading}
                  >
                    Didn't receive code? <span className="underline">Resend</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); setError(''); }}
                className="w-full text-gray-400 hover:text-gray-600 text-sm py-2 font-medium transition-colors"
              >
                <i className="fas fa-arrow-left mr-1"></i> Change Number
              </button>
            </form>
          )}
        </div>

        {/* Register Link */}
        <p className="text-center text-gray-500 mt-6 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-green-600 font-bold hover:text-green-700 transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
