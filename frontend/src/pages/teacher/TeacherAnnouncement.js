import React, { useState } from "react";
import TeacherNavbar from "../../components/Teachernavbar";
import { teacherAnnouncements } from "../../data/teacherMockData";

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
  info:   { bg: "#f0fdf7", color: "#2db87b", border: "#bbf7d0", label: "Info"   },
  notice: { bg: "#fffbeb", color: "#d97706", border: "#fcd34d", label: "Notice" },
};

const CLASSES_LIST = ["10-A", "10-B", "9-A", "All Classes"];

function TeacherAnnouncements() {
  const [announcements, setAnnouncements] = useState(teacherAnnouncements);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", tag: "info", target: "All Classes" });
  const [filterTag, setFilterTag] = useState("All");
  const [posted, setPosted] = useState(false);
  const [annError, setAnnError] = useState("");

  const handlePost = () => {
    if (!form.title.trim()) {
      setAnnError("Announcement title cannot be empty.");
      return;
    }
    if (!form.description.trim()) {
      setAnnError("Announcement message cannot be empty.");
      return;
    }
    setAnnError("");
    const newAnn = {
      id: announcements.length + 1,
      title: form.title,
      description: form.description,
      tag: form.tag,
      date: "2026-03-28",
      target: form.target,
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    setForm({ title: "", description: "", tag: "info", target: "All Classes" });
    setShowForm(false);
    setAnnError("");
    setPosted(true);
    setTimeout(() => setPosted(false), 3000);
  };

  const handleDelete = (id) => setAnnouncements(prev => prev.filter(a => a.id !== id));

  const filtered = filterTag === "All" ? announcements : announcements.filter(a => a.tag === filterTag.toLowerCase());

  return (
    <div className="app-layout">
      <TeacherNavbar />
      <main className="main-content">

        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-greeting" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg,#2db87b,#1e9e63)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={18} color="#fff" />
            </div>
            <span>Announcements</span>
            <span style={{ color: "#9aaabb", fontWeight: 500, fontSize: "14px" }}>· {announcements.length} total</span>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 20px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #2db87b, #1e9e63)", color: "#fff", fontWeight: 700, fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(45,184,123,0.35)" }}>
            <Icon d="M12 5v14M5 12h14" size={16} color="#fff" />
            Post Announcement
          </button>
        </div>

        {/* Success Banner */}
        {posted && (
          <div style={{ padding: "12px 18px", borderRadius: "10px", background: "#f0fdf7", border: "1.5px solid #bbf7d0", color: "#2db87b", fontWeight: 700, fontSize: "13.5px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Icon d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={16} color="#2db87b" />
            Announcement posted successfully!
          </div>
        )}

        {/* Post Form */}
        {showForm && (
          <div className="card" style={{ border: "2px solid #bbf7d0", background: "linear-gradient(135deg, #f0fdf7, #fff)" }}>
            <div className="card-header" style={{ marginBottom: "18px" }}>
              <div className="card-title">
                <div className="card-title-icon icon-green">
                  <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" size={15} color="#2db87b" />
                </div>
                New Announcement
              </div>
              <button onClick={() => { setShowForm(false); setAnnError(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <Icon d="M18 6L6 18M6 6l12 12" size={18} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              <div>
                <label className="form-label">Title</label>
                <input className="form-input" placeholder="Announcement title..."
                  value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Tag</label>
                  <select className="form-input" value={form.tag} onChange={e => setForm(p => ({ ...p, tag: e.target.value }))}>
                    {Object.entries(TAG_STYLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Target</label>
                  <select className="form-input" value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))}>
                    {CLASSES_LIST.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={3} placeholder="Write your announcement..."
                value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                style={{ resize: "vertical" }} />
            </div>

            <div style={{ marginTop: "14px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              {annError && (
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#e53e3e", fontWeight: 700, fontSize: "13px", marginRight: "auto" }}>
                  <Icon d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" size={16} color="#e53e3e" />
                  {annError}
                </span>
              )}
              <button onClick={() => { setShowForm(false); setAnnError(""); }}
                style={{ padding: "10px 20px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg-main)", color: "var(--text-secondary)", fontWeight: 700, fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button onClick={handlePost}
                style={{ padding: "10px 28px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #2db87b, #1e9e63)", color: "#fff", fontWeight: 800, fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(45,184,123,0.35)" }}>
                Post
              </button>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="card" style={{ padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["All", "Urgent", "Event", "Info", "Notice"].map(f => (
              <button key={f}
                className={`ann-filter-btn ${filterTag === f ? "active" : ""}`}
                onClick={() => setFilterTag(f)}
                style={filterTag === f ? { background: "#2db87b", borderColor: "#2db87b", color: "#fff" } : {}}>
                {f}
                <span style={{ padding: "1px 7px", borderRadius: "10px", fontSize: "10.5px", fontWeight: 800, background: filterTag === f ? "rgba(255,255,255,0.25)" : "var(--border)", color: filterTag === f ? "#fff" : "var(--text-muted)" }}>
                  {f === "All" ? announcements.length : announcements.filter(a => a.tag === f.toLowerCase()).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Announcement List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
              <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" size={36} color="#d1dbe8" />
              <p style={{ marginTop: "12px", fontSize: "14px" }}>No announcements found</p>
            </div>
          ) : filtered.map((a, i) => {
            const tag = TAG_STYLES[a.tag] || TAG_STYLES.info;
            return (
              <div key={a.id} style={{ display: "flex", background: "var(--card-bg)", borderRadius: "14px", border: "1.5px solid var(--border)", overflow: "hidden", transition: "box-shadow 0.18s, transform 0.18s", animation: `fadeSlideUp 0.35s ease ${i * 60}ms both` }}
                onMouseOver={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.07)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseOut={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}>
                <div style={{ width: "4px", flexShrink: 0, background: tag.color }} />
                <div style={{ padding: "16px 20px", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", background: tag.bg, color: tag.color, border: `1px solid ${tag.border}`, fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                      {tag.label}
                    </span>
                    {a.target && (
                      <span style={{ padding: "3px 10px", borderRadius: "20px", background: "#f0fdf7", color: "#2db87b", fontSize: "11px", fontWeight: 700 }}>
                        {a.target}
                      </span>
                    )}
                    {a.date && (
                      <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>{a.date}</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "6px" }}>{a.title}</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{a.description}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", padding: "0 16px" }}>
                  <button onClick={() => handleDelete(a.id)}
                    style={{ padding: "6px 12px", borderRadius: "8px", border: "1.5px solid #fca5a5", background: "#fff5f5", color: "#e53e3e", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Icon d="M18 6L6 18M6 6l12 12" size={12} color="#e53e3e" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .ann-filter-btn { display: inline-flex; align-items: center; gap: 5px; padding: 6px 14px; border-radius: 20px; border: 1.5px solid var(--border); background: var(--bg-main); color: var(--text-secondary); font-size: 12.5px; font-weight: 700; cursor: pointer; transition: all 0.15s; font-family: inherit; }
        .ann-filter-btn:hover { border-color: #2db87b; color: #2db87b; }
        .ann-filter-btn.active { background: #2db87b; color: #fff; border-color: #2db87b; }
      `}</style>
    </div>
  );
}

export default TeacherAnnouncements;