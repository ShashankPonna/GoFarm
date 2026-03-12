import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { IMAGE_BASE_URL } from '../../utils/api';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { items: cartItems, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();

  const getImageSrc = (product) => {
    const img = product.images?.[0];
    if (!img?.url) return null;
    return img.url.startsWith('http') ? img.url : `${IMAGE_BASE_URL}${img.url}`;
  };

  const deliveryFee = getTotal() >= 500 ? 0 : 40;
  const total = getTotal() + deliveryFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pb-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-700 to-emerald-700 text-white shadow-xl">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={() => navigate(-1)} className="mr-4 hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
                <i className="fas fa-arrow-left text-xl"></i>
              </button>
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  <i className="fas fa-shopping-cart mr-3"></i>
                  Shopping Cart
                </h1>
                <p className="text-green-100 mt-1">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart</p>
              </div>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={() => { clearCart(); toast.success('Cart cleared'); }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                <i className="fas fa-trash mr-2"></i>Clear Cart
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <i className="fas fa-shopping-cart text-gray-300 text-6xl mb-4"></i>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some products to get started!</p>
              <button
                onClick={() => navigate(-1)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg inline-block hover:from-green-700 hover:to-emerald-700 transition font-semibold"
              >
                <i className="fas fa-shopping-bag mr-2"></i>Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {getImageSrc(item) ? (
                        <img
                          src={getImageSrc(item)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fas fa-image text-2xl text-gray-300"></i>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-green-600 font-semibold uppercase">{item.category}</div>
                      <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                      <div className="text-xl font-bold text-green-600 mt-1">
                        ₹{item.price} <span className="text-sm text-gray-500">per {item.unit || 'kg'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-2">
                        <button
                          onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-green-600 hover:text-white transition"
                        >
                          <i className="fas fa-minus text-sm"></i>
                        </button>
                        <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-green-600 hover:text-white transition"
                        >
                          <i className="fas fa-plus text-sm"></i>
                        </button>
                      </div>
                      <div className="text-xl font-bold text-gray-800">
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                    <button
                      onClick={() => { removeItem(item._id); toast.success('Item removed'); }}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center text-sm"
                    >
                      <i className="fas fa-trash mr-2"></i>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                    <span className="font-semibold">₹{getTotal()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold">{deliveryFee === 0 ? <span className="text-green-600">FREE</span> : `₹${deliveryFee}`}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-green-600">₹{total}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition shadow-lg"
                >
                  <i className="fas fa-lock mr-2"></i>
                  Proceed to Checkout
                </button>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-shield-alt text-green-600 mr-2"></i>
                    Secure checkout
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-truck text-green-600 mr-2"></i>
                    Free delivery on orders above ₹500
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-undo text-green-600 mr-2"></i>
                    Easy returns within 7 days
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
