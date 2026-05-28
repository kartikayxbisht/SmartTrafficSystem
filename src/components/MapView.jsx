import React, { useState } from 'react';
import { Info, Eye, Map as MapIcon, Layers } from 'lucide-react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, TrafficLayer } from '@react-google-maps/api';

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const containerStyle = {
  width: '100%',
  height: '320px',
  borderRadius: '12px',
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

// Midnight custom map styling to fit the glassmorphism dark theme
const mapOptions = {
  styles: [
    { elementType: "geometry", stylers: [{ color: "#0b0c14" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0b0c14" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#495a80" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#a5b4fc" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#818cf8" }],
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#111422" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#091c1e" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#0f766e" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#141824" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1e2433" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#64748b" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#1e1b4b" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#312e81" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#c7d2fe" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#1e1b4b" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#818cf8" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#080c14" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#38bdf8" }],
    },
  ],
  disableDefaultUI: true,
  zoomControl: true,
  fullscreenControl: false,
};

const MapView = ({ 
  nsLightState = 'green', 
  ewLightState = 'red', 
  carsNS = 4, 
  carsEW = 6, 
  parkingSlots = { 'Lot A': 8, 'Lot B': 5, 'Lot C': 2 } 
}) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showTraffic, setShowTraffic] = useState(true);
  const [mapType, setMapType] = useState('roadmap');

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  // Dynamic Markers configuration reflecting active simulation telemetry states
  const markers = [
    {
      id: 'junction-a',
      type: 'junction',
      name: 'Intersection A (North-South)',
      position: { lat: 37.7785, lng: -122.4156 },
      color: nsLightState === 'green' ? '#10b981' : nsLightState === 'yellow' ? '#f59e0b' : '#ef4444',
      details: `Signal: ${nsLightState.toUpperCase()} | Queue: ${carsNS} cars`,
      icon: {
        path: "M 0,0 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0", // Circle shape
        fillColor: nsLightState === 'green' ? '#10b981' : nsLightState === 'yellow' ? '#f59e0b' : '#ef4444',
        fillOpacity: 0.9,
        scale: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      }
    },
    {
      id: 'junction-b',
      type: 'junction',
      name: 'Intersection B (East-West)',
      position: { lat: 37.7764, lng: -122.4194 },
      color: ewLightState === 'green' ? '#10b981' : ewLightState === 'yellow' ? '#f59e0b' : '#ef4444',
      details: `Signal: ${ewLightState.toUpperCase()} | Queue: ${carsEW} cars`,
      icon: {
        path: "M 0,0 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0",
        fillColor: ewLightState === 'green' ? '#10b981' : ewLightState === 'yellow' ? '#f59e0b' : '#ef4444',
        fillOpacity: 0.9,
        scale: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      }
    },
    {
      id: 'lot-a',
      type: 'parking',
      name: 'Smart Parking Lot A',
      position: { lat: 37.7795, lng: -122.4180 },
      color: '#6366f1',
      details: `${parkingSlots['Lot A'] !== undefined ? parkingSlots['Lot A'] : 8} vacant slots out of 16 bays (Contains 4 Smart EV chargers)`,
      icon: {
        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm-1 3h2v2h-2V5zm0 4h2v4h-2V9z",
        fillColor: '#6366f1',
        fillOpacity: 1.0,
        scale: 1.4,
        strokeColor: '#ffffff',
        strokeWeight: 1.5,
        anchor: isLoaded && window.google ? new window.google.maps.Point(12, 22) : undefined
      }
    },
    {
      id: 'lot-b',
      type: 'parking',
      name: 'Smart Parking Lot B',
      position: { lat: 37.7750, lng: -122.4160 },
      color: '#6366f1',
      details: `${parkingSlots['Lot B'] !== undefined ? parkingSlots['Lot B'] : 5} vacant slots out of 12 bays (Contains 3 Smart EV chargers)`,
      icon: {
        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm-1 3h2v2h-2V5zm0 4h2v4h-2V9z",
        fillColor: '#6366f1',
        fillOpacity: 1.0,
        scale: 1.4,
        strokeColor: '#ffffff',
        strokeWeight: 1.5,
        anchor: isLoaded && window.google ? new window.google.maps.Point(12, 22) : undefined
      }
    },
    {
      id: 'lot-c',
      type: 'parking',
      name: 'Smart Parking Lot C',
      position: { lat: 37.7775, lng: -122.4210 },
      color: '#6366f1',
      details: `${parkingSlots['Lot C'] !== undefined ? parkingSlots['Lot C'] : 2} vacant slots out of 8 bays (Contains 2 Smart EV chargers)`,
      icon: {
        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm-1 3h2v2h-2V5zm0 4h2v4h-2V9z",
        fillColor: '#6366f1',
        fillOpacity: 1.0,
        scale: 1.4,
        strokeColor: '#ffffff',
        strokeWeight: 1.5,
        anchor: isLoaded && window.google ? new window.google.maps.Point(12, 22) : undefined
      }
    },
    {
      id: 'incident-1',
      type: 'incident',
      name: 'Heavy Congestion Incident',
      position: { lat: 37.7770, lng: -122.4175 },
      color: '#ef4444',
      details: 'Congestion spike. AI Adaptive signal controls adjusting timings.',
      icon: {
        path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
        fillColor: '#ef4444',
        fillOpacity: 1.0,
        scale: 1.2,
        strokeColor: '#ffffff',
        strokeWeight: 1.5,
        anchor: isLoaded && window.google ? new window.google.maps.Point(12, 12) : undefined
      }
    },
    {
      id: 'checkpoint-1',
      type: 'checkpoint',
      name: 'Municipal Security Checkpoint',
      position: { lat: 37.7755, lng: -122.4200 },
      color: '#06b6d4',
      details: 'Routine telemetry checkpoint active. All parameters normal.',
      icon: {
        path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
        fillColor: '#06b6d4',
        fillOpacity: 1.0,
        scale: 1.2,
        strokeColor: '#ffffff',
        strokeWeight: 1.5,
        anchor: isLoaded && window.google ? new window.google.maps.Point(12, 12) : undefined
      }
    }
  ];

  const activeMarker = selectedMarker ? markers.find(m => m.id === selectedMarker) : null;

  return (
    <div className="intersection-card glass-panel" style={{ flexGrow: 1, position: 'relative' }}>
      <div className="card-header-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2>City Grid Live Telemetry Map</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <Eye size={12} /> Real-time Geospatial System
          </span>
        </div>

        {/* Map Control Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
          <button 
            onClick={() => setMapType(prev => prev === 'roadmap' ? 'hybrid' : 'roadmap')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '6px 10px', 
              fontSize: '0.75rem', 
              borderRadius: '6px', 
              backgroundColor: 'rgba(255,255,255,0.03)', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-muted)'
            }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
          >
            <MapIcon size={12} /> {mapType === 'roadmap' ? 'Satellite' : 'Roadmap'}
          </button>

          <button 
            onClick={() => setShowTraffic(prev => !prev)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '6px 10px', 
              fontSize: '0.75rem', 
              borderRadius: '6px', 
              backgroundColor: showTraffic ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.03)', 
              border: showTraffic ? '1px solid var(--primary)' : '1px solid var(--border-color)', 
              color: showTraffic ? 'var(--primary)' : 'var(--text-muted)' 
            }}
            onMouseEnter={e => { if (!showTraffic) e.target.style.color = '#fff'; }}
            onMouseLeave={e => { if (!showTraffic) e.target.style.color = 'var(--text-muted)'; }}
          >
            <Layers size={12} /> Traffic
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', marginTop: '10px', minHeight: '320px', borderRadius: '12px', overflow: 'hidden' }}>
        {loadError && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '320px', backgroundColor: '#0a0c14', textAlign: 'center', padding: '20px' }}>
            <div>
              <p style={{ color: 'var(--danger)', fontWeight: 600 }}>Google Map Load Error</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Could not load the interactive map API. Please verify configuration.</p>
            </div>
          </div>
        )}

        {!isLoaded && !loadError && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '320px', backgroundColor: '#0a0c14', textAlign: 'center', padding: '20px' }}>
            <div>
              <div className="pulsing" style={{ color: 'var(--primary)', marginBottom: '10px', fontSize: '1.1rem', fontWeight: 600 }}>Loading Geospatial Grid...</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Connecting to Google Maps services...</p>
            </div>
          </div>
        )}

        {isLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={16}
            options={{
              ...mapOptions,
              mapTypeId: mapType
            }}
          >
            {showTraffic && <TrafficLayer />}

            {markers.map(marker => (
              <MarkerF
                key={marker.id}
                position={marker.position}
                icon={marker.icon}
                title={marker.name}
                onClick={() => setSelectedMarker(marker.id)}
              />
            ))}

            {activeMarker && (
              <InfoWindowF
                position={activeMarker.position}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div style={{ 
                  color: '#ffffff', 
                  background: '#0b0c14', 
                  padding: '8px 12px', 
                  borderRadius: '8px', 
                  border: `1.5px solid ${activeMarker.color}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  minWidth: '180px',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      backgroundColor: activeMarker.color 
                    }}></span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>
                      {activeMarker.name}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                    {activeMarker.details}
                  </p>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        )}
      </div>

      {!activeMarker && (
        <div 
          style={{
            position: 'absolute',
            bottom: '36px',
            left: '36px',
            background: 'rgba(15, 17, 26, 0.85)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '0.7rem',
            color: 'var(--text-dim)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 10,
            pointerEvents: 'none'
          }}
        >
          <Info size={12} />
          Click pins on the map to view dynamic telemetry parameters.
        </div>
      )}
    </div>
  );
};

export default MapView;
