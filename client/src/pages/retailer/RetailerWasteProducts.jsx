import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { wasteProductsAPI } from '../../utils/api';
import { useRealtimeProducts } from '../../hooks/useRealtimeProducts';
import toast from 'react-hot-toast';

const RetailerWasteProducts = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [wasteProducts, setWasteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    verified: false,
    organic: false,
    lowToHigh: false,
    highToLow: false
  });

  useEffect(() => {
    fetchWasteProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real-time waste product updates
  const handleProductAdded = useCallback((newProduct) => {
    setWasteProducts((prev) => [newProduct, ...prev]);
    toast.success(`New product available: ${newProduct.name}`);
  }, []);

  const handleProductUpdated = useCallback((updatedProduct) => {
    setWasteProducts((prev) =>
      prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
  }, []);

  const handleProductDeleted = useCallback((productId) => {
    setWasteProducts((prev) => prev.filter((p) => p._id !== productId));
    toast('A product has been removed', {
      icon: 'ℹ️',
      duration: 3000
    });
  }, []);

  const { connected } = useRealtimeProducts(
    handleProductAdded,
    handleProductUpdated,
    handleProductDeleted
  );

  const fetchWasteProducts = async () => {
    try {
      setLoading(true);
      const response = await wasteProductsAPI.getAll();
      console.log('📦 Waste products loaded:', response.data.wasteProducts?.length || 0, 'products');
      setWasteProducts(response.data.wasteProducts || []);
    } catch (error) {
      console.error('❌ Error fetching waste products:', error);
      toast.error(t('retailerWaste.loadingProducts'));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName) => {
    if (filterName === 'lowToHigh' && !filters.lowToHigh) {
      setFilters({ ...filters, lowToHigh: true, highToLow: false });
    } else if (filterName === 'highToLow' && !filters.highToLow) {
      setFilters({ ...filters, highToLow: true, lowToHigh: false });
    } else {
      setFilters({ ...filters, [filterName]: !filters[filterName] });
    }
  };

  const getFilteredProducts = () => {
    let filtered = wasteProducts.filter(product => {
      const matchesSearch =
        (product.seller?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = activeCategory === 'all' ||
        getCategoryFromName(product.category) === activeCategory ||
        (activeCategory === 'oils-vegetables-more' &&
          ['oils', 'vegetables', 'fruits', 'organic'].includes(getCategoryFromName(product.category)));
      const matchesVerified = !filters.verified || product.certified;
      const matchesOrganic = !filters.organic || product.organic;

      return matchesSearch && matchesCategory && matchesVerified && matchesOrganic;
    });

    if (filters.lowToHigh) {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.highToLow) {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  };

  const getCategoryFromName = (category) => {
    // Map waste categories to display categories
    switch (category?.toLowerCase()) {
      case 'organic':
        return 'organic';
      case 'mulch':
      case 'fertilizer':
        return 'waste';
      case 'oils':
      case 'edible-oil':
        return 'oils';
      case 'vegetables':
        return 'vegetables';
      case 'fruits':
        return 'fruits';
      default:
        return 'waste';
    }
  };

  const getProductIcon = (category, name) => {
    const categoryType = getCategoryFromName(category);
    const productName = name?.toLowerCase() || '';

    if (categoryType === 'oils' || productName.includes('oil')) return '🌻';
    if (categoryType === 'vegetables' || productName.includes('vegetable')) return '🥬';
    if (categoryType === 'fruits' || productName.includes('fruit')) return '🍎';
    if (productName.includes('rice') || productName.includes('husk')) return '🌾';
    if (productName.includes('straw') || productName.includes('wheat')) return '🌽';
    if (productName.includes('bagasse') || productName.includes('sugarcane')) return '🌿';
    if (productName.includes('cotton') || productName.includes('stalk')) return '🌱';
    if (productName.includes('coconut') || productName.includes('shell')) return '🥥';
    return '♻️'; // Default waste icon
  };

  const filteredProducts = getFilteredProducts();

  const getGradientClass = (category) => {
    switch (category) {
      case 'oils': return 'from-orange-400 to-yellow-600';
      case 'vegetables': return 'from-green-400 to-emerald-600';
      case 'fruits': return 'from-red-400 to-pink-600';
      case 'waste': return 'from-amber-400 to-yellow-700';
      default: return 'from-green-400 to-emerald-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-300 flex animate-fadeIn">
      {/* Sidebar Filter */}
      <div className="w-80 bg-white p-6 shadow-2xl rounded-2xl m-4 overflow-auto">
        <h2 className="text-3xl font-bold text-green-700 mb-8 text-center flex items-center justify-center">
          <i className="fas fa-filter mr-3"></i>
          {t('retailerWaste.filters')}
        </h2>

        {/* Category Filter */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-4">{t('retailerWaste.category')}</h3>
          <div className="space-y-3">
            <button
              onClick={() => setActiveCategory('all')}
              className={`w-full p-3 rounded-xl text-left font-semibold transition-all ${activeCategory === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <i className="fas fa-th mr-2"></i>
              {t('retailerWaste.allProducts')}
            </button>
            <button
              onClick={() => setActiveCategory('oils-vegetables-more')}
              className={`w-full p-3 rounded-xl text-left font-semibold transition-all ${activeCategory === 'oils-vegetables-more'
                ? 'bg-gradient-to-r from-orange-600 to-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <span className="mr-2">♻️🌾</span>
              {t('retailerWaste.organicWaste')}
            </button>
            <button
              onClick={() => setActiveCategory('waste')}
              className={`w-full p-3 rounded-xl text-left font-semibold transition-all ${activeCategory === 'waste'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <i className="fas fa-recycle mr-2"></i>
              {t('retailerWaste.agriculturalWaste')}
            </button>
          </div>
        </div>

        <hr className="my-6 border-gray-300" />

        <div className="space-y-6">
          <label className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all cursor-pointer">
            <input
              type="checkbox"
              className="mr-3 w-5 h-5 accent-green-600"
              checked={filters.verified}
              onChange={() => handleFilterChange('verified')}
            />
            <div className="flex items-center">
              <i className="fas fa-check-circle text-green-600 mr-2"></i>
              <span className="font-semibold text-gray-700">{t('retailerWaste.verifiedFarmers')}</span>
            </div>
          </label>

          <label className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all cursor-pointer">
            <input
              type="checkbox"
              className="mr-3 w-5 h-5 accent-green-600"
              checked={filters.organic}
              onChange={() => handleFilterChange('organic')}
            />
            <div className="flex items-center">
              <i className="fas fa-leaf text-green-600 mr-2"></i>
              <span className="font-semibold text-gray-700">{t('retailerWaste.organicProduce')}</span>
            </div>
          </label>

          <label className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all cursor-pointer">
            <input
              type="checkbox"
              className="mr-3 w-5 h-5 accent-green-600"
              checked={filters.lowToHigh}
              onChange={() => handleFilterChange('lowToHigh')}
            />
            <div className="flex items-center">
              <i className="fas fa-arrow-up text-green-600 mr-2"></i>
              <span className="font-semibold text-gray-700">{t('retailerWaste.priceLowHigh')}</span>
            </div>
          </label>

          <label className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all cursor-pointer">
            <input
              type="checkbox"
              className="mr-3 w-5 h-5 accent-green-600"
              checked={filters.highToLow}
              onChange={() => handleFilterChange('highToLow')}
            />
            <div className="flex items-center">
              <i className="fas fa-arrow-down text-green-600 mr-2"></i>
              <span className="font-semibold text-gray-700">{t('retailerWaste.priceHighLow')}</span>
            </div>
          </label>
        </div>

        <button
          onClick={() => {
            setFilters({ verified: false, organic: false, lowToHigh: false, highToLow: false });
            setActiveCategory('all');
          }}
          className="bg-red-500 text-white px-6 py-3 mt-8 w-full rounded-xl shadow-lg hover:bg-red-600 transition-all font-bold"
        >
          <i className="fas fa-redo mr-2"></i>
          {t('retailerWaste.resetFilters')}
        </button>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl">
          <h3 className="font-bold text-gray-800 mb-2">{t('retailerWaste.results')}</h3>
          <p className="text-2xl font-bold text-blue-600">{filteredProducts.length}</p>
          <p className="text-sm text-gray-600">{t('retailerWaste.productsFound')}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 flex items-center justify-between text-white shadow-2xl">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 hover:bg-white hover:bg-opacity-20 p-3 rounded-xl transition-all"
            >
              <i className="fas fa-arrow-left text-2xl"></i>
            </button>
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                ♻️ {t('retailerWaste.title')}
                {connected && (
                  <span className="ml-3 flex items-center text-sm bg-green-500 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                    {t('retailerWaste.live')}
                  </span>
                )}
              </h1>
              <p className="text-green-100">{t('retailerWaste.subtitle')}</p>
            </div>
          </div>
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-4 text-gray-400"></i>
            <input
              type="text"
              placeholder={t('retailerWaste.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 rounded-xl text-black focus:outline-none focus:ring-4 focus:ring-green-300 transition duration-300 shadow-lg w-80"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="p-6 flex-grow overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading waste products...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="text-center bg-white p-6 rounded-2xl shadow-xl transform transition hover:scale-105 hover:shadow-2xl animate-fadeIn border-2 border-transparent hover:border-green-400"
                >
                  {/* Product Image */}
                  <div className="h-48 bg-gray-200 overflow-hidden relative rounded-xl mb-4">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]?.url?.startsWith('http') ? product.images[0].url : `http://localhost:5000${product.images[0]?.url || ''}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `http://localhost:5000/image/weast.jpg`;
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full rounded-xl shadow-lg bg-gradient-to-br ${getGradientClass(getCategoryFromName(product.category))} flex items-center justify-center`}>
                        <span className="text-6xl">{getProductIcon(product.category, product.name)}</span>
                      </div>
                    )}
                    {product.organic && (
                      <span className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        <i className="fas fa-leaf mr-1"></i>
                        ORGANIC
                      </span>
                    )}
                    {product.certified && (
                      <span className="absolute top-2 left-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        <i className="fas fa-certificate mr-1"></i>
                        CERTIFIED
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-center mb-2">
                    <h3 className="text-xl font-bold text-green-700">{product.seller?.name || 'Unknown Farmer'}</h3>
                    {product.certified && (
                      <i className="fas fa-check-circle text-blue-500 ml-2" title="Certified Product"></i>
                    )}
                  </div>

                  <p className="text-green-600 font-bold text-lg">{product.name}</p>
                  <p className="text-green-600 font-bold text-2xl mb-2">₹{product.price}/{product.unit}</p>
                  <p className="text-sm text-gray-700 mb-4">{product.description || 'No description available'}</p>

                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getCategoryFromName(product.category) === 'oils' ? 'bg-orange-100 text-orange-800' :
                      getCategoryFromName(product.category) === 'vegetables' ? 'bg-green-100 text-green-800' :
                        getCategoryFromName(product.category) === 'fruits' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                      }`}>
                      {product.category}
                    </span>
                    <div className="text-sm text-gray-600 mt-2">
                      Available: {product.quantity} {product.unit}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 mt-4">
                    <button
                      onClick={() => alert(`Calling ${product.seller?.name || 'farmer'}...`)}
                      className="bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg hover:bg-green-600 transition-all font-semibold flex items-center justify-center"
                    >
                      <i className="fas fa-phone mr-2"></i>
                      Call Farmer
                    </button>
                    <button
                      onClick={() => navigate('/chat')}
                      className="bg-blue-500 text-white px-4 py-3 rounded-xl shadow-lg hover:bg-blue-600 transition-all font-semibold flex items-center justify-center"
                    >
                      <i className="fas fa-comments mr-2"></i>
                      Chat
                    </button>
                    {product.videos && product.videos.length > 0 && (
                      <button
                        onClick={() => window.open(product.videos[0].url, '_blank')}
                        className="bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg hover:bg-red-600 transition-all font-semibold flex items-center justify-center"
                      >
                        <i className="fas fa-video mr-2"></i>
                        View Video
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {filteredProducts.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-search text-gray-300 text-6xl mb-4"></i>
              <h3 className="text-2xl font-bold text-gray-600 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetailerWasteProducts;
