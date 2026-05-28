import React from 'react';
import { Cpu, RefreshCw } from 'lucide-react';

const Footer = () => {
  return (
    <footer 
      style={{
        marginTop: 'auto',
        padding: '20px 40px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-dim)',
        backgroundColor: 'var(--bg-darker)'
      }}
    >
      <div>
        <span>© 2026 Municipal Urban Orchestration Network (MUON). All rights reserved.</span>
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cpu size={12} /> System load: 12.4%
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={12} className="status-dot pulsing" style={{ animationDuration: '3s' }} /> Socket Sync Active
        </span>
      </div>
    </footer>
  );
};

export default Footer;
