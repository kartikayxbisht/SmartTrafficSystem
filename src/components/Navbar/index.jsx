import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, User } from 'lucide-react';

const Navbar = ({ activeTab, socketConnected, selectedCityName, setSelectedCityName, INDIA_CITIES, role }) => {
  const [timeString, setTimeString] = useState('');

  // Clock tick
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setTimeString(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'home': return 'System Overview';
      case 'dashboard': return 'Signal Control Center';
      case 'parking': return 'Parking Logistics';
      case 'admin': return 'System Configuration';
      default: return 'IntelliPark AI';
    }
  };

  return (
    <header className="navbar">
      <h2 className="nav-title">{getPageTitle()}</h2>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

        {/* STATE Selector — Admin only */}
        {role === 'admin' && INDIA_CITIES && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>STATE:</span>
            <select 
              value={selectedCityName} 
              onChange={(e) => setSelectedCityName(e.target.value)}
              style={{
                background: 'rgba(24, 27, 40, 0.7)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.8rem',
                padding: '6px 12px',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={e => e.target.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.target.style.borderColor = 'var(--border-color)'}
            >
              {Object.keys(INDIA_CITIES).map(city => (
                <option key={city} value={city} style={{ background: 'var(--bg-card)', color: '#fff' }}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Time HUD */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Calendar size={14} />
          <span>{timeString}</span>
        </div>

        {/* Role Badge */}
        {role && (
          <div className={`role-badge role-badge--${role}`}>
            {role === 'admin' ? <ShieldCheck size={12} /> : <User size={12} />}
            <span>{role === 'admin' ? 'Admin' : 'User'}</span>
          </div>
        )}

        {/* Status Badge */}
        <div 
          className={`system-status ${!socketConnected ? 'anomaly' : ''}`}
          style={!socketConnected ? { 
            color: 'var(--warning)', 
            backgroundColor: 'rgba(245, 158, 11, 0.1)', 
            borderColor: 'rgba(245, 158, 11, 0.2)' 
          } : {}}
        >
          <span className="status-dot pulsing"></span>
          <span style={{ fontWeight: 600 }}>
            {socketConnected ? 'TELEMETRY ONLINE' : 'LOCAL SIMULATOR'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
