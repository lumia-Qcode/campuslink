import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout, getUser } from "../services/auth";

const teacherNavItems = [
  {
    to: "/teacher/dashboard",
    label: "Dashboard",
    icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  },
  {
    to: "/teacher/attendance",
    label: "Attendance",
    icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  },
  {
    to: "/teacher/marks",
    label: "Enter Marks",
    icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  },
  {
    to: "/teacher/timetable",
    label: "My Timetable",
    icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  },
  {
    to: "/teacher/materials",
    label: "Upload Materials",
    icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z",
  },
  {
    to: "/teacher/announcements",
    label: "Announcements",
    icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  },
  {
    to: "/teacher/calendar",
    label: "Calendar",
    icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  },
  {
    to: "/teacher/students",
    label: "My Students",
    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  },
];

function TeacherNavbar() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initials = user?.name
    ? user.name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s*/i, "")
        .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "TN";

  return (
    <aside className="sidebar teacher-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-row">
          {/* Green logo icon — matches student sidebar */}
          <div className="sidebar-logo-icon" style={{ background: "linear-gradient(135deg, #2db87b, #1e9e63)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div>
            <div className="sidebar-logo-name">Campus<span style={{ color: "#2db87b" }}>Link</span></div>
            <div className="sidebar-logo-sub">Teacher Portal</div>
          </div>
        </div>
      </div>

      {/* Teacher Badge — green */}
      <div style={{ margin: "0 12px 4px", padding: "8px 12px", background: "#f0fdf7", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2db87b", flexShrink: 0 }} />
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#2db87b", textTransform: "uppercase", letterSpacing: "0.8px" }}>Teacher Mode</span>
      </div>

      {/* Nav Items */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Teacher Menu</div>
        {teacherNavItems.map((item) => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) => `sidebar-nav-item teacher-nav-item${isActive ? " teacher-active" : ""}`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d={item.icon} />
            </svg>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          {/* Green avatar */}
          <div className="sidebar-user-avatar" style={{ background: "linear-gradient(135deg, #2db87b, #1e9e63)" }}>
            {initials}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || "Teacher"}</div>
            <div className="sidebar-user-class" style={{ color: "#2db87b" }}>
              {user?.department || "Department"}
            </div>
          </div>
        </div>
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Logout
        </button>
      </div>

      {/* Override active nav item to green */}
      <style>{`
        .teacher-active {
          background: linear-gradient(135deg, #2db87b15, #1e9e6310) !important;
          color: #2db87b !important;
          border-left: 3px solid #2db87b !important;
        }
        .teacher-nav-item:hover {
          color: #2db87b !important;
          background: #f0fdf7 !important;
        }
      `}</style>
    </aside>
  );
}

export default TeacherNavbar;