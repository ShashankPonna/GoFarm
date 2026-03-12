import { useState } from 'react';
import api from '../../utils/api';

const CropRecommendation = () => {
  const [formData, setFormData] = useState({
    soil: {
      type: 'Loamy',
      ph: 6.5,
      n: 100,
      p: 30,
      k: 150,
      organicCarbon: 1.2
    },
    weather: {
      temp: 25,
      humidity: 65,
      rainfall: 600,
      region: 'Maharashtra'
    }
  });

  const [recommendations, setRecommendations] = useState(null);
  const [groqAnalysis, setGroqAnalysis] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [cropAdvice, setCropAdvice] = useState(null);
  const [soilPlan, setSoilPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('soil');
  const [activeView, setActiveView] = useState('results'); // results, groq, advice, soilplan

  const handleInputChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: isNaN(value) ? value : parseFloat(value)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setActiveView('results');

    try {
      const response = await api.post('/crops/recommendations/full', formData);
      setRecommendations(response.data.recommendations);
      setGroqAnalysis(response.data.groqAnalysis);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get recommendations');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCropSpecificAdvice = async (cropName) => {
    setAdviceLoading(true);
    try {
      const response = await api.post(`/crops/groq-advice/${cropName}`, formData);
      setCropAdvice(response.data.advice);
      setSelectedCrop(cropName);
      setActiveView('advice');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get crop advice');
      console.error('Error:', err);
    } finally {
      setAdviceLoading(false);
    }
  };

  const getSoilImprovement = async () => {
    setAdviceLoading(true);
    try {
      const response = await api.post('/crops/soil-improvement', { soil: formData.soil });
      setSoilPlan(response.data.plan);
      setActiveView('soilplan');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get soil plan');
      console.error('Error:', err);
    } finally {
      setAdviceLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getRiskColor = (risk) => {
    const colors = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-red-100 text-red-800'
    };
    return colors[risk] || 'bg-gray-100 text-gray-800';
  };

  const getDemandColor = (demand) => {
    const colors = {
      'High': 'bg-blue-100 text-blue-800',
      'Medium': 'bg-purple-100 text-purple-800',
      'Low': 'bg-gray-100 text-gray-800'
    };
    return colors[demand] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-700 mb-2">Crop Recommendation</h1>
          <p className="text-gray-600">AI-Powered Farming Guidance</p>
          <p className="text-sm text-gray-500 mt-2">Discover the best crops for your soil and weather</p>
        </div>

        {/* Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-green-700 mb-4">Enter Data</h2>

              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('soil')}
                  className={`flex-1 py-2 px-3 rounded font-semibold transition ${activeTab === 'soil'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  Soil
                </button>
                <button
                  onClick={() => setActiveTab('weather')}
                  className={`flex-1 py-2 px-3 rounded font-semibold transition ${activeTab === 'weather'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  Weather
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Soil Tab */}
                {activeTab === 'soil' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Soil Type
                      </label>
                      <select
                        value={formData.soil.type}
                        onChange={(e) => handleInputChange('soil', 'type', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      >
                        <option>Loamy</option>
                        <option>Clay</option>
                        <option>Sandy</option>
                        <option>Black Soil</option>
                        <option>Clay Loam</option>
                        <option>Sandy Loam</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        pH Level: {formData.soil.ph}
                      </label>
                      <input
                        type="range"
                        min="4"
                        max="9"
                        step="0.1"
                        value={formData.soil.ph}
                        onChange={(e) => handleInputChange('soil', 'ph', e.target.value)}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-500">(Normal range 4-9)</span>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Nitrogen (N): {formData.soil.n} mg/kg
                      </label>
                      <input
                        type="number"
                        value={formData.soil.n}
                        onChange={(e) => handleInputChange('soil', 'n', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Phosphorus (P): {formData.soil.p} mg/kg
                      </label>
                      <input
                        type="number"
                        value={formData.soil.p}
                        onChange={(e) => handleInputChange('soil', 'p', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Potassium (K): {formData.soil.k} mg/kg
                      </label>
                      <input
                        type="number"
                        value={formData.soil.k}
                        onChange={(e) => handleInputChange('soil', 'k', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Organic Carbon: {formData.soil.organicCarbon} %
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.soil.organicCarbon}
                        onChange={(e) => handleInputChange('soil', 'organicCarbon', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    </div>
                  </div>
                )}

                {/* Weather Tab */}
                {activeTab === 'weather' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Temperature: {formData.weather.temp}°C
                      </label>
                      <input
                        type="range"
                        min="-10"
                        max="50"
                        step="0.5"
                        value={formData.weather.temp}
                        onChange={(e) => handleInputChange('weather', 'temp', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Humidity: {formData.weather.humidity} %
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={formData.weather.humidity}
                        onChange={(e) => handleInputChange('weather', 'humidity', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Annual Rainfall: {formData.weather.rainfall} mm
                      </label>
                      <input
                        type="number"
                        value={formData.weather.rainfall}
                        onChange={(e) => handleInputChange('weather', 'rainfall', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Region/State
                      </label>
                      <input
                        type="text"
                        value={formData.weather.region}
                        onChange={(e) => handleInputChange('weather', 'region', e.target.value)}
                        placeholder="e.g. Maharashtra"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition mt-6"
                >
                  {loading ? 'Finding Recommendations...' : 'Get Recommendations'}
                </button>
              </form>

              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  ⚠️ {error}
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {!recommendations && !loading && (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">🌾</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Recommendations Yet</h3>
                <p className="text-gray-600">Enter your soil and weather data to discover the best crops.</p>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-600">
                <div className="animate-spin text-4xl mb-4">⌛</div>
                <p>Generating AI recommendations...</p>
              </div>
            )}

            {recommendations && !loading && (
              <div className="space-y-4">
                {/* View Tabs */}
                <div className="flex gap-2 mb-4 bg-white rounded-lg shadow p-2">
                  <button
                    onClick={() => setActiveTab('results')}
                    className={`flex-1 py-2 px-3 rounded font-semibold transition ${activeView === 'results' || activeView === 'top_crop'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    🌾 Top Crops
                  </button>
                  <button
                    onClick={() => setActiveView('groq')}
                    className={`flex-1 py-2 px-3 rounded font-semibold transition ${activeView === 'groq'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    🤖 {loading ? '⌛ AI...' : 'AI Strategy'}
                  </button>
                  <button
                    onClick={getSoilImprovement}
                    disabled={adviceLoading}
                    className={`flex-1 py-2 px-3 rounded font-semibold transition ${activeView === 'soilplan'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                      }`}
                  >
                    🌱 Soil Plan
                  </button>
                </div>

                {/* Results View */}
                {(activeView === 'results' || activeView === 'top_crop') && (
                  <div className="space-y-6">
                    {recommendations && recommendations.length > 0 && recommendations.map((crop, idx) => (
                      <div key={idx} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                        {/* Header */}
                        <div className={`p-4 ${idx === 0 ? 'bg-gradient-to-r from-green-600 to-green-700 text-white' : 'bg-gray-50 border-b border-gray-200'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className={`text-2xl font-bold flex items-center gap-2 ${idx === 0 ? 'text-white' : 'text-green-700'}`}>
                                {idx === 0 && '⭐ '}#{idx + 1} {crop.cropName}
                              </h3>
                              {idx === 0 && <p className="text-green-100 text-sm">Best match for your farm</p>}
                            </div>
                            <div className="text-right flex flex-col items-center">
                              <div className={`${getScoreColor(crop.suitabilityScore)} text-white rounded-full w-16 h-16 flex items-center justify-center`}>
                                <span className="text-2xl font-bold">{crop.suitabilityScore}</span>
                              </div>
                              <span className={`text-xs mt-1 ${idx === 0 ? 'text-green-100' : 'text-gray-500'}`}>Score</span>
                            </div>
                          </div>
                        </div>

                        {/* Body */}
                        <div className="p-5">
                          {/* Why Suitable */}
                          <div className="mb-4">
                            <h4 className="font-bold text-gray-800 mb-2">✓ Why it's suitable:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                              {crop.whySuitable && crop.whySuitable.map((reason, i) => (
                                <li key={i}>{reason}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <div className="bg-blue-50 p-3 rounded">
                              <p className="text-xs text-gray-600">Expected Yield</p>
                              <p className="font-bold text-blue-700 text-sm">{crop.expectedYield || 'N/A'}</p>
                            </div>
                            <div className="bg-orange-50 p-3 rounded">
                              <p className="text-xs text-gray-600">Sowing Season</p>
                              <p className="font-bold text-orange-700 text-sm">{crop.sowingSeason || 'N/A'}</p>
                            </div>
                            <div className="bg-cyan-50 p-3 rounded">
                              <p className="text-xs text-gray-600">Water Req.</p>
                              <p className="font-bold text-cyan-700 text-sm">{crop.waterRequirement || 'N/A'}</p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded">
                              <p className="text-xs text-gray-600">Market Demand</p>
                              <p className={`font-bold text-sm ${getDemandColor(crop.marketDemand || 'Medium').split(' ')[1]}`}>
                                {crop.marketDemand || 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Fertilizer Section */}
                          {crop.fertilizer && (
                            <div className="bg-yellow-50 p-3 rounded mb-4">
                              <h4 className="font-bold text-gray-800 mb-2 text-sm">🌱 Fertilizer Guide:</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                                <p><span className="font-semibold">N:</span> {crop.fertilizer.nitrogen || 'N/A'}</p>
                                <p><span className="font-semibold">P:</span> {crop.fertilizer.phosphorus || 'N/A'}</p>
                                <p><span className="font-semibold">K:</span> {crop.fertilizer.potassium || 'N/A'}</p>
                                <p className="col-span-2"><span className="font-semibold">Organic:</span> {crop.fertilizer.organicMatter || 'N/A'}</p>
                              </div>
                            </div>
                          )}

                          {/* Get Detailed Advice Button */}
                          <button
                            onClick={() => getCropSpecificAdvice(crop.cropName)}
                            disabled={adviceLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-bold disabled:opacity-50 mt-2"
                          >
                            {adviceLoading && selectedCrop === crop.cropName ? (
                              '📋 Fetching detailed advice...'
                            ) : (
                              `📋 Get detailed AI advice for ${crop.cropName}`
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Groq AI Analysis View */}
                {activeView === 'groq' && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg mb-4">
                      <h2 className="text-2xl font-bold mb-1">🤖 AI Strategy Analysis</h2>
                      <p className="text-blue-100">Overall agricultural strategy for your conditions</p>
                    </div>
                    {groqAnalysis ? (
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm p-4 max-h-96 overflow-y-auto bg-gray-50 rounded">
                        {groqAnalysis}
                      </div>
                    ) : (
                      <div className="text-center p-8">
                        <div className="text-gray-400 mb-3">
                          {loading ? '⌛ Fetching analysis...' : '📊 AI analysis not available'}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Crop Specific Advice View */}
                {activeView === 'advice' && cropAdvice && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-t-lg mb-4">
                      <h2 className="text-2xl font-bold mb-1">📋 Detailed Advice for {selectedCrop}</h2>
                      <p className="text-purple-100">Step-by-step guidance from Groq AI</p>
                    </div>
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm p-4 bg-gray-50 rounded border border-gray-100">
                      {cropAdvice}
                    </div>
                    <button
                      onClick={() => setActiveView('results')}
                      className="mt-6 bg-gray-600 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition font-medium"
                    >
                      ← Back to Recommendations
                    </button>
                  </div>
                )}

                {/* Soil Improvement Plan View */}
                {activeView === 'soilplan' && soilPlan && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-lg mb-4">
                      <h2 className="text-2xl font-bold mb-1">🌱 Soil Improvement Plan</h2>
                      <p className="text-green-100">12-month strategy to optimize your soil</p>
                    </div>
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm p-4 bg-gray-50 rounded border border-gray-100">
                      {soilPlan}
                    </div>
                    <button
                      onClick={() => setActiveView('results')}
                      className="mt-6 bg-gray-600 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition font-medium"
                    >
                      ← Back to Recommendations
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropRecommendation;
