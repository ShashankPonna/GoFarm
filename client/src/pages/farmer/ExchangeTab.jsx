import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { exchangeAPI } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';

const ExchangeTab = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [exchanges, setExchanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();

    const categories = ['All', 'Crops', 'Equipment', 'Seeds', 'Others'];

    useEffect(() => {
        fetchExchanges();
    }, []);

    const fetchExchanges = async () => {
        setLoading(true);
        try {
            const response = await exchangeAPI.getOpen();
            setExchanges(response.data.exchanges || []);
        } catch (err) {
            console.error('Exchanges fetch error:', err);
            toast.error('Failed to fetch exchanges');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (exchangeID) => {
        if (!window.confirm('Are you sure you want to accept this exchange offer?')) return;
        
        try {
            await exchangeAPI.accept(exchangeID);
            toast.success('Exchange accepted successfully!');
            fetchExchanges(); // Refresh list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to accept exchange');
        }
    };

    const filtered = activeCategory === 'All'
        ? exchanges
        : exchanges.filter(e => (e.category || 'Crops') === activeCategory);

    const getCategoryIcon = (cat) => {
        switch (cat) {
            case 'Crops': return '🌾';
            case 'Equipment': return '🔧';
            case 'Seeds': return '🌱';
            default: return '📦';
        }
    };

    return (
        <div className="gf-page gf-animate-in min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-green-600 text-white p-6 rounded-b-[40px] shadow-lg mb-6">
                <BackButton />
                <h1 className="text-2xl font-bold">🔄 Exchange Market</h1>
                <p className="text-green-100 text-sm">Browse open barter offers from other farmers</p>
            </div>

            {/* Post Exchange Button */}
            <div className="gf-section px-4">
                <Link to="/farmer/exchange/new" className="gf-btn-add w-full bg-white shadow-md border-2 border-green-500 text-green-600 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-50 transition-colors">
                    <i className="fas fa-plus-circle text-lg"></i>
                    <span>Post Your Offer</span>
                </Link>
            </div>

            {/* Category Tabs */}
            <div className="gf-section px-4">
                <div className="gf-toggle-row flex gap-2 overflow-x-auto py-2 scrollbar-hide">
                    {categories.map(c => (
                        <button
                            key={c}
                            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === c ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}
                            onClick={() => setActiveCategory(c)}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Exchange Cards */}
            <div className="gf-section px-4">
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                                <div className="flex gap-3 animate-pulse">
                                    <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-100 rounded w-1/2 mb-2"></div>
                                        <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
                        <i className="fas fa-exchange-alt text-5xl text-gray-200 mb-4"></i>
                        <p className="text-gray-500 font-medium">No open exchange offers found</p>
                        <p className="text-gray-400 text-xs mt-1">Check back later or post your own!</p>
                        <Link to="/farmer/exchange/new" className="inline-block mt-6 bg-green-600 text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-green-700 transition-colors">
                            Post New Offer
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filtered.map((item) => (
                            <div key={item.exchangeID} className="bg-white rounded-3xl p-5 shadow-md border border-gray-50 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-3">
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                                            style={{ background: '#f0fdf4' }}
                                        >
                                            {getCategoryIcon(item.category || 'Crops')}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800 text-lg">{item.offeredItem}</div>
                                            <div className="text-xs font-semibold text-green-600 flex items-center">
                                                <i className="fas fa-user-circle mr-1"></i>
                                                {item.requesterName}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-green-50 text-green-700 font-mono text-[10px] px-2 py-1 rounded-lg border border-green-100">
                                        {item.exchangeID}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-blue-50 rounded-2xl p-3 border border-blue-100">
                                        <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Has (Offer)</div>
                                        <div className="text-sm font-bold text-gray-800">{item.offeredQuantity} kg</div>
                                        <div className="text-[10px] text-blue-400">Est. Value: ₹{item.calculatedOfferedValue}</div>
                                    </div>
                                    <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100">
                                        <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">Wants</div>
                                        <div className="text-sm font-bold text-gray-800">{item.requestedItem}</div>
                                        <div className="text-[10px] text-amber-400">{item.requestedQuantity} kg</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                                        <i className="fas fa-history"></i>
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </div>
                                    {item.requesterCustomID === user?.customID ? (
                                        <div className="text-gray-400 font-bold bg-gray-50 py-2 px-6 rounded-xl text-sm border border-gray-100 flex items-center gap-2">
                                            <i className="fas fa-user-circle"></i>
                                            Your Offer
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleAccept(item.exchangeID)}
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl text-sm transition-all shadow-md active:scale-95 flex items-center gap-2"
                                        >
                                            <i className="fas fa-handshake"></i>
                                            Accept Offer
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* My Exchange Requests Shortcuts */}
            <div className="gf-section px-4 mt-8">
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="font-bold text-gray-700">My Activity</h3>
                    <Link to="/farmer/exchanges/sent" className="text-xs font-bold text-green-600">View All</Link>
                </div>
                <div className="flex gap-3">
                    <Link to="/farmer/exchanges/sent" className="bg-white p-4 rounded-3xl flex-1 text-center shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                            <i className="fas fa-paper-plane text-sm"></i>
                        </div>
                        <div className="text-xs font-bold text-gray-600">Sent</div>
                    </Link>
                    <Link to="/farmer/exchanges/received" className="bg-white p-4 rounded-3xl flex-1 text-center shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                            <i className="fas fa-inbox text-sm"></i>
                        </div>
                        <div className="text-xs font-bold text-gray-600">Received</div>
                    </Link>
                    <Link to="/farmer/disputes" className="bg-white p-4 rounded-3xl flex-1 text-center shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                            <i className="fas fa-gavel text-sm"></i>
                        </div>
                        <div className="text-xs font-bold text-gray-600">Disputes</div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ExchangeTab;
