/**
 * Crop Recommendation API Helper
 * Provides utility functions to interact with the crop recommendation endpoints
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Get detailed crop recommendations with Groq AI analysis
 * @param {Object} soilData - Soil parameters
 * @param {Object} weatherData - Weather parameters
 * @returns {Promise} Recommendation results with Groq analysis
 */
export const getDetailedRecommendations = async (soilData, weatherData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/crops/recommendations/full`,
      {
        soil: soilData,
        weather: weatherData
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch recommendations');
  }
};

/**
 * Get crop-specific advice from Groq AI
 * @param {string} cropName - Name of the crop
 * @param {Object} soilData - Soil parameters
 * @param {Object} weatherData - Weather parameters
 * @returns {Promise} Crop-specific advice
 */
export const getCropSpecificAdviceFromGroq = async (cropName, soilData, weatherData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/crops/groq-advice/${cropName}`,
      {
        soil: soilData,
        weather: weatherData
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch crop advice');
  }
};

/**
 * Get soil improvement plan from Groq AI
 * @param {Object} soilData - Soil parameters
 * @returns {Promise} Soil improvement plan
 */
export const getSoilImprovementFromGroq = async (soilData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/crops/soil-improvement`,
      {
        soil: soilData
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch soil plan');
  }
};

/**
 * Get quick crop recommendation
 * @param {Object} soilData - Soil parameters
 * @param {Object} weatherData - Weather parameters
 * @returns {Promise} Quick recommendation result
 */
export const getQuickRecommendation = async (soilData, weatherData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/crops/quick-recommend`,
      {
        soil: soilData,
        weather: weatherData
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch quick recommendation');
  }
};

/**
 * Format soil data for API request
 * @param {Object} rawData - Raw soil data from form
 * @returns {Object} Formatted soil data
 */
export const formatSoilData = (rawData) => {
  return {
    type: rawData.type || 'Loamy',
    ph: parseFloat(rawData.ph) || 6.5,
    n: parseFloat(rawData.nitrogen) || 0,
    p: parseFloat(rawData.phosphorus) || 0,
    k: parseFloat(rawData.potassium) || 0,
    organicCarbon: parseFloat(rawData.organicCarbon) || 0
  };
};

/**
 * Format weather data for API request
 * @param {Object} rawData - Raw weather data from form
 * @returns {Object} Formatted weather data
 */
export const formatWeatherData = (rawData) => {
  return {
    temp: parseFloat(rawData.temperature) || 25,
    humidity: parseFloat(rawData.humidity) || 50,
    rainfall: parseFloat(rawData.rainfall) || 600,
    region: rawData.region || 'Unknown'
  };
};

/**
 * Validate soil data
 * @param {Object} soilData - Soil data to validate
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateSoilData = (soilData) => {
  const errors = [];

  if (!soilData.type) errors.push('Soil type is required');
  if (soilData.ph < 4 || soilData.ph > 9) errors.push('pH should be between 4-9');
  if (soilData.n < 0 || soilData.n > 500) errors.push('Nitrogen should be between 0-500 mg/kg');
  if (soilData.p < 0 || soilData.p > 200) errors.push('Phosphorus should be between 0-200 mg/kg');
  if (soilData.k < 0 || soilData.k > 500) errors.push('Potassium should be between 0-500 mg/kg');
  if (soilData.organicCarbon < 0 || soilData.organicCarbon > 5) {
    errors.push('Organic carbon should be between 0-5%');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate weather data
 * @param {Object} weatherData - Weather data to validate
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateWeatherData = (weatherData) => {
  const errors = [];

  if (weatherData.temp < -10 || weatherData.temp > 50) {
    errors.push('Temperature should be between -10 to 50°C');
  }
  if (weatherData.humidity < 0 || weatherData.humidity > 100) {
    errors.push('Humidity should be between 0-100%');
  }
  if (weatherData.rainfall < 0 || weatherData.rainfall > 5000) {
    errors.push('Rainfall should be between 0-5000 mm');
  }
  if (!weatherData.region) errors.push('Region is required');

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get score interpretation
 * @param {number} score - Suitability score (0-100)
 * @returns {string} Score interpretation
 */
