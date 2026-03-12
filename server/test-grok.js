const axios = require('axios');
require('dotenv').config({ path: '../.env' }); // adjusted path to .env file

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function testGrok() {
    if (!GROQ_API_KEY) {
        console.error("❌ GROQ_API_KEY is not defined in ../.env");
        return;
    }

    console.log("Using API Key:", GROQ_API_KEY.substring(0, 8) + "...");
    const prompt = `You are an expert agricultural advisor. A plant disease has been detected: "Leaf Spot" with 60% confidence.

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

    try {
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
        console.log("Success:", response.data.choices[0].message.content);
    } catch (error) {
        console.error('❌ [Grok] Error:', error.message);
        if (error.response && error.response.data) {
            console.error('❌ [Grok] Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testGrok();
