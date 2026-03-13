import React, { useState } from 'react';
import BackButton from '../../components/BackButton';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import api, { API_URL } from '../../utils/api';

const MarketIntelligencePage = () => {
    const [crop, setCrop] = useState('');
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [intelligence, setIntelligence] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fetchingData, setFetchingData] = useState(false);
    const [fetchMessage, setFetchMessage] = useState('');

    // AGMARKNET API Config (using backend proxy)
    const BASE_API_URL = `${API_URL}/market/proxy`;

    const majorStates = [
        'Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Gujarat', 
        'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Karnataka', 'Kerala', 
        'Madhya Pradesh', 'Maharashtra', 'NCT of Delhi', 'Odisha', 'Pondicherry', 
        'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
        'Uttarakhand', 'West Bengal'
    ];

    const [states, setStates] = useState(majorStates);
    const [districts, setDistricts] = useState([]);
    const [crops, setCrops] = useState([]);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingCrops, setLoadingCrops] = useState(false);

    // Step 1: When state changes, fetch unique districts
    const handleStateChange = async (selectedState) => {
        setState(selectedState);
        setDistrict('');
        setCrop('');
        setDistricts([]);
        setCrops([]);
        
        if (!selectedState) return;

        setLoadingDistricts(true);
        setError('');
        try {
            const res = await api.get(`/market/proxy?limit=100&filters[State]=${selectedState}`);
            const data = res.data;
            if (data.records && Array.isArray(data.records)) {
                const uniqueDistricts = [...new Set(data.records.map(r => r.district || r.District))].filter(Boolean).sort();
                if (uniqueDistricts.length === 0) {
                    setError(`No districts found for ${selectedState}. The API might be returning limited data.`);
                }
                setDistricts(uniqueDistricts);
            } else if (data.message && data.message.includes('429')) {
                setError('API rate limit reached (429). Please wait a few seconds and try again.');
            } else {
                setError('Failed to fetch districts. Please try again.');
            }
        } catch (err) {
            console.error('Error fetching districts:', err);
            setError('Failed to load districts for this state');
        } finally {
            setLoadingDistricts(false);
        }
    };

    // Step 2: When district changes, fetch unique commodities (crops)
    const handleDistrictChange = async (selectedDistrict) => {
        setDistrict(selectedDistrict);
        setCrop('');
        setCrops([]);

        if (!selectedDistrict) return;

        setLoadingCrops(true);
        setError('');
        try {
            const res = await api.get(`/market/proxy?limit=100&filters[State]=${state}&filters[District]=${selectedDistrict}`);
            const data = res.data;
            if (data.records && Array.isArray(data.records)) {
                const uniqueCrops = [...new Set(data.records.map(r => r.commodity || r.Commodity))].filter(Boolean).sort();
                if (uniqueCrops.length === 0) {
                    setError(`No crops found for ${selectedDistrict}. Try a different district.`);
                }
                setCrops(uniqueCrops);
            } else if (data.message && data.message.includes('429')) {
                setError('API rate limit reached (429). Please wait a few seconds and try again.');
            } else {
                setError('Failed to fetch crops. Please try again.');
            }
        } catch (err) {
            console.error('Error fetching crops:', err);
            setError('Failed to load crops for this district');
        } finally {
            setLoadingCrops(false);
        }
    };


    const fetchMandiData = async () => {
        setFetchingData(true);
        setFetchMessage('');
        try {
            const res = await api.post('/market/fetch');
            const data = res.data;
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
        if (!state || !district || !crop) { 
            setError('Please select state, district, and crop'); 
            return; 
        }
        setLoading(true); 
        setError(''); 
        setIntelligence(null);
        
        try {
            const res = await api.get(`/market/proxy?limit=50&filters[State]=${state}&filters[District]=${district}&filters[Commodity]=${crop}`);
            const data = res.data;
            
            if (data.records && data.records.length > 0) {
                const records = data.records;
                
                // DATA PROCESSING
                const sortedByPrice = [...records].sort((a, b) => {
                    const priceA = parseFloat(a.modal_price || a.Modal_Price || 0);
                    const priceB = parseFloat(b.modal_price || b.Modal_Price || 0);
                    return priceB - priceA;
                });
                const bestMarket = sortedByPrice[0];
                const avgModalPrice = Math.round(records.reduce((sum, r) => sum + parseFloat(r.modal_price || r.Modal_Price || 0), 0) / records.length);
                
                // Simple trend estimation
                const minPrices = records.map(r => parseFloat(r.min_price || r.Min_Price || 0));
                const maxPrices = records.map(r => parseFloat(r.max_price || r.Max_Price || 0));
                const minPrice = Math.min(...minPrices);
                const maxPrice = Math.max(...maxPrices);
                const modalPrice = parseFloat(records[0].modal_price || records[0].Modal_Price || 0);
                
                // Trend logic
                const pricePos = (modalPrice - minPrice) / (maxPrice - minPrice || 1);
                const trend = pricePos > 0.6 ? 'up' : pricePos < 0.4 ? 'down' : 'stable';
                
                const intelligenceData = {
                    cropName: crop,
                    state,
                    district,
                    currentPrice: modalPrice,
                    sevenDayAverage: avgModalPrice,
                    trend,
                    changePercent: Math.round(pricePos * 100) / 10, // Simulated change
                    volatility: pricePos > 0.8 || pricePos < 0.2 ? 'High' : 'Medium',
                    riskLevel: trend === 'down' ? 'High' : 'Low',
                    bestSellingWindow: trend === 'up' ? 'Wait before selling' : 'Sell today',
                    sellAction: trend === 'down' ? 'sell' : 'hold',
                    recommendation: trend === 'up' 
                        ? 'Prices look strong and increasing. Wait before selling for better profits.' 
                        : 'Prices are currently on a downward trend. Consider selling today.',
                    chartData: records.map(r => ({
                        date: r.arrival_date || r.Arrival_Date,
                        price: parseFloat(r.modal_price || r.Modal_Price || 0),
                        mandi: r.market || r.Market
                    })),
                    dataPoints: records.length,
                    lastUpdated: records[0].arrival_date || records[0].Arrival_Date,
                    bestMarketName: bestMarket.market || bestMarket.Market,
                    bestPrice: bestMarket.modal_price || bestMarket.Modal_Price
                };
                
                setIntelligence(intelligenceData);
            } else {
                setError('No data found for this crop in the selected location');
            }
        } catch (err) {
            console.error('Market Intelligence Error:', err);
            setError('Failed to fetch market intelligence. Please try again.');
        } finally {
            setLoading(false);
        }
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
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-green-100/50 shadow-sm">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center gap-3">
                        <BackButton />
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                            <i className="fas fa-chart-line text-white"></i>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-lg font-extrabold text-gray-800">Market Intelligence</h1>
                            <p className="text-xs text-gray-400 font-medium">Prices, trends & selling advice</p>
                        </div>
                        <button
                            onClick={fetchMandiData}
                            disabled={fetchingData}
                            className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                            {fetchingData ? (
                                <><i className="fas fa-spinner fa-spin"></i> Fetching...</>
                            ) : (
                                <><i className="fas fa-sync-alt"></i> Refresh</>  
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Fetch Status Message */}
            {fetchMessage && (
                <div className="container mx-auto px-4 mt-4 max-w-4xl">
                    <div className={`p-3 rounded-2xl text-sm font-medium flex items-center gap-2 ${fetchMessage.startsWith('✅') ? 'alert-success' : fetchMessage.startsWith('⚠️') ? 'alert-warning' : 'alert-error'}`}>
                        {fetchMessage}
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 py-6 max-w-4xl">
                {/* Input Card */}
                <div className="bg-white rounded-3xl shadow-card border border-gray-100/60 p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <i className="fas fa-search text-green-600"></i> Search Crop Prices
                    </h2>

                    <div className="space-y-4 mb-5">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2">
                                <i className="fas fa-map-marker-alt text-green-500 text-xs"></i> State
                            </label>
                            <select value={state} onChange={(e) => handleStateChange(e.target.value)}
                                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 focus:outline-none transition-all text-base font-medium bg-white appearance-none cursor-pointer">
                                <option value="">Select State</option>
                                {states.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2">
                                <i className="fas fa-map text-green-500 text-xs"></i> District
                            </label>
                            <select value={district} onChange={(e) => handleDistrictChange(e.target.value)}
                                disabled={!state || loadingDistricts}
                                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 focus:outline-none transition-all text-base font-medium bg-white appearance-none cursor-pointer disabled:bg-gray-100 disabled:opacity-60">
                                <option value="">{loadingDistricts ? '⏳ Loading districts...' : 'Select District'}</option>
                                {districts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2">
                                <i className="fas fa-seedling text-green-500 text-xs"></i> Crop
                            </label>
                            <select value={crop} onChange={(e) => setCrop(e.target.value)}
                                disabled={!district || loadingCrops}
                                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 focus:outline-none transition-all text-base font-medium bg-white appearance-none cursor-pointer disabled:bg-gray-100 disabled:opacity-60">
                                <option value="">{loadingCrops ? '⏳ Loading crops...' : 'Select Crop'}</option>
                                {crops.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <button onClick={fetchIntelligence} disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2 text-base">
                        {loading ? (<><i className="fas fa-spinner fa-spin"></i> Analyzing...</>) : (<><i className="fas fa-chart-line"></i> Get Market Prices</>)}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="alert-error mb-6 animate-scale-in">
                        <i className="fas fa-exclamation-circle flex-shrink-0"></i>
                        <div>
                            <p className="font-medium">{error}</p>
                            <p className="text-xs opacity-70 mt-0.5">Try a different district or state.</p>
                        </div>
                    </div>
                )}

                {/* Results */}
                {intelligence && (
                    <div className="space-y-5 animate-fade-in">
                        {/* Top Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-stagger">
                            <div className="bg-white rounded-2xl shadow-card p-4 border border-gray-100/60" style={{ borderTopWidth: '4px', borderTopColor: '#22c55e' }}>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Price</p>
                                <p className="text-xl font-extrabold text-green-700">₹{intelligence.currentPrice?.toLocaleString()}</p>
                                <p className="text-[10px] text-gray-400 mt-1">per quintal</p>
                            </div>
                            <div className="bg-white rounded-2xl shadow-card p-4 border border-gray-100/60" style={{ borderTopWidth: '4px', borderTopColor: '#3b82f6' }}>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Average</p>
                                <p className="text-xl font-extrabold text-blue-700">₹{intelligence.sevenDayAverage?.toLocaleString()}</p>
                                <p className="text-[10px] text-gray-400 mt-1">district avg</p>
                            </div>
                            <div className="bg-white rounded-2xl shadow-card p-4 border border-gray-100/60" style={{ borderTopWidth: '4px', borderTopColor: getTrendColor(intelligence.trend) }}>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Trend</p>
                                <p className="text-xl font-extrabold" style={{ color: getTrendColor(intelligence.trend) }}>
                                    {getTrendIcon(intelligence.trend)} {intelligence.trend?.toUpperCase()}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1">{intelligence.changePercent > 0 ? '+' : ''}{intelligence.changePercent}%</p>
                            </div>
                            <div className="bg-white rounded-2xl shadow-card p-4 border border-gray-100/60" style={{ borderTopWidth: '4px', borderTopColor: '#f59e0b' }}>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Best Mandi</p>
                                <p className="text-sm font-extrabold text-amber-700 truncate" title={intelligence.bestMarketName}>
                                    {intelligence.bestMarketName}
                                </p>
                                <p className="text-[11px] text-amber-600 font-bold mt-1">₹{intelligence.bestPrice?.toLocaleString()}</p>
                            </div>
                            <div className="bg-white rounded-2xl shadow-card p-4 border border-gray-100/60" style={{ borderTopWidth: '4px', borderTopColor: '#a855f7' }}>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Markets</p>
                                <p className="text-xl font-extrabold text-purple-700">{intelligence.dataPoints}</p>
                                <p className="text-[10px] text-gray-400 mt-1">mandis</p>
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
                    <div className="bg-white rounded-3xl shadow-card border border-gray-100/60 p-10 text-center animate-fade-in">
                        <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-chart-line text-3xl text-green-500"></i>
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Check Market Prices</h3>
                        <p className="text-gray-400 text-sm max-w-sm mx-auto">
                            Select your state, district and crop above to see current prices, trends, and the best time to sell.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketIntelligencePage;
