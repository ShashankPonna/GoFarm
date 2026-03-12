import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const ProductsTab = () => {
    const [activeTab, setActiveTab] = useState('my');
    const [activeFilter, setActiveFilter] = useState('All');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const filters = ['All', 'Grains', 'Vegetables', 'Fruits', 'Spices', 'Pulses'];

    useEffect(() => {
        fetchProducts();
    }, [activeTab]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'my' ? '/products/my-products' : '/products';
            const response = await api.get(endpoint);
            setProducts(response.data.products || response.data || []);
        } catch (err) {
            console.error('Products fetch error:', err);
            // Demo data fallback
            setProducts([
                { _id: '1', name: 'Organic Wheat', quantity: 50, unit: 'kg', price: 2400, location: 'Pune', category: 'Grains', image: null },
                { _id: '2', name: 'Fresh Tomatoes', quantity: 30, unit: 'kg', price: 40, location: 'Nashik', category: 'Vegetables', image: null },
                { _id: '3', name: 'Basmati Rice', quantity: 100, unit: 'kg', price: 6500, location: 'Kolhapur', category: 'Grains', image: null },
                { _id: '4', name: 'Green Chilli', quantity: 15, unit: 'kg', price: 80, location: 'Sangli', category: 'Vegetables', image: null },
                { _id: '5', name: 'Alphonso Mango', quantity: 20, unit: 'dozen', price: 1200, location: 'Ratnagiri', category: 'Fruits', image: null },
                { _id: '6', name: 'Turmeric Powder', quantity: 25, unit: 'kg', price: 150, location: 'Sangli', category: 'Spices', image: null },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = activeFilter === 'All'
        ? products
        : products.filter(p => p.category === activeFilter);

    const getProductEmoji = (name) => {
        const lower = (name || '').toLowerCase();
        if (lower.includes('wheat')) return '🌾';
        if (lower.includes('rice')) return '🍚';
        if (lower.includes('tomato')) return '🍅';
        if (lower.includes('mango')) return '🥭';
        if (lower.includes('chilli') || lower.includes('chili')) return '🌶️';
        if (lower.includes('onion')) return '🧅';
        if (lower.includes('potato')) return '🥔';
        if (lower.includes('turmeric')) return '✨';
        if (lower.includes('sugar')) return '🍬';
        return '🌱';
    };

    const API_BASE = process.env.REACT_APP_API_URL || '';

    return (
        <div className="gf-page gf-animate-in">
            {/* Add Product Button */}
            <div className="gf-section">
                <Link to="/farmer/products" className="gf-btn-add">
                    <i className="fas fa-plus-circle text-lg"></i>
                    <span>Add Product</span>
                </Link>
            </div>

            {/* Toggle Tabs */}
            <div className="gf-section">
                <div className="gf-toggle-row">
                    <button
                        className={`gf-toggle-btn ${activeTab === 'my' ? 'active' : ''}`}
                        onClick={() => setActiveTab('my')}
                    >
                        <i className="fas fa-user mr-1.5"></i>My Products
                    </button>
                    <button
                        className={`gf-toggle-btn ${activeTab === 'marketplace' ? 'active' : ''}`}
                        onClick={() => setActiveTab('marketplace')}
                    >
                        <i className="fas fa-store mr-1.5"></i>Marketplace
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="gf-section">
                <div className="gf-filter-row">
                    {filters.map(f => (
                        <button
                            key={f}
                            className={`gf-filter-chip ${activeFilter === f ? 'active' : ''}`}
                            onClick={() => setActiveFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="gf-section">
                {loading ? (
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="gf-product-card">
                                <div className="gf-skeleton" style={{ width: '100%', height: 140 }}></div>
                                <div className="gf-product-body">
                                    <div className="gf-skeleton" style={{ width: '70%', height: 14, marginBottom: 8 }}></div>
                                    <div className="gf-skeleton" style={{ width: '50%', height: 12 }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="gf-card text-center py-8">
                        <i className="fas fa-box-open text-4xl text-gray-300 mb-3"></i>
                        <p className="text-gray-500 text-sm font-medium">No products found</p>
                        <Link to="/farmer/products" className="gf-btn-primary mt-4 text-sm">
                            <i className="fas fa-plus"></i> Add your first product
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {filteredProducts.map((product) => (
                            <Link
                                key={product._id}
                                to={`/product/${product._id}`}
                                className="gf-product-card block"
                            >
                                <div className="gf-product-img flex items-center justify-center text-5xl" style={{ background: '#f0fdf4' }}>
                                    {product.image ? (
                                        <img
                                            src={product.image.startsWith('http') ? product.image : `${API_BASE}${product.image}`}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>{getProductEmoji(product.name)}</span>
                                    )}
                                </div>
                                <div className="gf-product-body">
                                    <div className="gf-product-name">{product.name}</div>
                                    <div className="gf-product-meta">
                                        <i className="fas fa-weight-hanging text-gray-400"></i>
                                        {product.quantity} {product.unit || 'kg'}
                                    </div>
                                    <div className="gf-product-meta mt-1">
                                        <i className="fas fa-map-marker-alt text-gray-400"></i>
                                        {product.location || 'Local'}
                                    </div>
                                    <div className="gf-product-price">₹{product.price?.toLocaleString()}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Crop Health Check Link */}
            <div className="gf-section">
                <Link to="/farmer/disease-detection" className="gf-card-compact flex items-center gap-3" style={{ background: '#fefce8' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100 text-amber-600 text-lg">
                        <i className="fas fa-leaf"></i>
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-bold text-gray-800">Crop Health Check</div>
                        <div className="text-xs text-gray-500">AI-powered disease detection</div>
                    </div>
                    <i className="fas fa-chevron-right text-gray-400 text-sm"></i>
                </Link>
            </div>
        </div>
    );
};

export default ProductsTab;
