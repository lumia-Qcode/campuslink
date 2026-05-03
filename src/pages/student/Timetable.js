import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { fetchTimetable } from "../../services/studentApi";

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

function SubjectIcon({ name }) {
  const icons = {
    "Computer Science": "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z",
    "Mathematics":      "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    "English":          "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z",
    "Science":          "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-4m-4 0V9m4 5V9",
    "default":          "M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 0 1 .665 6.479A11.952 11.952 0 0 0 12 20.055a11.952 11.952 0 0 0-6.824-2.998 12.078 12.078 0 0 1 .665-6.479L12 14z",
  };
  return <Icon d={icons[name] || icons.default} size={15} color={getSubjectStyle(name).color} />;
}

function Timetable() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetable()
      .then(data => setSchedule(data.schedule || []))
      .catch(() => setSchedule([]))
      .finally(() => setLoading(false));
  }, []);

  const [activeDay, setActiveDay] = useState(() => {
    const today = new Date(2026, 2, 15); // Sunday, March 15 2026
    const dayMap = { 0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday" };
    const todayName = dayMap[today.getDay()];
    return DAYS.includes(todayName) ? todayName : "Monday";
  });

  const [view, setView] = useState("week"); // "week" | "day"

  // Group schedule by day
  const byDay = DAYS.reduce((acc, d) => {
    acc[d] = schedule.filter(s => s.day === d);
    return acc;
  }, {});

  // Get unique periods/times
  const allTimes = [...new Set(schedule.map(s => s.time || s.period))].filter(Boolean);

  // Today (Monday since today is Sunday, first school day)
  const todaySchedule = byDay[activeDay] || [];

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">

        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-greeting" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg,#9b6dff,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" size={18} color="#fff" />
            </div>
            <span>Timetable</span>
            <span style={{ background: "#f0f0ff", color: "#9b6dff", padding: "2px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 800, marginLeft: "4px" }}>
              Class 10-A
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {["week", "day"].map(v => (
              <button key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "6px 16px", borderRadius: "8px", border: "1.5px solid var(--border)",
                  background: view === v ? "#9b6dff" : "var(--bg-main)",
                  color: view === v ? "#fff" : "var(--text-secondary)",
                  fontSize: "12.5px", fontWeight: 700, cursor: "pointer",
                  fontFamily: "inherit", transition: "all 0.15s",
                  textTransform: "capitalize",
                }}
              >
                {v === "week" ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Icon d="M4 6h16M4 10h16M4 14h16M4 18h16" size={12} color={view === v ? "#fff" : "var(--text-secondary)"} />
                    Week
                  </span>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={12} color={view === v ? "#fff" : "var(--text-secondary)"} />
                    Day
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Day Picker */}
        <div className="tt-day-strip">
          {DAYS.map(day => {
            const count = (byDay[day] || []).length;
            const isActive = activeDay === day;
            return (
              <button key={day} className={`tt-day-btn ${isActive ? "active" : ""}`}
                onClick={() => setActiveDay(day)}>
                <span className="tt-day-short">{DAY_SHORT[day]}</span>
                <span className="tt-day-full">{day}</span>
                {count > 0 && (
                  <span className="tt-day-count" style={{ background: isActive ? "rgba(255,255,255,0.25)" : "var(--border)", color: isActive ? "#fff" : "var(--text-muted)" }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {view === "day" ? (
          /* Day View */
          <div className="tt-day-view">
            <div style={{ marginBottom: "12px", fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
              {activeDay}'s Schedule
              <span style={{ color: "var(--text-muted)", fontWeight: 600, fontSize: "13px", marginLeft: "8px" }}>
                · {todaySchedule.length} period{todaySchedule.length !== 1 ? "s" : ""}
              </span>
            </div>
            {todaySchedule.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
                <Icon d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" size={40} color="#d1dbe8" />
                <p style={{ marginTop: "12px", fontSize: "14px" }}>No classes scheduled</p>
              </div>
            ) : (
              <div className="tt-period-list">
                {todaySchedule.map((item, i) => {
                  const style = getSubjectStyle(item.subject);
                  return (
                    <div key={i} className="tt-period-card" style={{ borderLeft: `4px solid ${style.color}`, animationDelay: `${i * 60}ms` }}>
                      <div className="tt-period-num" style={{ background: style.bg, color: style.color }}>
                        {item.period || item.time || `P${i + 1}`}
                      </div>
                      <div className="tt-period-body">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: 28, height: 28, borderRadius: "8px", background: style.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <SubjectIcon name={item.subject} />
                          </div>
                          <span className="tt-period-subject">{item.subject}</span>
                        </div>
                        {item.teacher && (
                          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                            <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={12} color="#9aaabb" />
                            {item.teacher}
                          </span>
                        )}
                        {item.room && (
                          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                            <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" size={12} color="#9aaabb" />
                            Room {item.room}
                          </span>
                        )}
                      </div>
                      {item.time && (
                        <div style={{ fontSize: "12px", fontWeight: 800, color: style.color, background: style.bg, padding: "4px 10px", borderRadius: "8px", whiteSpace: "nowrap" }}>
                          {item.time}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Week Grid View */
          <div className="card" style={{ overflowX: "auto" }}>
            <div className="card-header" style={{ marginBottom: "16px" }}>
              <div className="card-title">
                <div className="card-title-icon icon-purple">
                  <Icon d="M4 6h16M4 10h16M4 14h16M4 18h16" size={15} color="#9b6dff" />
                </div>
                Weekly Overview
              </div>
              <span style={{ fontSize: "12.5px", color: "var(--text-muted)", fontWeight: 600 }}>Spring 2026</span>
            </div>

            <div className="tt-week-grid" style={{ gridTemplateColumns: `auto repeat(${DAYS.length}, 1fr)` }}>
              {/* Header */}
              <div className="tt-grid-cell tt-grid-header tt-time-col"></div>
              {DAYS.map(d => (
                <div key={d} className={`tt-grid-cell tt-grid-header ${d === activeDay ? "tt-active-col-header" : ""}`}>
                  <span className="tt-day-short">{DAY_SHORT[d]}</span>
                  <span className="tt-day-full-grid">{d}</span>
                </div>
              ))}

              {/* Rows by period */}
              {(() => {
                const allPeriods = [...new Set(schedule.map((s, i) => s.period || s.time || `P${i + 1}`))];
                const maxPeriods = Math.max(...DAYS.map(d => (byDay[d] || []).length), 1);
                const periodRange = Array.from({ length: maxPeriods }, (_, i) => i);

                return periodRange.map(pi => (
                  <React.Fragment key={pi}>
                    <div className="tt-grid-cell tt-time-col">
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>
                        {allPeriods[pi] || `P${pi + 1}`}
                      </span>
                    </div>
                    {DAYS.map(d => {
                      const item = (byDay[d] || [])[pi];
                      const style = item ? getSubjectStyle(item.subject) : null;
                      return (
                        <div key={d} className={`tt-grid-cell ${d === activeDay ? "tt-active-col" : ""}`}>
                          {item ? (
                            <div className="tt-week-cell-item" style={{ background: style.bg, borderLeft: `3px solid ${style.color}` }}>
                              <span style={{ fontSize: "12px", fontWeight: 800, color: style.color }}>{item.subject}</span>
                              {item.teacher && <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600, marginTop: "2px" }}>{item.teacher}</span>}
                            </div>
                          ) : (
                            <div className="tt-week-cell-empty">—</div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ));
              })()}
            </div>

            {/* Legend */}
            <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {[...new Set(schedule.map(s => s.subject))].map((sub, i) => {
                const s = getSubjectStyle(sub);
                return (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "20px", background: s.bg, color: s.color, fontSize: "12px", fontWeight: 700 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block" }} />
                    {sub}
                  </span>
                );
              })}
            </div>
          </div>
        )}

      </main>

      <style>{`
        .tt-day-strip {
          display: flex; gap: 8px; overflow-x: auto;
          padding: 4px 2px 8px; margin-bottom: 4px;
          scrollbar-width: none;
        }
        .tt-day-strip::-webkit-scrollbar { display: none; }

        .tt-day-btn {
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          padding: 10px 18px; border-radius: 12px;
          border: 1.5px solid var(--border);
          background: var(--card-bg); color: var(--text-secondary);
          font-size: 13px; font-weight: 700; cursor: pointer;
          white-space: nowrap; transition: all 0.15s;
          font-family: inherit; flex-shrink: 0;
        }
        .tt-day-btn:hover { border-color: #9b6dff; color: #9b6dff; }
        .tt-day-btn.active { background: #9b6dff; color: #fff; border-color: #9b6dff; }
        .tt-day-short { font-size: 14px; font-weight: 800; }
        .tt-day-full  { font-size: 10px; font-weight: 600; opacity: 0.75; }
        .tt-day-count { font-size: 10px; font-weight: 800; padding: 1px 7px; border-radius: 20px; margin-top: 1px; }

        /* Day view */
        .tt-period-list { display: flex; flex-direction: column; gap: 10px; }
        .tt-period-card {
          display: flex; align-items: center; gap: 14px;
          background: var(--card-bg); border: 1.5px solid var(--border); border-radius: 12px;
          padding: 14px 16px; transition: box-shadow 0.15s, transform 0.15s;
          animation: fadeSlideUp 0.3s ease both;
        }
        .tt-period-card:hover { box-shadow: 0 4px 18px rgba(0,0,0,0.07); transform: translateY(-2px); }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

        .tt-period-num {
          min-width: 44px; text-align: center; padding: 6px 8px;
          border-radius: 8px; font-size: 12px; font-weight: 800; flex-shrink: 0;
        }
        .tt-period-body { flex: 1; display: flex; flex-direction: column; gap: 3px; }
        .tt-period-subject { font-size: 14.5px; font-weight: 800; color: var(--text-primary); }

        /* Week grid */
        .tt-week-grid {
          display: grid; gap: 0;
          border: 1.5px solid var(--border); border-radius: 12px; overflow: hidden;
        }
        .tt-grid-cell {
          padding: 10px 12px; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border);
          min-width: 80px;
        }
        .tt-grid-cell:last-child { border-right: none; }
        .tt-grid-header {
          background: var(--bg-main); font-size: 12px; font-weight: 800;
          color: var(--text-secondary); text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 1px;
        }
        .tt-active-col-header { background: #f5f3ff; color: #7c3aed; }
        .tt-active-col { background: rgba(155, 109, 255, 0.03); }
        .tt-time-col { min-width: 52px; display: flex; align-items: center; justify-content: center; background: var(--bg-main); }
        .tt-week-cell-item {
          padding: 6px 8px; border-radius: 7px;
          display: flex; flex-direction: column; gap: 1px; min-height: 44px;
        }
        .tt-week-cell-empty { color: var(--text-muted); font-size: 13px; text-align: center; padding: 14px 0; }
        .tt-day-full-grid { font-size: 10px; opacity: 0.7; font-weight: 600; }
      `}</style>
    </div>
  );
}

export default Timetable;