import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { apiStudentGetTimetable } from "../../services/api";

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat" };

const SUBJECT_COLORS = {
  "Computer Science": { color: "#4f8ef7", bg: "#eff5ff", light: "#dbeafe" },
  "Mathematics":      { color: "#2db87b", bg: "#f0fdf7", light: "#d1fae5" },
  "English":          { color: "#9b6dff", bg: "#f5f3ff", light: "#ede9fe" },
  "Science":          { color: "#f5c842", bg: "#fffbeb", light: "#fef3c7" },
  "Urdu":             { color: "#ff6b6b", bg: "#fff5f5", light: "#fee2e2" },
  "Islamiyat":        { color: "#0ea5e9", bg: "#f0f9ff", light: "#e0f2fe" },
  "Pakistan Studies": { color: "#e6a800", bg: "#fffbeb", light: "#fef9c3" },
  "Physics":          { color: "#a855f7", bg: "#faf5ff", light: "#f3e8ff" },
  "Chemistry":        { color: "#14b8a6", bg: "#f0fdfa", light: "#ccfbf1" },
  "Biology":          { color: "#f97316", bg: "#fff7ed", light: "#fed7aa" },
};

function getSubjectStyle(name) {
  return SUBJECT_COLORS[name] || { color: "#6b7280", bg: "#f9fafb", light: "#f3f4f6" };
}

function Timetable() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [activeDay, setActiveDay] = useState("Monday");
  const [view, setView]         = useState("week");

  useEffect(() => {
    apiStudentGetTimetable()
      .then(res => {
        setSchedule(res.data || []);
        setLoading(false);
        // set today's day as default
        const dayMap = { 0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday" };
        const todayName = dayMap[new Date().getDay()];
        if (DAYS.includes(todayName)) setActiveDay(todayName);
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
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)" }}>Loading timetable…</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-layout"><Navbar />
        <main className="main-content">
          <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ color: "#e53e3e" }}>Failed to load timetable</div>
            <div style={{ color: "var(--text-muted)", fontSize: 14 }}>{error}</div>
          </div>
        </main>
      </div>
    );
  }

  if (!schedule.length) {
    return (
      <div className="app-layout"><Navbar />
        <main className="main-content">
          <div className="card" style={{ textAlign: "center", padding: "64px 24px" }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>No Timetable Yet</div>
            <div style={{ color: "var(--text-muted)", marginTop: 8 }}>The admin hasn't set up a timetable for your class.</div>
          </div>
        </main>
      </div>
    );
  }

  // Group by day; each entry has: day, period, subject, teacherId (populated with name), room
  const byDay = DAYS.reduce((acc, d) => {
    acc[d] = schedule
      .filter(e => e.day === d)
      .sort((a, b) => (a.period || "").localeCompare(b.period || ""));
    return acc;
  }, {});

  const todayEntries = byDay[activeDay] || [];

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-greeting" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg,#0ea5e9,#0284c7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={18} color="#fff" />
            </div>
            <span>Timetable</span>
            <span style={{ color: "#9aaabb", fontWeight: 500, fontSize: "14px" }}>· Class Schedule</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["week", "day"].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={view === v ? "filter-chip active" : "filter-chip"}
                style={{ textTransform: "capitalize", cursor: "pointer" }}>{v}</button>
            ))}
          </div>
        </div>

        <div className="page-wrapper">
          {/* Day tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {DAYS.map(d => {
              const count = (byDay[d] || []).length;
              return (
                <button key={d} onClick={() => setActiveDay(d)}
                  className={activeDay === d ? "filter-chip active" : "filter-chip"}
                  style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  {DAY_SHORT[d]}
                  {count > 0 && (
                    <span style={{ background: activeDay === d ? "rgba(255,255,255,0.25)" : "var(--bg-secondary)",
                      borderRadius: 99, fontSize: 11, padding: "0 6px", fontWeight: 700 }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {view === "day" ? (
            // Day view
            <div className="card">
              <div className="section-label" style={{ marginBottom: 14 }}>{activeDay}</div>
              {todayEntries.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>No classes on {activeDay}.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {todayEntries.map((e, i) => {
                    const s = getSubjectStyle(e.subject);
                    return (
                      <div key={i} style={{ display: "flex", gap: 14, padding: "14px 16px", borderRadius: 12, background: s.bg, border: `1.5px solid ${s.light}` }}>
                        <div style={{ width: 4, borderRadius: 99, background: s.color, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{e.subject}</div>
                          <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>
                            {e.period}
                            {e.teacherId?.name ? ` · ${e.teacherId.name}` : ""}
                            {e.room ? ` · Room ${e.room}` : ""}
                          </div>
                        </div>
                        <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, background: "#fff", color: s.color, alignSelf: "center" }}>
                          {e.period}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            // Week view grid
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {DAYS.map(d => (
                <div key={d} className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: 14,
                    background: activeDay === d ? "linear-gradient(135deg,#4f8ef7,#3b7de8)" : "transparent",
                    color: activeDay === d ? "#fff" : "var(--text-primary)" }}>
                    {d}
                    <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>{(byDay[d] || []).length} classes</span>
                  </div>
                  <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 8 }}>
                    {(byDay[d] || []).length === 0 ? (
                      <div style={{ textAlign: "center", padding: "16px 8px", color: "var(--text-muted)", fontSize: 13 }}>No classes</div>
                    ) : (byDay[d] || []).map((e, i) => {
                      const s = getSubjectStyle(e.subject);
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: s.bg }}>
                          <div style={{ width: 3, height: "100%", minHeight: 32, borderRadius: 99, background: s.color, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.subject}</div>
                            <div style={{ color: "var(--text-muted)", fontSize: 11 }}>{e.period}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Timetable;
