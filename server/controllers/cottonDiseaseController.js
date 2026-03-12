/**
 * Plant Disease Detection Controller
 * Local ML Model + Grok AI Recommendations
 * Flow: Image → ML Model (Disease) → Grok AI (Recommendations)
 */

const axios = require('axios');

// ============================================================
// Configuration
// ============================================================
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000/predict';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const CONFIDENCE_THRESHOLD = parseInt(process.env.CONFIDENCE_THRESHOLD) || 30;

// ============================================================
// Utility: Validate Image
// ============================================================
const validateImage = (file) => {
  if (!file) {
    return { valid: false, error: 'No image uploaded' };
  }

  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return { valid: false, error: 'Invalid format. Use JPG, PNG, WebP, or TIFF' };
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size exceeds 10MB limit' };
  }

  return { valid: true };
};

// ============================================================
// Step 1: Call Local ML Model for Disease Detection
// ============================================================
const detectDiseaseWithML = async (imageBuffer, originalFilename) => {
  try {
    console.log('🔗 [ML] Calling Local ML Model...');

    const response = await axios.post(
      ML_API_URL,
      { image: imageBuffer.toString('base64') },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );

    console.log('✅ [ML] Disease detection successful');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ [ML] Error:', error.message);
    return {
      success: false,
      error: error.message,
      details: error.response?.data || null
    };
  }
};

// ============================================================
// Step 2: Generate Recommendations with Grok AI
// ============================================================
const generateRecommendationsWithGrok = async (diseaseName, confidence, language = 'en') => {
  try {
    if (!GROQ_API_KEY) {
      console.warn('⚠️ [Grok] GROQ_API_KEY not configured, skipping recommendations');
      return {
        success: false,
        recommendations: {
          symptom_description: 'Recommendations unavailable',
          disease_cause: 'Grok AI not configured',
          organic_treatment: [],
          chemical_treatment: [],
          fertilizer_advice: 'N/A',
          irrigation_advice: 'N/A',
          prevention_tips: [],
          affected_crops: [],
          severity_level: 'unknown'
        }
      };
    }

    console.log('🤖 [Grok] Generating recommendations...');

    console.log('🤖 [Grok] Generating recommendations...');

    const languageString = language === 'mr' ? 'Marathi' : language === 'hi' ? 'Hindi' : 'English';
    const prompt = `You are an expert agricultural advisor. A plant disease has been detected: "${diseaseName}" with ${confidence}% confidence.

    IMPORTANT INSTRUCTION: You must respond entirely in ${languageString}. Translate all the text values in your JSON response to ${languageString}. Only the JSON keys should remain in English.

Generate a comprehensive, structured JSON response with these fields:
{
  "symptom_description": "visible symptoms on leaves/plant",
  "disease_cause": "what causes this disease",
  "organic_treatment": ["method 1", "method 2"],
  "chemical_treatment": ["chemical 1", "chemical 2"],
  "fertilizer_advice": "fertilizer recommendations",
  "irrigation_advice": "watering guidance",
  "prevention_tips": ["tip 1", "tip 2"],
  "affected_crops": ["crop1", "crop2"],
  "severity_level": "mild/moderate/severe"
}

Respond ONLY with valid JSON.`;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    let content = response.data.choices[0].message.content;

    // Strip markdown code blocks if the LLM wrapped the JSON
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const recommendations = JSON.parse(content);

    console.log('✅ [Grok] Recommendations generated');
    return { success: true, recommendations };
  } catch (error) {
    console.error('❌ [Grok] Error:', error.message);
    if (error.response && error.response.data) {
      console.error('❌ [Grok] Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    return {
      success: false,
      recommendations: {
        symptom_description: 'Unable to generate',
        disease_cause: 'Unable to generate',
        organic_treatment: [],
        chemical_treatment: [],
        fertilizer_advice: 'Unable to generate',
        irrigation_advice: 'Unable to generate',
        prevention_tips: [],
        affected_crops: [],
        severity_level: 'unknown'
      }
    };
  }
};

// ============================================================
// Main Controller: Detect Disease + Get Recommendations
// ============================================================
exports.detectDisease = async (req, res) => {
  try {
    console.log('🔍 [detectDisease] Starting detection...');
    const startTime = Date.now();

    // 1️⃣ Validate image
    const validation = validateImage(req.file);

    const language = req.body.language || 'en';
    if (!validation.valid) {
      console.warn('⚠️ [detectDisease] Image validation failed:', validation.error);
      return res.status(400).json({
        success: false,
        message: validation.error,
        code: 'INVALID_IMAGE'
      });
    }
    console.log('✅ [detectDisease] Image validated');

    // 2️⃣ Call ML Model for disease detection
    const mlResult = await detectDiseaseWithML(req.file.buffer, req.file.originalname);
    if (!mlResult.success) {
      console.error('❌ [detectDisease] ML detection failed:', mlResult.error);
      return res.status(503).json({
        success: false,
        message: 'Disease detection service unavailable',
        code: 'ML_API_ERROR',
        details: mlResult.details
      });
    }

    // 3️⃣ Parse ML prediction
    const prediction = {
      disease_name: mlResult.data.disease || 'Unknown Disease',
      confidence_percent: mlResult.data.confidence_percent || 0
    };
    console.log(`🧠 [detectDisease] Detected: ${prediction.disease_name} (${prediction.confidence_percent}%)`);

    // 4️⃣ Check confidence threshold
    if (prediction.confidence_percent < CONFIDENCE_THRESHOLD) {
      console.warn('⚠️ [detectDisease] Low confidence:', prediction.confidence_percent);
      return res.status(400).json({
        success: false,
        message: `Low confidence (${prediction.confidence_percent}%). Please upload a clearer image.`,
        code: 'LOW_CONFIDENCE',
        confidence_percent: prediction.confidence_percent
      });
    }

    // 5️⃣ Get Grok AI recommendations (parallel, don't block if it fails)
    const grokResult = await generateRecommendationsWithGrok(
      prediction.disease_name,
      prediction.confidence_percent,
      language
    );

    const processingTime = Date.now() - startTime;

    // 6️⃣ Return combined response
    console.log(`✅ [detectDisease] Complete in ${processingTime}ms`);
    return res.status(200).json({
      success: true,
      message: 'Disease detected with recommendations',
      data: {
        disease: {
          name: prediction.disease_name,
          confidence_percent: prediction.confidence_percent
        },
        recommendations: grokResult.recommendations,
        processing_time_ms: processingTime,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('🔥 [detectDisease] Server error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Disease detection failed',
      code: 'SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get detection history (placeholder)
 * GET /api/plants/detections/history
 */
exports.getDetectionHistory = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        detections: [],
        total: 0
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching history'
    });
  }
};

/**
 * Get specific detection (placeholder)
 * GET /api/plants/detections/:detectionId
 */
exports.getDetectionDetail = async (req, res) => {
  try {
    const { detectionId } = req.params;
    return res.status(200).json({
      success: false,
      message: 'Detection not found'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching detection'
    });
  }
};

/**
 * Delete detection (placeholder)
 * DELETE /api/plants/detections/:detectionId
 */
exports.deleteDetection = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Detection deleted'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting detection'
    });
  }
};
