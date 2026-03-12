import React, { useState } from 'react';
import api from '../utils/api';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './DiseaseDetection.css';

const DiseaseDetection = () => {
  const { t, i18n } = useTranslation();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a JPG, PNG, WebP, or TIFF image.');
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB.');
        return;
      }

      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
      setResult(null);
    }
  };

  // Handle image upload and detection
  const handleDetect = async () => {
    if (!image) {
      setError('Please select an image first.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('language', i18n.language);

      const response = await api.post(
        '/cotton/detect',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 30000
        }
      );

      if (response.data.success) {
        setResult({
          success: true,
          disease: response.data.data.disease.name,
          confidence: response.data.data.disease.confidence_percent,
          recommendations: response.data.data.recommendations,
          processingTime: response.data.data.processing_time_ms
        });
      } else {
        setError(response.data.message || 'Detection failed');
      }
    } catch (err) {
      console.error('Detection error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to detect disease. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="disease-detection-page">
      {/* Top Navigation */}
      <div className="dd-nav">
        <button onClick={() => window.history.back()} className="dd-back-btn">
          <i className="fas fa-arrow-left"></i> <span>{t('common.back')}</span>
        </button>
        <LanguageSwitcher className="dd-lang-switcher" />
      </div>

      <div className="dd-content">
        {/* Hero Section */}
        <div className="dd-hero">
          <div className="dd-hero-icon-wrapper">
            <i className="fas fa-seedling"></i>
          </div>
          <h1>{t('diseaseDetection.title')}</h1>
          <p>{t('diseaseDetection.subtitle')}</p>
        </div>

        {/* Feature Highlights */}
        <div className="dd-features">
          <div className="dd-feature">
            <div className="dd-feature-icon"><i className="fas fa-brain"></i></div>
            <span>AI Detection</span>
          </div>
          <div className="dd-feature">
            <div className="dd-feature-icon"><i className="fas fa-bolt"></i></div>
            <span>Instant Result</span>
          </div>
          <div className="dd-feature">
            <div className="dd-feature-icon"><i className="fas fa-cloud-sun"></i></div>
            <span>Weather Info</span>
          </div>
        </div>

        {/* Upload Card */}
        <div className="dd-card upload-card">
          {!preview ? (
            <div className="dd-upload-zone">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                id="image-input"
                className="dd-file-input"
              />
              <label htmlFor="image-input" className="dd-upload-label">
                <i className="fas fa-cloud-upload-alt dd-upload-icon"></i>
                <span className="dd-upload-primary">{t('diseaseDetection.clickSelect')}</span>
                <span className="dd-upload-secondary">{t('diseaseDetection.dragDrop')}</span>
              </label>
            </div>
          ) : (
            <div className="dd-preview-section">
              <img src={preview} alt="Crop Preview" className="dd-preview-image" />
              <button onClick={handleReset} className="dd-text-btn">
                <i className="fas fa-sync-alt"></i> {t('diseaseDetection.chooseDifferent')}
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="dd-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Scan Button */}
          {preview && !result && (
            <button
              onClick={handleDetect}
              disabled={loading}
              className={`dd-scan-btn ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> {t('diseaseDetection.analyzing')}
                </>
              ) : (
                <>
                  <i className="fas fa-search"></i> {t('diseaseDetection.detectDisease')}
                </>
              )}
            </button>
          )}
        </div>

        {/* Results Card */}
        {result && result.success && (
          <div className="dd-card results-card">
            <div className="dd-result-header">
              <i className="fas fa-check-circle dd-success-icon"></i>
              <h2>{t('diseaseDetection.detectionComplete')}</h2>
            </div>

            <div className="dd-disease-highlight">
              <div className="dd-highlight-content">
                <span className="dd-label">{t('diseaseDetection.diseaseDetected')}</span>
                <h3 className="dd-disease-name">{result.disease}</h3>
              </div>
              <div className="dd-confidence-badge">
                {result.confidence}% {t('diseaseDetection.confidenceLevel').split(' ')[0]}
              </div>
            </div>

            {/* Minor Data points */}
            <p className="dd-label" style={{ textAlign: "center", marginBottom: "20px" }}>
              <i className="fas fa-clock"></i> {t('diseaseDetection.processingTime')}: {result.processingTime}ms
            </p>

            {result.recommendations && (
              <div className="dd-recommendations">
                <div className="dd-rec-group">
                  <h4><i className="fas fa-clipboard-list"></i> {t('diseaseDetection.symptoms')}</h4>
                  <p>{result.recommendations.symptom_description || 'N/A'}</p>
                </div>

                <div className="dd-rec-group">
                  <h4><i className="fas fa-flask"></i> {t('diseaseDetection.chemicalTreatment')}</h4>
                  <ul>
                    {result.recommendations.chemical_treatment && result.recommendations.chemical_treatment.length > 0 ? (
                      result.recommendations.chemical_treatment.map((treatment, idx) => (
                        <li key={idx}>{treatment}</li>
                      ))
                    ) : (
                      <li>{t('diseaseDetection.noRecommendations')}</li>
                    )}
                  </ul>
                </div>

                <div className="dd-rec-group">
                  <h4><i className="fas fa-leaf"></i> {t('diseaseDetection.organicTreatment')}</h4>
                  <ul>
                    {result.recommendations.organic_treatment && result.recommendations.organic_treatment.length > 0 ? (
                      result.recommendations.organic_treatment.map((treatment, idx) => (
                        <li key={idx}>{treatment}</li>
                      ))
                    ) : (
                      <li>{t('diseaseDetection.noRecommendations')}</li>
                    )}
                  </ul>
                </div>

                <div className="dd-rec-group">
                  <h4><i className="fas fa-seedling"></i> {t('diseaseDetection.fertilizerAdvice')}</h4>
                  <p>{result.recommendations.fertilizer_advice || 'N/A'}</p>
                </div>

                <div className="dd-rec-group">
                  <h4><i className="fas fa-shield-alt"></i> {t('diseaseDetection.preventionTips')}</h4>
                  <ul>
                    {result.recommendations.prevention_tips && result.recommendations.prevention_tips.length > 0 ? (
                      result.recommendations.prevention_tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))
                    ) : (
                      <li>{t('diseaseDetection.noTips')}</li>
                    )}
                  </ul>
                </div>

                {result.recommendations.severity_level && (
                  <div className="dd-rec-group">
                    <h4><i className="fas fa-exclamation-triangle"></i> {t('diseaseDetection.severityLevel')}</h4>
                    <p className={`severity-${result.recommendations.severity_level.toLowerCase()}`}>
                      {result.recommendations.severity_level.toUpperCase()}
                    </p>
                  </div>
                )}
              </div>
            )}

            <button onClick={handleReset} className="dd-scan-again-btn">
              <i className="fas fa-camera"></i> {t('diseaseDetection.testAnother')}
            </button>
          </div>
        )}
      </div>

      {/* Grass Visual Element */}
      <div className="dd-grass-container">
        <svg className="dd-grass-svg" viewBox="0 0 1000 100" preserveAspectRatio="none">
          <path className="dd-grass-layer-3" d="M0,100 C150,80 350,110 500,70 C650,30 850,90 1000,60 L1000,100 L0,100 Z" />
          <path className="dd-grass-layer-2" d="M0,100 C200,90 400,60 600,90 C800,120 900,50 1000,80 L1000,100 L0,100 Z" />
          <path className="dd-grass-layer-1" d="M0,100 C250,100 450,80 650,100 C850,120 950,90 1000,100 L1000,120 L0,120 Z" />
        </svg>
      </div>
    </div>
  );
};

export default DiseaseDetection;
