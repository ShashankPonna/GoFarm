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
    { icon: 'fa-seedling', title: t('dashboard.cropDiseaseDetection') || 'Crop Disease Detection', desc: t('dashboard.aiDetection') || 'AI-powered detection', link: '/farmer/disease-detection', color: 'emerald' },
    { icon: 'fa-robot', title: t('navigation.chatBot'), desc: t('dashboard.instantHelp') || 'Get instant help', link: '/farmer/chatbot', color: 'amber' },
    { icon: 'fa-wheat-awn', title: 'Yield Prediction', desc: 'AI harvest estimates', link: '/farmer/yield-prediction', color: 'amber' },
    { icon: 'fa-cloud-sun-rain', title: 'Weather', desc: '7-day forecast & alerts', link: '/farmer/weather', color: 'blue' },
    { icon: 'fa-leaf', title: 'Crop Recommendation', desc: 'Get best crop suggestions', link: '/farmer/crop-recommendation', color: 'teal' },
    { icon: 'fa-users', title: 'Find Labour', desc: 'Post & find farm workers', link: '/farmer/find-labour', color: 'purple' },
  ];

  const marketGrowthItems = [
    { icon: 'fa-chart-line', title: t('navigation.marketIntelligence') || 'Market Intelligence', desc: t('dashboard.volatilityAnalysis') || 'Volatility & selling window', link: '/farmer/market-intelligence', color: 'blue' },
    { icon: 'fa-handshake', title: t('navigation.retailerContact'), desc: t('dashboard.connectBuyers') || 'Connect with buyers', link: '/farmer/retailers', color: 'amber' },
  ];

  const colorMap = {
    green:   { bg: 'bg-green-100',   text: 'text-green-600',   border: '#22c55e', iconBg: 'bg-green-50' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: '#10b981', iconBg: 'bg-emerald-50' },
    amber:   { bg: 'bg-amber-100',   text: 'text-amber-600',   border: '#f59e0b', iconBg: 'bg-amber-50' },
    blue:    { bg: 'bg-blue-100',    text: 'text-blue-600',    border: '#3b82f6', iconBg: 'bg-blue-50' },
    teal:    { bg: 'bg-teal-100',    text: 'text-teal-600',    border: '#14b8a6', iconBg: 'bg-teal-50' },
    purple:  { bg: 'bg-purple-100',  text: 'text-purple-600',  border: '#a855f7', iconBg: 'bg-purple-50' },
  };

  const getColor = (c) => colorMap[c] || colorMap.green;

  const filteredFarmItems = farmManagementItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMarketItems = marketGrowthItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const FeatureCard = ({ item, index }) => {
    const c = getColor(item.color);
    return (
      <Link
        to={item.link}
        className="bg-white rounded-3xl shadow-card hover:shadow-card-hover border border-gray-100/60 p-5 transition-all duration-300 hover:-translate-y-1 group"
        style={{ borderTopWidth: '4px', borderTopColor: c.border }}
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${c.bg} transition-transform duration-300 group-hover:scale-110`}>
            <i className={`fas ${item.icon} text-2xl ${c.text}`}></i>
          </div>
          <div>
            <p className="text-gray-800 font-bold text-[15px] leading-tight">{item.title}</p>
            <p className="text-[12px] text-gray-400 font-medium mt-1 leading-tight">{item.desc}</p>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-green-100/50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-md">
                <i className="fas fa-leaf text-white text-lg"></i>
              </div>
              <h1 className="text-2xl font-extrabold">
                <span className="text-green-700">Go</span>
                <span className="text-amber-500">Farm</span>
              </h1>
            </div>

            <div className="relative flex-1 max-w-md mx-4 hidden sm:block">
              <i className="fas fa-search absolute left-3.5 top-3 text-gray-400 text-sm"></i>
              <input
                type="text"
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <Link to="/profile" className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all">
                <i className="fas fa-user text-white text-sm"></i>
              </Link>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="mt-3 sm:hidden">
            <div className="relative">
              <i className="fas fa-search absolute left-3.5 top-3.5 text-gray-400 text-sm"></i>
              <input
                type="text"
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Weather Widget */}
      <div className="container mx-auto px-4 mt-5 mb-6 animate-fade-in">
        <WeatherWidget />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4">
        {/* Farm Management Section */}
        <section className="mb-8">
          <div className="section-header mb-5">
            <div className="section-header-icon bg-green-100 text-green-600">
              <i className="fas fa-tractor"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {t('dashboard.farmManagement') || 'Farm Management'}
              </h2>
              <p className="text-xs text-gray-400 font-medium">Manage your farm operations</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-stagger">
            {filteredFarmItems.map((item, index) => (
              <FeatureCard key={index} item={item} index={index} />
            ))}
          </div>
        </section>

        {/* Market & Growth Section */}
        <section className="mb-8">
          <div className="section-header mb-5">
            <div className="section-header-icon bg-blue-100 text-blue-600">
              <i className="fas fa-chart-bar"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {t('dashboard.marketGrowth') || 'Market & Growth'}
              </h2>
              <p className="text-xs text-gray-400 font-medium">Prices, trends & connections</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-stagger">
            {filteredMarketItems.map((item, index) => (
              <FeatureCard key={index} item={item} index={index} />
            ))}
          </div>
        </section>

        {/* No Results */}
        {filteredFarmItems.length === 0 && filteredMarketItems.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="bg-white p-8 rounded-3xl shadow-card max-w-sm mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search text-2xl text-gray-400"></i>
              </div>
              <p className="text-gray-500 font-medium">No results found</p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-green-600 hover:text-green-700 font-semibold text-sm"
              >
                <i className="fas fa-redo mr-1"></i> Reset search
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 z-50 shadow-nav">
        <div className="flex justify-around py-2 pb-3 max-w-lg mx-auto">
          <Link
            to="/farmer/dashboard"
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-all ${isActive('/farmer/dashboard') ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${isActive('/farmer/dashboard') ? 'bg-green-100 scale-105' : 'hover:bg-gray-50'}`}>
              <i className="fas fa-home text-xl"></i>
            </div>
            <span className="text-[10px] font-bold">Home</span>
          </Link>

          <Link
            to="/profile"
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-all ${isActive('/profile') ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${isActive('/profile') ? 'bg-green-100 scale-105' : 'hover:bg-gray-50'}`}>
              <i className="fas fa-user text-xl"></i>
            </div>
            <span className="text-[10px] font-bold">Account</span>
          </Link>
        </div>
      </nav>

      {/* Floating Action Button */}
      <div className="fixed right-5 bottom-24 z-50">
        <Link
          to="/farmer/products"
          className="bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white w-14 h-14 rounded-2xl shadow-fab flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <i className="fas fa-plus text-xl"></i>
        </Link>
      </div>
    </div>
  );
};

export default FarmerDashboard;
