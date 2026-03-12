import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { ordersAPI } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { items: cartItems, getTotal, clearCart } = useCartStore();
    const [placing, setPlacing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [, setShowQR] = useState(false);
    const [address, setAddress] = useState({
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: user?.phone || ''
    });

    const subtotal = getTotal();
    const deliveryFee = subtotal >= 500 ? 0 : 40;
    const total = subtotal + deliveryFee;

    // Get seller phone from the first cart item
    const sellerPhone = cartItems[0]?.seller?.phone || '9999999999';
    const sellerName = cartItems[0]?.seller?.name || 'GOFaRm Seller';

    // Generate UPI deep link
    const upiLink = `upi://pay?pa=${sellerPhone}@upi&pn=${encodeURIComponent(sellerName)}&am=${total}&cu=INR&tn=${encodeURIComponent('GOFaRm Order Payment')}`;

    // QR code URL using a free QR API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                    <i className="fas fa-shopping-cart text-gray-300 text-6xl mb-4"></i>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                    <p className="text-gray-600 mb-6">Add items to your cart to proceed with checkout</p>
                    <button onClick={() => navigate(-1)} className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-semibold">
                        <i className="fas fa-arrow-left mr-2"></i>Go Back
                    </button>
                </div>
            </div>
        );
    }

    const handlePlaceOrder = async () => {
        if (!address.address || !address.city || !address.pincode || !address.phone) {
            toast.error('Please fill in all delivery address fields');
            return;
        }

        try {
            setPlacing(true);

            const orderData = {
                items: cartItems.map(item => ({
                    product: item._id,
                    name: item.name,
                    quantity: Number(item.quantity) || 1,
                    price: Number(item.price) || 0
                })),
                deliveryAddress: address,
                paymentMethod
            };

            const response = await ordersAPI.create(orderData);
            const order = response.data.order;

            clearCart();
            toast.success('Order placed successfully!');
            navigate(`/order-confirmation/${order._id}`, { state: { order, receipt: response.data.receipt } });
        } catch (error) {
            console.error('Error placing order:', error);
            const msg = error.response?.data?.message || 'Failed to place order';
            toast.error(msg);
        } finally {
            setPlacing(false);
        }
    };

    const paymentMethods = [
        { id: 'cod', label: 'Cash on Delivery', icon: 'fa-money-bill-wave', color: 'green', desc: 'Pay when your order arrives' },
        { id: 'upi', label: 'UPI / QR Payment', icon: 'fa-qrcode', color: 'purple', desc: 'Scan QR to pay via Google Pay, PhonePe, Paytm' },
        { id: 'online', label: 'Online Banking', icon: 'fa-university', color: 'blue', desc: 'Net Banking, Debit/Credit Card' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-green-700 to-emerald-700 text-white py-4 px-6 shadow-lg">
                <div className="max-w-5xl mx-auto flex items-center">
                    <button onClick={() => navigate(-1)} className="mr-4 hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
                        <i className="fas fa-arrow-left text-xl"></i>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold"><i className="fas fa-lock mr-2"></i>Secure Checkout</h1>
                        <p className="text-green-200 text-sm">Complete your order</p>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Left - Forms */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Step 1: Delivery Address */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                                Delivery Address
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
                                    <textarea
                                        value={address.address}
                                        onChange={(e) => setAddress({ ...address, address: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                        rows="2"
                                        placeholder="House/Flat No., Street, Landmark..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                    <input
                                        type="text"
                                        value={address.city}
                                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="City"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <input
                                        type="text"
                                        value={address.state}
                                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="State"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                                    <input
                                        type="text"
                                        value={address.pincode}
                                        onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="6-digit pincode"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                    <input
                                        type="tel"
                                        value={address.phone}
                                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="10-digit mobile number"
                                        maxLength={10}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Payment Method */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                                Payment Method
                            </h2>
                            <div className="space-y-3">
                                {paymentMethods.map((method) => (
                                    <label
                                        key={method.id}
                                        className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.id
                                            ? 'border-green-500 bg-green-50 shadow-md'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        onClick={() => {
                                            setPaymentMethod(method.id);
                                            if (method.id === 'upi') setShowQR(true);
                                            else setShowQR(false);
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method.id}
                                            checked={paymentMethod === method.id}
                                            onChange={() => { }}
                                            className="sr-only"
                                        />
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${paymentMethod === method.id ? `bg-${method.color}-100` : 'bg-gray-100'
                                            }`}>
                                            <i className={`fas ${method.icon} text-xl ${paymentMethod === method.id ? `text-${method.color}-600` : 'text-gray-400'
                                                }`}></i>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">{method.label}</p>
                                            <p className="text-sm text-gray-500">{method.desc}</p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.id ? 'border-green-500 bg-green-500' : 'border-gray-300'
                                            }`}>
                                            {paymentMethod === method.id && (
                                                <i className="fas fa-check text-white text-xs"></i>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {/* UPI QR Code Section */}
                            {paymentMethod === 'upi' && (
                                <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200">
                                    <div className="text-center">
                                        <h3 className="text-lg font-bold text-purple-800 mb-1">
                                            <i className="fas fa-qrcode mr-2"></i>Scan QR to Pay
                                        </h3>
                                        <p className="text-sm text-purple-600 mb-4">
                                            Pay ₹{total} directly to seller's UPI
                                        </p>

                                        {/* QR Code */}
                                        <div className="inline-block bg-white p-4 rounded-2xl shadow-lg mb-4">
                                            <img
                                                src={qrCodeUrl}
                                                alt="UPI Payment QR Code"
                                                className="w-56 h-56 mx-auto"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                            <div className="w-56 h-56 items-center justify-center flex-col hidden">
                                                <i className="fas fa-qrcode text-6xl text-gray-300 mb-2"></i>
                                                <p className="text-sm text-gray-500">QR loading failed</p>
                                            </div>
                                        </div>

                                        {/* Payment Details */}
                                        <div className="bg-white rounded-xl p-4 text-left space-y-2 mb-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Pay to:</span>
                                                <span className="font-semibold text-gray-800">{sellerName}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">UPI ID:</span>
                                                <span className="font-mono text-sm text-purple-700 bg-purple-50 px-2 py-1 rounded">{sellerPhone}@upi</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Amount:</span>
                                                <span className="font-bold text-green-600 text-lg">₹{total}</span>
                                            </div>
                                        </div>

                                        {/* UPI App Icons */}
                                        <div className="flex justify-center gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="w-12 h-12 bg-white rounded-xl shadow flex items-center justify-center mx-auto mb-1">
                                                    <span className="text-lg font-bold text-blue-600">G</span>
                                                </div>
                                                <span className="text-xs text-gray-500">GPay</span>
                                            </div>
                                            <div className="text-center">
                                                <div className="w-12 h-12 bg-white rounded-xl shadow flex items-center justify-center mx-auto mb-1">
                                                    <span className="text-lg font-bold text-purple-600">P</span>
                                                </div>
                                                <span className="text-xs text-gray-500">PhonePe</span>
                                            </div>
                                            <div className="text-center">
                                                <div className="w-12 h-12 bg-white rounded-xl shadow flex items-center justify-center mx-auto mb-1">
                                                    <span className="text-lg font-bold text-blue-500">PT</span>
                                                </div>
                                                <span className="text-xs text-gray-500">Paytm</span>
                                            </div>
                                            <div className="text-center">
                                                <div className="w-12 h-12 bg-white rounded-xl shadow flex items-center justify-center mx-auto mb-1">
                                                    <i className="fas fa-mobile-alt text-gray-600"></i>
                                                </div>
                                                <span className="text-xs text-gray-500">Any UPI</span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-purple-500">
                                            <i className="fas fa-info-circle mr-1"></i>
                                            Scan with any UPI app to pay directly to seller's mobile number
                                        </p>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'online' && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <p className="text-sm text-blue-700 font-medium mb-2">
                                        <i className="fas fa-info-circle mr-1"></i>Online Payment
                                    </p>
                                    <p className="text-sm text-blue-600">You will be redirected to secure payment gateway after order confirmation.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right - Order Summary */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                                Order Summary
                            </h2>

                            {/* Items */}
                            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                {cartItems.map((item) => {
                                    const itemPrice = Number(item.price) || 0;
                                    const itemQty = Number(item.quantity) || 0;
                                    return (
                                        <div key={item._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <i className="fas fa-seedling text-green-500"></i>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-800 text-sm truncate">{item.name}</p>
                                                <p className="text-xs text-gray-500">₹{itemPrice} × {itemQty} {item.unit || 'kg'}</p>
                                            </div>
                                            <p className="font-bold text-gray-800 text-sm">₹{itemPrice * itemQty}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Totals */}
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">₹{subtotal}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Fee</span>
                                    <span className="font-semibold">{deliveryFee === 0 ? <span className="text-green-600">FREE</span> : `₹${deliveryFee}`}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Payment</span>
                                    <span className="font-semibold capitalize">
                                        {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'upi' ? 'UPI / QR' : 'Online Banking'}
                                    </span>
                                </div>
                                <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-800">
                                    <span>Total</span>
                                    <span className="text-green-600">₹{total}</span>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <button
                                onClick={handlePlaceOrder}
                                disabled={placing}
                                className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {placing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2"></div>
                                        Placing Order...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-check-circle mr-2"></i>
                                        Place Order — ₹{total}
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-400 text-center mt-3">
                                <i className="fas fa-shield-alt mr-1"></i>Your payment information is secure
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
