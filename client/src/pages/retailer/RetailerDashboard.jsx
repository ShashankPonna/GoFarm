import { Link, useLocation } from 'react-router-dom';

const RetailerDashboard = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="pb-20">
      {/* Header */}
      <header className="bg-transparent text-[#2E7D32] sticky top-0 z-50 py-4 px-2 backdrop-blur-md">
        <div className="container mx-auto p-4 bg-white/80 rounded-[24px] shadow-sm border border-white/50">
          <h1 className="text-3xl font-bold flex items-center">
            <i className="fas fa-store mr-3 text-[#4CAF50]"></i>
            <span className="text-[#2E7D32]">Retailer</span> <span className="text-[#FFC107] ml-2">Dashboard</span>
          </h1>
          <p className="text-[#555] font-medium mt-1">Manage your retail business efficiently</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/retailer/products" className="card border-t-[6px] border-[#FFC107] group">
            <div className="w-[70px] h-[70px] bg-[#FFF8E1] rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-inner">
              <i className="fas fa-box-open text-[#FFC107] text-3xl"></i>
            </div>
            <h3 className="text-xl font-extrabold text-[#2E7D32] mb-2 tracking-tight">Products</h3>
            <p className="text-[#555] text-sm font-medium">Browse and order products from farmers</p>
          </Link>

          <Link to="/retailer/inventory" className="card border-t-[6px] border-[#42A5F5] group">
            <div className="w-[70px] h-[70px] bg-[#E3F2FD] rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-inner">
              <i className="fas fa-warehouse text-[#42A5F5] text-3xl"></i>
            </div>
            <h3 className="text-xl font-extrabold text-[#2E7D32] mb-2 tracking-tight">Inventory</h3>
            <p className="text-[#555] text-sm font-medium">Manage your stock and inventory</p>
          </Link>

          <Link to="/orders" className="card border-t-[6px] border-[#4CAF50] group">
            <div className="w-[70px] h-[70px] bg-[#E8F5E9] rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-inner">
              <i className="fas fa-clipboard-list text-[#4CAF50] text-3xl"></i>
            </div>
            <h3 className="text-xl font-extrabold text-[#2E7D32] mb-2 tracking-tight">Orders</h3>
            <p className="text-[#555] text-sm font-medium">View and manage your orders</p>
          </Link>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-nav border-t border-gray-100 z-50 rounded-t-[30px] px-2 pb-2 pt-1">
        <div className="flex justify-around py-3 max-w-lg mx-auto">
          <Link
            to="/retailer/dashboard"
            className={`flex flex-col items-center transition-all ${isActive('/retailer/dashboard') ? 'text-orange-600' : 'text-gray-500 hover:text-orange-600'
              }`}
          >
            <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-1 transition-all ${isActive('/retailer/dashboard')
              ? 'bg-orange-100 scale-110'
              : 'bg-gray-100 hover:bg-orange-50'
              }`}>
              <i className="fas fa-home text-xl"></i>
            </div>
            <span className="text-xs font-semibold">Home</span>
          </Link>

          <Link
            to="/retailer/community"
            className={`flex flex-col items-center transition-all ${isActive('/retailer/community') ? 'text-orange-600' : 'text-gray-500 hover:text-orange-600'
              }`}
          >
            <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-1 transition-all ${isActive('/retailer/community')
              ? 'bg-orange-100 scale-110'
              : 'bg-gray-100 hover:bg-orange-50'
              }`}>
              <i className="fas fa-edit text-xl"></i>
            </div>
            <span className="text-xs font-semibold">Posts</span>
          </Link>

          <Link
            to="/chat"
            className={`flex flex-col items-center transition-all ${isActive('/chat') ? 'text-orange-600' : 'text-gray-500 hover:text-orange-600'
              }`}
          >
            <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-1 transition-all ${isActive('/chat')
              ? 'bg-orange-100 scale-110'
              : 'bg-gray-100 hover:bg-orange-50'
              }`}>
              <i className="fas fa-comments text-xl"></i>
            </div>
            <span className="text-xs font-semibold">Chat</span>
          </Link>

          <Link
            to="/profile"
            className={`flex flex-col items-center transition-all ${isActive('/profile') ? 'text-orange-600' : 'text-gray-500 hover:text-orange-600'
              }`}
          >
            <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-1 transition-all ${isActive('/profile')
              ? 'bg-orange-100 scale-110'
              : 'bg-gray-100 hover:bg-orange-50'
              }`}>
              <i className="fas fa-user text-xl"></i>
            </div>
            <span className="text-xs font-semibold">Account</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default RetailerDashboard;
