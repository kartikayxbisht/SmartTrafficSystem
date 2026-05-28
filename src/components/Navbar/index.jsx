import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar } from 'lucide-react';

const Navbar = ({ activeTab, socketConnected }) => {
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
      default: return 'Smart Traffic System';
    }
  };

  return (
    <header className="navbar">
      <h2 className="nav-title">{getPageTitle()}</h2>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Date Time HUD */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Calendar size={14} />
          <span>{timeString}</span>
        </div>

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
