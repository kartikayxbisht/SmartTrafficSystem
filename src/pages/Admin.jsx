import React, { useState, useEffect, useRef } from 'react';
import { 
  Sliders, 
  Settings, 
  Terminal as TerminalIcon, 
  Download, 
  Trash2, 
  Check, 
  HelpCircle,
  Cpu,
  RefreshCw
} from 'lucide-react';

const Admin = () => {
  // Config Toggles
  const [smartMode, setSmartMode] = useState(true);
  const [pedestrianPriority, setPedestrianPriority] = useState(false);
  const [carbonSaver, setCarbonSaver] = useState(true);
  
  // Timing parameters
  const [minGreen, setMinGreen] = useState(15);
  const [maxGreenExt, setMaxGreenExt] = useState(30);
  const [yellowTime, setYellowTime] = useState(3);
  
  // System Log Emulation
  const [logs, setLogs] = useState([
    { timestamp: '23:10:12', severity: 'info', message: 'System core initialization complete. v3.1.2-beta active.' },
    { timestamp: '23:12:45', severity: 'success', message: 'Established websocket connection to municipal dispatch.' },
    { timestamp: '23:15:30', severity: 'info', message: 'Recalibrated sonar distance sensors in Lot A, Lot B, Lot C.' },
    { timestamp: '23:20:01', severity: 'warning', message: 'Junction B: Slow traffic flow detected on Southbound Lane 2.' },
    { timestamp: '23:22:15', severity: 'success', message: 'AI DQN model loaded: weights verification checksum OK.' }
  ]);

  const logEndRef = useRef(null);

  // Auto-generate logs to make terminal alive
  useEffect(() => {
    const logInterval = setInterval(() => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      
      const logTemplates = [
        { severity: 'info', message: 'AI Scheduler optimized phase green duration on Intersection A.' },
        { severity: 'success', message: 'Synchronized telemetry weights database to municipal API successfully.' },
        { severity: 'info', message: 'Recalibrated cameras on Junction B (Eastbound) - auto-exposure adjusted.' },
        { severity: 'warning', message: 'Junction A: Increased vehicle backlog detected. Extending green phase.' },
        { severity: 'info', message: 'Lot B: Sonar sensor #04 state transition detected (OCCUPIED).' },
        { severity: 'info', message: 'Lot A: Sonar sensor #08 state transition detected (VACANT).' },
        { severity: 'success', message: 'Core temperature within safe bounds: 41°C. Fan duty cycle 18%.' },
      ];

      const chosen = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      setLogs(prev => [...prev.slice(-30), { timestamp: time, severity: chosen.severity, message: chosen.message }]);
    }, 4000);

    return () => clearInterval(logInterval);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleDownloadDiagnostics = () => {
    const logText = logs.map(l => `[${l.timestamp}] [${l.severity.toUpperCase()}] ${l.message}`).join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `traffic_diagnostics_${Date.now()}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="content-wrapper animate-fade-in">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1 style={{ fontSize: '2.5rem', textAlign: 'left', margin: '0', background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          System Configuration
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', textAlign: 'left' }}>
          Configure intersection timers, toggle active AI scheduler parameters, and view diagnostic logs.
        </p>
      </div>

      <div className="admin-grid">
        {/* Settings Panel */}
        <div className="config-card glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={20} style={{ color: 'var(--primary)' }} />
            <h2>Control Settings</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Toggle Row: AI Scheduler */}
            <div className="toggle-row">
              <div className="toggle-info">
                <span className="toggle-label">AI Adaptive Control</span>
                <span className="toggle-desc">Use deep reinforcement learning to dynamically adjust phases.</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={smartMode}
                  onChange={(e) => setSmartMode(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* Toggle Row: Pedestrian Priority */}
            <div className="toggle-row">
              <div className="toggle-info">
                <span className="toggle-label">Pedestrian Crossing Priority</span>
                <span className="toggle-desc">Automatically extend pedestrian crosswalk timers during peak hours.</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={pedestrianPriority}
                  onChange={(e) => setPedestrianPriority(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* Toggle Row: Carbon Minimization */}
            <div className="toggle-row">
              <div className="toggle-info">
                <span className="toggle-label">Carbon Minimization Core</span>
                <span className="toggle-desc">Alter signals to minimize idle vehicle emissions in heavy congestion.</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={carbonSaver}
                  onChange={(e) => setCarbonSaver(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* Range Slider: Min Green Duration */}
            <div className="range-control">
              <div className="range-header">
                <label htmlFor="min-green-slider">Min Green Phase</label>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{minGreen}s</span>
              </div>
              <input 
                id="min-green-slider"
                type="range" 
                min="5" 
                max="30" 
                value={minGreen}
                onChange={(e) => setMinGreen(Number(e.target.value))}
                className="slider-input"
              />
            </div>

            {/* Range Slider: Max Green Extension */}
            <div className="range-control">
              <div className="range-header">
                <label htmlFor="max-green-slider">Max Green Extension</label>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{maxGreenExt}s</span>
              </div>
              <input 
                id="max-green-slider"
                type="range" 
                min="10" 
                max="60" 
                value={maxGreenExt}
                onChange={(e) => setMaxGreenExt(Number(e.target.value))}
                className="slider-input"
              />
            </div>

            {/* Range Slider: Yellow Duration */}
            <div className="range-control">
              <div className="range-header">
                <label htmlFor="yellow-slider">Yellow Phase Duration</label>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{yellowTime}s</span>
              </div>
              <input 
                id="yellow-slider"
                type="range" 
                min="2" 
                max="6" 
                value={yellowTime}
                onChange={(e) => setYellowTime(Number(e.target.value))}
                className="slider-input"
              />
            </div>
          </div>
        </div>

        {/* Terminal Log Panel */}
        <div className="terminal-card glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TerminalIcon size={20} style={{ color: 'var(--secondary)' }} />
              <h2>Active System Terminal</h2>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                title="Download Log"
                onClick={handleDownloadDiagnostics}
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
              >
                <Download size={14} />
              </button>
              <button 
                title="Clear Logs"
                onClick={handleClearLogs}
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="terminal-window">
            {logs.length === 0 ? (
              <span style={{ color: 'var(--text-dim)' }}>No logged diagnostics. Terminal clean.</span>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`terminal-line ${log.severity}`}>
                  <span className="terminal-timestamp">[{log.timestamp}]</span>
                  <span>[{log.severity.toUpperCase()}] {log.message}</span>
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={12} /> Core Processor load: 12.4%
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={12} className="pulsing" /> Socket status: connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
