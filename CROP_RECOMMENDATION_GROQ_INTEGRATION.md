# Crop Recommendation + Groq AI Integration

## 🚀 Overview

The crop recommendation system now integrates **Groq AI** to provide:
1. **Enhanced Crop Recommendations** - AI-powered analysis of all recommendations
2. **Crop-Specific Advice** - Detailed farming guidance for each recommended crop
3. **Soil Improvement Plans** - 12-month AI-generated soil improvement strategy

---

## 🔧 Setup Requirements

### Backend Environment Variables

Add to your `.env` file:

```env
GROQ_API_KEY=your_groq_api_key_here
```

**How to get Groq API Key:**
1. Visit https://console.groq.com/
2. Sign up for a free account
3. Create an API key
4. Copy and paste it in your `.env` file

---

## 📊 Data Flow

```
User Fills Form (Soil + Weather)
    ↓
Submit Form
    ↓
Backend Algorithm generates 5 recommended crops
    ↓
Groq AI analyzes recommendations & provides detailed insights
    ↓
Frontend displays:
   - AI Recommendations (with scores)
   - Groq AI Analysis (comprehensive)
   - Individual Crop Advice (on demand)
   - Soil Improvement Plan (on demand)
```

---

## 🎯 New Features

### 1. **Groq AI Overall Analysis**
- Comprehensive analysis of all recommendations
- Considers all soil and weather factors
- Provides crop rotation suggestions
- Risk assessment for region
- Market opportunity analysis

**View:** Click "🤖 AI विश्लेषण" tab

### 2. **Crop-Specific Advice**
- Click "📋 इस फसल के लिए विस्तृत AI सलाह" button on any crop
- Provides detailed month-by-month guidance
- Pest/disease management specific to region
- Fertilizer schedule
- Irrigation plan
- Harvesting tips
- Cost-benefit analysis

### 3. **Soil Improvement Plan**
- Click "🌱 मिट्टी योजना" tab
- 12-month improvement strategy
- Identifies deficiencies and solutions
- Product recommendations (available in India)
- Budget estimation
- Progress monitoring tips

---

## 📝 API Endpoints

### 1. Get Recommendations with Groq Analysis
```
POST /api/crops/recommendations/full
Content-Type: application/json

{
  "soil": {
    "type": "Loamy",
    "ph": 6.5,
    "n": 100,
    "p": 30,
    "k": 150,
    "organicCarbon": 1.2
  },
  "weather": {
    "temp": 25,
    "humidity": 65,
    "rainfall": 600,
    "region": "Maharashtra"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "recommendations": [...],
  "groqAnalysis": "Comprehensive AI analysis text",
  "groqMessage": "Enhanced recommendations with Groq AI analysis",
  "timestamp": "2024-02-25T10:30:00.000Z"
}
```

### 2. Get Crop-Specific Advice
```
POST /api/crops/groq-advice/{cropName}
Content-Type: application/json

{
  "soil": { ... },
  "weather": { ... }
}
```

**Response:**
```json
{
  "status": "success",
  "crop": "Rice",
  "advice": "Detailed farming advice for the crop",
  "timestamp": "2024-02-25T10:30:00.000Z"
}
```

### 3. Get Soil Improvement Plan
```
POST /api/crops/soil-improvement
Content-Type: application/json

{
  "soil": {
    "type": "Loamy",
    "ph": 6.5,
    "n": 100,
    "p": 30,
    "k": 150,
    "organicCarbon": 1.2
  }
}
```

**Response:**
```json
{
  "status": "success",
  "soilData": { ... },
  "plan": "12-month detailed soil improvement plan",
  "timestamp": "2024-02-25T10:30:00.000Z"
}
```

---

## 💻 Frontend Implementation

### Using the Component

```jsx
import CropRecommendation from './pages/farmer/CropRecommendation';

// In your router
<Route 
  path="/farmer/crop-recommendation" 
  element={<CropRecommendation />} 
/>
```

### Using Helper Functions

```javascript
import {
  getDetailedRecommendations,
  getCropSpecificAdviceFromGroq,
  getSoilImprovementFromGroq
} from './utils/cropRecommendationHelper';

// Get recommendations with Groq analysis
const result = await getDetailedRecommendations(soilData, weatherData);
console.log(result.groqAnalysis);

// Get advice for specific crop
const advice = await getCropSpecificAdviceFromGroq('Rice', soilData, weatherData);
console.log(advice.advice);

// Get soil improvement plan
const plan = await getSoilImprovementFromGroq(soilData);
console.log(plan.plan);
```

---

## 🎨 UI/UX Flow

### Step 1: Fill Form
- Enter soil data (Type, pH, NPK, Organic Carbon)
- Enter weather data (Temperature, Humidity, Rainfall, Region)

### Step 2: Submit
- Click "फसल सुझाव खोजें"
- System generates recommendations + Groq analysis

### Step 3: View Results
Three tabs appear:
1. **🌾 फसल सुझाव** - AI-generated crop recommendations
2. **🤖 AI विश्लेषण** - Groq AI comprehensive analysis
3. **🌱 मिट्टी योजना** - Soil improvement plan

### Step 4: Get Detailed Advice
- For each crop, click "📋 इस फसल के लिए विस्तृत AI सलाह"
- View detailed month-by-month guidance

---

## 🌾 Example Groq Outputs

