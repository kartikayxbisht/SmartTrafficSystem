import React, { useState } from 'react';
import { 
  Activity, 
  Cpu, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import MapView from '../components/MapView';
import AnalyticsChart from '../components/AnalyticsChart';

const Home = ({ 
  setActiveTab, 
  nsLightState, 
  ewLightState, 
  carsNS, 
  carsEW, 
  parkingSlots, 
  alerts, 
  onDismissAlert,
  selectedCityName,
  selectedControllerId,
  setSelectedControllerId,
  INDIA_CITIES,
  controllersState
}) => {
  const stats = [
    { label: 'Overall Efficiency', value: '+34.2%', subtext: 'Compared to baseline', trend: 'up', icon: TrendingUp, color: '#10b981' },
    { label: 'Avg Waiting Time', value: '42s', subtext: '-18s reduction', trend: 'down', icon: Clock, color: '#06b6d4' },
    { label: 'AI Adaptive Mode', value: 'Active', subtext: 'Optimizing signals', trend: 'stable', icon: Cpu, color: '#6366f1' },
    { label: 'Sensor Network Health', value: '99.8%', subtext: '1,248 active units', trend: 'up', icon: ShieldCheck, color: '#10b981' }
  ];

  return (
    <div className="content-wrapper animate-fade-in">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1 style={{ fontSize: '2.5rem', textAlign: 'left', margin: '0', background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          IntelliPark AI — Smart City Intelligence
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', textAlign: 'left' }}>
          AI-driven urban mobility orchestration and smart parking logistics panel.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div className="stat-card glass-panel" key={idx}>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value" style={{ color: stat.color }}>{stat.value}</span>
              <span className="stat-trend">
                {stat.trend === 'up' && <span className="trend-up" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><TrendingUp size={12} /> {stat.subtext}</span>}
                {stat.trend === 'down' && <span className="trend-down" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><TrendingDown size={12} /> {stat.subtext}</span>}
                {stat.trend === 'stable' && <span style={{ color: 'var(--text-muted)' }}>{stat.subtext}</span>}
              </span>
            </div>
            <div className="stat-icon-wrapper" style={{ color: stat.color, backgroundColor: `${stat.color}15`, borderColor: `${stat.color}30` }}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Telemetry and Analytics Graphs */}
      <div className="dashboard-grid">
        <MapView 
          selectedCityName={selectedCityName}
          selectedControllerId={selectedControllerId}
          setSelectedControllerId={setSelectedControllerId}
          INDIA_CITIES={INDIA_CITIES}
          controllersState={controllersState}
          nsLightState={nsLightState} 
          ewLightState={ewLightState} 
          carsNS={carsNS} 
          carsEW={carsEW} 
          parkingSlots={parkingSlots}
        />
        <AnalyticsChart />
      </div>

      {/* System Status and Alert Center */}
      <div className="dashboard-grid">
        {/* Alerts and Operations Panel */}
        <div className="intersection-card glass-panel">
          <div className="card-header-actions">
            <h2>Real-time Alerts & Operations</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="status-dot pulsing" style={{ backgroundColor: 'var(--success)', width: '6px', height: '6px' }}></span> Live Feed
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            {alerts.length === 0 ? (
              <div style={{ padding: '40px 20px', textItems: 'center', color: 'var(--text-dim)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                No active traffic anomalies detected. System running optimally.
              </div>
            ) : (
              alerts.map(alert => (
                <div 
                  key={alert.id}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '16px', 
                    borderRadius: '10px', 
                    background: alert.type === 'danger' ? 'rgba(239, 68, 68, 0.05)' :
                                alert.type === 'warning' ? 'rgba(245, 158, 11, 0.05)' :
                                alert.type === 'success' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(6, 182, 212, 0.05)',
                    borderLeft: `4px solid ${
                      alert.type === 'danger' ? 'var(--danger)' :
                      alert.type === 'warning' ? 'var(--warning)' :
                      alert.type === 'success' ? 'var(--success)' : 'var(--secondary)'
                    }`,
                    border: '1px solid var(--border-color)',
                    borderLeftWidth: '4px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ marginTop: '2px', color: 
                      alert.type === 'danger' ? 'var(--danger)' :
                      alert.type === 'warning' ? 'var(--warning)' :
                      alert.type === 'success' ? 'var(--success)' : 'var(--secondary)'
                    }}>
                      {alert.type === 'danger' && <AlertTriangle size={18} />}
                      {alert.type === 'warning' && <AlertTriangle size={18} />}
                      {alert.type === 'success' && <CheckCircle2 size={18} />}
                      {alert.type === 'info' && <Activity size={18} />}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <p style={{ fontSize: '0.9rem', color: '#fff', textAlign: 'left' }}>{alert.text}</p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'left' }}>{alert.time}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onDismissAlert(alert.id)}
                    style={{ background: 'transparent', color: 'var(--text-dim)', padding: '4px 8px', fontSize: '0.8rem' }}
                    onMouseEnter={(e) => e.target.style.color = '#fff'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-dim)'}
                  >
                    Dismiss
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Access Actions */}
        <div className="actions-card glass-panel">
          <h2>Quick Navigation</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '10px' }}>
            Jump to traffic signal override matrices or smart parking slots booking.
          </p>

          <div className="actions-list">
            <button className="action-btn" onClick={() => setActiveTab('dashboard')}>
              <Cpu size={18} style={{ color: 'var(--primary)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Signal Control Center</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Manage intersections and override timings</span>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-dim)' }} />
            </button>

            <button className="action-btn" onClick={() => setActiveTab('parking')}>
              <Zap size={18} style={{ color: 'var(--secondary)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Parking Allocation</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>View active parking bays and manage slot bookings</span>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-dim)' }} />
            </button>

            <button className="action-btn" onClick={() => setActiveTab('admin')}>
              <Activity size={18} style={{ color: 'var(--warning)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>System Configuration</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Configure signal thresholds and view system logs</span>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-dim)' }} />
            </button>
          </div>

          <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.03)', border: '1px solid rgba(99, 102, 241, 0.1)', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center', marginTop: '10px' }}>
            <Cpu size={24} style={{ color: 'var(--primary)' }} />
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#fff' }}>Traffic Core Engine</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>v3.1.2-beta optimization online. Running AI-DQN scheduling algorithm.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
