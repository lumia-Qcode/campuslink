import React, { useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import { CLASS_LEVELS } from "../../data/adminMockData";

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

const INITIAL_ANNOUNCEMENTS = [
  {
    id: 1, title: "Final Exam Schedule Released",
    description: "Final examinations will begin on April 20, 2026. The complete timetable has been published on the school notice board. All students are advised to start their preparation immediately. Parents are requested to ensure regular attendance during the exam period.",
    tag: "urgent", date: "2026-04-12", target: "all", targetLabel: "All School",
    author: "Admin Office", pinned: true,
  },
  {
    id: 2, title: "Annual Sports Day — April 30",
    description: "The Annual Sports Day will be held on April 30, 2026 at the school grounds. All students are encouraged to participate. Registration for events is open until April 20. Prizes and certificates will be awarded to winners.",
    tag: "event", date: "2026-04-10", target: "all", targetLabel: "All School",
    author: "Admin Office", pinned: false,
  },
  {
    id: 3, title: "Parent-Teacher Meeting — May 5",
    description: "A Parent-Teacher Meeting is scheduled for May 5, 2026. Parents of Classes 8, 9, and X are requested to attend from 9:00 AM to 12:00 PM. Class-wise schedule will be shared separately. Attendance is mandatory.",
    tag: "notice", date: "2026-04-08", target: "classes", targetLabel: "Class 8, 9, X",
    author: "Admin Office", pinned: false,
  },
  {
    id: 4, title: "Summer Break Dates Announced",
    description: "Summer vacations will commence from June 15, 2026 and school will reopen on August 1, 2026. Students are advised to complete their holiday homework. Detailed holiday assignments will be shared before the break.",
    tag: "holiday", date: "2026-04-05", target: "all", targetLabel: "All School",
    author: "Admin Office", pinned: false,
  },
  {
    id: 5, title: "New Library Books Available",
    description: "The school library has received a new collection of books across all subjects. Students can visit the library during break time and free periods. Book borrowing is allowed for a period of 7 days with a valid library card.",
    tag: "info", date: "2026-04-01", target: "all", targetLabel: "All School",
    author: "Admin Office", pinned: false,
  },
];

const EMPTY_FORM = { title: "", description: "", tag: "info", target: "all", customClasses: [] };

const formatDate = (d) => new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterTag, setFilterTag] = useState("all");
  const [search, setSearch] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [errors, setErrors] = useState({});

  const filtered = announcements.filter(a => {
    const matchTag = filterTag === "all" || a.tag === filterTag;
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  const pinned = filtered.filter(a => a.pinned);
  const regular = filtered.filter(a => !a.pinned);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePost = () => {
    if (!validate()) return;
    const targetLabel = form.target === "all"
      ? "All School"
      : form.customClasses.length > 0
        ? form.customClasses.map(id => CLASS_LEVELS.find(c => c.id === id)?.label || id).join(", ")
        : "All School";

    const newAnn = {
      id: Date.now(),
      title: form.title.trim(),
      description: form.description.trim(),
      tag: form.tag,
      date: new Date().toISOString().split("T")[0],
      target: form.target,
      targetLabel,
      author: "Admin Office",
      pinned: false,
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    setSuccessMsg(`Announcement "${form.title}" posted successfully.`);
    setTimeout(() => setSuccessMsg(""), 4000);
    setShowModal(false);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleDelete = (id) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    setDeleteConfirm(null);
  };

  const togglePin = (id) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));
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
    const isExpanded = expandedId === ann.id;

    return (
      <div style={{
        background: "#fff", borderRadius: 14, border: `1.5px solid ${ann.pinned ? tag.border : "var(--border)"}`,
        overflow: "hidden", boxShadow: ann.pinned ? `0 4px 20px ${tag.color}22` : "var(--shadow-sm)",
        transition: "all 0.2s",
      }}>
        {/* Top accent bar */}
        <div style={{ height: 3, background: tag.color }} />

        <div style={{ padding: "18px 20px" }}>
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
            {/* Tag icon bubble */}
            <div style={{ width: 40, height: 40, borderRadius: 12, background: tag.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon d={tag.icon} size={18} color={tag.color} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: tag.bg, color: tag.color, border: `1px solid ${tag.border}` }}>
                  {tag.label}
                </span>
                {ann.pinned && (
                  <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: "#fff8e1", color: "#b45309", border: "1px solid #fcd34d", display: "flex", alignItems: "center", gap: 4 }}>
                    <Icon d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" size={10} color="#b45309" /> Pinned
                  </span>
                )}
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                  <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={11} color="#9aaabb" />
                  {formatDate(ann.date)}
                </span>
              </div>

              <div style={{ fontFamily: "var(--font-display)", fontSize: 15.5, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.3, marginBottom: 6 }}>{ann.title}</div>

              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0,
                ...(isExpanded ? {} : { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" })
              }}>{ann.description}</p>

              {ann.description.length > 120 && (
                <button onClick={() => setExpandedId(isExpanded ? null : ann.id)}
                  style={{ background: "none", border: "none", color: tag.color, fontWeight: 700, fontSize: 12, cursor: "pointer", padding: "4px 0 0", fontFamily: "inherit" }}>
                  {isExpanded ? "Show less ↑" : "Read more ↓"}
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border)", marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11.5, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={12} color="#9aaabb" />
                {ann.author}
              </span>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--border)", display: "inline-block" }} />
              <span style={{ fontSize: 11.5, background: "var(--bg-main)", color: "var(--text-secondary)", padding: "2px 10px", borderRadius: 20, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" size={11} color="var(--text-muted)" />
                {ann.targetLabel}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => togglePin(ann.id)} title={ann.pinned ? "Unpin" : "Pin to top"}
                style={{ background: ann.pinned ? "#fff8e1" : "var(--bg-main)", border: "1.5px solid", borderColor: ann.pinned ? "#fcd34d" : "var(--border)", borderRadius: 8, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, color: ann.pinned ? "#b45309" : "var(--text-muted)" }}>
                <Icon d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" size={13} color={ann.pinned ? "#b45309" : "var(--text-muted)"} />
                {ann.pinned ? "Unpin" : "Pin"}
              </button>
              <button onClick={() => setDeleteConfirm(ann.id)}
                style={{ background: "#fff5f5", border: "1.5px solid #fca5a5", borderRadius: 8, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, color: "#dc2626" }}>
                <Icon d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" size={13} color="#dc2626" />
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

        {/* Page Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800 }}>Announcements</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>
              Post and manage school-wide communications
            </p>
          </div>
          <button className="btn-primary"
            style={{ width: "auto", padding: "12px 22px", background: "linear-gradient(135deg, #9b6dff, #7c3aed)", display: "flex", alignItems: "center", gap: 8 }}
            onClick={() => setShowModal(true)}>
            <Icon d="M12 5v14M5 12h14" size={15} color="#fff" />
            Post Announcement
          </button>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div style={{ background: "#e4f7ed", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#15803d", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon d="M9 11l3 3L22 4" size={15} color="#15803d" />
            {successMsg}
          </div>
        )}

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total",   value: announcements.length,                                   color: "#9b6dff", bg: "#f5f3ff" },
            { label: "Pinned",  value: announcements.filter(a=>a.pinned).length,               color: "#b45309", bg: "#fff8e1" },
            { label: "Urgent",  value: announcements.filter(a=>a.tag==="urgent").length,       color: "#e53e3e", bg: "#fff0f0" },
            { label: "Events",  value: announcements.filter(a=>a.tag==="event").length,        color: "#7c3aed", bg: "#f0f0ff" },
            { label: "Notices", value: announcements.filter(a=>a.tag==="notice"||a.tag==="info"||a.tag==="holiday").length, color: "#0ea5e9", bg: "#f0f9ff" },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: 12, padding: "14px 16px", border: `1.5px solid ${s.color}33` }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: s.color, opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
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
                  padding: "8px 16px", borderRadius: 20, fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  border: `2px solid ${filterTag === val ? (TAG_STYLES[val]?.color || "#9b6dff") : "var(--border)"}`,
                  background: filterTag === val ? (TAG_STYLES[val]?.bg || "#f5f3ff") : "#fff",
                  color: filterTag === val ? (TAG_STYLES[val]?.color || "#9b6dff") : "var(--text-secondary)",
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Pinned Section */}
        {pinned.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <Icon d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" size={13} color="#b45309" />
              Pinned
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pinned.map(a => <AnnouncementCard key={a.id} ann={a} />)}
            </div>
          </div>
        )}

        {/* Regular Announcements */}
        {regular.length > 0 && (
          <div>
            {pinned.length > 0 && (
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 10 }}>
                All Announcements
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {regular.map(a => <AnnouncementCard key={a.id} ann={a} />)}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 16, border: "1.5px dashed var(--border)" }}>
            <div style={{ width: 56, height: 56, background: "var(--bg-main)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={24} color="var(--text-muted)" />
            </div>
            <div style={{ fontWeight: 700, color: "var(--text-secondary)", fontSize: 15 }}>No announcements found</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Try a different filter or post a new one</div>
          </div>
        )}

        {/* POST MODAL */}
        {showModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 580, maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
              {/* Modal Header */}
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

              {/* Modal Body */}
              <div style={{ padding: "20px 28px", overflowY: "auto", flex: 1 }}>
                {/* Title */}
                <div className="form-group">
                  <label className="form-label">Announcement Title *</label>
                  <input className={`form-input${errors.title ? " input-error" : ""}`}
                    placeholder="e.g. Final Exam Schedule Released"
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  {errors.title && <div style={{ color: "#e53e3e", fontSize: 11.5, marginTop: 4, fontWeight: 600 }}>{errors.title}</div>}
                </div>

                {/* Type + Audience row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                  {/* Tag */}
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {Object.entries(TAG_STYLES).map(([key, ts]) => (
                        <button key={key} onClick={() => setForm(f => ({ ...f, tag: key }))}
                          style={{
                            padding: "6px 14px", borderRadius: 20, border: `2px solid ${form.tag === key ? ts.color : "var(--border)"}`,
                            background: form.tag === key ? ts.bg : "#fff",
                            color: form.tag === key ? ts.color : "var(--text-secondary)",
                            fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                          }}>
                          {ts.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target */}
                  <div className="form-group">
                    <label className="form-label">Audience</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[["all","All School"],["classes","Specific Classes"]].map(([val,label]) => (
                        <button key={val} onClick={() => setForm(f => ({ ...f, target: val, customClasses: [] }))}
                          style={{
                            flex: 1, padding: "8px 10px", borderRadius: 10, border: `2px solid ${form.target === val ? "#9b6dff" : "var(--border)"}`,
                            background: form.target === val ? "#f5f3ff" : "#fff",
                            color: form.target === val ? "#7c3aed" : "var(--text-secondary)",
                            fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                          }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Class picker */}
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
                              fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                            }}>
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea className={`form-input${errors.description ? " input-error" : ""}`}
                    rows={5} placeholder="Write your announcement here..."
                    style={{ resize: "vertical", minHeight: 120, lineHeight: 1.6 }}
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  {errors.description && <div style={{ color: "#e53e3e", fontSize: 11.5, marginTop: 4, fontWeight: 600 }}>{errors.description}</div>}
                </div>

                {/* Preview chip */}
                {form.title && (
                  <div style={{ background: (TAG_STYLES[form.tag]?.bg || "#f5f3ff"), border: `1.5px solid ${TAG_STYLES[form.tag]?.border || "#e9d5ff"}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon d={TAG_STYLES[form.tag]?.icon || TAG_STYLES.info.icon} size={16} color={TAG_STYLES[form.tag]?.color || "#9b6dff"} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13, color: TAG_STYLES[form.tag]?.color || "#7c3aed" }}>{form.title}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                        {TAG_STYLES[form.tag]?.label} · {form.target === "all" ? "All School" : form.customClasses.length > 0 ? `${form.customClasses.length} class(es)` : "No classes selected"}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: 12 }}>
                <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setErrors({}); }}
                  style={{ padding: "11px 22px", borderRadius: 10, border: "1.5px solid var(--border)", background: "#fff", color: "var(--text-secondary)", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                  Cancel
                </button>
                <button onClick={handlePost} className="btn-primary"
                  style={{ width: "auto", padding: "11px 30px", background: "linear-gradient(135deg, #9b6dff, #7c3aed)", display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={15} color="#fff" />
                  Post Announcement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRM */}
        {deleteConfirm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", maxWidth: 380, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
              <div style={{ width: 52, height: 52, background: "#fff5f5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Icon d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" size={22} color="#dc2626" />
              </div>
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
