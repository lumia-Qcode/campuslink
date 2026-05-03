import React, { useState, useEffect } from "react";
import TeacherNavbar from "../../components/Teachernavbar";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../services/auth";
import { fetchTeacherDashboard, fetchTeacherTimetable } from "../../services/teacherApi";

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const CAL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SUBJECT_COLORS = {
  "Mathematics":      { color: "#2db87b", bg: "#f0fdf7" },
  "Computer Science": { color: "#4f8ef7", bg: "#eff6ff" },
};

function getSubjectColor(subject) {
  return SUBJECT_COLORS[subject] || { color: "#2db87b", bg: "#f0fdf7" };
}

function MiniCalendar() {
  const [date, setDate] = useState(new Date());
  const today = new Date();

  const year = date.getFullYear();
  const month = date.getMonth();
  const monthName = date.toLocaleString("default", { month: "long" });

  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = offset - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, isOther: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, isOther: false });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, isOther: true });

  const isToday = (d, isOther) =>
    !isOther && d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="mini-calendar">
      <div className="cal-header">
        <button className="cal-nav-btn" onClick={() => setDate(new Date(year, month - 1, 1))}>
          <Icon d="M15 18l-6-6 6-6" size={14} />
        </button>
        <span className="cal-month">{monthName} {year}</span>
        <button className="cal-nav-btn" onClick={() => setDate(new Date(year, month + 1, 1))}>
          <Icon d="M9 18l6-6-6-6" size={14} />
        </button>
      </div>
      <div className="cal-grid">
        {CAL_DAYS.map(d => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}
        {cells.map((cell, i) => (
          <div key={i} className={[
            "cal-day",
            cell.isOther ? "other-month" : "",
            isToday(cell.day, cell.isOther) ? "today" : "",
          ].filter(Boolean).join(" ")}>
            {cell.day}
          </div>
        ))}
      </div>
    </div>
  );
}

