import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { API_URL } from '../../utils/api';
import BackButton from '../../components/BackButton';

// Reusable Components
const FormInput = ({ label, type, name, value, onChange, placeholder, icon, unit }) => (
  <div className="space-y-1 text-left">
    <label className="text-secondary text-sm font-semibold flex items-center gap-2">
      <i className={`fas ${icon} text-primary/70`}></i> {label}
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-field pr-12 font-medium"
        required
      />
      {unit && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
          {unit}
        </span>
      )}
    </div>
  </div>
);

const RangeInput = ({ label, name, value, min, max, step, onChange, icon, unit, colorClass = "bg-green-500" }) => (
  <div className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
    <div className="flex justify-between items-center">
      <label className="text-secondary text-sm font-semibold flex items-center gap-2">
        <i className={`fas ${icon} text-primary/70`}></i> {label}
      </label>
      <span className="bg-white px-3 py-1 rounded-full text-sm font-bold shadow-sm border border-gray-100 text-gray-700">
        {value} {unit}
      </span>
    </div>
    <div className="relative pt-2">
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        step={step || "1"}
        value={value}
        onChange={onChange}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-400 font-medium mt-2 px-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  </div>
);

const CropYieldPrediction = () => {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    cropName: '',
    area: '',
    city: '',
    soil: { n: 100, p: 30, k: 120, ph: 6.5, organicCarbon: 1.5 },
    fertilizer: { nitrogen: 50, phosphorus: 20, potassium: 30 }
  });

  const crops = [
    "Wheat", "Rice", "Maize", "Cotton", "Sugarcane", 
    "Soybean", "Groundnut", "Tomato", "Potato", "Onion"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (e, category) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [category]: { ...prev[category], [name]: parseFloat(value) || 0 }
    }));
  };

  const predictYield = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/crops/yield-prediction`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(response.data);
      toast.success("Yield prediction generated successfully");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to generate prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0faf0] pb-24">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <BackButton />
          <div>
            <h1 className="text-xl font-bold text-gray-800">Crop Yield Prediction</h1>
            <p className="text-sm text-gray-500 font-medium">AI-powered harvest estimates</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-6 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-card p-6 md:p-8 animate-fade-in-up">
          <form onSubmit={predictYield} className="space-y-8">
            
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                <i className="fas fa-info-circle text-primary"></i> Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1 text-left">
                  <label className="text-secondary text-sm font-semibold flex items-center gap-2">
                    <i className="fas fa-seedling text-primary/70"></i> Crop Name
                  </label>
                  <select
                    name="cropName"
                    value={formData.cropName}
                    onChange={handleInputChange}
                    className="select-field"
                    required
                  >
                    <option value="">Select a crop...</option>
                    {crops.map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>
                <FormInput
                  label="Farm Area"
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="e.g. 5"
                  icon="fa-vector-square"
                  unit="Acres"
                />
                <FormInput
                  label="City / Location"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter city for weather"
                  icon="fa-map-marker-alt"
                  unit=""
                />
              </div>
            </div>

            {/* Soil Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                <i className="fas fa-flask text-primary"></i> Soil Nutrients
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <RangeInput
                  label="Nitrogen (N)" name="n" min="0" max="300"
                  value={formData.soil.n} onChange={(e) => handleNestedChange(e, 'soil')}
                  icon="fa-n" unit="mg/kg"
                />
                <RangeInput
                  label="Phosphorus (P)" name="p" min="0" max="150"
                  value={formData.soil.p} onChange={(e) => handleNestedChange(e, 'soil')}
                  icon="fa-p" unit="mg/kg"
                />
                <RangeInput
                  label="Potassium (K)" name="k" min="0" max="500"
                  value={formData.soil.k} onChange={(e) => handleNestedChange(e, 'soil')}
                  icon="fa-k" unit="mg/kg"
                />
                <RangeInput
                  label="Soil pH" name="ph" min="4.0" max="9.0" step="0.1"
                  value={formData.soil.ph} onChange={(e) => handleNestedChange(e, 'soil')}
                  icon="fa-vial" unit="pH" colorClass="bg-blue-500"
                />
                <RangeInput
                  label="Organic Carbon" name="organicCarbon" min="0" max="5" step="0.1"
                  value={formData.soil.organicCarbon} onChange={(e) => handleNestedChange(e, 'soil')}
                  icon="fa-leaf" unit="%" colorClass="bg-amber-500"
                />
              </div>
            </div>

            {/* Fertilizer Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                <i className="fas fa-box text-primary"></i> Fertilizer Application (per acre)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FormInput
                  label="Urea / Nitrogen"
                  type="number"
                  name="nitrogen"
                  value={formData.fertilizer.nitrogen}
                  onChange={(e) => handleNestedChange(e, 'fertilizer')}
                  placeholder="e.g. 50"
                  icon="fa-vial"
                  unit="kg"
                />
                <FormInput
                  label="DAP / Phosphorus"
                  type="number"
                  name="phosphorus"
                  value={formData.fertilizer.phosphorus}
                  onChange={(e) => handleNestedChange(e, 'fertilizer')}
                  placeholder="e.g. 20"
                  icon="fa-vial"
                  unit="kg"
                />
                <FormInput
                  label="Potash / Potassium"
                  type="number"
                  name="potassium"
                  value={formData.fertilizer.potassium}
                  onChange={(e) => handleNestedChange(e, 'fertilizer')}
                  placeholder="e.g. 30"
                  icon="fa-vial"
                  unit="kg"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.cropName || !formData.area || !formData.city}
              className="btn-primary w-full flex justify-center items-center gap-2 text-lg py-4"
            >
              {loading ? (
                <><i className="fas fa-circle-notch fa-spin text-xl"></i> Analyzing Data...</>
              ) : (
                <><i className="fas fa-chart-line text-xl"></i> Predict Expected Yield</>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {result && result.prediction && (
          <div className="mt-8 space-y-6 animate-stagger">
            {/* Live Weather Used */}
            <div className="bg-blue-50/50 rounded-2xl p-4 flex flex-wrap items-center justify-between border border-blue-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <i className="fas fa-cloud-sun"></i>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-900">Live Weather Context ({formData.city})</h3>
                  <p className="text-xs text-blue-700">Used for this prediction</p>
                </div>
              </div>
              <div className="flex gap-4 mt-3 sm:mt-0 px-2 sm:px-0 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                <div className="bg-white px-3 py-1.5 rounded-xl border border-blue-200/50 shadow-sm whitespace-nowrap">
                  <i className="fas fa-temperature-half text-amber-500 mr-2"></i>
                  <span className="font-bold text-gray-700">{result.weatherUsed.temp}°C</span>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-xl border border-blue-200/50 shadow-sm whitespace-nowrap">
                  <i className="fas fa-droplet text-blue-500 mr-2"></i>
                  <span className="font-bold text-gray-700">{result.weatherUsed.humidity}%</span>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-xl border border-blue-200/50 shadow-sm whitespace-nowrap">
                  <i className="fas fa-cloud-rain text-cyan-500 mr-2"></i>
                  <span className="font-bold text-gray-700">{result.weatherUsed.rainfall}mm</span>
                </div>
              </div>
            </div>

            {/* Main Result Card */}
            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-3xl p-6 shadow-xl relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <i className="fas fa-wheat-awn text-9xl"></i>
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-green-100 font-medium tracking-wide uppercase text-sm mb-1">Estimated Total Production</h2>
                    <div className="text-4xl md:text-5xl font-extrabold mb-2">
                      {result.prediction.totalProduction}
                    </div>
                    <div className="text-green-50 flex items-center gap-2">
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                        {result.prediction.estimatedYield} {result.prediction.yieldUnit}
                      </span>
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                        {formData.area} Acres
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl flex flex-col items-center">
                    <span className="text-xs text-green-100 uppercase font-bold tracking-wider mb-1">Confidence</span>
                    <span className={`text-lg font-bold px-3 py-1 rounded-xl w-full text-center ${
                      result.prediction.confidenceLevel === 'High' ? 'bg-green-500 text-white' : 
                      result.prediction.confidenceLevel === 'Medium' ? 'bg-yellow-400 text-yellow-900' : 
                      'bg-red-500 text-white'
                    }`}>
                      {result.prediction.confidenceLevel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Factor Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.prediction.factorsAnalysis?.map((factor, index) => (
                <div key={index} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-800">{factor.factor}</h3>
                    <span className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      factor.impact === 'Positive' ? 'bg-green-100 text-green-600' :
                      factor.impact === 'Negative' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <i className={`fas ${
                        factor.impact === 'Positive' ? 'fa-arrow-up' :
                        factor.impact === 'Negative' ? 'fa-arrow-down' :
                        'fa-minus'
                      }`}></i>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{factor.reason}</p>
                </div>
              ))}
            </div>

            {/* Recommendations & Storage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-lg">
                    <i className="fas fa-lightbulb"></i>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">Yield Optimization</h3>
                </div>
                <ul className="space-y-3">
                  {result.prediction.optimizationTips?.map((tip, index) => (
                    <li key={index} className="flex gap-3 text-sm text-gray-600">
                      <i className="fas fa-check-circle text-green-500 mt-1 flex-shrink-0"></i>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-lg">
                    <i className="fas fa-warehouse"></i>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">Storage & Logistics</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                  {result.prediction.storageAndLogistics}
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CropYieldPrediction;
