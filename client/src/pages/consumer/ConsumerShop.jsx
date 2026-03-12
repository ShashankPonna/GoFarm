import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api, { IMAGE_BASE_URL } from '../../utils/api';

const ConsumerShop = () => {
  const { t } = useTranslation();
  const [cart, setCart] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCart, setShowCart] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const deliveryFee = 40;

  // Local products data (fallback) - kept for reference if API fails
  /* Commented out to avoid unused variable warning
  const fallbackProducts = {
    Millets: [
      { name: 'Foxtail Millet', price: 80, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', organic: true },
      { name: 'Pearl Millet', price: 70, image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400', organic: false },
      { name: 'Finger Millet', price: 85, image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400', organic: true },
      { name: 'Proso Millet', price: 90, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400', organic: false },
      { name: 'Barnyard Millet', price: 95, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', organic: true },
      { name: 'Little Millet', price: 88, image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400', organic: false },
      { name: 'Kodo Millet', price: 92, image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400', organic: true },
      { name: 'Sorghum Millet', price: 75, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400', organic: false }
    ],
    Vegetables: [
      { name: 'Tomato', price: 30, image: 'https://images.unsplash.com/photo-1546470427-227e2e2e4e8e?w=400', organic: true },
      { name: 'Potato', price: 25, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', organic: false },
      { name: 'Onion', price: 35, image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400', organic: false },
      { name: 'Carrot', price: 40, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400', organic: true },
      { name: 'Cabbage', price: 28, image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400', organic: true },
      { name: 'Cauliflower', price: 32, image: 'https://images.unsplash.com/photo-1568584711271-e88a6c0e6e3e?w=400', organic: false },
      { name: 'Spinach', price: 20, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400', organic: true },
      { name: 'Broccoli', price: 60, image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400', organic: true }
    ],
    Fruits: [
      { name: 'Apple', price: 120, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', organic: true },
      { name: 'Banana', price: 50, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', organic: false },
      { name: 'Mango', price: 80, image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400', organic: true },
      { name: 'Orange', price: 70, image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400', organic: false },
      { name: 'Grapes', price: 90, image: 'https://images.unsplash.com/photo-1599819177331-6d69a5f6e3f5?w=400', organic: true },
      { name: 'Papaya', price: 40, image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=400', organic: false },
      { name: 'Watermelon', price: 30, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=400', organic: false },
      { name: 'Pomegranate', price: 100, image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400', organic: true }
    ],
    Grains: [
      { name: 'Wheat', price: 30, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400', organic: false },
      { name: 'Rice', price: 40, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', organic: true },
      { name: 'Corn', price: 35, image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400', organic: false },
      { name: 'Barley', price: 45, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400', organic: true },
      { name: 'Oats', price: 60, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400', organic: true },
      { name: 'Quinoa', price: 150, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', organic: true }
    ],
    Pulses: [
      { name: 'Chickpeas', price: 80, image: 'https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=400', organic: false },
      { name: 'Lentils', price: 90, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', organic: true },
      { name: 'Green Gram', price: 100, image: 'https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=400', organic: false },
      { name: 'Black Gram', price: 110, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', organic: true },
      { name: 'Red Lentils', price: 95, image: 'https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=400', organic: false },
      { name: 'Kidney Beans', price: 120, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', organic: true }
    ],
    Spices: [
      { name: 'Turmeric', price: 200, image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400', organic: true },
      { name: 'Cumin', price: 180, image: 'https://images.unsplash.com/photo-1596040033229-a0b3b83b6c0f?w=400', organic: false },
      { name: 'Coriander', price: 150, image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400', organic: true },
      { name: 'Black Pepper', price: 300, image: 'https://images.unsplash.com/photo-1596040033229-a0b3b83b6c0f?w=400', organic: false },
      { name: 'Cardamom', price: 800, image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400', organic: true },
      { name: 'Cinnamon', price: 250, image: 'https://images.unsplash.com/photo-1596040033229-a0b3b83b6c0f?w=400', organic: false }
    ]
  };
  */

  useEffect(() => {
    const savedCart = localStorage.getItem('gofarmCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem('gofarmCart', JSON.stringify(cart));
  }, [cart]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      console.log('📦 Products loaded:', response.data.products?.length || 0, 'products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      // Fallback to static data if API fails
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const showToastMessage = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[product.name]) {
        newCart[product.name].quantity += 1;
      } else {
        newCart[product.name] = {
          price: product.price,
          image: product.image,
          quantity: 1
        };
      }
      return newCart;
    });
    showToastMessage(t('consumerShop.addedToCart', { name: product.name }));
  };

  const updateQuantity = (itemName, change) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemName]) {
        newCart[itemName].quantity += change;
        if (newCart[itemName].quantity <= 0) {
          delete newCart[itemName];
        }
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  };

  const processCheckout = () => {
    if (getCartCount() === 0) {
      showToastMessage(t('consumerShop.cartEmptyError'), 'error');
      return;
    }

    setTimeout(() => {
      setShowSuccessModal(true);
      setCart({});
      setShowCart(false);
    }, 1500);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' ||
      product.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const generateStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star"></i>);
    }
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
        <Link to="/consumer/dashboard" className="text-3xl font-bold hover:opacity-80 transition">
          <span className="text-green-600">🌾 GO</span>
          <span className="text-yellow-600">FaRm</span>
        </Link>
        <div className="relative w-1/3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border-2 border-green-300 focus:border-green-500 focus:outline-none"
            placeholder={t('consumerShop.searchPlaceholder')}
          />
          <i className="fas fa-search absolute left-3 top-3 text-green-500"></i>
        </div>
        <button
          onClick={() => setShowCart(true)}
          className="bg-green-600 hover:bg-green-700 transition-colors text-white px-6 py-2 rounded-full flex items-center space-x-2"
        >
          <i className="fas fa-shopping-basket"></i>
          <span>{t('consumerShop.cart')} ({getCartCount()})</span>
        </button>
      </nav>

      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1550989460-0adf9ea622e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 text-center py-28 px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg">
            Fresh from <span className="text-yellow-400">Farm</span> to <span className="text-green-300">Table</span>
          </h1>
          <p className="mt-4 text-xl text-white max-w-2xl mx-auto drop-shadow-lg">
            Support local farmers and enjoy the freshest produce delivered to your doorstep!
          </p>
          <button className="mt-8 bg-yellow-500 hover:bg-yellow-600 transition-colors text-white px-8 py-3 rounded-full font-bold text-lg">
            Shop Now <i className="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex gap-4 justify-center mb-12 flex-wrap">
          {['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Millets', 'Cereals', 'Dairy', 'Other'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`p-4 rounded-lg text-center shadow hover:shadow-lg flex flex-col items-center transition-all transform hover:scale-105 ${selectedCategory === category
                ? 'bg-green-50 shadow-lg ring-2 ring-green-500'
                : 'bg-white'
                }`}
            >
              <div className="text-3xl mb-2">
                <i
                  className={`fas ${category === 'All' ? 'fa-th text-blue-600' :
                    category === 'Millets' ? 'fa-wheat-awn text-orange-600' :
                      category === 'Vegetables' ? 'fa-carrot text-green-600' :
                        category === 'Fruits' ? 'fa-apple-alt text-red-600' :
                          category === 'Grains' ? 'fa-seedling text-yellow-600' :
                            category === 'Pulses' ? 'fa-bowl-food text-amber-600' :
                              category === 'Cereals' ? 'fa-wheat text-yellow-700' :
                                category === 'Dairy' ? 'fa-cheese text-yellow-500' :
                                  category === 'Spices' ? 'fa-pepper-hot text-red-700' :
                                    'fa-box text-gray-600'
                    }`}
                ></i>
              </div>
              <span className={`font-semibold ${selectedCategory === category ? 'text-green-700' : 'text-gray-700'}`}>
                {category}
              </span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading fresh products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => {
              const rating = 4 + Math.random();
              const imageUrl = product.images && product.images[0]
                ? (product.images[0]?.url?.startsWith('http') ? product.images[0].url : `${IMAGE_BASE_URL}${product.images[0]?.url || ''}`)
                : 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400';

              return (
                <div
                  key={product._id || index}
                  className="bg-white rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl relative animate-fadeIn"
                >
                  <div className="overflow-hidden h-48 relative">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400';
                      }}
                    />
                    <div
                      className={`absolute top-2 left-2 ${product.organic ? 'bg-yellow-500' : 'bg-green-600'
                        } text-white text-xs px-2 py-1 rounded-full`}
                    >
                      {product.organic ? t('consumerShop.organic') : t('consumerShop.fresh')}
                    </div>
                    {product.certified && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        <i className="fas fa-certificate mr-1"></i>Certified
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <span className="text-green-700 font-bold">₹{product.price}</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{t('consumerShop.perKg')} {product.unit || 'kg'}</p>
                    <p className="text-gray-600 text-xs mt-1 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-yellow-500 flex">
                        {generateStars(rating)}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/product/${product._id || product.name}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-lg transition-colors text-xs flex items-center"
                        >
                          <i className="fas fa-eye mr-1"></i> View
                        </Link>
                        <button
                          onClick={() => addToCart({
                            name: product.name,
                            price: product.price,
                            image: imageUrl
                          })}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-colors flex items-center"
                        >
                          <i className="fas fa-plus mr-1"></i> Add
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <i className="fas fa-user mr-1"></i>
                      {product.seller?.name || 'Seller'} • {product.seller?.role || 'Farmer'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-medium text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Why Choose GOFaRm?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-leaf text-2xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">100% Fresh</h3>
              <p className="text-gray-600">
                All products are harvested fresh from local farms and delivered to your door within 24 hours.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-hand-holding-usd text-2xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fair Prices</h3>
              <p className="text-gray-600">
                By cutting out middlemen, we ensure farmers get better income and you pay less.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-truck text-2xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Order before noon to get your fresh produce delivered the same day.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div
        className={`fixed top-0 right-0 w-full md:w-1/3 bg-white h-full shadow-2xl p-6 z-50 transform transition-transform duration-300 ${showCart ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-green-700">
            <i className="fas fa-shopping-basket mr-2"></i> Your Cart
          </h2>
          <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700">
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {getCartCount() === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-shopping-basket text-gray-300 text-5xl"></i>
              <p className="text-gray-500 mt-4">Your cart is empty</p>
            </div>
          ) : (
            Object.entries(cart).map(([name, item]) => (
              <div key={name} className="flex items-center mb-4 pb-4 border-b border-gray-200">
                <img src={item.image} alt={name} className="w-16 h-16 object-cover rounded-lg" />
                <div className="ml-4 flex-grow">
                  <h4 className="font-semibold">{name}</h4>
                  <p className="text-green-700">
                    ₹{item.price} x {item.quantity}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => updateQuantity(name, 1)}
                    className="text-green-700 hover:text-green-800"
                  >
                    <i className="fas fa-plus-circle"></i>
                  </button>
                  <span className="my-1">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(name, -1)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <i className="fas fa-minus-circle"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mt-6">
          <div className="flex justify-between text-lg">
            <span>Subtotal:</span>
            <span className="font-semibold">₹{getCartTotal()}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span>Delivery:</span>
            <span className="font-semibold">₹{deliveryFee}</span>
          </div>
          <div className="flex justify-between text-xl mt-2 pt-2 border-t border-gray-300">
            <span className="font-bold">Total:</span>
            <span className="font-bold text-green-700">₹{getCartTotal() + deliveryFee}</span>
          </div>
        </div>

        <button
          onClick={processCheckout}
          className="bg-green-600 hover:bg-green-700 transition-colors text-white px-6 py-3 rounded-lg mt-6 w-full flex items-center justify-center space-x-2"
        >
          <i className="fas fa-credit-card"></i>
          <span>Proceed to Checkout</span>
        </button>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <i className="fas fa-check text-3xl text-green-600"></i>
              </div>
              <h3 className="text-2xl font-bold mt-4">Payment Successful!</h3>
              <p className="mt-2 text-gray-600">Thank you for shopping with GOFaRm!</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="mt-6 bg-green-600 hover:bg-green-700 transition-colors text-white px-6 py-2 rounded-lg"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-20 right-20 px-6 py-3 rounded-lg text-white shadow-lg z-50 animate-slideIn ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
            }`}
        >
          {toast.message}
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                <span className="text-green-400">🌾 GO</span>
                <span className="text-yellow-400">FaRm</span>
              </h3>
              <p className="text-gray-300">
                Connecting farmers directly with consumers for fresher produce and fair prices.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/consumer/dashboard" className="text-gray-300 hover:text-white">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/consumer/farmers" className="text-gray-300 hover:text-white">
                    Contact Farmers
                  </Link>
                </li>
                <li>
                  <Link to="/consumer/community" className="text-gray-300 hover:text-white">
                    Community
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="text-gray-300 hover:text-white">
                    My Orders
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <i className="fas fa-envelope mr-2"></i> support@gofarm.com
                </li>
                <li>
                  <i className="fas fa-phone mr-2"></i> +91 9876543210
                </li>
                <li>
                  <i className="fas fa-map-marker-alt mr-2"></i> Farm Valley, Green City
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            &copy; 2025 GOFaRm. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ConsumerShop;
