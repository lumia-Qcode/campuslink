import React, { useState } from "react";
import Navbar from "../../components/Navbar";

const Icon = ({ d, size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const AVAILABLE_ACTIVITIES = [
  {
    name: "Cricket Team",
    description: "Join the school cricket team and compete in inter-school tournaments.",
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    colorClass: "act-green",
    iconColor: "#2db87b",
    category: "Sports",
  },
  {
    name: "Football Club",
    description: "Play football, improve teamwork, and represent your school.",
    icon: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
    colorClass: "act-blue",
    iconColor: "#4f8ef7",
    category: "Sports",
  },
  {
    name: "Basketball Team",
    description: "Develop your basketball skills and compete with other schools.",
    icon: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07",
    colorClass: "act-yellow",
    iconColor: "#e6a800",
    category: "Sports",
  },
  {
    name: "Book Club",
    description: "Read, discuss, and explore a wide variety of books every month.",
    icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z",
    colorClass: "act-purple",
    iconColor: "#9b6dff",
    category: "Academic",
  },
  {
    name: "Science Club",
    description: "Conduct experiments, explore STEM concepts, and compete in science fairs.",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    colorClass: "act-blue",
    iconColor: "#4f8ef7",
    category: "Academic",
  },
  {
    name: "Debate Society",
    description: "Sharpen public speaking skills and participate in debate competitions.",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    colorClass: "act-green",
    iconColor: "#2db87b",
    category: "Academic",
  },
  {
    name: "Art Society",
    description: "Express creativity through painting, sketching, and visual arts.",
    icon: "M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
    colorClass: "act-red",
    iconColor: "#ff5c5c",
    category: "Arts",
  },
  {
    name: "Music Club",
    description: "Learn instruments, practice vocals, and perform at school events.",
    icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3",
    colorClass: "act-purple",
    iconColor: "#9b6dff",
    category: "Arts",
  },
  {
    name: "Drama Club",
    description: "Act, direct, and produce plays for school and community events.",
    icon: "M14.752 11.168l-3.197-2.132A1 1 0 0 0 10 9.87v4.263a1 1 0 0 0 1.555.832l3.197-2.132a1 1 0 0 0 0-1.664z M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
    colorClass: "act-yellow",
    iconColor: "#e6a800",
    category: "Arts",
  },
  {
    name: "Community Service",
    description: "Volunteer, help the community, and make a positive impact.",
    icon: "M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0z",
    colorClass: "act-red",
    iconColor: "#ff5c5c",
    category: "Service",
  },
];

const CATEGORY_FILTERS = ["All", "Sports", "Academic", "Arts", "Service"];

const PARTICIPATION_LEVELS = ["Member", "Active Member", "Vice President", "Captain", "President"];

function getStatusClass(participation) {
  const p = participation.toLowerCase();
  if (p.includes("vice") || p.includes("vp"))               return "status-vp";
  if (p.includes("president") || p.includes("captain"))     return "status-leader";
  if (p.includes("active"))                                  return "status-active";
  if (p.includes("member"))                                  return "status-member";
  return "status-inactive";
}

function AddActivityModal({ onAdd, onClose, enrolled }) {
  const [selected, setSelected]     = useState(null);
  const [participation, setParticipation] = useState("Member");
  const [category, setCategory]     = useState("All");

  const available = AVAILABLE_ACTIVITIES.filter(a =>
    !enrolled.some(e => e.activity === a.name) &&
    (category === "All" || a.category === category)
  );

  const handleAdd = () => {
    if (!selected) return;
    onAdd({ activity: selected.name, participation });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}>
      <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-md)", padding: "28px", width: "100%", maxWidth: 560, maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", border: "1.5px solid var(--border)" }}
        onClick={e => e.stopPropagation()}>
      <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 18 }}>Join an Activity</div>

        {/* Category filter */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {CATEGORY_FILTERS.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              style={{ padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: category === c ? "#9b6dff" : "var(--bg-secondary)",
                color: category === c ? "#fff" : "var(--text-muted)",
                border: category === c ? "none" : "1px solid var(--border)" }}>
              {c}
            </button>
          ))}
        </div>

        {/* Activities grid */}
        <div style={{ overflowY: "auto", flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10, marginBottom: 16, paddingRight: 4 }}>
          {available.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "32px 16px", color: "var(--text-muted)" }}>
              No activities available in this category.
            </div>
          ) : available.map(act => (
            <div key={act.name} onClick={() => setSelected(act)}
              style={{ padding: "14px", borderRadius: 12, cursor: "pointer", border: `2px solid ${selected?.name === act.name ? "#9b6dff" : "var(--border)"}`,
                background: selected?.name === act.name ? "#f5f3ff" : "var(--bg-secondary)",
                transition: "all 0.15s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div className={`activity-icon-wrap ${act.colorClass}`}
                  style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon d={act.icon} size={18} color={act.iconColor} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{act.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{act.category}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{act.description}</div>
            </div>
          ))}
        </div>

        {/* Participation level */}
        {selected && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Participation Level</label>
            <select value={participation} onChange={e => setParticipation(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none" }}>
              {PARTICIPATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleAdd} disabled={!selected}
            style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: selected ? "linear-gradient(135deg,#2db87b,#1e9e63)" : "var(--border)", color: selected ? "#fff" : "var(--text-muted)", fontSize: 14, fontWeight: 700, cursor: selected ? "pointer" : "not-allowed" }}>
            Join Activity
          </button>
        </div>
      </div>
    </div>
  );
}

function Activities() {
  const [activities, setActivities]   = useState([
    { activity: "Cricket Team",  participation: "Active Member" },
    { activity: "Science Club",  participation: "Vice President" },
    { activity: "Art Society",   participation: "Member" },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAdd = (newActivity) => {
    setActivities(prev => [...prev, newActivity]);
  };

  const handleLeave = (name) => {
    if (!window.confirm(`Leave ${name}?`)) return;
    setActivities(prev => prev.filter(a => a.activity !== name));
  };

  const activityStyles = [
    { iconPath: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5", colorClass: "act-green",  iconColor: "#2db87b" },
    { iconPath: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", colorClass: "act-blue",   iconColor: "#4f8ef7" },
    { iconPath: "M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z", colorClass: "act-purple", iconColor: "#9b6dff" },
    { iconPath: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3", colorClass: "act-yellow", iconColor: "#e6a800" },
    { iconPath: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", colorClass: "act-red",    iconColor: "#ff5c5c" },
  ];

  // Look up the full activity info for icon display
  const getActivityMeta = (name) =>
    AVAILABLE_ACTIVITIES.find(a => a.activity === name || a.name === name) || null;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {showAddModal && (
          <AddActivityModal
            onAdd={handleAdd}
            onClose={() => setShowAddModal(false)}
            enrolled={activities}
          />
        )}

        <div className="page-wrapper">
          <div className="page-header">
            <div className="page-header-icon icon-green">
              <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" size={22} color="#2db87b" />
            </div>
            <div style={{ flex: 1 }}>
              <div className="page-title">Extra-Curricular Activities</div>
              <div className="page-subtitle">{activities.length} activit{activities.length !== 1 ? "ies" : "y"} enrolled</div>
            </div>
            <button onClick={() => setShowAddModal(true)}
              style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#2db87b,#1e9e63)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <Icon d="M12 5v14M5 12h14" size={16} color="#fff" />
              Add Activity
            </button>
          </div>

          {activities.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "64px 24px" }}>
              <div style={{ width: 72, height: 72, borderRadius: "20px", background: "#f0fdf7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" size={32} color="#2db87b" />
              </div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>No Activities Yet</div>
              <div style={{ color: "var(--text-muted)", marginTop: 8, marginBottom: 20 }}>Join an activity to get started!</div>
              <button onClick={() => setShowAddModal(true)}
                style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#2db87b,#1e9e63)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Browse Activities
              </button>
            </div>
          ) : (
            <div className="activities-grid">
              {activities.map((act, index) => {
                const meta  = getActivityMeta(act.activity);
                const style = meta
                  ? { iconPath: meta.icon, colorClass: meta.colorClass, iconColor: meta.iconColor }
                  : activityStyles[index % activityStyles.length];
                return (
                  <div className="activity-card" key={index}
                    style={{ position: "relative" }}>
                    <div className={`activity-icon-wrap ${style.colorClass}`}>
                      <Icon d={style.iconPath} size={22} color={style.iconColor} />
                    </div>
                    <div className="activity-info" style={{ flex: 1 }}>
                      <div className="activity-name">{act.activity}</div>
                      {meta && <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{meta.category}</div>}
                      <span className={`activity-status-badge ${getStatusClass(act.participation)}`}>
                        <span className="activity-status-dot" />
                        {act.participation}
                      </span>
                    </div>
                    <button onClick={() => handleLeave(act.activity)}
                      title="Leave activity"
                      style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, borderRadius: 6, opacity: 0.5, transition: "opacity 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "0.5"}>
                      <Icon d="M18 6L6 18M6 6l12 12" size={14} color="#e53e3e" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Activities;