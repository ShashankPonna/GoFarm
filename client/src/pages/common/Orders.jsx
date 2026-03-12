import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return 'fa-check-circle';
      case 'processing': return 'fa-cog fa-spin';
      case 'shipped': return 'fa-truck';
      case 'delivered': return 'fa-box-open';
      case 'cancelled': return 'fa-times-circle';
      default: return 'fa-clock';
    }
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'upi': return 'fa-mobile-alt';
      case 'online': return 'fa-university';
      default: return 'fa-money-bill-wave';
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  const statusFilters = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-700 to-emerald-700 text-white py-4 px-6 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="mr-4 hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <div>
              <h1 className="text-2xl font-bold"><i className="fas fa-clipboard-list mr-2"></i>My Orders</h1>
              <p className="text-green-200 text-sm">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition ${filter === s
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border'
                }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <i className="fas fa-clipboard-list text-gray-300 text-6xl mb-4"></i>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders found</h2>
              <p className="text-gray-600 mb-6">
                {filter !== 'all' ? `No ${filter} orders` : 'Start shopping to see your orders here'}
              </p>
              <button
                onClick={() => navigate(-1)}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                <i className="fas fa-shopping-bag mr-2"></i>Go Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/order-confirmation/${order._id}`)}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer overflow-hidden"
              >
                <div className="flex items-center justify-between p-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono font-bold text-green-700 text-lg">{order.orderNumber}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${getStatusColor(order.status)}`}>
                        <i className={`fas ${getStatusIcon(order.status)} mr-1`}></i>
                        {order.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${order.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {order.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span>
                        <i className="fas fa-calendar mr-1"></i>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </span>
                      <span>
                        <i className="fas fa-box mr-1"></i>
                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                      </span>
                      <span>
                        <i className={`fas ${getPaymentIcon(order.paymentMethod)} mr-1`}></i>
                        {order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod?.toUpperCase()}
                      </span>
                      {order.seller && (
                        <span>
                          <i className="fas fa-store mr-1"></i>
                          {order.seller?.name || 'Seller'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">₹{order.total}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      <i className="fas fa-chevron-right ml-1"></i> View Receipt
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
