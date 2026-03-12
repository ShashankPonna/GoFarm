import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', name: 'English', short: 'EN', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', short: 'HI', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', short: 'MR', flag: '🇮🇳' },
];

const LanguageSwitcher = ({ className = '' }) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const change = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Switch language"
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '5px 10px',
          borderRadius: '20px',
          border: '1.5px solid rgba(78,159,61,0.3)',
          background: 'rgba(255,255,255,0.9)',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          color: '#2F6F3E',
          transition: 'box-shadow 0.2s, background 0.2s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#f1f8e9'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
      >
        <span style={{ fontSize: '15px', lineHeight: 1 }}>{current.flag}</span>
        {/* full name on ≥sm, short code on mobile */}
        <span className="hidden sm:inline">{current.name}</span>
        <span className="sm:hidden">{current.short}</span>
        <i
          className={`fas fa-chevron-${open ? 'up' : 'down'}`}
          style={{ fontSize: '9px', opacity: 0.6 }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <ul
          role="listbox"
          aria-label="Language options"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            minWidth: '150px',
            background: '#fff',
            borderRadius: '14px',
            boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
            border: '1px solid rgba(78,159,61,0.15)',
            padding: '6px',
            zIndex: 200,
            listStyle: 'none',
            margin: 0,
          }}
        >
          {LANGUAGES.map(lang => {
            const active = lang.code === i18n.language;
            return (
              <li key={lang.code} role="option" aria-selected={active}>
                <button
                  onClick={() => change(lang.code)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') change(lang.code); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 10px',
                    borderRadius: '9px',
                    border: 'none',
                    background: active ? '#e8f5e9' : 'transparent',
                    color: active ? '#2E7D32' : '#444',
                    fontWeight: active ? 700 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f5f5f5'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: '14px' }}>{lang.flag}</span>
                  <span style={{ flex: 1 }}>{lang.name}</span>
                  {active && <i className="fas fa-check" style={{ fontSize: '10px', color: '#4CAF50' }} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;