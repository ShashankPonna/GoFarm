/**
 * Groq AI Service for Crop Recommendations
 * Enhances crop recommendations with detailed Groq AI analysis
 */

const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

/**
 * Get enhanced crop recommendations from Groq AI
 * @param {Array} recommendations - Top crop recommendations from algorithm
 * @param {Object} soil - Soil data
 * @param {Object} weather - Weather data
 * @returns {Promise} Enhanced recommendations with Groq AI insights - TOP CROP ONLY
 */
exports.getEnhancedCropRecommendations = async (recommendations, soil, weather) => {
  try {
    // Get only the top recommendation
    const topCrop = recommendations && recommendations.length > 0 ? recommendations[0] : null;
    
    if (!topCrop) {
      return {
        status: 'error',
        recommendations: [],
        groqAnalysis: null,
        message: 'No crop recommendations available'
      };
    }

    if (!GROQ_API_KEY) {
      console.warn('Groq API key not configured. Returning base recommendation.');
      return {
        status: 'success',
        recommendations: [topCrop],
        groqAnalysis: null,
        message: 'Base recommendation only (Groq AI not configured)'
      };
    }

    const prompt = `You are an expert agricultural scientist specializing in crop recommendations for Indian farmers.

🌾 FARMER'S SOIL & WEATHER CONDITIONS:
- Region: ${weather.region}
- Temperature: ${weather.temp}°C
- Humidity: ${weather.humidity}%
- Annual Rainfall: ${weather.rainfall}mm
- Soil Type: ${soil.type}
- Soil pH: ${soil.ph}
- Nitrogen (N): ${soil.n} mg/kg
- Phosphorus (P): ${soil.p} mg/kg
- Potassium (K): ${soil.k} mg/kg
- Organic Carbon: ${soil.organicCarbon}%

🎯 AI ALGORITHM RECOMMENDS: ${topCrop.cropName} (Suitability Score: ${topCrop.suitabilityScore}/100)

Please provide a DETAILED, COMPREHENSIVE guide for growing ${topCrop.cropName} in these exact conditions. Structure your response in Hindi and English with these sections:

📋 SECTION 1: WHY THIS CROP IS BEST FOR THIS FARMER
- Explain how this crop matches the soil conditions
- Why it suits the weather/temperature/rainfall
- Market potential in ${weather.region}

🌱 SECTION 2: SOIL PREPARATION & IMPROVEMENT
- Pre-planting soil preparation steps
- Fertilizer recommendations with Indian brand names
- Any pH adjustments needed
- Timeline for preparation

💧 SECTION 3: PLANTING & WATER MANAGEMENT
- Best planting season/month
- Seed rate and spacing
- Row/line planting details
- Irrigation schedule (weekly/bi-weekly)
- Rainwater management tips

🐛 SECTION 4: PEST & DISEASE MANAGEMENT
- Common pests/diseases in ${weather.region} for ${topCrop.cropName}
- Prevention methods
- Treatment options with product names
- When to monitor

📊 SECTION 5: MONITORING & CARE
- Growth stages and expected timeline
- What to look for at each stage
- Common problems and solutions

🎯 SECTION 6: HARVESTING
- When to harvest
- Harvesting method
- Post-harvest handling
- Expected yield per acre for these conditions

💰 SECTION 7: MARKET & ECONOMICS
- Current market price in ${weather.region}
- Market demand
- Export opportunities
- Cost breakdown and expected profit

Use simple, farmer-friendly language. Include local terms in Hindi. Use emojis for clarity.`;

    console.log('📤 Sending Groq API request...');
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Indian agricultural scientist. Provide detailed, practical, actionable farming advice in simple language. Include both Hindi and English.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
        top_p: 0.95
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const groqAnalysis = response.data.choices[0].message.content;
    console.log('✅ Groq API response received successfully');

    return {
      status: 'success',
      recommendations: [topCrop], // Return ONLY the top crop
      groqAnalysis: groqAnalysis,
      message: 'Top crop recommendation with detailed Groq AI analysis'
    };
  } catch (error) {
    console.error('❌ Groq API Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('API Error Details:', JSON.stringify(error.response.data, null, 2));
    }
    
    // Return at least the top crop even if Groq fails
    const topCrop = recommendations && recommendations.length > 0 ? recommendations[0] : null;
    
    return {
      status: 'success',
      recommendations: topCrop ? [topCrop] : [],
      groqAnalysis: null,
      error: error.response?.data?.error?.message || error.message,
      message: 'Base recommendation only (Groq AI analysis failed)'
    };
  }
};

/**
 * Get Groq AI advice for specific crop
 * @param {Object} crop - Crop recommendation object
 * @param {Object} soil - Soil data
 * @param {Object} weather - Weather data
 * @returns {Promise} Groq AI advice for the crop
 */
