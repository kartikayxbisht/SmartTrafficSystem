import React, { useState, useEffect } from 'react';
import { Zap, ShieldCheck, User, Eye, EyeOff, LogIn, Lock, Mail, BadgeCheck } from 'lucide-react';

const LoginPortal = ({ onLogin }) => {
  const [mounted, setMounted] = useState(false);
  const [adminForm, setAdminForm] = useState({ username: '', password: '', showPassword: false, error: '', loading: false });
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', showPassword: false, error: '', loading: false });
  const [isUserSignUp, setIsUserSignUp] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const t = setTimeout(() => setMounted(true), 50);

    // Pre-seed default user in localStorage if not existing
    const key = 'intellipark_registered_users';
    if (!localStorage.getItem(key)) {
      const defaultUsers = [
        { name: 'User', password: 'user123', email: 'user@intellipark.ai' }
      ];
      localStorage.setItem(key, JSON.stringify(defaultUsers));
    }

    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const canvas = document.getElementById('login-traffic-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Define highway bezier paths that loosely align with the background photo curves
    const createPaths = (w, h) => [
      // Lane 1: Bottom-Left to Top-Right (White/cyan headlights)
      {
        color: '#e0f2fe',
        glowColor: '#0ea5e9',
        points: [
          { x: -50, y: h * 0.8 },
          { x: w * 0.35, y: h * 0.65 },
          { x: w * 0.65, y: h * 0.55 },
          { x: w + 50, y: h * 0.35 }
        ]
      },
      // Lane 2: Top-Right to Bottom-Left (Red taillights)
      {
        color: '#fee2e2',
        glowColor: '#ef4444',
        points: [
          { x: w + 50, y: h * 0.38 },
          { x: w * 0.68, y: h * 0.58 },
          { x: w * 0.38, y: h * 0.68 },
          { x: -50, y: h * 0.83 }
        ]
      },
      // Lane 3: Bottom-Right to Top-Left (Cyan/Green transit)
      {
        color: '#ccfbf1',
        glowColor: '#14b8a6',
        points: [
          { x: w + 50, y: h * 0.78 },
          { x: w * 0.65, y: h * 0.65 },
          { x: w * 0.35, y: h * 0.52 },
          { x: -50, y: h * 0.32 }
        ]
      },
      // Lane 4: Top-Left to Bottom-Right (Red taillights)
      {
        color: '#fee2e2',
        glowColor: '#ef4444',
        points: [
          { x: -50, y: h * 0.35 },
          { x: w * 0.32, y: h * 0.55 },
          { x: w * 0.62, y: h * 0.68 },
          { x: w + 50, y: h * 0.82 }
        ]
      }
    ];

    // Cubic Bezier helper
    const getBezierPoint = (p0, p1, p2, p3, t) => {
      const cx = 3 * (p1.x - p0.x);
      const bx = 3 * (p2.x - p1.x) - cx;
      const ax = p3.x - p0.x - cx - bx;

      const cy = 3 * (p1.y - p0.y);
      const by = 3 * (p2.y - p1.y) - cy;
      const ay = p3.y - p0.y - cy - by;

      const x = ((ax * t + bx) * t + cx) * t + p0.x;
      const y = ((ay * t + by) * t + cy) * t + p0.y;
      return { x, y };
    };

    let paths = createPaths(canvas.width, canvas.height);

    // Handle path recalculation on resize
    const originalResize = resizeCanvas;
    const resizeAndRecalculate = () => {
      originalResize();
      paths = createPaths(canvas.width, canvas.height);
    };
    window.removeEventListener('resize', resizeCanvas);
    window.addEventListener('resize', resizeAndRecalculate);

    // Setup car particles
    const cars = [];
    const maxCars = 55; // increased density for a continuous highway flow

    for (let i = 0; i < maxCars; i++) {
      cars.push({
        pathIndex: Math.floor(Math.random() * paths.length),
        t: Math.random(),
        speed: 0.002 + Math.random() * 0.003, // faster speed for more noticeable action
        width: 2.0 + Math.random() * 1.8,
      });
    }

    const animate = () => {
      // Clear canvas fully to preserve background image transparency
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      cars.forEach(car => {
        car.t += car.speed;
        if (car.t > 1.0) {
          car.t = 0;
          car.pathIndex = Math.floor(Math.random() * paths.length);
          car.speed = 0.002 + Math.random() * 0.003;
        }

        const path = paths[car.pathIndex];
        if (!path) return;

        // Render trail back along bezier with custom segment-by-segment alpha fading
        const steps = 8;
        for (let j = 0; j < steps; j++) {
          const tStart = Math.max(0, car.t - (j / steps) * 0.025);
          const tEnd = Math.max(0, car.t - ((j + 1) / steps) * 0.025);

          const ptStart = getBezierPoint(path.points[0], path.points[1], path.points[2], path.points[3], tStart);
          const ptEnd = getBezierPoint(path.points[0], path.points[1], path.points[2], path.points[3], tEnd);

          ctx.beginPath();
          ctx.moveTo(ptStart.x, ptStart.y);
          ctx.lineTo(ptEnd.x, ptEnd.y);

          const alpha = 1.0 - (j / steps);
          ctx.strokeStyle = path.color;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = car.width * (1.0 - (j / steps) * 0.25); // taper trail
          ctx.lineCap = 'round';
          ctx.shadowColor = path.glowColor;
          ctx.shadowBlur = 10 * alpha;
          ctx.stroke();
        }
      });

      // Restore default context properties
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeAndRecalculate);
      cancelAnimationFrame(animationFrameId);
    };
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
    const nameInput = userForm.name.trim();
    const passwordInput = userForm.password;
    const emailInput = userForm.email.trim();

    if (!nameInput) {
      setUserForm(p => ({ ...p, error: 'Please enter your name.' }));
      return;
    }
    if (!passwordInput) {
      setUserForm(p => ({ ...p, error: 'Please enter a password.' }));
      return;
    }

    setUserForm(p => ({ ...p, loading: true, error: '' }));

    setTimeout(() => {
      const key = 'intellipark_registered_users';
      const registeredUsers = JSON.parse(localStorage.getItem(key) || '[]');

      if (isUserSignUp) {
        // Register Mode
        if (passwordInput.length < 4) {
          setUserForm(p => ({ ...p, loading: false, error: 'Password must be at least 4 characters.' }));
          return;
        }

        const nameExists = registeredUsers.some(
          u => u.name.toLowerCase() === nameInput.toLowerCase()
        );

        if (nameExists) {
          setUserForm(p => ({ ...p, loading: false, error: 'This name is already registered. Please sign in.' }));
          return;
        }

        const newUser = { name: nameInput, password: passwordInput, email: emailInput };
        registeredUsers.push(newUser);
        localStorage.setItem(key, JSON.stringify(registeredUsers));

        onLogin('user', { name: nameInput, email: emailInput });
      } else {
        // Sign In Mode
        const matchedUser = registeredUsers.find(
          u => u.name.toLowerCase() === nameInput.toLowerCase()
        );

        if (!matchedUser) {
          setUserForm(p => ({ ...p, loading: false, error: 'Account not found. Please register first.' }));
          return;
        }

        if (matchedUser.password !== passwordInput) {
          setUserForm(p => ({ ...p, loading: false, error: 'Incorrect password.' }));
          return;
        }

        onLogin('user', { name: matchedUser.name, email: matchedUser.email || '' });
      }
    }, 600);
  };

  return (
    <div className={`login-portal ${mounted ? 'login-portal--mounted' : ''}`}>

      {/* Animated background particles */}
      <div className="login-bg-grid" />
      <div className="login-bg-orb login-bg-orb--1" />
      <div className="login-bg-orb login-bg-orb--2" />

      {/* Moving Traffic Animation Canvas */}
      <canvas id="login-traffic-canvas" />

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

          <form onSubmit={handleUserLogin} className="login-form" autoComplete="off">
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
                  type={userForm.showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={userForm.password}
                  onChange={e => setUserForm(p => ({ ...p, password: e.target.value, error: '' }))}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setUserForm(p => ({ ...p, showPassword: !p.showPassword }))}
                  tabIndex={-1}
                >
                  {userForm.showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {isUserSignUp && (
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
                    autoComplete="off"
                  />
                </div>
              </div>
            )}

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
                  <span>{isUserSignUp ? 'Register & Login' : 'Sign In as User'}</span>
                </>
              )}
            </button>
          </form>

          <div className="login-toggle-mode">
            {isUserSignUp ? (
              <span>
                Already registered?{' '}
                <button
                  type="button"
                  className="login-toggle-link"
                  onClick={() => {
                    setIsUserSignUp(false);
                    setUserForm(p => ({ ...p, name: '', email: '', password: '', error: '', showPassword: false }));
                  }}
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                New user?{' '}
                <button
                  type="button"
                  className="login-toggle-link"
                  onClick={() => {
                    setIsUserSignUp(true);
                    setUserForm(p => ({ ...p, name: '', email: '', password: '', error: '', showPassword: false }));
                  }}
                >
                  Register Account
                </button>
              </span>
            )}
          </div>

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
