const axios = require('axios');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Get farming advice and extreme weather alerts based on weather conditions
const getFarmingAdviceAndAlerts = (weatherObj) => {
  const { main, wind, clouds } = weatherObj;
  const temp = main?.temp || 0;
  const humidity = main?.humidity || 0;
  const windSpeed = (wind?.speed || 0) * 3.6; // Convert m/s to km/h
  const cloudiness = clouds?.all || 0;
  
  const weatherArr = weatherObj.weather && weatherObj.weather[0] ? weatherObj.weather[0] : {};
  const description = weatherArr.description || '';
  const weatherMainStr = weatherArr.main ? weatherArr.main.toLowerCase() : '';

  const advice = [];
  const alerts = []; // Array to hold extreme weather alerts

  // EXTREME WEATHER ALERTS
  if (temp > 40) {
    alerts.push({ type: 'heat', message: '⚠️ Heat Wave Alert: Extremely high temperatures. Protect sensitive crops and assure ample irrigation.', level: 'critical' });
  } else if (temp < 4) {
    alerts.push({ type: 'frost', message: '❄️ Frost Risk: Freezing temperatures. Use covers or heaters to protect vulnerable plants.', level: 'critical' });
  }

  if (windSpeed > 40) {
    alerts.push({ type: 'storm', message: `🌪️ Storm Warning: High winds (${Math.round(windSpeed)} km/h). Secure equipment and protect tall crops.`, level: 'warning' });
  }

  if (weatherMainStr === 'thunderstorm' || weatherMainStr === 'extreme' || description.includes('heavy rain')) {
    alerts.push({ type: 'rain', message: '⛈️ Heavy Rainfall / Thunderstorm Alert: Risk of waterlogging. Check drainage systems.', level: 'warning' });
  }

  // STANDARD FARMING ADVICE

  // Temperature-based advice
  if (temp < 10 && temp >= 4) {
    advice.push('🌡️ Cold: Plant cold-tolerant crops like wheat and pulses.');
  } else if (temp > 35 && temp <= 40) {
    advice.push('🌡️ High Heat: Increase irrigation frequency, prefer drought-resistant crops.');
  } else if (temp >= 10 && temp <= 35) {
    advice.push('🌡️ Favorable Temperature: Good conditions for most seasonal crops.');
  }

  // Humidity-based advice
  if (humidity > 80) {
    advice.push('💧 High Humidity: Risk of fungal diseases. Apply preventive fungicide sprays.');
  } else if (humidity < 40) {
    advice.push('💧 Low Humidity: Plants may dry out quickly. Plan irrigation accordingly.');
  }

  // Wind-based advice
  if (windSpeed > 25 && windSpeed <= 40) {
    advice.push('💨 Moderate Wind: Avoid pesticide spraying. Provide support to tall plants.');
  } else if (windSpeed < 5) {
    advice.push('💨 Calm Wind: Excellent time for pesticide or fertilizer spraying.');
  }

  // Cloud coverage
  if (cloudiness > 80 && alerts.length === 0) {
    advice.push('☁️ Overcast: Rain is likely. Delay fertilizer application.');
  }

  // Additional rainfall-related advice
  if (description.includes('rain') && alerts.findIndex(a => a.type === 'rain') === -1) {
    advice.push('🌧️ Light/Moderate Rain: Avoid waterlogging. Ensure proper field drainage.');
  }

  return { advice, alerts };
};

