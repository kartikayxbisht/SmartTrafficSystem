import React, { useState } from 'react';
import { MapPin, Info, Zap } from 'lucide-react';
import ParkingCard from '../components/ParkingCard';
import BookingPanel from '../components/BookingPanel';

const Parking = ({ lotsData, bookings, onBookSlot, onStartCharging }) => {
  const [selectedLot, setSelectedLot] = useState('Lot A');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [evFilter, setEvFilter] = useState(false);

  // Calculate vacancy metrics and filter by EV status
  const activeSlots = lotsData[selectedLot].filter(slot => !evFilter || slot.isEV);
  const totalSlots = activeSlots.length;

  const handleSlotSelect = (slot) => {
    if (slot.status === 'available') {
      setSelectedSlot(slot.id === selectedSlot ? null : slot.id);
    }
  };

  return (
    <div className="content-wrapper animate-fade-in">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1 style={{ fontSize: '2.5rem', textAlign: 'left', margin: '0', background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Parking Logistics & Reservations
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', textAlign: 'left' }}>
          Reserve sensor-monitored smart bays and view real-time occupancy.
        </p>
      </div>

      {/* Lot Occupancy statistics */}
      <div className="stats-grid">
        {['Lot A', 'Lot B', 'Lot C'].map(lot => {
          const slots = lotsData[lot];
          const total = slots.length;
          const available = slots.filter(s => s.status === 'available').length;
          const occupied = slots.filter(s => s.status === 'occupied').length;
          const reserved = slots.filter(s => s.status === 'reserved').length;
          return (
            <ParkingCard 
              key={lot}
              lotName={lot}
              available={available}
              total={total}
              occupied={occupied}
              reserved={reserved}
              isActive={selectedLot === lot}
              onClick={() => {
                setSelectedLot(lot);
                setSelectedSlot(null);
              }}
            />
          );
        })}
      </div>

      {/* Parking slots visualizer grid and reservation widget */}
      <div className="parking-container">
        {/* Slot Selection Grid */}
        <div className="intersection-card glass-panel" style={{ flexGrow: 1 }}>
          <div className="lot-selector-header">
            <div className="lot-tabs">
              {['Lot A', 'Lot B', 'Lot C'].map(lot => (
                <button 
                  key={lot}
                  className={`lot-tab ${selectedLot === lot ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedLot(lot);
                    setSelectedSlot(null);
                  }}
                >
                  {lot}
                </button>
              ))}
            </div>

            {/* EV Filter Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <input 
                  type="checkbox" 
                  checked={evFilter}
                  onChange={(e) => setEvFilter(e.target.checked)}
                  style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={12} style={{ fill: 'currentColor', color: 'var(--primary)' }} /> EV Charging Bays Only
                </span>
              </label>
            </div>

            <div className="parking-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--success)' }}></div>
                <span>Available</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--danger)' }}></div>
                <span>Occupied</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', border: '1px solid var(--warning)' }}></div>
                <span>Reserved</span>
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="slot-grid">
            {activeSlots.map(slot => {
              const isSelected = selectedSlot === slot.id;
              const hasBooking = bookings[slot.id];
              
              // Handle special EV labels
              let statusText = slot.status;
              if (hasBooking) statusText = 'Reserved';
              if (slot.status === 'charging') statusText = `Charging: ${slot.chargeLevel || 0}%`;
              if (slot.status === 'charged') statusText = 'Charged: 100%';

              // Determine slot disabled state
              const isDisabled = slot.status === 'occupied' || slot.status === 'charging' || slot.status === 'charged';

              return (
                <button
                  key={slot.id}
                  disabled={isDisabled}
                  className={`parking-slot ${slot.status} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSlotSelect(slot)}
                >
                  {slot.isEV && (
                    <span className="ev-badge">
                      <Zap size={8} style={{ fill: 'currentColor' }} /> EV
                    </span>
                  )}
                  
                  <span className="slot-number">{slot.id}</span>
                  
                  {slot.isEV && (slot.status === 'charging' || slot.status === 'charged') && (
                    <div className="battery-container">
                      <div 
                        className={`battery-fill ${slot.status}`}
                        style={{ width: `${slot.chargeLevel || 0}%` }}
                      ></div>
                    </div>
                  )}

                  <span className="slot-status-text">
                    {statusText}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '10px', background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <Info size={16} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'left' }}>
              Green bays support interactive reservation. Selecting a bay populates the booking configuration widget. Occupied slots are detected by real-time sonar ground sensors.
            </p>
          </div>
        </div>

        {/* Column 2: Booking Panel & Active Bookings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          <BookingPanel 
            selectedSlot={selectedSlot}
          selectedLot={selectedLot}
          onSubmit={(bookingDetails) => {
            onBookSlot(selectedLot, bookingDetails);
            setSelectedSlot(null);
          }}
        />

          {/* Active booking listings */}
          {Object.keys(bookings).length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#fff', textAlign: 'left' }}>Active Reservations</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                {Object.entries(bookings).map(([slotId, info]) => {
                  const lotName = slotId.startsWith('A-') ? 'Lot A' : slotId.startsWith('B-') ? 'Lot B' : 'Lot C';
                  const slotObj = lotsData[lotName]?.find(s => s.id === slotId);
                  const isEvSlot = slotObj?.isEV;
                  const isReserved = slotObj?.status === 'reserved';

                  return (
                    <div 
                      key={slotId}
                      style={{ 
                        padding: '10px', 
                        background: 'rgba(245, 158, 11, 0.03)', 
                        border: '1px solid rgba(245, 158, 11, 0.1)', 
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.75rem'
                      }}
                    >
                      <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--warning)' }}>Bay {slotId}</span>
                          {isEvSlot && (
                            <span 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '2px', 
                                fontSize: '0.6rem', 
                                backgroundColor: 'rgba(6, 182, 212, 0.15)', 
                                color: '#22d3ee', 
                                padding: '1px 4px', 
                                borderRadius: '3px',
                                border: '1px solid rgba(6, 182, 212, 0.3)' 
                              }}
                            >
                              <Zap size={8} style={{ fill: 'currentColor' }} /> EV
                            </span>
                          )}
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Plate: {info.plate} | {info.vehicleType}</p>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isEvSlot && isReserved && (
                          <button
                            onClick={() => onStartCharging(lotName, slotId)}
                            style={{
                              backgroundColor: 'rgba(6, 182, 212, 0.1)',
                              border: '1px solid rgba(6, 182, 212, 0.4)',
                              color: '#22d3ee',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Zap size={10} style={{ fill: 'currentColor' }} /> Start Charger
                          </button>
                        )}
                        <div style={{ textAlign: 'right', color: 'var(--text-dim)' }}>
                          <span>{info.duration}h duration</span>
                          <p style={{ fontSize: '0.65rem' }}>Booked at {info.time}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Parking;
