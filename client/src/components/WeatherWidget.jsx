import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useTranslation } from 'react-i18next';

const CACHE_KEY = 'gofarm_weather_cache';
const CACHE_TTL = 10 * 60 * 1000;

const ICON_MAP = {
  '01d': '☀️', '01n': '🌙',
  '02d': '⛅', '02n': '🌥️',
  '03d': '☁️', '03n': '☁️',
  '04d': '☁️', '04n': '☁️',
  '09d': '🌧️', '09n': '🌧️',
  '10d': '🌦️', '10n': '🌧️',
  '11d': '⛈️', '11n': '⛈️',
  '13d': '❄️', '13n': '❄️',
  '50d': '🌫️', '50n': '🌫️',
};

const WeatherWidget = () => {
  const { t } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loc, setLoc] = useState({ lat: 19.07, lon: 72.87 });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setLoc({ lat: p.coords.latitude, lon: p.coords.longitude }),
        () => { }
      );
    }
  }, []);

  const fetchWeather = useCallback(async (force = false) => {
    if (!force) {
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
        if (cached && Date.now() - cached.ts < CACHE_TTL) {
          setWeather(cached.data);
          setLoading(false);
          return;
        }
      } catch (_) { }
    }
    setLoading(true);
    try {
      const res = await api.get('/weather/current', { params: { lat: loc.lat, lon: loc.lon } });
      const data = res.data.data;
      setWeather(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    } catch (_) { }
    finally { setLoading(false); }
  }, [loc]);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-green-100 to-blue-50 rounded-3xl p-5 border border-green-200/50 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-200 rounded-2xl"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-green-200 rounded w-24"></div>
            <div className="h-3 bg-green-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const icon = ICON_MAP[weather.icon] || '🌤️';

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-5 border border-green-200/50 shadow-sm hover:shadow-md transition-shadow">
      {/* Location row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <i className="fas fa-map-marker-alt text-green-600 text-xs"></i>
          <span className="text-sm font-semibold text-gray-700 truncate">{weather.location}</span>
        </div>
        <button
          onClick={() => fetchWeather(true)}
          title={t('common.refresh', 'Refresh')}
          className="w-8 h-8 rounded-xl bg-white/60 hover:bg-white flex items-center justify-center text-green-600 transition-all active:scale-90"
        >
          <i className="fas fa-sync-alt text-xs"></i>
        </button>
      </div>

      {/* Main Row */}
      <div className="flex items-center gap-4">
        <span className="text-5xl leading-none flex-shrink-0">{icon}</span>
        <div className="flex-1">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-gray-800 leading-none">{Math.round(weather.temperature)}°</span>
            <span className="text-sm font-medium text-gray-400">C</span>
          </div>
          <p className="text-sm text-gray-500 capitalize mt-1 font-medium">{weather.description}</p>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 bg-white/70 rounded-xl px-3 py-1.5">
            <i className="fas fa-tint text-blue-400 text-xs"></i>
            <span className="text-sm font-bold text-gray-700">{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2 bg-white/70 rounded-xl px-3 py-1.5">
            <i className="fas fa-wind text-gray-400 text-xs"></i>
            <span className="text-sm font-bold text-gray-700">{weather.windSpeed} km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
