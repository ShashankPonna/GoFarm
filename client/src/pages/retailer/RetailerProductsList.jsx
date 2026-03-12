import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../../utils/api';
import { useRealtimeProducts } from '../../hooks/useRealtimeProducts';
import toast from 'react-hot-toast';

const RetailerProductsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    verified: false,
    organic: false,
    lowToHigh: false,
    highToLow: false
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  // Real-time product updates
  const handleProductAdded = useCallback((newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  }, []);

  const handleProductUpdated = useCallback((updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
  }, []);

  const handleProductDeleted = useCallback((productId) => {
    setProducts((prev) => prev.filter((p) => p._id !== productId));
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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
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
    let filtered = products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.seller?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesVerified = !filters.verified || product.certified;
      const matchesOrganic = !filters.organic || product.organic;

      return matchesSearch && matchesVerified && matchesOrganic;
    });

    if (filters.lowToHigh) {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.highToLow) {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  const getCategoryColor = (category) => {
    const colors = {
      vegetables: 'from-green-400 to-emerald-600',
      fruits: 'from-red-400 to-pink-600',
      'grains-pulses-spices': 'from-amber-400 to-orange-600',
      cereals: 'from-yellow-400 to-orange-600',
      millets: 'from-amber-400 to-yellow-600',
      pulses: 'from-purple-400 to-indigo-600',
      spices: 'from-orange-400 to-red-600',
      dairy: 'from-blue-400 to-cyan-600',
      'edible-oil': 'from-yellow-300 to-yellow-500',
      waste: 'from-gray-400 to-gray-600',
      other: 'from-gray-400 to-gray-600'
    };
    return colors[category] || 'from-gray-400 to-gray-600';
  };

  const getCategoryDisplayName = (category) => {
    const displayNames = {
      'grains-pulses-spices': 'Grains, Pulses & Spices',
      'edible-oil': 'Edible Oil',
      vegetables: 'Vegetables',
      fruits: 'Fruits',
      cereals: 'Cereals',
      millets: 'Millets',
      pulses: 'Pulses',
      spices: 'Spices',
      dairy: 'Dairy',
      waste: 'Waste',
      other: 'Other'
    };
    return displayNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex">
      {/* Sidebar Filter */}
      <div className="w-80 bg-white p-6 shadow-2xl rounded-2xl m-4 overflow-auto">
        <h2 className="text-3xl font-bold text-blue-700 mb-8 text-center flex items-center justify-center">
          <i className="fas fa-filter mr-3"></i>
          Filters
        </h2>

        <div className="space-y-6">
          <label className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all cursor-pointer">
            <input
              type="checkbox"
              className="mr-3 w-5 h-5 accent-blue-600"
              checked={filters.verified}
              onChange={() => handleFilterChange('verified')}
            />
            <div className="flex items-center">
              <i className="fas fa-check-circle text-blue-600 mr-2"></i>
              <span className="font-semibold text-gray-700">Certified Products</span>
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
              <span className="font-semibold text-gray-700">Organic Products</span>
            </div>
          </label>

          <label className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all cursor-pointer">
            <input
              type="checkbox"
              className="mr-3 w-5 h-5 accent-blue-600"
              checked={filters.lowToHigh}
              onChange={() => handleFilterChange('lowToHigh')}
            />
            <div className="flex items-center">
              <i className="fas fa-arrow-up text-blue-600 mr-2"></i>
              <span className="font-semibold text-gray-700">Price: Low to High</span>
            </div>
          </label>

          <label className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all cursor-pointer">
            <input
              type="checkbox"
              className="mr-3 w-5 h-5 accent-blue-600"
              checked={filters.highToLow}
              onChange={() => handleFilterChange('highToLow')}
            />
            <div className="flex items-center">
              <i className="fas fa-arrow-down text-blue-600 mr-2"></i>
              <span className="font-semibold text-gray-700">Price: High to Low</span>
            </div>
          </label>
        </div>

        <button
          onClick={() => setFilters({ verified: false, organic: false, lowToHigh: false, highToLow: false })}
          className="bg-red-500 text-white px-6 py-3 mt-8 w-full rounded-xl shadow-lg hover:bg-red-600 transition-all font-bold"
        >
          <i className="fas fa-redo mr-2"></i>
          Reset Filters
        </button>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl">
          <h3 className="font-bold text-gray-800 mb-2">Results</h3>
          <p className="text-2xl font-bold text-blue-600">{filteredProducts.length}</p>
          <p className="text-sm text-gray-600">products found</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between text-white shadow-2xl">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 hover:bg-white hover:bg-opacity-20 p-3 rounded-xl transition-all"
            >
              <i className="fas fa-arrow-left text-2xl"></i>
            </button>
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                All Products from Farmers
                {connected && (
                  <span className="ml-3 flex items-center text-sm bg-green-500 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                    Live
                  </span>
                )}
              </h1>
              <p className="text-blue-100">Browse fresh products directly from farmers</p>
            </div>
          </div>
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-4 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search products or farmers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 rounded-xl text-black focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 shadow-lg w-80"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="p-6 flex-grow overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading products...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <i className="fas fa-search text-gray-300 text-6xl mb-4"></i>
                <h3 className="text-2xl font-bold text-gray-600 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow-xl transform transition hover:scale-105 hover:shadow-2xl overflow-hidden"
                >
                  {/* Product Image */}
                  <div className="h-48 bg-gray-200 overflow-hidden relative">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]?.url?.startsWith('http') ? product.images[0].url : `http://localhost:5000${product.images[0]?.url || ''}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `http://localhost:5000/image/dari.jpeg`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                        <i className="fas fa-image text-6xl text-gray-400"></i>
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

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getCategoryColor(product.category)} text-white`}>
                        {getCategoryDisplayName(product.category)}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                    <div className="flex items-center mb-3 text-sm text-gray-700">
                      <i className="fas fa-user text-blue-600 mr-2"></i>
                      <span className="font-semibold">{product.seller?.name || 'Unknown Farmer'}</span>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-2xl font-bold text-green-600">₹{product.price}</p>
                        <p className="text-xs text-gray-500">per {product.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Available</p>
                        <p className="font-semibold text-gray-800">{product.quantity} {product.unit}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => alert(`Calling ${product.seller?.name || 'farmer'}...`)}
                          className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all font-semibold"
                        >
                          <i className="fas fa-phone mr-2"></i>
                          Call
                        </button>
                        <button
                          onClick={() => navigate('/chat')}
                          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all font-semibold"
                        >
                          <i className="fas fa-comments mr-2"></i>
                          Chat
                        </button>
                      </div>

                      {/* Video Button - Only show if product has video */}
                      {product.video && product.video.url && (
                        <button
                          onClick={() => window.open(product.video.url, '_blank')}
                          className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all font-semibold"
                        >
                          <i className="fas fa-video mr-2"></i>
                          Watch Product Video
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetailerProductsList;
