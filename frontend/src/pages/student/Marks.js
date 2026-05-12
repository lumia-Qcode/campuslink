import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { apiStudentGetMarks } from "../../services/api";

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
  if (pct >= 90) return { grade: "A+", color: "#2db87b", bg: "#f0fdf7" };
  if (pct >= 80) return { grade: "A",  color: "#2db87b", bg: "#f0fdf7" };
  if (pct >= 70) return { grade: "B",  color: "#4f8ef7", bg: "#eff5ff" };
  if (pct >= 60) return { grade: "C",  color: "#e6a800", bg: "#fffbeb" };
  return           { grade: "D",  color: "#e53e3e", bg: "#fff5f5" };
}

const SUBJECT_COLORS = ["#4f8ef7", "#9b6dff", "#2db87b", "#f5c842", "#ff6b6b", "#0ea5e9"];
const COMPONENTS = ["All", "MidTerm - I", "MidTerm - II", "Final", "Quiz", "Assignment"];

function Marks() {
  const [subjects, setSubjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeComponent, setActiveComponent] = useState("All");
  const [sortBy, setSortBy]       = useState("default");

  useEffect(() => {
    apiStudentGetMarks()
      .then(res => {
        setSubjects(res.data || []);
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
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)" }}>Loading marks…</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-layout"><Navbar />
        <main className="main-content">
          <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ color: "#e53e3e" }}>Failed to load marks</div>
            <div style={{ color: "var(--text-muted)", fontSize: 14 }}>{error}</div>
          </div>
        </main>
      </div>
    );
  }

  if (!subjects.length) {
    return (
      <div className="app-layout"><Navbar />
        <main className="main-content">
          <div className="card" style={{ textAlign: "center", padding: "64px 24px" }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>No Marks Yet</div>
            <div style={{ color: "var(--text-muted)", marginTop: 8 }}>Your teacher hasn't uploaded any marks yet.</div>
          </div>
        </main>
      </div>
    );
  }

  // Group records by subject name
  const grouped = subjects.reduce((acc, r) => {
    if (!acc[r.subject]) acc[r.subject] = [];
    acc[r.subject].push(r);
    return acc;
  }, {});

  const subjectNames = Object.keys(grouped);

  const subjectSummaries = subjectNames.map((name, i) => {
    const entries   = grouped[name];
    const totalM    = entries.reduce((s, e) => s + (e.marks || 0), 0);
    const totalMax  = entries.reduce((s, e) => s + (e.total || 100), 0);
    const pct       = totalMax > 0 ? Math.round((totalM / totalMax) * 100) : 0;
    return { name, entries, totalM, totalMax, pct, color: SUBJECT_COLORS[i % SUBJECT_COLORS.length] };
  });

  const filteredSubjects = subjects.filter(s =>
    activeComponent === "All" || s.component === activeComponent
  );

  const sortedSubjects = [...filteredSubjects].sort((a, b) => {
    if (sortBy === "high") return (b.marks / b.total) - (a.marks / a.total);
    if (sortBy === "low")  return (a.marks / a.total) - (b.marks / b.total);
    return 0;
  });

  const overallPct = subjectSummaries.length > 0
    ? Math.round(subjectSummaries.reduce((s, x) => s + x.pct, 0) / subjectSummaries.length)
    : 0;
  const { grade: overallGrade, color: overallColor } = getGrade(overallPct);

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-greeting" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg,#4f8ef7,#3b7de8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" size={18} color="#fff" />
            </div>
            <span>Marks</span>
            <span style={{ color: "#9aaabb", fontWeight: 500, fontSize: "14px" }}>· Academic Performance</span>
          </div>
        </div>

        <div className="page-wrapper">
          {/* Overall summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
            <div className="card" style={{ padding: "20px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 42, fontWeight: 900, color: overallColor }}>{overallGrade}</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{overallPct}% Overall</div>
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{subjectNames.length} subjects</div>
            </div>
            {subjectSummaries.map(s => {
              const { grade, color, bg } = getGrade(s.pct);
              return (
                <div key={s.name} className="card" style={{ padding: "16px", display: "flex", gap: 12, alignItems: "center" }}>
                  <RadialProgress pct={s.pct} color={s.color} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{s.totalM}/{s.totalMax}</div>
                    <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: bg, color }}>{grade}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filter + sort controls */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {COMPONENTS.map(c => (
                <button key={c} className={`filter-chip ${activeComponent === c ? "active" : ""}`}
                  onClick={() => setActiveComponent(c)} style={{ cursor: "pointer" }}>
                  {c}
                </button>
              ))}
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 13, cursor: "pointer" }}>
              <option value="default">Default order</option>
              <option value="high">Highest first</option>
              <option value="low">Lowest first</option>
            </select>
          </div>

          {/* Detailed table */}
          <div className="card">
            <div className="section-label" style={{ marginBottom: 14 }}>Detailed Records</div>
            {sortedSubjects.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-muted)" }}>No records for this component.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)" }}>
                      {["Subject", "Component", "Marks", "Total", "Percentage", "Grade"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-muted)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSubjects.map((r, i) => {
                      const pct = r.total > 0 ? Math.round((r.marks / r.total) * 100) : 0;
                      const { grade, color, bg } = getGrade(pct);
                      const color2 = SUBJECT_COLORS[subjectNames.indexOf(r.subject) % SUBJECT_COLORS.length];
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--bg-secondary)" }}>
                          <td style={{ padding: "12px", fontWeight: 700 }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                              <span style={{ width: 10, height: 10, borderRadius: "50%", background: color2, display: "inline-block" }} />
                              {r.subject}
                            </span>
                          </td>
                          <td style={{ padding: "12px", color: "var(--text-muted)" }}>{r.component}</td>
                          <td style={{ padding: "12px", fontWeight: 700 }}>{r.marks}</td>
                          <td style={{ padding: "12px", color: "var(--text-muted)" }}>{r.total}</td>
                          <td style={{ padding: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1, height: 6, borderRadius: 99, background: "var(--border)", overflow: "hidden", minWidth: 60 }}>
                                <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 1s ease" }} />
                              </div>
                              <span style={{ minWidth: 36, fontWeight: 700, fontSize: 13 }}>{pct}%</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px" }}>
                            <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700, background: bg, color }}>{grade}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Marks;
