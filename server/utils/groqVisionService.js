const axios = require('axios');

// Groq API configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// ============================================================================
// PROFESSIONAL PROMPT FOR EfficientNet PlantDiseaseDetection MODEL
// ============================================================================
// This prompt is used ONLY for treatment generation
// Disease classification is handled by the vision model separately
// Groq does NOT re-diagnose or question the model
const COTTON_TREATMENT_PROMPT = `You are a senior agricultural scientist specializing in cotton crop diseases in India.

A trained deep learning plant disease model (EfficientNet PlantDiseaseDetection) has already classified the uploaded leaf image.

Prediction details:
- Model Name: EfficientNet PlantDiseaseDetection
- Predicted Label: {PREDICTED_LABEL}
- Confidence Score: {CONFIDENCE_PERCENT}%
- Target Crop in System: Cotton

IMPORTANT RULES:
- You must NOT re-diagnose or question the model
- You must use the predicted label to generate treatment guidance only
- Do not add any text outside the JSON response
- Do not question the model prediction

IF the predicted disease does NOT belong to cotton:
- Return "disease_not_applicable_to_cotton": true
- Explain briefly that the detected disease is not typical in cotton
- Suggest re-upload or retraining with cotton dataset

IF it IS a cotton disease:
- Generate structured treatment recommendations based on the predicted label only

Return STRICTLY valid JSON only (no markdown, no explanations, no code blocks):

{
  "crop_name": "Cotton",
  "predicted_disease": "{PREDICTED_LABEL}",
  "confidence_from_model_percent": "{CONFIDENCE_PERCENT}",
  "disease_not_applicable_to_cotton": false,
  "disease_type": "Fungal / Bacterial / Viral / Pest / Nutrient Deficiency",
  "severity_estimation_based_on_confidence": "Low / Medium / High",
  "short_description": "2-3 sentence description of the disease and typical symptoms in cotton",
  "symptoms": ["Symptom 1", "Symptom 2", "Symptom 3"],
  "chemical_treatment": {
    "recommended_product": "Name of commonly available product in India",
    "active_ingredient": "Chemical ingredient (e.g., Copper Oxychloride, Mancozeb)",
    "dosage_per_liter": "Dosage per liter of water (e.g., 2-3 ml/litre)",
    "spray_interval_days": "Days between spray applications (e.g., 7-10 days)",
    "precautions": "Safety precautions and warnings"
  },
  "fertilizer_recommendation": {
    "recommended_npk_ratio": "NPK ratio (e.g., 10:26:26)",
    "micronutrients_needed": "Micronutrients like zinc, iron, boron, etc.",
    "dosage_per_acre": "Recommended dosage per acre",
    "application_method": "Soil application or foliar spray"
  },
  "organic_treatment": {
    "method": "Organic treatment method (e.g., Neem oil, Bordeaux mixture)",
    "ingredients_required": "Locally available natural ingredients",
    "application_frequency": "How often to apply"
  },
  "preventive_measures": ["Measure 1", "Measure 2", "Measure 3", "Measure 4"],
  "irrigation_advice": "Advice on irrigation timing and method based on disease control",
  "expected_recovery_time": "Estimated time to see improvement",
  "farmer_friendly_summary": "Simple, practical, actionable advice in farmer-friendly language about what action to take immediately"
}

CRITICAL VALIDATION RULES:
- Base all recommendations strictly on the predicted disease label
- Use only commonly available agricultural products affordable in India
- Keep the farmer summary simple, practical, and immediately actionable
- Ensure the JSON is valid and properly formatted
- Do NOT add any text outside the JSON response
- If needed, handle edge cases where model predicts non-cotton diseases gracefully`;

/**
 * Generate treatment recommendations based on Disease Model prediction
 * Hybrid approach: EfficientNet for classification, Groq for treatment generation
 * @param {string} predictedLabel - Predicted disease label from model
 * @param {number} confidencePercent - Model confidence percentage
 * @returns {Promise<Object>} Treatment recommendations
 */
