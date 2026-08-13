import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import './LoginPage.css';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('oc@safeguard.gov');
  const [password, setPassword] = useState('safeguard123');
  const [showPass, setShowPass] = useState(false);

  if (isAuthenticated) return <Navigate to="/map" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    await login(email, password);
  };

  const quickLogin = (role) => {
    const creds = {
      OC: { email: 'oc@safeguard.gov', password: 'safeguard123' },
      SP: { email: 'sp@safeguard.gov', password: 'safeguard123' },
      SUPER_ADMIN: { email: 'admin@safeguard.gov', password: 'safeguard123' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
  };

  return (
    <div className="login-page" id="login-page">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-bg-orb orb-1" />
        <div className="login-bg-orb orb-2" />
        <div className="login-bg-orb orb-3" />
        <div className="login-grid" />
      </div>

      <div className="login-container animate-fade-in-up">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Shield size={28} />
          </div>
          <div>
            <h1 className="login-logo-name">SafeGuard</h1>
            <p className="login-logo-sub">Admin Portal — Secure Access</p>
          </div>
        </div>

        {/* Card */}
        <div className="login-card">
          <div className="login-card-header">
            <h2>Sign In</h2>
            <p>Enter your credentials to access the command center</p>
          </div>

          {error && (
            <div className="login-error animate-fade-in">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email-input">Email Address</label>
              <div className="login-input-wrap">
                <Mail size={15} className="login-input-icon" />
                <input
                  id="email-input"
                  type="email"
                  className="input login-input"
                  value={email}
                  onChange={e => { setEmail(e.target.value); clearError(); }}
                  placeholder="officer@safeguard.gov"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password-input">Password</label>
              <div className="login-input-wrap">
                <Lock size={15} className="login-input-icon" />
                <input
                  id="password-input"
                  type={showPass ? 'text' : 'password'}
                  className="input login-input"
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearError(); }}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  required
                />
                <button type="button" className="login-eye-btn" onClick={() => setShowPass(!showPass)} id="toggle-password">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit-btn" id="login-submit" disabled={isLoading}>
              {isLoading ? <span className="login-spinner" /> : null}
              {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          {/* Quick login shortcuts */}
          <div className="login-quick">
            <p className="login-quick-label">Quick Access (Demo)</p>
            <div className="login-quick-btns">
              <button className="quick-btn quick-oc" onClick={() => quickLogin('OC')} id="quick-login-oc">OC Login</button>
              <button className="quick-btn quick-sp" onClick={() => quickLogin('SP')} id="quick-login-sp">SP Login</button>
              <button className="quick-btn quick-admin" onClick={() => quickLogin('SUPER_ADMIN')} id="quick-login-admin">Super Admin</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="login-footer">
          SafeGuard v2.0 · Kolkata Police Digital Command System
        </p>
      </div>
    </div>
  );
}
