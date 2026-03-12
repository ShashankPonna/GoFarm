/**
 * Crop Recommendation Engine
 * Analyzes soil and weather data to recommend suitable crops
 */

const cropDatabase = [
  {
    cropName: 'Rice',
    minTemp: 21,
    maxTemp: 37,
    minRainfall: 1000,
    maxRainfall: 2250,
    soilType: ['Clay', 'Loamy'],
    optimalPh: { min: 5.5, max: 7.5 },
    nRequirement: { min: 40, max: 80 },
    pRequirement: { min: 15, max: 30 },
    kRequirement: { min: 30, max: 60 },
    waterRequired: '1000-1500 mm',
    sowingSeason: 'May - July (Monsoon)',
    yieldApprox: '40-60 quintal/hectare',
    riskLevel: 'Low',
    marketDemand: 'High',
    whySuitable: [
      'Grows well in clay and loamy soils',
      'Requires good rainfall and moisture',
      'Popular staple crop with stable market',
      'Well-established farming practices'
    ]
  },
  {
    cropName: 'Wheat',
    minTemp: 7,
    maxTemp: 27,
    minRainfall: 300,
    maxRainfall: 900,
    soilType: ['Loamy', 'Sandy Loam', 'Clay Loam'],
    optimalPh: { min: 6.0, max: 7.5 },
    nRequirement: { min: 60, max: 100 },
    pRequirement: { min: 20, max: 40 },
    kRequirement: { min: 30, max: 50 },
    waterRequired: '400-500 mm',
    sowingSeason: 'October - December (Rabi)',
    yieldApprox: '40-50 quintal/hectare',
    riskLevel: 'Low',
    marketDemand: 'High',
    whySuitable: [
      'Winter crop suitable for cool season',
      'Requires less water than rice',
      'Grows well in loamy soils',
      'High market demand and stable prices'
    ]
  },
  {
    cropName: 'Sugarcane',
    minTemp: 20,
    maxTemp: 30,
    minRainfall: 750,
    maxRainfall: 2250,
    soilType: ['Loamy', 'Clay', 'Clay Loam'],
    optimalPh: { min: 6.5, max: 7.5 },
    nRequirement: { min: 100, max: 150 },
    pRequirement: { min: 40, max: 60 },
    kRequirement: { min: 60, max: 100 },
    waterRequired: '1500-2000 mm',
    sowingSeason: 'September - November',
    yieldApprox: '700-800 quintal/hectare',
    riskLevel: 'Medium',
    marketDemand: 'High',
    whySuitable: [
      'Prefers warm climate with good rainfall',
      'Requires fertile deep soil',
      'Cash crop with assured market',
      'Good for 12-18 month investment'
    ]
  },
  {
    cropName: 'Cotton',
    minTemp: 18,
    maxTemp: 32,
    minRainfall: 300,
    maxRainfall: 1000,
    soilType: ['Black Soil', 'Loamy', 'Clay Loam'],
    optimalPh: { min: 6.0, max: 7.5 },
    nRequirement: { min: 80, max: 120 },
    pRequirement: { min: 30, max: 50 },
    kRequirement: { min: 40, max: 60 },
    waterRequired: '600-900 mm',
    sowingSeason: 'April - June',
    yieldApprox: '15-20 quintal/hectare',
    riskLevel: 'High',
    marketDemand: 'High',
    whySuitable: [
      'Profitable cash crop',
      'Tolerates moderate rainfall',
      'Good for well-drained soils',
      'Growing global demand'
    ]
  },
  {
    cropName: 'Corn (Maize)',
    minTemp: 10,
    maxTemp: 30,
    minRainfall: 500,
    maxRainfall: 1200,
    soilType: ['Loamy', 'Sandy Loam', 'Clay Loam'],
    optimalPh: { min: 5.5, max: 7.5 },
    nRequirement: { min: 80, max: 150 },
    pRequirement: { min: 25, max: 40 },
    kRequirement: { min: 40, max: 65 },
    waterRequired: '400-600 mm',
    sowingSeason: 'April - July (Summer & Monsoon)',
    yieldApprox: '40-50 quintal/hectare',
    riskLevel: 'Low',
    marketDemand: 'Medium',
    whySuitable: [
      'Versatile crop for various soils',
      'Moderate water requirement',
      'Growing demand for feed and food',
      'Quick harvest (90-120 days)'
    ]
  },
  {
    cropName: 'Soybean',
    minTemp: 15,
    maxTemp: 32,
    minRainfall: 450,
    maxRainfall: 1200,
    soilType: ['Loamy', 'Clay Loam', 'Sandy Loam'],
    optimalPh: { min: 6.0, max: 7.5 },
    nRequirement: { min: 0, max: 40 },
    pRequirement: { min: 20, max: 30 },
    kRequirement: { min: 30, max: 50 },
    waterRequired: '400-600 mm',
    sowingSeason: 'May - July',
    yieldApprox: '15-20 quintal/hectare',
    riskLevel: 'Medium',
    marketDemand: 'High',
    whySuitable: [
      'Enriches soil with nitrogen (legume)',
      'High protein content',
      'Growing health food market',
      'Good for crop rotation'
    ]
  },
  {
    cropName: 'Potato',
    minTemp: 15,
    maxTemp: 22,
    minRainfall: 400,
    maxRainfall: 750,
    soilType: ['Loamy', 'Sandy Loam'],
    optimalPh: { min: 5.5, max: 7.5 },
    nRequirement: { min: 80, max: 120 },
    pRequirement: { min: 40, max: 60 },
    kRequirement: { min: 80, max: 140 },
    waterRequired: '500-700 mm',
    sowingSeason: 'August - October',
    yieldApprox: '200-300 quintal/hectare',
    riskLevel: 'Medium',
    marketDemand: 'High',
    whySuitable: [
      'High yield per hectare',
      'Prefers cool climate',
      'Requires good organic matter',
      'Strong market demand year-round'
    ]
  },
  {
    cropName: 'Tomato',
    minTemp: 15,
    maxTemp: 28,
    minRainfall: 400,
    maxRainfall: 800,
    soilType: ['Loamy', 'Well-drained'],
    optimalPh: { min: 6.0, max: 6.8 },
    nRequirement: { min: 80, max: 120 },
    pRequirement: { min: 40, max: 80 },
    kRequirement: { min: 80, max: 120 },
    waterRequired: '400-500 mm',
    sowingSeason: 'July - October (Kharif & Rabi)',
    yieldApprox: '400-500 quintal/hectare',
    riskLevel: 'Medium',
    marketDemand: 'High',
    whySuitable: [
      'High yield and market value',
      'Daily vegetable with constant demand',
      'Can be grown in multiple seasons',
      'Suit for commercial farming'
    ]
  },
  {
    cropName: 'Onion',
    minTemp: 10,
    maxTemp: 25,
    minRainfall: 400,
    maxRainfall: 750,
    soilType: ['Loamy', 'Sandy Loam', 'Well-drained'],
    optimalPh: { min: 6.0, max: 7.5 },
    nRequirement: { min: 80, max: 120 },
    pRequirement: { min: 40, max: 60 },
    kRequirement: { min: 80, max: 120 },
    waterRequired: '300-400 mm',
    sowingSeason: 'July - September',
    yieldApprox: '250-300 quintal/hectare',
    riskLevel: 'Medium',
    marketDemand: 'High',
    whySuitable: [
      'Year-round market demand',
      'Good for storage and trade',
      'Less water requirement',
      'Good profit margins'
    ]
  },
  {
    cropName: 'Pulses (Dal)',
    minTemp: 15,
    maxTemp: 28,
    minRainfall: 400,
    maxRainfall: 900,
    soilType: ['Loamy', 'Clay Loam'],
    optimalPh: { min: 6.0, max: 7.5 },
    nRequirement: { min: 0, max: 30 },
    pRequirement: { min: 20, max: 35 },
    kRequirement: { min: 25, max: 45 },
    waterRequired: '300-400 mm',
    sowingSeason: 'September - November (Rabi)',
    yieldApprox: '15-20 quintal/hectare',
    riskLevel: 'Low',
    marketDemand: 'High',
    whySuitable: [
      'Improves soil fertility (legume)',
      'Stable high market demand',
      'Protein-rich staple food',
      'Good for crop rotation'
    ]
  }
];

