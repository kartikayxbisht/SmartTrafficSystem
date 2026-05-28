import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  AlertOctagon, 
  AlertTriangle, 
  Clock, 
  CornerDownRight, 
  Cpu, 
  Navigation, 
  Play, 
  RotateCcw, 
  ShieldAlert, 
  Sparkles,
  Zap 
} from 'lucide-react';import TrafficCard from '../components/TrafficCard';

const Dashboard = ({
  phase,
  timeLeft,
  isOverride,
  overrideTarget,
  carsNS,
  carsEW,
  throughput,
  nsLightState,
  ewLightState,
  triggerOverride,
  releaseOverride,
  selectedCityName,
  selectedControllerId,
  setSelectedControllerId,
  INDIA_CITIES
}) => {

  return (
    <div className="content-wrapper animate-fade-in">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1 style={{ fontSize: '2.5rem', textAlign: 'left', margin: '0', background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Signal Control Center
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', textAlign: 'left' }}>
          Real-time adaptive intersection status, telemetry feeds, and emergency prioritizations.
        </p>
      </div>

      {/* City and Controller Selector Dropdowns for Indian Junctions */}
      {INDIA_CITIES && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          margin: '16px 0 24px 0',
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>STATE:</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--secondary)' }}>{selectedCityName}</span>
          </div>
          
          <div style={{ height: '20px', width: '1px', background: 'var(--border-color)' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>ACTIVE CONTROLLER:</span>
            <select 
              value={selectedControllerId} 
              onChange={(e) => setSelectedControllerId(e.target.value)}
              style={{
                background: 'rgba(24, 27, 40, 0.8)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.8rem',
                padding: '6px 12px',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                transition: 'border-color 0.2s',
                minWidth: '220px'
              }}
              onMouseEnter={e => e.target.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.target.style.borderColor = 'var(--border-color)'}
            >
              {(INDIA_CITIES[selectedCityName]?.controllers || []).map(ctrl => (
                <option key={ctrl.id} value={ctrl.id} style={{ background: 'var(--bg-card)', color: '#fff' }}>
                  {ctrl.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Real-time stats */}
      <div className="stats-grid">
        <div className="stat-card glass-panel" style={{ borderLeft: '3px solid var(--primary)' }}>
          <div className="stat-info">
            <span className="stat-label">Total Intersection Throughput</span>
            <span className="stat-value">{throughput} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>vehicles/hr</span></span>
            <span className="stat-trend trend-up">
              <Sparkles size={12} /> Optimization +14%
            </span>
          </div>
          <div className="stat-icon-wrapper">
            <Activity size={18} />
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ borderLeft: `3px solid ${nsLightState === 'green' ? 'var(--success)' : 'rgba(255,255,255,0.05)'}` }}>
          <div className="stat-info">
            <span className="stat-label">North-South (Signal A) Queue</span>
            <span className="stat-value">{carsNS} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>vehicles waiting</span></span>
            <span className="stat-trend" style={{ color: carsNS > 12 ? 'var(--danger)' : carsNS > 6 ? 'var(--warning)' : 'var(--success)' }}>
              {carsNS > 12 ? 'Congested' : carsNS > 6 ? 'Moderate' : 'Clear'}
            </span>
          </div>
          <div className="stat-icon-wrapper" style={{ color: nsLightState === 'green' ? 'var(--success)' : nsLightState === 'yellow' ? 'var(--warning)' : 'var(--danger)' }}>
            <Navigation size={18} style={{ transform: 'rotate(0deg)' }} />
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ borderLeft: `3px solid ${ewLightState === 'green' ? 'var(--success)' : 'rgba(255,255,255,0.05)'}` }}>
          <div className="stat-info">
            <span className="stat-label">East-West (Signal B) Queue</span>
            <span className="stat-value">{carsEW} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>vehicles waiting</span></span>
            <span className="stat-trend" style={{ color: carsEW > 12 ? 'var(--danger)' : carsEW > 6 ? 'var(--warning)' : 'var(--success)' }}>
              {carsEW > 12 ? 'Congested' : carsEW > 6 ? 'Moderate' : 'Clear'}
            </span>
          </div>
          <div className="stat-icon-wrapper" style={{ color: ewLightState === 'green' ? 'var(--success)' : ewLightState === 'yellow' ? 'var(--warning)' : 'var(--danger)' }}>
            <Navigation size={18} style={{ transform: 'rotate(90deg)' }} />
          </div>
        </div>
      </div>

      {/* Simulator Section */}
      <div className="dashboard-grid">
        <div className="intersection-card glass-panel">
          <div className="card-header-actions">
            <h2>Intersection Live Simulator</h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className={`system-status ${isOverride ? 'anomaly' : ''}`}>
                <span className={`status-dot ${isOverride ? 'pulsing' : ''}`}></span>
                {isOverride ? `MANUAL OVERRIDE: ${overrideTarget} ACTIVE` : 'AI SCHEDULER: ADAPTIVE'}
              </span>
            </div>
          </div>

          {/* Visual CSS Simulation */}
          <div className="intersection-simulator">
            {/* Roads */}
            <div className="road-h"></div>
            <div className="road-v"></div>
            <div className="intersection-box"></div>

            {/* Simulated moving car dots */}
            {carsNS > 0 && <div className="car-dot vertical-1"></div>}
            {carsNS > 4 && <div className="car-dot vertical-2" style={{ animationDelay: '1.2s' }}></div>}
            {carsEW > 0 && <div className="car-dot horizontal-1"></div>}
            {carsEW > 4 && <div className="car-dot horizontal-2" style={{ animationDelay: '1.8s' }}></div>}

            {/* Sim physical traffic light boxes */}
            {/* North Light (controls N-S traffic entering from top) */}
            <div className="sim-light north">
              <div className={`bulb red ${nsLightState === 'red' ? 'active' : ''}`}></div>
              <div className={`bulb yellow ${nsLightState === 'yellow' ? 'active' : ''}`}></div>
              <div className={`bulb green ${nsLightState === 'green' ? 'active' : ''}`}></div>
            </div>

            {/* South Light (controls N-S traffic entering from bottom) */}
            <div className="sim-light south">
              <div className={`bulb red ${nsLightState === 'red' ? 'active' : ''}`}></div>
              <div className={`bulb yellow ${nsLightState === 'yellow' ? 'active' : ''}`}></div>
              <div className={`bulb green ${nsLightState === 'green' ? 'active' : ''}`}></div>
            </div>

            {/* West Light (controls E-W traffic entering from left) */}
            <div className="sim-light west">
              <div className={`bulb red ${ewLightState === 'red' ? 'active' : ''}`}></div>
              <div className={`bulb yellow ${ewLightState === 'yellow' ? 'active' : ''}`}></div>
              <div className={`bulb green ${ewLightState === 'green' ? 'active' : ''}`}></div>
            </div>

            {/* East Light (controls E-W traffic entering from right) */}
            <div className="sim-light east">
              <div className={`bulb red ${ewLightState === 'red' ? 'active' : ''}`}></div>
              <div className={`bulb yellow ${ewLightState === 'yellow' ? 'active' : ''}`}></div>
              <div className={`bulb green ${ewLightState === 'green' ? 'active' : ''}`}></div>
            </div>
          </div>

          <div className="signal-controls">
            <TrafficCard 
              name="Signal A (North-South)"
              direction="NS"
              lightState={nsLightState}
              carCount={carsNS}
              timeLeft={timeLeft}
              isActivePhase={phase.startsWith('NS')}
              isOverride={isOverride && overrideTarget === 'NS'}
              onOverride={() => isOverride && overrideTarget === 'NS' ? releaseOverride() : triggerOverride('NS')}
            />
            <TrafficCard 
              name="Signal B (East-West)"
              direction="EW"
              lightState={ewLightState}
              carCount={carsEW}
              timeLeft={timeLeft}
              isActivePhase={phase.startsWith('EW')}
              isOverride={isOverride && overrideTarget === 'EW'}
              onOverride={() => isOverride && overrideTarget === 'EW' ? releaseOverride() : triggerOverride('EW')}
            />
          </div>
        </div>

        {/* Override panel */}
        <div className="actions-card glass-panel">
          <h2>Emergency Override Systems</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Bypasses active AI scheduling patterns to instantly vent lanes for prioritized emergency routes.
          </p>

          <div className="actions-list" style={{ marginTop: '10px' }}>
            <button 
              className={`action-btn ${isOverride && overrideTarget === 'NS' ? 'active-override' : ''}`}
              onClick={() => triggerOverride('NS')}
            >
              <AlertOctagon size={18} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Emergency Green: Signal A</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Forces North-South to green immediately</span>
              </div>
            </button>

            <button 
              className={`action-btn ${isOverride && overrideTarget === 'EW' ? 'active-override' : ''}`}
              onClick={() => triggerOverride('EW')}
            >
              <AlertOctagon size={18} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Emergency Green: Signal B</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Forces East-West to green immediately</span>
              </div>
            </button>

            {isOverride && (
              <button 
                className="action-btn"
                style={{ 
                  backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                  borderColor: 'rgba(16, 185, 129, 0.3)', 
                  color: 'var(--success)', 
                  justifyContent: 'center',
                  marginTop: '10px' 
                }}
                onClick={releaseOverride}
              >
                <RotateCcw size={16} />
                <span>Resume AI Auto Control</span>
              </button>
            )}
          </div>

          <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start', marginTop: '10px' }}>
            <ShieldAlert size={20} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#fff' }}>Protocol Warning</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Manual overrides trigger city grid alarms. Auto-logs are sent to municipal dispatch. Use with caution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
