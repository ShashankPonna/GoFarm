import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileImage, setProfileImage] = useState('https://ui-avatars.com/api/?name=User&background=10b981&color=fff&size=200');

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    if (user.name) {
      setProfileImage(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10b981&color=fff&size=200`);
    }
  }, [user, isAuthenticated, navigate]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  if (!user) return null;

  // Trust score color
  const getTrustColor = (score) => {
    if (score >= 70) return { bg: 'from-green-500 to-emerald-500', text: 'text-green-700', label: 'High Trust' };
    if (score >= 40) return { bg: 'from-yellow-500 to-orange-500', text: 'text-yellow-700', label: 'Medium Trust' };
    return { bg: 'from-red-500 to-pink-500', text: 'text-red-700', label: 'Low Trust' };
  };

  const trust = getTrustColor(user.trustScore || 50);

  const stats = [
    { label: 'Trust Score', value: `${user.trustScore || 50}/100`, icon: '🛡️', color: 'green' },
    { label: 'Role', value: user.role === 'farmer' ? '🌾 Farmer' : '🏪 Retailer', icon: '', color: 'blue' },
    { label: 'District', value: user.location?.district || '-', icon: '📍', color: 'purple' },
    { label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), icon: '📅', color: 'indigo' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)'
          }}></div>
        </div>
        <div className="container mx-auto px-6 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => window.history.back()}
                className="mr-4 hover:bg-white hover:bg-opacity-20 p-3 rounded-xl transition-all transform hover:scale-110"
              >
                <i className="fas fa-arrow-left text-2xl"></i>
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">My Account</h1>
                <p className="text-green-100 mt-1">Manage your profile and settings</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg flex items-center"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 border-2 border-gray-100">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-32"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-6">
              <div className="relative">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-white shadow-xl"
                />
              </div>
              <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left flex-1">
                <h2 className="text-3xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-gray-600 text-lg capitalize">{user.role}</p>
                {/* Custom ID Badge */}
                <div className="mt-2 inline-flex items-center gap-2">
                  <span style={{
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    color: 'white',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '700',
                    fontFamily: 'monospace',
                    letterSpacing: '2px'
                  }}>
                    🆔 {user.customID}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${trust.text} bg-opacity-20`} style={{ backgroundColor: user.trustScore >= 70 ? '#dcfce7' : user.trustScore >= 40 ? '#fef3c7' : '#fecaca' }}>
                    {trust.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 text-center border-2 border-gray-200 hover:shadow-lg transition-all">
                  <p className="text-2xl mb-1">{stat.icon}</p>
                  <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 border-2 border-gray-100">
          <div className="flex overflow-x-auto">
            {[
              { id: 'profile', label: 'Profile Info', icon: 'fa-user' },
              { id: 'security', label: 'Security', icon: 'fa-lock' },
              { id: 'activity', label: 'Activity', icon: 'fa-history' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 font-semibold transition-all border-b-4 ${activeTab === tab.id
                    ? 'border-green-600 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <i className={`fas ${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100">
          {activeTab === 'profile' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-user-circle text-green-600 mr-3"></i>
                Profile Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Custom ID */}
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-500 mb-1">
                    🆔 Your ID
                  </label>
                  <p className="text-2xl font-bold text-green-700 font-mono tracking-wider">{user.customID}</p>
                </div>

                {/* Trust Score */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-500 mb-1">
                    🛡️ Trust Score
                  </label>
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-bold text-blue-700">{user.trustScore || 50}/100</p>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full bg-gradient-to-r ${trust.bg}`}
                        style={{ width: `${user.trustScore || 50}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-user mr-2 text-green-600"></i>
                    Full Name
                  </label>
                  <input type="text" value={user.name} disabled
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-800"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-phone mr-2 text-green-600"></i>
                    Phone Number
                  </label>
                  <input type="text" value={`+91 ${user.phone}`} disabled
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-800"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-user-tag mr-2 text-green-600"></i>
                    Role
                  </label>
                  <input type="text" value={user.role === 'farmer' ? '🌾 Farmer' : '🏪 Retailer'} disabled
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-800 capitalize"
                  />
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-map-marker-alt mr-2 text-green-600"></i>
                    District
                  </label>
                  <input type="text" value={user.location?.district || '-'} disabled
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-800"
                  />
                </div>

                {/* Taluka */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-map mr-2 text-green-600"></i>
                    Taluka
                  </label>
                  <input type="text" value={user.location?.taluka || '-'} disabled
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-800"
                  />
                </div>

                {/* Village */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-home mr-2 text-green-600"></i>
                    Village
                  </label>
                  <input type="text" value={user.location?.village || '-'} disabled
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-800"
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-hashtag mr-2 text-green-600"></i>
                    Pincode
                  </label>
                  <input type="text" value={user.location?.pincode || '-'} disabled
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-800"
                  />
                </div>

                {/* Member Since */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-calendar mr-2 text-green-600"></i>
                    Member Since
                  </label>
                  <input type="text" value={new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} disabled
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-800"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-shield-alt text-green-600 mr-3"></i>
                Security Settings
              </h3>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg text-gray-800 mb-2">🔐 OTP Authentication</h4>
                      <p className="text-gray-600">Secured via Firebase Phone OTP</p>
                    </div>
                    <span className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm">
                      ✅ Active
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg text-gray-800 mb-2">🆔 Your Login ID</h4>
                      <p className="text-gray-600">Use this ID to log in: <strong className="text-blue-700 font-mono text-lg">{user.customID}</strong></p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg text-gray-800 mb-2">📱 Registered Phone</h4>
                      <p className="text-gray-600">+91 {user.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-clock text-green-600 mr-3"></i>
                Recent Activity
              </h3>
              <div className="text-center py-12 text-gray-500">
                <i className="fas fa-history text-5xl mb-4 text-gray-300"></i>
                <p className="text-lg">Activity tracking coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
