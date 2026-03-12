const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weather.controller');

// Get current weather by city name
// Usage: GET /api/weather/current?city=Mumbai
router.get('/current', weatherController.getCurrentWeather);

// Get 5-day forecast by city name
// Usage: GET /api/weather/forecast?city=Mumbai
router.get('/forecast', weatherController.getForecast);

// Get weather by coordinates
// Usage: GET /api/weather/location?lat=19.07&lon=72.87
router.get('/location', weatherController.getWeatherByLocation);

module.exports = router;
