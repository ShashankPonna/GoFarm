import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import BackButton from '../../components/BackButton';

const WeatherForecast = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null); // Force real location instead of default
  const [locationError, setLocationError] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    // Try to get user's location
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setLocationError(false);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setLocationError(true);
          setLoading(false);
        }
      );
    } else {
      setLocationError(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location) {
      fetchWeatherData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const fetchWeatherData = async () => {
    if (!location) return;
    setLoading(true);
    try {
      // Fetch current weather and forecast in parallel
      const [currentRes, forecastRes] = await Promise.all([
        api.get('/weather/current', {
          params: { lat: location.lat, lon: location.lon }
        }),
        api.get('/weather/forecast', {
          params: { lat: location.lat, lon: location.lon }
        })
      ]);

      setCurrentWeather(currentRes.data.data);
      setForecast(forecastRes.data.data.forecast);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (iconCode) => {
    const iconMap = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '🌥️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[iconCode] || '🌤️';
  };

  const getConditionColor = (condition) => {
    const colors = {
      'Clear': 'bg-yellow-100 text-yellow-800',
      'Clouds': 'bg-gray-100 text-gray-800',
      'Rain': 'bg-blue-100 text-blue-800',
      'Thunderstorm': 'bg-purple-100 text-purple-800',
      'Snow': 'bg-cyan-100 text-cyan-800',
      'Mist': 'bg-gray-200 text-gray-700'
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  if (locationError && !location) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-center relative mb-8">
            <BackButton className="absolute left-0" bgColor="bg-blue-200" color="text-blue-900" />
            <div className="text-center">
              <h1 className="text-4xl font-bold text-blue-900 mb-2">🌤️ Weather Forecast</h1>
              <p className="text-gray-700">5-Day Weather & Agricultural Alerts</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-2xl mx-auto">
            <div className="text-6xl text-amber-500 mb-6 flex justify-center">
              <i className="fas fa-location-arrow"></i>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Location Required</h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              To provide accurate, real-time farm-specific weather data and extreme weather alerts, we need to know your exact location.
            </p>
            <div className="bg-amber-50 rounded-lg p-6 border border-amber-200 text-amber-800 text-left">
              <p className="font-semibold mb-2"><i className="fas fa-info-circle mr-2"></i> How to enable location:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Look for the location prompt in your browser address bar.</li>
                <li>Click <strong>"Allow"</strong> when asked for location access.</li>
                <li>If you previously blocked it, click the lock icon in the address bar to change permissions.</li>
              </ul>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-8 btn-primary text-lg px-8 py-3"
            >
              <i className="fas fa-sync-alt mr-2"></i> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20 flex flex-col justify-center items-center">
            <div className="animate-spin text-5xl mb-6 text-blue-600">
               <i className="fas fa-circle-notch"></i>
            </div>
            <p className="text-xl font-medium text-gray-700">Fetching real-time weather from your location...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center relative mb-8">
          <BackButton className="absolute left-0" bgColor="bg-blue-200" color="text-blue-900" />
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-900 mb-2">🌤️ Weather Forecast</h1>
            <p className="text-gray-700">5-Day Weather & Agricultural Alerts</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6 shadow-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Extreme Weather Alerts Banner */}
        {currentWeather && currentWeather.alerts && currentWeather.alerts.length > 0 && (
          <div className="mb-8 space-y-3 animate-fade-in-up">
            <h2 className="text-xl font-bold flex items-center gap-2 text-red-800">
              <i className="fas fa-exclamation-triangle"></i> Active Weather Alerts
            </h2>
            <div className="flex flex-col gap-3">
              {currentWeather.alerts.map((alert, idx) => (
                <div 
                  key={idx} 
                  className={`border-l-4 p-4 rounded-r-xl shadow-md ${
                    alert.level === 'critical' 
                      ? 'border-red-600 bg-red-50 text-red-900' 
                      : 'border-orange-500 bg-orange-50 text-orange-900'
                  }`}
                >
                  <p className="font-bold text-lg flex items-center gap-2">
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Weather */}
        {currentWeather && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📍 वर्तमान मौसम</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Weather Icon and Main Info */}
              <div className="flex flex-col items-center justify-center border-r border-gray-200 col-span-1">
                <div className="text-7xl mb-4">{getWeatherIcon(currentWeather.icon)}</div>
                <p className="text-5xl font-bold text-gray-800">{currentWeather.temperature}°C</p>
                <p className="text-gray-600 capitalize text-lg mt-2">{currentWeather.description}</p>
                <p className="text-sm text-gray-500 mt-2">अनुभव: {currentWeather.feelsLike}°C</p>
              </div>

              {/* Location and Details */}
              <div className="col-span-1 border-r border-gray-200 pr-4">
                <p className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">{currentWeather.location}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 flex flex-col items-center text-center">
                    <span className="text-2xl mb-1">💧</span>
                    <span className="text-sm text-gray-500 font-medium">Humidity</span>
                    <span className="font-bold text-lg text-blue-900">{currentWeather.humidity}%</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex flex-col items-center text-center">
                    <span className="text-2xl mb-1">💨</span>
                    <span className="text-sm text-gray-500 font-medium">Wind Speed</span>
                    <span className="font-bold text-lg text-gray-800">{currentWeather.windSpeed} km/h</span>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100 flex flex-col items-center text-center">
                    <span className="text-2xl mb-1">🔽</span>
                    <span className="text-sm text-gray-500 font-medium">Pressure</span>
                    <span className="font-bold text-lg text-indigo-900">{currentWeather.pressure} hPa</span>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex flex-col items-center text-center">
                    <span className="text-2xl mb-1">👁️</span>
                    <span className="text-sm text-gray-500 font-medium">Visibility</span>
                    <span className="font-bold text-lg text-emerald-900">{(currentWeather.visibility / 1000).toFixed(1)} km</span>
                  </div>
                </div>
              </div>

              {/* Sun Times */}
              <div className="col-span-1 border-l border-gray-200 pl-8">
                <h3 className="font-semibold text-gray-800 mb-4">☀️ सूर्य की जानकारी</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">🌅 सूर्योदय</p>
                    <p className="text-lg font-semibold text-gray-800">{currentWeather.sunrise}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">🌇 सूर्यास्त</p>
                    <p className="text-lg font-semibold text-gray-800">{currentWeather.sunset}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Farming Advice */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-leaf text-green-600"></i> Agricultural Advice
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentWeather.farmingAdvice && currentWeather.farmingAdvice.map((advice, idx) => (
                  <div key={idx} className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                    <p className="text-gray-800">{advice}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5-Day Forecast */}
        {forecast && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 5-दिवसीय पूर्वानुमान</h2>

            {/* Day Selection Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {forecast.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(idx)}
                  className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${selectedDay === idx
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {day.date}
                </button>
              ))}
            </div>

            {/* Selected Day Details */}
            {forecast[selectedDay] && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Min Temp */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 shadow-sm">
                    <p className="text-gray-600 text-sm font-medium">Min Temperature</p>
                    <p className="text-3xl font-bold text-blue-700 mt-1">{forecast[selectedDay].minTemp.toFixed(1)}°C</p>
                  </div>

                  {/* Max Temp */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 shadow-sm">
                    <p className="text-gray-600 text-sm font-medium">Max Temperature</p>
                    <p className="text-3xl font-bold text-red-700 mt-1">{forecast[selectedDay].maxTemp.toFixed(1)}°C</p>
                  </div>

                  {/* Humidity */}
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-4 shadow-sm">
                    <p className="text-gray-600 text-sm font-medium">Humidity</p>
                    <p className="text-3xl font-bold text-cyan-700 mt-1">{forecast[selectedDay].humidity}%</p>
                  </div>

                  {/* Rainfall */}
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-4 shadow-sm">
                    <p className="text-gray-600 text-sm font-medium">Rainfall Amount</p>
                    <p className="text-3xl font-bold text-indigo-700 mt-1">{forecast[selectedDay].rainfall.toFixed(1)} mm</p>
                  </div>
                </div>

                {/* Condition Badge */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">मौसम की स्थिति</p>
                  <div className="flex items-center gap-3">
                    <span className="text-5xl">{getWeatherIcon(forecast[selectedDay].icon)}</span>
                    <span className={`px-4 py-2 rounded-lg font-semibold ${getConditionColor(forecast[selectedDay].condition)}`}>
                      {forecast[selectedDay].description}
                    </span>
                  </div>
                </div>

                {/* Hourly Forecast */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-clock text-blue-600"></i> Hourly Forecast
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    {forecast[selectedDay].forecasts && forecast[selectedDay].forecasts.map((hourly, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3 text-center hover:bg-gray-100 transition">
                        <p className="text-xs text-gray-600 mb-2">{hourly.time}</p>
                        <p className="text-2xl mb-1">🌤️</p>
                        <p className="font-semibold text-gray-800">{hourly.temp.toFixed(1)}°C</p>
                        <p className="text-xs text-gray-600 mt-1">💧 {hourly.humidity}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center pb-12">
          <button
            onClick={fetchWeatherData}
            className="btn-primary"
          >
            <i className="fas fa-sync-alt mr-2"></i> Refresh Weather Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeatherForecast;