const generateTreatmentFromDiseasePrediction = async (predictedLabel, confidencePercent) => {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured');
    }

    console.log(`💊 Generating treatment for ${predictedLabel} (${confidencePercent}% confidence)`);

    const startTime = Date.now();

    // Replace placeholders in prompt with actual values
    const prompt = COTTON_TREATMENT_PROMPT
      .replace('{PREDICTED_LABEL}', predictedLabel)
      .replace('{CONFIDENCE_PERCENT}', confidencePercent.toString());

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3  // Lower temperature for consistent structured outputs
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const processingTime = Date.now() - startTime;
    const responseText = response.data.choices[0].message.content;

    console.log(`📋 Raw Groq Response (first 500 chars): ${responseText.substring(0, 500)}`);

    // Parse JSON response
    let treatmentResult;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      treatmentResult = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse Groq treatment response:', responseText);
      throw new Error('Invalid JSON response from AI model: ' + parseError.message);
    }

    // Check if disease is not applicable to cotton
    if (treatmentResult.disease_not_applicable_to_cotton === true) {
      console.warn('⚠️ Model predicted non-cotton disease:', predictedLabel);
      return {
        success: false,
        message: `The detected disease (${predictedLabel}) is not typical in cotton. Please verify the image shows a cotton plant.`,
        requiresRetake: true,
        notCottonDisease: true,
        processing_time_ms: processingTime,
        api_model: 'groq-treatment-generator'
      };
    }

    // Ensure all expected fields exist with proper defaults
    const completeTreatment = {
      crop_name: treatmentResult.crop_name || 'Cotton',
      predicted_disease: treatmentResult.predicted_disease || predictedLabel,
      disease_name: treatmentResult.predicted_disease || predictedLabel,  // For controller compatibility
      confidence_from_model_percent: treatmentResult.confidence_from_model_percent || confidencePercent,
      confidence_score_percent: treatmentResult.confidence_from_model_percent || confidencePercent,  // For controller compatibility
      disease_type: treatmentResult.disease_type || 'Unknown',
      severity_estimation_based_on_confidence: treatmentResult.severity_estimation_based_on_confidence || 'Medium',
      severity_level: treatmentResult.severity_estimation_based_on_confidence || 'Medium',  // For controller compatibility
      short_description: treatmentResult.short_description || '',
      symptoms: Array.isArray(treatmentResult.symptoms) ? treatmentResult.symptoms : [],
      observed_symptoms: Array.isArray(treatmentResult.symptoms) ? treatmentResult.symptoms : [],  // For controller compatibility
      preventive_measures: Array.isArray(treatmentResult.preventive_measures) ? treatmentResult.preventive_measures : [],
      chemical_treatment: treatmentResult.chemical_treatment || {
        recommended_product: 'Consult local agronomist for region-specific recommendations',
        active_ingredient: 'N/A',
        dosage_per_liter: 'As per product label'
      },
      organic_treatment: treatmentResult.organic_treatment || {
        method: 'Consult local agricultural officer',
        ingredients_required: 'N/A',
        application_frequency: 'As recommended'
      },
      fertilizer_recommendation: treatmentResult.fertilizer_recommendation || {
        recommended_npk_ratio: '19:19:19',
        best_npk_ratio: '19:19:19',  // For controller compatibility
        micronutrients_needed: 'Iron, Zinc, Manganese',
        dosage_per_acre: 'As per soil test report',
        application_method: 'Soil application'
      },
      irrigation_advice: treatmentResult.irrigation_advice || 'Maintain regular irrigation schedule',
      expected_recovery_time: treatmentResult.expected_recovery_time || 'Varies by disease and treatment adherence',
      farmer_friendly_summary: treatmentResult.farmer_friendly_summary || 'Monitor plant health regularly and consult local agricultural extension',
      farmer_summary: treatmentResult.farmer_friendly_summary || 'Monitor plant health regularly and consult local agricultural extension',  // For controller compatibility
      integrated_pest_management: [],  // For controller compatibility
      soil_health_recommendations: 'Monitor soil health and maintain proper nutrient balance',  // For controller compatibility
      processing_time_ms: processingTime,
      api_model: 'groq-treatment-generator',
      timestamp: new Date()
    };

    console.log('✓ Treatment recommendations generated successfully');
    console.log('🎯 Disease Type:', completeTreatment.disease_type);
    console.log('📊 Severity:', completeTreatment.severity_estimation_based_on_confidence);

    return {
      success: true,
      analysis: completeTreatment
    };
  } catch (error) {
    console.error('❌ Treatment generation failed:', error.message);

    if (error.response) {
      console.error('API Response:', {
        status: error.response.status,
        data: error.response.data
      });
    }

    throw {
      success: false,
      message: 'Failed to generate treatment recommendations',
      error: error.message,
      code: 'GROQ_API_ERROR'
    };
  }
};

/**
 * Validate image URL is accessible
 * @param {string} imageUrl - Image URL to validate
 * @returns {Promise<boolean>} Whether URL is accessible
 */
const validateImageUrl = async (imageUrl) => {
  try {
    const response = await axios.head(imageUrl, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.error('Image URL validation failed:', error.message);
    return false;
  }
};

module.exports = {
  generateTreatmentFromDiseasePrediction,
  validateImageUrl,
  GROQ_API_URL
};
