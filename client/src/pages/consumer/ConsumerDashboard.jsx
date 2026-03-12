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
    { icon: 'fa-shopping-cart', title: t('consumerDashboard.myCart'), desc: t('consumerDashboard.viewCartItems'), link: '/cart', color: 'green' },
    { icon: 'fa-tractor', title: t('consumerDashboard.contactFarmers'), desc: t('consumerDashboard.directConnection'), link: '/consumer/farmers', color: 'green' },
    { icon: 'fa-robot', title: t('consumerDashboard.aiAssistant'), desc: t('consumerDashboard.getInstantHelp'), link: '/consumer/chatbot', color: 'indigo' },
    { icon: 'fa-comments', title: t('consumerDashboard.posts'), desc: t('consumerDashboard.shareConnect'), link: '/posts', color: 'purple' },
    { icon: 'fa-comment-dots', title: t('consumerDashboard.chat'), desc: t('consumerDashboard.messageOthers'), link: '/chat', color: 'blue' },
    { icon: 'fa-newspaper', title: t('consumerDashboard.news'), desc: 'Latest agricultural news', link: '/news', color: 'red' },
    { icon: 'fa-bar-chart', title: t('consumerDashboard.marketPrices'), desc: 'Current market rates', link: '/market-prices', color: 'green' },
    { icon: 'fa-file-contract', title: t('consumerDashboard.govSchemes'), desc: 'Government schemes & benefits', link: '/govt-schemes', color: 'purple' },
  ];

  // Removed community items as requested

  const getColorClasses = (color) => {
    const colors = {
      blue: 'border-blue-400 bg-blue-100 text-blue-500',
      green: 'border-green-400 bg-green-100 text-green-500',
      purple: 'border-purple-400 bg-purple-100 text-purple-500',
      indigo: 'border-indigo-400 bg-indigo-100 text-indigo-500',
      gray: 'border-gray-400 bg-gray-100 text-gray-600',
      red: 'border-red-400 bg-red-100 text-red-500',
    };
    return colors[color] || colors.blue;
  };

  const filteredShoppingItems = shoppingItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-20">
      {/* Header */}
      <header className="bg-transparent text-[#2E7D32] sticky top-0 z-50 py-4 px-2 backdrop-blur-md">
        <div className="container mx-auto p-4 bg-white/80 rounded-[24px] shadow-sm border border-white/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <i className="fas fa-shopping-bag text-2xl text-[#4CAF50]"></i>
              <h1 className="text-3xl font-bold">
                <span className="text-[#2E7D32]">{t('consumerDashboard.farm')}</span>
                <span className="text-[#FFC107]">{t('consumerDashboard.shop')}</span>
              </h1>
            </div>

            <div className="relative flex-1 max-w-2xl mx-4">
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              <input
                type="text"
                placeholder={t('consumerDashboard.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <Link to="/profile" className="bg-[#FFF8E1] hover:bg-[#FFECB3] p-2 rounded-full transition shadow-sm">
              <i className="fas fa-user text-[#FFC107]"></i>
            </Link>
          </div>
        </div>
      </header>

      {/* Promotional Banner */}
      <div className="container mx-auto px-4 mt-6">
        <div className="card border-l-[6px] border-[#FFC107] flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-[#FFF8E1] p-4 rounded-full mr-5 shadow-sm">
              <i className="fas fa-gift text-3xl text-[#FFC107]"></i>
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-[#2E7D32] tracking-tight">{t('consumerDashboard.specialOffer')}</h3>
              <p className="text-[#555] font-medium mt-1">{t('consumerDashboard.offerDescription')}</p>
            </div>
          </div>
          <button className="hidden md:block btn-primary">
            {t('consumerDashboard.shopNow')} <i className="fas fa-chevron-right ml-2 text-sm"></i>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-2">
        {/* Shopping Section */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="title-primary border-l-4 border-[#FFC107] pl-4">
              {t('consumerDashboard.shoppingServices')}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredShoppingItems.map((item, index) => (
              <Link
                key={index}
                to={item.link}
                className="card border-t-[6px] group"
                style={{ borderColor: getColorClasses(item.color).includes('green') ? '#4CAF50' : getColorClasses(item.color).includes('red') ? '#EF5350' : getColorClasses(item.color).includes('blue') ? '#42A5F5' : '#AB47BC' }}
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
        {filteredShoppingItems.length === 0 && (
          <div className="text-center py-8">
            <div className="bg-white p-6 rounded-xl shadow-md max-w-md mx-auto">
              <i className="fas fa-search text-4xl text-gray-400 mb-3"></i>
              <p className="text-gray-500">{t('consumerDashboard.noResults')}</p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 text-blue-600 hover:text-blue-700"
              >
                <i className="fas fa-redo mr-1"></i> {t('consumerDashboard.resetSearch')}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-nav border-t border-gray-100 z-50 rounded-t-[30px] px-2 pb-2 pt-1">
        <div className="flex justify-around py-3 max-w-lg mx-auto">
          <Link
            to="/consumer/dashboard"
            className={`flex flex-col items-center transition-all ${isActive('/consumer/dashboard') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
              }`}
          >
            <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-1 transition-all ${isActive('/consumer/dashboard')
              ? 'bg-blue-100 scale-110'
              : 'bg-gray-100 hover:bg-blue-50'
              }`}>
              <i className="fas fa-home text-xl"></i>
            </div>
            <span className="text-xs font-semibold">{t('consumerDashboard.home')}</span>
          </Link>

          <Link
            to="/posts"
            className={`flex flex-col items-center transition-all ${isActive('/posts') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
              }`}
          >
            <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-1 transition-all ${isActive('/posts')
              ? 'bg-blue-100 scale-110'
              : 'bg-gray-100 hover:bg-blue-50'
              }`}>
              <i className="fas fa-comments text-xl"></i>
            </div>
            <span className="text-xs font-semibold">{t('consumerDashboard.posts')}</span>
          </Link>

          <Link
            to="/chat"
            className={`flex flex-col items-center transition-all ${isActive('/chat') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
              }`}
          >
            <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-1 transition-all ${isActive('/chat')
              ? 'bg-blue-100 scale-110'
              : 'bg-gray-100 hover:bg-blue-50'
              }`}>
              <i className="fas fa-comments text-xl"></i>
            </div>
            <span className="text-xs font-semibold">{t('consumerDashboard.chat')}</span>
          </Link>

          <Link
            to="/profile"
            className={`flex flex-col items-center transition-all ${isActive('/profile') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
              }`}
          >
            <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-1 transition-all ${isActive('/profile')
              ? 'bg-blue-100 scale-110'
              : 'bg-gray-100 hover:bg-blue-50'
              }`}>
              <i className="fas fa-user text-xl"></i>
            </div>
            <span className="text-xs font-semibold">{t('consumerDashboard.account')}</span>
          </Link>
        </div>
      </nav>

      {/* Floating Action Button */}
      <div className="fixed right-6 bottom-32 z-50">
        <Link
          to="/cart"
          className="bg-[#FFC107] hover:bg-[#FFA000] text-[#212121] w-16 h-16 rounded-full shadow-fab flex items-center justify-center transition-transform hover:scale-110"
        >
          <i className="fas fa-shopping-cart text-2xl font-bold"></i>
        </Link>
      </div>
    </div>
  );
};

export default ConsumerDashboard;
