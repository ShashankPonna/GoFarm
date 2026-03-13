import { useState } from 'react';
import api from '../../utils/api';
import BackButton from '../../components/BackButton';

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
  const [activeView, setActiveView] = useState('results');

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
    if (score >= 60) return 'bg-amber-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-amber-50 border-amber-200';
    if (score >= 40) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getDemandColor = (demand) => {
    const colors = {
      'High': 'text-green-700 bg-green-100',
      'Medium': 'text-amber-700 bg-amber-100',
      'Low': 'text-gray-600 bg-gray-100'
    };
    return colors[demand] || 'text-gray-600 bg-gray-100';
  };

  // Reusable input component for farmers
  const FormInput = ({ label, icon, unit, value, onChange, type = 'number', ...props }) => (
    <div>
      <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2">
        <i className={`fas ${icon} text-green-500`}></i>
        {label}
        {unit && <span className="text-xs font-normal text-gray-400">({unit})</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 focus:outline-none transition-all text-lg font-medium bg-white"
        {...props}
      />
    </div>
  );

  // Reusable range slider with clear value display
  const RangeInput = ({ label, icon, unit, value, onChange, min, max, step: stepVal }) => (
    <div>
      <label className="flex items-center justify-between text-sm font-bold text-gray-600 mb-2">
        <span className="flex items-center gap-2">
          <i className={`fas ${icon} text-green-500`}></i>
          {label}
        </span>
        <span className="text-lg font-extrabold text-green-700 bg-green-50 px-3 py-1 rounded-xl">
          {value}{unit}
        </span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={stepVal}
        value={value}
        onChange={onChange}
        className="w-full h-3 rounded-full appearance-none cursor-pointer accent-green-600"
        style={{ background: `linear-gradient(to right, #22c55e ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%)` }}
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-green-100/50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <BackButton />
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
              <i className="fas fa-seedling text-white"></i>
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-gray-800">Crop Recommendation</h1>
              <p className="text-xs text-gray-400 font-medium">AI-powered farming guidance</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-card border border-gray-100/60 p-6 sticky top-20">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-clipboard-list text-green-600"></i>
                Enter Your Data
              </h2>

              {/* Tabs */}
              <div className="flex gap-2 mb-5 bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setActiveTab('soil')}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'soil'
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <i className="fas fa-mountain"></i>
                  Soil
                </button>
                <button
                  onClick={() => setActiveTab('weather')}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'weather'
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <i className="fas fa-cloud-sun"></i>
                  Weather
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Soil Tab */}
                {activeTab === 'soil' && (
                  <div className="space-y-5 animate-fade-in">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2">
                        <i className="fas fa-mountain text-green-500"></i>
                        Soil Type
                      </label>
                      <select
                        value={formData.soil.type}
                        onChange={(e) => handleInputChange('soil', 'type', e.target.value)}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 focus:outline-none transition-all text-base font-medium bg-white appearance-none cursor-pointer"
                      >
                        <option>Loamy</option>
                        <option>Clay</option>
                        <option>Sandy</option>
                        <option>Black Soil</option>
                        <option>Clay Loam</option>
                        <option>Sandy Loam</option>
                      </select>
                    </div>

                    <RangeInput
                      label="pH Level" icon="fa-flask" unit=""
                      value={formData.soil.ph}
                      onChange={(e) => handleInputChange('soil', 'ph', e.target.value)}
                      min={4} max={9} step={0.1}
                    />

                    <FormInput
                      label="Nitrogen (N)" icon="fa-atom" unit="mg/kg"
                      value={formData.soil.n}
                      onChange={(e) => handleInputChange('soil', 'n', e.target.value)}
                    />

                    <FormInput
                      label="Phosphorus (P)" icon="fa-atom" unit="mg/kg"
                      value={formData.soil.p}
                      onChange={(e) => handleInputChange('soil', 'p', e.target.value)}
                    />

                    <FormInput
                      label="Potassium (K)" icon="fa-atom" unit="mg/kg"
                      value={formData.soil.k}
                      onChange={(e) => handleInputChange('soil', 'k', e.target.value)}
                    />

                    <FormInput
                      label="Organic Carbon" icon="fa-leaf" unit="%"
                      value={formData.soil.organicCarbon}
                      onChange={(e) => handleInputChange('soil', 'organicCarbon', e.target.value)}
                      step="0.1"
                    />
                  </div>
                )}

                {/* Weather Tab */}
                {activeTab === 'weather' && (
                  <div className="space-y-5 animate-fade-in">
                    <RangeInput
                      label="Temperature" icon="fa-thermometer-half" unit="°C"
                      value={formData.weather.temp}
                      onChange={(e) => handleInputChange('weather', 'temp', e.target.value)}
                      min={-10} max={50} step={0.5}
                    />

                    <RangeInput
                      label="Humidity" icon="fa-tint" unit="%"
                      value={formData.weather.humidity}
                      onChange={(e) => handleInputChange('weather', 'humidity', e.target.value)}
                      min={0} max={100} step={1}
                    />

                    <FormInput
                      label="Annual Rainfall" icon="fa-cloud-rain" unit="mm"
                      value={formData.weather.rainfall}
                      onChange={(e) => handleInputChange('weather', 'rainfall', e.target.value)}
                    />

                    <FormInput
                      label="Region / State" icon="fa-map-marker-alt" unit=""
                      value={formData.weather.region}
                      onChange={(e) => handleInputChange('weather', 'region', e.target.value)}
                      type="text"
                      placeholder="e.g. Maharashtra"
                    />
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-base mt-4"
                >
                  {loading ? (
                    <><i className="fas fa-spinner fa-spin"></i> Finding Best Crops...</>
                  ) : (
                    <><i className="fas fa-search"></i> Get Recommendations</>
                  )}
                </button>
              </form>

              {error && (
                <div className="alert-error mt-4 animate-scale-in">
                  <i className="fas fa-exclamation-circle flex-shrink-0"></i>
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {!recommendations && !loading && (
              <div className="bg-white rounded-3xl shadow-card border border-gray-100/60 p-10 text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-seedling text-3xl text-green-500"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Recommendations Yet</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto">Enter your soil and weather data on the left, then tap "Get Recommendations" to discover the best crops for your farm.</p>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-3xl shadow-card border border-gray-100/60 p-10 text-center animate-fade-in">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce-soft">
                  <i className="fas fa-brain text-2xl text-green-600"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">AI is Analyzing...</h3>
                <p className="text-gray-400 text-sm">Finding the best crops for your conditions</p>
                <div className="mt-4 flex justify-center gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2.5 h-2.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
                  ))}
                </div>
              </div>
            )}

            {recommendations && !loading && (
              <div className="space-y-5">
                {/* View Tabs */}
                <div className="flex gap-2 bg-white rounded-3xl shadow-card border border-gray-100/60 p-2">
                  <button
                    onClick={() => setActiveView('results')}
                    className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      activeView === 'results' || activeView === 'top_crop'
                        ? 'bg-green-600 text-white shadow-md'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <i className="fas fa-leaf"></i>
                    Top Crops
                  </button>
                  <button
                    onClick={() => setActiveView('groq')}
                    className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      activeView === 'groq'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <i className="fas fa-robot"></i>
                    AI Strategy
                  </button>
                  <button
                    onClick={getSoilImprovement}
                    disabled={adviceLoading}
                    className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      activeView === 'soilplan'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'text-gray-500 hover:bg-gray-50 disabled:opacity-50'
                    }`}
                  >
                    <i className="fas fa-seedling"></i>
                    Soil Plan
                  </button>
                </div>

                {/* Results View */}
                {(activeView === 'results' || activeView === 'top_crop') && (
                  <div className="space-y-5 animate-stagger">
                    {recommendations && recommendations.length > 0 && recommendations.map((crop, idx) => (
                      <div key={idx} className="bg-white rounded-3xl shadow-card border border-gray-100/60 overflow-hidden hover:shadow-card-hover transition-all">
                        {/* Crop Header */}
                        <div className={`p-5 ${idx === 0 ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gray-50 border-b border-gray-100'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                {idx === 0 && <span className="text-amber-300 text-lg">⭐</span>}
                                <h3 className={`text-xl font-extrabold ${idx === 0 ? 'text-white' : 'text-gray-800'}`}>
                                  #{idx + 1} {crop.cropName}
                                </h3>
                              </div>
                              {idx === 0 && <p className="text-green-100 text-sm mt-1 font-medium">Best match for your farm</p>}
                            </div>
                            <div className="text-center">
                              <div className={`${getScoreColor(crop.suitabilityScore)} text-white rounded-2xl w-16 h-16 flex flex-col items-center justify-center shadow-md`}>
                                <span className="text-xl font-extrabold leading-none">{crop.suitabilityScore}</span>
                                <span className="text-[9px] font-semibold opacity-80">SCORE</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Crop Body */}
                        <div className="p-5 space-y-4">
                          {/* Why Suitable */}
                          {crop.whySuitable && crop.whySuitable.length > 0 && (
                            <div>
                              <h4 className="font-bold text-gray-700 mb-2 text-sm flex items-center gap-2">
                                <i className="fas fa-check-circle text-green-500"></i>
                                Why it's suitable
                              </h4>
                              <ul className="space-y-1.5">
                                {crop.whySuitable.map((reason, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                    <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                              <p className="text-xs text-blue-500 font-semibold mb-1">
                                <i className="fas fa-chart-line mr-1"></i> Yield
                              </p>
                              <p className="font-bold text-blue-800 text-sm">{crop.expectedYield || 'N/A'}</p>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                              <p className="text-xs text-amber-500 font-semibold mb-1">
                                <i className="fas fa-calendar mr-1"></i> Sowing
                              </p>
                              <p className="font-bold text-amber-800 text-sm">{crop.sowingSeason || 'N/A'}</p>
                            </div>
                            <div className="bg-cyan-50 p-4 rounded-2xl border border-cyan-100">
                              <p className="text-xs text-cyan-500 font-semibold mb-1">
                                <i className="fas fa-tint mr-1"></i> Water
                              </p>
                              <p className="font-bold text-cyan-800 text-sm">{crop.waterRequirement || 'N/A'}</p>
                            </div>
                            <div className={`p-4 rounded-2xl border ${getDemandColor(crop.marketDemand || 'Medium').split(' ').slice(1).join(' ')}`}>
                              <p className="text-xs font-semibold mb-1" style={{ opacity: 0.7 }}>
                                <i className="fas fa-store mr-1"></i> Demand
                              </p>
                              <p className={`font-bold text-sm ${getDemandColor(crop.marketDemand || 'Medium').split(' ')[0]}`}>
                                {crop.marketDemand || 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Fertilizer */}
                          {crop.fertilizer && (
                            <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                              <h4 className="font-bold text-gray-700 mb-2 text-sm flex items-center gap-2">
                                <i className="fas fa-flask text-green-500"></i>
                                Fertilizer Guide
                              </h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <p><span className="font-semibold text-gray-600">N:</span> <span className="text-gray-800">{crop.fertilizer.nitrogen || 'N/A'}</span></p>
                                <p><span className="font-semibold text-gray-600">P:</span> <span className="text-gray-800">{crop.fertilizer.phosphorus || 'N/A'}</span></p>
                                <p><span className="font-semibold text-gray-600">K:</span> <span className="text-gray-800">{crop.fertilizer.potassium || 'N/A'}</span></p>
                                <p><span className="font-semibold text-gray-600">Organic:</span> <span className="text-gray-800">{crop.fertilizer.organicMatter || 'N/A'}</span></p>
                              </div>
                            </div>
                          )}

                          {/* Advice Button */}
                          <button
                            onClick={() => getCropSpecificAdvice(crop.cropName)}
                            disabled={adviceLoading}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-2xl transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
                          >
                            {adviceLoading && selectedCrop === crop.cropName ? (
                              <><i className="fas fa-spinner fa-spin"></i> Loading Advice...</>
                            ) : (
                              <><i className="fas fa-lightbulb"></i> Get AI Advice for {crop.cropName}</>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Groq AI View */}
                {activeView === 'groq' && (
                  <div className="bg-white rounded-3xl shadow-card border border-gray-100/60 overflow-hidden animate-fade-in">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <i className="fas fa-robot"></i> AI Strategy Analysis
                      </h2>
                      <p className="text-blue-100 text-sm mt-1">Overall farming strategy for your conditions</p>
                    </div>
                    {groqAnalysis ? (
                      <div className="p-5 whitespace-pre-wrap text-gray-700 leading-relaxed text-sm max-h-[500px] overflow-y-auto">
                        {groqAnalysis}
                      </div>
                    ) : (
                      <div className="text-center p-10 text-gray-400">
                        {loading ? 'Fetching analysis...' : 'AI analysis not available'}
                      </div>
                    )}
                  </div>
                )}

                {/* Crop Advice View */}
                {activeView === 'advice' && cropAdvice && (
                  <div className="bg-white rounded-3xl shadow-card border border-gray-100/60 overflow-hidden animate-fade-in">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-5">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <i className="fas fa-lightbulb"></i> Advice for {selectedCrop}
                      </h2>
                      <p className="text-purple-100 text-sm mt-1">Step-by-step guidance from AI</p>
                    </div>
                    <div className="p-5 whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                      {cropAdvice}
                    </div>
                    <div className="px-5 pb-5">
                      <button
                        onClick={() => setActiveView('results')}
                        className="text-gray-500 hover:text-gray-700 font-semibold text-sm transition-colors flex items-center gap-1"
                      >
                        <i className="fas fa-arrow-left"></i> Back to Recommendations
                      </button>
                    </div>
                  </div>
                )}

                {/* Soil Plan View */}
                {activeView === 'soilplan' && soilPlan && (
                  <div className="bg-white rounded-3xl shadow-card border border-gray-100/60 overflow-hidden animate-fade-in">
                    <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-5">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <i className="fas fa-seedling"></i> Soil Improvement Plan
                      </h2>
                      <p className="text-teal-100 text-sm mt-1">12-month strategy to optimize your soil</p>
                    </div>
                    <div className="p-5 whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                      {soilPlan}
                    </div>
                    <div className="px-5 pb-5">
                      <button
                        onClick={() => setActiveView('results')}
                        className="text-gray-500 hover:text-gray-700 font-semibold text-sm transition-colors flex items-center gap-1"
                      >
                        <i className="fas fa-arrow-left"></i> Back to Recommendations
                      </button>
                    </div>
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
