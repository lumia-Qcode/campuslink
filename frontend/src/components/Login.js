import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";

const ROLE_LABELS = { student: "Student", teacher: "Teacher", admin: "Admin" };

function Login() {
  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState("");
  const [activeRole, setRole]     = useState("student");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (result.success) {
      const role = result.role;
      if (role === "teacher") navigate("/teacher/dashboard");
      else if (role === "admin") navigate("/admin/dashboard");
      else navigate("/student/dashboard");
    } else {
      setError(result.message || "Invalid username or password.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div>
            <div className="auth-logo-text">Campus<span>Link</span></div>
            <div style={{fontSize:"9px",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"1.2px",fontWeight:600}}>Campus Student Solutions</div>
          </div>
        </div>

        {/* Role tabs (visual only — role determined by backend) */}
        <div style={{marginBottom:"20px"}}>
          <div style={{fontSize:"11px",color:"var(--text-muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:"8px"}}>Sign in as</div>
          <div style={{display:"flex",gap:"8px"}}>
            {Object.entries(ROLE_LABELS).map(([role, label]) => (
              <button key={role} type="button" onClick={() => setRole(role)}
                className={`auth-role-btn${activeRole === role ? ` active-${role}` : ""}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your {ROLE_LABELS[activeRole].toLowerCase()} portal</p>

        {error && (
          <div className="alert-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" type="text" placeholder="Enter your username"
              value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Enter your password"
              value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Signing in…" : `Log In as ${ROLE_LABELS[activeRole]}`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
