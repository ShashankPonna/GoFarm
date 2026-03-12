import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const ExchangeTab = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [exchanges, setExchanges] = useState([]);
    const [loading, setLoading] = useState(true);

    const categories = ['All', 'Crops', 'Equipment', 'Seeds', 'Others'];

    useEffect(() => {
        fetchExchanges();
    }, []);

    const fetchExchanges = async () => {
        setLoading(true);
        try {
            const response = await api.get('/exchange');
            setExchanges(response.data.exchanges || response.data || []);
        } catch (err) {
            console.error('Exchanges fetch error:', err);
            setExchanges([
                { _id: '1', itemName: 'Organic Rice (25 kg)', condition: 'Fresh Harvest', quantity: '25 kg', wantInReturn: 'Wheat or Jowar', location: 'Pune', category: 'Crops', type: 'swap' },
                { _id: '2', itemName: 'Tractor Rotavator', condition: 'Good - 2 years old', quantity: '1 unit', wantInReturn: 'Plough set or ₹15,000', location: 'Nashik', category: 'Equipment', type: 'swap_cash' },
                { _id: '3', itemName: 'Soybean Seeds (10 kg)', condition: 'High germination', quantity: '10 kg', wantInReturn: 'Groundnut seeds', location: 'Latur', category: 'Seeds', type: 'swap' },
                { _id: '4', itemName: 'Sugarcane (1 Ton)', condition: 'Ready to harvest', quantity: '1 Ton', wantInReturn: 'Cotton or ₹8,000', location: 'Kolhapur', category: 'Crops', type: 'swap_cash' },
                { _id: '5', itemName: 'Drip Irrigation Kit', condition: 'Used 1 season', quantity: '1 set', wantInReturn: 'Sprinkler set', location: 'Aurangabad', category: 'Equipment', type: 'swap' },
                { _id: '6', itemName: 'Compost (500 kg)', condition: 'Well composted', quantity: '500 kg', wantInReturn: 'Cow dung or seeds', location: 'Sangli', category: 'Others', type: 'swap' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = activeCategory === 'All'
        ? exchanges
        : exchanges.filter(e => e.category === activeCategory);

    const getCategoryIcon = (cat) => {
        switch (cat) {
            case 'Crops': return '🌾';
            case 'Equipment': return '🔧';
            case 'Seeds': return '🌱';
            default: return '📦';
        }
    };

    return (
        <div className="gf-page gf-animate-in">
            {/* Post Exchange Button */}
            <div className="gf-section">
                <Link to="/farmer/exchange/new" className="gf-btn-add">
                    <i className="fas fa-plus-circle text-lg"></i>
                    <span>Post Exchange</span>
                </Link>
            </div>

            {/* Category Tabs */}
            <div className="gf-section">
                <div className="gf-toggle-row">
                    {categories.map(c => (
                        <button
                            key={c}
                            className={`gf-toggle-btn ${activeCategory === c ? 'active' : ''}`}
                            onClick={() => setActiveCategory(c)}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Exchange Cards */}
            <div className="gf-section">
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="gf-card">
                                <div className="flex gap-3">
                                    <div className="gf-skeleton" style={{ width: 56, height: 56, borderRadius: 14 }}></div>
                                    <div className="flex-1">
                                        <div className="gf-skeleton" style={{ width: '70%', height: 14, marginBottom: 8 }}></div>
                                        <div className="gf-skeleton" style={{ width: '50%', height: 12, marginBottom: 6 }}></div>
                                        <div className="gf-skeleton" style={{ width: '40%', height: 12 }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="gf-card text-center py-8">
                        <i className="fas fa-exchange-alt text-4xl text-gray-300 mb-3"></i>
                        <p className="text-gray-500 text-sm font-medium">No exchange posts</p>
                        <Link to="/farmer/exchange/new" className="gf-btn-primary mt-4 text-sm">
                            <i className="fas fa-plus"></i> Post first exchange
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filtered.map((item) => (
                            <div key={item._id} className="gf-card">
                                <div className="flex gap-3">
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                                        style={{ background: '#f0fdf4' }}
                                    >
                                        {getCategoryIcon(item.category)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm text-gray-800 truncate">{item.itemName || item.name}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            <i className="fas fa-check-circle mr-1 text-green-400"></i>
                                            {item.condition || 'Good condition'}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            <i className="fas fa-cubes mr-1 text-amber-400"></i>
                                            Qty: {item.quantity}
                                        </div>
                                    </div>
                                </div>

                                {/* What they want */}
                                <div className="mt-3 p-2.5 rounded-xl" style={{ background: '#fffbeb' }}>
                                    <div className="text-xs font-semibold text-amber-700 mb-0.5">
                                        <i className="fas fa-sync-alt mr-1"></i>Wants in return:
                                    </div>
                                    <div className="text-sm font-medium text-gray-800">{item.wantInReturn || 'Open to offers'}</div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <i className="fas fa-map-marker-alt text-blue-400"></i>
                                        {item.location}
                                    </div>
                                    <div className="flex gap-2">
                                        {item.type === 'swap_cash' && (
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600">
                                                Swap + Cash
                                            </span>
                                        )}
                                        <button className="gf-btn-outline text-xs py-1.5 px-3">
                                            <i className="fas fa-comments"></i> Contact
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* My Exchange Requests */}
            <div className="gf-section">
                <div className="gf-section-title">
                    <span className="gf-title-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                        <i className="fas fa-paper-plane"></i>
                    </span>
                    My Requests
                </div>
                <div className="flex gap-3">
                    <Link to="/farmer/exchanges/sent" className="gf-card-compact flex-1 text-center">
                        <div className="text-xl font-bold text-blue-600 mb-1">3</div>
                        <div className="text-xs font-semibold text-gray-500">Sent</div>
                    </Link>
                    <Link to="/farmer/exchanges/received" className="gf-card-compact flex-1 text-center">
                        <div className="text-xl font-bold text-green-600 mb-1">2</div>
                        <div className="text-xs font-semibold text-gray-500">Received</div>
                    </Link>
                    <Link to="/farmer/disputes" className="gf-card-compact flex-1 text-center">
                        <div className="text-xl font-bold text-red-500 mb-1">0</div>
                        <div className="text-xs font-semibold text-gray-500">Disputes</div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ExchangeTab;
