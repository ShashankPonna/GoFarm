import { useState, useEffect } from 'react';

const News = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [newsArticles] = useState([
    {
      id: 1,
      title: 'New Government Scheme Launched for Small Farmers',
      summary: 'The government has announced a new financial assistance program targeting small-scale farmers with subsidies up to ₹50,000.',
      category: 'policy',
      date: '2024-01-15',
      readTime: '3 min read',
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
      author: 'Ministry of Agriculture',
      trending: true
    },
    {
      id: 2,
      title: 'AI-Powered Crop Monitoring System Shows 30% Yield Increase',
      summary: 'Latest agricultural technology using artificial intelligence helps farmers monitor crop health and optimize irrigation.',
      category: 'technology',
      date: '2024-01-14',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800',
      author: 'AgriTech News',
      trending: true
    },
    {
      id: 3,
      title: 'Wheat Prices Rise 15% Due to Export Demand',
      summary: 'International demand for Indian wheat has pushed domestic prices higher, benefiting farmers across major producing states.',
      category: 'market',
      date: '2024-01-13',
      readTime: '2 min read',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800',
      author: 'Market Watch'
    },
    {
      id: 4,
      title: 'Monsoon Forecast: Normal Rainfall Expected This Season',
      summary: 'Meteorological department predicts normal monsoon with good distribution across agricultural regions.',
      category: 'weather',
      date: '2024-01-12',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800',
      author: 'Weather Bureau'
    },
    {
      id: 5,
      title: 'Organic Farming Certification Made Easier with Digital Platform',
      summary: 'New online portal streamlines organic certification process, reducing paperwork and processing time by 60%.',
      category: 'agriculture',
      date: '2024-01-11',
      readTime: '3 min read',
      image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800',
      author: 'Organic India'
    },
    {
      id: 6,
      title: 'Drone Technology Revolutionizes Pesticide Application',
      summary: 'Agricultural drones provide precise pesticide application, reducing chemical usage by 40% while improving crop protection.',
      category: 'technology',
      date: '2024-01-10',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800',
      author: 'Tech Farming'
    }
  ]);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 600);
  }, []);

  const categories = [
    { id: 'all', name: 'All News', icon: 'fa-newspaper' },
    { id: 'agriculture', name: 'Agriculture', icon: 'fa-seedling' },
    { id: 'technology', name: 'Technology', icon: 'fa-microchip' },
    { id: 'policy', name: 'Policy', icon: 'fa-gavel' },
    { id: 'market', name: 'Market', icon: 'fa-chart-line' },
    { id: 'weather', name: 'Weather', icon: 'fa-cloud-sun' }
  ];

  const trendingNews = newsArticles.filter(article => article.trending);

  const filteredNews = newsArticles.filter(article => {
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600 mb-6"></div>
          <p className="text-gray-700 text-xl font-semibold animate-pulse">Loading latest news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Stunning Header */}
      <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10">
          <div className="absolute inset-0 animate-pulse" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)'
          }}></div>
        </div>
        <div className="container mx-auto px-6 py-8 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => window.history.back()} 
                className="mr-5 hover:bg-white hover:bg-opacity-20 p-3 rounded-xl transition-all transform hover:scale-110 hover:-translate-x-1"
              >
                <i className="fas fa-arrow-left text-2xl"></i>
              </button>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold flex items-center mb-2">
                  <i className="fas fa-newspaper mr-4 animate-pulse"></i>
                  Agricultural News Hub
                </h1>
                <p className="text-lg text-blue-100">Stay updated with latest farming news, insights & market trends 🌾</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-6 py-3 flex items-center space-x-3 animate-pulse">
                <div className="w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                <span className="font-semibold">Live Updates</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10 max-w-7xl">
        {/* Enhanced Search Bar */}
        <div className="mb-12 transform hover:scale-105 transition-transform duration-300">
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-lg opacity-30"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl border-2 border-gray-100">
              <i className="fas fa-search absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-400 text-2xl"></i>
              <input
                type="text"
                placeholder="Search for news, topics, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-20 pr-7 py-5 w-full rounded-2xl focus:outline-none text-lg font-medium"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-7 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <i className="fas fa-times-circle text-2xl"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stunning Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-14">
          {categories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              style={{ animationDelay: `${index * 0.1}s` }}
              className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center shadow-xl hover:shadow-2xl transform hover:-translate-y-3 animate-fadeIn text-lg ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white scale-110 ring-4 ring-blue-300'
                  : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100'
              }`}
            >
              <i className={`fas ${category.icon} mr-3 text-xl ${activeCategory === category.id ? 'animate-bounce' : ''}`}></i>
              {category.name}
              {activeCategory === category.id && (
                <span className="ml-3 bg-white bg-opacity-30 rounded-full px-3 py-1 text-sm font-bold">
                  {filteredNews.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Stunning News Grid with Sidebar */}
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main News Section */}
          <div className="lg:col-span-2 space-y-8">
            {filteredNews.map((article, index) => (
              <article 
                key={article.id}
                style={{ animationDelay: `${index * 0.15}s` }}
                className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-gray-100 hover:border-blue-200 transform hover:-translate-y-2 animate-fadeIn"
              >
                <div className="md:flex">
                  {/* Image Section */}
                  <div className="md:w-2/5 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-64 md:h-full object-cover group-hover:scale-110 group-hover:rotate-2 transition-all duration-700"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/800x600?text=News+Image';
                      }}
                    />
                    {article.trending && (
                      <div className="absolute top-5 right-5 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center shadow-2xl z-20 animate-pulse">
                        <i className="fas fa-fire mr-2"></i>
                        TRENDING
                      </div>
                    )}
                    <div className="absolute bottom-5 left-5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="flex space-x-2">
                        <button className="bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-all shadow-lg transform hover:scale-110">
                          <i className="fas fa-bookmark text-blue-600"></i>
                        </button>
                        <button className="bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-all shadow-lg transform hover:scale-110">
                          <i className="fas fa-share-alt text-blue-600"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="md:w-3/5 p-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-4 py-2 rounded-full text-xs font-bold border-2 transform hover:scale-110 transition-transform cursor-pointer ${
                        article.category === 'policy' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                        article.category === 'technology' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                        article.category === 'market' ? 'bg-green-100 text-green-800 border-green-300' :
                        article.category === 'weather' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                        'bg-gray-100 text-gray-800 border-gray-300'
                      }`}>
                        {categories.find(c => c.id === article.category)?.name || 'Agriculture'}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center bg-gray-100 px-3 py-2 rounded-full font-medium">
                        <i className="fas fa-clock mr-2 text-blue-500"></i>
                        {article.readTime}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors cursor-pointer leading-tight">
                      {article.title}
                    </h2>
                    <p className="text-gray-600 mb-6 leading-relaxed text-lg">{article.summary}</p>
                    <div className="flex items-center justify-between pt-5 border-t-2 border-gray-100">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center hover:text-blue-600 transition-colors cursor-pointer">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mr-2">
                            <i className="fas fa-user text-white"></i>
                          </div>
                          <span className="font-semibold">{article.author}</span>
                        </span>
                        <span className="flex items-center font-medium">
                          <i className="fas fa-calendar mr-2 text-blue-500"></i>
                          {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold transform hover:scale-105 flex items-center group">
                        Read More 
                        <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Stunning Sidebar */}
          <div className="space-y-8">
            {/* Trending Section */}
            <div className="bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 rounded-3xl shadow-xl p-7 border-2 border-red-100 transform hover:scale-105 transition-transform duration-300">
              <h3 className="font-bold text-2xl text-gray-800 mb-6 flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mr-3 animate-pulse">
                  <i className="fas fa-fire text-white text-xl"></i>
                </div>
                Trending Now
              </h3>
              <div className="space-y-4">
                {trendingNews.map((article, idx) => (
                  <div 
                    key={article.id} 
                    className="bg-white rounded-2xl p-5 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-red-200 transform hover:-translate-y-1 group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-gray-800 line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">{article.title}</h4>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center">
                            <i className="fas fa-calendar mr-1"></i>
                            {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded-full">{article.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather Widget */}
            <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white rounded-3xl shadow-2xl p-8 relative overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
              <div className="relative z-10">
                <h3 className="font-bold text-xl mb-6 flex items-center">
                  <i className="fas fa-cloud-sun mr-3 text-2xl"></i>
                  Weather Update
                </h3>
                <div className="text-center">
                  <div className="text-7xl mb-4 animate-bounce">☀️</div>
                  <p className="text-5xl font-bold mb-2">28°C</p>
                  <p className="text-base opacity-90 mb-2">Sunny & Clear</p>
                  <p className="text-sm opacity-75 mb-6">Perfect conditions for farming</p>
                  <div className="grid grid-cols-3 gap-3 mb-6 text-center">
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3">
                      <div className="text-2xl mb-1">🌡️</div>
                      <p className="text-xs opacity-75">Humidity</p>
                      <p className="font-bold">65%</p>
                    </div>
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3">
                      <div className="text-2xl mb-1">💨</div>
                      <p className="text-xs opacity-75">Wind</p>
                      <p className="font-bold">12 km/h</p>
                    </div>
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3">
                      <div className="text-2xl mb-1">💧</div>
                      <p className="text-xs opacity-75">Rain</p>
                      <p className="font-bold">0%</p>
                    </div>
                  </div>
                  <button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl text-sm transition-all w-full font-bold shadow-lg hover:shadow-xl transform hover:scale-105">
                    7-Day Forecast <i className="fas fa-arrow-right ml-2"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Market Prices */}
            <div className="bg-white rounded-3xl shadow-xl p-7 border-2 border-gray-100 transform hover:scale-105 transition-transform duration-300">
              <h3 className="font-bold text-2xl text-gray-800 mb-6 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-3">
                  <i className="fas fa-chart-line text-white"></i>
                </div>
                Market Prices
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Wheat', price: '₹2,500/qt', change: '+5%', up: true, icon: '🌾' },
                  { name: 'Rice', price: '₹3,200/qt', change: '+3%', up: true, icon: '🍚' },
                  { name: 'Tomato', price: '₹45/kg', change: '-2%', up: false, icon: '🍅' },
                  { name: 'Potato', price: '₹32/kg', change: '+1%', up: true, icon: '🥔' }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:from-green-50 hover:to-emerald-50 transition-all cursor-pointer border-2 border-transparent hover:border-green-200 transform hover:scale-105 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl group-hover:scale-125 transition-transform">{item.icon}</div>
                      <span className="text-base font-bold text-gray-800">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 block text-lg">{item.price}</span>
                      <span className={`text-sm font-bold flex items-center justify-end ${item.up ? 'text-green-600' : 'text-red-600'}`}>
                        {item.change}
                        <i className={`fas fa-arrow-${item.up ? 'up' : 'down'} ml-1`}></i>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl w-full font-bold transform hover:scale-105">
                View All Prices <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-24 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border-2 border-gray-100 col-span-3">
            <div className="animate-bounce mb-8">
              <i className="fas fa-search text-8xl text-gray-300"></i>
            </div>
            <h3 className="text-4xl font-bold text-gray-700 mb-4">No articles found</h3>
            <p className="text-gray-500 text-xl mb-8">Try adjusting your search or category filter</p>
            <button 
              onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl font-bold text-lg transform hover:scale-105"
            >
              <i className="fas fa-redo mr-3"></i>
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
