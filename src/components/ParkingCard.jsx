import React from 'react';
import { Building, Sparkles } from 'lucide-react';

const ParkingCard = ({ lotName, available, total, occupied, reserved, isActive, onClick }) => {
  const vacancyRate = Math.round((available / total) * 100);
  const strokeDashoffset = 113 - (113 * vacancyRate) / 100; // 2 * pi * r = 2 * 3.14 * 18 = ~113

  return (
    <div 
      className={`stat-card glass-panel ${isActive ? 'active-lot' : ''}`} 
      onClick={onClick}
      style={{ 
        cursor: 'pointer',
        borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
        transition: 'all var(--transition-fast)',
        background: isActive ? 'rgba(99, 102, 241, 0.05)' : 'rgba(24, 27, 40, 0.7)'
      }}
    >
      <div className="stat-info">
        <span className="stat-label" style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>
          {lotName} Telemetry
        </span>
        <span className="stat-value" style={{ fontSize: '1.5rem', color: '#fff' }}>
          {available} <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 400 }}>bays open</span>
        </span>
        
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
          <span>Occ: {occupied}</span>
          <span>•</span>
          <span>Res: {reserved}</span>
        </div>
      </div>

      {/* SVG Ring Progress */}
      <div style={{ position: 'relative', width: '48px', height: '48px' }}>
        <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle 
            cx="24" 
            cy="24" 
            r="18" 
            fill="transparent" 
            stroke="rgba(255,255,255,0.03)" 
            strokeWidth="4" 
          />
          {/* Foreground ring */}
          <circle 
            cx="24" 
            cy="24" 
            r="18" 
            fill="transparent" 
            stroke={vacancyRate > 50 ? 'var(--success)' : vacancyRate > 20 ? 'var(--warning)' : 'var(--danger)'}
            strokeWidth="4" 
            strokeDasharray="113"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#fff',
          fontFamily: 'var(--font-display)'
        }}>
          {vacancyRate}%
        </div>
      </div>
    </div>
  );
};

export default ParkingCard;
