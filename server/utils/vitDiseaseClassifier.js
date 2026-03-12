const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Cotton Disease Classification using EfficientNet PlantDiseaseDetection
 * Hugging Face Model: liriope/PlantDiseaseDetection (trained on PlantVillage dataset)
 * Uses Hugging Face Inference API for efficient classification
 * 
 * ⚠️ IMPORTANT: If model returns 410, it may be:
 * 1. Not yet loaded (first request warms it up - takes 20-30s)
 * 2. Model name is incorrect - verify on huggingface.co
 * 3. Model requires special format or parameters
 */

const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;
const HF_MODEL = 'liriope/PlantDiseaseDetection'; // EfficientNet trained on PlantVillage
const MIN_CONFIDENCE_THRESHOLD = 60; // Minimum confidence required (60%)
// Updated endpoint: api-inference.huggingface.co is deprecated, use router.huggingface.co
const HF_API_URL = `https://router.huggingface.co/models/${HF_MODEL}`;

// Cotton-specific disease keywords for validation
const COTTON_DISEASE_KEYWORDS = [
  'cotton', 'boll', 'leaf curl', 'wilt', 'blight', 'leaf spot',
  'fusarium', 'bacterial', 'fungal', 'disease'
];

/**
 * Classify cotton plant disease from image URL using ViT
 * @param {string} imageUrl - Cloudinary image URL
 * @returns {Promise<Object>} Disease classification result
 */
const classifyDiseaseFromVision = async (imageUrl) => {
  try {
    if (!HF_API_KEY) {
      console.warn('⚠️ HUGGING_FACE_API_KEY not configured, skipping ViT classification');
      return null;
    }

    console.log('🔬 Classifying with ViT model...');
    const startTime = Date.now();

    // Fetch image from URL and convert to base64
    let imageBuffer;
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000
      });
      imageBuffer = Buffer.from(response.data);
      console.log(`📥 Image fetched: ${imageBuffer.length} bytes`);
    } catch (err) {
      console.error('❌ Failed to fetch image for classification:', err.message);
      return null;
    }

    // Using Hugging Face Inference API for image classification
    // Model: EfficientNet trained on PlantVillage dataset
    console.log(`📤 Sending to HF API: ${HF_API_URL}`);
    let hfResponse;
    try {
      hfResponse = await axios.post(
        HF_API_URL,
        imageBuffer,
        {
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/octet-stream'
          },
          timeout: 30000
        }
      );
    } catch (apiError) {
      console.error(`❌ HF API Error (Status: ${apiError.response?.status}):`, apiError.message);
      if (apiError.response?.data) {
        console.error('Response Data:', apiError.response.data);
      }
      
      // Special handling for 410 Gone error
      if (apiError.response?.status === 410) {
        console.warn('⚠️ Model returned 410 (Gone/Loading). This means:');
        console.warn('   1. Model endpoint may be cold-starting (first request can take 30-60s)');
        console.warn('   2. Model might not exist or is processing - fallback to local analysis');
        console.warn('   📌 Model: https://huggingface.co/liriope/PlantDiseaseDetection');
      }
      
      return null;
    }

    const processingTime = Date.now() - startTime;
    console.log(`✓ ViT classification completed in ${processingTime}ms`);

    // HF returns array of predictions with score
    if (!hfResponse.data || !Array.isArray(hfResponse.data) || hfResponse.data.length === 0) {
      console.warn('⚠️ No predictions from ViT model');
      console.warn('Response:', hfResponse.data);
      return null;
    }

    const topPrediction = hfResponse.data[0];
    const confidencePercent = Math.round((topPrediction.score || 0) * 100);
    const predictedLabel = topPrediction.label || 'Unknown';
    
    console.log(`🔍 Model Prediction: ${predictedLabel} (${confidencePercent}%)`);

    // Check confidence threshold
    if (confidencePercent < MIN_CONFIDENCE_THRESHOLD) {
      console.warn(`⚠️ Low confidence (${confidencePercent}%) - below threshold of ${MIN_CONFIDENCE_THRESHOLD}%`);
      return {
        success: false,
        message: `Low confidence (${confidencePercent}%). Please upload a clearer, well-lit photo of affected cotton leaves for accurate diagnosis.`,
        confidence: confidencePercent,
        requiresRetake: true,
        raw_prediction: predictedLabel
      };
    }

    // Validate if prediction is a cotton disease
    const validation = validateCottonDisease(predictedLabel);
    
    if (!validation.isCottonDisease) {
      console.warn(`⚠️ Model predicted non-cotton disease: ${predictedLabel}`);
      return {
        success: false,
        message: `The detected disease (${predictedLabel}) is not typical in cotton. Please verify the image shows a cotton plant or upload a different image.`,
        confidence: confidencePercent,
        requiresRetake: true,
        raw_prediction: predictedLabel,
        notCottonDisease: true,
        reason: validation.reason
      };
    }

    return {
      success: true,
      disease_name: validation.normalizedLabel,
      confidence_percent: confidencePercent,
      raw_prediction: predictedLabel,
      model: HF_MODEL,
      processing_time_ms: processingTime,
      requiresRetake: false
    };
  } catch (error) {
    console.error('❌ ViT classification failed:', error.message);
    return null;
  }
};

