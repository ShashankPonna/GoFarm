import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (roleType) => {
    navigate('/language-selection', { state: { role: roleType } });
  };

  const roles = [
    {
      type: 'farmer',
      icon: 'fa-tractor',
      emoji: '🌾',
      title: 'Farmer',
      description: 'Sell your produce directly and get fair prices for your hard work',
      features: ['Direct Market Access', 'Fair Pricing', 'No Middlemen'],
      color: 'green',
      btnLabel: 'Start as Farmer',
    },
    {
      type: 'retailer',
      icon: 'fa-store',
      emoji: '🏪',
      title: 'Retailer',
      description: 'Source quality products at wholesale prices for your business',
      features: ['Wholesale Prices', 'Bulk Orders', 'Quality Products'],
      color: 'amber',
      btnLabel: 'Start as Retailer',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i className="fas fa-leaf text-white text-2xl"></i>
          </div>
          <h1 className="text-3xl font-extrabold">
            <span className="text-green-700">Go</span>
            <span className="text-amber-500">Farm</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Choose how you'd like to use GoFarm</p>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800">I am a...</h2>
        </div>

        {/* Role Cards */}
        <div className="space-y-4">
          {roles.map((role) => (
            <button
              key={role.type}
              onClick={() => handleRoleSelect(role.type)}
              className={`w-full bg-white rounded-3xl shadow-card hover:shadow-card-hover border border-gray-100/60 p-6 transition-all duration-300 hover:-translate-y-1 text-left group ${
                role.color === 'green' ? 'hover:border-green-300' : 'hover:border-amber-300'
              }`}
              style={{ borderTopWidth: '4px', borderTopColor: role.color === 'green' ? '#22c55e' : '#f59e0b' }}
            >
              <div className="flex items-start gap-5">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                  role.color === 'green' ? 'bg-green-100' : 'bg-amber-100'
                }`}>
                  <span className="text-3xl">{role.emoji}</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{role.title}</h3>
                  <p className="text-gray-400 text-sm mb-3 leading-relaxed">{role.description}</p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {role.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          role.color === 'green'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        <i className="fas fa-check text-[8px]"></i>
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:translate-x-1 ${
                  role.color === 'green' ? 'bg-green-50 text-green-500' : 'bg-amber-50 text-amber-500'
                }`}>
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Consumer Option */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/consumer/dashboard')}
            className="text-gray-500 hover:text-blue-600 text-sm font-medium transition-colors"
          >
            <i className="fas fa-shopping-bag mr-1"></i> Continue as Consumer →
          </button>
        </div>

        {/* Login Link */}
        <p className="text-center text-gray-400 mt-6 text-sm">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-green-600 font-bold hover:text-green-700 transition-colors">
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;
