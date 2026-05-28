import React, { useState, useEffect } from 'react';
import { MapPin, Car, CreditCard } from 'lucide-react';

const BookingPanel = ({ selectedSlot, selectedLot, onSubmit }) => {
  const [plate, setPlate] = useState('');
  const [duration, setDuration] = useState('2');
  const [vehicleType, setVehicleType] = useState('Sedan');

  // Reset plate when selected slot changes
  useEffect(() => {
    setPlate('');
  }, [selectedSlot]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!plate.trim()) return;
    
    onSubmit({
      slotId: selectedSlot,
      lotName: selectedLot,
      plate: plate.toUpperCase(),
      duration,
      vehicleType
    });
  };

  return (
    <div className="booking-card glass-panel" style={{ width: '100%' }}>
      <h2>Bay Booking Configurator</h2>
      
      {selectedSlot ? (
        <form onSubmit={handleSubmit} className="booking-form">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            padding: '12px', 
            background: 'var(--primary-glow)', 
            borderRadius: '8px', 
            border: '1px solid var(--primary)' 
          }}>
            <MapPin size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Selected Slot: {selectedSlot} ({selectedLot})</span>
          </div>

          <div className="form-group">
            <label htmlFor="plate-input">Vehicle License Plate</label>
            <div style={{ position: 'relative' }}>
              <input 
                id="plate-input"
                type="text" 
                placeholder="e.g. DL 3C AY 4567" 
                className="form-input"
                style={{ width: '100%', paddingLeft: '36px' }}
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                required
              />
              <Car size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-dim)' }} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="type-select">Vehicle Type</label>
            <div style={{ position: 'relative' }}>
              <select 
                id="type-select"
                className="form-input" 
                style={{ 
                  width: '100%', 
                  appearance: 'none', 
                  background: 'rgba(0,0,0,0.2) url("data:image/svg+xml;utf8,<svg fill=\'%239ca3af\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>") no-repeat right 12px center' 
                }}
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
              >
                <option value="Sedan">Sedan (Standard)</option>
                <option value="SUV">SUV (Large Bay)</option>
                <option value="EV">EV (Charging Point)</option>
                <option value="Two-Wheeler">Motorcycle</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="duration-select">Reservation Duration</label>
            <div style={{ position: 'relative' }}>
              <select 
                id="duration-select"
                className="form-input"
                style={{ 
                  width: '100%', 
                  appearance: 'none', 
                  background: 'rgba(0,0,0,0.2) url("data:image/svg+xml;utf8,<svg fill=\'%239ca3af\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>") no-repeat right 12px center' 
                }}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="1">1 Hour ($2.00)</option>
                <option value="2">2 Hours ($4.00)</option>
                <option value="4">4 Hours ($7.00)</option>
                <option value="8">8 Hours ($12.00)</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="primary-btn" 
            style={{ width: '100%', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            disabled={!plate.trim()}
          >
            <CreditCard size={18} />
            <span>Confirm & Reserve Slot</span>
          </button>
        </form>
      ) : (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '60px 20px', 
          border: '1px dashed var(--border-color)', 
          borderRadius: '12px',
          color: 'var(--text-dim)',
          gap: '12px'
        }}>
          <MapPin size={32} style={{ opacity: 0.5 }} />
          <p style={{ fontSize: '0.85rem', textAlign: 'center' }}>
            Select an available bay from the grid to initiate reservation.
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingPanel;
