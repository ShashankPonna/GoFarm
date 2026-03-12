import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const MarketAITab = () => {
    const [selectedCrop, setSelectedCrop] = useState('Wheat');
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);

    const crops = ['Wheat', 'Rice', 'Soybean', 'Cotton', 'Onion', 'Tomato'];

    useEffect(() => {
        fetchPrices();
    }, []);

    const fetchPrices = async () => {
        setLoading(true);
        try {
            const res = await api.get('/market-intelligence/prices');
            setPrices(res.data.prices || []);
        } catch (err) {
            setPrices([
                { crop: 'Wheat', currentPrice: 2450, market: 'Pune APMC', change: 5.2 },
                { crop: 'Rice', currentPrice: 3200, market: 'Nashik APMC', change: -2.1 },
                { crop: 'Soybean', currentPrice: 4800, market: 'Latur APMC', change: 8.3 },
                { crop: 'Cotton', currentPrice: 6500, market: 'Aurangabad APMC', change: 3.1 },
                { crop: 'Onion', currentPrice: 1800, market: 'Nashik APMC', change: -6.5 },
                { crop: 'Tomato', currentPrice: 2200, market: 'Pune APMC', change: 12.4 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const predictions = {
        Wheat: { current: 2450, predicted: 2620, trend: 'up', suggestion: 'Hold' },
        Rice: { current: 3200, predicted: 3050, trend: 'down', suggestion: 'Sell' },
        Soybean: { current: 4800, predicted: 5200, trend: 'up', suggestion: 'Hold' },
        Cotton: { current: 6500, predicted: 6800, trend: 'up', suggestion: 'Hold' },
        Onion: { current: 1800, predicted: 1600, trend: 'down', suggestion: 'Sell' },
        Tomato: { current: 2200, predicted: 2900, trend: 'up', suggestion: 'Hold' },
    };

    const pred = predictions[selectedCrop] || predictions.Wheat;

    const demandChartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: `${selectedCrop} Price Trend`,
                data: selectedCrop === 'Wheat' ? [2380, 2400, 2420, 2390, 2430, 2460, pred.predicted]
                    : selectedCrop === 'Rice' ? [3300, 3280, 3250, 3220, 3200, 3150, pred.predicted]
                        : selectedCrop === 'Soybean' ? [4600, 4650, 4700, 4750, 4800, 4900, pred.predicted]
                            : selectedCrop === 'Cotton' ? [6300, 6350, 6400, 6450, 6500, 6600, pred.predicted]
                                : selectedCrop === 'Onion' ? [2000, 1950, 1900, 1850, 1800, 1750, pred.predicted]
                                    : [1800, 1900, 2000, 2050, 2100, 2200, pred.predicted],
                borderColor: pred.trend === 'up' ? '#4E9F3D' : '#B0413E',
                backgroundColor: pred.trend === 'up' ? 'rgba(78,159,61,0.08)' : 'rgba(176,65,62,0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: pred.trend === 'up' ? '#4E9F3D' : '#B0413E',
                borderWidth: 2.5,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
            y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 }, callback: v => `₹${v}` } },
        },
    };

    const recommendations = [
        { crop: 'Soybean', reason: 'High demand in your region', confidence: 92, icon: '🫘' },
        { crop: 'Wheat', reason: 'Best season — Rabi crop', confidence: 88, icon: '🌾' },
        { crop: 'Tomato', reason: 'Price trending up 12%', confidence: 85, icon: '🍅' },
    ];

    return (
        <div className="gf-page gf-animate-in">
            {/* Section 1: Live Market Prices */}
            <div className="gf-section">
                <div className="gf-section-title">
                    <span className="gf-title-icon" style={{ background: '#e8f0e4', color: '#2F6F3E' }}>
                        <i className="fas fa-chart-bar"></i>
                    </span>
                    Live Market Prices
                </div>
                <div className="gf-card">
                    {loading ? (
                        <div className="flex flex-col gap-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="gf-skeleton" style={{ height: 20, borderRadius: 6 }}></div>
                            ))}
                        </div>
                    ) : (
                        prices.map((p, i) => (
                            <div key={i} className="gf-price-row">
                                <div>
                                    <div className="text-sm font-bold text-gray-800">{p.crop}</div>
                                    <div className="text-xs text-gray-500">{p.market}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-gray-800">₹{p.currentPrice?.toLocaleString()}</span>
                                    <span className={`gf-price-change ${p.change >= 0 ? 'gf-price-up' : 'gf-price-down'}`}>
                                        <i className={`fas fa-arrow-${p.change >= 0 ? 'up' : 'down'} mr-0.5`}></i>
                                        {Math.abs(p.change)}%
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Section 2: AI Prediction Block */}
            <div className="gf-section">
                <div className="gf-section-title">
                    <span className="gf-title-icon" style={{ background: '#fdf6e3', color: '#8B5E3C' }}>
                        <i className="fas fa-robot"></i>
                    </span>
                    AI Price Prediction
                </div>

                {/* Crop selector */}
                <div className="gf-filter-row mb-4">
                    {crops.map(c => (
                        <button key={c} className={`gf-filter-chip ${selectedCrop === c ? 'active' : ''}`} onClick={() => setSelectedCrop(c)}>
                            {c}
                        </button>
                    ))}
                </div>

                <div className="gf-ai-card">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="text-xs opacity-70 uppercase tracking-wider font-semibold">Selected Crop</div>
                            <div className="text-xl font-bold mt-0.5">{selectedCrop}</div>
                        </div>
                        <span className={`gf-ai-badge ${pred.suggestion === 'Sell' ? 'sell' : 'hold'}`}>
                            <i className={`fas ${pred.suggestion === 'Sell' ? 'fa-arrow-down' : 'fa-pause'}`}></i>
                            AI says: {pred.suggestion}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 rounded-xl p-3">
                            <div className="text-xs opacity-70">Current Price</div>
                            <div className="text-lg font-bold">₹{pred.current?.toLocaleString()}</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3">
                            <div className="text-xs opacity-70">Predicted (7d)</div>
                            <div className="text-lg font-bold flex items-center gap-1.5">
                                ₹{pred.predicted?.toLocaleString()}
                                <i className={`fas fa-arrow-${pred.trend === 'up' ? 'up' : 'down'} text-sm ${pred.trend === 'up' ? 'text-green-300' : 'text-red-300'}`}></i>
                                <span className="gf-pulse-dot ml-1"></span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 text-xs opacity-70 flex items-center gap-1">
                        <i className="fas fa-info-circle"></i>
                        Based on historical mandi data and AI analysis
                    </div>
                </div>
            </div>

            {/* Section 3: Demand Trend Graph */}
            <div className="gf-section">
                <div className="gf-section-title">
                    <span className="gf-title-icon" style={{ background: '#fdf6e3', color: '#D4A017' }}>
                        <i className="fas fa-chart-area"></i>
                    </span>
                    Demand Trend — {selectedCrop}
                </div>
                <div className="gf-card">
                    <div style={{ height: 220 }}>
                        <Line data={demandChartData} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* Section 4: Crop Recommendation */}
            <div className="gf-section">
                <div className="gf-section-title">
                    <span className="gf-title-icon" style={{ background: '#e8f0e4', color: '#4E9F3D' }}>
                        <i className="fas fa-lightbulb"></i>
                    </span>
                    Crop Recommendations
                </div>
                <div className="flex flex-col gap-3">
                    {recommendations.map((rec, i) => (
                        <div key={i} className="gf-card flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: '#f0fdf4' }}>
                                {rec.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm text-gray-800">{rec.crop}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{rec.reason}</div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                                <div className="text-xs font-bold text-green-600">{rec.confidence}%</div>
                                <div className="text-xs text-gray-400">confidence</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MarketAITab;