### Overall Analysis Example
```
आपकी मिट्टी और मौसम के विश्लेषण के आधार पर:

1. मिट्टी की गुणवत्ता:
   - अच्छी दोमट मिट्टी
   - pH स्तर आदर्श (6.5)
   - नाइट्रोजन मध्यम (100 mg/kg)
   
2. सर्वश्रेष्ठ विकल्प:
   - धान: 92/100 (सर्वश्रेष्ठ)
   - गेहूँ: 85/100
   
3. फसल चक्र सुझाव:
   वर्ष 1: धान (खरीफ) → गेहूँ (रबी)
   वर्ष 2: मक्का (ग्रीष्मकाल) → दालें (रबी)
   वर्ष 3: सोयाबीन (खरीफ) → सरसों (रबी)

4. जोखिम आकलन:
   - कम जोखिम (स्थिर फसलें)
   - बाजार मांग अच्छी है

5. बाजार के अवसर:
   - धान: ₹2500-3000/क्विंटल
   - गेहूँ: ₹2200-2500/क्विंटल
```

### Crop-Specific Advice Example
```
धान की खेती के लिए विस्तृत मार्गदर्शन:

**मई-जून (रोपण तैयारी):**
- खेत की जुताई 3 बार करें
- 20 टन गोबर की खाद मिलाएं
- नर्सरी में बीज तैयार करें

**जुलाई-अगस्त (रोपण):**
- 25-30 दिन पुरानी पौध रोपें
- पंक्ति में दूरी 20 cm रखें
- NPK खाद: 60-30-30 kg/हेक्टेयर

**सितंबर-अक्टूबर (वृद्धि):**
- सिंचाई: 5 cm पानी बनाए रखें
- निराई करें (2-3 बार)
- कीट नियंत्रण: स्पेडफ्लाई पर नजर रखें

**नवंबर (कटाई):**
- जनवरी तक पकने दें
- जनवरी आखिर में कटाई करें
- गेहूँ 40-50 क्विंटल/हेक्टेयर

**लागत-लाभ:**
- कुल लागत: ~₹40,000/हेक्टेयर
- प्रत्याशित आय: ~₹100,000/हेक्टेयर
- शुद्ध लाभ: ~₹60,000/हेक्टेयर
```

### Soil Improvement Plan Example
```
12 महीने की मिट्टी सुधार योजना:

**महीना 1-3 (तुरंत कार्य):**
- गोबर की खाद 10 टन/हेक्टेयर मिलाएं
- जैव खाद (Azospirillum) लागू करें
- मक्का/दालें लगाएं (नाइट्रोजन बढ़ाने के लिए)

**महीना 4-6 (वर्षा तैयारी):**
- हरी खाद के लिए ढैंचा लगाएं
- तरल जैव खाद का छिड़काव करें
- कम्पोस्ट गड्ढे तैयार करें

**महीना 7-9 (फॉस्फोरस सुधार):**
- सुपर फॉस्फेट 50 kg/हेक्टेयर डालें
- जैव फॉस्फेट बैक्टीरिया लागू करें
- नीम का केक 500 kg/हेक्टेयर डालें

**महीना 10-12 (अंतिम सुधार):**
- जैविक खाद दोबारा 5 टन/हेक्टेयर
- परीक्षण करता करें
- अगली फसल की योजना बनाएं

**कुल अनुमानित लागत: ₹15,000-20,000**
```

---

## 🔒 Privacy & Security

- Groq AI requests are made directly from backend
- User data is not stored in Groq systems
- API key is secure in backend `.env` file
- All requests are encrypted via HTTPS

---

## ⚠️ Important Notes

1. **API Rate Limits:**
   - Groq free tier: 30 requests/minute
   - Each recommendation generates 1-3 API calls
   - Implement caching for repeated requests if needed

2. **Fallback Behavior:**
   - If Groq API fails, system returns base recommendations
   - Graceful error handling with user-friendly messages
   - No blocking of recommendations if Groq is unavailable

3. **Response Times:**
   - AI Recommendations: ~2-3 seconds
   - Crop Advice: ~3-5 seconds
   - Soil Plan: ~4-6 seconds

4. **Language Support:**
   - All responses in Hindi/English mix (Hinglish)
   - Farmer-friendly terminology
   - Simple, non-technical language

---

## 🐛 Troubleshooting

### Error: "Groq API key not configured"
```
Solution: Add GROQ_API_KEY to .env file and restart server
```

### Error: "Failed to fetch analysis"
```
Solution: Check API key validity, internet connection, and Groq service status
```

### Response is taking too long (>10 seconds)
```
Solution: Groq free tier might be rate-limited. Retry after a few seconds
```

---

## 📚 Files Modified

### Backend
- `server/utils/groqCropRecommendation.js` (NEW)
- `server/controllers/crop.controller.js` (UPDATED)
- `server/routes/crop.routes.js` (UPDATED)

### Frontend
- `client/src/pages/farmer/CropRecommendation.jsx` (UPDATED)
- `client/src/utils/cropRecommendationHelper.js` (UPDATED)

---

## 🚀 Future Enhancements

1. **Caching:** Cache Groq responses for identical input
2. **Multilingual:** Support other Indian languages (Marathi, Tamil, etc.)
3. **Real-time Updates:** Live market price integration
4. **User Feedback:** Train algorithms based on farmer feedback
5. **Voice Support:** Voice input/output for accessibility
6. **Mobile App:** Native mobile application

---

## 📞 Support

For issues with:
- **Crop Recommendations:** Check soil test values accuracy
- **Groq AI Integration:** Verify API key and network connection
- **Results Quality:** Ensure recent soil and weather data

---

*Last Updated: February 2026*
*Groq AI Integration v1.0*
