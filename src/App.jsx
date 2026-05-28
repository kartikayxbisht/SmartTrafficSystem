import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertOctagon,
  X
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Parking from './pages/Parking';
import Admin from './pages/Admin';
import Footer from './components/Footer';
import Auth from './pages/Auth';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const token = 'mock-token'; // Fallback token since auth was removed

  // Custom Cursor Eyecatcher Refs and States
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  const [cursorHovered, setCursorHovered] = useState(false);
  const [cursorClicked, setCursorClicked] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    };

    const handleMouseDown = () => setCursorClicked(true);
    const handleMouseUp = () => setCursorClicked(false);
    
    const handleMouseLeave = () => {
      if (cursorDotRef.current) cursorDotRef.current.style.opacity = '0';
      if (cursorRingRef.current) cursorRingRef.current.style.opacity = '0';
    };
    const handleMouseEnter = () => {
      if (cursorDotRef.current) cursorDotRef.current.style.opacity = '1';
      if (cursorRingRef.current) cursorRingRef.current.style.opacity = '1';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      const isInput = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT' || 
        target.closest('input') || 
        target.closest('textarea') ||
        target.closest('select');
      
      if (isInput) {
        if (cursorDotRef.current) cursorDotRef.current.style.opacity = '0';
        if (cursorRingRef.current) cursorRingRef.current.style.opacity = '0';
      } else {
        if (cursorDotRef.current) cursorDotRef.current.style.opacity = '1';
        if (cursorRingRef.current) cursorRingRef.current.style.opacity = '1';
      }
      
      let isInteractive = false;
      try {
        const computedStyle = window.getComputedStyle(target);
        if (computedStyle && computedStyle.cursor === 'pointer') {
          isInteractive = true;
        }
      } catch (err) {}

      if (!isInteractive) {
        isInteractive = 
          target.tagName === 'BUTTON' || 
          target.tagName === 'A' || 
          target.closest('a') ||
          target.closest('button') ||
          target.closest('.nav-item') ||
          target.closest('.stat-card') ||
          target.closest('.parking-slot') ||
          target.closest('.action-btn') ||
          target.closest('.toast-close') ||
          target.closest('.dismiss-btn');
      }

      setCursorHovered(!!isInteractive);
    };

    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  // Connection State
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);

  // Floating Toast Notifications state
  const [notifications, setNotifications] = useState([]);

  // Lifted Traffic simulation states
  const [phase, setPhase] = useState('NS-GREEN');
  const [timeLeft, setTimeLeft] = useState(15);
  const [isOverride, setIsOverride] = useState(false);
  const [overrideTarget, setOverrideTarget] = useState(null); // 'NS' or 'EW'
  const [carsNS, setCarsNS] = useState(6);
  const [carsEW, setCarsEW] = useState(8);
  const [throughput, setThroughput] = useState(1420);
  const timerRef = useRef(null);

  // Initial slot layout with EV-enabled ports
  const initialSlots = {
    'Lot A': [
      { id: 'A-01', status: 'occupied' },
      { id: 'A-02', status: 'charging', isEV: true, chargeLevel: 72 },
      { id: 'A-03', status: 'occupied' },
      { id: 'A-04', status: 'available', isEV: true },
      { id: 'A-05', status: 'occupied' },
      { id: 'A-06', status: 'occupied' },
      { id: 'A-07', status: 'available' },
      { id: 'A-08', status: 'available', isEV: true },
      { id: 'A-09', status: 'reserved' },
      { id: 'A-10', status: 'available' },
      { id: 'A-11', status: 'charging', isEV: true, chargeLevel: 34 },
      { id: 'A-12', status: 'available' },
      { id: 'A-13', status: 'available' },
      { id: 'A-14', status: 'occupied' },
      { id: 'A-15', status: 'available' },
      { id: 'A-16', status: 'available' },
    ],
    'Lot B': [
      { id: 'B-01', status: 'available', isEV: true },
      { id: 'B-02', status: 'occupied' },
      { id: 'B-03', status: 'available' },
      { id: 'B-04', status: 'occupied' },
      { id: 'B-05', status: 'available', isEV: true },
      { id: 'B-06', status: 'available' },
      { id: 'B-07', status: 'occupied' },
      { id: 'B-08', status: 'reserved' },
      { id: 'B-09', status: 'occupied' },
      { id: 'B-10', status: 'charging', isEV: true, chargeLevel: 89 },
      { id: 'B-11', status: 'available' },
      { id: 'B-12', status: 'available' },
    ],
    'Lot C': [
      { id: 'C-01', status: 'occupied' },
      { id: 'C-02', status: 'occupied' },
      { id: 'C-03', status: 'occupied' },
      { id: 'C-04', status: 'reserved' },
      { id: 'C-05', status: 'available', isEV: true },
      { id: 'C-06', status: 'occupied' },
      { id: 'C-07', status: 'available', isEV: true },
      { id: 'C-08', status: 'occupied' },
    ]
  };

  const [lotsData, setLotsData] = useState(initialSlots);
  const [bookings, setBookings] = useState({}); // Stores confirmation text per slot

  // Lifted Alerts state
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', text: 'Heavy congestion detected on Main St (Westbound). AI routing adjustment active.', time: 'Just now' },
    { id: 2, type: 'info', text: 'Signal Intersection B switched to automatic AI optimization mode.', time: '5 mins ago' },
    { id: 3, type: 'success', text: 'Smart Parking Lot C sensor diagnostics complete. 100% operational.', time: '12 mins ago' },
    { id: 4, type: 'danger', text: 'Emergency override triggered for signal B: Fire department vehicle priority.', time: '25 mins ago' }
  ]);

  // Timers to prevent congestion notifications spamming in offline mode
  const lastOfflineCongestionTime = useRef(0);

  // Add notification to Toast stack
  const addNotification = (notif) => {
    const id = notif.id || Date.now();
    setNotifications((prev) => [
      ...prev,
      { id, type: notif.type, title: notif.title, desc: notif.desc }
    ]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  // Remove notification from Toast stack
  const removeNotification = (id) => {
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, dismissing: true } : n));
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 300);
  };

  // Establish Socket.io connection
  useEffect(() => {
    if (!token) {
      setSocketConnected(false);
      return;
    }

    const socket = io('http://localhost:5000', {
      auth: { token },
      reconnectionAttempts: 3,
      timeout: 5000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to traffic telemetry server.');
      setSocketConnected(true);
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Telemetry Synced',
        desc: 'Connected to live municipal Socket.io server. Synchronizing grid telemetry.'
      });
    });

    socket.on('initialState', (state) => {
      setPhase(state.phase);
      setTimeLeft(state.timeLeft);
      setIsOverride(state.isOverride);
      setOverrideTarget(state.overrideTarget);
      setCarsNS(state.carsNS);
      setCarsEW(state.carsEW);
      setThroughput(state.throughput);
      setLotsData(state.lotsData);
      setBookings(state.bookings);
      setAlerts(state.alerts);
    });

    socket.on('trafficUpdate', (data) => {
      setPhase(data.phase);
      setTimeLeft(data.timeLeft);
      setIsOverride(data.isOverride);
      setOverrideTarget(data.overrideTarget);
      setCarsNS(data.carsNS);
      setCarsEW(data.carsEW);
      setThroughput(data.throughput);
    });

    socket.on('parkingUpdate', (data) => {
      setLotsData(data.lotsData);
      setBookings(data.bookings);
    });

    socket.on('alertsUpdate', (data) => {
      setAlerts(data);
    });

    socket.on('smartNotification', (notif) => {
      addNotification(notif);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server.');
      setSocketConnected(false);
      addNotification({
        id: Date.now(),
        type: 'danger',
        title: 'Telemetry Offline',
        desc: 'Disconnected from telemetry server. Switching to local grid simulator.'
      });
    });

    socket.on('connect_error', () => {
      console.log('Telemetry server offline. Running in local fallback mode.');
      setSocketConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Local countdown timer logic (OFFLINE FALLBACK)
  useEffect(() => {
    if (socketConnected) return;

    if (isOverride) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Transition phases
          setPhase((currentPhase) => {
            switch (currentPhase) {
              case 'NS-GREEN':
                setTimeLeft(3);
                return 'NS-YELLOW';
              case 'NS-YELLOW':
                setTimeLeft(15);
                return 'EW-GREEN';
              case 'EW-GREEN':
                setTimeLeft(3);
                return 'EW-YELLOW';
              case 'EW-YELLOW':
                setTimeLeft(15);
                return 'NS-GREEN';
              default:
                setTimeLeft(15);
                return 'NS-GREEN';
            }
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, isOverride, socketConnected]);

  // Local traffic simulation (OFFLINE FALLBACK)
  useEffect(() => {
    if (socketConnected) return;

    const trafficInterval = setInterval(() => {
      // 1. Cars arriving randomly
      let updatedCarsNS = carsNS;
      let updatedCarsEW = carsEW;
      if (Math.random() > 0.4) {
        updatedCarsNS = Math.min(carsNS + Math.floor(Math.random() * 2) + 1, 25);
        setCarsNS(updatedCarsNS);
      }
      if (Math.random() > 0.4) {
        updatedCarsEW = Math.min(carsEW + Math.floor(Math.random() * 2) + 1, 25);
        setCarsEW(updatedCarsEW);
      }

      // 2. Cars departing based on green phase
      if (phase === 'NS-GREEN') {
        setCarsNS(prev => {
          const removed = Math.min(prev, Math.floor(Math.random() * 3) + 2);
          if (removed > 0) setThroughput(t => t + removed);
          return Math.max(prev - removed, 0);
        });
      } else if (phase === 'EW-GREEN') {
        setCarsEW(prev => {
          const removed = Math.min(prev, Math.floor(Math.random() * 3) + 2);
          if (removed > 0) setThroughput(t => t + removed);
          return Math.max(prev - removed, 0);
        });
      }

      // Offline Smart Notification: Congestion alert
      if ((updatedCarsNS > 12 || updatedCarsEW > 12) && (Date.now() - lastOfflineCongestionTime.current > 20000)) {
        const target = updatedCarsNS > 12 ? 'Intersection A (North-South)' : 'Intersection B (East-West)';
        lastOfflineCongestionTime.current = Date.now();
        addNotification({
          id: Date.now(),
          type: 'warning',
          title: 'AI Queue Optimization (Offline)',
          desc: `Backlog detected at ${target}. Adjusting signal cycles.`
        });
      }
    }, 2000);

    return () => clearInterval(trafficInterval);
  }, [phase, carsNS, carsEW, socketConnected]);

  // Local EV Battery charging progression simulator (OFFLINE FALLBACK)
  useEffect(() => {
    if (socketConnected) return;

    const chargeInterval = setInterval(() => {
      let updated = false;
      let finishedLot = null;
      let finishedSlotId = null;

      setLotsData(prev => {
        const nextState = {};
        Object.entries(prev).forEach(([lotName, slots]) => {
          nextState[lotName] = slots.map(slot => {
            if (slot.isEV && slot.status === 'charging') {
              const step = Math.floor(Math.random() * 4) + 4;
              const newLevel = Math.min((slot.chargeLevel || 0) + step, 100);
              updated = true;

              if (newLevel >= 100) {
                finishedLot = lotName;
                finishedSlotId = slot.id;
                return { ...slot, status: 'charged', chargeLevel: 100 };
              }
              return { ...slot, chargeLevel: newLevel };
            }
            return slot;
          });
        });
        return updated ? nextState : prev;
      });

      if (finishedSlotId) {
        // Create alert
        const completedAlert = {
          id: Date.now(),
          type: 'success',
          text: `EV Charging completed in ${finishedLot} Bay ${finishedSlotId} (Offline).`,
          time: 'Just now'
        };
        setAlerts(prev => [completedAlert, ...prev.slice(0, 19)]);

        // Display toast
        addNotification({
          id: Date.now() + 1,
          type: 'success',
          title: 'EV Charging Complete (Offline)',
          desc: `Vehicle in ${finishedLot} Bay ${finishedSlotId} fully charged. Connection detaching.`
        });
      }
    }, 3000);

    return () => clearInterval(chargeInterval);
  }, [socketConnected]);

  // Trigger override
  const triggerOverride = (direction) => {
    if (socketConnected && socketRef.current) {
      socketRef.current.emit('overrideSignal', direction);
    } else {
      // Fallback
      setIsOverride(true);
      setOverrideTarget(direction);
      setPhase(direction === 'NS' ? 'NS-GREEN' : 'EW-GREEN');
      setTimeLeft(0);

      const newAlert = {
        id: Date.now(),
        type: 'danger',
        text: `Emergency manual override triggered for Signal ${direction === 'NS' ? 'A (North-South)' : 'B (East-West)'} (Offline).`,
        time: 'Just now'
      };
      setAlerts(prev => [newAlert, ...prev.slice(0, 19)]);

      addNotification({
        id: Date.now() + 1,
        type: 'danger',
        title: 'Emergency Signal Override',
        desc: `Signal corridor overridden for ${direction === 'NS' ? 'North-South' : 'East-West'} route priority (Offline).`
      });
    }
  };

  // Reset override
  const releaseOverride = () => {
    if (socketConnected && socketRef.current) {
      socketRef.current.emit('releaseOverride');
    } else {
      // Fallback
      setIsOverride(false);
      setOverrideTarget(null);
      setTimeLeft(15);
      setPhase('NS-GREEN');

      const newAlert = {
        id: Date.now(),
        type: 'info',
        text: `Signal override released. Resumed local simulation AI control.`,
        time: 'Just now'
      };
      setAlerts(prev => [newAlert, ...prev.slice(0, 19)]);

      addNotification({
        id: Date.now() + 1,
        type: 'info',
        title: 'AI Scheduler Resumed',
        desc: 'Local signal override cleared. Traffic flow returned to adaptive model control (Offline).'
      });
    }
  };

  // Handle parking reservation
  const handleBookSlot = (lotName, bookingDetails) => {
    if (socketConnected && socketRef.current) {
      socketRef.current.emit('bookSlot', {
        lotName,
        slotId: bookingDetails.slotId,
        plate: bookingDetails.plate,
        duration: bookingDetails.duration,
        vehicleType: bookingDetails.vehicleType
      });
    } else {
      // Fallback local updates
      setLotsData(prev => {
        const updatedLot = prev[lotName].map(slot => {
          if (slot.id === bookingDetails.slotId) {
            return { ...slot, status: 'reserved', chargeLevel: slot.isEV ? 0 : undefined };
          }
          return slot;
        });
        return {
          ...prev,
          [lotName]: updatedLot
        };
      });

      setBookings(prev => ({
        ...prev,
        [bookingDetails.slotId]: {
          plate: bookingDetails.plate,
          duration: bookingDetails.duration,
          vehicleType: bookingDetails.vehicleType,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      }));

      const newAlert = {
        id: Date.now(),
        type: 'success',
        text: `Smart Bay ${bookingDetails.slotId} reserved in ${lotName} for plate ${bookingDetails.plate} (Offline).`,
        time: 'Just now'
      };
      setAlerts(prev => [newAlert, ...prev.slice(0, 19)]);

      addNotification({
        id: Date.now() + 1,
        type: 'success',
        title: 'Smart Bay Booked',
        desc: `Bay ${bookingDetails.slotId} in ${lotName} reserved successfully.`
      });

      // Local Routing recommendation trigger
      const lotSlots = lotsData[lotName];
      const vacantCount = lotSlots.filter(s => s.status === 'available').length;
      const capacity = lotSlots.length;
      const occupancyPercentage = ((capacity - vacantCount) / capacity) * 100;

      if (occupancyPercentage > 85) {
        let bestAltLot = null;
        let maxVacancy = 0;
        Object.entries(lotsData).forEach(([altLotName, altSlots]) => {
          if (altLotName !== lotName) {
            const avail = altSlots.filter(s => s.status === 'available').length;
            if (avail > maxVacancy) {
              maxVacancy = avail;
              bestAltLot = altLotName;
            }
          }
        });

        if (bestAltLot && maxVacancy > 2) {
          addNotification({
            id: Date.now() + 2,
            type: 'warning',
            title: 'AI Smart Routing Recommendation',
            desc: `${lotName} is at ${Math.round(occupancyPercentage)}% capacity. Recommend routing vehicles to ${bestAltLot} (${maxVacancy} vacancies).`
          });
        }
      }
    }
  };

  // Start EV charging
  const handleStartCharging = (lotName, slotId) => {
    if (socketConnected && socketRef.current) {
      socketRef.current.emit('startCharging', { lotName, slotId });
    } else {
      // Fallback local updates
      setLotsData(prev => {
        const updatedLot = prev[lotName].map(slot => {
          if (slot.id === slotId && slot.isEV) {
            return { ...slot, status: 'charging', chargeLevel: 0 };
          }
          return slot;
        });
        return {
          ...prev,
          [lotName]: updatedLot
        };
      });

      const newAlert = {
        id: Date.now(),
        type: 'info',
        text: `EV charging sequence started for ${lotName} Bay ${slotId} (Offline mode).`,
        time: 'Just now'
      };
      setAlerts(prev => [newAlert, ...prev.slice(0, 19)]);

      addNotification({
        id: Date.now() + 1,
        type: 'info',
        title: 'EV Charging Started',
        desc: `Charging initiated for ${lotName} Bay ${slotId} (Offline mode).`
      });
    }
  };

  // Handle alert dismissal
  const handleDismissAlert = (id) => {
    if (socketConnected && socketRef.current) {
      socketRef.current.emit('dismissAlert', id);
    } else {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }
  };

  // Helper to determine light state for a specific signal
  const getLightState = (signal) => {
    if (signal === 'NS') {
      if (phase === 'NS-GREEN') return 'green';
      if (phase === 'NS-YELLOW') return 'yellow';
      return 'red';
    } else { // EW
      if (phase === 'EW-GREEN') return 'green';
      if (phase === 'EW-YELLOW') return 'yellow';
      return 'red';
    }
  };

  const nsLightState = getLightState('NS');
  const ewLightState = getLightState('EW');

  // Compute parking vacancy map
  const parkingSlotsVacancies = {
    'Lot A': lotsData['Lot A'].filter(s => s.status === 'available').length,
    'Lot B': lotsData['Lot B'].filter(s => s.status === 'available').length,
    'Lot C': lotsData['Lot C'].filter(s => s.status === 'available').length,
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Home
            setActiveTab={setActiveTab}
            nsLightState={nsLightState}
            ewLightState={ewLightState}
            carsNS={carsNS}
            carsEW={carsEW}
            parkingSlots={parkingSlotsVacancies}
            alerts={alerts}
            onDismissAlert={handleDismissAlert}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            phase={phase}
            timeLeft={timeLeft}
            isOverride={isOverride}
            overrideTarget={overrideTarget}
            carsNS={carsNS}
            carsEW={carsEW}
            throughput={throughput}
            nsLightState={nsLightState}
            ewLightState={ewLightState}
            triggerOverride={triggerOverride}
            releaseOverride={releaseOverride}
          />
        );
      case 'parking':
        return (
          <Parking
            lotsData={lotsData}
            bookings={bookings}
            onBookSlot={handleBookSlot}
            onStartCharging={handleStartCharging}
          />
        );
      case 'admin':
        return <Admin />;
      default:
        return (
          <Home
            setActiveTab={setActiveTab}
            nsLightState={nsLightState}
            ewLightState={ewLightState}
            carsNS={carsNS}
            carsEW={carsEW}
            parkingSlots={parkingSlotsVacancies}
            alerts={alerts}
            onDismissAlert={handleDismissAlert}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* High-Performance Custom Cursor Eyecatcher */}
      <div ref={cursorDotRef} className={`custom-cursor-dot ${cursorHovered ? 'hovered' : ''} ${cursorClicked ? 'clicked' : ''}`}></div>
      <div ref={cursorRingRef} className={`custom-cursor-ring ${cursorHovered ? 'hovered' : ''} ${cursorClicked ? 'clicked' : ''}`}></div>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Navbar activeTab={activeTab} socketConnected={socketConnected} />
        {renderContent()}
        <Footer />
      </div>

      {/* Floating Smart Toast Notifications Container */}
      <div className="toast-container">
        {notifications.map((notif) => {
          let IconComp = Info;
          if (notif.type === 'success') IconComp = CheckCircle2;
          if (notif.type === 'warning') IconComp = AlertTriangle;
          if (notif.type === 'danger') IconComp = AlertOctagon;

          const themeColor =
            notif.type === 'success' ? 'var(--success)' :
              notif.type === 'warning' ? 'var(--warning)' :
                notif.type === 'danger' ? 'var(--danger)' : 'var(--primary)';

          return (
            <div
              key={notif.id}
              className={`toast-notification ${notif.type || 'info'} ${notif.dismissing ? 'fade-out' : ''}`}
            >
              <div className="toast-icon" style={{ color: themeColor }}>
                <IconComp size={18} />
              </div>
              <div className="toast-body">
                <span className="toast-title">{notif.title}</span>
                <span className="toast-desc">{notif.desc}</span>
              </div>
              <button
                className="toast-close"
                onClick={() => removeNotification(notif.id)}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
