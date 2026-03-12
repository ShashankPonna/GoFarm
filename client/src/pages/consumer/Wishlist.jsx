import { useState } from 'react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      name: 'Organic Tomatoes',
      price: 30,
      image: 'https://images.unsplash.com/photo-1546470427-227e2e2e4e8e?w=400',
      category: 'Vegetables',
      inStock: true,
      discount: 10
    },
    {
      id: 2,
      name: 'Fresh Mangoes',
      price: 80,
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400',
      category: 'Fruits',
      inStock: true,
      discount: 0
    },
    {
      id: 3,
      name: 'Basmati Rice',
      price: 120,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
      category: 'Grains',
      inStock: false,
      discount: 15
    },
    {
      id: 4,
      name: 'Organic Turmeric',
      price: 200,
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400',
      category: 'Spices',
      inStock: true,
      discount: 5
    }
  ]);

  const removeFromWishlist = (id) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== id));
  };

  const addToCart = (item) => {
    // Add to cart logic
    alert(`${item.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/consumer/dashboard" className="mr-4 hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
                <i className="fas fa-arrow-left text-xl"></i>
              </Link>
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  <i className="fas fa-heart mr-3"></i>
                  My Wishlist
                </h1>
                <p className="text-blue-100 mt-1">{wishlistItems.length} items saved</p>
              </div>
            </div>
            <Link to="/consumer/shop" className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-blue-50 transition">
              <i className="fas fa-shopping-bag mr-2"></i>
              Continue Shopping
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <i className="fas fa-heart-broken text-gray-300 text-6xl mb-4"></i>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-6">Start adding products you love!</p>
              <Link
                to="/consumer/shop"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg inline-block hover:from-blue-700 hover:to-indigo-700 transition"
              >
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  {item.discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {item.discount}% OFF
                    </div>
                  )}
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-2 right-2 bg-white text-red-500 w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition shadow-lg"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="p-4">
                  <div className="text-sm text-gray-500 mb-1">{item.category}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.name}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {item.discount > 0 ? (
                        <div>
                          <span className="text-2xl font-bold text-green-600">
                            ₹{Math.round(item.price * (1 - item.discount / 100))}
                          </span>
                          <span className="text-sm text-gray-400 line-through ml-2">
                            ₹{item.price}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-green-600">₹{item.price}</span>
                      )}
                      <div className="text-xs text-gray-500">per kg</div>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    disabled={!item.inStock}
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                      item.inStock
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {item.inStock ? (
                      <>
                        <i className="fas fa-shopping-cart mr-2"></i>
                        Add to Cart
                      </>
                    ) : (
                      'Out of Stock'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Share Wishlist */}
        {wishlistItems.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Share Your Wishlist</h3>
            <p className="text-gray-600 mb-6">Let friends and family know what you love!</p>
            <div className="flex justify-center space-x-4">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                <i className="fab fa-facebook mr-2"></i>
                Facebook
              </button>
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
                <i className="fab fa-whatsapp mr-2"></i>
                WhatsApp
              </button>
              <button className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition">
                <i className="fas fa-link mr-2"></i>
                Copy Link
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t-2 border-gray-200 z-50">
        <div className="flex justify-around py-3 max-w-lg mx-auto">
          <Link to="/consumer/dashboard" className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition">
            <div className="rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center mb-1 hover:bg-blue-50">
              <i className="fas fa-home text-xl"></i>
            </div>
            <span className="text-xs font-semibold">Home</span>
          </Link>
          <Link to="/consumer/shop" className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition">
            <div className="rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center mb-1 hover:bg-blue-50">
              <i className="fas fa-shopping-bag text-xl"></i>
            </div>
            <span className="text-xs font-semibold">Shop</span>
          </Link>
          <Link to="/consumer/wishlist" className="flex flex-col items-center text-blue-600">
            <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-1 scale-110">
              <i className="fas fa-heart text-xl"></i>
            </div>
            <span className="text-xs font-semibold">Wishlist</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition">
            <div className="rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center mb-1 hover:bg-blue-50">
              <i className="fas fa-user text-xl"></i>
            </div>
            <span className="text-xs font-semibold">Account</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Wishlist;
