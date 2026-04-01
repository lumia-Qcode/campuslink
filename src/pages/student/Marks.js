import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import { marks } from "../../data/mockData";

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

function RadialProgress({ pct, size = 56, stroke = 5, color }) {
  const r = size / 2 - stroke / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e4eaf0" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.2, fontWeight: 900, color: "var(--text-primary)" }}>
        {pct}%
      </div>
    </div>
  );
}

function getGrade(pct) {
  if (pct >= 90) return { grade: "A+", color: "#2db87b", bg: "#f0fdf7", badgeClass: "badge-green" };
  if (pct >= 80) return { grade: "A",  color: "#2db87b", bg: "#f0fdf7", badgeClass: "badge-green" };
  if (pct >= 70) return { grade: "B",  color: "#4f8ef7", bg: "#eff5ff", badgeClass: "badge-blue"  };
  if (pct >= 60) return { grade: "C",  color: "#e6a800", bg: "#fffbeb", badgeClass: "badge-yellow" };
  return           { grade: "D",  color: "#e53e3e", bg: "#fff5f5", badgeClass: "badge-red"    };
}

const SUBJECT_COLORS = ["#4f8ef7", "#9b6dff", "#2db87b", "#f5c842", "#ff6b6b", "#0ea5e9"];

const COMPONENTS = ["All", "MidTerm - I", "MidTerm - II", "Final", "Quiz", "Assignment"];

function Marks() {
  const studentMarks = marks.find(m => m.studentId === 1);
  const subjects = studentMarks?.subjects || [];
  const [activeComponent, setActiveComponent] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  // Group subjects
  const grouped = subjects.reduce((acc, sub) => {
    const key = sub.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(sub);
    return acc;
  }, {});

  const subjectNames = Object.keys(grouped);

  // Build per-subject aggregated average
  const subjectSummaries = subjectNames.map((name, i) => {
    const entries = grouped[name];
    const totalMarks = entries.reduce((s, e) => s + (e.marks || 0), 0);
    const totalMax   = entries.reduce((s, e) => s + (e.total || 100), 0);
    const pct = totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0;
    return { name, entries, totalMarks, totalMax, pct, color: SUBJECT_COLORS[i % SUBJECT_COLORS.length] };
  });

  // Filter rows
  const filteredSubjects = subjects.filter(s =>
    activeComponent === "All" || s.component === activeComponent
  );

  const sortedSubjects = [...filteredSubjects].sort((a, b) => {
    if (sortBy === "high") return (b.marks / b.total) - (a.marks / a.total);
    if (sortBy === "low")  return (a.marks / a.total) - (b.marks / b.total);
    return 0;
  });

  // Overall avg
  const overallPct = subjects.length
    ? Math.round(subjects.reduce((s, sub) => s + ((sub.marks / sub.total) * 100), 0) / subjects.length)
    : 0;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">

        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-greeting" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg,#4f8ef7,#3a73d4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" size={18} color="#fff" />
            </div>
            <span>Marks</span>
            <span style={{ color: "#9aaabb", fontWeight: 500, fontSize: "14px" }}>· Academic Performance</span>
          </div>
          <div className="topbar-date">
            <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={15} color="#2db87b" />
            {new Date(2026, 2, 15).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="marks-summary-row">
          <div className="card" style={{ display: "flex", alignItems: "center", gap: "18px", padding: "20px 24px" }}>
            <RadialProgress pct={overallPct} size={72} stroke={7} color={getGrade(overallPct).color} />
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, marginBottom: "2px" }}>Overall Average</div>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>{overallPct}%</div>
              <div style={{ marginTop: "4px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "2px 10px", borderRadius: "20px", background: getGrade(overallPct).bg, color: getGrade(overallPct).color, fontSize: "12px", fontWeight: 800 }}>
                  Grade {getGrade(overallPct).grade}
                </span>
              </div>
            </div>
          </div>

          {subjectSummaries.map((s, i) => {
            const g = getGrade(s.pct);
            return (
              <div key={i} className="card marks-sub-card" style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>{s.name}</span>
                  <span style={{ fontSize: "11px", fontWeight: 800, padding: "2px 9px", borderRadius: "20px", background: g.bg, color: g.color }}>{g.grade}</span>
                </div>
                <div style={{ fontSize: "20px", fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: "8px" }}>{s.pct}%</div>
                <div style={{ height: "5px", borderRadius: "99px", background: "var(--border)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${s.pct}%`, background: s.color, borderRadius: "99px", transition: "width 1s ease" }} />
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, marginTop: "5px" }}>{s.totalMarks}/{s.totalMax} marks</div>
              </div>
            );
          })}
        </div>

        {/* Detailed Table */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: "16px" }}>
            <div className="card-title">
              <div className="card-title-icon icon-blue">
                <Icon d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" size={15} color="#4f8ef7" />
              </div>
              Detailed Results
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Sort:</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
                padding: "5px 10px", borderRadius: "8px", border: "1.5px solid var(--border)",
                background: "var(--bg-main)", color: "var(--text-primary)", fontSize: "12.5px",
                fontFamily: "inherit", fontWeight: 700, cursor: "pointer", outline: "none",
              }}>
                <option value="default">Default</option>
                <option value="high">Highest First</option>
                <option value="low">Lowest First</option>
              </select>
            </div>
          </div>

          {/* Component Filters */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
            {COMPONENTS.map(c => (
              <button key={c}
                className={`ann-filter-btn ${activeComponent === c ? "active" : ""}`}
                onClick={() => setActiveComponent(c)}
              >{c}</button>
            ))}
          </div>

          <table className="marks-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Component</th>
                <th>Score</th>
                <th>%</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {sortedSubjects.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px", fontWeight: 600 }}>No records for this filter</td></tr>
              ) : (
                sortedSubjects.map((sub, i) => {
                  const pct = Math.round((sub.marks / sub.total) * 100);
                  const g = getGrade(pct);
                  return (
                    <tr key={i} style={{ animationDelay: `${i * 40}ms` }} className="marks-row-anim">
                      <td className="subject-col">{sub.name}</td>
                      <td className="component-col">{sub.component}</td>
                      <td>
                        <span className={`marks-badge ${g.badgeClass}`}>{sub.marks}/{sub.total}</span>
                      </td>
                      <td style={{ fontWeight: 800, color: g.color }}>{pct}%</td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "20px", background: g.bg, color: g.color, fontSize: "12px", fontWeight: 800 }}>
                          {g.grade}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </main>

      <style>{`
        .marks-summary-row {
          display: grid;
          grid-template-columns: auto repeat(auto-fill, minmax(160px, 1fr));
          gap: 14px;
          align-items: start;
        }
        @media (max-width: 768px) { .marks-summary-row { grid-template-columns: 1fr 1fr; } }

        .marks-sub-card { transition: box-shadow 0.18s, transform 0.18s; }
        .marks-sub-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.07); transform: translateY(-2px); }

        @keyframes rowFadeIn { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: none; } }
        .marks-row-anim { animation: rowFadeIn 0.3s ease both; }

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

        .badge-red { background: #fff5f5; color: #e53e3e; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; }
      `}</style>
    </div>
  );
}

export default Marks;