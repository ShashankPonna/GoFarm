import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';

const CropDiseaseDetection = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setImageFile(file);
      setResult(null);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleImageUpload(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const analyzeImage = async () => {
    if (!imageFile) return;
    setIsAnalyzing(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const response = await fetch('/api/cotton/detect', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'LOW_CONFIDENCE') {
          setResult({
            disease: 'Low Confidence Detection',
            confidence: data.confidence || 0,
            severity: 'Unknown',
            treatment: 'Please take a clearer, well-lit photo of the affected leaves for accurate diagnosis.',
            prevention: ['Take clear photos showing affected areas', 'Ensure good lighting', 'Focus on leaf symptoms'],
            symptoms: [data.message || 'Image quality too low for accurate detection'],
            affectedCrops: [],
            noticeType: 'low_confidence'
          });
        } else {
          throw new Error(data.message || 'Detection failed');
        }
      } else if (data && data.success && data.data) {
        const d = data.data;
        const recs = d.recommendations || {};

        setResult({
          disease: d.disease?.name || d.disease_name || 'Healthy',
          severity: recs.severity_level || d.severity_level || 'Unknown',
          confidence: d.disease?.confidence_percent || d.confidence_score_percent || 0,
          treatment: recs.organic_treatment?.join(', ') || d.chemical_treatment?.recommended_product || 'Consult agronomist',
          prevention: recs.prevention_tips || d.preventive_measures || [],
          symptoms: recs.symptom_description ? [recs.symptom_description] : (d.observed_symptoms || []),
          diseaseCause: recs.disease_cause || 'Unknown',
          organicTreatment: recs.organic_treatment || [],
          chemicalTreatment: recs.chemical_treatment || [],
          fertilizerAdvice: recs.fertilizer_advice || '',
          irrigationAdvice: recs.irrigation_advice || '',
          affectedCrops: recs.affected_crops?.length ? recs.affected_crops : (d.crop_name ? [d.crop_name] : ['Cotton']),
          image_url: d.image_url || '',
          notes: d.farmer_summary || '',
          model: d.model_used || 'AI Detection',
          shortDescription: d.short_description || ''
        });
      } else {
        setResult({
          disease: 'Detection Error', confidence: 0, severity: 'Unknown',
          treatment: 'Could not analyze image.', prevention: [],
          symptoms: [data.message || 'Unknown error'], affectedCrops: [],
          organicTreatment: [], chemicalTreatment: [],
          fertilizerAdvice: '', irrigationAdvice: '', diseaseCause: ''
        });
      }
    } catch (err) {
      setResult({
        disease: 'Detection Error', confidence: 0, severity: 'Unknown',
        treatment: 'Could not analyze image.', prevention: [],
        symptoms: [err.message], affectedCrops: [],
        organicTreatment: [], chemicalTreatment: [],
        fertilizerAdvice: '', irrigationAdvice: '', diseaseCause: ''
      });
    }
    setIsAnalyzing(false);
  };

  const resetAnalysis = () => {
    setImage(null);
    setImageFile(null);
    setResult(null);
    setIsAnalyzing(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'text-red-700 bg-red-100 border-red-200';
      case 'Medium': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'Low': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 80) return 'text-green-600';
    if (conf >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-24">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-green-100/50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <BackButton />
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
              <i className="fas fa-microscope text-white"></i>
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-gray-800">Disease Detection</h1>
              <p className="text-xs text-gray-400 font-medium">AI-powered crop diagnosis</p>
            </div>
            <div className="ml-auto hidden sm:flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-xl">
              <i className="fas fa-brain text-green-500 text-xs"></i>
              <span className="text-xs font-bold text-green-700">AI Powered</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Upload Section */}
            {!image ? (
              <div className="bg-white rounded-3xl shadow-card border border-gray-100/60 p-6 animate-fade-in">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fas fa-camera text-green-600"></i>
                  Upload Crop Photo
                </h2>

                <div
                  className={`relative border-3 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 ${dragActive
                    ? 'border-green-500 bg-green-50 scale-[1.02]'
                    : 'border-gray-200 hover:border-green-400 hover:bg-green-50/30'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileInput}
                    className="hidden"
                  />

                  <div className="space-y-5">
                    <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto">
                      <i className="fas fa-cloud-upload-alt text-3xl text-green-500"></i>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-700 mb-2">
                        Take or Upload a Photo
                      </h3>
                      <p className="text-gray-400 text-sm mb-5">
                        Tap the button below to use your camera or choose from gallery
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="btn-primary flex items-center justify-center gap-2 text-base"
                      >
                        <i className="fas fa-camera"></i>
                        Take Photo / Choose File
                      </button>
                    </div>

                    <p className="text-xs text-gray-400">
                      JPG, PNG, JPEG • Max 10MB
                    </p>
                  </div>
                </div>

                {/* Tips */}
                <div className="mt-5 bg-amber-50 rounded-2xl p-4 border border-amber-100">
                  <h3 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
                    <i className="fas fa-lightbulb text-amber-500"></i>
                    Tips for Best Results
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      'Clear, well-lit photos',
                      'Focus on affected leaves',
                      'Avoid blurry/distant shots',
                      'Multiple angles help'
                    ].map((tip, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <i className="fas fa-check-circle text-green-500 text-xs flex-shrink-0"></i>
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Image Preview */}
                <div className="bg-white rounded-3xl shadow-card border border-gray-100/60 overflow-hidden animate-fade-in">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                    <span className="font-bold text-gray-700 text-sm flex items-center gap-2">
                      <i className="fas fa-image text-green-600"></i>
                      Your Photo
                    </span>
                    <button
                      onClick={resetAnalysis}
                      className="text-gray-400 hover:text-red-500 text-sm font-semibold transition-colors flex items-center gap-1"
                    >
                      <i className="fas fa-times"></i> Remove
                    </button>
                  </div>
                  <div className="p-4">
                    <img
                      src={image}
                      alt="Crop"
                      className="w-full h-auto max-h-80 object-contain bg-gray-50 rounded-2xl"
                    />
                  </div>
                </div>

                {/* Analyze Button */}
                {!result && !isAnalyzing && (
                  <button
                    onClick={analyzeImage}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-5 rounded-3xl shadow-lg hover:shadow-xl font-extrabold text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    <i className="fas fa-search-plus text-xl"></i>
                    Analyze with AI
                  </button>
                )}

                {/* Loading */}
                {isAnalyzing && (
                  <div className="bg-white rounded-3xl shadow-card border border-green-100 p-10 text-center animate-fade-in">
                    <div className="relative mx-auto w-20 h-20 mb-5">
                      <div className="w-20 h-20 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <i className="fas fa-brain text-green-600 text-xl"></i>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-1">Analyzing Your Crop...</h3>
                    <p className="text-gray-400 text-sm">Our AI is examining for diseases</p>
                    <div className="mt-4 flex justify-center gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2.5 h-2.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Results */}
                {result && (
                  <div className="space-y-4 animate-fade-in-up">
                    {/* Disease & Confidence Header */}
                    <div className="bg-white rounded-3xl shadow-card border border-gray-100/60 overflow-hidden">
                      <div className="bg-gradient-to-r from-green-600 to-teal-600 p-5">
                        <div className="flex items-center gap-2 text-white mb-1">
                          <i className="fas fa-check-circle"></i>
                          <span className="font-bold">Analysis Complete</span>
                        </div>
                      </div>

                      <div className="p-5">
                        {/* Disease Name */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Detected Disease</p>
                            <h3 className="text-2xl font-extrabold text-gray-800">{result.disease}</h3>
                          </div>
                          <div className="text-center">
                            <div className={`text-3xl font-extrabold ${getConfidenceColor(result.confidence)}`}>
                              {result.confidence}%
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Confidence</p>
                          </div>
                        </div>

                        {/* Severity Badge */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-600">Severity:</span>
                          <span className={`px-4 py-1.5 rounded-xl font-bold text-sm border ${getSeverityColor(result.severity)}`}>
                            {result.severity === 'High' && <i className="fas fa-exclamation-triangle mr-1"></i>}
                            {result.severity}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Symptoms */}
                    {result.symptoms && result.symptoms.length > 0 && (
                      <div className="bg-white rounded-3xl shadow-card border border-gray-100/60 p-5">
                        <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                            <i className="fas fa-exclamation-triangle text-amber-500 text-xs"></i>
                          </div>
                          Symptoms & Causes
                        </h4>
                        <ul className="space-y-2 mb-3">
                          {result.symptoms.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="text-amber-400 mt-0.5 flex-shrink-0">●</span> {s}
                            </li>
                          ))}
                        </ul>
                        {result.diseaseCause && result.diseaseCause !== 'Unknown' && (
                          <div className="pt-3 border-t border-gray-100">
                            <p className="text-xs font-bold text-gray-500 mb-1">CAUSE</p>
                            <p className="text-sm text-gray-600">{result.diseaseCause}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Treatment Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Organic */}
                      <div className="bg-white rounded-3xl shadow-card border border-gray-100/60 p-5">
                        <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
                            <i className="fas fa-leaf text-green-500 text-xs"></i>
                          </div>
                          Organic Treatment
                        </h4>
                        {result.organicTreatment && result.organicTreatment.length > 0 ? (
                          <ul className="space-y-2">
                            {result.organicTreatment.map((t, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span> {t}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-600">{result.treatment}</p>
                        )}
                      </div>

                      {/* Chemical */}
                      <div className="bg-white rounded-3xl shadow-card border border-gray-100/60 p-5">
                        <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
                            <i className="fas fa-flask text-red-500 text-xs"></i>
                          </div>
                          Chemical Treatment
                        </h4>
                        {result.chemicalTreatment && result.chemicalTreatment.length > 0 ? (
                          <ul className="space-y-2">
                            {result.chemicalTreatment.map((t, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                <span className="text-red-400 mt-0.5 flex-shrink-0">•</span> {t}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No specific chemical treatments</p>
                        )}
                      </div>
                    </div>

                    {/* Farming Advice */}
                    {(result.fertilizerAdvice || result.irrigationAdvice) && (
                      <div className="bg-white rounded-3xl shadow-card border border-gray-100/60 p-5">
                        <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                            <i className="fas fa-seedling text-amber-500 text-xs"></i>
                          </div>
                          Farming Advice
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {result.fertilizerAdvice && (
                            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                              <p className="text-xs font-bold text-amber-600 mb-1 flex items-center gap-1">
                                <i className="fas fa-box"></i> FERTILIZER
                              </p>
                              <p className="text-sm text-gray-600">{result.fertilizerAdvice}</p>
                            </div>
                          )}
                          {result.irrigationAdvice && (
                            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                              <p className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1">
                                <i className="fas fa-tint"></i> IRRIGATION
                              </p>
                              <p className="text-sm text-gray-600">{result.irrigationAdvice}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Prevention */}
                    <div className="bg-white rounded-3xl shadow-card border border-gray-100/60 p-5">
                      <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                          <i className="fas fa-shield-alt text-blue-500 text-xs"></i>
                        </div>
                        Prevention Tips
                      </h4>
                      {Array.isArray(result.prevention) && result.prevention.length > 0 ? (
                        <ul className="space-y-2">
                          {result.prevention.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="text-blue-400 mt-0.5 flex-shrink-0">✓</span> {tip}
                            </li>
                          ))}
                        </ul>
                      ) : result.prevention ? (
                        <p className="text-sm text-gray-600">{result.prevention}</p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No specific tips</p>
                      )}
                    </div>

                    {/* Affected Crops */}
                    {result.affectedCrops && result.affectedCrops.length > 0 && (
                      <div className="bg-white rounded-3xl shadow-card border border-gray-100/60 p-5">
                        <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
                            <i className="fas fa-seedling text-purple-500 text-xs"></i>
                          </div>
                          Commonly Affected Crops
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.affectedCrops.map((crop, i) => (
                            <span key={i} className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-xl font-bold text-sm border border-purple-100 capitalize">
                              {crop}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={resetAnalysis}
                        className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm"
                      >
                        <i className="fas fa-redo"></i>
                        Scan Another
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-green-600 to-teal-600 text-white rounded-3xl shadow-card p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2 opacity-90">
                <i className="fas fa-chart-line"></i> Detection Stats
              </h3>
              <div className="space-y-3">
                {[
                  { val: '98.5%', label: 'Accuracy' },
                  { val: '50+', label: 'Diseases' },
                  { val: '10K+', label: 'Scans Done' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-3">
                    <span className="text-2xl font-extrabold">{stat.val}</span>
                    <span className="text-sm opacity-80">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Diseases */}
            <div className="bg-white rounded-3xl shadow-card border border-gray-100/60 p-5">
              <h3 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
                <i className="fas fa-virus text-red-500"></i> Common Diseases
              </h3>
              <div className="space-y-2">
                {['Late Blight', 'Powdery Mildew', 'Leaf Rust', 'Bacterial Wilt'].map((disease, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                    <span className="font-semibold text-gray-600">{disease}</span>
                    <i className="fas fa-chevron-right text-gray-300 text-xs"></i>
                  </div>
                ))}
              </div>
            </div>

            {/* Crop Recommendation CTA */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-3xl shadow-card border border-amber-200/50 p-5">
              <h3 className="font-bold text-sm text-gray-700 mb-2 flex items-center gap-2">
                <i className="fas fa-leaf text-green-500"></i> Crop Recommendation
              </h3>
              <p className="text-gray-500 text-xs mb-3">
                Find the best crops for your soil and weather conditions.
              </p>
              <button
                onClick={() => navigate('/farmer/crop-recommendation')}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-2xl font-bold text-sm hover:from-green-700 hover:to-green-800 transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <i className="fas fa-search"></i>
                Find Best Crops
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropDiseaseDetection;
