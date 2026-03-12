const Crop = require('../models/Crop.model');
const { getRecommendations, getSimpleRecommendation } = require('../utils/cropRecommendation');
const { getEnhancedCropRecommendations, getCropSpecificAdvice, getSoilImprovementPlan } = require('../utils/groqCropRecommendation');

exports.createCrop = async (req, res) => {
  try {
    const crop = new Crop({ ...req.body, farmer: req.user.id });
    await crop.save();
    res.status(201).json(crop);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCrops = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    
    const crops = await Crop.find(filter).populate('farmer', 'name email');
    res.json(crops);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCropById = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id).populate('farmer', 'name email phone');
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    res.json(crop);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    res.json(crop);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findOneAndDelete({ _id: req.params.id, farmer: req.user.id });
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    res.json({ message: 'Crop deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get crop recommendations based on soil and weather data
 * POST /api/crops/recommendations
 * Body: { soil: {type, ph, n, p, k, organicCarbon}, weather: {temp, humidity, rainfall, region} }
 */
exports.getRecommendations = async (req, res) => {
  try {
    const { soil, weather } = req.body;

    // Validate required fields
    if (!soil || !weather) {
      return res.status(400).json({
        status: 'error',
        message: 'Soil and weather data are required',
        required: {
          soil: ['type', 'ph', 'n', 'p', 'k', 'organicCarbon'],
          weather: ['temp', 'humidity', 'rainfall', 'region']
        }
      });
    }

    // Validate data ranges
    const validationErrors = [];
    if (soil.ph < 4 || soil.ph > 9) validationErrors.push('pH should be between 4-9');
    if (soil.n < 0 || soil.n > 500) validationErrors.push('Nitrogen should be between 0-500 mg/kg');
    if (soil.p < 0 || soil.p > 200) validationErrors.push('Phosphorus should be between 0-200 mg/kg');
    if (soil.k < 0 || soil.k > 500) validationErrors.push('Potassium should be between 0-500 mg/kg');
    if (soil.organicCarbon < 0 || soil.organicCarbon > 5) validationErrors.push('Organic carbon should be between 0-5%');
    if (weather.temp < -10 || weather.temp > 50) validationErrors.push('Temperature should be between -10 to 50°C');
    if (weather.humidity < 0 || weather.humidity > 100) validationErrors.push('Humidity should be between 0-100%');
    if (weather.rainfall < 0 || weather.rainfall > 5000) validationErrors.push('Rainfall should be between 0-5000 mm');

    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data ranges',
        errors: validationErrors
      });
    }

    // Get recommendations
    const recommendations = getRecommendations({ soil, weather });

    // Get Groq AI enhanced analysis
    const enhancedData = await getEnhancedCropRecommendations(recommendations, soil, weather);

    res.json({
      status: 'success',
      soilData: soil,
      weatherData: weather,
      recommendations: enhancedData.recommendations,
      groqAnalysis: enhancedData.groqAnalysis,
      groqMessage: enhancedData.message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get simplified crop recommendation
 * POST /api/crops/quick-recommend
 */
exports.quickRecommend = async (req, res) => {
  try {
    const { soil, weather } = req.body;

    if (!soil || !weather) {
      return res.status(400).json({
        status: 'error',
        message: 'Soil and weather data are required'
      });
    }

    const recommendation = getSimpleRecommendation({ soil, weather });

    res.json({
      status: 'success',
      data: recommendation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get Groq AI analysis for specific crop
 * POST /api/crops/groq-advice/:cropName
 */
exports.getCropAdvice = async (req, res) => {
  try {
    const { cropName } = req.params;
    const { soil, weather } = req.body;

    if (!soil || !weather || !cropName) {
      return res.status(400).json({
        status: 'error',
        message: 'Crop name, soil and weather data are required'
      });
    }

    const advice = await getCropSpecificAdvice(cropName, soil, weather);

    res.json({
      status: 'success',
      crop: cropName,
      advice: advice.advice,
      groqMessage: advice.message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get Groq AI soil improvement plan
 * POST /api/crops/soil-improvement
 */
exports.getSoilPlan = async (req, res) => {
  try {
    const { soil } = req.body;

    if (!soil) {
      return res.status(400).json({
        status: 'error',
        message: 'Soil data is required'
      });
    }

    const plan = await getSoilImprovementPlan(soil);

    res.json({
      status: 'success',
      soilData: soil,
      plan: plan.plan,
      message: plan.message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
};


