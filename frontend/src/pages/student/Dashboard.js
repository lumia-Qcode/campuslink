import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import {
  apiStudentGetMe,
  apiStudentGetAttendance,
  apiStudentGetMarks,
  apiStudentGetFees,
  apiStudentGetAnnouncements,
  apiStudentGetTimetable,
} from "../../services/api";
import { getUser } from "../../services/auth";

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function MiniCalendar() {
  const [date, setDate] = useState(new Date());
  const today = new Date();

  const year  = date.getFullYear();
  const month = date.getMonth();
  const monthName = date.toLocaleString("default", { month: "long" });

  const firstDay  = new Date(year, month, 1).getDay();
  const offset    = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = offset - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, isOther: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, isOther: false });
  const rem = 42 - cells.length;
  for (let d = 1; d <= rem; d++) cells.push({ day: d, isOther: true });

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
        {DAYS.map(d => <div key={d} className="cal-day-header">{d}</div>)}
        {cells.map((cell, i) => (
          <div key={i} className={["cal-day", cell.isOther ? "other-month" : "", isToday(cell.day, cell.isOther) ? "today" : ""].filter(Boolean).join(" ")}>
            {cell.day}
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate  = useNavigate();
  const authUser  = getUser();

  const [profile,       setProfile]       = useState(null);
  const [attendance,    setAttendance]    = useState([]);
  const [marks,         setMarks]         = useState([]);
  const [fees,          setFees]          = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [timetable,     setTimetable]     = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    Promise.allSettled([
      apiStudentGetMe(),
      apiStudentGetAttendance(),
      apiStudentGetMarks(),
      apiStudentGetFees(),
      apiStudentGetAnnouncements(),
      apiStudentGetTimetable(),
    ]).then(([p, a, m, f, ann, tt]) => {
      if (p.status   === "fulfilled") setProfile(p.value?.data);
      if (a.status   === "fulfilled") setAttendance(a.value?.data || []);
      if (m.status   === "fulfilled") setMarks(m.value?.data || []);
      if (f.status   === "fulfilled") setFees(f.value?.data || []);
      if (ann.status === "fulfilled") setAnnouncements(ann.value?.data || []);
      if (tt.status  === "fulfilled") setTimetable(tt.value?.data || []);
      setLoading(false);
    });
  }, []);

  const displayName = profile?.name || authUser?.name || authUser?.username || "Student";
  const classInfo   = profile ? `Class ${profile.classId} · Section ${profile.section}` : "";

  // Attendance stats
  const attTotal   = attendance.length;
  const attPresent = attendance.filter(r => r.status === "Present").length;
  const attPct     = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 0;

  // Marks average
  const marksAvg = marks.length > 0
    ? Math.round(marks.reduce((s, m) => s + (m.total > 0 ? (m.marks / m.total) * 100 : 0), 0) / marks.length)
    : 0;

  // Pending fees
  const pendingFees = fees.filter(f => f.status !== "Paid");

  // Today's timetable
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayClasses = timetable
    .filter(e => e.day === todayName)
    .sort((a, b) => (a.period || "").localeCompare(b.period || ""));

  // Recent announcements
  const recentAnn = announcements.slice(0, 3);

  const SUBJECT_COLORS = {
    Mathematics: "#2db87b", English: "#9b6dff", Science: "#f5c842",
    "Computer Science": "#4f8ef7", Urdu: "#ff6b6b", Islamiyat: "#0ea5e9",
  };

  const quickLinks = [
    { label: "Attendance",    path: "/student/attendance",    icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11", color: "#2db87b", bg: "#f0fdf7" },
    { label: "Marks",         path: "/student/marks",         icon: "M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",          color: "#4f8ef7", bg: "#eff5ff" },
    { label: "Fees",          path: "/student/fees",          icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z", color: "#e6a800", bg: "#fffbeb" },
    { label: "Timetable",     path: "/student/timetable",     icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", color: "#0ea5e9", bg: "#f0f9ff" },
    { label: "Materials",     path: "/student/materials",     icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",               color: "#9b6dff", bg: "#f5f3ff" },
    { label: "Calendar",      path: "/student/calendar",      icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", color: "#f97316", bg: "#fff7ed" },
    { label: "Announcements", path: "/student/announcements", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9", color: "#e53e3e", bg: "#fff5f5" },
    { label: "Activities",    path: "/student/activities",    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",                   color: "#2db87b", bg: "#f0fdf7" },
  ];

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {/* Top bar */}
        <div className="topbar">
          <div className="topbar-greeting">
            {loading ? "Loading…" : `Welcome back, ${displayName.split(" ")[0]} 👋`}
            {classInfo && <span style={{ color: "#9aaabb", fontWeight: 500, fontSize: "14px", marginLeft: 8 }}>· {classInfo}</span>}
          </div>
          <div className="topbar-date">
            <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={15} color="#4f8ef7" />
            {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Left column */}
          <div className="dashboard-main">

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 20 }}>
              {[
                { label: "Attendance", value: `${attPct}%`, sub: `${attPresent}/${attTotal} days`, color: "#2db87b", icon: "M9 11l3 3L22 4" },
                { label: "Avg. Marks", value: `${marksAvg}%`, sub: `${marks.length} records`, color: "#4f8ef7", icon: "M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" },
                { label: "Fee Status", value: pendingFees.length === 0 ? "All Clear" : `${pendingFees.length} Due`, sub: `${fees.length} total`, color: pendingFees.length > 0 ? "#e6a800" : "#2db87b", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z" },
                { label: "Today", value: `${todayClasses.length}`, sub: "classes today", color: "#0ea5e9", icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" },
              ].map(s => (
                <div key={s.label} className="card" style={{ padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: s.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon d={s.icon} size={16} color={s.color} />
                    </div>
                    <span style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 600 }}>{s.label}</span>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 24, color: s.color }}>{loading ? "—" : s.value}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="section-label" style={{ marginBottom: 14 }}>Quick Access</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10 }}>
                {quickLinks.map(l => (
                  <button key={l.label} onClick={() => navigate(l.path)}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "14px 8px", borderRadius: 12, border: "1px solid var(--border)", background: l.bg, cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: l.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon d={l.icon} size={18} color={l.color} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", textAlign: "center" }}>{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Today's classes */}
            <div className="card">
              <div className="section-label" style={{ marginBottom: 14 }}>Today's Classes — {todayName}</div>
              {loading ? (
                <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
              ) : todayClasses.length === 0 ? (
                <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)" }}>No classes today.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {todayClasses.map((cls, i) => {
                    const color = SUBJECT_COLORS[cls.subject] || "#6b7280";
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, background: color + "10", border: `1px solid ${color}22` }}>
                        <div style={{ width: 4, height: 36, borderRadius: 99, background: color, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{cls.subject}</div>
                          <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{cls.period}{cls.teacherId?.name ? ` · ${cls.teacherId.name}` : ""}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="dashboard-side">
            {/* Mini calendar */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="section-label" style={{ marginBottom: 12 }}>Calendar</div>
              <MiniCalendar />
            </div>

            {/* Recent announcements */}
            <div className="card">
              <div className="section-label" style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Announcements</span>
                <button onClick={() => navigate("/student/announcements")}
                  style={{ background: "none", border: "none", color: "#4f8ef7", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>View all</button>
              </div>
              {loading ? (
                <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "16px 0" }}>Loading…</div>
              ) : recentAnn.length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "16px 0" }}>No announcements yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {recentAnn.map((ann, i) => {
                    const TAG_COLORS = { urgent: "#e53e3e", event: "#7c3aed", info: "#0ea5e9", notice: "#d97706", holiday: "#16a34a" };
                    const tagColor = TAG_COLORS[ann.tag] || "#0ea5e9";
                    return (
                      <div key={i} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", borderLeft: `3px solid ${tagColor}` }}>
                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{ann.title}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ann.content}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
