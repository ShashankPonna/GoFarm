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

  // Soil type color mapping
  // const getSoilTypeColor = (type) => {
  //   const colors = {
  //     'Clay': 'bg-red-100 text-red-800',
  //     'Loamy': 'bg-green-100 text-green-800',
  //     'Sandy': 'bg-yellow-100 text-yellow-800',
  //     'Black Soil': 'bg-gray-100 text-gray-800'
  //   };
  //   return colors[type] || 'bg-gray-100 text-gray-800';
  // };

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
          <h1 className="text-4xl font-bold text-green-700 mb-2">फसल सुझाव</h1>
          <p className="text-gray-600">Crop Recommendation System</p>
          <p className="text-sm text-gray-500 mt-2">आपकी मिट्टी और मौसम के अनुसार सर्वोत्तम फसले</p>
        </div>

        {/* Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-green-700 mb-4">डेटा दर्ज करें</h2>

              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('soil')}
                  className={`flex-1 py-2 px-3 rounded font-semibold transition ${activeTab === 'soil'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  मिट्टी
                </button>
                <button
                  onClick={() => setActiveTab('weather')}
                  className={`flex-1 py-2 px-3 rounded font-semibold transition ${activeTab === 'weather'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  मौसम
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Soil Tab */}
                {activeTab === 'soil' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        मिट्टी का प्रकार
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
                        pH स्तर: {formData.soil.ph}
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
                      <span className="text-xs text-gray-500">(4-9 सामान्य रेंज)</span>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        नाइट्रोजन (N): {formData.soil.n} mg/kg
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
                        फॉस्फोरस (P): {formData.soil.p} mg/kg
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
                        पोटेशियम (K): {formData.soil.k} mg/kg
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
                        जैविक कार्बन: {formData.soil.organicCarbon} %
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
                        तापमान: {formData.weather.temp}°C
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
                        आर्द्रता: {formData.weather.humidity} %
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
                        वार्षिक वर्षा: {formData.weather.rainfall} mm
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
                        क्षेत्र/राज्य
                      </label>
                      <input
                        type="text"
                        value={formData.weather.region}
                        onChange={(e) => handleInputChange('weather', 'region', e.target.value)}
                        placeholder="जैसे: महाराष्ट्र"
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
                  {loading ? 'सुझाव खोज रहे हैं...' : 'फसल सुझाव खोजें'}
                </button>
              </form>

              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
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
                <h3 className="text-xl font-semibold text-gray-700 mb-2">अभी कोई सुझाव नहीं</h3>
                <p className="text-gray-600">अपनी मिट्टी और मौसम का डेटा दर्ज करें और सर्वोत्तम फसलें खोजें</p>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="animate-spin text-4xl mb-4">⌛</div>
                <p className="text-gray-600">सrizत करके रखिए...</p>
              </div>
            )}

            {recommendations && !loading && (
              <div className="space-y-4">
                {/* View Tabs */}
                <div className="flex gap-2 mb-4 bg-white rounded-lg shadow p-2">
                  <button
                    onClick={() => setActiveView('results')}
                    className={`flex-1 py-2 px-3 rounded font-semibold transition ${activeView === 'results'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    🌾 फसल सुझाव
                  </button>
                  <button
                    onClick={() => setActiveView('groq')}
                    className={`flex-1 py-2 px-3 rounded font-semibold transition ${activeView === 'groq'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    🤖 {loading ? '⌛ AI...' : 'AI विश्लेषण'}
                  </button>
                  <button
                    onClick={getSoilImprovement}
                    disabled={adviceLoading}
                    className={`flex-1 py-2 px-3 rounded font-semibold transition ${activeView === 'soilplan'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                      }`}
                  >
                    🌱 मिट्टी योजना
                  </button>
                </div>

                {/* Results View - Show TOP CROP ONLY */}
                {activeView === 'results' && (
                  <div className="space-y-4">
                    {recommendations && recommendations.length > 0 && (
                      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-3xl font-bold flex items-center gap-2">
                                ⭐ {recommendations[0].cropName}
                              </h3>
                              <p className="text-green-100">आपके लिए सबसे अच्छी फसल</p>
                            </div>
                            <div className="text-right">
                              <div className={`${getScoreColor(recommendations[0].suitabilityScore)} text-white rounded-full w-24 h-24 flex items-center justify-center`}>
                                <span className="text-4xl font-bold">{recommendations[0].suitabilityScore}</span>
                              </div>
                              <p className="text-green-100 text-sm mt-1">अनुकूलता स्कोर</p>
                            </div>
                          </div>
                        </div>

                        {/* Body */}
                        <div className="p-5">
                          {/* Why Suitable */}
                          <div className="mb-4">
                            <h4 className="font-bold text-gray-800 mb-2">✓ क्यों यह सर्वोत्तम है:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                              {recommendations[0].whySuitable && recommendations[0].whySuitable.map((reason, i) => (
                                <li key={i}>{reason}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-blue-50 p-3 rounded">
                              <p className="text-xs text-gray-600">अपेक्षित उपज</p>
                              <p className="font-bold text-blue-700">{recommendations[0].expectedYield || 'उपलब्ध नहीं'}</p>
                            </div>
                            <div className="bg-orange-50 p-3 rounded">
                              <p className="text-xs text-gray-600">रोपण का मौसम</p>
                              <p className="font-bold text-orange-700 text-sm">{recommendations[0].sowingSeason || 'उपलब्ध नहीं'}</p>
                            </div>
                            <div className="bg-cyan-50 p-3 rounded">
                              <p className="text-xs text-gray-600">जल आवश्यकता</p>
                              <p className="font-bold text-cyan-700 text-sm">{recommendations[0].waterRequirement || 'उपलब्ध नहीं'}</p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded">
                              <p className="text-xs text-gray-600">बाजार मांग</p>
                              <p className={`font-bold text-sm ${getDemandColor(recommendations[0].marketDemand || 'Medium').split(' ')[1]}`}>
                                {recommendations[0].marketDemand === 'High' ? 'अधिक' : recommendations[0].marketDemand === 'Medium' ? 'मध्यम' : 'कम'}
                              </p>
                            </div>
                          </div>

                          {/* Risk & Demand Badges */}
                          <div className="flex gap-2 mb-4">
                            {recommendations[0].riskLevel && (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(recommendations[0].riskLevel)}`}>
                                जोखिम: {recommendations[0].riskLevel === 'Low' ? 'कम' : recommendations[0].riskLevel === 'Medium' ? 'मध्यम' : 'अधिक'}
                              </span>
                            )}
                            {recommendations[0].marketDemand && (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDemandColor(recommendations[0].marketDemand)}`}>
                                मांग: {recommendations[0].marketDemand === 'High' ? 'अधिक' : recommendations[0].marketDemand === 'Medium' ? 'मध्यम' : 'कम'}
                              </span>
                            )}
                          </div>

                          {/* Fertilizer Section */}
                          <div className="bg-yellow-50 p-3 rounded mb-4">
                            <h4 className="font-bold text-gray-800 mb-2">🌱 NPK खाद सुझाव:</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="font-semibold">N (नाइट्रोजन):</span> {recommendations[0].fertilizer?.nitrogen || 'उपलब्ध नहीं'}</p>
                              <p><span className="font-semibold">P (फॉस्फोरस):</span> {recommendations[0].fertilizer?.phosphorus || 'उपलब्ध नहीं'}</p>
                              <p><span className="font-semibold">K (पोटेशियम):</span> {recommendations[0].fertilizer?.potassium || 'उपलब्ध नहीं'}</p>
                              <p><span className="font-semibold">जैविक पदार्थ:</span> {recommendations[0].fertilizer?.organicMatter || 'उपलब्ध नहीं'}</p>
                            </div>
                          </div>

                          {/* Tips */}
                          {recommendations[0].additionalTips && (
                            <div className="bg-green-50 p-3 rounded mb-4">
                              <h4 className="font-bold text-gray-800 mb-2">💡 महत्वपूर्ण सुझाव:</h4>
                              <ul className="space-y-1 text-xs text-gray-700">
                                {recommendations[0].additionalTips.map((tip, i) => (
                                  <li key={i} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Get Detailed Advice Button */}
                          <button
                            onClick={() => getCropSpecificAdvice(recommendations[0].cropName)}
                            disabled={adviceLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-bold disabled:opacity-50"
                          >
                            {adviceLoading && selectedCrop === recommendations[0].cropName ? (
                              '📋 विस्तृत सलाह प्राप्त कर रहे हैं...'
                            ) : (
                              '📋 इस फसल के लिए विस्तृत AI सलाह'
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Groq AI Analysis View */}
                {activeView === 'groq' && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg mb-4">
                      <h2 className="text-2xl font-bold mb-1">🤖 Groq AI विश्लेषण</h2>
                      <p className="text-blue-100">आपकी मिट्टी और मौसम के लिए {recommendations && recommendations.length > 0 ? recommendations[0].cropName : 'फसल'} की विस्तृत जानकारी</p>
                    </div>
                    {groqAnalysis ? (
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm p-4 max-h-96 overflow-y-auto bg-gray-50 rounded">
                        {groqAnalysis}
                      </div>
                    ) : (
                      <div className="text-center p-8">
                        <div className="text-gray-400 mb-3">
                          {loading ? '⌛ विश्लेषण प्राप्त कर रहे हैं...' : '📊 AI विश्लेषण अभी उपलब्ध नहीं है'}
                        </div>
                        {loading && <div className="animate-pulse text-gray-400">कृपया प्रतीक्षा करें...</div>}
                      </div>
                    )}
                  </div>
                )}

                {/* Crop Specific Advice View */}
                {activeView === 'advice' && cropAdvice && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-t-lg mb-4">
                      <h2 className="text-2xl font-bold mb-1">📋 {selectedCrop} के लिए विस्तृत सलाह</h2>
                      <p className="text-purple-100">Groq AI द्वारा तैयार विशेष कृषि सलाह</p>
                    </div>
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm p-4">
                      {cropAdvice}
                    </div>
                    <button
                      onClick={() => setActiveView('results')}
                      className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                    >
                      ← पिछले सुझाव देखें
                    </button>
                  </div>
                )}

                {/* Soil Improvement Plan View */}
                {activeView === 'soilplan' && soilPlan && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-lg mb-4">
                      <h2 className="text-2xl font-bold mb-1">🌱 मिट्टी सुधार योजना</h2>
                      <p className="text-green-100">12 महीने की विस्तृत मिट्टी सुधार योजना</p>
                    </div>
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm p-4">
                      {soilPlan}
                    </div>
                    <button
                      onClick={() => setActiveView('results')}
                      className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                    >
                      ← पिछले सुझाव देखें
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
