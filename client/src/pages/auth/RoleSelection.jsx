import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (roleType) => {
    navigate('/language-selection', { state: { role: roleType } });
  };

  const roles = [
    {
      type: 'farmer',
      icon: '👨‍🌾',
      title: 'Farmer',
      description: 'Sell your produce directly and get fair prices for your hard work',
      features: ['Direct Market Access', 'Fair Pricing', 'No Middlemen'],
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      border: 'border-green-300',
      btnLabel: 'Start Selling',
    },
    {
      type: 'retailer',
      icon: '🏪',
      title: 'Retailer',
      description: 'Source quality products at wholesale prices for your business',
      features: ['Wholesale Prices', 'Bulk Orders', 'Quality Products'],
      gradient: 'from-orange-500 to-amber-600',
      bgGradient: 'from-orange-50 to-amber-50',
      border: 'border-orange-300',
      btnLabel: 'Start Sourcing',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-emerald-300 flex items-center justify-center p-6">
      <div className="bg-white bg-opacity-90 rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-3xl">

        {/* Logo */}
        <div className="text-center mb-8">
          <h2 className="text-5xl font-extrabold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-amber-500">🌾GO</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">FaRm</span>
          </h2>
        </div>

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">Choose Your Path</h1>
          <p className="text-lg text-green-600 font-medium">Select your role to get started</p>
        </div>

        {/* Role Cards — 2 equal columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <div
              key={role.type}
              className="group cursor-pointer transform transition-all duration-500 hover:scale-105 flex"
            >
              <div
                className={`bg-gradient-to-br ${role.bgGradient} rounded-3xl shadow-xl p-7 flex flex-col items-center w-full border-2 border-transparent group-hover:${role.border} transition-all duration-500`}
              >
                {/* Icon */}
                <div className="text-7xl mb-5 group-hover:scale-110 transition-transform duration-500">
                  {role.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{role.title}</h3>

                {/* Description */}
                <p className="text-gray-600 text-center text-sm mb-5 leading-relaxed flex-grow">
                  {role.description}
                </p>

                {/* Features */}
                <div className="space-y-2 mb-6 w-full">
                  {role.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-700 bg-white bg-opacity-60 rounded-lg px-3 py-2">
                      <i className="fas fa-check-circle text-green-600 mr-2 flex-shrink-0"></i>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Button — always at bottom */}
                <button
                  onClick={() => handleRoleSelect(role.type)}
                  className={`w-full bg-gradient-to-r ${role.gradient} text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1 text-base mt-auto`}
                >
                  <i className="fas fa-arrow-right mr-2"></i>
                  {role.btnLabel}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-green-600 font-semibold hover:underline">
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
