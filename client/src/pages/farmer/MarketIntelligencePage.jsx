import React, { useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { API_URL } from '../../utils/api';

const MarketIntelligencePage = () => {
    const [crop, setCrop] = useState('');
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [intelligence, setIntelligence] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fetchingData, setFetchingData] = useState(false);
    const [fetchMessage, setFetchMessage] = useState('');

    // Exact crops from mandiCronJob.js
    const availableCrops = ['Rice', 'Wheat', 'Onion', 'Tomato', 'Potato', 'Cotton', 'Sugarcane', 'Maize', 'Groundnut', 'Soybean'];

    // Exact state → district mapping from mandiCronJob.js
    const stateDistrictMap = {
        'Maharashtra': ['Nashik', 'Pune', 'Dhule', 'Ahmednagar', 'Solapur', 'Kolhapur', 'Nagpur', 'Aurangabad', 'Satara', 'Sangli'],
        'Karnataka': ['Belagavi', 'Bengaluru', 'Mysuru', 'Hubballi', 'Davanagere'],
        'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Ujjain', 'Gwalior'],
        'Gujarat': ['Ahmedabad', 'Rajkot', 'Surat', 'Vadodara', 'Bhavnagar'],
        'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur', 'Bikaner'],
        'Uttar Pradesh': ['Lucknow', 'Agra', 'Kanpur', 'Varanasi', 'Meerut'],
        'Punjab': ['Ludhiana', 'Amritsar', 'Patiala', 'Jalandhar', 'Bathinda'],
        'Haryana': ['Karnal', 'Hisar', 'Rohtak', 'Ambala', 'Sirsa'],
        'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Erode'],
        'Andhra Pradesh': ['Guntur', 'Kurnool', 'Vijayawada', 'Anantapur', 'Nellore'],
    };

    const availableStates = Object.keys(stateDistrictMap).sort();
    const availableDistricts = state ? (stateDistrictMap[state] || []) : [];


    const fetchMandiData = async () => {
        setFetchingData(true);
        setFetchMessage('');
        try {
            const res = await fetch(`${API_URL}/market/fetch`, { method: 'POST' });
            const data = await res.json();
            if (data.success && (data.saved > 0 || data.skipped > 0)) {
                setFetchMessage(`✅ Fetched ${data.saved || 0} new records (${data.skipped || 0} duplicates skipped)`);
            } else {
                setFetchMessage(`⚠️ ${data.message || 'No data returned. Check your DATA_GOV_API_KEY in .env'}`);
            }
        } catch (err) {
            setFetchMessage('❌ Failed to fetch data. Make sure the server is running.');
        } finally { setFetchingData(false); }
    };

    const fetchIntelligence = async () => {
        if (!crop) { setError('Please enter or select a crop name'); return; }
        setLoading(true); setError(''); setIntelligence(null);
        try {
            const params = new URLSearchParams({ crop });
            if (state) params.append('state', state);
            if (district) params.append('district', district);
            const res = await fetch(`${API_URL}/market/intelligence?${params.toString()}`);
            const data = await res.json();
            if (data.success) { setIntelligence(data.data); }
            else { setError(data.message || 'No data found for this crop'); }
        } catch (err) {
            setError('Failed to fetch market intelligence. Please try again.');
        } finally { setLoading(false); }
    };

    const getTrendIcon = (t) => t === 'up' ? '📈' : t === 'down' ? '📉' : '➡️';
    const getTrendColor = (t) => t === 'up' ? '#16a34a' : t === 'down' ? '#dc2626' : '#ca8a04';

    const getVolatilityColor = (v) => {
        if (v === 'Low') return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-400' };
        if (v === 'Medium') return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-400' };
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-400' };
    };

    const getRiskColor = (r) => {
        if (r === 'Low') return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500', gradient: 'from-green-50 to-emerald-50' };
        if (r === 'Medium') return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-500', gradient: 'from-yellow-50 to-amber-50' };
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-500', gradient: 'from-red-50 to-rose-50' };
    };

    const getActionColor = (a) => a === 'sell' ? 'from-red-500 to-orange-500' : 'from-green-500 to-emerald-500';

    const formatChartData = (cd) => {
        if (!cd) return [];
        return cd.map(item => ({
            ...item,
            date: new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
            price: item.price
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-green-700 via-emerald-700 to-teal-700 text-white p-4 shadow-xl">
                <div className="container mx-auto flex items-center">
                    <button onClick={() => window.history.back()} className="mr-4 hover:bg-white/20 p-2 rounded-full transition">
                        <i className="fas fa-arrow-left text-xl"></i>
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <i className="fas fa-chart-line"></i> Market Intelligence
                        </h1>
                        <p className="text-sm text-green-200">Volatility & Best Selling Window Analysis</p>
                    </div>
                    <button
                        onClick={fetchMandiData}
                        disabled={fetchingData}
                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {fetchingData ? (
                            <><i className="fas fa-spinner fa-spin"></i> Fetching...</>
                        ) : (
                            <><i className="fas fa-download"></i> Fetch Latest Data</>
                        )}
                    </button>
                </div>
            </header>

            {/* Fetch Status Message */}
            {fetchMessage && (
                <div className="container mx-auto px-4 mt-4 max-w-4xl">
                    <div className={`p-3 rounded-xl text-sm font-medium ${fetchMessage.startsWith('✅') ? 'bg-green-100 text-green-700' : fetchMessage.startsWith('⚠️') ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {fetchMessage}
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 py-6 max-w-4xl">
                {/* Input Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-green-100">
                    <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                        <i className="fas fa-search text-green-600"></i> Search Crop Intelligence
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Crop Name *</label>
                            <select value={crop} onChange={(e) => setCrop(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50">
                                <option value="">Select crop...</option>
                                {availableCrops.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                            <select value={state} onChange={(e) => { setState(e.target.value); setDistrict(''); }}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50">
                                <option value="">All States</option>
                                {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">District</label>
                            <select value={district} onChange={(e) => setDistrict(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50">
                                <option value="">{state ? 'All Districts' : 'Select state first'}</option>
                                {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    <button onClick={fetchIntelligence} disabled={loading}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? (<><i className="fas fa-spinner fa-spin"></i> Analyzing...</>) : (<><i className="fas fa-chart-line"></i> Get Market Intelligence</>)}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-6">
                        <div className="flex items-center">
                            <i className="fas fa-exclamation-circle text-red-500 text-xl mr-3"></i>
                            <div>
                                <p className="text-red-700 font-medium">{error}</p>
                                <p className="text-red-500 text-sm mt-1">Click "Fetch Latest Data" in the header to load mandi prices first.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results */}
                {intelligence && (
                    <div className="space-y-6">
                        {/* Top Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-2xl shadow-lg p-5 border-t-4 border-green-500">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Current Price</p>
                                <p className="text-2xl font-extrabold text-green-700">₹{intelligence.currentPrice?.toLocaleString()}</p>
                                <p className="text-xs text-gray-400 mt-1">per quintal</p>
                            </div>
                            <div className="bg-white rounded-2xl shadow-lg p-5 border-t-4 border-blue-500">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">7-Day Average</p>
                                <p className="text-2xl font-extrabold text-blue-700">₹{intelligence.sevenDayAverage?.toLocaleString()}</p>
                                <p className="text-xs text-gray-400 mt-1">{intelligence.dataPoints} data points</p>
                            </div>
                            <div className="bg-white rounded-2xl shadow-lg p-5 border-t-4" style={{ borderColor: getTrendColor(intelligence.trend) }}>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Price Trend</p>
                                <p className="text-2xl font-extrabold" style={{ color: getTrendColor(intelligence.trend) }}>
                                    {getTrendIcon(intelligence.trend)} {intelligence.trend?.toUpperCase()}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{intelligence.changePercent > 0 ? '+' : ''}{intelligence.changePercent}%</p>
                            </div>
                            <div className="bg-white rounded-2xl shadow-lg p-5 border-t-4 border-purple-500">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Data Points</p>
                                <p className="text-2xl font-extrabold text-purple-700">{intelligence.dataPoints}</p>
                                <p className="text-xs text-gray-400 mt-1">records analyzed</p>
                            </div>
                        </div>

                        {/* Volatility & Risk Badges */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`bg-white rounded-2xl shadow-lg p-5 border-l-4 ${getVolatilityColor(intelligence.volatility).border}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Volatility Score</p>
                                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold ${getVolatilityColor(intelligence.volatility).bg} ${getVolatilityColor(intelligence.volatility).text}`}>
                                            {intelligence.volatility === 'High' && <i className="fas fa-bolt mr-1"></i>}
                                            {intelligence.volatility === 'Medium' && <i className="fas fa-wave-square mr-1"></i>}
                                            {intelligence.volatility === 'Low' && <i className="fas fa-check-circle mr-1"></i>}
                                            {intelligence.volatility}
                                        </span>
                                        <p className="text-xs text-gray-400 mt-2">CV: {intelligence.coefficientOfVariation}% | StdDev: ₹{intelligence.stdDeviation}</p>
                                    </div>
                                    <div className="text-4xl">{intelligence.volatility === 'High' ? '⚡' : intelligence.volatility === 'Medium' ? '⚠️' : '✅'}</div>
                                </div>
                            </div>
                            <div className={`bg-white rounded-2xl shadow-lg p-5 border-l-4 ${getRiskColor(intelligence.riskLevel).border}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Risk Level</p>
                                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold ${getRiskColor(intelligence.riskLevel).bg} ${getRiskColor(intelligence.riskLevel).text}`}>
                                            {intelligence.riskLevel === 'High' && <i className="fas fa-exclamation-triangle mr-1"></i>}
                                            {(intelligence.riskLevel === 'Medium' || intelligence.riskLevel === 'Low') && <i className="fas fa-shield-alt mr-1"></i>}
                                            {intelligence.riskLevel} Risk
                                        </span>
                                        <p className="text-xs text-gray-400 mt-2">Based on trend + volatility analysis</p>
                                    </div>
                                    <div className="text-4xl">{intelligence.riskLevel === 'High' ? '🔴' : intelligence.riskLevel === 'Medium' ? '🟡' : '🟢'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Best Selling Window */}
                        <div className={`bg-gradient-to-r ${getActionColor(intelligence.sellAction)} rounded-2xl shadow-xl p-6 text-white`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/80 uppercase tracking-wider font-semibold mb-1">🕐 Best Selling Window</p>
                                    <p className="text-3xl font-extrabold">{intelligence.bestSellingWindow}</p>
                                    <p className="text-sm text-white/90 mt-2 font-medium">
                                        Action: {intelligence.sellAction === 'sell' ? '🔔 SELL NOW' : '⏳ HOLD'}
                                    </p>
                                </div>
                                <div className="text-6xl opacity-50">{intelligence.sellAction === 'sell' ? '💰' : '⏳'}</div>
                            </div>
                        </div>

                        {/* Recommendation */}
                        <div className={`bg-gradient-to-r ${getRiskColor(intelligence.riskLevel).gradient} rounded-2xl shadow-lg p-6 border-l-4 ${getRiskColor(intelligence.riskLevel).border}`}>
                            <div className="flex items-start gap-3">
                                <div className="text-3xl mt-1">💡</div>
                                <div>
                                    <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">Recommendation</p>
                                    <p className="text-gray-800 font-medium text-lg leading-relaxed">{intelligence.recommendation}</p>
                                </div>
                            </div>
                        </div>

                        {/* 7-Day Price Chart */}
                        {intelligence.chartData && intelligence.chartData.length > 1 && (
                            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <i className="fas fa-chart-area text-green-600"></i> 7-Day Price Trend
                                </h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <AreaChart data={formatChartData(intelligence.chartData)} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                            <defs>
                                                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={getTrendColor(intelligence.trend)} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={getTrendColor(intelligence.trend)} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} />
                                            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '12px' }}
                                                formatter={(value) => [`₹${value?.toLocaleString()}`, 'Price']}
                                                labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                                            />
                                            <Area type="monotone" dataKey="price" stroke={getTrendColor(intelligence.trend)} strokeWidth={3}
                                                fill="url(#priceGradient)"
                                                dot={{ r: 4, fill: getTrendColor(intelligence.trend), strokeWidth: 2, stroke: '#fff' }}
                                                activeDot={{ r: 6, fill: getTrendColor(intelligence.trend), strokeWidth: 2, stroke: '#fff' }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Metadata Footer */}
                        <div className="bg-white/60 rounded-xl p-4 text-center text-xs text-gray-400">
                            <p>
                                Data: {intelligence.cropName} | {intelligence.district || 'All Districts'}, {intelligence.state || 'All States'} |
                                Last Updated: {intelligence.lastUpdated ? new Date(intelligence.lastUpdated).toLocaleDateString('en-IN') : 'N/A'} |
                                Source: Agmarknet (data.gov.in)
                            </p>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!intelligence && !loading && !error && (
                    <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
                        <div className="text-6xl mb-4">📊</div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Market Intelligence</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-4">
                            Select a crop and optionally a state/district to get price trend analysis,
                            volatility scores, risk levels, and selling window recommendations.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketIntelligencePage;
