import React from 'react';
import {
  Home,
  Cpu,
  MapPin,
  Settings,
  Zap,
  LogOut,
  User
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => {
  const menuItems = [
    { id: 'home', label: 'Overview', icon: Home },
    { id: 'dashboard', label: 'Signal Controls', icon: Cpu },
    { id: 'parking', label: 'Smart Parking', icon: MapPin },
    { id: 'admin', label: 'Configuration', icon: Settings },
  ];

  return (
    <div className="sidebar">
      <div className="brand-section">
        <div className="brand-logo-wrapper">
          <Zap className="brand-logo" />
        </div>
        <span className="brand-name">
          <span className="brand-intelli">Intelli</span><span className="brand-park">Park</span><span className="brand-ai"> AI</span>
        </span>
      </div>

      <nav style={{ flex: 1 }}>
        <ul className="nav-links">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {user && (
        <div style={{
          padding: '16px 12px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0
            }}>
              <User size={16} />
            </div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', margin: 0 }}>{user.name}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '6px',
              color: '#fca5a5',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      <div className="sidebar-footer">
        <p>IntelliPark AI</p>
        <p style={{ marginTop: '4px', opacity: 0.5 }}>v3.1.2 • AI Orchestrated</p>
      </div>
    </div>
  );
};

export default Sidebar;
