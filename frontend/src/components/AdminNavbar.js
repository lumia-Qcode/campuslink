import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout, getUser } from "../services/auth";

const Icon = ({ d, size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const navItems = [
  { to: "/admin/dashboard",  label: "Dashboard",     icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { to: "/admin/students",   label: "Students",      icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { to: "/admin/teachers",   label: "Teachers",      icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  { to: "/admin/sections",   label: "Sections",      icon: "M4 6h16M4 12h16M4 18h7" },
  { to: "/admin/timetable",  label: "Timetable",     icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" },
  { to: "/admin/fees",       label: "Fees",          icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0-3 3v8a3 3 0 0 0 3 3z" },
  { to: "/admin/announcements", label: "Announcements", icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" },
];

function AdminNavbar() {
  const navigate = useNavigate();
  const user = getUser();
  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "AD";

  return (
    <aside className="sidebar admin-sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-row">
          <div className="sidebar-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div>
            <div className="sidebar-logo-name">Campus<span>Link</span></div>
            <div className="sidebar-logo-sub">Admin Portal</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Admin Menu</div>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) => `sidebar-nav-item admin-nav-item${isActive ? " admin-active" : ""}`}>
            <Icon d={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || "Admin"}</div>
            <div className="sidebar-user-class">Administrator</div>
          </div>
        </div>
        <button onClick={() => { logout(); navigate("/"); }} className="sidebar-logout-btn">
          <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminNavbar;
