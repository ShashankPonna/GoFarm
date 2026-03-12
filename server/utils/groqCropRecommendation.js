/**
 * Groq AI Service for Crop Recommendations
 * Generates crop recommendations completely via Groq AI
 */

const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

/**
 * Get crop recommendations purely from Groq AI
 * @param {Object} soil - Soil data
 * @param {Object} weather - Weather data
 * @returns {Promise} AI generated recommendations in JSON format
 */
exports.getGroqRecommendations = async (soil, weather) => {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API key not configured');
    }

    const prompt = `You are an expert agricultural scientist specializing in crop recommendations.

FARMER'S SOIL & WEATHER CONDITIONS:
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

Based on these exact conditions, recommend the TOP 3 most suitable crops.

You MUST respond strictly in valid JSON format. Do not use markdown blocks, do not include any other text. The output should be a single JSON object with two top-level keys:
1. "recommendations": An array of exactly 3 objects representing the top crops.
2. "groqAnalysis": A detailed textual analysis (in English) explaining the overall agricultural strategy for these conditions.

The "recommendations" array MUST follow this exact structure for each crop:
[
  {
    "cropName": "Name of the crop",
    "suitabilityScore": A number from 0 to 100 representing how suitable the crop is,
    "whySuitable": [Array of 3-4 short strings explaining why this crop fits the soil/weather],
    "expectedYield": "String describing expected yield (e.g., '40-50 quintal/hectare')",
    "sowingSeason": "String describing best planting season (e.g., 'May - July')",
    "waterRequirement": "String describing water needs (e.g., '400-600 mm')",
    "riskLevel": "Low", "Medium" or "High",
    "marketDemand": "Low", "Medium" or "High",
    "fertilizer": {
      "nitrogen": "Recommended N amount",
      "phosphorus": "Recommended P amount",
      "potassium": "Recommended K amount",
      "organicMatter": "Recommended organic matter"
    },
    "additionalTips": [Array of 2-3 short strings with extra farming tips]
  }
]

Ensure the response is IN ENGLISH ONLY and strictly parseable as JSON.`;

    console.log('📤 Sending Groq API request for pure AI crop recommendations...');
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are an expert agricultural scientist. You MUST output ONLY raw, valid JSON. No markdown, no explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3500,
        top_p: 0.95
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let content = response.data.choices[0].message.content.trim();
    // In case the model still outputs markdown blocks, strip them
    if (content.startsWith('\`\`\`json')) {
      content = content.replace(/^\`\`\`json/i, '').replace(/\`\`\`$/, '').trim();
    } else if (content.startsWith('\`\`\`')) {
      content = content.replace(/^\`\`\`/i, '').replace(/\`\`\`$/, '').trim();
    }

    const parsedData = JSON.parse(content);
    console.log('✅ Groq API response successfully parsed as JSON');

    // Add rank inside the parsed items manually for the frontend
    if (parsedData.recommendations && Array.isArray(parsedData.recommendations)) {
      parsedData.recommendations.forEach((item, index) => {
        item.rank = index + 1;
      });
    }

    return {
      status: 'success',
      recommendations: parsedData.recommendations || [],
      groqAnalysis: parsedData.groqAnalysis || 'Analysis generated successfully.',
      message: 'AI generated crop recommendations'
    };
  } catch (error) {
    console.error('❌ Groq API Error:', error.response?.data || error.message);
    throw new Error('Failed to generate AI recommendations: ' + (error.response?.data?.error?.message || error.message));
  }
};

/**
 * Get Groq AI advice for specific crop
 */
exports.getCropSpecificAdvice = async (cropName, soil, weather) => {
  try {
    if (!GROQ_API_KEY) throw new Error('Groq API key not configured');

    const prompt = `You are an expert agricultural scientist providing detailed farming advice.

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
3. FERTILIZER: Month-by-month application schedule
4. IRRIGATION: Weekly watering schedule
5. PEST/DISEASE: Common problems in ${weather.region} and solutions
6. HARVESTING: When and how to harvest
7. EXPECTED YIELD: Realistic production per acre
8. MARKET: Current price and demand in ${weather.region}

Write in clear, simple English. Use practical examples.`;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
             role: 'system',
             content: 'You are an expert agricultural scientist. Provide specific, practical, detailed farming advice in simple English.'
          },
          { role: 'user', content: prompt }
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

    return {
      status: 'success',
      crop: cropName,
      advice: response.data.choices[0].message.content
    };
  } catch (error) {
    console.error('❌ Groq API Error for crop advice:', error.response?.data || error.message);
    throw new Error('Failed to get crop advice: ' + (error.response?.data?.error?.message || error.message));
  }
};

/**
 * Get Groq AI analysis for soil improvement
 */
exports.getSoilImprovementPlan = async (soil) => {
  try {
    if (!GROQ_API_KEY) throw new Error('Groq API key not configured');

    const deficiencies = [];
    if (soil.n < 50) deficiencies.push(`Very Low Nitrogen (${soil.n} mg/kg)`);
    if (soil.p < 15) deficiencies.push(`Very Low Phosphorus (${soil.p} mg/kg)`);
    if (soil.k < 50) deficiencies.push(`Very Low Potassium (${soil.k} mg/kg)`);
    if (soil.organicCarbon < 0.5) deficiencies.push(`Very Low Organic Matter (${soil.organicCarbon}%)`);
    if (soil.ph < 5.5) deficiencies.push(`Acidic Soil (pH ${soil.ph})`);
    if (soil.ph > 8) deficiencies.push(`Alkaline Soil (pH ${soil.ph})`);

    const prompt = `You are a soil scientist providing improvement recommendations.

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
2. FERTILIZER APPLICATION: Specific products and amounts
3. ORGANIC MATTER: Compost, green manure options
4. pH ADJUSTMENT: If needed
5. CROP SELECTION: Cover crops to improve soil
6. BUDGET: Estimated cost
7. MONITORING: How to track progress
8. LONG-TERM: Sustainable practices for 3-5 years

Use clear, simple English.`;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
             role: 'system',
             content: 'You are an expert soil scientist providing practical soil improvement plans in simple English.'
          },
          { role: 'user', content: prompt }
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

    return {
      status: 'success',
      plan: response.data.choices[0].message.content
    };
  } catch (error) {
    console.error('❌ Groq API Error for soil plan:', error.response?.data || error.message);
    throw new Error('Failed to generate soil improvement plan: ' + (error.response?.data?.error?.message || error.message));
  }
};
