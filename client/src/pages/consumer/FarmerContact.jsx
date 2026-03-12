import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI, chatAPI } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const FarmerContact = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [farmersByCategory, setFarmersByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [contactingId, setContactingId] = useState(null);

  // Category display config
  const categoryConfig = {
    vegetables: { icon: 'fa-carrot', color: 'from-green-200 to-green-100', badge: 'Fresh', label: 'Vegetables' },
    fruits: { icon: 'fa-apple-whole', color: 'from-red-200 to-red-100', badge: 'Organic', label: 'Fruits' },
    cereals: { icon: 'fa-wheat-awn', color: 'from-amber-200 to-amber-100', badge: 'Trending', label: 'Cereals' },
    millets: { icon: 'fa-bowl-rice', color: 'from-yellow-200 to-yellow-100', badge: 'Popular', label: 'Millets' },
    pulses: { icon: 'fa-seedling', color: 'from-orange-200 to-orange-100', badge: null, label: 'Pulses' },
    spices: { icon: 'fa-pepper-hot', color: 'from-purple-200 to-purple-100', badge: 'Premium', label: 'Spices' },
    dairy: { icon: 'fa-cow', color: 'from-blue-200 to-blue-100', badge: 'Fresh', label: 'Dairy' },
    'edible-oil': { icon: 'fa-bottle-droplet', color: 'from-yellow-300 to-yellow-100', badge: null, label: 'Edible Oil' },
    other: { icon: 'fa-box', color: 'from-gray-200 to-gray-100', badge: null, label: 'Other' },
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll({ status: 'available' });
      const allProducts = response.data.products || response.data || [];

      // Group unique farmers by category, along with their products
      const grouped = {};
      const categoryStats = {};

      allProducts.forEach((product) => {
        const cat = product.category || 'other';
        if (!grouped[cat]) {
          grouped[cat] = {};
          categoryStats[cat] = { totalQty: 0, minPrice: Infinity, count: 0 };
        }

        const sellerId = product.seller?._id || product.seller;
        if (!sellerId) return;

        categoryStats[cat].totalQty += product.quantity || 0;
        categoryStats[cat].minPrice = Math.min(categoryStats[cat].minPrice, product.price || 0);
        categoryStats[cat].count += 1;

        if (!grouped[cat][sellerId]) {
          grouped[cat][sellerId] = {
            _id: sellerId,
            name: product.seller?.name || 'Unknown Farmer',
            avatar: product.seller?.avatar || null,
            rating: product.seller?.rating || 0,
            products: [],
          };
        }
        grouped[cat][sellerId].products.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          quantity: product.quantity,
          organic: product.organic,
          location: product.location,
        });
      });

      // Convert grouped object to arrays
      const farmersMap = {};
      Object.keys(grouped).forEach((cat) => {
        farmersMap[cat] = Object.values(grouped[cat]);
      });

      setFarmersByCategory(farmersMap);

      // Build products list for category cards
      const productCards = Object.keys(farmersMap).map((cat) => {
        const config = categoryConfig[cat] || categoryConfig.other;
        const stats = categoryStats[cat] || { totalQty: 0, minPrice: 0, count: 0 };
        return {
          name: cat,
          label: config.label || cat.charAt(0).toUpperCase() + cat.slice(1),
          price: stats.minPrice === Infinity ? 0 : stats.minPrice,
          available: `${stats.totalQty}+ ${stats.count > 1 ? 'units' : 'unit'}`,
          color: config.color,
          badge: config.badge,
          icon: config.icon,
          farmerCount: farmersMap[cat].length,
        };
      });

      setProducts(productCards);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to demo data
      setProducts([
        { name: 'vegetables', label: 'Vegetables', price: 35, available: '2,800+ kg', color: 'from-green-200 to-green-100', badge: 'Fresh', icon: 'fa-carrot', farmerCount: 0 },
        { name: 'fruits', label: 'Fruits', price: 60, available: '1,500+ kg', color: 'from-red-200 to-red-100', badge: 'Organic', icon: 'fa-apple-whole', farmerCount: 0 },
        { name: 'cereals', label: 'Cereals', price: 30, available: '4,500+ kg', color: 'from-amber-200 to-amber-100', badge: 'Trending', icon: 'fa-wheat-awn', farmerCount: 0 },
        { name: 'pulses', label: 'Pulses', price: 80, available: '2,100+ kg', color: 'from-orange-200 to-orange-100', badge: null, icon: 'fa-seedling', farmerCount: 0 },
        { name: 'spices', label: 'Spices', price: 150, available: '800+ kg', color: 'from-purple-200 to-purple-100', badge: 'Premium', icon: 'fa-pepper-hot', farmerCount: 0 },
      ]);
      setFarmersByCategory({});
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async (farmerId) => {
    if (!user) {
      toast.error('Please login to contact farmers');
      navigate('/login');
      return;
    }

    if (farmerId === user._id) {
      toast.error('This is your own listing');
      return;
    }

    try {
      setContactingId(farmerId);
      // Create a chat with the farmer and navigate to the chat page
      await chatAPI.createChat(farmerId);
      toast.success('Chat started! Redirecting...');
      navigate('/chat');
    } catch (error) {
      console.error('Error starting chat:', error);
      if (error.response?.status === 400 && error.response?.data?.chat) {
        // Chat already exists, just navigate
        toast.success('Opening existing chat...');
        navigate('/chat');
      } else {
        toast.error('Failed to start chat. Please try again.');
      }
    } finally {
      setContactingId(null);
    }
  };

  const generateStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star"></i>);
    }
    if (halfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }
    return stars;
  };

  const selectedFarmers = selectedProduct && farmersByCategory[selectedProduct]
    ? farmersByCategory[selectedProduct].filter(f =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.products.some(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location?.state?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <header className="bg-gradient-to-r from-green-800 to-green-600 text-white py-4 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button onClick={() => window.history.back()} className="mr-2 hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <i className="fas fa-tractor text-2xl text-green-200"></i>
            <h1 className="text-2xl font-bold">FarmConnect</h1>
          </div>
          <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2">
            <i className="fas fa-search text-green-100"></i>
            <input
              type="text"
              placeholder="Search farmers or products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent placeholder-green-100 text-white border-none outline-none w-64"
            />
          </div>
        </div>
      </header>

      <section className="w-full bg-gradient-to-b from-green-600 to-transparent py-16 text-center text-white">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Connect Directly with Farmers</h1>
          <p className="text-xl opacity-90 mb-8">Get fresh produce directly from the source at the best prices</p>
          <div className="flex justify-center space-x-4">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm px-6 py-3 rounded-full">
              <i className="fas fa-check-circle mr-2"></i>
              100% Fresh
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm px-6 py-3 rounded-full">
              <i className="fas fa-shield-alt mr-2"></i>
              Verified Farmers
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm px-6 py-3 rounded-full">
              <i className="fas fa-truck mr-2"></i>
              Direct Delivery
            </div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-green-800 flex items-center">
            <i className="fas fa-leaf mr-3 text-green-600"></i>
            Available Products
          </h2>
          <div className="bg-green-100 px-4 py-2 rounded-full text-green-800 font-medium">
            <i className="fas fa-truck-fast mr-2"></i> Fresh Harvest Available
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
            {products.map((product, index) => (
              <div
                key={index}
                onClick={() => setSelectedProduct(product.name)}
                className={`bg-gradient-to-br ${product.color} p-6 rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer ${selectedProduct === product.name ? 'ring-4 ring-green-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <i className={`fas ${product.icon} text-3xl text-gray-700`}></i>
                  {product.badge && (
                    <span className="bg-white bg-opacity-70 px-2 py-1 rounded-full text-xs font-medium">
                      {product.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">{product.label}</h3>
                <div className="text-gray-700 font-medium">₹{product.price}/kg</div>
                <div className="mt-2 text-xs text-gray-600">{product.available}</div>
                {product.farmerCount > 0 && (
                  <div className="mt-2 text-xs text-green-700 font-medium">
                    <i className="fas fa-users mr-1"></i>{product.farmerCount} farmer{product.farmerCount > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap justify-between items-center bg-white rounded-2xl shadow-md p-6 mb-12">
          <div className="text-center px-6 py-3">
            <div className="text-3xl font-bold text-green-600">3,500+</div>
            <div className="text-gray-500">Registered Farmers</div>
          </div>
          <div className="text-center px-6 py-3">
            <div className="text-3xl font-bold text-green-600">1,200+</div>
            <div className="text-gray-500">Active Buyers</div>
          </div>
          <div className="text-center px-6 py-3">
            <div className="text-3xl font-bold text-green-600">₹4.2 Cr</div>
            <div className="text-gray-500">Trade Volume</div>
          </div>
          <div className="text-center px-6 py-3">
            <div className="text-3xl font-bold text-green-600">15+</div>
            <div className="text-gray-500">Product Categories</div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-6xl mx-auto px-6 py-10 mb-16">
        <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <i className="fas fa-users text-2xl text-green-600 mr-3"></i>
            <h2 className="text-3xl font-semibold text-green-800">Farmers Selling Products</h2>
          </div>

          {!selectedProduct ? (
            <div className="bg-green-50 p-12 rounded-lg text-center">
              <i className="fas fa-hand-pointer text-6xl text-green-400 mb-4"></i>
              <p className="text-gray-600 text-lg">Click on a product above to see farmers selling it</p>
            </div>
          ) : selectedFarmers.length === 0 ? (
            <div className="bg-green-50 p-12 rounded-lg text-center">
              <i className="fas fa-user-slash text-6xl text-gray-400 mb-4"></i>
              <p className="text-gray-600 text-lg">No farmers found for this product</p>
              <p className="text-gray-400 text-sm mt-2">Try selecting a different product category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedFarmers.map((farmer) => (
                <div key={farmer._id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                        {farmer.name?.charAt(0)?.toUpperCase() || 'F'}
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-green-700">{farmer.name}</h3>
                        <p className="text-sm text-gray-500">
                          {farmer.products.length} product{farmer.products.length > 1 ? 's' : ''} listed
                        </p>
                      </div>
                    </div>
                  </div>

                  {farmer.rating > 0 && (
                    <div className="flex items-center text-amber-500 mb-3">
                      {generateStars(farmer.rating)}
                      <span className="text-gray-600 text-sm ml-2">({farmer.rating})</span>
                    </div>
                  )}

                  {/* Show farmer's products in this category */}
                  <div className="mb-4 space-y-2">
                    {farmer.products.slice(0, 3).map((product) => (
                      <div key={product._id} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-seedling text-green-600 text-sm"></i>
                          <span className="text-sm font-medium text-gray-700">{product.name}</span>
                          {product.organic && (
                            <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full">Organic</span>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-green-700">₹{product.price}/{product.unit}</span>
                      </div>
                    ))}
                    {farmer.products.length > 3 && (
                      <p className="text-xs text-gray-400 text-center">+{farmer.products.length - 3} more products</p>
                    )}
                  </div>

                  {/* Location from the first product */}
                  {farmer.products[0]?.location && (
                    <div className="flex items-center text-gray-600 mb-4">
                      <i className="fas fa-map-marker-alt mr-2 text-green-600"></i>
                      <span className="text-sm">
                        {[farmer.products[0].location.city, farmer.products[0].location.state]
                          .filter(Boolean)
                          .join(', ') || farmer.products[0].location.address || 'Location not specified'}
                      </span>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end space-x-2">
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition duration-300">
                      <i className="far fa-bookmark"></i>
                    </button>
                    <button
                      onClick={() => handleContact(farmer._id)}
                      disabled={contactingId === farmer._id}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition duration-300 flex items-center"
                    >
                      {contactingId === farmer._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Starting Chat...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-comment-dots mr-2"></i>
                          Contact
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="w-full max-w-6xl mx-auto px-6 py-10 mb-16">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">Why Buy Directly from Farmers?</h3>
              <p className="text-green-100">Get the freshest produce at the best prices</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <i className="fas fa-percentage text-4xl mb-2"></i>
                <p className="font-semibold">Save 30-40%</p>
                <p className="text-sm text-green-100">On market prices</p>
              </div>
              <div className="text-center">
                <i className="fas fa-leaf text-4xl mb-2"></i>
                <p className="font-semibold">100% Fresh</p>
                <p className="text-sm text-green-100">Farm to table</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FarmerContact;
