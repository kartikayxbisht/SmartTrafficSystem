import React, { useState, useRef } from 'react';
import { TrendingUp, BarChart2 } from 'lucide-react';

const AnalyticsChart = () => {
  const [activeMetric, setActiveMetric] = useState('flow');
  const [hoverIndex, setHoverIndex] = useState(null);
  const chartRef = useRef(null);

  const dataSets = {
    flow: {
      title: 'Traffic Volume Trend',
      unit: 'vehicles/hr',
      color: 'var(--primary)',
      colorLight: 'var(--primary-glow)',
      points: [620, 1420, 980, 1750, 1920, 1340, 800],
      labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
    },
    speed: {
      title: 'Average Flow Speed',
      unit: 'km/h',
      color: 'var(--secondary)',
      colorLight: 'var(--secondary-glow)',
      points: [58, 34, 48, 28, 24, 42, 55],
      labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
    },
    carbon: {
      title: 'CO2 Emission Reductions',
      unit: 'kg CO2',
      color: '#10b981',
      colorLight: 'rgba(16, 185, 129, 0.15)',
      points: [15, 68, 42, 92, 110, 75, 25],
      labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
    }
  };

  const activeData = dataSets[activeMetric];
  const maxVal = Math.max(...activeData.points) * 1.15; // 15% headroom
  const minVal = Math.min(...activeData.points) * 0.85;

  // Chart SVG Coordinates Calculations
  const width = 360;
  const height = 150;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const pointsCount = activeData.points.length;

  const getCoordinates = () => {
    return activeData.points.map((val, index) => {
      const x = paddingLeft + (index / (pointsCount - 1)) * chartWidth;
      // Map val in range [0, maxVal] to [chartHeight + paddingTop, paddingTop]
      const y = chartHeight + paddingTop - (val / maxVal) * chartHeight;
      return { x, y, value: val };
    });
  };

  const coords = getCoordinates();

  // Create SVG path string
  const getPathD = () => {
    if (coords.length === 0) return '';
    return coords.reduce((acc, coord, idx) => {
      if (idx === 0) return `M ${coord.x} ${coord.y}`;
      // Smooth curves using cubic bezier
      const prev = coords[idx - 1];
      const cpX1 = prev.x + (coord.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (coord.x - prev.x) / 2;
      const cpY2 = coord.y;
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${coord.x} ${coord.y}`;
    }, '');
  };

  const getAreaD = () => {
    const pathD = getPathD();
    if (!pathD) return '';
    return `${pathD} L ${coords[coords.length - 1].x} ${chartHeight + paddingTop} L ${coords[0].x} ${chartHeight + paddingTop} Z`;
  };

  const handleMouseMove = (e) => {
    if (!chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Scale mouseX back to viewPort coordinates (0 to 360)
    const svgX = (mouseX / rect.width) * width;
    
    // Find closest coordinate point
    let closestIndex = 0;
    let minDiff = Infinity;
    
    coords.forEach((coord, idx) => {
      const diff = Math.abs(coord.x - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    setHoverIndex(closestIndex);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  return (
    <div className="intersection-card glass-panel" style={{ flexGrow: 1 }}>
      <div className="card-header-actions" style={{ marginBottom: '15px' }}>
        <h2>City Performance Analytics</h2>
        <div className="lot-tabs" style={{ gap: '4px' }}>
          {Object.entries(dataSets).map(([key, data]) => (
            <button 
              key={key}
              className={`lot-tab ${activeMetric === key ? 'active' : ''}`}
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              onClick={() => {
                setActiveMetric(key);
                setHoverIndex(null);
              }}
            >
              {key === 'flow' ? 'Volume' : key === 'speed' ? 'Speed' : 'Eco'}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Line Graph */}
      <div 
        ref={chartRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ position: 'relative', width: '100%' }}
      >
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          width="100%" 
          height="100%"
          style={{ overflow: 'visible' }}
        >
          {/* Horizontal Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = paddingTop + (1 - ratio) * chartHeight;
            return (
              <line 
                key={index}
                x1={paddingLeft} 
                y1={y} 
                x2={width - paddingRight} 
                y2={y} 
                stroke="rgba(255,255,255,0.03)" 
                strokeWidth="1"
              />
            );
          })}

          {/* Area under curve */}
          <path 
            d={getAreaD()} 
            fill={activeData.colorLight} 
            style={{ opacity: 0.3 }}
          />

          {/* Spline Line */}
          <path 
            d={getPathD()} 
            fill="none" 
            stroke={activeData.color} 
            strokeWidth="2" 
            strokeLinecap="round"
          />

          {/* Coordinate Circles */}
          {coords.map((coord, idx) => {
            const isHovered = hoverIndex === idx;
            return (
              <circle 
                key={idx}
                cx={coord.x} 
                cy={coord.y} 
                r={isHovered ? 5 : 3} 
                fill={activeData.color} 
                stroke="#0f111a"
                strokeWidth={isHovered ? 2 : 1}
                style={{ transition: 'all 0.15s ease' }}
              />
            );
          })}

          {/* X Axis Labels */}
          {activeData.labels.map((lbl, idx) => {
            const coord = coords[idx];
            return (
              <text 
                key={idx}
                x={coord.x} 
                y={height - 6} 
                fill="var(--text-dim)" 
                fontSize="8"
                textAnchor="middle"
              >
                {lbl}
              </text>
            );
          })}

          {/* Y Axis Max Label */}
          <text 
            x={paddingLeft - 6} 
            y={paddingTop + 8} 
            fill="var(--text-dim)" 
            fontSize="8" 
            textAnchor="end"
          >
            {Math.round(maxVal)}
          </text>
          
          {/* Y Axis Min Label */}
          <text 
            x={paddingLeft - 6} 
            y={paddingTop + chartHeight} 
            fill="var(--text-dim)" 
            fontSize="8" 
            textAnchor="end"
          >
            0
          </text>

          {/* Hover Vertical tracking guide line */}
          {hoverIndex !== null && (
            <line 
              x1={coords[hoverIndex].x}
              y1={paddingTop}
              x2={coords[hoverIndex].x}
              y2={chartHeight + paddingTop}
              stroke="rgba(255,255,255,0.15)"
              strokeDasharray="2,2"
              strokeWidth="1"
            />
          )}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoverIndex !== null && (
          <div 
            style={{
              position: 'absolute',
              top: `${(coords[hoverIndex].y / height) * 100}%`,
              left: `${(coords[hoverIndex].x / width) * 100}%`,
              transform: 'translate(-50%, -130%)',
              background: 'rgba(15, 17, 26, 0.95)',
              border: `1px solid ${activeData.color}`,
              borderRadius: '6px',
              padding: '6px 10px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
              pointerEvents: 'none',
              zIndex: 30,
              fontSize: '0.75rem',
              color: '#fff',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-sans)'
            }}
          >
            <span style={{ fontWeight: 600 }}>{activeData.points[hoverIndex]}</span> {activeData.unit}
            <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              At {activeData.labels[hoverIndex]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsChart;
