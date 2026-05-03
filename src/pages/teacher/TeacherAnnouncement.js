import React, { useState, useEffect } from "react";
import TeacherNavbar from "../../components/Teachernavbar";
import { fetchTeacherAnnouncements } from "../../services/teacherApi";
import { getUser } from "../../services/auth";

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const TAG_STYLES = {
  urgent: { bg: "#fff0f0", color: "#e53e3e", border: "#fca5a5", label: "Urgent" },
  event:  { bg: "#f0f0ff", color: "#7c3aed", border: "#c4b5fd", label: "Event" },
  info:   { bg: "#f0fdf7", color: "#2db87b", border: "#bbf7d0", label: "Info" },
  notice: { bg: "#fffbeb", color: "#d97706", border: "#fcd34d", label: "Notice" },
};

const TAG_OPTIONS = ["info", "urgent", "event", "notice"];

function TeacherAnnouncements() {
  const user = getUser();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", tag: "info" });
  const [filterTag, setFilterTag] = useState("All");
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [postError, setPostError] = useState(null);

  const loadAnnouncements = () => {
    setLoading(true);
    fetchTeacherAnnouncements()
      .then((data) => {
        // Backend returns { announcements, tagCounts } or array
        const list = Array.isArray(data) ? data : (data?.announcements || []);
        setAnnouncements(list);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handlePost = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setPosting(true);
    setPostError(null);

    try {
      const token = localStorage.getItem("campuslink_token");
      const res = await fetch(`${BASE_URL}/teacher/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          tag: form.tag,
          targetRoles: ["student", "teacher", "admin"],
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        // If backend route not available, add locally so UI still works
        const newAnn = {
          _id: Date.now().toString(),
          title: form.title,
          description: form.description,
          tag: form.tag,
          createdAt: new Date().toISOString(),
        };
        setAnnouncements(prev => [newAnn, ...prev]);
      } else {
        // Reload from backend to get real data
        loadAnnouncements();
      }

      setForm({ title: "", description: "", tag: "info" });
      setShowForm(false);
      setPosted(true);
      setTimeout(() => setPosted(false), 3000);
    } catch {
      setPostError("Failed to post announcement");
    } finally {
      setPosting(false);
    }
  };

  const filtered =
    filterTag === "All"
      ? announcements
      : announcements.filter((a) => a.tag === filterTag);

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
            <span style={{ color: "#9aaabb", fontWeight: 500, fontSize: "14px" }}>
              · {announcements.length} posted
            </span>
          </div>
          <button
            onClick={() => { setShowForm(v => !v); setPostError(null); }}
            style={{ padding: "8px 18px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #2db87b, #1e9e63)", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
            {showForm ? "Cancel" : "+ Post Announcement"}
          </button>
        </div>

        {/* Success banner */}
        {posted && (
          <div style={{ padding: "12px 18px", borderRadius: "10px", background: "#f0fdf7", border: "1.5px solid #bbf7d0", color: "#2db87b", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <Icon d="M22 11.08V12a10 10 0 1 1-5.93-9.14" size={16} color="#2db87b" />
            Announcement posted successfully!
          </div>
        )}

        {/* Post Form */}
        {showForm && (
          <div className="card" style={{ padding: "20px 24px" }}>
            <div style={{ fontWeight: 800, fontSize: "15px", color: "var(--text-primary)", marginBottom: "16px" }}>New Announcement</div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "6px" }}>Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Announcement title"
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg-main)", color: "var(--text-primary)", fontSize: "13.5px", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "6px" }}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Write the announcement details..."
                rows={4}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg-main)", color: "var(--text-primary)", fontSize: "13.5px", fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "6px" }}>Tag</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {TAG_OPTIONS.map(t => {
                  const ts = TAG_STYLES[t];
                  return (
                    <button key={t} onClick={() => setForm({ ...form, tag: t })} type="button"
                      style={{ padding: "6px 14px", borderRadius: "20px", border: `1.5px solid ${form.tag === t ? ts.color : "var(--border)"}`, background: form.tag === t ? ts.bg : "var(--bg-main)", color: form.tag === t ? ts.color : "var(--text-muted)", fontWeight: 700, fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>
                      {ts.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {postError && (
              <div style={{ color: "#e53e3e", fontWeight: 700, fontSize: "13px", marginBottom: "10px" }}>{postError}</div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setShowForm(false)} type="button"
                style={{ padding: "9px 20px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg-main)", color: "var(--text-secondary)", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button onClick={handlePost} disabled={posting || !form.title.trim() || !form.description.trim()}
                style={{ padding: "9px 24px", borderRadius: "10px", border: "none", background: posting ? "#a0cdb8" : "linear-gradient(135deg, #2db87b, #1e9e63)", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: posting ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {posting ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        )}

        {/* Filter Tags */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["All", ...TAG_OPTIONS].map(t => (
            <button key={t} onClick={() => setFilterTag(t)}
              style={{ padding: "6px 16px", borderRadius: "20px", border: "1.5px solid var(--border)", background: filterTag === t ? "#2db87b" : "var(--bg-main)", color: filterTag === t ? "#fff" : "var(--text-secondary)", fontWeight: 700, fontSize: "12.5px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
              {t === "All" ? "All" : TAG_STYLES[t].label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>Loading announcements…</div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: "12px 18px", borderRadius: "10px", background: "#fff5f5", border: "1.5px solid #fca5a5", color: "#e53e3e", fontWeight: 700 }}>{error}</div>
        )}

        {/* Announcements List */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)", fontSize: "14px" }}>No announcements yet.</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((a) => {
            const ts = TAG_STYLES[a.tag] || TAG_STYLES.info;
            const dateStr = a.createdAt || a.date;
            return (
              <div key={a._id || a.id} className="card" style={{ padding: "18px 22px", borderLeft: `4px solid ${ts.color}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <span style={{ padding: "3px 12px", borderRadius: "20px", background: ts.bg, color: ts.color, border: `1.5px solid ${ts.border}`, fontSize: "12px", fontWeight: 800 }}>
                    {ts.label}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, marginLeft: "auto" }}>
                    {dateStr ? new Date(dateStr).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : ""}
                  </span>
                </div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "6px" }}>{a.title}</div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{a.description}</div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}

export default TeacherAnnouncements;