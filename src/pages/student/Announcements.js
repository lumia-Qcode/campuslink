import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { fetchAnnouncements } from "../../services/studentApi";


const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const TAG_STYLES = {
  urgent: { bg: "#fff0f0", color: "#e53e3e", border: "#fca5a5", label: "Urgent" },
  event:  { bg: "#f0f0ff", color: "#7c3aed", border: "#c4b5fd", label: "Event"  },
  info:   { bg: "#f0f9ff", color: "#0ea5e9", border: "#7dd3fc", label: "Info"   },
  notice: { bg: "#fffbeb", color: "#d97706", border: "#fcd34d", label: "Notice" },
};

const TAG_ICONS = {
  urgent: "M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
  event:  "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  info:   "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 16v-4M12 8h.01",
  notice: "M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9",
};

const FILTERS = ["All", "Urgent", "Event", "Info", "Notice"];

function AnnouncementCard({ a, index }) {
  const tag = TAG_STYLES[a.tag] || TAG_STYLES.info;
  const iconD = TAG_ICONS[a.tag] || TAG_ICONS.info;

  return (
    <div className="announcement-card" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="ann-card-left-bar" style={{ background: tag.color }} />
      <div className="ann-card-body">
        <div className="ann-card-top">
          <span className="ann-tag-pill"
            style={{ background: tag.bg, color: tag.color, border: `1px solid ${tag.border}` }}>
            <Icon d={iconD} size={11} color={tag.color} />
            {tag.label}
          </span>
          {a.date && (
            <span className="ann-date">
              <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={12} color="#9aaabb" />
              {a.date}
            </span>
          )}
        </div>
        <h3 className="ann-card-title">{a.title}</h3>
        <p className="ann-card-desc">{a.description}</p>
      </div>
    </div>
  );
}

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAnnouncements()
      .then(data => setAnnouncements(data.announcements || []))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = announcements.filter((a) => {
    const tagMatch = activeFilter === "All" || a.tag?.toLowerCase() === activeFilter.toLowerCase();
    const searchMatch = !search ||
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase());
    return tagMatch && searchMatch;
  });

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "All"
      ? announcements.length
      : announcements.filter(a => a.tag?.toLowerCase() === f.toLowerCase()).length;
    return acc;
  }, {});

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">

        {/* Page Header */}
        <div className="topbar">
          <div className="topbar-greeting" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg,#ff6b6b,#ff5c5c)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={18} color="#fff" />
            </div>
            <span>Announcements</span>
            <span style={{ color: "#9aaabb", fontWeight: 500, fontSize: "14px" }}>& Notice Board</span>
          </div>
          <div className="topbar-date">
            <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={15} color="#2db87b" />
            {new Date(2026, 2, 15).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Search + Filter Bar */}
        <div className="card" style={{ padding: "16px 20px", marginBottom: "0" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>
                <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={15} color="#9aaabb" />
              </span>
              <input
                className="ann-search-input"
                placeholder="Search announcements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filter Pills */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  className={`ann-filter-btn ${activeFilter === f ? "active" : ""}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                  {counts[f] > 0 && (
                    <span className="ann-filter-count">{counts[f]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <div style={{ padding: "10px 4px 4px", fontSize: "12.5px", color: "var(--text-muted)", fontWeight: 600 }}>
          Showing {filtered.length} announcement{filtered.length !== 1 ? "s" : ""}
          {activeFilter !== "All" ? ` · ${activeFilter}` : ""}
        </div>

        {/* Announcement Cards */}
        <div className="announcements-list">
          {filtered.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={36} color="#d1dbe8" />
              <p style={{ marginTop: "12px", fontSize: "14px" }}>No announcements found</p>
            </div>
          ) : (
            filtered.map((a, i) => <AnnouncementCard key={a.id} a={a} index={i} />)
          )}
        </div>

      </main>

      <style>{`
        .announcements-list { display: flex; flex-direction: column; gap: 12px; }

        .announcement-card {
          display: flex;
          background: var(--card-bg);
          border-radius: 14px;
          border: 1.5px solid var(--border);
          overflow: hidden;
          transition: box-shadow 0.18s, transform 0.18s;
          animation: fadeSlideUp 0.35s ease both;
        }
        .announcement-card:hover {
          box-shadow: 0 6px 24px rgba(0,0,0,0.07);
          transform: translateY(-2px);
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ann-card-left-bar { width: 4px; flex-shrink: 0; }
        .ann-card-body { padding: 16px 20px; flex: 1; }

        .ann-card-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .ann-tag-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.3px; text-transform: uppercase;
        }
        .ann-date { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-muted); font-weight: 600; margin-left: auto; }

        .ann-card-title { font-size: 15px; font-weight: 800; color: var(--text-primary); margin: 0 0 6px; }
        .ann-card-desc  { font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.6; }

        .ann-search-input {
          width: 100%; padding: 9px 12px 9px 36px;
          border: 1.5px solid var(--border); border-radius: 10px;
          background: var(--bg-main); color: var(--text-primary);
          font-size: 13.5px; font-family: inherit; outline: none;
          transition: border-color 0.15s;
        }
        .ann-search-input:focus { border-color: #2db87b; }
        .ann-search-input::placeholder { color: var(--text-muted); }

        .ann-filter-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 6px 14px; border-radius: 20px;
          border: 1.5px solid var(--border);
          background: var(--bg-main); color: var(--text-secondary);
          font-size: 12.5px; font-weight: 700; cursor: pointer;
          transition: all 0.15s;
        }
        .ann-filter-btn:hover { border-color: #2db87b; color: #2db87b; }
        .ann-filter-btn.active { background: #2db87b; color: #fff; border-color: #2db87b; }
        .ann-filter-count {
          background: rgba(255,255,255,0.25); padding: 1px 7px;
          border-radius: 10px; font-size: 10.5px; font-weight: 800;
        }
        .ann-filter-btn:not(.active) .ann-filter-count {
          background: var(--border); color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

export default Announcements;