import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import {
  announcements,
  marks,
  attendance,
  fees,
  calendar,
  classes,
  sections,
  students,
  timetable,
  activities,
  materials,
  discipline,
  progress,
} from "../../data/mockData";
import { getUser } from "../../services/auth";

// SVG icons inline
const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function MiniCalendar() {
  const [date, setDate] = useState(new Date(2026, 2, 1)); // March 2026
  const today = new Date(2026, 2, 15); // 15 March 2026 as "today"

  const year = date.getFullYear();
  const month = date.getMonth();
  const monthName = date.toLocaleString("default", { month: "long" });

  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = offset - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, isOther: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isOther: false });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, isOther: true });
  }

  const isToday = (d, isOther) =>
    !isOther &&
    d === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const highlighted = [2, 7, 19, 28, 29];

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
        {DAYS.map((d) => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}
        {cells.map((cell, i) => (
          <div
            key={i}
            className={[
              "cal-day",
              cell.isOther ? "other-month" : "",
              isToday(cell.day, cell.isOther) ? "today" : "",
              !cell.isOther && highlighted.includes(cell.day) && !isToday(cell.day, cell.isOther)
                ? "highlighted"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {cell.day}
          </div>
        ))}
      </div>
    </div>
  );
}

function AttendanceCircle({ percentage }) {
  const radius = 42;
  const stroke = 8;
  const normalizedR = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedR;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="attendance-circle">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={normalizedR} fill="none" stroke="#e4eaf0" strokeWidth={stroke} />
        <circle
          cx="50" cy="50" r={normalizedR}
          fill="none" stroke="var(--forest)" strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="attendance-circle-label">
        <div className="attendance-pct">{percentage}%</div>
        <div className="attendance-pct-label">Present</div>
      </div>
    </div>
  );
}

