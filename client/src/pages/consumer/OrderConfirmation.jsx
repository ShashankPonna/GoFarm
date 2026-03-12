import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const OrderConfirmation = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [order, setOrder] = useState(location.state?.order || null);
    const [receipt, setReceipt] = useState(location.state?.receipt || null);
    const [loading, setLoading] = useState(!order);

    useEffect(() => {
        if (!order && id) {
            fetchOrder();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await ordersAPI.getById(id);
            setOrder(response.data.order);
            // Build receipt from order
            setReceipt({
                orderNumber: response.data.order.orderNumber,
                buyer: response.data.order.buyer,
                seller: response.data.order.seller,
                items: response.data.order.items,
                subtotal: response.data.order.subtotal,
                deliveryFee: response.data.order.deliveryFee,
                total: response.data.order.total,
                paymentMethod: response.data.order.paymentMethod,
                paymentStatus: response.data.order.paymentStatus,
                status: response.data.order.status,
                createdAt: response.data.order.createdAt,
            });
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('Failed to load order');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const getPaymentIcon = (method) => {
        switch (method) {
            case 'upi': return 'fa-mobile-alt';
            case 'online': return 'fa-university';
            default: return 'fa-money-bill-wave';
        }
    };

    const getPaymentLabel = (method) => {
        switch (method) {
            case 'upi': return 'UPI Payment';
            case 'online': return 'Online Banking';
            default: return 'Cash on Delivery';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700';
            case 'processing': return 'bg-blue-100 text-blue-700';
            case 'shipped': return 'bg-purple-100 text-purple-700';
            case 'delivered': return 'bg-emerald-100 text-emerald-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading order...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <i className="fas fa-exclamation-triangle text-6xl text-yellow-400 mb-4"></i>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
                    <button onClick={() => navigate('/orders')} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition mt-4">
                        View All Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-green-700 to-emerald-700 text-white py-4 px-6 shadow-lg print:hidden">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <button onClick={() => navigate('/orders')} className="mr-4 hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
                            <i className="fas fa-arrow-left text-xl"></i>
                        </button>
                        <h1 className="text-xl font-bold">Order Confirmation</h1>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition"
                    >
                        <i className="fas fa-print mr-2"></i>Print Receipt
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Success Banner */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-8 mb-8 text-center shadow-xl print:shadow-none print:rounded-none print:bg-green-600">
                    <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-check text-4xl"></i>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Order Placed Successfully!</h2>
                    <p className="text-green-100 text-lg">Thank you for your purchase</p>
                    <p className="bg-white bg-opacity-20 inline-block px-6 py-2 rounded-full mt-4 font-mono font-bold text-lg">
                        {receipt?.orderNumber || order.orderNumber}
                    </p>
                </div>

                {/* Receipt Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none" id="receipt">
                    {/* Receipt Header */}
                    <div className="bg-gray-50 border-b px-8 py-6">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                                    <i className="fas fa-receipt text-green-600 mr-3"></i>
                                    Order Receipt
                                </h3>
                                <p className="text-gray-500 mt-1">
                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                        year: 'numeric', month: 'long', day: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <div className="mt-3 md:mt-0 flex items-center gap-3">
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${order.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {order.paymentStatus === 'completed' ? 'Paid' : 'Payment Pending'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Buyer & Seller */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-green-50 rounded-xl p-5">
                                <h4 className="text-sm font-semibold text-green-700 uppercase mb-2">
                                    <i className="fas fa-user mr-1"></i> Buyer
                                </h4>
                                <p className="font-bold text-gray-800">{order.buyer?.name || 'N/A'}</p>
                                {order.buyer?.phone && <p className="text-gray-600 text-sm"><i className="fas fa-phone mr-1"></i>{order.buyer.phone}</p>}
                                {order.buyer?.customID && <p className="text-gray-600 text-sm"><i className="fas fa-id-card mr-1"></i>{order.buyer.customID}</p>}
                            </div>
                            <div className="bg-blue-50 rounded-xl p-5">
                                <h4 className="text-sm font-semibold text-blue-700 uppercase mb-2">
                                    <i className="fas fa-store mr-1"></i> Seller
                                </h4>
                                <p className="font-bold text-gray-800">{order.seller?.name || 'N/A'}</p>
                                {order.seller?.phone && <p className="text-gray-600 text-sm"><i className="fas fa-phone mr-1"></i>{order.seller.phone}</p>}
                                {order.seller?.customID && <p className="text-gray-600 text-sm"><i className="fas fa-id-card mr-1"></i>{order.seller.customID}</p>}
                            </div>
                        </div>

                        {/* Delivery Address */}
                        {order.deliveryAddress && (
                            <div className="bg-gray-50 rounded-xl p-5 mb-8">
                                <h4 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                                    <i className="fas fa-map-marker-alt mr-1"></i> Delivery Address
                                </h4>
                                <p className="text-gray-800">
                                    {[order.deliveryAddress.address, order.deliveryAddress.city, order.deliveryAddress.state, order.deliveryAddress.pincode]
                                        .filter(Boolean).join(', ')}
                                </p>
                                {order.deliveryAddress.phone && (
                                    <p className="text-gray-600 text-sm mt-1"><i className="fas fa-phone mr-1"></i>{order.deliveryAddress.phone}</p>
                                )}
                            </div>
                        )}

                        {/* Items Table */}
                        <div className="mb-8">
                            <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                                <i className="fas fa-box mr-1"></i> Order Items
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Price</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Qty</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {order.items?.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                                                <td className="px-4 py-3 font-medium text-gray-800">
                                                    {item.product?.name || 'Product'}
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-600">₹{item.price}</td>
                                                <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-gray-800">₹{item.total || item.price * item.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="border-t pt-6">
                            <div className="flex justify-end">
                                <div className="w-72 space-y-2">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-semibold">₹{order.subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Delivery Fee</span>
                                        <span className="font-semibold">{order.deliveryFee === 0 ? <span className="text-green-600">FREE</span> : `₹${order.deliveryFee}`}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Payment Method</span>
                                        <span className="font-semibold flex items-center">
                                            <i className={`fas ${getPaymentIcon(order.paymentMethod)} mr-2`}></i>
                                            {getPaymentLabel(order.paymentMethod)}
                                        </span>
                                    </div>
                                    <div className="border-t pt-3 flex justify-between text-2xl font-bold text-gray-800">
                                        <span>Total</span>
                                        <span className="text-green-600">₹{order.total}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-dashed text-center text-gray-500 text-sm">
                            <p className="font-medium">Thank you for shopping with GOFaRm!</p>
                            <p className="mt-1">For any queries, please contact our support team.</p>
                            <p className="mt-2 text-xs text-gray-400">This is a computer-generated receipt and does not require a signature.</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8 print:hidden">
                    <button
                        onClick={() => navigate('/orders')}
                        className="flex-1 bg-white border-2 border-green-600 text-green-700 font-bold py-3 rounded-xl hover:bg-green-50 transition flex items-center justify-center"
                    >
                        <i className="fas fa-list mr-2"></i>View All Orders
                    </button>
                    <button
                        onClick={() => navigate(-3)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center shadow-lg"
                    >
                        <i className="fas fa-shopping-bag mr-2"></i>Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
