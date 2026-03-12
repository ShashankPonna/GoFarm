import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import WeatherWidget from '../../components/WeatherWidget';

const FarmerDashboard = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const farmManagementItems = [
    { icon: 'fa-carrot', title: t('navigation.products'), desc: t('dashboard.manageItems') || 'Manage your items', link: '/farmer/products', color: 'green' },
    { icon: 'fa-recycle', title: t('navigation.wasteManagement'), desc: t('dashboard.sustainableSolutions') || 'Sustainable solutions', link: '/farmer/waste', color: 'amber' },
    { icon: 'fa-seedling', title: t('dashboard.cropDiseaseDetection') || 'Crop Disease Detection', desc: t('dashboard.aiDetection') || 'AI-powered detection', link: '/farmer/disease-detection', color: 'green' },
    { icon: 'fa-robot', title: t('navigation.chatBot'), desc: t('dashboard.instantHelp') || 'Get instant help', link: '/farmer/chatbot', color: 'amber' },
    { icon: 'fa-exchange-alt', title: 'Exchange', desc: 'Barter crops & equipment', link: '/farmer/exchange/new', color: 'blue' },
    { icon: 'fa-leaf', title: 'Crop Recommendation', desc: 'Get best crop suggestions', link: '/farmer/crop-recommendation', color: 'green' },
    { icon: 'fa-users', title: 'Find Labour', desc: 'Post & find farm workers', link: '/farmer/find-labour', color: 'purple' },
    { icon: 'fa-file-alt', title: t('dashboard.reportSection') || 'Report Section', desc: t('dashboard.submitReports') || 'Submit reports', link: '/report', color: 'green' },
  ];

  const marketGrowthItems = [
    { icon: 'fa-chart-line', title: t('navigation.marketIntelligence') || 'Market Intelligence', desc: t('dashboard.volatilityAnalysis') || 'Volatility & selling window', link: '/farmer/market-intelligence', color: 'blue' },
    { icon: 'fa-handshake', title: t('navigation.retailerContact'), desc: t('dashboard.connectBuyers') || 'Connect with buyers', link: '/farmer/retailers', color: 'yellow' },
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: 'border-green-400 bg-green-100 text-green-500',
      amber: 'border-amber-400 bg-amber-100 text-amber-500',
      blue: 'border-blue-400 bg-blue-100 text-blue-500',
      purple: 'border-purple-400 bg-purple-100 text-purple-500',
      yellow: 'border-yellow-400 bg-yellow-100 text-yellow-600',
      gray: 'border-gray-400 bg-gray-100 text-gray-600',
    };
    return colors[color] || colors.green;
  };

  const filteredFarmItems = farmManagementItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMarketItems = marketGrowthItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-20">
      {/* Header */}
      <header className="bg-transparent text-[#2E7D32] sticky top-0 z-50 py-4 px-2 backdrop-blur-md">
        <div className="container mx-auto p-4 bg-white/80 rounded-[24px] shadow-sm border border-white/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <i className="fas fa-leaf text-2xl text-[#4CAF50]"></i>
              <h1 className="text-3xl font-bold">
                <span className="text-[#2E7D32]">Go</span>
                <span className="text-[#FFC107]">Farm</span>
              </h1>
            </div>

            <div className="relative flex-1 max-w-2xl mx-4">
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              <input
                type="text"
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div className="flex items-center space-x-2">
              <LanguageSwitcher />
              <Link to="/profile" className="bg-yellow-400 hover:bg-yellow-500 p-2 rounded-full">
                <i className="fas fa-user text-white"></i>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Weather Widget */}
      <div className="container mx-auto px-4 mt-6 mb-8">
        <WeatherWidget />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-2">
        {/* Farm Management Section */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="title-primary border-l-4 border-[#FFC107] pl-4">
              {t('dashboard.farmManagement') || 'Farm Management'}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredFarmItems.map((item, index) => (
              <Link
                key={index}
                to={item.link}
                className="card border-t-[6px] border-[#4CAF50] hover:-translate-y-2 group"
                style={{ borderColor: getColorClasses(item.color).includes('green') ? '#4CAF50' : getColorClasses(item.color).includes('amber') || getColorClasses(item.color).includes('yellow') ? '#FFC107' : getColorClasses(item.color).includes('blue') ? '#42A5F5' : '#AB47BC' }}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-[70px] h-[70px] mb-4 rounded-full flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 ${getColorClasses(item.color).split(' ')[1]}`}>
                    <i className={`fas ${item.icon} text-3xl ${getColorClasses(item.color).split(' ')[2]}`}></i>
                  </div>
                  <span className="text-gray-800 font-bold text-[15px] text-center leading-tight mb-1">{item.title}</span>
                  <span className="text-[12px] text-gray-500 text-center font-medium leading-tight">{item.desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Market & Growth Section */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="title-primary border-l-4 border-[#FFC107] pl-4">
              {t('dashboard.marketGrowth') || 'Market & Growth'}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredMarketItems.map((item, index) => (
              <Link
                key={index}
                to={item.link}
                className="card border-t-[6px] border-[#4CAF50] hover:-translate-y-2 group"
                style={{ borderColor: getColorClasses(item.color).includes('green') ? '#4CAF50' : getColorClasses(item.color).includes('amber') || getColorClasses(item.color).includes('yellow') ? '#FFC107' : getColorClasses(item.color).includes('blue') ? '#42A5F5' : '#AB47BC' }}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-[70px] h-[70px] mb-4 rounded-full flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 ${getColorClasses(item.color).split(' ')[1]}`}>
                    <i className={`fas ${item.icon} text-3xl ${getColorClasses(item.color).split(' ')[2]}`}></i>
                  </div>
                  <span className="text-gray-800 font-bold text-[15px] text-center leading-tight mb-1">{item.title}</span>
                  <span className="text-[12px] text-gray-500 text-center font-medium leading-tight">{item.desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* No Results */}
        {filteredFarmItems.length === 0 && filteredMarketItems.length === 0 && (
          <div className="text-center py-8">
            <div className="bg-white p-6 rounded-xl shadow-md max-w-md mx-auto">
              <i className="fas fa-search text-4xl text-gray-400 mb-3"></i>
              <p className="text-gray-500">No results found. Try a different search term.</p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 text-green-600 hover:text-green-700"
              >
                <i className="fas fa-redo mr-1"></i> Reset search
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-nav border-t border-gray-100 z-50 rounded-t-[30px] px-2 pb-2 pt-1">
        <div className="flex justify-around py-3 max-w-lg mx-auto">
          <Link
            to="/farmer/dashboard"
            className={`flex flex-col items-center transition-all ${isActive('/farmer/dashboard') ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
              }`}
          >
            <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-1 transition-all ${isActive('/farmer/dashboard')
              ? 'bg-green-100 scale-110'
              : 'bg-gray-100 hover:bg-green-50'
              }`}>
              <i className="fas fa-home text-xl"></i>
            </div>
            <span className="text-xs font-semibold">Home</span>
          </Link>

          <Link
            to="/farmer/community"
            className={`flex flex-col items-center transition-all ${isActive('/farmer/community') ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
              }`}
          >
            <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-1 transition-all ${isActive('/farmer/community')
              ? 'bg-green-100 scale-110'
              : 'bg-gray-100 hover:bg-green-50'
              }`}>
              <i className="fas fa-edit text-xl"></i>
            </div>
            <span className="text-xs font-semibold">Posts</span>
          </Link>

          <Link
            to="/chat"
            className={`flex flex-col items-center transition-all ${isActive('/chat') ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
              }`}
          >
            <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-1 transition-all ${isActive('/chat')
              ? 'bg-green-100 scale-110'
              : 'bg-gray-100 hover:bg-green-50'
              }`}>
              <i className="fas fa-comments text-xl"></i>
            </div>
            <span className="text-xs font-semibold">Chat</span>
          </Link>

          <Link
            to="/profile"
            className={`flex flex-col items-center transition-all ${isActive('/profile') ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
              }`}
          >
            <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-1 transition-all ${isActive('/profile')
              ? 'bg-green-100 scale-110'
              : 'bg-gray-100 hover:bg-green-50'
              }`}>
              <i className="fas fa-user text-xl"></i>
            </div>
            <span className="text-xs font-semibold">Account</span>
          </Link>
        </div>
      </nav>

      {/* Floating Action Button */}
      <div className="fixed right-6 bottom-32 z-50">
        <Link
          to="/farmer/products"
          className="bg-[#FFC107] hover:bg-[#FFA000] text-[#212121] w-16 h-16 rounded-full shadow-fab flex items-center justify-center transition-transform hover:scale-110"
        >
          <i className="fas fa-plus text-2xl font-bold"></i>
        </Link>
      </div>
    </div>
  );
};

export default FarmerDashboard;
