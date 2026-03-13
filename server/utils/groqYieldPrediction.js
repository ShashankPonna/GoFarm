/**
 * Groq AI Service for Crop Yield Prediction
 * Integrates with OpenWeather API and Groq AI to estimate yields
 */

const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// OpenWeather API configuration (fallback to default if not set)
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

/**
 * Fetch live weather data for a given city
 */
const fetchWeatherData = async (city) => {
  if (!OPENWEATHER_API_KEY) {
    console.warn('⚠️ OPENWEATHER_API_KEY not found in env. Falling back to default weather.');
    return { temp: 28, humidity: 65, rainfall: 400 }; // Default values
  }

  try {
    // 1. Get coordinates for the city
    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHER_API_KEY}`;
    const geoRes = await axios.get(geoUrl);
    
    if (!geoRes.data || geoRes.data.length === 0) {
      throw new Error(`City '${city}' not found`);
    }

    const { lat, lon } = geoRes.data[0];

    // 2. Get current weather
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    const weatherRes = await axios.get(weatherUrl);

    // Approximate annual rainfall based on weather condition (since we only have current weather on free tier)
    // This is a rough heuristic to provide reasonable input to the LLM
    let rainfall = 500; // default medium rainfall
    const weatherMain = weatherRes.data.weather[0]?.main?.toLowerCase();
    if (['rain', 'thunderstorm', 'drizzle'].includes(weatherMain)) {
      rainfall = 1200; // high rainfall region simulation
    } else if (['clear', 'dust', 'sand'].includes(weatherMain)) {
      rainfall = 300; // low rainfall region simulation
    }

    return {
      temp: weatherRes.data.main.temp,
      humidity: weatherRes.data.main.humidity,
      rainfall: rainfall
    };

  } catch (error) {
    console.error('❌ OpenWeather API Error:', error.message);
    throw new Error('Failed to fetch weather data: ' + error.message);
  }
};

/**
 * Get crop yield prediction from Groq AI
 */
exports.predictCropYield = async (data) => {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API key not configured');
    }

    const { cropName, area, city, soil, fertilizer } = data;

    // Fetch live weather data
    console.log(`🌦️ Fetching live weather for ${city}...`);
    const weather = await fetchWeatherData(city);
    console.log('Weather fetched:', weather);

    const prompt = `You are an expert agricultural scientist specializing in crop yield prediction.

FARMER'S DATA:
- Crop: ${cropName}
- Area: ${area} Acres
- Region/City: ${city}

LIVE WEATHER CONDITIONS (from OpenWeather):
- Temperature: ${weather.temp}°C
- Humidity: ${weather.humidity}%
- Estimated Annual Rainfall Base: ${weather.rainfall}mm

SOIL CONDITIONS:
- Nitrogen (N): ${soil.n} mg/kg
- Phosphorus (P): ${soil.p} mg/kg
- Potassium (K): ${soil.k} mg/kg
- Soil pH: ${soil.ph}
- Organic Carbon: ${soil.organicCarbon}%

FERTILIZER APPLICATION (per acre):
- Urea/Nitrogen: ${fertilizer.nitrogen} kg
- DAP/Phosphorus: ${fertilizer.phosphorus} kg
- Potash/Potassium: ${fertilizer.potassium} kg

Based on these exact conditions, estimate the potential crop yield and provide analysis.

You MUST respond strictly in valid JSON format. Do not use markdown blocks, do not include any other text. The output should be a single JSON object structured EXACTLY like this:

{
  "estimatedYield": "String (e.g., '14.5 - 16.2')",
  "yieldUnit": "String (e.g., 'Quintals/Acre' or 'Tonnes/Acre' depending on standard unit for this crop)",
  "totalProduction": "String (e.g., '145 - 162 Quintals')",
  "confidenceLevel": "String ('High', 'Medium', or 'Low')",
  "factorsAnalysis": [
    {
      "factor": "String (e.g., 'Soil Nutrients', 'Weather', 'Fertilizer')",
      "impact": "String ('Positive', 'Neutral', 'Negative')",
      "reason": "String explaining how this factor impacts the expected yield"
    }
    // Must include exactly 3 factors: Soil, Weather, and Fertilizer
  ],
  "optimizationTips": [
    "String: Actionable tip 1 to maximize yield",
    "String: Actionable tip 2",
    "String: Actionable tip 3"
  ],
  "storageAndLogistics": "String: Practical advice on harvesting, storage, or transport for this specific volume and crop type"
}`;

    console.log('📤 Sending Groq API request for yield prediction...');
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
        max_tokens: 2500,
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
    
    // Ensure clean JSON by removing markdown wrappers if present
    if (content.startsWith('\`\`\`json')) {
      content = content.replace(/^\`\`\`json/i, '').replace(/\`\`\`$/, '').trim();
    } else if (content.startsWith('\`\`\`')) {
      content = content.replace(/^\`\`\`/i, '').replace(/\`\`\`$/, '').trim();
    }

    let parsedData;
    try {
      parsedData = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse Groq response:", content);
      throw new Error("AI returned invalid JSON format");
    }

    console.log('✅ Groq yield prediction successfully parsed');

    return {
      status: 'success',
      weatherUsed: weather,
      prediction: parsedData
    };
  } catch (error) {
    console.error('❌ Groq API Error for yield prediction:', error.response?.data || error.message);
    throw new Error('Failed to generate yield prediction: ' + (error.response?.data?.error?.message || error.message));
  }
};
