import React, { useState, useEffect } from 'react';

const FutureDemand = () => {
  const [crop, setCrop] = useState('wheat');
  const [season, setSeason] = useState('spring');
  const [region, setRegion] = useState('north');
  const [currentPrice, setCurrentPrice] = useState(25);
  const [popGrowth, setPopGrowth] = useState(1.5);
  const [prediction, setPrediction] = useState(null);

  const cropBaseData = {
    wheat: { base: 5000, volatility: 0.15, priceBase: 25 },
    rice: { base: 7000, volatility: 0.12, priceBase: 30 },
    corn: { base: 4500, volatility: 0.18, priceBase: 20 },
    soybean: { base: 3000, volatility: 0.20, priceBase: 45 },
    cotton: { base: 2500, volatility: 0.22, priceBase: 60 },
    potato: { base: 6000, volatility: 0.14, priceBase: 15 }
  };

  const seasonMultipliers = {
    spring: 1.1,
    summer: 0.9,
    autumn: 1.15,
    winter: 0.95
  };

  const regionMultipliers = {
    north: 1.0,
    south: 1.1,
    east: 0.95,
    west: 1.05,
    central: 1.0
  };

  const predictDemand = () => {
    const cropData = cropBaseData[crop];
    const seasonMult = seasonMultipliers[season];
    const regionMult = regionMultipliers[region];
    const growthMult = 1 + (popGrowth / 100);
    const randomFactor = 1 + (Math.random() * 0.1 - 0.05);
    
    const predictedDemand = Math.round(cropData.base * seasonMult * regionMult * growthMult * randomFactor);
    const priceChange = (Math.random() * 0.3 - 0.1);
    const priceLow = Math.round(currentPrice * (1 + priceChange - 0.1));
    const priceHigh = Math.round(currentPrice * (1 + priceChange + 0.1));
    
    const trendValue = priceChange > 0.05 ? '📈 Increasing' : priceChange < -0.05 ? '📉 Decreasing' : '➡️ Stable';
    
    let recommendation = '';
    if (priceChange > 0.1) {
      recommendation = `Strong demand expected! Consider increasing ${crop} cultivation by 15-20%. Market conditions are favorable for higher profits.`;
    } else if (priceChange > 0) {
      recommendation = `Moderate growth expected. Maintain current ${crop} cultivation levels. Good season for steady returns.`;
    } else if (priceChange > -0.1) {
      recommendation = `Stable market. ${crop} cultivation can continue as planned. Consider diversifying with complementary crops.`;
    } else {
      recommendation = `Lower demand predicted. Consider reducing ${crop} cultivation or switching to alternative crops with better prospects.`;
    }

    const weatherConditions = ['Favorable', 'Moderate', 'Challenging'];
    const weatherStatus = weatherConditions[Math.floor(Math.random() * 3)];
    
    const profitPercentage = ((priceHigh - cropData.priceBase) / cropData.priceBase * 100).toFixed(1);
    
    const riskLevels = ['Low', 'Moderate', 'High'];
    const volatilityIndex = Math.floor(cropData.volatility * 10);
    const riskLevel = riskLevels[Math.min(volatilityIndex % 3, 2)];

    setPrediction({
      demand: predictedDemand,
      priceLow,
      priceHigh,
      trend: trendValue,
      recommendation,
      weather: `${weatherStatus} conditions expected for ${season} season`,
      profit: `Estimated ${profitPercentage}% profit margin potential`,
      risk: `${riskLevel} Risk - Volatility: ${(cropData.volatility * 100).toFixed(0)}%`
    });
  };

  useEffect(() => {
    predictDemand();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 shadow-lg">
        <div className="flex items-center">
          <button onClick={() => window.history.back()} className="mr-4">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <div>
            <h1 className="text-xl font-bold">Future Demand Predictor</h1>
            <p className="text-sm text-green-200">AI-powered crop demand forecasting</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h1 className="text-4xl font-bold text-green-800 mb-2">🌾 Farmer Future Demand Predictor</h1>
          <p className="text-gray-600">Predict crop demand and make informed farming decisions</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-green-700 mb-4">📊 Input Data</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Crop</label>
                <select 
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="wheat">🌾 Wheat</option>
                  <option value="rice">🍚 Rice</option>
                  <option value="corn">🌽 Corn</option>
                  <option value="soybean">🫘 Soybean</option>
                  <option value="cotton">☁️ Cotton</option>
                  <option value="potato">🥔 Potato</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Season</label>
                <select 
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="spring">🌸 Spring</option>
                  <option value="summer">☀️ Summer</option>
                  <option value="autumn">🍂 Autumn</option>
                  <option value="winter">❄️ Winter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Region</label>
                <select 
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="north">North</option>
                  <option value="south">South</option>
                  <option value="east">East</option>
                  <option value="west">West</option>
                  <option value="central">Central</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Market Price (₹/kg)</label>
                <input 
                  type="number" 
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Population Growth (%)</label>
                <input 
                  type="range" 
                  value={popGrowth}
                  onChange={(e) => setPopGrowth(Number(e.target.value))}
                  className="w-full" 
                  min="0" 
                  max="5" 
                  step="0.1"
                />
                <span className="text-sm text-gray-600">{popGrowth}%</span>
              </div>

              <button 
                onClick={predictDemand}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition duration-300 shadow-lg"
              >
                🔮 Predict Demand
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-green-700 mb-4">📈 Prediction Results</h2>
            
            {prediction && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-500">
                  <p className="text-sm text-gray-600 mb-1">Expected Demand (Next Season)</p>
                  <p className="text-3xl font-bold text-green-700">{prediction.demand.toLocaleString()} tons</p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600 mb-1">Predicted Price Range</p>
                  <p className="text-3xl font-bold text-blue-700">₹{prediction.priceLow} - ₹{prediction.priceHigh}</p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-l-4 border-purple-500">
                  <p className="text-sm text-gray-600 mb-1">Market Trend</p>
                  <p className="text-2xl font-bold text-purple-700">{prediction.trend}</p>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-l-4 border-yellow-500">
                  <p className="text-sm text-gray-600 mb-1">Recommendation</p>
                  <p className="text-sm text-gray-800 leading-relaxed">{prediction.recommendation}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Insights */}
        {prediction && (
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center mb-3">
                <span className="text-3xl mr-3">🌤️</span>
                <h3 className="text-lg font-bold text-gray-800">Weather Impact</h3>
              </div>
              <p className="text-sm text-gray-600">{prediction.weather}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center mb-3">
                <span className="text-3xl mr-3">💰</span>
                <h3 className="text-lg font-bold text-gray-800">Profit Margin</h3>
              </div>
              <p className="text-sm text-gray-600">{prediction.profit}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center mb-3">
                <span className="text-3xl mr-3">⚠️</span>
                <h3 className="text-lg font-bold text-gray-800">Risk Level</h3>
              </div>
              <p className="text-sm text-gray-600">{prediction.risk}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FutureDemand;
