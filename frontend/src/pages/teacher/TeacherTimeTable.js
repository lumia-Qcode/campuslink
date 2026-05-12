import React, { useState, useEffect } from "react";
import TeacherNavbar from "../../components/Teachernavbar";
import { apiGetMyTeacherProfile, apiGetTeacherTimetable } from "../../services/api";

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAY_SHORT = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri" };

const SUBJECT_COLORS = {
  "Computer Science": { color: "#4f8ef7", bg: "#eff5ff" },
  "Mathematics":      { color: "#d4a017", bg: "#fdf8e1" },
  "English":          { color: "#9b6dff", bg: "#f5f3ff" },
  "Science":          { color: "#f5c842", bg: "#fffbeb" },
  "Urdu":             { color: "#ff6b6b", bg: "#fff5f5" },
  "Islamiyat":        { color: "#0ea5e9", bg: "#f0f9ff" },
  "Pakistan Studies": { color: "#e6a800", bg: "#fffbeb" },
  "Physics":          { color: "#a855f7", bg: "#faf5ff" },
  "Chemistry":        { color: "#14b8a6", bg: "#f0fdfa" },
  "Biology":          { color: "#f97316", bg: "#fff7ed" },
};

function getSubjectStyle(name) {
  return SUBJECT_COLORS[name] || { color: "#6b7280", bg: "#f9fafb" };
}

function TeacherTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [activeDay, setActiveDay] = useState("Monday");
  const [view, setView]           = useState("week");

  useEffect(() => {
    const todayIndex = new Date().getDay(); // 0=Sun
    const todayName  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][todayIndex];
    if (DAYS.includes(todayName)) setActiveDay(todayName);

    apiGetMyTeacherProfile()
      .then(res => {
        const prof = res.data;
        return apiGetTeacherTimetable(prof._id);
      })
      .then(res => setTimetable(res.data || []))
      .catch(() => setError("Failed to load timetable."))
      .finally(() => setLoading(false));
  }, []);

  const byDay = DAYS.reduce((acc, d) => {
    acc[d] = timetable.filter(t => t.day === d);
    return acc;
  }, {});

  const todaySchedule   = byDay[activeDay] || [];
  const totalPeriods    = timetable.length;
  const uniqueClasses   = [...new Set(timetable.map(t => `${t.classId}${t.section}`))];
  const uniqueSubjects  = [...new Set(timetable.map(t => t.subject))];

  return (
    <div className="app-layout">
      <TeacherNavbar />
      <main className="main-content">

        <div className="topbar">
          <div className="topbar-greeting" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg,#9b6dff,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" size={18} color="#fff" />
            </div>
            <span>My Timetable</span>
            {!loading && (
              <span style={{ background: "#f0f0ff", color: "#9b6dff", padding: "2px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 800, marginLeft: "4px" }}>
                {totalPeriods} Periods/Week
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {["week", "day"].map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: "6px 16px", borderRadius: "8px", border: "1.5px solid var(--border)", background: view === v ? "#9b6dff" : "var(--bg-main)", color: view === v ? "#fff" : "var(--text-secondary)", fontSize: "12.5px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", textTransform: "capitalize" }}>
                {v === "week" ? "Week View" : "Day View"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>Loading timetable…</div>
        ) : error ? (
          <div style={{ padding: "16px", background: "#fff5f5", borderRadius: "10px", color: "#e53e3e", fontWeight: 700 }}>{error}</div>
        ) : (
          <>
            <div className="stat-mini-row" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              {[
                { label: "Total Periods", value: totalPeriods,         color: "#9b6dff", icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" },
                { label: "Classes",       value: uniqueClasses.length, color: "#4f8ef7", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" },
                { label: "Subjects",      value: uniqueSubjects.length,color: "#2db87b", icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20" },
                { label: "Days Active",   value: DAYS.filter(d => (byDay[d] || []).length > 0).length, color: "#f97316", icon: "M8 2v4M16 2v4M3 10h18" },
              ].map((s, i) => (
                <div key={i} className="stat-mini">
                  <div className="stat-mini-icon" style={{ background: s.color + "15" }}>
                    <Icon d={s.icon} size={20} color={s.color} />
                  </div>
                  <div>
                    <div className="stat-mini-label">{s.label}</div>
                    <div className="stat-mini-value" style={{ color: s.color }}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Day strip */}
            <div className="tt-day-strip">
              {DAYS.map(day => {
                const count    = (byDay[day] || []).length;
                const isActive = activeDay === day;
                return (
                  <button key={day} className={`tt-day-btn teacher-tt-btn ${isActive ? "teacher-tt-active" : ""}`}
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

            {/* Day view */}
            {view === "day" ? (
              <div className="tt-day-view">
                <div style={{ marginBottom: "12px", fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {activeDay}'s Classes
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
                      const s  = getSubjectStyle(item.subject);
                      return (
                        <div key={i} className="tt-period-card" style={{ borderLeft: `4px solid ${s.color}`, animationDelay: `${i * 60}ms` }}>
                          <div className="tt-period-num" style={{ background: s.bg, color: s.color, minWidth: 90 }}>
                            {item.time || item.period}
                          </div>
                          <div className="tt-period-body">
                            <div className="tt-period-subject">{item.subject}</div>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "3px" }}>
                              <span style={{ padding: "2px 10px", borderRadius: "8px", background: s.color + "20", color: s.color, fontSize: "12px", fontWeight: 800 }}>
                                Class {item.classId}{item.section}
                              </span>
                              {item.room && (
                                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                                  📍 {item.room}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Week view */
              <div className="card" style={{ overflowX: "auto" }}>
                <div className="card-header" style={{ marginBottom: "16px" }}>
                  <div className="card-title">
                    <div className="card-title-icon icon-purple">
                      <Icon d="M4 6h16M4 10h16M4 14h16M4 18h16" size={15} color="#9b6dff" />
                    </div>
                    Weekly Overview
                  </div>
                </div>

                {/* Subject legend */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
                  {uniqueSubjects.map((sub, i) => {
                    const s = getSubjectStyle(sub);
                    return (
                      <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "20px", background: s.bg, color: s.color, fontSize: "12px", fontWeight: 700 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block" }} />
                        {sub}
                      </span>
                    );
                  })}
                </div>

                <div className="tt-week-grid" style={{ gridTemplateColumns: `90px repeat(${DAYS.length}, 1fr)` }}>
                  {/* Header */}
                  <div className="tt-grid-cell tt-grid-header tt-time-col"></div>
                  {DAYS.map(d => (
                    <div key={d} className={`tt-grid-cell tt-grid-header ${d === activeDay ? "tt-active-col-header" : ""}`}>
                      <span className="tt-day-short">{DAY_SHORT[d]}</span>
                      <span className="tt-day-full-grid">{d}</span>
                      <span style={{ fontSize: "10px", color: d === activeDay ? "#7c3aed" : "var(--text-muted)", fontWeight: 700 }}>
                        {(byDay[d] || []).length} classes
                      </span>
                    </div>
                  ))}

                  {/* Rows */}
                  {(() => {
                    const maxPeriods = Math.max(...DAYS.map(d => (byDay[d] || []).length), 1);
                    return Array.from({ length: maxPeriods }, (_, pi) => (
                      <React.Fragment key={pi}>
                        <div className="tt-grid-cell tt-time-col">
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textAlign: "center" }}>P{pi + 1}</span>
                        </div>
                        {DAYS.map(d => {
                          const item = (byDay[d] || [])[pi];
                          const s    = item ? getSubjectStyle(item.subject) : null;
                          return (
                            <div key={d} className={`tt-grid-cell ${d === activeDay ? "tt-active-col" : ""}`}>
                              {item ? (
                                <div className="tt-week-cell-item" style={{ background: s.bg, borderLeft: `3px solid ${s.color}` }}>
                                  <div style={{ fontSize: "12px", fontWeight: 800, color: s.color }}>{item.subject}</div>
                                  <div style={{ fontSize: "10px", fontWeight: 700, color: s.color, marginTop: "2px", opacity: 0.8 }}>
                                    {item.classId}{item.section}
                                  </div>
                                  <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600 }}>
                                    {item.time || item.period}
                                  </div>
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
              </div>
            )}
          </>
        )}
      </main>

      <style>{`
        .tt-day-strip { display: flex; gap: 8px; overflow-x: auto; padding: 4px 2px 8px; margin-bottom: 4px; scrollbar-width: none; }
        .tt-day-strip::-webkit-scrollbar { display: none; }
        .tt-day-btn { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 10px 18px; border-radius: 12px; border: 1.5px solid var(--border); background: var(--card-bg); color: var(--text-secondary); font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.15s; font-family: inherit; flex-shrink: 0; }
        .teacher-tt-btn:hover { border-color: #9b6dff; color: #9b6dff; }
        .teacher-tt-active { background: #9b6dff !important; color: #fff !important; border-color: #9b6dff !important; }
        .tt-day-short { font-size: 14px; font-weight: 800; }
        .tt-day-full  { font-size: 10px; font-weight: 600; opacity: 0.75; }
        .tt-day-count { font-size: 10px; font-weight: 800; padding: 1px 7px; border-radius: 20px; margin-top: 1px; }
        .tt-period-list { display: flex; flex-direction: column; gap: 10px; }
        .tt-period-card { display: flex; align-items: center; gap: 14px; background: var(--card-bg); border: 1.5px solid var(--border); border-radius: 12px; padding: 14px 16px; transition: box-shadow 0.15s, transform 0.15s; animation: fadeSlideUp 0.3s ease both; }
        .tt-period-card:hover { box-shadow: 0 4px 18px rgba(0,0,0,0.07); transform: translateY(-2px); }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .tt-period-num { min-width: 44px; text-align: center; padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; flex-shrink: 0; }
        .tt-period-body { flex: 1; display: flex; flex-direction: column; gap: 3px; }
        .tt-period-subject { font-size: 14.5px; font-weight: 800; color: var(--text-primary); }
        .tt-week-grid { display: grid; gap: 0; border: 1.5px solid var(--border); border-radius: 12px; overflow: hidden; }
        .tt-grid-cell { padding: 10px 12px; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); min-width: 80px; }
        .tt-grid-cell:last-child { border-right: none; }
        .tt-grid-header { background: var(--bg-main); font-size: 12px; font-weight: 800; color: var(--text-secondary); text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1px; }
        .tt-active-col-header { background: #f5f3ff; color: #7c3aed; }
        .tt-active-col { background: rgba(155,109,255,0.03); }
        .tt-time-col { min-width: 52px; display: flex; align-items: center; justify-content: center; background: var(--bg-main); }
        .tt-week-cell-item { padding: 6px 8px; border-radius: 7px; display: flex; flex-direction: column; gap: 1px; min-height: 52px; }
        .tt-week-cell-empty { color: var(--text-muted); font-size: 13px; text-align: center; padding: 14px 0; }
        .tt-day-full-grid { font-size: 10px; opacity: 0.7; font-weight: 600; }
        .tt-day-view { margin-top: 4px; }
        .icon-purple { background: #f5f3ff; }
      `}</style>
    </div>
  );
}

export default TeacherTimetable;