// Demo weather data for testing (when API key is invalid)
const getDemoWeatherData = (location = 'Mumbai') => {
  return {
    location: `${location}, India`,
    temperature: 42, // high temp to show heat wave alert in demo
    feelsLike: 45,
    humidity: 75,
    pressure: 1013,
    windSpeed: 45, // high wind to show storm alert in demo
    windDegree: 230,
    cloudiness: 65,
    visibility: 10000,
    description: 'partly cloudy',
    condition: 'Clouds',
    icon: '02d',
    sunrise: '06:45:00',
    sunset: '18:30:00',
    farmingAdvice: [
      '🌡️ High Heat: Increase irrigation frequency, prefer drought-resistant crops.',
      '💧 High Humidity: Risk of fungal diseases. Apply preventive fungicide sprays.'
    ],
    alerts: [
      { type: 'heat', message: '⚠️ Heat Wave Alert: Extremely high temperatures. Protect sensitive crops and assure ample irrigation.', level: 'critical' },
      { type: 'storm', message: '🌪️ Storm Warning: High winds (45 km/h). Secure equipment and protect tall crops.', level: 'warning' }
    ],
    timestamp: new Date().toISOString(),
    isDemoData: true,
    demoMessage: '⚠️ Demo data. Add valid OpenWeatherMap API key to .env for live data.'
  };
};

// Get current weather
exports.getCurrentWeather = async (req, res) => {
  try {
    const { city, lat, lon } = req.query;

    if (!city && (!lat || !lon)) {
      return res.status(400).json({
        status: 'error',
        message: 'Either city name or lat/lon coordinates required'
      });
    }

    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY.includes('YOUR_')) {
      return res.status(500).json({
        status: 'error',
        message: 'OpenWeather API Key is not configured correctly in the environment.'
      });
    }

    let url = `${OPENWEATHER_BASE_URL}/weather?appid=${OPENWEATHER_API_KEY}&units=metric`;

    if (city) {
      url += `&q=${city}`;
    } else {
      url += `&lat=${lat}&lon=${lon}`;
    }

    const response = await axios.get(url);
    const data = response.data;

    // Get farming advice and extreme weather alerts
    const { advice: farmingAdvice, alerts } = getFarmingAdviceAndAlerts(data);

    // Format response
    const weatherData = {
      location: `${data.name}, ${data.sys.country}`,
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: Math.round(data.wind.speed * 3.6), // km/h
      windDegree: data.wind.deg,
      cloudiness: data.clouds.all,
      visibility: data.visibility,
      description: data.weather[0].description,
      condition: data.weather[0].main,
      icon: data.weather[0].icon,
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-IN'),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('en-IN'),
      farmingAdvice: farmingAdvice,
      alerts: alerts,
      timestamp: new Date().toISOString(),
      source: 'live'
    };

    return res.json({
      status: 'success',
      data: weatherData,
      message: 'Current weather fetched successfully'
    });

  } catch (err) {
    console.error('Weather Error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch weather data',
      error: err.message
    });
  }
};

// Demo forecast data for testing
const getDemoForecastData = (location = 'Mumbai, India') => {
  const now = new Date();
  const forecast = [];
  
  for (let i = 0; i < 5; i++) {
    const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toLocaleDateString('en-IN');
    
    forecast.push({
      date: dateStr,
      minTemp: 20 + i,
      maxTemp: 28 + i,
      humidity: 70 - i * 5,
      description: 'partly cloudy',
      condition: 'Clouds',
      icon: '02d',
      windSpeed: 10 + i,
      rainfall: i % 2 === 0 ? 2.5 : 0,
      forecasts: [
        { time: '00:00:00', temp: 20 + i, humidity: 75, description: 'clear', windSpeed: 8, rainfall: 0 },
        { time: '03:00:00', temp: 19 + i, humidity: 80, description: 'clear', windSpeed: 7, rainfall: 0 },
        { time: '06:00:00', temp: 18 + i, humidity: 82, description: 'partly cloudy', windSpeed: 6, rainfall: 0 },
        { time: '09:00:00', temp: 22 + i, humidity: 70, description: 'partly cloudy', windSpeed: 10, rainfall: 0 },
        { time: '12:00:00', temp: 26 + i, humidity: 65, description: 'partly cloudy', windSpeed: 12, rainfall: 0 },
        { time: '15:00:00', temp: 28 + i, humidity: 60, description: 'sunny', windSpeed: 14, rainfall: 0 },
        { time: '18:00:00', temp: 25 + i, humidity: 68, description: 'partly cloudy', windSpeed: 10, rainfall: i % 2 === 0 ? 1.2 : 0 },
        { time: '21:00:00', temp: 22 + i, humidity: 75, description: 'clear', windSpeed: 8, rainfall: 0 }
      ]
    });
  }
  
  return {
    location: location,
    forecast: forecast,
    timestamp: new Date().toISOString(),
    isDemoData: true,
    demoMessage: '⚠️ Demo data. Add valid OpenWeatherMap API key to .env for live data.'
  };
};

