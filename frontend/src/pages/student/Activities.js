import React from "react";
import Navbar from "../../components/Navbar";
import { activities } from "../../data/mockData";

const Icon = ({ d, size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

// Assign icon + color scheme per activity index
const activityStyles = [
  { iconPath: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5", colorClass: "act-green",  iconColor: "#2db87b" },
  { iconPath: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", colorClass: "act-blue",   iconColor: "#4f8ef7" },
  { iconPath: "M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z", colorClass: "act-purple", iconColor: "#9b6dff" },
  { iconPath: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3", colorClass: "act-yellow", iconColor: "#e6a800" },
  { iconPath: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", colorClass: "act-red",    iconColor: "#ff5c5c" },
];

function getStatusClass(participation) {
  const p = participation.toLowerCase();
  if (p.includes("vice") || p.includes("vp"))    return "status-vp";
  if (p.includes("president") || p.includes("captain") || p.includes("lead")) return "status-leader";
  if (p.includes("active"))  return "status-active";
  if (p.includes("member"))  return "status-member";
  return "status-inactive";
}

function Activities() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-wrapper">

          {/* Header */}
          <div className="page-header">
            <div className="page-header-icon icon-green">
              <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" size={22} color="#2db87b" />
            </div>
            <div>
              <div className="page-title">Extra-Curricular Activities</div>
              <div className="page-subtitle">{activities.length} activities enrolled</div>
            </div>
          </div>

          {/* Grid */}
          <div className="activities-grid">
            {activities.map((act, index) => {
              const style = activityStyles[index % activityStyles.length];
              return (
                <div className="activity-card" key={index}>
                  <div className={`activity-icon-wrap ${style.colorClass}`}>
                    <Icon d={style.iconPath} size={22} color={style.iconColor} />
                  </div>
                  <div className="activity-info">
                    <div className="activity-name">{act.activity}</div>
                    <span className={`activity-status-badge ${getStatusClass(act.participation)}`}>
                      <span className="activity-status-dot" />
                      {act.participation}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}

export default Activities;