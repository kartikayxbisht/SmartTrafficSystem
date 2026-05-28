import React, { useState, useEffect, useRef } from 'react';
import {
  TrafficCone,
  Lock,
  Mail,
  Phone,
  User,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

const Auth = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [userId, setUserId] = useState(null);

  // Sign In / Sign Up Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification Fields
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [mockOtp, setMockOtp] = useState(null);

  // Cooldown / Expiry State
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(300); // 5 minutes in seconds

  // UI Messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);

  // Refs for OTP input navigation
  const otpRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // Tick down resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Tick down OTP expiry
  useEffect(() => {
    if (!isOtpMode || otpExpiry <= 0) return;
    const timer = setInterval(() => {
      setOtpExpiry(prev => {
        if (prev <= 1) {
          setError('OTP has expired. Please request a new code.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOtpMode, otpExpiry]);

  // Handle OTP focus shifting
  const handleOtpChange = (index, val) => {
    if (val !== '' && isNaN(val)) return;
    const newOtpValues = [...otpValues];
    newOtpValues[index] = val.slice(-1);
    setOtpValues(newOtpValues);

    // Auto-focus next input
    if (val !== '' && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otpValues[index] === '' && index > 0) {
      const newOtpValues = [...otpValues];
      newOtpValues[index - 1] = '';
      setOtpValues(newOtpValues);
      otpRefs[index - 1].current.focus();
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setMobile('');
    setPassword('');
    setConfirmPassword('');
    setOtpValues(['', '', '', '', '', '']);
    setMockOtp(null);
    setError('');
    setSuccess('');
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, mobile, password, confirmPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setUserId(data.userId);
      setIsOtpMode(true);
      setOtpExpiry(300);
      setResendCooldown(30);
      setAttemptsRemaining(3);
      if (data.mockOtp) {
        setMockOtp(data.mockOtp);
      }
      setSuccess('Registration successful! Check your mobile for the verification code.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {};
      if (email) {
        payload.identifier = email;
      } else if (mobile) {
        payload.identifier = mobile;
      } else {
        throw new Error('Please enter email or mobile number');
      }

      if (isOtpLogin) {
        payload.requestOtp = true;
      } else {
        payload.password = password;
      }

      const res = await fetch('http://localhost:5000/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.error === 'unverified') {
          setUserId(data.userId);
          setIsOtpMode(true);
          setOtpExpiry(300);
          setResendCooldown(30);
          setAttemptsRemaining(3);
          if (data.mockOtp) setMockOtp(data.mockOtp);
          setSuccess(data.message);
          return;
        }
        throw new Error(data.error || 'Login failed');
      }

      if (isOtpLogin && data.otpRequired) {
        setUserId(data.userId);
        setIsOtpMode(true);
        setOtpExpiry(300);
        setResendCooldown(30);
        setAttemptsRemaining(3);
        if (data.mockOtp) setMockOtp(data.mockOtp);
        setSuccess('OTP code sent to your registered mobile number.');
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onAuthSuccess(data.user, data.token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const code = otpValues.join('');
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isOtpLogin ? 'signin' : 'verify-otp';
      const payload = isOtpLogin ? { userId, otpCode: code } : { userId, otpCode: code };

      const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        throw new Error(data.error || 'Verification failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }

      setOtpExpiry(300);
      setResendCooldown(30);
      setAttemptsRemaining(3);
      setOtpValues(['', '', '', '', '', '']);
      if (data.mockOtp) setMockOtp(data.mockOtp);
      setSuccess('A new verification code has been dispatched.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-overlay"></div>
      <div className="auth-container glass-panel animate-fade-in">

        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo-bg">
            <TrafficCone className="auth-logo" />
          </div>
          <h2>TRAFFIC.AI</h2>
          <p className="auth-subtitle">AI-Orchestrated Smart City Grid Controls</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-alert error animate-fade-in">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="auth-alert success animate-fade-in">
            <ShieldCheck size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Development Environment Mock OTP Badge */}
        {isOtpMode && mockOtp && (
          <div className="mock-otp-panel animate-fade-in">
            <div className="mock-title">
              <Sparkles size={14} style={{ color: 'var(--secondary)' }} />
              <span>TEST ENV: MOCK OTP DISPATCH</span>
            </div>
            <div className="mock-code">{mockOtp}</div>
            <p className="mock-desc">Twilio credentials missing. Use the mock code above to complete verification.</p>
          </div>
        )}

        {/* OTP Verification Form */}
        {isOtpMode ? (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="form-info">
              <h3>Verify Mobile Number</h3>
              <p>Enter the 6-digit confirmation code we sent to your mobile device.</p>
            </div>

            <div className="otp-input-row">
              {otpValues.map((val, idx) => (
                <input
                  key={idx}
                  ref={otpRefs[idx]}
                  type="text"
                  maxLength="1"
                  value={val}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  disabled={loading || otpExpiry <= 0}
                  className="otp-box"
                />
              ))}
            </div>

            <div className="otp-status-hud">
              <span className={`expiry-timer ${otpExpiry < 60 ? 'warning' : ''}`}>
                Code Expires: {formatTime(otpExpiry)}
              </span>
              <span className="attempts-badge">
                Attempts Remaining: {attemptsRemaining}
              </span>
            </div>

            <button
              type="submit"
              className="auth-btn primary"
              disabled={loading || otpExpiry <= 0}
            >
              {loading ? <RefreshCw className="spinner" size={18} /> : 'Complete Verification'}
            </button>

            <div className="resend-section">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || resendCooldown > 0}
                className={`resend-btn ${resendCooldown > 0 ? 'disabled' : ''}`}
              >
                {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Verification Code'}
              </button>
            </div>

            <button
              type="button"
              className="back-btn"
              onClick={() => {
                setIsOtpMode(false);
                setIsOtpLogin(false);
                resetForm();
              }}
            >
              Back to Sign In
            </button>
          </form>
        ) : (
          /* Sign In / Sign Up Form */
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="auth-form">

            {isSignUp && (
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-field">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label>{isSignUp ? 'Email Address' : 'Email or Mobile Number'}</label>
              <div className="input-field">
                {isSignUp || !email.match(/^\d+$/) ? <Mail size={16} className="input-icon" /> : <Phone size={16} className="input-icon" />}
                <input
                  type="text"
                  placeholder={isSignUp ? "john@city.gov" : "Email or Mobile Number"}
                  value={isSignUp ? email : (email || mobile)}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (isSignUp) {
                      setEmail(val);
                    } else {
                      if (val.match(/^\d+$/) || val === '') {
                        setMobile(val);
                        setEmail('');
                      } else {
                        setEmail(val);
                        setMobile('');
                      }
                    }
                  }}
                  required
                />
              </div>
            </div>

            {isSignUp && (
              <div className="input-group animate-fade-in">
                <label>Mobile Number</label>
                <div className="input-field">
                  <Phone size={16} className="input-icon" />
                  <input
                    type="tel"
                    placeholder="1234567890"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Password Field (only show if not doing password-less OTP signin) */}
            {(!isSignUp && isOtpLogin) ? null : (
              <div className="input-group animate-fade-in">
                <label>Password</label>
                <div className="input-field">
                  <Lock size={16} className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {isSignUp && (
              <div className="input-group animate-fade-in">
                <label>Confirm Password</label>
                <div className="input-field">
                  <Lock size={16} className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {!isSignUp && (
              <div className="login-options-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isOtpLogin}
                    onChange={(e) => {
                      setIsOtpLogin(e.target.checked);
                      setError('');
                    }}
                  />
                  <span>Sign in with Mobile OTP instead</span>
                </label>
              </div>
            )}

            <button type="submit" className="auth-btn primary" disabled={loading}>
              {loading ? (
                <RefreshCw className="spinner" size={18} />
              ) : (
                <>
                  <span>{isSignUp ? 'Send Verification OTP' : (isOtpLogin ? 'Get OTP Code' : 'Access Control Room')}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="auth-footer-toggle">
              {isSignUp ? (
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      resetForm();
                    }}
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  New system operator?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      resetForm();
                    }}
                  >
                    Register Account
                  </button>
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
