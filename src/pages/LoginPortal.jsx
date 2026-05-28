import React, { useState, useEffect } from 'react';
import { Zap, ShieldCheck, User, Eye, EyeOff, LogIn, Lock, Mail, BadgeCheck } from 'lucide-react';

const LoginPortal = ({ onLogin }) => {
  const [mounted, setMounted] = useState(false);
  const [adminForm, setAdminForm] = useState({ username: '', password: '', showPassword: false, error: '', loading: false });
  const [userForm, setUserForm] = useState({ name: '', email: '', error: '', loading: false });

  useEffect(() => {
    // Trigger entrance animation
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setAdminForm(p => ({ ...p, loading: true, error: '' }));

    // Simulate brief auth delay for UX realism
    setTimeout(() => {
      if (adminForm.username.trim() === 'admin' && adminForm.password === 'intellipark@123') {
        onLogin('admin', { name: 'Administrator', username: adminForm.username });
      } else {
        setAdminForm(p => ({ ...p, loading: false, error: 'Invalid credentials. Use: admin / intellipark@123' }));
      }
    }, 600);
  };

  const handleUserLogin = (e) => {
    e.preventDefault();
    if (!userForm.name.trim()) {
      setUserForm(p => ({ ...p, error: 'Please enter your name to continue.' }));
      return;
    }
    setUserForm(p => ({ ...p, loading: true, error: '' }));
    setTimeout(() => {
      onLogin('user', { name: userForm.name.trim(), email: userForm.email.trim() });
    }, 400);
  };

  return (
    <div className={`login-portal ${mounted ? 'login-portal--mounted' : ''}`}>

      {/* Animated background particles */}
      <div className="login-bg-grid" />
      <div className="login-bg-orb login-bg-orb--1" />
      <div className="login-bg-orb login-bg-orb--2" />

      {/* Brand Header */}
      <div className="login-brand">
        <div className="login-brand-icon">
          <Zap size={26} />
        </div>
        <div className="login-brand-text">
          <span className="brand-name">
            <span className="brand-intelli">Intelli</span><span className="brand-park">Park</span><span className="brand-ai"> AI</span>
          </span>
          <span className="login-brand-sub">Smart City Intelligence Platform</span>
        </div>
      </div>

      <p className="login-headline">Choose your access level to continue</p>

      {/* Login Cards */}
      <div className="login-cards">

        {/* ── Admin Card ── */}
        <div className="login-card login-card--admin">
          <div className="login-card-glow login-card-glow--admin" />

          <div className="login-card-header">
            <div className="login-card-icon login-card-icon--admin">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="login-card-title">Admin Access</h2>
              <p className="login-card-sub">Signal control & infrastructure management</p>
            </div>
          </div>

          <form onSubmit={handleAdminLogin} className="login-form" autoComplete="off">
            <div className="login-field">
              <label className="login-label">Username</label>
              <div className="login-input-wrapper">
                <BadgeCheck size={15} className="login-input-icon" />
                <input
                  className="login-input"
                  type="text"
                  placeholder="admin"
                  value={adminForm.username}
                  onChange={e => setAdminForm(p => ({ ...p, username: e.target.value, error: '' }))}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-label">Password</label>
              <div className="login-input-wrapper">
                <Lock size={15} className="login-input-icon" />
                <input
                  className="login-input login-input--password"
                  type={adminForm.showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={adminForm.password}
                  onChange={e => setAdminForm(p => ({ ...p, password: e.target.value, error: '' }))}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setAdminForm(p => ({ ...p, showPassword: !p.showPassword }))}
                  tabIndex={-1}
                >
                  {adminForm.showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {adminForm.error && (
              <div className="login-error">
                <ShieldCheck size={13} /> {adminForm.error}
              </div>
            )}

            <button
              type="submit"
              className={`login-btn login-btn--admin ${adminForm.loading ? 'login-btn--loading' : ''}`}
              disabled={adminForm.loading}
            >
              {adminForm.loading ? (
                <span className="login-spinner" />
              ) : (
                <>
                  <LogIn size={15} />
                  <span>Sign In as Admin</span>
                </>
              )}
            </button>
          </form>

          <div className="login-card-badge login-card-badge--admin">
            <ShieldCheck size={11} /> Restricted Access
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="login-divider">
          <div className="login-divider-line" />
          <span className="login-divider-text">or</span>
          <div className="login-divider-line" />
        </div>

        {/* ── User Card ── */}
        <div className="login-card login-card--user">
          <div className="login-card-glow login-card-glow--user" />

          <div className="login-card-header">
            <div className="login-card-icon login-card-icon--user">
              <User size={22} />
            </div>
            <div>
              <h2 className="login-card-title">User Access</h2>
              <p className="login-card-sub">Parking reservations & city overview</p>
            </div>
          </div>

          <form onSubmit={handleUserLogin} className="login-form">
            <div className="login-field">
              <label className="login-label">Full Name</label>
              <div className="login-input-wrapper">
                <User size={15} className="login-input-icon" />
                <input
                  className="login-input"
                  type="text"
                  placeholder="Enter your name"
                  value={userForm.name}
                  onChange={e => setUserForm(p => ({ ...p, name: e.target.value, error: '' }))}
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-label">Email <span className="login-optional">(optional)</span></label>
              <div className="login-input-wrapper">
                <Mail size={15} className="login-input-icon" />
                <input
                  className="login-input"
                  type="email"
                  placeholder="you@example.com"
                  value={userForm.email}
                  onChange={e => setUserForm(p => ({ ...p, email: e.target.value, error: '' }))}
                />
              </div>
            </div>

            {userForm.error && (
              <div className="login-error">
                <User size={13} /> {userForm.error}
              </div>
            )}

            <button
              type="submit"
              className={`login-btn login-btn--user ${userForm.loading ? 'login-btn--loading' : ''}`}
              disabled={userForm.loading}
            >
              {userForm.loading ? (
                <span className="login-spinner" />
              ) : (
                <>
                  <LogIn size={15} />
                  <span>Enter as User</span>
                </>
              )}
            </button>
          </form>

          <div className="login-card-badge login-card-badge--user">
            <User size={11} /> Open Access
          </div>
        </div>
      </div>

      <p className="login-footer">IntelliPark AI · v3.1.2 · AI Orchestrated</p>
    </div>
  );
};

export default LoginPortal;
