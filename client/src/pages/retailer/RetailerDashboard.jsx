import { Link, useLocation } from 'react-router-dom';
import BackButton from '../../components/BackButton';

const RetailerDashboard = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const dashboardItems = [
    { icon: 'fa-box-open', title: 'Products', desc: 'Browse and order from farmers', link: '/retailer/products', color: 'amber' },
    { icon: 'fa-warehouse', title: 'Inventory', desc: 'Manage your stock', link: '/retailer/inventory', color: 'blue' },
    { icon: 'fa-clipboard-list', title: 'Orders', desc: 'View and manage orders', link: '/orders', color: 'green' },
    { icon: 'fa-handshake', title: 'Connections', desc: 'Manage farmer invitations', link: '/retailer/connections', color: 'purple' },
  ];

  const colorMap = {
    green:  { bg: 'bg-green-100',  text: 'text-green-600',  border: '#22c55e' },
    amber:  { bg: 'bg-amber-100',  text: 'text-amber-600',  border: '#f59e0b' },
    blue:   { bg: 'bg-blue-100',   text: 'text-blue-600',   border: '#3b82f6' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: '#a855f7' },
  };

  const getColor = (c) => colorMap[c] || colorMap.green;

  return (
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-amber-100/50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <BackButton />
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-md">
              <i className="fas fa-store text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-800">
                <span className="text-green-700">Retailer</span>{' '}
                <span className="text-amber-500">Dashboard</span>
              </h1>
              <p className="text-xs text-gray-400 font-medium">Manage your retail business</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger">
          {dashboardItems.map((item, index) => {
            const c = getColor(item.color);
            return (
              <Link
                key={index}
                to={item.link}
                className="bg-white rounded-3xl shadow-card hover:shadow-card-hover border border-gray-100/60 p-6 transition-all duration-300 hover:-translate-y-1 group"
                style={{ borderTopWidth: '4px', borderTopColor: c.border }}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${c.bg} transition-transform duration-300 group-hover:scale-110`}>
                    <i className={`fas ${item.icon} text-2xl ${c.text}`}></i>
                  </div>
                  <div>
                    <p className="text-gray-800 font-bold text-[15px]">{item.title}</p>
                    <p className="text-[12px] text-gray-400 font-medium mt-1">{item.desc}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 z-50 shadow-nav">
        <div className="flex justify-around py-2 pb-3 max-w-lg mx-auto">
          <Link
            to="/retailer/dashboard"
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-all ${isActive('/retailer/dashboard') ? 'text-amber-600' : 'text-gray-400 hover:text-amber-600'}`}
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${isActive('/retailer/dashboard') ? 'bg-amber-100 scale-105' : 'hover:bg-gray-50'}`}>
              <i className="fas fa-home text-xl"></i>
            </div>
            <span className="text-[10px] font-bold">Home</span>
          </Link>

          <Link
            to="/profile"
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-all ${isActive('/profile') ? 'text-amber-600' : 'text-gray-400 hover:text-amber-600'}`}
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${isActive('/profile') ? 'bg-amber-100 scale-105' : 'hover:bg-gray-50'}`}>
              <i className="fas fa-user text-xl"></i>
            </div>
            <span className="text-[10px] font-bold">Account</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default RetailerDashboard;