function Dashboard() {
  const user = getUser();
  const navigate = useNavigate();
  const studentMarks = marks.find((m) => m.studentId === 1);
  const studentAttendance = attendance.find((a) => a.studentId === 1);
  const studentFees = fees.find((f) => f.studentId === 1);

  // TC-14 / TC-F08: Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [phone, setPhone] = useState(user?.phone || "");
  const [phoneError, setPhoneError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  const handleSaveProfile = () => {
    // TC-F08: Validate phone number — must be numeric digits, 7-15 chars
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-]/g, ""))) {
      setPhoneError("Please enter a valid phone number.");
      return;
    }
    setPhoneError("");
    setEditingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };


  const tagColors = { urgent: "tag-urgent", event: "tag-event", info: "tag-info" };
  const tagLabels = { urgent: "Urgent", event: "Event", info: "Info" };

  const subjectColors = {
    Computer: "var(--sky)",
    English: "var(--plum)",
    Maths: "var(--forest)",
    Science: "var(--olive)",
  };

  const getMarkBadge = (marks, total) => {
    const pct = (marks / total) * 100;
    if (pct >= 90) return "badge-green";
    if (pct >= 70) return "badge-blue";
    return "badge-yellow";
  };

  const today = new Date(2026, 2, 15);
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "SK";

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">

        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-greeting">
            Hello, <span>{user?.name?.split(" ")[0] || "Sarah"}</span>!
            <span style={{ color: "var(--text-muted)", fontWeight: 600, fontSize: "15px", marginLeft: "10px" }}>
              (Student ID: {user?.studentId || "12345"})
            </span>
          </div>
          <div className="topbar-date">
            <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={15} color="var(--forest)" />
            {dateStr}
          </div>
        </div>

        {/* Hero Banner */}
        <div className="hero-banner">
          <div className="hero-text">
            <h2>Welcome back, {user?.name || "Sarah Khan"}!</h2>
            <p>New Computer Science lesson uploaded — explore it now.</p>
            <button className="hero-btn">Open Lesson</button>
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
              <circle cx="45" cy="45" r="45" fill="rgba(255,255,255,0.12)" />
              <path d="M45 20L62 30V50L45 60L28 50V30L45 20Z" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
              <path d="M45 30L55 36V48L45 54L35 48V36L45 30Z" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stat-mini-row">
          <div className="stat-mini">
            <div className="stat-mini-icon icon-green">
              <Icon d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" size={20} color="var(--forest)" />
            </div>
            <div>
              <div className="stat-mini-label">Attendance</div>
              <div className="stat-mini-value">{studentAttendance?.overall || 85}%</div>
            </div>
          </div>
          <div className="stat-mini">
            <div className="stat-mini-icon icon-blue">
              <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8" size={20} color="var(--sky)" />
            </div>
            <div>
              <div className="stat-mini-label">Avg. Marks</div>
              <div className="stat-mini-value">
                {studentMarks
                  ? Math.round(studentMarks.subjects.reduce((a, s) => a + (s.marks / s.total) * 100, 0) / studentMarks.subjects.length)
                  : 88}%
              </div>
            </div>
          </div>
          <div className="stat-mini">
            <div className="stat-mini-icon icon-yellow">
              <Icon d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z" size={20} color="var(--olive-dark)" />
            </div>
            <div>
              <div className="stat-mini-label">Fee Status</div>
              <div className="stat-mini-value" style={{ color: "var(--forest)", fontSize: "15px" }}>
                {studentFees?.status || "Paid"}
              </div>
            </div>
          </div>
          <div className="stat-mini">
            <div className="stat-mini-icon icon-purple">
              <Icon d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4l3 3" size={20} color="var(--plum)" />
            </div>
            <div>
              <div className="stat-mini-label">Class</div>
              <div className="stat-mini-value">{user?.class || 8}{user?.section || "A"}</div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="dashboard-grid-wide">
          {/* Announcements */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon icon-red">
                  <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={15} color="var(--red)" />
                </div>
                Announcements
              </div>
              <span className="card-link" onClick={() => navigate("/student/announcements")}>See More</span>
            </div>
            {announcements.map((a) => (
              <div key={a.id} className="announcement-item">
                <div className={`announcement-tag ${tagColors[a.tag] || "tag-info"}`}>
                  {tagLabels[a.tag] || a.tag}
                </div>
                <div className="announcement-title">{a.title}</div>
                <div className="announcement-desc">{a.description}</div>
              </div>
            ))}
          </div>

          {/* Attendance */}
          <div className="card card-green">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon icon-green">
                  <Icon d="M9 11l3 3L22 4" size={15} color="var(--forest)" />
                </div>
                Attendance
              </div>
              <span className="card-link" onClick={() => navigate("/student/attendance")}>
                Details
              </span>
            </div>
            <div className="attendance-circle-wrap">
              {studentAttendance ? (
                <AttendanceCircle percentage={studentAttendance.overall || 85} />
              ) : (
                <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: "13px", fontWeight: 600 }}>
                  No attendance records found for this period.
                </div>
              )}
            </div>
            <div className="subject-attendance-grid">
              {(studentAttendance?.subjects || []).map((sub, i) => (
                <div key={i} className="subject-att-item">
                  <div className="subject-att-dot" style={{ background: sub.color }} />
                  <span className="subject-att-name">{sub.name}</span>
                  <span className="subject-att-pct">{sub.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="dashboard-grid-wide">
          {/* Marks */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon icon-blue">
                  <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" size={15} color="var(--sky)" />
                </div>
                Marks
              </div>
              <span className="card-link" onClick={() => navigate("/student/marks")}>
                View All
              </span>
            </div>
            <table className="marks-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Component</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {!studentMarks || studentMarks.subjects.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontWeight: 600, fontSize: "13px" }}>
                      No marks available yet. Please check back later.
                    </td>
                  </tr>
                ) : (
                  studentMarks.subjects.map((sub, i) => (
                  <tr key={i}>
                    <td className="subject-col">{sub.name}</td>
                    <td className="component-col">{sub.component}</td>
                    <td>
                      <span className={`marks-badge ${getMarkBadge(sub.marks, sub.total)}`}>
                        {sub.marks}/{sub.total}
                      </span>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>

          {/* Fee Challan */}
          <div className="card card-alt">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon icon-yellow">
                  <Icon d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z" size={15} color="var(--olive-dark)" />
                </div>
                Fee Challan
              </div>
              <span className="card-link" onClick={() => navigate("/student/fees")}>
                View Details
              </span>
            </div>
            <div className="fee-status-banner">
              <div>
                <div className="fee-challan-info">Fee Challan Status</div>
                <div className="fee-challan-sub">Current: {studentFees?.challan || "Spring 2026"}</div>
              </div>
              <div className="fee-paid-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Paid
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "Total Fee", value: `PKR ${studentFees?.total?.toLocaleString() || "25,000"}` },
                { label: "Amount Paid", value: `PKR ${studentFees?.paid?.toLocaleString() || "25,000"}` },
                { label: "Remaining", value: `PKR ${studentFees?.remaining?.toLocaleString() || "0"}` },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg-main)", borderRadius: "8px" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600 }}>{row.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: i === 2 ? "var(--forest-dark)" : "var(--text-primary)" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row: Profile + Calendar + Progress */}
        <div className="dashboard-grid-three">
          {/* Profile */}
          <div className="profile-panel">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">{initials}</div>
              <div className="profile-name">{user?.name || "Sarah Khan"}</div>
              <div className="profile-class">Class {user?.class || "8"}{user?.section || "A"}</div>
              <div className="profile-id-chip">
                <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={12} color="var(--forest-dark)" />
                ID: {user?.studentId || "12345"}
              </div>
            </div>

            {profileSaved && (
              <div style={{ background: "var(--forest-light)", border: "1.5px solid var(--forest)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "var(--forest-dark)", fontWeight: 700, marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={15} color="var(--forest)" />
                Profile updated successfully!
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "Email",   value: user?.email || "student@test.com" },
                { label: "Class",   value: `${user?.class || 8}-${user?.section || "A"}` },
                { label: "Session", value: "2025–2026" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{item.value}</span>
                </div>
              ))}

              {/* TC-14: Editable phone number field */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px", marginTop: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12.5px", color: "var(--text-muted)", fontWeight: 600 }}>Contact</span>
                  {!editingProfile && (
                    <button
                      onClick={() => { setEditingProfile(true); setPhoneError(""); }}
                      style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--sky)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
                    >
                      Edit
                    </button>
                  )}
                </div>

                {editingProfile ? (
                  <div>
                    <input
                      value={phone}
                      onChange={e => { setPhone(e.target.value); setPhoneError(""); }}
                      placeholder="e.g. 03001234567"
                      style={{
                        width: "100%", padding: "7px 10px", borderRadius: "8px",
                        border: `1.5px solid ${phoneError ? "var(--red)" : "var(--border)"}`,
                        background: "var(--bg-main)", color: "var(--text-primary)",
                        fontSize: "12.5px", fontFamily: "inherit", outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    {phoneError && (
                      <div style={{ color: "var(--red)", fontSize: "11.5px", fontWeight: 700, marginTop: "5px", display: "flex", alignItems: "center", gap: "5px" }}>
                        <Icon d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" size={12} color="var(--red)" />
                        {phoneError}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                      <button
                        onClick={handleSaveProfile}
                        style={{ flex: 1, padding: "7px", borderRadius: "8px", background: "var(--forest)", color: "#fff", border: "1.5px solid var(--forest-dark)", fontWeight: 700, fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => { setEditingProfile(false); setPhoneError(""); }}
                        style={{ padding: "7px 10px", borderRadius: "8px", background: "var(--bg-main)", color: "var(--text-secondary)", border: "1.5px solid var(--border)", fontWeight: 700, fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {phone || "Not set"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon icon-purple">
                  <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={15} color="var(--plum)" />
                </div>
                Academic Calendar
              </div>
              <span className="card-link" onClick={() => navigate("/student/calendar")}>
                See Events
              </span>
            </div>
            <MiniCalendar />
          </div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon icon-blue">
                  <Icon d="M18 20V10M12 20V4M6 20v-6" size={15} color="var(--sky)" />
                </div>
                Progress
              </div>
            </div>
            <div style={{ marginTop: "4px" }}>
              {progress.map((item, i) => (
                <div key={i} className="progress-item">
                  <span className="progress-label">{item.category}</span>
                  <span className={`progress-badge ${item.level}`}>{item.rating}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default Dashboard;