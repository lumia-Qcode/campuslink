import React, { useState } from "react";
import TeacherNavbar from "../../components/Teachernavbar";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../services/auth";
import {
  teacherStats,
  teacherAnnouncements,
  teacherMaterials,
  teacherTimetable,
  classStudents,
} from "../../data/teacherMockData";

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
  "Computer Science": { color: "#2db87b", bg: "#f0fdf7" },
};

// ── Mini Calendar ──
function MiniCalendar() {
  const [date, setDate] = useState(new Date(2026, 2, 1));
  const today = new Date(2026, 2, 15);

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

  const highlighted = [5, 10, 16, 23, 28];

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
            !cell.isOther && highlighted.includes(cell.day) && !isToday(cell.day, cell.isOther)
              ? "highlighted"
              : "",
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
  const today = new Date(2026, 2, 15);
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const [activeDay, setActiveDay] = useState("Mon");

  const todaySchedule = teacherTimetable.filter(t => {
    const map = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday" };
    return t.day === map[activeDay];
  });

  const tagColors = { urgent: "tag-urgent", event: "tag-event", info: "tag-info" };
  const tagLabels = { urgent: "Urgent", event: "Event", info: "Info" };

  const totalStudents = Object.values(classStudents).flat().length;
  const classes = Object.keys(classStudents);

  const initials = user?.name
    ? user.name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s*/i, "")
        .split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "TN";

  return (
    <div className="app-layout">
      <TeacherNavbar />
      <main className="main-content">

        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-greeting">
            Hello, <span>{user?.name?.split(" ").slice(-1)[0] || "Teacher"}</span>!
            <span style={{ color: "#9aaabb", fontWeight: 600, fontSize: "15px", marginLeft: "10px" }}>
              (ID: {user?.teacherId || "T-001"})
            </span>
          </div>
          <div className="topbar-date">
            <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={15} color="#2db87b" />
            {dateStr}
          </div>
        </div>

        {/* Hero Banner — green gradient */}
        <div className="hero-banner" style={{ background: "linear-gradient(135deg, #1e9e63 0%, #2db87b 60%, #4ade80 100%)" }}>
          <div className="hero-text">
            <h2>Welcome, {user?.name || "Ms. Nadia"}!</h2>
            <p>You have {todaySchedule.length} classes scheduled today. Stay organized!</p>
            <button className="hero-btn" onClick={() => navigate("/teacher/attendance")} style={{ background: "rgba(255,255,255,0.22)", border: "1.5px solid rgba(255,255,255,0.4)", color: "white" }}>
              Mark Today's Attendance
            </button>
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
              <circle cx="45" cy="45" r="45" fill="rgba(255,255,255,0.10)" />
              <path d="M25 55V38l20-13 20 13v17" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
              <rect x="33" y="42" width="10" height="13" rx="2" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
              <rect x="47" y="42" width="10" height="13" rx="2" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stat-mini-row">
          {[
            { label: "Total Students",    value: totalStudents,                        icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75", color: "#2db87b", bg: "#f0fdf7", iconClass: "icon-green"  },
            { label: "Classes Today",     value: todaySchedule.length,                 icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",                                                                                  color: "#4f8ef7", bg: "#eff6ff", iconClass: "icon-blue"   },
            { label: "Materials",         value: teacherStats.materialsUploaded,        icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z",                                      color: "#e6a800", bg: "#fffbeb", iconClass: "icon-yellow" },
            { label: "Avg Attendance",    value: `${teacherStats.averageAttendance}%`,  icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",                                                           color: "#9b6dff", bg: "#f5f3ff", iconClass: "icon-purple" },
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

            {/* Day picker */}
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
                  const s = SUBJECT_COLORS[item.subject] || { color: "#2db87b", bg: "#f0fdf7" };
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "10px", background: "var(--bg-main)", border: "1.5px solid var(--border)", borderLeft: `3px solid ${s.color}` }}>
                      <div style={{ padding: "4px 10px", borderRadius: "7px", background: s.bg, color: s.color, fontSize: "11px", fontWeight: 800, flexShrink: 0 }}>{item.time}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>{item.subject}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>Class {item.class} · {item.room}</div>
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
            {teacherAnnouncements.slice(0, 3).map((a, i) => (
              <div key={i} style={{ padding: "11px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span className={`tag ${tagColors[a.tag]}`}>{tagLabels[a.tag]}</span>
                  <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600, marginLeft: "auto" }}>{a.date}</span>
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
              {classes.map((cls, i) => {
                const students = classStudents[cls] || [];
                return (
                  <div key={cls} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 14px", borderRadius: "12px", background: "var(--bg-main)", border: "1.5px solid var(--border)" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "12px", background: "#f0fdf7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "14px", fontWeight: 900, color: "#2db87b" }}>
                        {cls.replace("-", "")}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>Class {cls}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>{students.length} students</div>
                    </div>
                    <div style={{ display: "flex" }}>
                      {students.slice(0, 4).map((_, si) => (
                        <div key={si} style={{ width: 24, height: 24, borderRadius: "50%", background: "#2db87b33", border: "2px solid #2db87b55", marginLeft: si > 0 ? "-6px" : 0 }} />
                      ))}
                      {students.length > 4 && <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#e4eaf0", border: "2px solid #fff", marginLeft: "-6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 800, color: "var(--text-muted)" }}>+{students.length - 4}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Materials */}
          <div className="card card-alt">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon icon-green">
                  <Icon d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" size={15} color="#2db87b" />
                </div>
                Recent Uploads
              </div>
              <span className="card-link" style={{ color: "#2db87b" }} onClick={() => navigate("/teacher/materials")}>Upload New</span>
            </div>
            {teacherMaterials.slice(0, 4).map((m, i) => {
              const typeColors = { PDF: "#ff5c5c", PPT: "#f5c842", DOCX: "#2db87b" };
              const tc = typeColors[m.type] || "#9b6dff";
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "10px", background: tc + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "9px", fontWeight: 900, color: tc }}>{m.type}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.title}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>{m.class} · {m.date}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="dashboard-grid-three">

          {/* Profile Card */}
          <div className="profile-panel" style={{ borderTop: "3px solid #2db87b" }}>
            <div className="profile-avatar-wrap">
              <div className="profile-avatar" style={{ background: "linear-gradient(135deg, #2db87b, #1e9e63)" }}>{initials}</div>
              <div className="profile-name">{user?.name || "Ms. Nadia Hussain"}</div>
              <div className="profile-class" style={{ color: "#2db87b" }}>{user?.department || "Science & Technology"}</div>
              <div className="profile-id-chip" style={{ background: "#f0fdf7", color: "#2db87b" }}>
                <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={12} color="#2db87b" />
                ID: {user?.teacherId || "T-001"}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "Email",    value: user?.email || "teacher@test.com" },
                { label: "Classes",  value: (user?.classes || ["10-A", "10-B", "9-A"]).join(", ") },
                { label: "Session",  value: "2025–2026" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: "var(--text-primary)", maxWidth: "140px", textAlign: "right", wordBreak: "break-word" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Calendar */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon icon-green">
                  <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={15} color="#2db87b" />
                </div>
                Academic Calendar
              </div>
            </div>
            <MiniCalendar />
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: "16px" }}>
              <div className="card-title">
                <div className="card-title-icon icon-green">
                  <Icon d="M13 10V3L4 14h7v7l9-11h-7z" size={15} color="#2db87b" />
                </div>
                Quick Actions
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
              {[
                { label: "Mark Attendance",  path: "/teacher/attendance",   icon: "M9 11l3 3L22 4",                                    color: "#2db87b", bg: "#f0fdf7" },
                { label: "Enter Marks",      path: "/teacher/marks",        icon: "M14 2H6a2 2 0 0 0-2 2v16h16V8z",                    color: "#4f8ef7", bg: "#eff6ff" },
                { label: "Upload Material",  path: "/teacher/materials",    icon: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12", color: "#e6a800", bg: "#fffbeb" },
                { label: "Announcements",    path: "/teacher/announcements",icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9",        color: "#9b6dff", bg: "#f5f3ff" },
                { label: "My Timetable",     path: "/teacher/timetable",    icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01", color: "#f97316", bg: "#fff7ed" },
                { label: "My Students",      path: "/teacher/students",     icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0-4 4v2",            color: "#2db87b", bg: "#f0fdf7" },
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