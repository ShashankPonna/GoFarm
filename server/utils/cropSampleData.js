/**
 * Crop Recommendation System - Sample Data & Examples
 * Use these examples as templates for your own recommendations
 */

// ============================================================
// SAMPLE SOIL DATA - Based on different regions in India
// ============================================================

export const SampleSoilData = {
  // Maharashtra - Cotton Belt
  maharashtraCotton: {
    type: 'Black Soil',
    ph: 7.2,
    n: 110,
    p: 25,
    k: 160,
    organicCarbon: 1.8,
    region: 'Maharashtra - Vidarbha'
  },

  // Punjab - Wheat & Rice Region
  punjabjWheatRice: {
    type: 'Loamy',
    ph: 7.8,
    n: 120,
    p: 35,
    k: 140,
    organicCarbon: 2.1,
    region: 'Punjab'
  },

  // Haryana - Mixed Crops
  haryanaGeneral: {
    type: 'Loamy',
    ph: 7.5,
    n: 95,
    p: 28,
    k: 135,
    organicCarbon: 1.5,
    region: 'Haryana'
  },

  // Uttar Pradesh - Sugarcane Region
  upSugarcane: {
    type: 'Clay Loam',
    ph: 6.8,
    n: 140,
    p: 45,
    k: 180,
    organicCarbon: 2.5,
    region: 'Uttar Pradesh'
  },

  // Karnataka - Coffee & Arecanut Region
  karnatakaSouthern: {
    type: 'Sandy Loam',
    ph: 6.2,
    n: 75,
    p: 22,
    k: 120,
    organicCarbon: 1.8,
    region: 'Karnataka'
  },

  // Bihar - Rice & Vegetables
  biharRiceVeg: {
    type: 'Loamy',
    ph: 6.4,
    n: 85,
    p: 30,
    k: 125,
    organicCarbon: 1.2,
    region: 'Bihar'
  },

  // Gujarat - Cotton & Groundnut
  gujaratCottonNut: {
    type: 'Sandy Loam',
    ph: 7.0,
    n: 90,
    p: 20,
    k: 130,
    organicCarbon: 1.0,
    region: 'Gujarat'
  },

  // Tamil Nadu - Vegetables & Pulses
  tamilNaduVegPulse: {
    type: 'Loamy',
    ph: 6.6,
    n: 100,
    p: 35,
    k: 145,
    organicCarbon: 2.0,
    region: 'Tamil Nadu'
  },

  // Low Fertility Soil (Degraded)
  lowFertilitySoil: {
    type: 'Sandy',
    ph: 5.8,
    n: 30,
    p: 8,
    k: 50,
    organicCarbon: 0.4,
    region: 'Arid Region'
  },

  // High Fertility Soil (Well-maintained)
  highFertilitySoil: {
    type: 'Clay Loam',
    ph: 6.8,
    n: 180,
    p: 65,
    k: 220,
    organicCarbon: 3.5,
    region: 'Well-managed Farm'
  }
};

// ============================================================
// SAMPLE WEATHER DATA - Based on different seasons
// ============================================================

export const SampleWeatherData = {
  // Monsoon Season (June-September)
  monsoon: {
    temp: 26,
    humidity: 80,
    rainfall: 800,
    region: 'All India'
  },

  // Winter Season (October-February)
  winter: {
    temp: 18,
    humidity: 65,
    rainfall: 150,
    region: 'All India'
  },

  // Summer Season (March-May)
  summer: {
    temp: 32,
    humidity: 45,
    rainfall: 50,
    region: 'All India'
  },

  // Post-Monsoon (September-October)
  postMonsoon: {
    temp: 28,
    humidity: 72,
    rainfall: 200,
    region: 'All India'
  },

  // High Rainfall Region (Western Ghats)
  highRainfall: {
    temp: 25,
    humidity: 85,
    rainfall: 2000,
    region: 'Kerala/Karnataka Western Ghats'
  },

  // Arid Region
  aridRegion: {
    temp: 30,
    humidity: 35,
    rainfall: 300,
    region: 'Rajasthan/Parts of Gujarat'
  },

  // Semi-Arid
  semiArid: {
    temp: 28,
    humidity: 50,
    rainfall: 500,
    region: 'Parts of MP, Rajasthan, UP'
  },

  // Coastal Humid
  coastalHumid: {
    temp: 27,
    humidity: 80,
    rainfall: 1500,
    region: 'Coastal States'
  }
};