/**
 * Calculate suitability score for a crop
 * @param {Object} soil - Soil parameters
 * @param {Object} weather - Weather parameters
 * @param {Object} crop - Crop requirements
 * @returns {number} Score 0-100
 */
const calculateSuitabilityScore = (soil, weather, crop) => {
  let score = 100;
  let penalties = 0;

  // Temperature check
  if (weather.temp < crop.minTemp || weather.temp > crop.maxTemp) {
    penalties += Math.abs(weather.temp - (weather.temp < crop.minTemp ? crop.minTemp : crop.maxTemp)) * 2;
  }

  // Rainfall check
  if (weather.rainfall < crop.minRainfall) {
    penalties += (crop.minRainfall - weather.rainfall) / 100;
  } else if (weather.rainfall > crop.maxRainfall) {
    penalties += (weather.rainfall - crop.maxRainfall) / 100;
  }

  // Soil type check
  const soilTypeMatch = crop.soilType.some(st => 
    soil.type.toLowerCase().includes(st.toLowerCase()) || 
    st.toLowerCase().includes(soil.type.toLowerCase())
  );
  if (!soilTypeMatch) penalties += 15;

  // pH check
  if (soil.ph < crop.optimalPh.min || soil.ph > crop.optimalPh.max) {
    penalties += Math.abs(soil.ph - (soil.ph < crop.optimalPh.min ? crop.optimalPh.min : crop.optimalPh.max)) * 5;
  }

  // Nitrogen check
  if (soil.n < crop.nRequirement.min) {
    penalties += (crop.nRequirement.min - soil.n) / 5;
  }

  // Phosphorus check
  if (soil.p < crop.pRequirement.min) {
    penalties += (crop.pRequirement.min - soil.p) / 5;
  }

  // Potassium check
  if (soil.k < crop.kRequirement.min) {
    penalties += (crop.kRequirement.min - soil.k) / 5;
  }

  // Organic carbon preference
  if (soil.organicCarbon < 0.5) {
    penalties += 10;
  } else if (soil.organicCarbon > 3) {
    penalties += 5;
  }

  score = Math.max(0, score - penalties);
  return Math.round(score);
};

