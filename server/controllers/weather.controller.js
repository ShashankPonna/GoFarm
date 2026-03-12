const axios = require('axios');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Get farming advice based on weather conditions
const getFarmingAdvice = (weather) => {
  const { main, description, wind, clouds } = weather;
  const temp = main.temp;
  const humidity = main.humidity;
  const windSpeed = wind.speed;
  const cloudiness = clouds.all;

  const advice = [];

  // Temperature-based advice
  if (temp < 10) {
    advice.push('🌡️ ठंड: ठंड-सहिष्णु फसलें (गेहूँ, दालें) बोएं');
  } else if (temp > 35) {
    advice.push('🌡️ अत्यधिक गर्मी: सिंचाई बढ़ाएं, सूखा-सहिष्णु फसलें चुनें');
  } else {
    advice.push('🌡️ अनुकूल तापमान: सभी फसलों के लिए अच्छा मौसम');
  }

  // Humidity-based advice
  if (humidity > 80) {
    advice.push('💧 उच्च आर्द्रता: कवक रोगों का जोखिम, निवारक छिड़काव करें');
  } else if (humidity < 40) {
    advice.push('💧 कम आर्द्रता: पानी की कमी, सिंचाई की योजना बनाएं');
  }

  // Wind-based advice
  if (windSpeed > 25) {
    advice.push('💨 तेज़ हवा: फसलों को क्षति का खतरा, सहायक संरचना जोड़ें');
  } else if (windSpeed < 2) {
    advice.push('💨 शांत हवा: कीट नियंत्रण के लिए अच्छा समय');
  }

  // Cloud coverage
  if (cloudiness > 80) {
    advice.push('☁️ बादल: बारिश संभव है, खाद आवेदन में देरी करें');
  }

  // Additional rainfall-related advice
  if (description.includes('rain')) {
    advice.push('🌧️ बारिश: जल भराव से बचें, निकासी सुनिश्चित करें');
  }

  return advice;
};

// Demo weather data for testing (when API key is invalid)
const getDemoWeatherData = (location = 'Mumbai') => {
  return {
    location: `${location}, India`,
    temperature: 28,
    feelsLike: 30,
    humidity: 75,
    pressure: 1013,
    windSpeed: 12,
    windDegree: 230,
    cloudiness: 65,
    visibility: 10000,
    description: 'partly cloudy',
    condition: 'Clouds',
    icon: '02d',
    sunrise: '06:45:00',
    sunset: '18:30:00',
    farmingAdvice: [
      '🌡️ अनुकूल तापमान: सभी फसलों के लिए अच्छा मौसम',
      '💧 उच्च आर्द्रता: कवक रोगों का जोखिम, निवारक छिड़काव करें',
      '💨 शांत हवा: कीट नियंत्रण के लिए अच्छा समय'
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

    console.log('Weather API Key loaded:', !!OPENWEATHER_API_KEY, 'Type:', typeof OPENWEATHER_API_KEY);

    // Always use demo data for now to ensure UI works
    try {
      // Try to use real API if key is valid
      if (OPENWEATHER_API_KEY && typeof OPENWEATHER_API_KEY === 'string' && !OPENWEATHER_API_KEY.includes('YOUR_')) {
        let url = `${OPENWEATHER_BASE_URL}/weather?appid=${OPENWEATHER_API_KEY}&units=metric`;

        if (city) {
          url += `&q=${city}`;
        } else {
          url += `&lat=${lat}&lon=${lon}`;
        }

        const response = await axios.get(url);
        const data = response.data;

        // Get farming advice
        const farmingAdvice = getFarmingAdvice(data);

        // Format response
        const weatherData = {
          location: `${data.name}, ${data.sys.country}`,
          temperature: data.main.temp,
          feelsLike: data.main.feels_like,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          windSpeed: data.wind.speed,
          windDegree: data.wind.deg,
          cloudiness: data.clouds.all,
          visibility: data.visibility,
          description: data.weather[0].description,
          condition: data.weather[0].main,
          icon: data.weather[0].icon,
          sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('hi-IN'),
          sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('hi-IN'),
          farmingAdvice: farmingAdvice,
          timestamp: new Date().toISOString(),
          source: 'live'
        };

        return res.json({
          status: 'success',
          data: weatherData,
          message: 'Current weather fetched successfully'
        });
      }
    } catch (apiErr) {
      console.warn('Real API failed, falling back to demo data:', apiErr.message);
    }

    // Fall back to demo data
    const demoData = getDemoWeatherData(city || 'Mumbai');
    return res.json({
      status: 'success',
      data: demoData,
      message: 'Demo weather data'
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

    // Try to use real API if key is valid
    try {
      if (OPENWEATHER_API_KEY && typeof OPENWEATHER_API_KEY === 'string' && !OPENWEATHER_API_KEY.includes('YOUR_')) {
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
            time: new Date(item.dt * 1000).toLocaleTimeString('hi-IN'),
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
      }
    } catch (apiErr) {
      console.warn('Real forecast API failed, falling back to demo:', apiErr.message);
    }

    // Fall back to demo data
    const demoData = getDemoForecastData(city || 'Mumbai, India');
    return res.json({
      status: 'success',
      data: demoData,
      message: 'Demo forecast data'
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

    const farmingAdvice = getFarmingAdvice(data);

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
      windSpeed: data.wind.speed,
      windDegree: data.wind.deg,
      cloudiness: data.clouds.all,
      visibility: data.visibility,
      description: data.weather[0].description,
      condition: data.weather[0].main,
      icon: data.weather[0].icon,
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('hi-IN'),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('hi-IN'),
      farmingAdvice: farmingAdvice,
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
