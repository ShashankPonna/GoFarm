# Crop Recommendation API Documentation

## Overview
The Crop Recommendation System analyzes soil and weather data to suggest the most suitable crops for your farm.

---

## API Endpoints

### 1. Get Full Crop Recommendations
**Endpoint:** `POST /api/crops/recommendations/full`

**Description:** Returns detailed recommendations for top 5 suitable crops based on soil and weather data.

**Request Body:**
```json
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
  "soilData": { ... },
  "weatherData": { ... },
  "recommendations": [
    {
      "rank": 1,
      "cropName": "Rice",
      "suitabilityScore": 92,
      "whySuitable": ["Grows well in clay and loamy soils", ...],
      "expectedYield": "40-60 quintal/hectare",
      "sowingSeason": "May - July (Monsoon)",
      "waterRequirement": "1000-1500 mm",
      "fertilizer": {
        "nitrogen": "40-80 kg/hectare",
        "phosphorus": "15-30 kg/hectare",
        "potassium": "30-60 kg/hectare",
        "organicMatter": "Add 5-10 tons/hectare well-decomposed manure"
      },
      "riskLevel": "Low",
      "marketDemand": "High",
      "additionalTips": [...]
    },
    ...
  ],
  "timestamp": "2024-02-25T10:30:00.000Z"
}
```

---

### 2. Quick Crop Recommendation
**Endpoint:** `POST /api/crops/quick-recommend`

**Description:** Returns a simplified recommendation with top crop and secondary options.

**Request Body:** (Same as full recommendation)

**Response:**
```json
{
  "status": "success",
  "data": {
    "status": "Success",
    "topCrop": {
      "rank": 1,
      "cropName": "Rice",
      ...
    },
    "secondaryOptions": [...],
    "generalAdvice": "Based on your soil and weather data, these crops are recommended..."
  },
  "timestamp": "2024-02-25T10:30:00.000Z"
}
```

---

## Soil Data Parameters

| Parameter | Type | Range | Description | Example |
|-----------|------|-------|-------------|---------|
| type | string | - | Soil type | Loamy, Clay, Sandy, Black Soil, Clay Loam, Sandy Loam |
| ph | number | 4-9 | Soil pH level | 6.5 |
| n | number | 0-500 | Nitrogen (mg/kg) | 100 |
| p | number | 0-200 | Phosphorus (mg/kg) | 30 |
| k | number | 0-500 | Potassium (mg/kg) | 150 |
| organicCarbon | number | 0-5 | Organic Carbon (%) | 1.2 |

---

## Weather Data Parameters

| Parameter | Type | Range | Description | Example |
|-----------|------|-------|-------------|---------|
| temp | number | -10 to 50 | Temperature (°C) | 25 |
| humidity | number | 0-100 | Humidity (%) | 65 |
| rainfall | number | 0-5000 | Annual Rainfall (mm) | 600 |
| region | string | - | Region/State name | Maharashtra |

---

## Suitability Score Calculation

The suitability score (0-100) is calculated based on how well conditions match crop requirements:

- **80-100:** Excellent (highly suitable)
- **60-79:** Good (suitable)
- **40-59:** Fair (marginally suitable)
- **0-39:** Poor (not suitable)

### Factors Considered:
1. Temperature range
2. Rainfall requirements
3. Soil type compatibility
4. Soil pH level
5. Nitrogen content
6. Phosphorus content
7. Potassium content
8. Organic carbon level

---

## Risk Levels

- **Low:** Stable crop with minimal risk factors
- **Medium:** Requires some specific care and management
- **High:** Requires intensive care, subject to disease/pest issues

---

## Market Demand Categories

- **High:** Strong consumer demand, stable prices
- **Medium:** Decent market, variable prices
- **Low:** Limited market, variable demand

---

## Crops Database

The system recommends from the following crops:
1. Rice
2. Wheat
3. Sugarcane
4. Cotton
5. Corn (Maize)
6. Soybean
7. Potato
8. Tomato
9. Onion
10. Pulses (Dal)

---

## Example Usage in JavaScript/React

```javascript
import axios from 'axios';

const getRecommendations = async () => {
  try {
    const soilData = {
      type: 'Loamy',
      ph: 6.5,
      n: 100,
      p: 30,
      k: 150,
      organicCarbon: 1.2
    };

    const weatherData = {
      temp: 25,
      humidity: 65,
      rainfall: 600,
      region: 'Maharashtra'
    };

    const response = await axios.post('/api/crops/recommendations/full', {
      soil: soilData,
      weather: weatherData
    });

    console.log('Recommendations:', response.data.recommendations);
    
    // Display top 3 crops
    response.data.recommendations.slice(0, 3).forEach(crop => {
      console.log(`${crop.rank}. ${crop.cropName} - Score: ${crop.suitabilityScore}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Error Handling

### Missing Required Data
```json
{
  "status": "error",
  "message": "Soil and weather data are required",
  "required": {
    "soil": ["type", "ph", "n", "p", "k", "organicCarbon"],
    "weather": ["temp", "humidity", "rainfall", "region"]
  }
}
```

### Invalid Data Ranges
```json
{
  "status": "error",
  "message": "Invalid data ranges",
  "errors": [
    "pH should be between 4-9",
    "Nitrogen should be between 0-500 mg/kg"
  ]
}
```

---

## Best Practices

1. **Get Soil Test Done:** Use certified laboratory soil testing for accurate N, P, K values
2. **Use Recent Data:** Use weather data from the current season
3. **Consult Expert:** Always confirm recommendations with local agricultural officer
4. **Consider Market:** While system recommends, consider local market demand
5. **Plan Crop Rotation:** Use recommendations to plan sustainable crop rotation

---

## Fertilizer Recommendations

The system provides NPK recommendations which are:
- **Safe ranges** for the crop
- **Starting points** only
- **Should be adjusted** based on:
  - Soil test results
  - Previous crop residue
  - Organic matter already applied
  - Local advisory recommendations

**Always consult:**
- Local agriculture department
- Soil test laboratory
- Experienced farmers in your region

---

## Contact & Support

For issues or suggestions regarding recommendations:
- Contact local agricultural extension officer
- Consult your state agriculture department
- Refer to ICAR (Indian Council of Agricultural Research) guidelines

---

*Last Updated: February 2026*
*System Version: 1.0*
