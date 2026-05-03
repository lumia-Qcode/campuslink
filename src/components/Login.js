import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/auth";

const ROLE_DEMOS = {
  student: {
    email: "ali.ahmed@student.campuslink.pk",
    password: "student123",
    label: "Student",
    color: "#2db87b",
    hint: "ali.ahmed@student.campuslink.pk / student123",
  },
  teacher: {
    email: "nadia.hussain@teacher.campuslink.pk",
    password: "teacher123",
    label: "Teacher",
    color: "#4f8ef7",
    hint: "nadia.hussain@teacher.campuslink.pk / teacher123",
  },
  admin: {
    email: "admin@test.com",
    password: "1234",
    label: "Admin",
    color: "#9b6dff",
    hint: "admin@test.com / 1234",
  },
};

function Login() {
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [selectedRole, setSelectedRole] = useState("student");
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        const role = result.role;
        if (role === "teacher") navigate("/teacher/dashboard");
        else if (role === "admin") navigate("/admin/dashboard");
        else navigate("/student/dashboard");
      } else {
        setError(result.message || "Invalid email or password. Please try again.");
      }
    } catch (err) {
      setError("Cannot reach server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const d = ROLE_DEMOS[role];
    if (!d) return;
    setEmail(d.email);
    setPassword(d.password);
    setSelectedRole(role);
  };

  const roleColor = ROLE_DEMOS[selectedRole]?.color || "#2db87b";

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

        {/* Role Selector — Student / Teacher / Admin */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", color: "#9aaabb", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
            Sign in as
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {Object.entries(ROLE_DEMOS).map(([role, data]) => (
              <button key={role} onClick={() => fillDemo(role)}
                style={{
                  flex: 1, padding: "9px 6px", borderRadius: "10px",
                  border: `2px solid ${selectedRole === role ? data.color : "var(--border)"}`,
                  background: selectedRole === role ? data.color + "15" : "var(--bg-main)",
                  color: selectedRole === role ? data.color : "var(--text-secondary)",
                  fontWeight: 700, fontSize: "12.5px", cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.18s",
                }}
              >
                {data.label}
              </button>
            ))}
          </div>
        </div>

        <div className="auth-demo-hint" style={{ background: roleColor + "15", color: roleColor }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Demo: {ROLE_DEMOS[selectedRole]?.hint}
        </div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your {ROLE_DEMOS[selectedRole]?.label?.toLowerCase()} portal</p>

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
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="Enter your email"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Enter your password"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}
            style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Signing in…" : `Log In as ${ROLE_DEMOS[selectedRole]?.label}`}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/signup">Create account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;