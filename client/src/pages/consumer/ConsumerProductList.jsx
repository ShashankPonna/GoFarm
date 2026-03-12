import React, { useState, useEffect } from 'react';
import { productsAPI, IMAGE_BASE_URL } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const ConsumerProductList = () => {
  const { user, isAuthenticated } = useAuthStore(state => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated
  }));

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState({});

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains, Pulses & Spices', 'Millets', 'Cereals', 'Pulses', 'Spices', 'Dairy', 'Other'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      console.log('📦 Consumer products loaded:', response.data);

      const products = response.data.products || [];
      setProducts(products);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(item => item.category.toLowerCase() === selectedCategory.toLowerCase());

  const addToCart = (product) => {
    const newCart = { ...cart };
    if (newCart[product._id]) {
      newCart[product._id].quantity += 1;
    } else {
      newCart[product._id] = {
        ...product,
        quantity: 1
      };
    }
    setCart(newCart);
    toast.success(`${product.name} added to cart!`);
  };

  const getCartCount = () => {
    return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'vegetables': return 'bg-green-100 text-green-800';
      case 'fruits': return 'bg-red-100 text-red-800';
      case 'grains-pulses-spices': return 'bg-amber-100 text-amber-800';
      case 'millets': return 'bg-yellow-100 text-yellow-800';
      case 'cereals': return 'bg-blue-100 text-blue-800';
      case 'pulses': return 'bg-purple-100 text-purple-800';
      case 'spices': return 'bg-orange-100 text-orange-800';
      case 'dairy': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => window.history.back()} className="mr-4">
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <div>
              <h1 className="text-xl font-bold">🛒 Fresh Products</h1>
              <p className="text-sm text-blue-200">Buy fresh products directly from farmers</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchProducts}
              className="bg-green-500 hover:bg-green-600 px-3 py-2 rounded-lg font-medium transition-colors"
              disabled={loading}
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh
            </button>
            <div className="relative">
              <button className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg font-medium transition-colors">
                <i className="fas fa-shopping-cart mr-2"></i>
                Cart ({getCartCount()})
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Category Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <div className="h-48 bg-gray-200 overflow-hidden relative">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]?.url?.startsWith('http') ? product.images[0].url : `${IMAGE_BASE_URL}${product.images[0]?.url || ''}`}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        // Only fallback once to prevent infinite loops
                        if (!e.target.dataset.fallbackAttempted) {
                          e.target.dataset.fallbackAttempted = 'true';
                          e.target.src = `${IMAGE_BASE_URL}/image/dari.jpeg`;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <i className="fas fa-image text-4xl text-gray-400 mb-2"></i>
                      <span className="text-xs text-gray-500 text-center px-2">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{product.name || 'Unnamed Product'}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
                      {product.category || 'Other'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2 text-sm">{product.description || 'No description'}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-bold text-green-600">₹{product.price || 0}/{product.unit || 'unit'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium">{product.quantity || 0} {product.unit || 'unit'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Seller:</span>
                      <span className="font-medium">{product.seller?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      {product.organic && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          <i className="fas fa-leaf mr-1"></i>Organic
                        </span>
                      )}
                      {product.certified && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          <i className="fas fa-certificate mr-1"></i>Certified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(product)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors duration-300"
                      disabled={product.quantity === 0}
                    >
                      <i className="fas fa-cart-plus mr-1"></i>
                      {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg transition-colors duration-300"
                    >
                      <i className="fas fa-heart"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-shopping-basket text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-medium text-gray-600 mb-2">No products found</h3>
            {selectedCategory === 'All' ? (
              <p className="text-gray-500">No products available at the moment</p>
            ) : (
              <p className="text-gray-500">No products found in {selectedCategory} category</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumerProductList;