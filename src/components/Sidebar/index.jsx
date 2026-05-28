import React from 'react';
import {
  Home,
  Cpu,
  MapPin,
  Settings,
  Zap,
  LogOut,
} from 'lucide-react';

const ALL_MENU_ITEMS = [
  { id: 'home',      label: 'Overview',       icon: Home,     roles: ['user'] },
  { id: 'dashboard', label: 'Signal Controls', icon: Cpu,      roles: ['admin'] },
  { id: 'parking',   label: 'Smart Parking',   icon: MapPin,   roles: ['user'] },
  { id: 'admin',     label: 'Configuration',   icon: Settings, roles: ['user'] },
];

const Sidebar = ({ activeTab, setActiveTab, role, loggedInUser, onLogout }) => {
  const menuItems = ALL_MENU_ITEMS.filter(item => item.roles.includes(role));

  const initials = loggedInUser?.name
    ? loggedInUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

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

      {/* Logged-in user info */}
      {loggedInUser && (
        <div className="sidebar-user-info">
          <div className={`sidebar-user-avatar sidebar-user-avatar--${role}`}>
            {initials}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div className="sidebar-user-name">{loggedInUser.name}</div>
            <div className="sidebar-user-role">{role === 'admin' ? '🛡️ Admin' : '👤 User'}</div>
          </div>
        </div>
      )}

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

      {/* Logout */}
      {onLogout && (
        <button className="sidebar-logout-btn" onClick={onLogout}>
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      )}

      <div className="sidebar-footer">
        <p>IntelliPark AI</p>
        <p style={{ marginTop: '4px', opacity: 0.5 }}>v3.1.2 • AI Orchestrated</p>
      </div>
    </div>
  );
};

export default Sidebar;
