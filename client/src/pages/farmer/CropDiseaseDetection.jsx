import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const CropDiseaseDetection = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const diseaseDatabase = [
    {
      disease: 'Late Blight',
      confidence: 92,
      severity: 'High',
      treatment: 'Apply copper-based fungicide immediately. Remove infected leaves and improve air circulation.',
      prevention: 'Use resistant varieties, avoid overhead watering, and maintain proper plant spacing.',
      symptoms: ['Dark brown spots on leaves', 'White fungal growth', 'Rapid leaf decay'],
      affectedCrops: ['Tomato', 'Potato']
    },
    {
      disease: 'Powdery Mildew',
      confidence: 88,
      severity: 'Medium',
      treatment: 'Apply sulfur-based fungicide or neem oil. Prune affected areas and increase sunlight exposure.',
      prevention: 'Ensure good air circulation, avoid overcrowding, and water at the base of plants.',
      symptoms: ['White powdery coating', 'Yellowing leaves', 'Stunted growth'],
      affectedCrops: ['Cucumber', 'Squash', 'Pumpkin']
    },
    {
      disease: 'Leaf Rust',
      confidence: 85,
      severity: 'Medium',
      treatment: 'Use systemic fungicides and remove infected plant debris. Apply at first sign of infection.',
      prevention: 'Plant resistant varieties, rotate crops, and maintain field hygiene.',
      symptoms: ['Orange-brown pustules', 'Leaf yellowing', 'Premature leaf drop'],
      affectedCrops: ['Wheat', 'Barley', 'Oats']
    },
    {
      disease: 'Bacterial Wilt',
      confidence: 90,
      severity: 'High',
      treatment: 'Remove and destroy infected plants. Use crop rotation and resistant varieties.',
      prevention: 'Control insect vectors, use disease-free seeds, and practice good sanitation.',
      symptoms: ['Sudden wilting', 'Yellowing leaves', 'Vascular discoloration'],
      affectedCrops: ['Tomato', 'Eggplant', 'Pepper']
    }
  ];

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

      // Check for low confidence error
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
        // Map backend fields to frontend expected fields (Hybrid ViT-Groq system)
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
          disease: 'Detection Error',
          confidence: 0,
          severity: 'Unknown',
          treatment: 'Could not analyze image.',
          prevention: [],
          symptoms: [data.message || 'Unknown error'],
          affectedCrops: [],
          organicTreatment: [],
          chemicalTreatment: [],
          fertilizerAdvice: '',
          irrigationAdvice: '',
          diseaseCause: ''
        });
      }
    } catch (err) {
      setResult({
        disease: 'Detection Error',
        confidence: 0,
        severity: 'Unknown',
        treatment: 'Could not analyze image.',
        prevention: [],
        symptoms: [err.message],
        affectedCrops: [],
        organicTreatment: [],
        chemicalTreatment: [],
        fertilizerAdvice: '',
        irrigationAdvice: '',
        diseaseCause: ''
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
      case 'High': return 'text-red-600 bg-red-100 border-red-300';
      case 'Medium': return 'text-orange-600 bg-orange-100 border-orange-300';
      case 'Low': return 'text-green-600 bg-green-100 border-green-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10">
          <div className="absolute inset-0 animate-pulse" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)'
          }}></div>
        </div>
        <div className="container mx-auto px-6 py-8 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => window.history.back()}
                className="mr-5 hover:bg-white hover:bg-opacity-20 p-3 rounded-xl transition-all transform hover:scale-110 hover:-translate-x-1"
              >
                <i className="fas fa-arrow-left text-2xl"></i>
              </button>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold flex items-center mb-2">
                  <i className="fas fa-microscope mr-4 animate-pulse"></i>
                  AI Crop Disease Detection
                </h1>
                <p className="text-lg text-green-100">Upload crop images for instant disease diagnosis & treatment recommendations 🌱</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-6 py-3 flex items-center space-x-3">
                <i className="fas fa-brain text-2xl"></i>
                <span className="font-semibold">AI Powered</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Upload & Analysis Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Section */}
            {!image ? (
              <div className="bg-white rounded-3xl shadow-2xl p-10 border-2 border-gray-100">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <i className="fas fa-cloud-upload-alt text-green-600 mr-3"></i>
                  Upload Crop Image
                </h2>

                <div
                  className={`relative border-4 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${dragActive
                      ? 'border-green-500 bg-green-50 scale-105'
                      : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
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
                    onChange={handleFileInput}
                    className="hidden"
                  />

                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                        <i className="fas fa-image text-white text-5xl"></i>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-gray-700 mb-3">
                        Drag & Drop Your Image Here
                      </h3>
                      <p className="text-gray-500 text-lg mb-6">
                        or click the button below to browse
                      </p>
                    </div>

                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-4 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-xl hover:shadow-2xl font-bold text-lg transform hover:scale-105 inline-flex items-center"
                    >
                      <i className="fas fa-folder-open mr-3 text-xl"></i>
                      Browse Files
                    </button>

                    <p className="text-sm text-gray-400 mt-4">
                      Supported formats: JPG, PNG, JPEG (Max 10MB)
                    </p>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 border-2 border-blue-100">
                  <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center">
                    <i className="fas fa-lightbulb text-yellow-500 mr-2 text-xl"></i>
                    Tips for Best Results
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-600 mr-3 mt-1"></i>
                      <span>Take clear, well-lit photos of affected plant parts</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-600 mr-3 mt-1"></i>
                      <span>Focus on leaves, stems, or fruits showing symptoms</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-600 mr-3 mt-1"></i>
                      <span>Avoid blurry or distant shots for accurate detection</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-600 mr-3 mt-1"></i>
                      <span>Include multiple angles if possible</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Image Preview */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-100">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
                    <h2 className="text-2xl font-bold flex items-center justify-between">
                      <span className="flex items-center">
                        <i className="fas fa-image mr-3"></i>
                        Uploaded Image
                      </span>
                      <button
                        onClick={resetAnalysis}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-xl transition-all text-sm font-semibold"
                      >
                        <i className="fas fa-redo mr-2"></i>
                        Upload New
                      </button>
                    </h2>
                  </div>
                  <div className="p-8">
                    <div className="relative rounded-2xl overflow-hidden shadow-xl">
                      <img
                        src={image}
                        alt="Crop"
                        className="w-full h-auto max-h-96 object-contain bg-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Analyze Button */}
                {!result && !isAnalyzing && (
                  <button
                    onClick={analyzeImage}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-6 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-2xl hover:shadow-3xl font-bold text-2xl transform hover:scale-105 flex items-center justify-center group"
                  >
                    <i className="fas fa-search-plus mr-4 text-3xl group-hover:scale-110 transition-transform"></i>
                    Analyze Image with AI
                    <i className="fas fa-arrow-right ml-4 group-hover:translate-x-2 transition-transform"></i>
                  </button>
                )}

                {/* Analyzing Animation */}
                {isAnalyzing && (
                  <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border-2 border-green-200">
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div className="w-24 h-24 border-8 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <i className="fas fa-brain text-green-600 text-3xl animate-pulse"></i>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Analyzing Image...</h3>
                    <p className="text-gray-600 text-lg">Our AI is examining your crop for diseases</p>
                    <div className="mt-6 flex justify-center space-x-2">
                      <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}

                {/* Results */}
                {result && (
                  <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-100 animate-fadeIn">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                      <h2 className="text-3xl font-bold flex items-center">
                        <i className="fas fa-check-circle mr-3 text-4xl"></i>
                        Analysis Complete
                      </h2>
                    </div>

                    <div className="p-8 space-y-6">
                      {/* Disease Name & Confidence */}
                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border-2 border-red-200">
                        <div>
                          <p className="text-sm text-gray-600 mb-1 font-medium">Detected Disease</p>
                          <h3 className="text-3xl font-bold text-gray-800">{result.disease}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1 font-medium">Confidence</p>
                          <div className="flex items-center space-x-2">
                            <div className="text-4xl font-bold text-green-600">{result.confidence}%</div>
                            <div className="w-16 h-16 rounded-full border-4 border-green-600 flex items-center justify-center">
                              <i className="fas fa-check text-green-600 text-2xl"></i>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Severity */}
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-700 font-semibold text-lg">Severity Level:</span>
                        <span className={`px-6 py-2 rounded-full font-bold text-lg border-2 ${getSeverityColor(result.severity)}`}>
                          {result.severity}
                        </span>
                      </div>

                      {/* Symptoms & Causes */}
                      <div className="bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-200">
                        <h4 className="font-bold text-xl text-gray-800 mb-4 flex items-center">
                          <i className="fas fa-exclamation-triangle text-yellow-600 mr-3"></i>
                          Symptoms & Causes
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <p className="font-semibold text-gray-800 mb-2">Detailed Symptoms:</p>
                            <ul className="space-y-2">
                              {Array.isArray(result.symptoms) ? result.symptoms.map((symptom, idx) => (
                                <li key={idx} className="flex items-start text-gray-700">
                                  <i className="fas fa-circle text-yellow-600 mr-3 mt-1 text-xs"></i>
                                  <span className="text-lg">{symptom}</span>
                                </li>
                              )) : null}
                            </ul>
                          </div>
                          {result.diseaseCause && (
                            <div className="pt-4 border-t border-yellow-200">
                              <p className="font-semibold text-gray-800 mb-2">Common Causes:</p>
                              <p className="text-gray-700 text-lg leading-relaxed">{result.diseaseCause}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Treatments Grid */}
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Organic Treatment */}
                        <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                          <h4 className="font-bold text-xl text-gray-800 mb-4 flex items-center">
                            <i className="fas fa-leaf text-green-600 mr-3"></i>
                            Organic Treatment
                          </h4>
                          {result.organicTreatment && result.organicTreatment.length > 0 ? (
                            <ul className="space-y-3">
                              {result.organicTreatment.map((treatment, idx) => (
                                <li key={idx} className="flex items-start text-gray-700">
                                  <i className="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                                  <span className="text-base">{treatment}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-700 leading-relaxed text-lg">{result.treatment}</p>
                          )}
                        </div>

                        {/* Chemical Treatment */}
                        <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                          <h4 className="font-bold text-xl text-gray-800 mb-4 flex items-center">
                            <i className="fas fa-flask text-red-600 mr-3"></i>
                            Chemical Treatment
                          </h4>
                          {result.chemicalTreatment && result.chemicalTreatment.length > 0 ? (
                            <ul className="space-y-3">
                              {result.chemicalTreatment.map((treatment, idx) => (
                                <li key={idx} className="flex items-start text-gray-700">
                                  <i className="fas fa-exclamation-circle text-red-500 mr-3 mt-1"></i>
                                  <span className="text-base">{treatment}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 italic">No specific chemical treatments available</p>
                          )}
                        </div>
                      </div>

                      {/* Agriculture Advice */}
                      {(result.fertilizerAdvice || result.irrigationAdvice) && (
                        <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-200">
                          <h4 className="font-bold text-xl text-gray-800 mb-4 flex items-center">
                            <i className="fas fa-seedling text-orange-600 mr-3"></i>
                            Agricultural Advice
                          </h4>
                          <div className="grid md:grid-cols-2 gap-6">
                            {result.fertilizerAdvice && (
                              <div>
                                <p className="font-semibold text-gray-800 mb-2 flex items-center">
                                  <i className="fas fa-boxes text-orange-500 mr-2 text-sm"></i>
                                  Fertilizer Feedback:
                                </p>
                                <p className="text-gray-700 leading-relaxed">{result.fertilizerAdvice}</p>
                              </div>
                            )}
                            {result.irrigationAdvice && (
                              <div>
                                <p className="font-semibold text-gray-800 mb-2 flex items-center">
                                  <i className="fas fa-tint text-blue-500 mr-2 text-sm"></i>
                                  Irrigation Tips:
                                </p>
                                <p className="text-gray-700 leading-relaxed">{result.irrigationAdvice}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Prevention */}
                      <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                        <h4 className="font-bold text-xl text-gray-800 mb-4 flex items-center">
                          <i className="fas fa-shield-alt text-blue-600 mr-3"></i>
                          Prevention Tips
                        </h4>
                        {Array.isArray(result.prevention) ? (
                          <ul className="space-y-2">
                            {result.prevention.map((tip, idx) => (
                              <li key={idx} className="flex items-start text-gray-700">
                                <i className="fas fa-check text-blue-600 mr-3 mt-1 text-sm"></i>
                                <span className="text-base">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        ) : result.prevention ? (
                          <p className="text-gray-700 leading-relaxed text-lg">{result.prevention}</p>
                        ) : (
                          <p className="text-gray-500 italic">No specific prevention tips available</p>
                        )}
                      </div>

                      {/* Affected Crops */}
                      <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200">
                        <h4 className="font-bold text-xl text-gray-800 mb-4 flex items-center">
                          <i className="fas fa-seedling text-purple-600 mr-3"></i>
                          Commonly Affected Crops
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {Array.isArray(result.affectedCrops) ? result.affectedCrops.map((crop, idx) => (
                            <span key={idx} className="bg-purple-200 text-purple-800 px-4 py-2 rounded-full font-semibold capitalize">
                              {crop}
                            </span>
                          )) : null}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-4">
                        <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-bold text-lg">
                          <i className="fas fa-download mr-2"></i>
                          Download Report
                        </button>
                        <button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg font-bold text-lg">
                          <i className="fas fa-share-alt mr-2"></i>
                          Share Results
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Stats */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <h3 className="font-bold text-xl mb-6 flex items-center">
                  <i className="fas fa-chart-line mr-3 text-2xl"></i>
                  Detection Stats
                </h3>
                <div className="space-y-4">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-4xl font-bold mb-1">98.5%</div>
                    <div className="text-sm opacity-90">Accuracy Rate</div>
                  </div>
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-4xl font-bold mb-1">50+</div>
                    <div className="text-sm opacity-90">Diseases Detected</div>
                  </div>
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-4xl font-bold mb-1">10K+</div>
                    <div className="text-sm opacity-90">Scans Completed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Common Diseases */}
            <div className="bg-white rounded-3xl shadow-xl p-7 border-2 border-gray-100">
              <h3 className="font-bold text-2xl text-gray-800 mb-6 flex items-center">
                <i className="fas fa-virus text-red-600 mr-3"></i>
                Common Diseases
              </h3>
              <div className="space-y-3">
                {Array.isArray(['Late Blight', 'Powdery Mildew', 'Leaf Rust', 'Bacterial Wilt']) ? ['Late Blight', 'Powdery Mildew', 'Leaf Rust', 'Bacterial Wilt'].map((disease, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <span className="font-semibold text-gray-700">{disease}</span>
                    <i className="fas fa-chevron-right text-gray-400"></i>
                  </div>
                )) : null}
              </div>
            </div>

            {/* Help */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-xl p-7 border-2 border-blue-200">
              <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center">
                <i className="fas fa-question-circle text-blue-600 mr-3"></i>
                Need Help?
              </h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Our agricultural experts are available 24/7 to assist you with disease identification and treatment.
              </p>
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-bold">
                <i className="fas fa-headset mr-2"></i>
                Contact Expert
              </button>
            </div>

            {/* Crop Recommendation */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl shadow-xl p-7 border-2 border-yellow-200">
              <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center">
                <i className="fas fa-leaf text-green-600 mr-3"></i>
                फसल सुझाव
              </h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                अपनी मिट्टी और मौसम के अनुसार सर्वोत्तम फसलें खोजें। आसान और किसान-अनुकूल सुझाव।
              </p>
              <button 
                onClick={() => navigate('/farmer/crop-recommendation')}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg font-bold hover:shadow-xl transform hover:scale-105"
              >
                <i className="fas fa-search mr-2"></i>
                फसल सुझाव खोजें
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropDiseaseDetection;
