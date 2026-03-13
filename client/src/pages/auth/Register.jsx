import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import locationData from '../../data/locationData.json';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const roleFromState = location.state?.role || 'farmer';

  const [formData, setFormData] = useState({
    name: '', phone: '', role: roleFromState,
    district: '', taluka: '', village: '', pincode: ''
  });

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedID, setGeneratedID] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const [talukas, setTalukas] = useState([]);
  const [villages, setVillages] = useState([]);

  const handleDistrictChange = (e) => {
    const district = e.target.value;
    setFormData(prev => ({ ...prev, district, taluka: '', village: '' }));
    const found = locationData.districts.find(d => d.name === district);
    setTalukas(found ? found.talukas : []);
    setVillages([]);
  };

  const handleTalukaChange = (e) => {
    const taluka = e.target.value;
    setFormData(prev => ({ ...prev, taluka, village: '' }));
    const found = talukas.find(t => t.name === taluka);
    setVillages(found ? found.villages : []);
  };

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
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
      await api.post('/auth/send-otp', { phone, type: 'register' });
      toast.success('OTP sent successfully!');
      setStep(2);
      setResendTimer(60);
    } catch (err) {
      console.error('OTP send error:', err);
      setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
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
      const response = await api.post('/auth/verify-otp', {
        phone: formData.phone,
        otp,
        userData: {
          name: formData.name,
          role: formData.role,
          district: formData.district,
          taluka: formData.taluka,
          village: formData.village,
          pincode: formData.pincode
        }
      });

      const { user } = response.data;
      setGeneratedID(user.customID);
      toast.success('Registration successful!');
      setStep(3);
    } catch (err) {
      console.error('OTP verify / register error:', err);
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Progress indicator
  const steps = [
    { num: 1, label: 'Details' },
    { num: 2, label: 'Verify' },
    { num: 3, label: 'Done' },
  ];

  const inputClasses = "w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 focus:outline-none transition-all text-base bg-white";
  const selectClasses = "w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 focus:outline-none transition-all text-base bg-white appearance-none cursor-pointer";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <i className="fas fa-leaf text-white text-xl"></i>
          </div>
          <h1 className="text-2xl font-extrabold">
            <span className="text-green-700">Go</span>
            <span className="text-amber-500">Farm</span>
          </h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                step >= s.num
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {step > s.num ? <i className="fas fa-check text-xs"></i> : s.num}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${step >= s.num ? 'text-green-700' : 'text-gray-400'}`}>{s.label}</span>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 rounded ${step > s.num ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-card border border-gray-100/60 p-7 relative">
          <div className="absolute top-4 right-4">
            <LanguageSwitcher />
          </div>

          <h2 className="text-xl font-bold text-gray-800 text-center mb-1">
            {step === 1 && 'Create Your Account'}
            {step === 2 && 'Verify Phone'}
            {step === 3 && 'All Done!'}
          </h2>
          <p className="text-gray-400 text-sm text-center mb-5">
            {step === 1 && 'Fill your details to get started'}
            {step === 2 && `Enter OTP sent to +91 ${formData.phone}`}
            {step === 3 && 'Your account is ready'}
          </p>

          {error && (
            <div className="alert-error mb-4 animate-scale-in">
              <i className="fas fa-exclamation-circle flex-shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Form */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-gray-600 font-semibold mb-1.5 text-sm">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClasses}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1.5 text-sm">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 text-sm font-bold text-gray-600 bg-gray-50 border-2 border-r-0 border-gray-200 rounded-l-2xl">+91</span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className={`${inputClasses} rounded-l-none`}
                    placeholder="10-digit number"
                    required
                    pattern="[0-9]{10}"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1.5 text-sm">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  {['farmer', 'retailer'].map(r => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setFormData({ ...formData, role: r })}
                      className={`py-3 rounded-2xl border-2 font-bold text-sm transition-all ${
                        formData.role === r
                          ? r === 'farmer'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-200 text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {r === 'farmer' ? '🌾 Farmer' : '🏪 Retailer'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1.5 text-sm">District</label>
                <select value={formData.district} onChange={handleDistrictChange} className={selectClasses} required>
                  <option value="">Select District</option>
                  {locationData.districts.map((d) => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1.5 text-sm">Taluka</label>
                  <select value={formData.taluka} onChange={handleTalukaChange} className={selectClasses} required disabled={!formData.district}>
                    <option value="">Select</option>
                    {talukas.map((t) => (
                      <option key={t.name} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1.5 text-sm">Village</label>
                  <select
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className={selectClasses}
                    required
                    disabled={!formData.taluka}
                  >
                    <option value="">Select</option>
                    {villages.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1.5 text-sm">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className={inputClasses}
                  placeholder="6-digit pincode"
                  required
                  pattern="[0-9]{6}"
                />
              </div>

              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 text-base" disabled={loading}>
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Sending OTP...</>
                ) : (
                  <><i className="fas fa-paper-plane"></i> Send OTP</>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label className="block text-gray-600 font-semibold mb-2 text-sm">Enter 6-digit OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 focus:outline-none transition-all text-center text-2xl tracking-[0.5em] font-bold bg-white"
                  placeholder="● ● ● ● ● ●"
                  maxLength={6}
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 text-base" disabled={loading}>
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Verifying...</>
                ) : (
                  <><i className="fas fa-check-circle"></i> Verify & Register</>
                )}
              </button>

              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-xs text-gray-400">Resend OTP in <span className="font-bold text-green-600">{resendTimer}s</span></p>
                ) : (
                  <button type="button" onClick={handleSendOTP} className="text-sm text-green-600 hover:text-green-700 font-semibold" disabled={loading}>
                    Didn't receive code? <span className="underline">Resend</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); setError(''); }}
                className="w-full text-gray-400 hover:text-gray-600 text-sm py-2 font-medium transition-colors"
              >
                <i className="fas fa-arrow-left mr-1"></i> Go back & change details
              </button>
            </form>
          )}

          {/* STEP 3: Success */}
          {step === 3 && (
            <div className="text-center space-y-5 animate-scale-in">
              <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto">
                <i className="fas fa-check-circle text-4xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Registration Successful!</h3>
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
                <p className="text-sm text-gray-500 mb-2">Your {formData.role === 'farmer' ? 'Farmer' : 'Retailer'} ID is:</p>
                <p className="text-3xl font-extrabold text-green-700 tracking-wider">{generatedID}</p>
              </div>
              <div className="alert-warning">
                <i className="fas fa-exclamation-triangle flex-shrink-0"></i>
                <span>Please save this ID. You will need it to log in.</span>
              </div>
              <button
                onClick={() => navigate('/login', { state: { customID: generatedID } })}
                className="btn-primary w-full flex items-center justify-center gap-2 text-base"
              >
                Go to Login <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          )}
        </div>

        {/* Login Link */}
        {step !== 3 && (
          <p className="text-center text-gray-500 mt-6 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 font-bold hover:text-green-700 transition-colors">
              Login here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;
