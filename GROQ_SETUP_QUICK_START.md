# 🚀 Groq AI Integration Setup Guide

## Quick Start (5 minutes)

### Step 1: Get Your Groq API Key

1. **Visit Groq Console:**
   - Go to https://console.groq.com/
   - Click "Sign Up" (it's completely free)

2. **Create Account:**
   - Enter email and password
   - Verify email (check spam folder if needed)

3. **Generate API Key:**
   - Dashboard → "API Keys" tab
   - Click "+ Create API Key"
   - Copy the key (starts with `gsk_...`)
   - ⚠️ Save it safely!

### Step 2: Add API Key to Your Project

**Option A: Using `.env` file (Recommended)**

1. Open `.env` file in project root
2. Add this line:
   ```
   GROQ_API_KEY=gsk_your_actual_key_here
   ```
3. Save file

**Option B: Using `.env.local` file**

```bash
# Create .env.local file
echo GROQ_API_KEY=gsk_your_key > .env.local
```

### Step 3: Restart Server

```bash
# Kill previous Node process if running
npm start
```

The Groq integration is now active!

---

## ✅ Verify Installation

### Quick Test

1. Navigate to "फसल सुझाव" (Crop Recommendation) in your app
2. Fill out the form:
   - **Soil Type:** Loamy
   - **pH:** 6.5
   - **Nitrogen:** 100
   - **Phosphorus:** 30
   - **Potassium:** 150
   - **Temperature:** 25°C
   - **Humidity:** 65%
   - **Rainfall:** 600mm
   - **Region:** Maharashtra

3. Click "फसल सुझाव खोजें"

4. You should see:
   - ✅ "🌾 फसल सुझाव" tab with crop recommendations
   - ✅ "🤖 AI विश्लेषण" tab with Groq AI analysis
   - ✅ "🌱 मिट्टी योजना" tab with soil plan button

### Check Logs

```bash
# In terminal where server is running, you should see:
[Groq Service] Analyzing recommendations...
[Groq Service] Recommendations with AI analysis completed
```

---

## 🔑 Environment Setup Details

### All Supported Environment Variables

```env
# Required for Groq AI
GROQ_API_KEY=gsk_xxxxxxxxxxxxx

# Already in your project
MONGODB_URI=mongodb://...
FIREBASE_API_KEY=...
...other existing variables...
```

### File Locations

- **Backend:** `.env` (root directory)
- **Frontend:** Uses variables from backend API calls (no separate .env needed)

---

## 💡 What Each View Shows

### 1. 🌾 फसल सुझाव (Crop Recommendations)
```
Shows top 5 crops with scores:
- Rice: 92/100 ✅ Best Match
- Wheat: 85/100
- Cotton: 78/100
...

Each crop has buttons:
- 📋 Click for Groq AI detailed advice
- Click card to expand details
```

### 2. 🤖 AI विश्लेषण (AI Analysis)
```
Groq AI provides:
- Overall assessment of your farm
- Why each crop is suitable
- Potential risks and challenges
- Market opportunities
- Recommended crop rotation for 3 years
- Budget estimates
```

### 3. 🌱 मिट्टी योजना (Soil Plan)
```
12-month improvement strategy:
- Month 1-3: Immediate actions
- Month 4-6: Rainfall preparation
- Month 7-9: Nutrient enhancement
- Month 10-12: Final improvements
- Cost estimates and product recommendations
```

---

## 🎯 Common Scenarios

### Scenario 1: Testing with Sample Data

```javascript
// Use this sample data for testing

Soil:
- Type: Loamy
- pH: 6.5
- Nitrogen: 100 mg/kg
- Phosphorus: 30 mg/kg
- Potassium: 150 mg/kg
- Organic Carbon: 1.2%

Weather:
- Temperature: 25°C
- Humidity: 65%
- Rainfall: 600mm/year
- Region: Maharashtra

Expected Best Crop: Rice (92/100) or Wheat (85/100)
```

### Scenario 2: Checking Soil Issues

If you have poor soil, fill in:
```
Soil:
- Type: Clayey
- pH: 7.8 (too alkaline)
- Nitrogen: 40 (low)
- Phosphorus: 10 (low)
- Potassium: 80 (low)
- Organic Carbon: 0.5 (very low)

Watch: 🌱 मिट्टी योजना tab for improvement suggestions
```

---

## ⚠️ Troubleshooting

### Issue: "API Key not valid"

**Solution:**
1. Double-check API key from Groq console
2. Make sure it starts with `gsk_`
3. Verify no extra spaces in `.env` file
4. Restart server after saving `.env`

```env
# ❌ Wrong
GROQ_API_KEY = gsk_xxxxx
GROQ_API_KEY=gsk_xxxxx )

# ✅ Correct
GROQ_API_KEY=gsk_xxxxx
```

### Issue: "Failed to fetch analysis" (no 🤖 tab)

**Solution:**
1. Check server logs for error message
2. Ensure GROQ_API_KEY is set
3. Verify internet connection
4. Check Groq service status: https://status.groq.com/

### Issue: Takes 10+ seconds to get response

**Solution:**
- Groq free tier has rate limits
- Wait a few seconds before submitting again
- Premium tier provides higher limits

### Issue: 🌱 मिट्टी योजना button doesn't work

**Solution:**
1. Make sure you submitted the form first
2. Check browser console for errors (F12 → Console)
3. Ensure soil data is complete

---

## 📊 API Rate Limits

| Tier | Requests/Min | Tokens/Day |
|------|-------------|-----------|
| Free | 30 | 14,400 |
| Paid | Higher | Higher |

Each crop recommendation uses:
- Main analysis: ~800 tokens
- Crop advice: ~1000 tokens
- Soil plan: ~800 tokens

---

## 🔄 Workflow After Setup

```
1. User navigates to "Crop Recommendation"
   ↓
2. Fills form with soil & weather data
   ↓
3. Clicks "फसल सुझाव खोजें"
   ↓
4. Backend:
   - Calculates 5 best crops
   - Sends to Groq AI for analysis
   - Returns results
   ↓
5. Frontend shows 3 tabs:
   - 🌾 Algorithm recommendations
   - 🤖 Groq AI comprehensive analysis
   - 🌱 Soil improvement plan (click button)
   ↓
6. User clicks on any crop to get:
   📋 Detailed crop-specific AI advice
```

---

## 🧪 Optional: Advanced Testing

### Using cURL to Test API

```bash
# Test the API directly
curl -X POST http://localhost:5000/api/crops/recommendations/full \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

Expected response includes `groqAnalysis` field.

---

## 📝 Checklist After Setup

- [ ] Groq API key obtained from https://console.groq.com/
- [ ] API key added to `.env` file
- [ ] Server restarted (`npm start`)
- [ ] Tested with sample data
- [ ] All 3 tabs appearing (🌾 🤖 🌱)
- [ ] Crop-specific advice button working
- [ ] Getting AI responses within 5-10 seconds

---

## 🎓 Learning More

### Official Groq Documentation
- https://console.groq.com/docs
- https://groq.com/

### Groq Models Available
- **mixstral-8x7b** (used for recommendations)
- **llama2-70b**
- **gemma-7b**

### Prompt Engineering Tips
- Be specific about farmer context
- Ask for practical, actionable advice
- Include regional considerations
- Request Hindi/English mixed language

---

## 💬 Need Help?

### Common Questions

**Q: How long does free tier last?**
A: Forever free, but with rate limits (30 req/min)

**Q: Can I use this in production?**
A: Yes, but recommend upgrading to paid tier for better limits

**Q: Does it store my data?**
A: No, Groq only processes it and returns results

**Q: What happens if Groq API down?**
A: System falls back to base recommendations (no AI analysis)

**Q: Can I modify Groq prompts?**
A: Yes, edit `server/utils/groqCropRecommendation.js`

---

## 🚀 You're All Set!

Your crop recommendation system now has AI superpowers! 

**Next steps:**
1. Set GROQ_API_KEY in `.env`
2. Restart server
3. Navigate to "फसल सुझाव" in your app
4. Fill sample data and click "खोजें"
5. Enjoy AI-powered recommendations! 🎯

---

*Setup Guide v1.0 - February 2026*