/**
 * Get crop recommendations
 * @param {Object} params - { soil, weather }
 * @returns {Array} Recommended crops with details
 */
exports.getRecommendations = (params) => {
  const { soil, weather } = params;

  if (!soil || !weather) {
    throw new Error('Soil and weather data are required');
  }

  // Calculate scores for all crops
  const scoredCrops = cropDatabase.map(crop => ({
    ...crop,
    suitabilityScore: calculateSuitabilityScore(soil, weather, crop)
  }));

  // Sort by score and get top 5
  const recommended = scoredCrops
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
    .slice(0, 5)
    .map((crop, index) => ({
      rank: index + 1,
      cropName: crop.cropName,
      suitabilityScore: crop.suitabilityScore,
      whySuitable: crop.whySuitable,
      expectedYield: crop.yieldApprox,
      sowingSeason: crop.sowingSeason,
      waterRequirement: crop.waterRequired,
      fertilizer: {
        nitrogen: `${crop.nRequirement.min}-${crop.nRequirement.max} kg/hectare`,
        phosphorus: `${crop.pRequirement.min}-${crop.pRequirement.max} kg/hectare`,
        potassium: `${crop.kRequirement.min}-${crop.kRequirement.max} kg/hectare`,
        organicMatter: 'Add 5-10 tons/hectare well-decomposed manure'
      },
      riskLevel: crop.riskLevel,
      marketDemand: crop.marketDemand,
      additionalTips: getAdditionalTips(crop, soil, weather)
    }));

  return recommended;
};

/**
 * Get additional farming tips based on conditions
 */
const getAdditionalTips = (crop, soil, weather) => {
  const tips = [];

  // Soil deficiency tips
  if (soil.n < crop.nRequirement.min) {
    tips.push(`Low Nitrogen: Use urea (46% N) or organic sources like neem cake.`);
  }
  if (soil.p < crop.pRequirement.min) {
    tips.push(`Low Phosphorus: Apply single superphosphate (16% P) or rock phosphate.`);
  }
  if (soil.k < crop.kRequirement.min) {
    tips.push(`Low Potassium: Use potassium chloride or muriate of potash.`);
  }

  // pH adjustment tips
  if (soil.ph < crop.optimalPh.min) {
    tips.push(`Soil is Acidic: Add lime (calcium carbonate) to increase pH.`);
  } else if (soil.ph > crop.optimalPh.max) {
    tips.push(`Soil is Alkaline: Add sulfur or acidifying fertilizers to lower pH.`);
  }

  // Rainfall tips
  if (weather.rainfall < crop.minRainfall) {
    tips.push(`Low Rainfall: Plan for irrigation. Need ${crop.waterRequired} water supply.`);
  }

  // Temperature tips
  if (weather.temp < crop.minTemp) {
    tips.push(`Cool Climate: Use early-maturing varieties for this crop.`);
  } else if (weather.temp > crop.maxTemp) {
    tips.push(`Hot Climate: Use heat-tolerant varieties and provide shade if needed.`);
  }

  // Organic matter tips
  if (soil.organicCarbon < 0.8) {
    tips.push(`Low Organic Matter: Add 5-10 tons compost/FYM per hectare regularly.`);
  }

  return tips.length > 0 ? tips : ['Conditions are suitable for this crop. Follow standard farming practices.'];
};

/**
 * Get simple recommendation summary
 */
exports.getSimpleRecommendation = (params) => {
  const recommendations = this.getRecommendations(params);
  
  if (recommendations.length === 0) {
    return {
      status: 'No suitable crops found',
      message: 'Current soil and weather conditions are not optimal for conventional crops.'
    };
  }

  return {
    status: 'Success',
    topCrop: recommendations[0],
    secondaryOptions: recommendations.slice(1, 3),
    generalAdvice: 'Based on your soil and weather data, these crops are recommended. Always consult your local agricultural officer for final decision.'
  };
};