// ============================================================
// COMPLETE SCENARIO EXAMPLES
// ============================================================

export const ScenarioExamples = {
  // Scenario 1: Maharashtra Farmer - Sugarcane Focus
  scenario1_MaharashtraFarmer: {
    name: 'Sugarcane Farming - Maharashtra',
    description: 'A farmer in Vidarbha region with black soil suitable for sugarcane',
    soil: SampleSoilData.maharashtraCotton,
    weather: {
      temp: 26,
      humidity: 70,
      rainfall: 900,
      region: 'Maharashtra'
    },
    expectedRecommendations: ['Sugarcane', 'Cotton', 'Soybean', 'Corn', 'Wheat']
  },

  // Scenario 2: Punjab Farmer - Rice-Wheat Rotation
  scenario2_PunjabjFarmer: {
    name: 'Rice-Wheat Rotation - Punjab',
    description: 'A farmer practicing traditional rice-wheat rotation in Punjab',
    soil: SampleSoilData.punjabjWheatRice,
    weather: {
      temp: 22,
      humidity: 68,
      rainfall: 650,
      region: 'Punjab'
    },
    expectedRecommendations: ['Wheat', 'Rice', 'Corn', 'Cotton', 'Soybean']
  },

  // Scenario 3: Small Vegetable Farmer
  scenario3_VegetableFarmer: {
    name: 'Vegetable Farming - Mixed Crops',
    description: 'Small farmer near urban area with good soil wanting to grow vegetables',
    soil: {
      type: 'Loamy',
      ph: 6.8,
      n: 140,
      p: 60,
      k: 180,
      organicCarbon: 2.8
    },
    weather: {
      temp: 24,
      humidity: 70,
      rainfall: 700,
      region: 'Near Delhi/State Capital'
    },
    expectedRecommendations: ['Tomato', 'Onion', 'Potato', 'Corn', 'Corn']
  },

  // Scenario 4: Organic Farmer - High Organic Matter
  scenario4_OrganicFarmer: {
    name: 'Organic Farming',
    description: 'Farmer with well-composted farm practicing organic farming',
    soil: SampleSoilData.highFertilitySoil,
    weather: {
      temp: 25,
      humidity: 75,
      rainfall: 1000,
      region: 'Central India'
    },
    expectedRecommendations: ['Rice', 'Pulses', 'Soybean', 'Corn', 'Cotton']
  },

  // Scenario 5: Drought-Prone Area
  scenario5_DroughtArea: {
    name: 'Low Rainfall Area',
    description: 'Farmer in arid region with limited water resources',
    soil: {
      type: 'Sandy Loam',
      ph: 7.2,
      n: 65,
      p: 15,
      k: 100,
      organicCarbon: 0.8
    },
    weather: {
      temp: 32,
      humidity: 40,
      rainfall: 350,
      region: 'Rajasthan/Gujarat'
    },
    expectedRecommendations: ['Wheat', 'Cotton', 'Corn', 'Pulses']
  },

  // Scenario 6: High Rainfall Region
  scenario6_HighRainfallArea: {
    name: 'High Rainfall Area',
    description: 'Farmer in Western Ghats with abundant rainfall',
    soil: {
      type: 'Clay',
      ph: 6.0,
      n: 95,
      p: 40,
      k: 160,
      organicCarbon: 2.5
    },
    weather: {
      temp: 25,
      humidity: 85,
      rainfall: 2000,
      region: 'Kerala/Karnataka'
    },
    expectedRecommendations: ['Rice', 'Sugarcane', 'Tomato', 'Onion', 'Pulses']
  },

  // Scenario 7: Degraded Soil
  scenario7_DegradedSoil: {
    name: 'Soil Restoration',
    description: 'Farmer with degraded soil looking to restore fertility',
    soil: SampleSoilData.lowFertilitySoil,
    weather: {
      temp: 28,
      humidity: 55,
      rainfall: 400,
      region: 'Semi-Arid Region'
    },
    expectedRecommendations: ['Pulses', 'Corn', 'Wheat', 'Soybean'],
    additionalAdvice: 'Add 10-15 tons FYM/compost per hectare for 2-3 years'
  },

  // Scenario 8: Sugarcane After Sugarcane Issue
  scenario8_SoilAfterSugarcane: {
    name: 'Crop Rotation After Sugarcane',
    description: 'Farmer wants to know what to plant after sugarcane',
    soil: {
      type: 'Loamy',
      ph: 6.8,
      n: 80, // Lower due to sugarcane depletion
      p: 20,
      k: 120,
      organicCarbon: 1.5
    },
    weather: {
      temp: 25,
      humidity: 70,
      rainfall: 750,
      region: 'Sugarcane Belt'
    },
    expectedRecommendations: ['Soybean', 'Pulses', 'Corn', 'Cotton'],
    additionalAdvice: 'Consider legume crops like soybean or pulses to restore nitrogen'
  }
};

