import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { fetchAttendance } from "../../services/studentApi";

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
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeMonth, setActiveMonth] = useState("All");

  useEffect(() => {
    const params = {};
    if (activeFilter !== "All") params.status = activeFilter;
    if (activeMonth !== "All") params.month = activeMonth;
    fetchAttendance(params)
      .then(data => setAttendanceData(data))
      .catch(() => setAttendanceData(null))
      .finally(() => setLoading(false));
  }, [activeFilter, activeMonth]);

  const studentAttendance = attendanceData;
  const records = studentAttendance?.records || [];

const months = ["All", ...new Set(records.map(r => {
    const d = new Date(r.date);
    return isNaN(d) ? null : d.toLocaleString("default", { month: "long", year: "numeric" });
  }).filter(Boolean))
];


  const filtered = records.filter(r => {
    const statusMatch = activeFilter === "All" || r.status === activeFilter;
    const d = new Date(r.date);
    const monthLabel = isNaN(d) ? null : d.toLocaleString("default", { month: "long", year: "numeric" });
    const monthMatch = activeMonth === "All" || monthLabel === activeMonth;
    return statusMatch && monthMatch;
  });

  const stats = FILTERS.slice(1).reduce((acc, s) => {
    acc[s] = records.filter(r => r.status === s).length;
    return acc;
  }, {});
  const total = records.length || 1;

  const subjects = studentAttendance?.subjects || [];

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">

        {/* Top Bar */}
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
            {new Date(2026, 2, 15).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Summary Row */}
        <div className="att-summary-grid">
          {/* Big Circle */}
          <div className="card card-green" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "24px" }}>
            <AttendanceCircle percentage={studentAttendance?.overall || 85} size={130} />
            <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>Overall Attendance</div>
          </div>

          {/* Stat Cards */}
          <div className="att-stat-cards">
            {[
              { label: "Total Days",   value: records.length,    icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", color: "#4f8ef7", iconBg: "#eff5ff" },
              { label: "Present",      value: stats.Present || 0, icon: "M9 11l3 3L22 4", color: "#2db87b", iconBg: "#f0fdf7" },
              { label: "Absent",       value: stats.Absent || 0,  icon: "M18 6L6 18M6 6l12 12", color: "#e53e3e", iconBg: "#fff5f5" },
              { label: "Late / Leave", value: (stats.Late || 0) + (stats.Leave || 0), icon: "M12 8v4l3 3M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z", color: "#e6a800", iconBg: "#fffbeb" },
            ].map((s, i) => (
              <div key={i} className="att-stat-card">
                <div style={{ width: 36, height: 36, borderRadius: "10px", background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon d={s.icon} size={17} color={s.color} />
                </div>
                <div>
                  <div style={{ fontSize: "22px", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, marginTop: "2px" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Subject-wise */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: "14px" }}>
              <div className="card-title">
                <div className="card-title-icon icon-blue">
                  <Icon d="M9 17V7m0 10a2 2 0 0 1-2 2H5a2 2 0 0 0-2-2V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m0 10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m0 10V7" size={15} color="#4f8ef7" />
                </div>
                Subject-wise
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {subjects.length > 0 ? subjects.map((sub, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{sub.name}</span>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }}>{sub.percentage}%</span>
                  </div>
                  <MiniBar pct={sub.percentage} color={SUBJECT_COLORS[i % SUBJECT_COLORS.length]} />
                </div>
              )) : (
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No subject data available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="card" style={{ marginTop: "4px" }}>
          <div className="card-header" style={{ marginBottom: "16px" }}>
            <div className="card-title">
              <div className="card-title-icon icon-green">
                <Icon d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" size={15} color="#2db87b" />
              </div>
              Attendance Records
            </div>
            <span style={{ fontSize: "12.5px", color: "var(--text-muted)", fontWeight: 600 }}>{filtered.length} records</span>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
            {FILTERS.map(f => (
              <button key={f}
                className={`ann-filter-btn ${activeFilter === f ? "active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >{f}</button>
            ))}
            {months.length > 1 && (
              <select
                value={activeMonth}
                onChange={e => setActiveMonth(e.target.value)}
                style={{
                  marginLeft: "auto", padding: "6px 12px", borderRadius: "20px",
                  border: "1.5px solid var(--border)", background: "var(--bg-main)",
                  color: "var(--text-primary)", fontSize: "12.5px", fontWeight: 700,
                  fontFamily: "inherit", cursor: "pointer", outline: "none",
                }}
              >
                {months.map(m => <option key={m}>{m}</option>)}
              </select>
            )}
          </div>

          {/* Records Table */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              <Icon d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" size={40} color="#d1dbe8" />
              <p style={{ marginTop: "12px", fontSize: "14px" }}>No records found</p>
            </div>
          ) : (
            <table className="marks-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((rec, i) => {
                  const cfg = STATUS_CONFIG[rec.status] || STATUS_CONFIG.Present;
                  const d = new Date(rec.date);
                  const dayName = isNaN(d) ? "—" : d.toLocaleDateString("en-US", { weekday: "long" });
                  return (
                    <tr key={i}>
                      <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{i + 1}</td>
                      <td className="subject-col">{rec.date}</td>
                      <td className="component-col">{dayName}</td>
                      <td>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "5px",
                          padding: "3px 12px", borderRadius: "20px",
                          background: cfg.bg, color: cfg.color,
                          fontSize: "12px", fontWeight: 800,
                        }}>
                          <Icon d={cfg.icon} size={11} color={cfg.color} />
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </main>

      <style>{`
        .att-summary-grid {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .att-summary-grid { grid-template-columns: 1fr; }
        }
        .att-stat-cards {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
        .att-stat-card {
          background: var(--card-bg); border: 1.5px solid var(--border);
          border-radius: 14px; padding: 16px 18px;
          display: flex; align-items: center; gap: 14px;
        }
        /* Reuse filter btn styles from Announcements via global CSS or inline */
        .ann-filter-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 6px 14px; border-radius: 20px;
          border: 1.5px solid var(--border);
          background: var(--bg-main); color: var(--text-secondary);
          font-size: 12.5px; font-weight: 700; cursor: pointer; transition: all 0.15s;
          font-family: inherit;
        }
        .ann-filter-btn:hover { border-color: #2db87b; color: #2db87b; }
        .ann-filter-btn.active { background: #2db87b; color: #fff; border-color: #2db87b; }
      `}</style>
    </div>
  );
}

export default Attendance;