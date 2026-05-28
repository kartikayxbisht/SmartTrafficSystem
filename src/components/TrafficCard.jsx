import React from 'react';
import { Navigation, AlertOctagon, HelpCircle } from 'lucide-react';

const TrafficCard = ({ 
  name, 
  direction, 
  lightState, 
  carCount, 
  timeLeft, 
  isActivePhase, 
  isOverride, 
  onOverride 
}) => {
  const getCongestionStatus = () => {
    if (carCount > 12) return { text: 'Congested', color: 'var(--danger)' };
    if (carCount > 6) return { text: 'Moderate', color: 'var(--warning)' };
    return { text: 'Clear', color: 'var(--success)' };
  };

  const status = getCongestionStatus();
  
  return (
    <div className="signal-status-card" style={{ borderLeft: `3px solid ${isActivePhase ? 'var(--primary)' : 'rgba(255,255,255,0.03)'}` }}>
      <div className="signal-name-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Navigation 
            size={16} 
            style={{ 
              transform: direction === 'EW' ? 'rotate(90deg)' : 'rotate(0deg)',
              color: 'var(--text-muted)' 
            }} 
          />
          <span style={{ fontWeight: 600, color: '#fff' }}>{name}</span>
        </div>
        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: status.color }}>
          {status.text}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
        <div className="signal-light-hud">
          <span className={`hud-bulb red ${lightState === 'red' ? 'active' : ''}`}>
            <span className="hud-dot"></span> Red
          </span>
          <span className={`hud-bulb yellow ${lightState === 'yellow' ? 'active' : ''}`}>
            <span className="hud-dot"></span> Yellow
          </span>
          <span className={`hud-bulb green ${lightState === 'green' ? 'active' : ''}`}>
            <span className="hud-dot"></span> Green
          </span>
        </div>
        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
          {carCount} <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 400 }}>cars</span>
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Phase Timer</span>
          <span>{isActivePhase ? `${timeLeft}s` : 'Holding'}</span>
        </div>
        <div className="progress-track">
          <div 
            className="progress-fill" 
            style={{ 
              width: isActivePhase ? `${(timeLeft / (lightState === 'green' ? 15 : 3)) * 100}%` : '0%',
              backgroundColor: lightState === 'green' ? 'var(--success)' : 'var(--warning)'
            }}
          ></div>
        </div>
      </div>

      <button 
        className={`action-btn ${isOverride ? 'active-override' : ''}`}
        style={{ 
          marginTop: '8px', 
          padding: '8px 12px', 
          fontSize: '0.8rem', 
          justifyContent: 'center',
          borderColor: isOverride ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)',
          background: isOverride ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.01)'
        }}
        onClick={onOverride}
      >
        <AlertOctagon size={14} style={{ color: isOverride ? 'var(--danger)' : 'var(--text-dim)' }} />
        <span>{isOverride ? 'Priority Active' : 'Trigger Override'}</span>
      </button>
    </div>
  );
};

export default TrafficCard;
