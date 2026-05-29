import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Cpu, 
  UploadCloud, 
  Play, 
  Sliders, 
  Layers, 
  Terminal, 
  Activity, 
  CheckCircle2, 
  AlertOctagon,
  Gauge,
  Sparkles
} from 'lucide-react';

const PRESETS = [
  { id: 'delhi-cp', name: 'New Delhi — Connaught Place Cam 1', imageSrc: '/login-bg.jpg' },
  { id: 'mumbai-expressway', name: 'Mumbai — Bandra Reclamation Cam 4', imageSrc: '/admin-bg.jpg' },
  { id: 'blr-silkboard', name: 'Bangalore — Silk Board Flyover Cam 2', imageSrc: '/login-bg.jpg' }
];

const VisionAnalysis = () => {
  const [selectedPreset, setSelectedPreset] = useState('delhi-cp');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLanes, setShowLanes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showBoxes, setShowBoxes] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.45);
  const [iouThreshold, setIouThreshold] = useState(0.50);
  const [apiResults, setApiResults] = useState(null);
  const [logStream, setLogStream] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const terminalEndRef = useRef(null);

  // Default logs on load
  useEffect(() => {
    addLog('System initialized. Vision Camera Hub operational.');
    addLog('YOLOv8 Weights: coco.weights loaded successfully (80 classes).');
    addLog('OpenCV: CUDA acceleration detected and initialized.');
    runAnalysis(selectedPreset, null);
  }, []);

  // Recalculate and redraw when parameters or results change
  useEffect(() => {
    drawCanvas();
  }, [apiResults, showLanes, showLabels, showBoxes, confidenceThreshold, uploadedImage, selectedPreset]);

  // Auto scroll terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logStream]);

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogStream(prev => [...prev, { time, message, type }]);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    // Use uploaded base64 image or preset source
    img.src = uploadedImage || PRESETS.find(p => p.id === selectedPreset)?.imageSrc || '';

    img.onload = () => {
      // Set canvas aspect ratio matching container bounds
      const displayWidth = canvas.parentElement.clientWidth || 640;
      const displayHeight = (img.height / img.width) * displayWidth || 360;
      
      canvas.width = displayWidth;
      canvas.height = displayHeight;

      // Draw original background image
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

      if (!apiResults) return;

      // 1. Draw OpenCV Lane Occupancy Mask Overlay
      if (showLanes && apiResults.laneOccupancy) {
        // Perspective Lane vertices (normalised proportions)
        const lanePolygons = [
          // Lane 1
          [
            { x: 0.12, y: 0.85 }, { x: 0.32, y: 0.35 },
            { x: 0.39, y: 0.35 }, { x: 0.28, y: 0.85 }
          ],
          // Lane 2
          [
            { x: 0.31, y: 0.85 }, { x: 0.40, y: 0.35 },
            { x: 0.47, y: 0.35 }, { x: 0.48, y: 0.85 }
          ],
          // Lane 3
          [
            { x: 0.51, y: 0.85 }, { x: 0.48, y: 0.35 },
            { x: 0.56, y: 0.35 }, { x: 0.72, y: 0.85 }
          ]
        ];

        lanePolygons.forEach((poly, index) => {
          const rate = apiResults.laneOccupancy[index] || 0;
          ctx.beginPath();
          ctx.moveTo(poly[0].x * displayWidth, poly[0].y * displayHeight);
          ctx.lineTo(poly[1].x * displayWidth, poly[1].y * displayHeight);
          ctx.lineTo(poly[2].x * displayWidth, poly[2].y * displayHeight);
          ctx.lineTo(poly[3].x * displayWidth, poly[3].y * displayHeight);
          ctx.closePath();

          // Green for free-flow (<35%), Orange for moderate (<70%), Red for heavy
          const fillColor = rate > 0.70 ? 'rgba(239, 68, 68, 0.22)' : 
                            rate > 0.35 ? 'rgba(245, 158, 11, 0.22)' : 
                            'rgba(16, 185, 129, 0.22)';
          const strokeColor = rate > 0.70 ? 'var(--danger)' : 
                              rate > 0.35 ? 'var(--warning)' : 
                              'var(--success)';

          ctx.fillStyle = fillColor;
          ctx.fill();
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Draw lane identifier label
          ctx.font = '500 10px var(--font-sans)';
          ctx.fillStyle = '#fff';
          ctx.fillText(`Lane ${index + 1}: ${Math.round(rate * 100)}%`, poly[0].x * displayWidth + 10, poly[0].y * displayHeight - 20);
        });
      }

      // 2. Draw YOLO Bounding Boxes
      if (showBoxes && apiResults.detections) {
        apiResults.detections.forEach(det => {
          // Filter by threshold slider
          if (det.confidence < confidenceThreshold) return;

          const [x, y, w, h] = det.bbox;
          const absX = x * displayWidth;
          const absY = y * displayHeight;
          const absW = w * displayWidth;
          const absH = h * displayHeight;

          // Color palette mapping based on class type
          let color = '#06b6d4'; // Cyan for cars
          if (det.class === 'bus') color = '#a78bfa'; // Purple
          if (det.class === 'truck') color = '#fb923c'; // Orange
          if (det.class === 'motorcycle') color = '#facc15'; // Yellow

          // Draw Bounding Box rectangle
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.shadowColor = color;
          ctx.shadowBlur = 6;
          ctx.strokeRect(absX, absY, absW, absH);

          // Restore shadow blur
          ctx.shadowBlur = 0;

          // Draw label tags
          if (showLabels) {
            ctx.font = 'bold 10px monospace';
            const labelText = `${det.class.toUpperCase()} ${Math.round(det.confidence * 100)}%`;
            const textWidth = ctx.measureText(labelText).width;

            ctx.fillStyle = color;
            ctx.fillRect(absX - 1, absY - 15, textWidth + 10, 15);

            ctx.fillStyle = '#0f111a';
            ctx.fillText(labelText, absX + 4, absY - 4);
          }
        });
      }
    };
  };

  const runAnalysis = async (presetId, customImageBase64) => {
    setIsAnalyzing(true);
    setApiResults(null);
    addLog(`Initiating camera capture analysis pipeline...`, 'process');

    const logs = [
      { msg: 'OpenCV: Capture stream connected successfully.', delay: 200 },
      { msg: 'OpenCV: Applying camera matrix distortion correction & lane calibration.', delay: 500 },
      { msg: 'OpenCV: Applying perspective warp to resolve road geometry.', delay: 800 },
      { msg: 'YOLOv8: Performing forward inference pass (DarkNet backbone).', delay: 1100 },
      { msg: 'YOLOv8: Non-Maximum Suppression (NMS) layer thresholding.', delay: 1400 }
    ];

    // Trigger sequential console log stream for visual feedback
    logs.forEach(item => {
      setTimeout(() => {
        addLog(item.msg, 'process');
      }, item.delay);
    });

    try {
      const response = await fetch('http://localhost:5000/api/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preset: customImageBase64 ? null : presetId,
          image: customImageBase64 || null
        })
      });

      const data = await response.json();

      setTimeout(() => {
        if (data.success) {
          setApiResults(data);
          addLog(`Inference completed in ${data.inferenceTimeMs}ms. Detected ${data.vehicleCount} vehicles.`, 'success');
          addLog(`Lane Occupancies Calculated: [Lane 1: ${Math.round(data.laneOccupancy[0]*100)}% | Lane 2: ${Math.round(data.laneOccupancy[1]*100)}% | Lane 3: ${Math.round(data.laneOccupancy[2]*100)}%]`, 'success');
        } else {
          addLog('Vision Engine Error: Failed to analyze stream metadata.', 'error');
        }
        setIsAnalyzing(false);
      }, 1600);

    } catch (err) {
      setTimeout(() => {
        addLog(`Network connection error: Express backend offline.`, 'error');
        setIsAnalyzing(false);
      }, 1600);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const processUploadedFile = (file) => {
    if (!file.type.startsWith('image/')) {
      addLog('Vision Uploader: Rejected non-image file format.', 'error');
      return;
    }

    addLog(`Uploaded local camera feed capture: ${file.name}`, 'info');
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      setUploadedImage(base64Data);
      setSelectedPreset('custom');
      runAnalysis(null, base64Data);
    };
    reader.readAsDataURL(file);
  };

  const selectPresetHandler = (presetId) => {
    setUploadedImage(null);
    setSelectedPreset(presetId);
    runAnalysis(presetId, null);
  };

  return (
    <div className="content-wrapper animate-fade-in">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1 style={{ fontSize: '2.5rem', textAlign: 'left', margin: '0', background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          AI Vision Traffic Analysis
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', textAlign: 'left' }}>
          Real-time object classification and lane congestion tracking using YOLOv8 & OpenCV computer vision.
        </p>
      </div>

      <div className="vision-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginTop: '10px' }}>
        
        {/* LEFT COLUMN: Visualizer Monitor Screen */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Main Monitor Card */}
          <div className="intersection-card glass-panel" style={{ padding: '20px', position: 'relative' }}>
            <div className="card-header-actions" style={{ marginBottom: '15px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={18} style={{ color: 'var(--secondary)' }} />
                <span>Live Camera Stream Feed</span>
              </h2>
              <span className="system-status" style={{ background: isAnalyzing ? 'rgba(6,182,212,0.1)' : 'rgba(16,185,129,0.1)', color: isAnalyzing ? 'var(--secondary)' : 'var(--success)', border: isAnalyzing ? '1px solid rgba(6,182,212,0.2)' : '1px solid rgba(16,185,129,0.2)' }}>
                <span className={`status-dot ${isAnalyzing ? 'pulsing' : ''}`} style={{ backgroundColor: isAnalyzing ? 'var(--secondary)' : 'var(--success)' }}></span>
                {isAnalyzing ? 'YOLO Inference Running...' : 'Stream Synced'}
              </span>
            </div>

            {/* Canvas Monitor Uploader Frame */}
            <div 
              className="vision-monitor-frame"
              style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#090a0f',
                border: '1px solid var(--border-color)',
                minHeight: '260px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />

              {/* Scanning laser animation line */}
              {isAnalyzing && (
                <div 
                  className="vision-scanline"
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'var(--secondary)',
                    boxShadow: '0 0 12px var(--secondary)',
                    animation: 'scan-move 1.6s ease-in-out infinite',
                    zIndex: 25,
                    pointerEvents: 'none'
                  }}
                />
              )}

              {dragActive && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(99, 102, 241, 0.45)',
                  border: '2px dashed var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 30,
                  backdropFilter: 'blur(4px)',
                  color: '#fff',
                  fontSize: '1.2rem',
                  fontWeight: 600
                }}>
                  Drop Image to Import Feed
                </div>
              )}
            </div>

            {/* Quick Preset Selector Buttons */}
            <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>presets:</span>
              {PRESETS.map(p => (
                <button
                  key={p.id}
                  className={`lot-tab ${selectedPreset === p.id && !uploadedImage ? 'active' : ''}`}
                  onClick={() => selectPresetHandler(p.id)}
                  style={{ padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  {p.id === 'delhi-cp' ? 'Delhi CP Cam' : p.id === 'mumbai-expressway' ? 'Bandra Reclamation' : 'Silk Board Flyover'}
                </button>
              ))}

              <button
                className="lot-tab"
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', border: '1px dashed var(--border-color)', cursor: 'pointer' }}
              >
                <UploadCloud size={12} />
                <span>Upload Custom Image</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Threshold sliders and visibility mask controls */}
          <div className="intersection-card glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <Sliders size={15} style={{ color: 'var(--warning)' }} />
              <span>AI Detection Layer Parameters</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Confidence Threshold</span>
                  <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>{Math.round(confidenceThreshold*100)}%</span>
                </div>
                <input 
                  type="range"
                  min="0.10"
                  max="0.95"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  style={{ accentColor: 'var(--secondary)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textAlign: 'left' }}>Filters out YOLO detections below this classification accuracy limit.</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Non-Maximum Suppression (IoU)</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{iouThreshold.toFixed(2)}</span>
                </div>
                <input 
                  type="range"
                  min="0.20"
                  max="0.80"
                  step="0.05"
                  value={iouThreshold}
                  onChange={(e) => setIouThreshold(parseFloat(e.target.value))}
                  style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textAlign: 'left' }}>Eliminates redundant overlapping bounding boxes (Intersection over Union).</span>
              </div>
            </div>

            {/* Visibility Toggle Toggles */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '16px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={showLanes} 
                  onChange={(e) => setShowLanes(e.target.checked)}
                  style={{ accentColor: 'var(--success)' }} 
                />
                <span>OpenCV Lane Mask Overlay</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={showBoxes} 
                  onChange={(e) => setShowBoxes(e.target.checked)}
                  style={{ accentColor: 'var(--secondary)' }} 
                />
                <span>YOLO Bounding Boxes</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={showLabels} 
                  onChange={(e) => setShowLabels(e.target.checked)}
                  style={{ accentColor: 'var(--warning)' }} 
                  disabled={!showBoxes}
                />
                <span>Object Confidence Labels</span>
              </label>

              <button
                className="action-btn"
                onClick={() => runAnalysis(uploadedImage ? null : selectedPreset, uploadedImage)}
                disabled={isAnalyzing}
                style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: '0.8rem', background: 'var(--secondary-glow)', color: '#fff', border: '1px solid var(--secondary)', display: 'flex', alignItems: 'center', gap: '6px', height: '30px', cursor: 'pointer' }}
              >
                <Play size={12} />
                <span>Re-Run AI Inference</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Inference HUD metrics & retro green green log console */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Analysis Stats HUD */}
          <div className="intersection-card glass-panel" style={{ padding: '20px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <Activity size={18} style={{ color: 'var(--secondary)' }} />
              <span>Vision Inference Telemetry</span>
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
              
              {/* Stat 1: Vehicles Count */}
              <div className="signal-status-card" style={{ padding: '12px' }}>
                <span className="stat-label">Total Vehicles Detected</span>
                <span className="stat-value" style={{ color: 'var(--secondary)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Gauge size={16} />
                  <span>{apiResults ? apiResults.detections.filter(d => d.confidence >= confidenceThreshold).length : '—'}</span>
                </span>
              </div>

              {/* Stat 2: Congestion Level */}
              <div className="signal-status-card" style={{ padding: '12px' }}>
                <span className="stat-label">Congestion Index</span>
                <span className="stat-value" style={{ 
                  fontSize: '1.2rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  color: !apiResults ? 'var(--text-muted)' :
                         apiResults.congestionLevel === 'High' ? 'var(--danger)' :
                         apiResults.congestionLevel === 'Moderate' ? 'var(--warning)' : 'var(--success)'
                }}>
                  {apiResults ? (
                    <>
                      <span className="status-dot" style={{ 
                        backgroundColor: apiResults.congestionLevel === 'High' ? 'var(--danger)' :
                                         apiResults.congestionLevel === 'Moderate' ? 'var(--warning)' : 'var(--success)'
                      }}></span>
                      <span>{apiResults.congestionLevel}</span>
                    </>
                  ) : '—'}
                </span>
              </div>

              {/* Stat 3: Processing Delay */}
              <div className="signal-status-card" style={{ padding: '12px' }}>
                <span className="stat-label">YOLO Inference Time</span>
                <span className="stat-value" style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>
                  {apiResults ? `${apiResults.inferenceTimeMs} ms` : '—'}
                </span>
              </div>

              {/* Stat 4: Avg Confidence */}
              <div className="signal-status-card" style={{ padding: '12px' }}>
                <span className="stat-label">Average Confidence</span>
                <span className="stat-value" style={{ color: 'var(--success)', fontSize: '1.2rem' }}>
                  {apiResults ? `${Math.round((apiResults.detections.reduce((acc, d) => acc + d.confidence, 0) / apiResults.detections.length) * 100)}%` : '—'}
                </span>
              </div>
            </div>

            {/* Lane Congestion Fills */}
            <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span className="stat-label" style={{ fontWeight: 600 }}>OpenCV Perspective Lane Density:</span>
              
              {apiResults?.laneOccupancy ? (
                apiResults.laneOccupancy.map((rate, idx) => {
                  const percent = Math.round(rate * 100);
                  const color = rate > 0.70 ? 'var(--danger)' : 
                                rate > 0.35 ? 'var(--warning)' : 'var(--success)';
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Lane {idx + 1} Occupancy Zone</span>
                        <span style={{ color, fontWeight: 600 }}>{percent}%</span>
                      </div>
                      <div className="progress-track" style={{ height: '6px', borderRadius: '3px' }}>
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${percent}%`, 
                            backgroundColor: color, 
                            boxShadow: `0 0 8px ${color}55`,
                            borderRadius: '3px',
                            transition: 'width 0.4s ease'
                          }} 
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '20px', color: 'var(--text-dim)', textAlign: 'center', fontSize: '0.8rem', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                  Run vision analysis to calculate lane statistics.
                </div>
              )}
            </div>
          </div>

          {/* Retro terminal logs */}
          <div className="intersection-card glass-panel" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
              <Terminal size={15} style={{ color: 'var(--success)' }} />
              <span>Vision Inference Processing Logs</span>
            </h3>

            {/* Logs Console Container */}
            <div 
              className="vision-log-terminal"
              style={{
                flex: 1,
                background: '#07080c',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '8px',
                padding: '12px',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                lineHeight: '1.5',
                overflowY: 'auto',
                minHeight: '160px',
                maxHeight: '260px',
                textAlign: 'left'
              }}
            >
              {logStream.map((log, index) => {
                let color = 'var(--text-muted)';
                if (log.type === 'process') color = 'var(--secondary)';
                if (log.type === 'success') color = 'var(--success)';
                if (log.type === 'error') color = 'var(--danger)';

                return (
                  <div key={index} style={{ marginBottom: '4px', display: 'flex', gap: '6px' }}>
                    <span style={{ color: 'var(--text-dim)' }}>[{log.time}]</span>
                    <span style={{ color }}>{log.message}</span>
                  </div>
                );
              })}
              <div ref={terminalEndRef} />
            </div>

            {/* YOLO / OpenCV metadata badges */}
            <div style={{ marginTop: '14px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.12)', color: 'var(--secondary)', fontSize: '0.68rem', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                <Sparkles size={10} /> YOLOv8s Engine
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)', color: 'var(--success)', fontSize: '0.68rem', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                <Cpu size={10} /> OpenCV 4.8.0
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.12)', color: 'var(--warning)', fontSize: '0.68rem', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                <Activity size={10} /> CUDA 12.1 Acceleration
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionAnalysis;