function TeacherDashboard() {
  const user = getUser();
  const navigate = useNavigate();
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const [activeDay, setActiveDay] = useState("Mon");
  const [dashData, setDashData] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [dash, tt] = await Promise.all([
          fetchTeacherDashboard(),
          fetchTeacherTimetable(),
        ]);
        setDashData(dash);
        setTimetable(Array.isArray(tt) ? tt : (tt.entries || tt.timetable || []));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const dayMap = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday" };
  const todaySchedule = timetable.filter(t => t.day === dayMap[activeDay]);

  const tagColors = { urgent: "tag-urgent", event: "tag-event", info: "tag-info" };
  const tagLabels = { urgent: "Urgent", event: "Event", info: "Info" };

  const stats = dashData?.stats || {};
  const teacher = dashData?.teacher || {};
  const announcements = dashData?.recentAnnouncements || [];
  const classes = teacher.classes || user?.classes || [];

  const initials = (teacher.name || user?.name || "TN")
    .replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s*/i, "")
    .split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  if (loading) return (
    <div className="app-layout">
      <TeacherNavbar />
      <main className="main-content">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 16 }}>
          <div style={{ width: 40, height: 40, border: "3px solid #2db87b", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Loading dashboard…</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    </div>
  );

  if (error) return (
    <div className="app-layout">
      <TeacherNavbar />
      <main className="main-content">
        <div style={{ padding: 32, color: "#e53e3e", background: "#fff5f5", borderRadius: 12, border: "1.5px solid #fca5a5", margin: 24 }}>
          Failed to load dashboard: {error}
        </div>
      </main>
    </div>
  );

  return (
    <div className="app-layout">
      <TeacherNavbar />
      <main className="main-content">

        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-greeting">
            Hello, <span>{(teacher.name || user?.name || "Teacher").split(" ").slice(-1)[0]}</span>!
            <span style={{ color: "#9aaabb", fontWeight: 600, fontSize: "15px", marginLeft: "10px" }}>
              (ID: {teacher.teacherId || user?.teacherId || "—"})
            </span>
          </div>
          <div className="topbar-date">
            <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={15} color="#2db87b" />
            {dateStr}
          </div>
        </div>

        {/* Hero Banner */}
        <div className="hero-banner" style={{ background: "linear-gradient(135deg, #1e9e63 0%, #2db87b 60%, #4ade80 100%)" }}>
          <div className="hero-text">
            <h2>Welcome, {teacher.name || user?.name || "Teacher"}!</h2>
            <p>You have {todaySchedule.length} classes scheduled today. Stay organized!</p>
            <button className="hero-btn" onClick={() => navigate("/teacher/attendance")} style={{ background: "rgba(255,255,255,0.22)", border: "1.5px solid rgba(255,255,255,0.4)", color: "white" }}>
              Mark Today's Attendance
            </button>
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
              <circle cx="45" cy="45" r="45" fill="rgba(255,255,255,0.10)" />
              <path d="M25 55V38l20-13 20 13v17" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
              <rect x="33" y="42" width="10" height="13" rx="2" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
              <rect x="47" y="42" width="10" height="13" rx="2" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stat-mini-row">
          {[
            { label: "Total Students", value: stats.totalStudents ?? "—", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75", color: "#2db87b", bg: "#f0fdf7", iconClass: "icon-green" },
            { label: "Classes Today",  value: todaySchedule.length,       icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",                                                                                  color: "#4f8ef7", bg: "#eff6ff", iconClass: "icon-blue"   },
            { label: "My Classes",     value: stats.totalClasses ?? classes.length ?? "—", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",                                                              color: "#e6a800", bg: "#fffbeb", iconClass: "icon-yellow" },
            { label: "Subjects",       value: stats.totalSubjects ?? (teacher.subjects || []).length ?? "—", icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z", color: "#9b6dff", bg: "#f5f3ff", iconClass: "icon-purple" },
          ].map((s, i) => (
            <div key={i} className="stat-mini">
              <div className={`stat-mini-icon ${s.iconClass}`} style={{ background: s.bg }}>
                <Icon d={s.icon} size={20} color={s.color} />
              </div>
              <div>
                <div className="stat-mini-label">{s.label}</div>
                <div className="stat-mini-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main 2-col Grid */}
        <div className="dashboard-grid-two">

          {/* Today's Schedule */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon icon-green">
                  <Icon d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" size={15} color="#2db87b" />
                </div>
                Today's Schedule
              </div>
              <span className="card-link" style={{ color: "#2db87b" }} onClick={() => navigate("/teacher/timetable")}>Full Timetable</span>
            </div>

            <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
              {DAYS.map(d => (
                <button key={d} onClick={() => setActiveDay(d)}
                  style={{
                    padding: "5px 12px", borderRadius: "8px", border: "1.5px solid",
                    borderColor: activeDay === d ? "#2db87b" : "var(--border)",
                    background: activeDay === d ? "#2db87b" : "var(--bg-main)",
                    color: activeDay === d ? "#fff" : "var(--text-secondary)",
                    fontWeight: 700, fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
                  }}>{d}</button>
              ))}
            </div>

            {todaySchedule.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px", color: "var(--text-muted)", fontSize: "13px" }}>
                No classes on this day
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {todaySchedule.map((item, i) => {
                  const s = getSubjectColor(item.subject);
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "10px", background: "var(--bg-main)", border: "1.5px solid var(--border)", borderLeft: `3px solid ${s.color}` }}>
                      <div style={{ padding: "4px 10px", borderRadius: "7px", background: s.bg, color: s.color, fontSize: "11px", fontWeight: 800, flexShrink: 0 }}>{item.time}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>{item.subject}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                          Class {item.class || `${item.classLevel}-${item.section}`} · {item.room}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Announcements */}
          <div className="card card-alt">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon icon-green">
                  <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={15} color="#2db87b" />
                </div>
                Recent Announcements
              </div>
              <span className="card-link" style={{ color: "#2db87b" }} onClick={() => navigate("/teacher/announcements")}>See All</span>
            </div>
            {announcements.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px", color: "var(--text-muted)", fontSize: "13px" }}>No announcements yet</div>
            ) : announcements.slice(0, 3).map((a, i) => (
              <div key={i} style={{ padding: "11px 0", borderBottom: i < Math.min(announcements.length, 3) - 1 ? "1px solid var(--border)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span className={`tag ${tagColors[a.tag] || "tag-info"}`}>{tagLabels[a.tag] || a.tag}</span>
                  <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600, marginLeft: "auto" }}>
                    {a.date ? new Date(a.date).toLocaleDateString("en-US", { day: "numeric", month: "short" }) : ""}
                  </span>
                </div>
                <div style={{ fontSize: "13.5px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "3px" }}>{a.title}</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{a.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Second 2-col row */}
        <div className="dashboard-grid-two">

          {/* My Classes */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: "16px" }}>
              <div className="card-title">
                <div className="card-title-icon icon-green">
                  <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={15} color="#2db87b" />
                </div>
                My Classes
              </div>
              <span className="card-link" style={{ color: "#2db87b" }} onClick={() => navigate("/teacher/students")}>View All Students</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {classes.length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: "13px", textAlign: "center", padding: "16px" }}>No classes assigned</div>
              ) : classes.map((cls) => (
                <div key={cls} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 14px", borderRadius: "12px", background: "var(--bg-main)", border: "1.5px solid var(--border)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "12px", background: "#f0fdf7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "14px", fontWeight: 900, color: "#2db87b" }}>{cls.replace("-", "")}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>Class {cls}</div>
                  </div>
                  <button onClick={() => navigate(`/teacher/students?class=${cls}`)}
                    style={{ padding: "4px 12px", borderRadius: "8px", border: "1.5px solid #bbf7d0", background: "#f0fdf7", color: "#2db87b", fontWeight: 700, fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Card */}
          <div className="profile-panel" style={{ borderTop: "3px solid #2db87b" }}>
            <div className="profile-avatar-wrap">
              <div className="profile-avatar" style={{ background: "linear-gradient(135deg, #2db87b, #1e9e63)" }}>{initials}</div>
              <div className="profile-name">{teacher.name || user?.name || "Teacher"}</div>
              <div className="profile-class" style={{ color: "#2db87b" }}>{teacher.department || user?.department || "—"}</div>
              <div className="profile-id-chip" style={{ background: "#f0fdf7", color: "#2db87b" }}>
                <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={12} color="#2db87b" />
                ID: {teacher.teacherId || user?.teacherId || "—"}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "Email",    value: teacher.email || user?.email || "—" },
                { label: "Classes",  value: classes.join(", ") || "—" },
                { label: "Subjects", value: (teacher.subjects || user?.subjects || []).join(", ") || "—" },
                { label: "Session",  value: "2025–2026" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: "var(--text-primary)", maxWidth: "160px", textAlign: "right", wordBreak: "break-word" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="dashboard-grid-three">

          {/* Academic Calendar */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon icon-green">
                  <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={15} color="#2db87b" />
                </div>
                Calendar
              </div>
            </div>
            <MiniCalendar />
          </div>

          {/* Quick Actions */}
          <div className="card" style={{ gridColumn: "span 2" }}>
            <div className="card-header" style={{ marginBottom: "16px" }}>
              <div className="card-title">
                <div className="card-title-icon icon-green">
                  <Icon d="M13 10V3L4 14h7v7l9-11h-7z" size={15} color="#2db87b" />
                </div>
                Quick Actions
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              {[
                { label: "Mark Attendance",  path: "/teacher/attendance",   icon: "M9 11l3 3L22 4",                                    color: "#2db87b", bg: "#f0fdf7" },
                { label: "Enter Marks",      path: "/teacher/marks",        icon: "M14 2H6a2 2 0 0 0-2 2v16h16V8z",                    color: "#4f8ef7", bg: "#eff6ff" },
                { label: "Upload Material",  path: "/teacher/materials",    icon: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12", color: "#e6a800", bg: "#fffbeb" },
                { label: "Announcements",    path: "/teacher/announcements",icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9",        color: "#9b6dff", bg: "#f5f3ff" },
                { label: "My Timetable",     path: "/teacher/timetable",    icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01", color: "#f97316", bg: "#fff7ed" },
                { label: "My Students",      path: "/teacher/students",     icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",         color: "#2db87b", bg: "#f0fdf7" },
              ].map((a, i) => (
                <button key={i} onClick={() => navigate(a.path)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                    padding: "14px 8px", borderRadius: "12px", border: `1.5px solid ${a.color}22`,
                    background: a.bg, cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s",
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseOut={e => e.currentTarget.style.transform = "none"}
                >
                  <div style={{ width: 34, height: 34, borderRadius: "10px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 8px ${a.color}33` }}>
                    <Icon d={a.icon} size={17} color={a.color} />
                  </div>
                  <span style={{ fontSize: "11.5px", fontWeight: 700, color: a.color, textAlign: "center" }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

export default TeacherDashboard;