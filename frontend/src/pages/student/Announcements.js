import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { apiStudentGetAnnouncements } from "../../services/api";

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const TAG_STYLES = {
  urgent:  { bg: "#fff0f0", color: "#e53e3e", border: "#fca5a5", label: "Urgent" },
  event:   { bg: "#f0f0ff", color: "#7c3aed", border: "#c4b5fd", label: "Event"  },
  info:    { bg: "#f0f9ff", color: "#0ea5e9", border: "#7dd3fc", label: "Info"   },
  notice:  { bg: "#fffbeb", color: "#d97706", border: "#fcd34d", label: "Notice" },
  holiday: { bg: "#f0fdf4", color: "#16a34a", border: "#86efac", label: "Holiday" },
};

const TAG_ICONS = {
  urgent:  "M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
  event:   "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  info:    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 16v-4M12 8h.01",
  notice:  "M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9",
  holiday: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806",
};

const FILTERS = ["All", "Urgent", "Event", "Info", "Notice", "Holiday"];

function AnnouncementCard({ a, index }) {
  const tag   = TAG_STYLES[a.tag] || TAG_STYLES.info;
  const iconD = TAG_ICONS[a.tag]  || TAG_ICONS.info;
  const date  = a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "";
  const postedBy = a.postedBy?.name || a.postedBy?.username || "";

  return (
    <div className="announcement-card" style={{ animationDelay: `${index * 60}ms`, display: "flex", gap: 0, overflow: "hidden", borderRadius: 14, border: "1px solid var(--border)", background: "var(--card-bg)", marginBottom: 0 }}>
      <div style={{ width: 4, background: tag.color, flexShrink: 0, borderRadius: "14px 0 0 14px" }} />
      <div style={{ flex: 1, padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {a.pinned && (
              <span style={{ padding: "3px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: "#fffbeb", color: "#d97706", border: "1px solid #fcd34d" }}>
                📌 Pinned
              </span>
            )}
            <span style={{ padding: "3px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: tag.bg, color: tag.color, border: `1px solid ${tag.border}`, display: "flex", alignItems: "center", gap: 4 }}>
              <Icon d={iconD} size={11} color={tag.color} />
              {tag.label}
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text-muted)", alignItems: "center", flexWrap: "wrap" }}>
            {postedBy && <span>By {postedBy}</span>}
            {date && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={12} color="#9aaabb" />
                {date}
              </span>
            )}
          </div>
        </div>
        <h3 style={{ fontWeight: 800, fontSize: 16, color: "var(--text-primary)", margin: "0 0 8px" }}>{a.title}</h3>
        <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{a.content}</p>
      </div>
    </div>
  );
}

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [activeFilter, setActiveFilter]   = useState("All");
  const [search, setSearch]               = useState("");

  useEffect(() => {
    apiStudentGetAnnouncements()
      .then(res => {
        setAnnouncements(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filtered = announcements.filter(a => {
    const tagOk    = activeFilter === "All" || (a.tag || "info").toLowerCase() === activeFilter.toLowerCase();
    const searchOk = !search || a.title.toLowerCase().includes(search.toLowerCase()) || (a.content || "").toLowerCase().includes(search.toLowerCase());
    return tagOk && searchOk;
  });

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-wrapper">
          <div className="page-header">
            <div className="page-header-icon icon-orange">
              <Icon d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" size={22} color="#f97316" />
            </div>
            <div>
              <div className="page-title">Announcements</div>
              <div className="page-subtitle">Updates from your teachers and administration</div>
            </div>
          </div>

          {/* Search + filter */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search announcements…"
              style={{ flex: "1 1 220px", padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FILTERS.map(f => (
                <button key={f} className={activeFilter === f ? "filter-chip active" : "filter-chip"}
                  onClick={() => setActiveFilter(f)} style={{ cursor: "pointer" }}>{f}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-muted)" }}>Loading announcements…</div>
          ) : error ? (
            <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
              <div style={{ color: "#e53e3e" }}>Failed to load announcements</div>
              <div style={{ color: "var(--text-muted)", fontSize: 14 }}>{error}</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "64px 24px" }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>
                {announcements.length === 0 ? "No Announcements" : "No Results"}
              </div>
              <div style={{ color: "var(--text-muted)", marginTop: 8 }}>
                {announcements.length === 0 ? "No announcements have been posted for students yet." : "Try a different filter or search term."}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map((a, i) => <AnnouncementCard key={a._id || i} a={a} index={i} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Announcements;
