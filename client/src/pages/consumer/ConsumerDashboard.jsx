import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

const ConsumerDashboard = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const shoppingItems = [
    { icon: 'fa-shopping-bag', title: t('consumerDashboard.gofarmShop'), desc: t('consumerDashboard.allAgriProducts'), link: '/consumer/shop', color: 'green' },
    { icon: 'fa-heart', title: t('consumerDashboard.myWishlist'), desc: t('consumerDashboard.savedItems'), link: '/consumer/wishlist', color: 'red' },
    { icon: 'fa-store', title: t('consumerDashboard.browseProducts'), desc: t('consumerDashboard.shopFreshProduce'), link: '/products', color: 'blue' },
    { icon: 'fa-shopping-cart', title: t('consumerDashboard.myCart'), desc: t('consumerDashboard.viewCartItems'), link: '/cart', color: 'amber' },
    { icon: 'fa-tractor', title: t('consumerDashboard.contactFarmers'), desc: t('consumerDashboard.directConnection'), link: '/consumer/farmers', color: 'green' },
    { icon: 'fa-robot', title: t('consumerDashboard.aiAssistant'), desc: t('consumerDashboard.getInstantHelp'), link: '/consumer/chatbot', color: 'indigo' },
    { icon: 'fa-newspaper', title: t('consumerDashboard.news'), desc: 'Latest agricultural news', link: '/news', color: 'red' },
    { icon: 'fa-bar-chart', title: t('consumerDashboard.marketPrices'), desc: 'Current market rates', link: '/market-prices', color: 'green' },
    { icon: 'fa-file-contract', title: t('consumerDashboard.govSchemes'), desc: 'Government schemes & benefits', link: '/govt-schemes', color: 'purple' },
  ];

  const colorMap = {
    green:  { bg: 'bg-green-100',  text: 'text-green-600',  border: '#22c55e' },
    red:    { bg: 'bg-red-100',    text: 'text-red-500',    border: '#ef4444' },
    blue:   { bg: 'bg-blue-100',   text: 'text-blue-600',   border: '#3b82f6' },
    amber:  { bg: 'bg-amber-100',  text: 'text-amber-600',  border: '#f59e0b' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: '#6366f1' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: '#a855f7' },
  };

  const getColor = (c) => colorMap[c] || colorMap.green;

  const filteredShoppingItems = shoppingItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-blue-100/50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                <i className="fas fa-shopping-bag text-white text-lg"></i>
              </div>
              <h1 className="text-2xl font-extrabold">
                <span className="text-green-700">{t('consumerDashboard.farm')}</span>
                <span className="text-amber-500">{t('consumerDashboard.shop')}</span>
              </h1>
            </div>

            <div className="relative flex-1 max-w-md mx-4 hidden sm:block">
              <i className="fas fa-search absolute left-3.5 top-3 text-gray-400 text-sm"></i>
              <input
                type="text"
                placeholder={t('consumerDashboard.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>

            <Link to="/profile" className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all">
              <i className="fas fa-user text-white text-sm"></i>
            </Link>
          </div>

          {/* Mobile Search */}
          <div className="mt-3 sm:hidden">
            <div className="relative">
              <i className="fas fa-search absolute left-3.5 top-3.5 text-gray-400 text-sm"></i>
              <input
                type="text"
                placeholder={t('consumerDashboard.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Promotional Banner */}
      <div className="container mx-auto px-4 mt-5 animate-fade-in">
        <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-3xl p-5 border border-amber-200/50 flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <i className="fas fa-gift text-2xl text-amber-500"></i>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 text-base">{t('consumerDashboard.specialOffer')}</h3>
            <p className="text-gray-500 text-sm mt-0.5">{t('consumerDashboard.offerDescription')}</p>
          </div>
          <Link to="/consumer/shop" className="hidden md:flex btn-accent text-sm py-2 px-5">
            {t('consumerDashboard.shopNow')} <i className="fas fa-chevron-right ml-2 text-xs"></i>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4">
        <section className="mb-8">
          <div className="section-header mb-5">
            <div className="section-header-icon bg-blue-100 text-blue-600">
              <i className="fas fa-th-large"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {t('consumerDashboard.shoppingServices')}
              </h2>
              <p className="text-xs text-gray-400 font-medium">Shop fresh produce & more</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-stagger">
            {filteredShoppingItems.map((item, index) => {
              const c = getColor(item.color);
              return (
                <Link
                  key={index}
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
            })}
          </div>
        </section>

        {/* No Results */}
        {filteredShoppingItems.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="bg-white p-8 rounded-3xl shadow-card max-w-sm mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search text-2xl text-gray-400"></i>
              </div>
              <p className="text-gray-500 font-medium">{t('consumerDashboard.noResults')}</p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                <i className="fas fa-redo mr-1"></i> {t('consumerDashboard.resetSearch')}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 z-50 shadow-nav">
        <div className="flex justify-around py-2 pb-3 max-w-lg mx-auto">
          <Link
            to="/consumer/dashboard"
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-all ${isActive('/consumer/dashboard') ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${isActive('/consumer/dashboard') ? 'bg-blue-100 scale-105' : 'hover:bg-gray-50'}`}>
              <i className="fas fa-home text-xl"></i>
            </div>
            <span className="text-[10px] font-bold">{t('consumerDashboard.home')}</span>
          </Link>

          <Link
            to="/profile"
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-all ${isActive('/profile') ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${isActive('/profile') ? 'bg-blue-100 scale-105' : 'hover:bg-gray-50'}`}>
              <i className="fas fa-user text-xl"></i>
            </div>
            <span className="text-[10px] font-bold">{t('consumerDashboard.account')}</span>
          </Link>
        </div>
      </nav>

      {/* Floating Action Button */}
      <div className="fixed right-5 bottom-24 z-50">
        <Link
          to="/cart"
          className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <i className="fas fa-shopping-cart text-xl"></i>
        </Link>
      </div>
    </div>
  );
};

export default ConsumerDashboard;