/**
 * Validate if prediction is a cotton disease
 * Conservative approach: if it mentions cotton or common disease in plant context, accept it
 * If it's clearly a different crop, reject it
 * @param {string} prediction - Raw prediction from model
 * @returns {Object} { isCottonDisease: boolean, normalizedLabel: string, reason?: string }
 */
const validateCottonDisease = (prediction) => {
  const pred = (prediction || '').toLowerCase().trim();

  // Reject explicitly non-cotton crops
  const nonCottonCrops = [
    'apple', 'tomato', 'grape', 'potato', 'corn', 'wheat', 'rice', 
    'pepper', 'cucumber', 'cherry', 'peach', 'blueberry', 'strawberry',
    'squash', 'bean', 'pumpkin', 'cabbage', 'lettuce', 'plum'
  ];

  for (let crop of nonCottonCrops) {
    if (pred.includes(crop)) {
      return {
        isCottonDisease: false,
        normalizedLabel: prediction,
        reason: `Detected disease is for ${crop}, not cotton`
      };
    }
  }

  // Check if it mentions cotton explicitly
  if (pred.includes('cotton')) {
    return {
      isCottonDisease: true,
      normalizedLabel: prediction
    };
  }

  // Check if it has plant disease keywords (could be cotton-relevant)
  // This is the conservative check since PlantVillage may not specify crop
  const hasPlantDisease = COTTON_DISEASE_KEYWORDS.some(keyword => pred.includes(keyword));
  
  // If "healthy" or common leaf descriptors, treat as cotton if no other crop mentioned
  if (pred.includes('healthy') || pred.includes('normal') || 
      pred.includes('green leaf') || pred.includes('normal leaf')) {
    return {
      isCottonDisease: true,
      normalizedLabel: prediction || 'Healthy'
    };
  }

  // If has disease keywords but not cotton-specific, need to ask for clarification
  if (hasPlantDisease) {
    return {
      isCottonDisease: false,  // Conservative: reject ambiguous
      normalizedLabel: prediction,
      reason: 'Disease detected but unclear if applicable to cotton - PlantVillage model may need cotton-specific fine-tuning'
    };
  }

  // Conservative: treat as non-cotton if completely unknown
  return {
    isCottonDisease: false,
    normalizedLabel: prediction,
    reason: 'Unable to classify as cotton disease - please upload clearer cotton leaf image'
  };
};

module.exports = {
  classifyDiseaseFromVision,
  MIN_CONFIDENCE_THRESHOLD,
  HF_MODEL
};
