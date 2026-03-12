import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useTranslation } from 'react-i18next';

const CACHE_KEY = 'gofarm_weather_cache';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

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

  // Try geolocation once
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setLoc({ lat: p.coords.latitude, lon: p.coords.longitude }),
        () => { }
      );
    }
  }, []);

  const fetchWeather = useCallback(async (force = false) => {
    // Check cache first
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
    } catch (_) {
      // silently fail — widget just won't show
    } finally {
      setLoading(false);
    }
  }, [loc]);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  if (loading) {
    return (
      <div style={styles.card}>
        <div style={{ textAlign: 'center', color: '#8B5E3C', fontSize: '12px', padding: '8px 0' }}>
          {t('weather.loading', '…')}
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const icon = ICON_MAP[weather.icon] || '🌤️';

  return (
    <div
      style={styles.card}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {/* Location row */}
      <div style={styles.locationRow}>
        <i className="fas fa-map-marker-alt" style={{ color: '#8B5E3C', fontSize: '10px' }} />
        <span style={styles.locationText}>{weather.location}</span>
        <button
          onClick={() => fetchWeather(true)}
          title={t('common.refresh', 'Refresh')}
          style={styles.refreshBtn}
        >
          <i className="fas fa-sync-alt" style={{ fontSize: '9px' }} />
        </button>
      </div>

      {/* Main row: icon + temp + humidity */}
      <div style={styles.mainRow}>
        <span style={styles.icon}>{icon}</span>
        <div style={styles.tempBlock}>
          <span style={styles.temp}>{Math.round(weather.temperature)}°</span>
          <span style={styles.desc}>{weather.description}</span>
        </div>
        <div style={styles.statsBlock}>
          <div style={styles.stat}>
            <i className="fas fa-tint" style={{ color: '#BFDFF5', fontSize: '10px' }} />
            <span>{weather.humidity}%</span>
          </div>
          <div style={styles.stat}>
            <i className="fas fa-wind" style={{ color: '#BFDFF5', fontSize: '10px' }} />
            <span>{weather.windSpeed} km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    maxWidth: '260px',
    width: '100%',
    background: 'linear-gradient(135deg, #BFDFF5 0%, #d4ecd4 100%)',
    borderRadius: '16px',
    padding: '12px 14px',
    boxShadow: '0 4px 14px rgba(90,143,61,0.12)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    cursor: 'default',
    fontFamily: "'Poppins', sans-serif",
  },
  locationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginBottom: '8px',
  },
  locationText: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#4a3728',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  refreshBtn: {
    background: 'none',
    border: 'none',
    color: '#5A8F3D',
    cursor: 'pointer',
    padding: '2px 4px',
    borderRadius: '6px',
    opacity: 0.7,
    flexShrink: 0,
  },
  mainRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  icon: {
    fontSize: '32px',
    lineHeight: 1,
    flexShrink: 0,
  },
  tempBlock: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  temp: {
    fontSize: '26px',
    fontWeight: 800,
    color: '#1a3d1e',
    lineHeight: 1,
  },
  desc: {
    fontSize: '10px',
    color: '#4a5e3c',
    textTransform: 'capitalize',
    marginTop: '2px',
  },
  statsBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flexShrink: 0,
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#2E4A2E',
    fontWeight: 600,
    background: 'rgba(255,255,255,0.45)',
    borderRadius: '8px',
    padding: '2px 6px',
  },
};

export default WeatherWidget;
