import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { apiStudentGetAttendance } from "../../services/api";

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

function AttendanceCircle({ percentage, size = 120, stroke = 10, color = "#2db87b" }) {
  const radius = size / 2 - stroke / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e4eaf0" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>{percentage}%</span>
        <span style={{ fontSize: size * 0.1, color: "var(--text-muted)", fontWeight: 600, marginTop: "2px" }}>Present</span>
      </div>
    </div>
  );
}

function MiniBar({ pct, color }) {
  return (
    <div style={{ height: "6px", borderRadius: "99px", background: "var(--border)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "99px", transition: "width 1s ease" }} />
    </div>
  );
}

const STATUS_CONFIG = {
  Present: { color: "#2db87b", bg: "#f0fdf7", icon: "M9 11l3 3L22 4" },
  Absent:  { color: "#e53e3e", bg: "#fff5f5", icon: "M18 6L6 18M6 6l12 12" },
  Late:    { color: "#e6a800", bg: "#fffbeb", icon: "M12 8v4l3 3M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" },
  Leave:   { color: "#7c3aed", bg: "#f5f3ff", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" },
};

const SUBJECT_COLORS = ["#4f8ef7", "#9b6dff", "#2db87b", "#f5c842", "#ff6b6b", "#0ea5e9"];
const FILTERS = ["All", "Present", "Absent", "Late", "Leave"];

function Attendance() {
  const [records, setRecords]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeMonth, setActiveMonth]   = useState("All");

  useEffect(() => {
    apiStudentGetAttendance()
      .then(res => {
        setRecords(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="app-layout"><Navbar />
        <main className="main-content">
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)" }}>Loading attendance…</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-layout"><Navbar />
        <main className="main-content">
          <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ color: "#e53e3e", marginBottom: 8 }}>Failed to load attendance</div>
            <div style={{ color: "var(--text-muted)", fontSize: 14 }}>{error}</div>
          </div>
        </main>
      </div>
    );
  }

  if (!records.length) {
    return (
      <div className="app-layout"><Navbar />
        <main className="main-content">
          <div className="card" style={{ textAlign: "center", padding: "64px 24px" }}>
            <div style={{ width: 72, height: 72, borderRadius: "20px", background: "#f0fdf7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Icon d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" size={32} color="#2db87b" />
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>No Attendance Records</div>
            <div style={{ color: "var(--text-muted)", marginTop: 8 }}>Your teacher hasn't marked attendance yet.</div>
          </div>
        </main>
      </div>
    );
  }

  // Compute stats from records
  const total   = records.length;
  const present = records.filter(r => r.status === "Present").length;
  const absent  = records.filter(r => r.status === "Absent").length;
  const late    = records.filter(r => r.status === "Late").length;
  const leave   = records.filter(r => r.status === "Leave").length;
  const overallPct = total > 0 ? Math.round((present / total) * 100) : 0;

  // Per-subject percentages (attendance doesn't have subject — show overall only)
  // Group by month for filter
  const months = ["All", ...Array.from(new Set(records.map(r => {
    const d = new Date(r.date);
    return `${d.toLocaleString("default", { month: "long" })} ${d.getFullYear()}`;
  }))).sort((a, b) => new Date(a) - new Date(b))];

  const filtered = records.filter(r => {
    const statusOk = activeFilter === "All" || r.status === activeFilter;
    const monthOk  = activeMonth  === "All" || (() => {
      const d = new Date(r.date);
      return `${d.toLocaleString("default", { month: "long" })} ${d.getFullYear()}` === activeMonth;
    })();
    return statusOk && monthOk;
  });

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-greeting" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg,#2db87b,#1e9e63)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" size={18} color="#fff" />
            </div>
            <span>Attendance</span>
            <span style={{ color: "#9aaabb", fontWeight: 500, fontSize: "14px" }}>· Overview</span>
          </div>
          <div className="topbar-date">
            <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={15} color="#2db87b" />
            {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        <div className="page-wrapper">
          {/* Summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px" }}>
              <AttendanceCircle percentage={overallPct} />
              <div style={{ marginTop: 12, fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Overall</div>
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{present} / {total} days</div>
            </div>
            {[
              { label: "Present", count: present, color: "#2db87b", bg: "#f0fdf7", icon: "M9 11l3 3L22 4" },
              { label: "Absent",  count: absent,  color: "#e53e3e", bg: "#fff5f5", icon: "M18 6L6 18M6 6l12 12" },
              { label: "Late",    count: late,    color: "#e6a800", bg: "#fffbeb", icon: "M12 8v4l3 3M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" },
              { label: "Leave",   count: leave,   color: "#7c3aed", bg: "#f5f3ff", icon: "M9 12l2 2 4-4" },
            ].map(s => (
              <div key={s.label} className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px", gap: 8 }}>
                <div style={{ width: 48, height: 48, borderRadius: "14px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon d={s.icon} size={22} color={s.color} />
                </div>
                <div style={{ fontWeight: 900, fontSize: 28, color: s.color }}>{s.count}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{s.label}</div>
                <MiniBar pct={total > 0 ? Math.round((s.count / total) * 100) : 0} color={s.color} />
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FILTERS.map(f => (
                <button key={f} className={`filter-chip ${activeFilter === f ? "active" : ""}`}
                  onClick={() => setActiveFilter(f)} style={{ cursor: "pointer" }}>
                  {f}
                </button>
              ))}
            </div>
            <select value={activeMonth} onChange={e => setActiveMonth(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 13, cursor: "pointer" }}>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Records table */}
          <div className="card">
            <div className="section-label" style={{ marginBottom: 14 }}>
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
              {activeFilter !== "All" ? ` · ${activeFilter}` : ""}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-muted)" }}>No records match the filter.</div>
              ) : filtered.map((r, i) => {
                const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.Present;
                const d   = new Date(r.date);
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.color}22` }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 1px 4px #0001" }}>
                      <Icon d={cfg.icon} size={18} color={cfg.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                        {d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, background: "#fff", color: cfg.color, border: `1px solid ${cfg.color}44` }}>
                      {r.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Attendance;
