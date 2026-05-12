import React, { useState, useEffect, useCallback } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import {
  apiGetAnnouncements, apiCreateAnnouncement,
  apiUpdateAnnouncement, apiDeleteAnnouncement,
} from "../../services/api";

const CLASS_LEVELS = [
  { id: "playgroup", label: "Play Group" }, { id: "nursery", label: "Nursery" },
  { id: "prenursery", label: "Pre-Nursery" },
  { id: "1", label: "Class 1" }, { id: "2", label: "Class 2" },
  { id: "3", label: "Class 3" }, { id: "4", label: "Class 4" },
  { id: "5", label: "Class 5" }, { id: "6", label: "Class 6" },
  { id: "7", label: "Class 7" }, { id: "8", label: "Class 8" },
  { id: "9", label: "Class 9" }, { id: "X", label: "Class X" },
];

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const TAG_STYLES = {
  urgent: { bg: "#fff0f0", color: "#e53e3e", border: "#fca5a5", label: "Urgent",  icon: "M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" },
  event:  { bg: "#f0f0ff", color: "#7c3aed", border: "#c4b5fd", label: "Event",   icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" },
  info:   { bg: "#f0f9ff", color: "#0ea5e9", border: "#7dd3fc", label: "Info",    icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 16v-4M12 8h.01" },
  notice: { bg: "#fffbeb", color: "#d97706", border: "#fcd34d", label: "Notice",  icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" },
  holiday:{ bg: "#f0fdf4", color: "#16a34a", border: "#86efac", label: "Holiday", icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM9 12l2 2 4-4" },
};

const EMPTY_FORM = { title: "", description: "", tag: "info", target: "all", customClasses: [] };
const formatDate = (d) => new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterTag, setFilterTag] = useState("all");
  const [search, setSearch] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const flash = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 4000); };

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await apiGetAnnouncements();
      // Admin portal only shows announcements posted by admins
      const allAnns = res.data || [];
      const adminAnns = allAnns.filter(a => {
        const role = a.postedBy?.role;
        return role === "admin" || !role; // legacy entries without role treated as admin
      });
      setAnnouncements(adminAnns);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = announcements.filter(a => {
    const matchTag = filterTag === "all" || a.tag === filterTag;
    const matchSearch = (a.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.content || a.description || "").toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  const pinned = filtered.filter(a => a.pinned);
  const regular = filtered.filter(a => !a.pinned);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePost = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await apiCreateAnnouncement({
        title: form.title.trim(),
        content: form.description.trim(),
        tag: form.tag,
        targetRoles: ["student", "teacher", "admin"],
        targetClasses: form.target === "classes" ? form.customClasses : [],
      });
      flash(`Announcement "${form.title}" posted.`);
      setShowModal(false); setForm(EMPTY_FORM); setErrors({});
      load();
    } catch (e) { setErrors({ submit: e.message }); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await apiDeleteAnnouncement(id);
      flash("Announcement deleted.");
      setDeleteConfirm(null);
      load();
    } catch (e) { setError(e.message); }
  };

  const togglePin = async (ann) => {
    try {
      await apiUpdateAnnouncement(ann._id, { pinned: !ann.pinned });
      load();
    } catch (e) { setError(e.message); }
  };

  const toggleClass = (classId) => {
    setForm(f => ({
      ...f,
      customClasses: f.customClasses.includes(classId)
        ? f.customClasses.filter(c => c !== classId)
        : [...f.customClasses, classId],
    }));
  };

  const AnnouncementCard = ({ ann }) => {
    const tag = TAG_STYLES[ann.tag] || TAG_STYLES.info;
    const isExpanded = expandedId === ann._id;
    const content = ann.content || ann.description || "";

    return (
      <div style={{
        background: "#fff", borderRadius: 14, border: `1.5px solid ${ann.pinned ? tag.border : "var(--border)"}`,
        overflow: "hidden", boxShadow: ann.pinned ? `0 4px 20px ${tag.color}22` : "var(--shadow-sm)",
      }}>
        <div style={{ height: 3, background: tag.color }} />
        <div style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: tag.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon d={tag.icon} size={18} color={tag.color} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: tag.bg, color: tag.color, border: `1px solid ${tag.border}` }}>
                  {tag.label}
                </span>
                {ann.pinned && (
                  <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: "#fff8e1", color: "#b45309", border: "1px solid #fcd34d" }}>
                    📌 Pinned
                  </span>
                )}
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
                  {formatDate(ann.createdAt)}
                </span>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 15.5, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.3, marginBottom: 6 }}>{ann.title}</div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0,
                ...(isExpanded ? {} : { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" })
              }}>{content}</p>
              {content.length > 120 && (
                <button onClick={() => setExpandedId(isExpanded ? null : ann._id)}
                  style={{ background: "none", border: "none", color: tag.color, fontWeight: 700, fontSize: 12, cursor: "pointer", padding: "4px 0 0", fontFamily: "inherit" }}>
                  {isExpanded ? "Show less ↑" : "Read more ↓"}
                </button>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Admin Office</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => togglePin(ann)}
                style={{ background: ann.pinned ? "#fff8e1" : "var(--bg-main)", border: "1.5px solid", borderColor: ann.pinned ? "#fcd34d" : "var(--border)", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: ann.pinned ? "#b45309" : "var(--text-muted)" }}>
                {ann.pinned ? "Unpin" : "Pin"}
              </button>
              <button onClick={() => setDeleteConfirm(ann._id)}
                style={{ background: "#fff5f5", border: "1.5px solid #fca5a5", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "#dc2626" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-layout">
      <AdminNavbar />
      <main className="main-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800 }}>Announcements</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>Post and manage school-wide communications</p>
          </div>
          <button className="btn-primary"
            style={{ width: "auto", padding: "12px 22px", background: "linear-gradient(135deg, #9b6dff, #7c3aed)", display: "flex", alignItems: "center", gap: 8 }}
            onClick={() => setShowModal(true)}>
            <Icon d="M12 5v14M5 12h14" size={15} color="#fff" />
            Post Announcement
          </button>
        </div>

        {successMsg && <div style={{ background: "#e4f7ed", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#15803d", fontWeight: 700, fontSize: 13 }}>{successMsg}</div>}
        {error && <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#dc2626", fontWeight: 700, fontSize: 13 }}>{error}</div>}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total",   value: announcements.length,                              color: "#9b6dff", bg: "#f5f3ff" },
            { label: "Pinned",  value: announcements.filter(a => a.pinned).length,        color: "#b45309", bg: "#fff8e1" },
            { label: "Urgent",  value: announcements.filter(a => a.tag === "urgent").length, color: "#e53e3e", bg: "#fff0f0" },
            { label: "Events",  value: announcements.filter(a => a.tag === "event").length,  color: "#7c3aed", bg: "#f0f0ff" },
            { label: "Notices", value: announcements.filter(a => ["notice","info","holiday"].includes(a.tag)).length, color: "#0ea5e9", bg: "#f0f9ff" },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: 12, padding: "14px 16px", border: `1.5px solid ${s.color}33` }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: s.color, opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={15} color="var(--text-muted)" />
            </span>
            <input className="form-input" style={{ paddingLeft: 40 }} placeholder="Search announcements..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["all","All"], ["urgent","Urgent"], ["event","Event"], ["info","Info"], ["notice","Notice"], ["holiday","Holiday"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilterTag(val)}
                style={{
                  padding: "8px 16px", borderRadius: 20, fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit",
                  border: `2px solid ${filterTag === val ? (TAG_STYLES[val]?.color || "#9b6dff") : "var(--border)"}`,
                  background: filterTag === val ? (TAG_STYLES[val]?.bg || "#f5f3ff") : "#fff",
                  color: filterTag === val ? (TAG_STYLES[val]?.color || "#9b6dff") : "var(--text-secondary)",
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>Loading announcements…</div>
        ) : (
          <>
            {pinned.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 10 }}>📌 Pinned</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {pinned.map(a => <AnnouncementCard key={a._id} ann={a} />)}
                </div>
              </div>
            )}
            {regular.length > 0 && (
              <div>
                {pinned.length > 0 && <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 10 }}>All Announcements</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {regular.map(a => <AnnouncementCard key={a._id} ann={a} />)}
                </div>
              </div>
            )}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 16, border: "1.5px dashed var(--border)" }}>
                <div style={{ fontWeight: 700, color: "var(--text-secondary)", fontSize: 15 }}>No announcements found</div>
                <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Try a different filter or post a new one</div>
              </div>
            )}
          </>
        )}

        {/* POST MODAL */}
        {showModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 580, maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
              <div style={{ padding: "22px 28px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>Post New Announcement</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>Broadcast to students, teachers, or specific classes</div>
                </div>
                <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setErrors({}); }}
                  style={{ background: "var(--bg-main)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer" }}>
                  <Icon d="M18 6L6 18M6 6l12 12" size={16} />
                </button>
              </div>
              <div style={{ padding: "20px 28px", overflowY: "auto", flex: 1 }}>
                <div className="form-group">
                  <label className="form-label">Announcement Title *</label>
                  <input className={`form-input${errors.title ? " input-error" : ""}`}
                    placeholder="e.g. Final Exam Schedule Released"
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  {errors.title && <div style={{ color: "#e53e3e", fontSize: 11.5, marginTop: 4, fontWeight: 600 }}>{errors.title}</div>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {Object.entries(TAG_STYLES).map(([key, ts]) => (
                        <button key={key} onClick={() => setForm(f => ({ ...f, tag: key }))}
                          style={{
                            padding: "6px 14px", borderRadius: 20, border: `2px solid ${form.tag === key ? ts.color : "var(--border)"}`,
                            background: form.tag === key ? ts.bg : "#fff",
                            color: form.tag === key ? ts.color : "var(--text-secondary)",
                            fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                          }}>
                          {ts.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Audience</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[["all","All School"],["classes","Specific Classes"]].map(([val,label]) => (
                        <button key={val} onClick={() => setForm(f => ({ ...f, target: val, customClasses: [] }))}
                          style={{
                            flex: 1, padding: "8px 10px", borderRadius: 10, border: `2px solid ${form.target === val ? "#9b6dff" : "var(--border)"}`,
                            background: form.target === val ? "#f5f3ff" : "#fff",
                            color: form.target === val ? "#7c3aed" : "var(--text-secondary)",
                            fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                          }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {form.target === "classes" && (
                  <div className="form-group">
                    <label className="form-label">Select Classes</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {CLASS_LEVELS.map(c => {
                        const selected = form.customClasses.includes(c.id);
                        return (
                          <button key={c.id} onClick={() => toggleClass(c.id)}
                            style={{
                              padding: "5px 14px", borderRadius: 20, border: `2px solid ${selected ? "#9b6dff" : "var(--border)"}`,
                              background: selected ? "#f5f3ff" : "#fff",
                              color: selected ? "#7c3aed" : "var(--text-secondary)",
                              fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                            }}>
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea className={`form-input${errors.description ? " input-error" : ""}`}
                    rows={5} placeholder="Write your announcement here..."
                    style={{ resize: "vertical", minHeight: 120, lineHeight: 1.6 }}
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  {errors.description && <div style={{ color: "#e53e3e", fontSize: 11.5, marginTop: 4, fontWeight: 600 }}>{errors.description}</div>}
                </div>
                {errors.submit && <div style={{ color: "#e53e3e", fontSize: 12.5, marginTop: 8, fontWeight: 600 }}>{errors.submit}</div>}
              </div>
              <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: 12 }}>
                <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setErrors({}); }}
                  style={{ padding: "11px 22px", borderRadius: 10, border: "1.5px solid var(--border)", background: "#fff", color: "var(--text-secondary)", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                  Cancel
                </button>
                <button onClick={handlePost} disabled={submitting} className="btn-primary"
                  style={{ width: "auto", padding: "11px 30px", background: "linear-gradient(135deg, #9b6dff, #7c3aed)", opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? "Posting…" : "Post Announcement"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRM */}
        {deleteConfirm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", maxWidth: 380, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 800, marginBottom: 8 }}>Delete Announcement?</div>
              <div style={{ color: "var(--text-secondary)", fontSize: 13.5, marginBottom: 22 }}>This will permanently remove the announcement for everyone.</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setDeleteConfirm(null)}
                  style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid var(--border)", background: "#fff", color: "var(--text-secondary)", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm)}
                  style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#ff5c5c,#dc2626)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}