// ============================================================
// QUICK TEST DATA
// ============================================================

export const QuickTestData = {
  // Test Case 1: Ideal Conditions
  idealConditions: {
    soil: {
      type: 'Loamy',
      ph: 6.5,
      n: 150,
      p: 50,
      k: 180,
      organicCarbon: 2.5
    },
    weather: {
      temp: 25,
      humidity: 70,
      rainfall: 800,
      region: 'Central India'
    }
  },

  // Test Case 2: Unfavorable Conditions
  unfavorableConditions: {
    soil: {
      type: 'Sandy',
      ph: 4.2,
      n: 20,
      p: 5,
      k: 40,
      organicCarbon: 0.2
    },
    weather: {
      temp: 40,
      humidity: 20,
      rainfall: 100,
      region: 'Desert'
    }
  },

  // Test Case 3: Cool Climate
  coolClimate: {
    soil: {
      type: 'Loamy',
      ph: 6.0,
      n: 100,
      p: 35,
      k: 150,
      organicCarbon: 2.0
    },
    weather: {
      temp: 15,
      humidity: 75,
      rainfall: 600,
      region: 'Hill Region'
    }
  },

  // Test Case 4: High Rainfall
  highRainfallTest: {
    soil: {
      type: 'Clay',
      ph: 6.5,
      n: 110,
      p: 40,
      k: 160,
      organicCarbon: 2.2
    },
    weather: {
      temp: 26,
      humidity: 90,
      rainfall: 2500,
      region: 'Western Ghats'
    }
  }
};

// ============================================================
// FUNCTIONS TO GET SAMPLE DATA
// ============================================================

export const getSampleByRegion = (region) => {
  const regionLower = region.toLowerCase();
  
  if (regionLower.includes('maharashtra')) return SampleSoilData.maharashtraCotton;
  if (regionLower.includes('punjab')) return SampleSoilData.punjabjWheatRice;
  if (regionLower.includes('karnataka')) return SampleSoilData.karnatakaSouthern;
  if (regionLower.includes('tamil') || regionLower.includes('tamil nadu')) return SampleSoilData.tamilNaduVegPulse;
  if (regionLower.includes('rajasthan') || regionLower.includes('arid')) return {
    type: 'Sandy Loam',
    ph: 7.2,
    n: 70,
    p: 18,
    k: 110,
    organicCarbon: 0.9,
    region: region
  };
  
  return SampleSoilData.haryanaGeneral;
};

export const getSampleBySeason = (season) => {
  const seasonLower = season.toLowerCase();
  
  if (seasonLower.includes('monsoon') || seasonLower.includes('kharif')) return SampleWeatherData.monsoon;
  if (seasonLower.includes('winter') || seasonLower.includes('rabi')) return SampleWeatherData.winter;
  if (seasonLower.includes('summer') || seasonLower.includes('zaid')) return SampleWeatherData.summer;
  
  return SampleWeatherData.postMonsoon;
};

// ============================================================
// EXPORT ALL DATA
// ============================================================

export default {
  SampleSoilData,
  SampleWeatherData,
  ScenarioExamples,
  QuickTestData,
  getSampleByRegion,
  getSampleBySeason
};
