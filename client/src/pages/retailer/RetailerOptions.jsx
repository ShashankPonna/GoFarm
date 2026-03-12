import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const RetailerOptions = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentBanner, setCurrentBanner] = useState(0);

  const banners = [
    {
      gradient: 'from-green-500 to-green-700',
      tag: 'SPECIAL OFFER',
      title: 'Fresh Seasonal Vegetables',
      description: 'Get up to 25% off on locally grown vegetables this week!',
      buttonText: 'Shop Now',
      buttonColor: 'text-green-600'
    },
    {
      gradient: 'from-yellow-500 to-yellow-600',
      tag: 'NEW ARRIVALS',
      title: 'Organic Fruits Collection',
      description: 'Freshly harvested organic fruits now available!',
      buttonText: 'View Collection',
      buttonColor: 'text-yellow-600'
    },
    {
      gradient: 'from-blue-500 to-blue-700',
      tag: 'JUST LAUNCHED',
      title: 'Farm-to-Home Delivery',
      description: 'Get fresh products delivered directly to your doorstep!',
      buttonText: 'Learn More',
      buttonColor: 'text-blue-600'
    }
  ];

  const categories = [
    {
      name: t('retailer.productsList'),
      subtitle: t('categories.grainsSpices'),
      icon: 'fa-box',
      color: 'green',
      link: '/retailer/products-list'
    },
    {
      name: t('retailer.wasteProducts'),
      subtitle: t('categories.oilsVegetables'),
      icon: 'fa-leaf',
      color: 'amber',
      link: '/retailer/waste-products'
    },
    {
      name: t('retailer.farmerContact'),
      subtitle: t('retailer.connectFarmers'),
      icon: 'fa-handshake',
      color: 'yellow',
      link: '/retailer/farmers'
    },
    {
      name: t('retailer.market'),
      subtitle: t('retailer.shopAll'),
      icon: 'fa-store',
      color: 'purple',
      link: '/products'
    },
    {
      name: t('retailer.chatBot'),
      subtitle: t('retailer.getHelp'),
      icon: 'fa-robot',
      color: 'amber',
      link: '/retailer/chatbot'
    },
    {
      name: t('retailer.addForConsumer'),
      subtitle: t('retailer.createListings'),
      icon: 'fa-user-plus',
      color: 'purple',
      link: '/retailer/consumer-listings'
    },
    {
      name: t('retailer.reportSection'),
      subtitle: t('retailer.submitReports'),
      icon: 'fa-file-alt',
      color: 'green',
      link: '/report'
    },
    {
      name: t('retailer.posts'),
      subtitle: t('retailer.shareConnect'),
      icon: 'fa-edit',
      color: 'purple',
      link: '/retailer/community'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white sticky top-0 z-50 shadow-2xl">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-3">
              <i className="fas fa-leaf text-3xl text-yellow-400"></i>
              <h1 className="text-3xl font-bold">
                <span className="text-white">Go</span>
                <span className="text-yellow-400">Farm</span>
              </h1>
            </div>

            <div className="relative flex-1 max-w-2xl mx-6">
              <i className="fas fa-search absolute left-4 top-4 text-gray-400"></i>
              <input
                type="text"
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition shadow-lg"
              />
            </div>

            <button className="bg-yellow-400 hover:bg-yellow-500 transition p-3 rounded-full shadow-lg">
              <i className="fas fa-shopping-cart text-white text-xl"></i>
            </button>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
            </div>

            <div className="flex space-x-4">
              <button className="hover:text-yellow-400 transition">
                <i className="fas fa-bell text-xl"></i>
              </button>
              <button className="hover:text-yellow-400 transition">
                <i className="fas fa-cog text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Promotional Banners */}
        <section className="mb-12 relative">
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <div className={`bg-gradient-to-r ${banners[currentBanner].gradient} p-8 relative`}>
              <div className="absolute top-0 right-0 w-1/3 h-full opacity-20">
                <div className="w-full h-full bg-white rounded-full transform scale-150"></div>
              </div>
              <div className="relative z-10 max-w-2xl">
                <p className="text-yellow-300 font-bold text-sm mb-3">{banners[currentBanner].tag}</p>
                <h2 className="text-4xl font-bold text-white mb-3">{banners[currentBanner].title}</h2>
                <p className="text-white text-lg mb-6">{banners[currentBanner].description}</p>
                <button className={`bg-white ${banners[currentBanner].buttonColor} px-8 py-3 rounded-full font-bold hover:bg-yellow-300 hover:text-white transition shadow-lg transform hover:scale-105`}>
                  {banners[currentBanner].buttonText}
                </button>
              </div>
            </div>
          </div>

          {/* Dots navigation */}
          <div className="flex justify-center mt-6 space-x-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-3 h-3 rounded-full transition-all ${currentBanner === index ? 'bg-green-600 w-8' : 'bg-gray-300'
                  }`}
              />
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">{t('retailer.categories')}</h2>
            <button className="text-green-600 hover:text-green-800 flex items-center font-semibold text-lg">
              {t('common.view')} {t('retailer.all')} <i className="fas fa-chevron-right ml-2"></i>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCategories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="transform transition duration-300 hover:scale-110 animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`bg-white rounded-2xl shadow-xl hover:shadow-2xl flex flex-col items-center p-6 border-b-4 border-${category.color}-400 hover:border-${category.color}-600 transition-all`}>
                  <div className={`w-20 h-20 mb-4 rounded-full bg-${category.color}-100 flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
                    <i className={`fas ${category.icon} text-${category.color}-600 text-3xl`}></i>
                  </div>
                  <span className="text-gray-800 font-bold text-lg">{category.name}</span>
                  <span className="text-sm text-gray-500 mt-2">{category.subtitle}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* App Info Banner */}
        <section className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl py-10 px-6 mt-12 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-6 md:mb-0">
              <h2 className="text-white text-3xl font-bold mb-3">Download Our App</h2>
              <p className="text-green-100 text-lg mb-6">Get farm-fresh products at your fingertips. Order anytime, anywhere!</p>
              <div className="flex space-x-4">
                <button className="bg-black text-white px-6 py-3 rounded-xl flex items-center hover:bg-gray-800 transition shadow-lg">
                  <i className="fab fa-apple text-3xl mr-3"></i>
                  <div className="text-left">
                    <p className="text-xs">Download on the</p>
                    <p className="font-bold text-lg">App Store</p>
                  </div>
                </button>
                <button className="bg-black text-white px-6 py-3 rounded-xl flex items-center hover:bg-gray-800 transition shadow-lg">
                  <i className="fab fa-google-play text-3xl mr-3"></i>
                  <div className="text-left">
                    <p className="text-xs">Get it on</p>
                    <p className="font-bold text-lg">Google Play</p>
                  </div>
                </button>
              </div>
            </div>
            <div className="md:w-1/3">
              <div className="bg-white bg-opacity-20 rounded-2xl p-8 backdrop-blur-sm">
                <i className="fas fa-mobile-alt text-white text-9xl"></i>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t-2 border-gray-200 z-50">
        <div className="flex justify-around py-3 max-w-lg mx-auto">
          <Link to="/retailer/options" className="flex flex-col items-center text-green-600">
            <div className="rounded-full bg-green-100 w-12 h-12 flex items-center justify-center mb-1 scale-110">
              <i className="fas fa-home text-xl"></i>
            </div>
            <span className="text-xs font-semibold">{t('common.home')}</span>
          </Link>
          <Link to="/retailer/community" className="flex flex-col items-center text-gray-500 hover:text-green-600 transition">
            <div className="rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center mb-1 hover:bg-green-100 transition">
              <i className="fas fa-edit text-xl"></i>
            </div>
            <span className="text-xs font-semibold">{t('navigation.posts')}</span>
          </Link>
          <Link to="/chat" className="flex flex-col items-center text-gray-500 hover:text-green-600 transition">
            <div className="rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center mb-1 hover:bg-green-100 transition">
              <i className="fas fa-comments text-xl"></i>
            </div>
            <span className="text-xs font-semibold">{t('navigation.chat')}</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center text-gray-500 hover:text-green-600 transition">
            <div className="rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center mb-1 hover:bg-green-100 transition">
              <i className="fas fa-user text-xl"></i>
            </div>
            <span className="text-xs font-semibold">{t('navigation.profile')}</span>
          </Link>
        </div>
      </nav>

      {/* Floating Action Button */}
      <div className="fixed right-6 bottom-24 z-50">
        <button className="bg-green-600 hover:bg-green-700 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-transform transform hover:scale-110 animate-bounce">
          <i className="fas fa-shopping-basket text-2xl"></i>
        </button>
      </div>
    </div>
  );
};

export default RetailerOptions;