export const getScoreInterpretation = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
};

/**
 * Get score color
 * @param {number} score - Suitability score (0-100)
 * @returns {string} Tailwind color class
 */
export const getScoreColor = (score) => {
  if (score >= 80) return 'bg-green-500 text-white';
  if (score >= 60) return 'bg-yellow-500 text-white';
  if (score >= 40) return 'bg-orange-500 text-white';
  return 'bg-red-500 text-white';
};

/**
 * Format fertilizer NPK values for display
 * @param {Object} fertilizer - Fertilizer object
 * @returns {string} Formatted fertilizer string
 */
export const formatFertilizerRecommendation = (fertilizer) => {
  return `
    • Nitrogen: ${fertilizer.nitrogen}
    • Phosphorus: ${fertilizer.phosphorus}
    • Potassium: ${fertilizer.potassium}
    • Organic Matter: ${fertilizer.organicMatter}
  `.trim();
};

/**
 * Compare two crop recommendations
 * @param {Array} crops - Array of crop recommendations
 * @param {string} crop1Name - First crop name
 * @param {string} crop2Name - Second crop name
 * @returns {Object} Comparison object
 */
export const compareCrops = (crops, crop1Name, crop2Name) => {
  const crop1 = crops.find(c => c.cropName === crop1Name);
  const crop2 = crops.find(c => c.cropName === crop2Name);

  if (!crop1 || !crop2) {
    throw new Error('One or both crops not found in recommendations');
  }

  return {
    crop1: {
      name: crop1.cropName,
      score: crop1.suitabilityScore,
      yield: crop1.expectedYield,
      risk: crop1.riskLevel,
      demand: crop1.marketDemand
    },
    crop2: {
      name: crop2.cropName,
      score: crop2.suitabilityScore,
      yield: crop2.expectedYield,
      risk: crop2.riskLevel,
      demand: crop2.marketDemand
    },
    better: crop1.suitabilityScore > crop2.suitabilityScore ? crop1Name : crop2Name
  };
};

/**
 * Get crops by market demand filter
 * @param {Array} recommendations - Array of crop recommendations
 * @param {string} demandLevel - 'High', 'Medium', or 'Low'
 * @returns {Array} Filtered crops
 */
export const getCropsByDemand = (recommendations, demandLevel) => {
  return recommendations.filter(crop => crop.marketDemand === demandLevel);
};

/**
 * Get crops by risk level filter
 * @param {Array} recommendations - Array of crop recommendations
 * @param {string} riskLevel - 'Low', 'Medium', or 'High'
 * @returns {Array} Filtered crops
 */
export const getCropsByRisk = (recommendations, riskLevel) => {
  return recommendations.filter(crop => crop.riskLevel === riskLevel);
};

/**
 * Export recommendation as CSV
 * @param {Array} recommendations - Array of crop recommendations
 * @returns {string} CSV content
 */
export const exportAsCSV = (recommendations) => {
  const headers = ['Rank', 'Crop Name', 'Score', 'Risk', 'Demand', 'Yield', 'Season', 'Water'];
  const rows = recommendations.map(crop => [
    crop.rank,
    crop.cropName,
    crop.suitabilityScore,
    crop.riskLevel,
    crop.marketDemand,
    crop.expectedYield,
    crop.sowingSeason,
    crop.waterRequirement
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Download recommendations as file
 * @param {Array} recommendations - Array of crop recommendations
 * @param {string} filename - Output filename
 */
export const downloadRecommendations = (recommendations, filename = 'crop-recommendations.csv') => {
  const csv = exportAsCSV(recommendations);
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export default {
  getDetailedRecommendations,
  getCropSpecificAdviceFromGroq,
  getSoilImprovementFromGroq,
  getQuickRecommendation,
  formatSoilData,
  formatWeatherData,
  validateSoilData,
  validateWeatherData,
  getScoreInterpretation,
  getScoreColor,
  formatFertilizerRecommendation,
  compareCrops,
  getCropsByDemand,
  getCropsByRisk,
  exportAsCSV,
  downloadRecommendations
};
