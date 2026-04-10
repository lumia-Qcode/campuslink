import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../services/auth";

const ROLES = [
  { value: "student", label: "Student",  color: "#2db87b" },
  { value: "teacher", label: "Teacher",  color: "#4f8ef7" },
  { value: "admin",   label: "Admin",    color: "#9b6dff" },
];

function Signup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 4)  { setError("Password must be at least 4 characters."); return; }
    signup(email, password, role, name);
    navigate("/");
  };

  const roleColor = ROLES.find(r => r.value === role)?.color || "#2db87b";

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div>
            <div className="auth-logo-text">Campus<span>Link</span></div>
            <div style={{fontSize:'9px',color:'#9aaabb',textTransform:'uppercase',letterSpacing:'1.2px',fontWeight:600}}>Campus Student Solutions</div>
          </div>
        </div>

        {/* Role Selector */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", color: "#9aaabb", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
            Register as
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {ROLES.map(r => (
              <button key={r.value} onClick={() => setRole(r.value)} type="button"
                style={{
                  flex: 1, padding: "9px 6px", borderRadius: "10px",
                  border: `2px solid ${role === r.value ? r.color : "var(--border)"}`,
                  background: role === r.value ? r.color + "15" : "var(--bg-main)",
                  color: role === r.value ? r.color : "var(--text-secondary)",
                  fontWeight: 700, fontSize: "12.5px", cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.18s",
                }}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <h2 className="auth-title">Create account</h2>
        <p className="auth-subtitle">Join as a {ROLES.find(r => r.value === role)?.label}</p>

        {error && (
          <div className="alert-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" type="text" placeholder="Your full name"
              value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="your@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Create a password"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="form-input" type="password" placeholder="Repeat your password"
              value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary"
            style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)` }}>
            Create {ROLES.find(r => r.value === role)?.label} Account
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;