// Get weather forecast
exports.getForecast = async (req, res) => {
  try {
    const { city, lat, lon } = req.query;

    if (!city && (!lat || !lon)) {
      return res.status(400).json({
        status: 'error',
        message: 'Either city name or lat/lon coordinates required'
      });
    }

    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY.includes('YOUR_')) {
      return res.status(500).json({
        status: 'error',
        message: 'OpenWeather API Key is not configured correctly in the environment.'
      });
    }

    let url = `${OPENWEATHER_BASE_URL}/forecast?appid=${OPENWEATHER_API_KEY}&units=metric`;

    if (city) {
      url += `&q=${city}`;
    } else {
      url += `&lat=${lat}&lon=${lon}`;
    }

    const response = await axios.get(url);
    const data = response.data;

    // Group forecast by date
    const forecastByDate = {};

    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString('en-IN');

      if (!forecastByDate[date]) {
        forecastByDate[date] = {
          date: date,
          minTemp: item.main.temp_min,
          maxTemp: item.main.temp_max,
          humidity: item.main.humidity,
          description: item.weather[0].description,
          condition: item.weather[0].main,
          icon: item.weather[0].icon,
          windSpeed: item.wind.speed,
          rainfall: item.rain?.['3h'] || 0,
          forecasts: [] // hourly data
        };
      }

      forecastByDate[date].forecasts.push({
        time: new Date(item.dt * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        temp: item.main.temp,
        humidity: item.main.humidity,
        description: item.weather[0].description,
        windSpeed: item.wind.speed,
        rainfall: item.rain?.['3h'] || 0
      });

      // Update min/max
      forecastByDate[date].minTemp = Math.min(forecastByDate[date].minTemp, item.main.temp_min);
      forecastByDate[date].maxTemp = Math.max(forecastByDate[date].maxTemp, item.main.temp_max);
    });

    // Convert to array and get first 5 days
    const forecast = Object.values(forecastByDate).slice(0, 5);

    return res.json({
      status: 'success',
      data: {
        location: `${data.city.name}, ${data.city.country}`,
        forecast: forecast,
        timestamp: new Date().toISOString(),
        source: 'live'
      },
      message: '5-day forecast fetched successfully'
    });

  } catch (err) {
    console.error('Forecast Error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch forecast data',
      error: err.message
    });
  }
};

// Get weather by coordinates with full details
exports.getWeatherByLocation = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        status: 'error',
        message: 'Latitude and longitude required'
      });
    }

    const url = `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;

    const response = await axios.get(url);
    const data = response.data;

    const { advice: farmingAdvice, alerts } = getFarmingAdviceAndAlerts(data);

    const weatherData = {
      location: `${data.name}, ${data.sys.country}`,
      coordinates: {
        lat: data.coord.lat,
        lon: data.coord.lon
      },
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      tempMin: data.main.temp_min,
      tempMax: data.main.temp_max,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: Math.round(data.wind.speed * 3.6), // convert m/s to km/h
      windDegree: data.wind.deg,
      cloudiness: data.clouds.all,
      visibility: data.visibility,
      description: data.weather[0].description,
      condition: data.weather[0].main,
      icon: data.weather[0].icon,
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-IN'),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('en-IN'),
      farmingAdvice: farmingAdvice,
      alerts: alerts,
      timestamp: new Date().toISOString()
    };

    res.json({
      status: 'success',
      data: weatherData,
      message: 'Weather by location fetched successfully'
    });
  } catch (err) {
    console.error('Weather API Error:', err.message);
    res.status(err.response?.status || 500).json({
      status: 'error',
      message: err.response?.data?.message || 'Failed to fetch weather data',
      error: err.message
    });
  }
};