exports.getCropSpecificAdvice = async (cropName, soil, weather) => {
  try {
    if (!GROQ_API_KEY) {
      return {
        status: 'error',
        message: 'Groq API key not configured',
        advice: null
      };
    }

    const prompt = `You are an expert Indian agricultural scientist providing detailed farming advice.

FARMER WANTS TO GROW: ${cropName}

CURRENT CONDITIONS:
- Region: ${weather.region}
- Temperature: ${weather.temp}°C
- Humidity: ${weather.humidity}%
- Rainfall: ${weather.rainfall}mm/year
- Soil Type: ${soil.type}
- pH: ${soil.ph}
- Nitrogen: ${soil.n} mg/kg
- Phosphorus: ${soil.p} mg/kg
- Potassium: ${soil.k} mg/kg
- Organic Matter: ${soil.organicCarbon}%

Provide specific advice for growing ${cropName}:

1. SOIL PREPARATION: What steps to take before planting
2. PLANTING: When to plant, seed rate, spacing
3. FERTILIZER: Month-by-month application schedule with brand names
4. IRRIGATION: Weekly watering schedule
5. PEST/DISEASE: Common problems in ${weather.region} and solutions
6. HARVESTING: When and how to harvest
7. EXPECTED YIELD: Realistic production per acre
8. MARKET: Current price and demand in ${weather.region}

Write in simple Hindi/English. Use practical examples.`;

    console.log('📤 Sending Groq API request for crop-specific advice...');
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Indian agricultural scientist. Provide specific, practical, detailed farming advice in simple language.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500,
        top_p: 0.9
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Groq API response received for crop advice');
    return {
      status: 'success',
      crop: cropName,
      advice: response.data.choices[0].message.content
    };
  } catch (error) {
    console.error('❌ Groq API Error for crop advice:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('API Error Details:', JSON.stringify(error.response.data, null, 2));
    }
    return {
      status: 'error',
      crop: cropName,
      message: 'Failed to get advice',
      advice: null,
      error: error.response?.data?.error?.message || error.message
    };
  }
};

/**
 * Get Groq AI analysis for soil improvement
 * @param {Object} soil - Soil data
 * @returns {Promise} Groq AI soil improvement plan
 */
exports.getSoilImprovementPlan = async (soil) => {
  try {
    if (!GROQ_API_KEY) {
      return {
        status: 'error',
        message: 'Groq API key not configured'
      };
    }

    const deficiencies = [];
    if (soil.n < 50) deficiencies.push(`Very Low Nitrogen (${soil.n} mg/kg)`);
    if (soil.p < 15) deficiencies.push(`Very Low Phosphorus (${soil.p} mg/kg)`);
    if (soil.k < 50) deficiencies.push(`Very Low Potassium (${soil.k} mg/kg)`);
    if (soil.organicCarbon < 0.5) deficiencies.push(`Very Low Organic Matter (${soil.organicCarbon}%)`);
    if (soil.ph < 5.5) deficiencies.push(`Acidic Soil (pH ${soil.ph})`);
    if (soil.ph > 8) deficiencies.push(`Alkaline Soil (pH ${soil.ph})`);

    const prompt = `You are a soil scientist providing improvement recommendations for an Indian farmer.

SOIL ANALYSIS:
- Type: ${soil.type}
- pH: ${soil.ph}
- Nitrogen: ${soil.n} mg/kg
- Phosphorus: ${soil.p} mg/kg
- Potassium: ${soil.k} mg/kg
- Organic Matter: ${soil.organicCarbon}%

${deficiencies.length > 0 ? `ISSUES FOUND:\n${deficiencies.join('\n')}` : 'Soil is in good condition'}

Create a 12-month soil improvement plan:

1. IMMEDIATE ACTIONS (Month 1-2): First steps
2. FERTILIZER APPLICATION: Specific products and amounts with Indian brand names
3. ORGANIC MATTER: Compost, cow dung, green manure options
4. pH ADJUSTMENT: If needed
5. CROP SELECTION: Cover crops to improve soil
6. BUDGET: Estimated cost in Indian Rupees
7. MONITORING: How to track progress
8. LONG-TERM: Sustainable practices for 3-5 years

Use simple language with local examples.`;

    console.log('📤 Sending Groq API request for soil improvement plan...');
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'You are an expert soil scientist providing practical soil improvement plans for Indian farmers.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Groq API response received for soil plan');
    return {
      status: 'success',
      plan: response.data.choices[0].message.content
    };
  } catch (error) {
    console.error('❌ Groq API Error for soil plan:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('API Error Details:', JSON.stringify(error.response.data, null, 2));
    }
    return {
      status: 'error',
      message: 'Failed to generate soil improvement plan',
      plan: null,
      error: error.response?.data?.error?.message || error.message
    };
  }
};
