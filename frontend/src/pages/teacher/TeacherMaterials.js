import React, { useState } from "react";
import TeacherNavbar from "../../components/Teachernavbar";
import { teacherMaterials as initialMaterials } from "../../data/teacherMockData";
import { saveTeacherMaterials } from "../../services/sharedMaterials";

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const SUBJECT_CONFIG = {
  "Mathematics":      { iconPath: "M12 6v6m0 0v6m0-6h6m-6 0H6",                                                                               iconColor: "#e6a800", iconClass: "mat-maths",    tagClass: "mat-tag-maths"    },
  "Computer Science": { iconPath: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2", iconColor: "#2db87b", iconClass: "mat-computer", tagClass: "mat-tag-computer" },
  "English":          { iconPath: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z",           iconColor: "#9b6dff", iconClass: "mat-english",  tagClass: "mat-tag-english"  },
  "Science":          { iconPath: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18", iconColor: "#2db87b", iconClass: "mat-science",  tagClass: "mat-tag-science"  },
  "Urdu":             { iconPath: "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 0 1 6.412 9m6.088 9h7M11 21l5-10 5 10",                            iconColor: "#f97316", iconClass: "mat-default",  tagClass: "mat-tag-default"  },
  "Physics":          { iconPath: "M13 10V3L4 14h7v7l9-11h-7z",                                                                                iconColor: "#e6a800", iconClass: "mat-maths",    tagClass: "mat-tag-maths"    },
};

const getSubjectConfig = (subject) =>
  SUBJECT_CONFIG[subject] || {
    iconPath: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    iconColor: "#9aaabb",
    iconClass: "mat-default",
    tagClass: "mat-tag-default",
  };

const SUBJECTS     = ["Mathematics", "Computer Science", "English", "Science", "Urdu", "Physics"];
const CLASSES_LIST = ["10-A", "10-B", "9-A", "All Classes"];
const FILE_TYPES   = ["PDF", "PPT", "DOCX", "XLSX", "Other"];

const TYPE_BADGE = {
  PDF:   { color: "#e53e3e", bg: "#fff5f5" },
  PPT:   { color: "#e6a800", bg: "#fffbeb" },
  DOCX:  { color: "#2db87b", bg: "#f0fdf7" },
  XLSX:  { color: "#2db87b", bg: "#f0fdf7" },
  Other: { color: "#9b6dff", bg: "#f5f3ff" },
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const dt = new Date(dateStr);
  return dt.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Returns true if the URL can be embedded in an <iframe>.
 * Supports: blob URLs, Google Drive /preview links, and direct PDF URLs.
 */
function canEmbedUrl(url) {
  if (!url) return false;
  if (url.startsWith("blob:")) return true;
  if (url.includes("drive.google.com")) return true;
  // Direct PDF links (ends with .pdf or contains .pdf?)
  if (/\.pdf(\?|$)/i.test(url)) return true;
  return false;
}

// ── View-Only Preview Modal for Teacher (no download button) ──
function PreviewModal({ material, onClose }) {
  if (!material) return null;
  const cfg = getSubjectConfig(material.subject);
  const embedable = canEmbedUrl(material.fileUrl);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(26,35,50,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--bg-card, #fff)", borderRadius: "20px",
        width: "100%", maxWidth: "860px", maxHeight: "92vh",
        display: "flex", flexDirection: "column",
        boxShadow: "0 24px 80px rgba(0,0,0,0.22)", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: "14px",
          padding: "18px 24px", borderBottom: "1.5px solid var(--border, #e4eaf0)", flexShrink: 0,
        }}>
          <div className={`material-icon-wrap ${cfg.iconClass}`} style={{ flexShrink: 0 }}>
            <Icon d={cfg.iconPath} size={22} color={cfg.iconColor} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.3 }}>{material.title}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, marginTop: "2px" }}>
              {material.subject}{material.class ? ` · ${material.class}` : ""}{material.date ? ` · ${formatDate(material.date)}` : ""}
            </div>
          </div>
          {/* Teacher sees view-only label */}
          <span style={{
            padding: "5px 12px", borderRadius: "8px", background: "#f0fdf7",
            color: "#2db87b", fontWeight: 700, fontSize: "12px", flexShrink: 0,
          }}>
            View Only
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px", flexShrink: 0 }}>
            <Icon d="M18 6L6 18M6 6l12 12" size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{
          flex: 1, overflow: "auto",
          padding: embedable ? 0 : "40px 24px",
          display: "flex",
          alignItems: embedable ? "stretch" : "center",
          justifyContent: "center",
          minHeight: "520px",
        }}>
          {embedable ? (
            <iframe
              src={material.fileUrl}
              title={material.title}
              style={{ width: "100%", border: "none", minHeight: "520px", flex: 1 }}
              allow="autoplay"
            />
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 80, height: 80, borderRadius: "20px", background: "#f0fdf7",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
              }}>
                <span style={{ fontSize: "20px", fontWeight: 900, color: "#2db87b" }}>{material.type || "FILE"}</span>
              </div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>{material.title}</div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>
                {material.size ? `${material.size} · ` : ""}{material.subject}
              </div>
              <div style={{
                padding: "16px 24px", borderRadius: "12px",
                background: "var(--bg-main)", border: "1.5px dashed var(--border)",
                color: "var(--text-muted)", fontSize: "13px",
              }}>
                No preview available for this file type. Upload a PDF to enable inline preview.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TeacherMaterials() {
  const [materials, setMaterials]         = useState(initialMaterials);
  const [showUpload, setShowUpload]       = useState(false);
  const [form, setForm]                   = useState({ title: "", subject: "Mathematics", class: "10-A", type: "PDF", size: "", fileUrl: "", downloadUrl: "" });
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterClass, setFilterClass]     = useState("All");
  const [search, setSearch]               = useState("");
  const [uploaded, setUploaded]           = useState(false);
  const [uploadError, setUploadError]     = useState("");
  const [activeFilter, setActiveFilter]   = useState("All");
  const [previewMaterial, setPreviewMaterial] = useState(null);
  // Track selected file name for display
  const [selectedFileName, setSelectedFileName] = useState("");

  const ALL_SUBJECTS_FILTER = ["All", ...SUBJECTS];

  const persistMaterials = (list) => {
    try { saveTeacherMaterials(list); } catch (_) {}
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    const newMaterial = {
      id: Date.now(),
      title: form.title,
      subject: form.subject,
      class: form.class,
      date: new Date().toISOString().split("T")[0],
      type: form.type,
      size: form.size || "1.0 MB",
      fileUrl: form.fileUrl || null,
      downloadUrl: form.downloadUrl || form.fileUrl || null,
    };
    const updated = [newMaterial, ...materials];
    setMaterials(updated);
    persistMaterials(updated);
    setForm({ title: "", subject: "Mathematics", class: "10-A", type: "PDF", size: "", fileUrl: "", downloadUrl: "" });
    setSelectedFileName("");
    setShowUpload(false);
    setUploaded(true);
    setTimeout(() => setUploaded(false), 3000);
  };

  const handleDelete = (id) => {
    const updated = materials.filter(m => m.id !== id);
    setMaterials(updated);
    persistMaterials(updated);
  };

  const ALLOWED_EXTENSIONS = ["PDF", "PPT", "PPTX", "DOC", "DOCX", "XLS", "XLSX"];
  const MAX_FILE_SIZE_MB = 20;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toUpperCase();
    const sizeMB = file.size / (1024 * 1024);

    // TC-F12: Unsupported file type
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setUploadError(`File type not supported. Please upload PDF, DOCX, or PPT files only.`);
      setSelectedFileName("");
      e.target.value = "";
      return;
    }

    // TC-F13: File size exceeds limit
    if (sizeMB > MAX_FILE_SIZE_MB) {
      setUploadError(`File size exceeds the 20 MB limit. Please compress and try again.`);
      setSelectedFileName("");
      e.target.value = "";
      return;
    }

    setUploadError("");
    const type = FILE_TYPES.includes(ext) ? ext : (["PPTX"].includes(ext) ? "PPT" : ["DOCX"].includes(ext) ? "DOCX" : ["XLSX"].includes(ext) ? "XLSX" : "Other");
    const sizeDisplay = sizeMB.toFixed(1) + " MB";
    const blobUrl = URL.createObjectURL(file);
    setSelectedFileName(file.name);
    setForm(p => ({
      ...p,
      title: p.title || file.name.replace(/\.[^/.]+$/, ""),
      type,
      size: sizeDisplay,
      fileUrl: blobUrl,
      downloadUrl: blobUrl,
    }));
  };

  const filtered = materials.filter(m => {
    const sMatch = filterSubject === "All" || m.subject === filterSubject;
    const cMatch = filterClass   === "All" || m.class   === filterClass;
    const qMatch = !search || m.title.toLowerCase().includes(search.toLowerCase());
    return sMatch && cMatch && qMatch;
  });

  return (
    <div className="app-layout">
      <TeacherNavbar />
      <main className="main-content">

        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-greeting" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="page-header-icon icon-green">
              <Icon d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" size={18} color="#2db87b" />
            </div>
            <span>Learning Materials</span>
            <span style={{ color: "var(--text-muted)", fontWeight: 500, fontSize: "14px" }}>· {materials.length} uploads</span>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "9px 20px", borderRadius: "10px", border: "none",
              background: "linear-gradient(135deg, #2db87b, #1e9e63)",
              color: "#fff", fontWeight: 700, fontSize: "13.5px",
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 4px 12px rgba(45,184,123,0.35)", transition: "all 0.18s",
            }}
          >
            <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" size={16} color="#fff" />
            Upload Material
          </button>
        </div>

        {/* Success Banner */}
        {uploaded && (
          <div style={{
            padding: "12px 18px", borderRadius: "10px",
            background: "#f0fdf7", border: "1.5px solid #bbf7d0",
            color: "#2db87b", fontWeight: 700, fontSize: "13.5px",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <Icon d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={16} color="#2db87b" />
            Material uploaded successfully! Students can now view and download it.
          </div>
        )}

        {/* Upload Form */}
        {showUpload && (
          <div className="card" style={{ border: "2px solid rgba(45,184,123,0.27)", background: "linear-gradient(135deg, #f0fdf7, #fff)" }}>
            <div className="card-header" style={{ marginBottom: "18px" }}>
              <div className="card-title">
                <div className="card-title-icon icon-green">
                  <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" size={15} color="#2db87b" />
                </div>
                Upload New Material
              </div>
              <button onClick={() => { setShowUpload(false); setSelectedFileName(""); setUploadError(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <Icon d="M18 6L6 18M6 6l12 12" size={18} />
              </button>
            </div>

            {/* File drop zone */}
            <label htmlFor="teacher-file-input" style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
              padding: "24px", borderRadius: "12px",
              border: selectedFileName ? "2px solid #2db87b" : "2px dashed #bbf7d0",
              background: selectedFileName ? "#e8fdf3" : "#f0fdf7",
              cursor: "pointer", marginBottom: "18px", transition: "all 0.15s",
            }}>
              <Icon
                d={selectedFileName
                  ? "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                  : "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"}
                size={28}
                color={selectedFileName ? "#1e9e63" : "#2db87b"}
              />
              <div style={{ fontSize: "14px", fontWeight: 700, color: selectedFileName ? "#1e9e63" : "#2db87b" }}>
                {selectedFileName ? `✓ ${selectedFileName}` : "Click to choose a PDF file"}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {selectedFileName ? "Click again to change file" : "Accepted: PDF, PPT, PPTX, DOC, DOCX · Max 20 MB"}
              </div>
            </label>
            <input
              id="teacher-file-input"
              type="file"
              accept="*/*"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />

            {/* TC-F12 / TC-F13 error banner */}
            {uploadError && (
              <div style={{
                marginBottom: "14px", padding: "10px 16px", borderRadius: "10px",
                background: "#fff5f5", border: "1.5px solid #fca5a5",
                color: "#e53e3e", fontWeight: 700, fontSize: "13px",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                <Icon d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" size={16} color="#e53e3e" />
                {uploadError}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label className="form-label">Material Title</label>
                <input className="form-input" placeholder="e.g. Chapter 7 – Linear Equations"
                  value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Subject</label>
                <select className="form-input" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Class</label>
                <select className="form-input" value={form.class} onChange={e => setForm(p => ({ ...p, class: e.target.value }))}>
                  {CLASSES_LIST.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">File Type</label>
                <select className="form-input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  {FILE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginTop: "18px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => { setShowUpload(false); setSelectedFileName(""); setUploadError(""); }}
                style={{ padding: "10px 20px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg-main)", color: "var(--text-secondary)", fontWeight: 700, fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button onClick={handleSubmit}
                style={{ padding: "10px 28px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #2db87b, #1e9e63)", color: "#fff", fontWeight: 800, fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(45,184,123,0.35)" }}>
                Upload
              </button>
            </div>
          </div>
        )}

        {/* Subject Filter Chips */}
        <div className="page-wrapper" style={{ padding: 0 }}>
          <div className="materials-layout">
            <div className="materials-filters">
              {ALL_SUBJECTS_FILTER.map(subject => (
                <button
                  key={subject}
                  className={`filter-chip ${activeFilter === subject ? "active" : ""}`}
                  onClick={() => { setActiveFilter(subject); setFilterSubject(subject); }}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search + Class Filter */}
        <div className="card" style={{ padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>
                <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={15} color="#9aaabb" />
              </span>
              <input
                style={{ width: "100%", padding: "9px 12px 9px 36px", border: "1.5px solid var(--border)", borderRadius: "10px", background: "var(--bg-main)", color: "var(--text-primary)", fontSize: "13.5px", fontFamily: "inherit", outline: "none" }}
                placeholder="Search materials…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
              style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg-main)", color: "var(--text-primary)", fontWeight: 700, fontSize: "13px", fontFamily: "inherit", outline: "none" }}>
              <option value="All">All Classes</option>
              {CLASSES_LIST.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ fontSize: "12.5px", color: "var(--text-muted)", fontWeight: 600, padding: "4px 4px 8px" }}>
          Showing {filtered.length} material{filtered.length !== 1 ? "s" : ""}
        </div>

        {/* Cards Grid */}
        <div className="materials-grid">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Icon d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" size={28} color="#9aaabb" />
              </div>
              <div className="empty-state-title">No Materials Found</div>
              <div className="empty-state-sub">Upload some study materials to get started.</div>
            </div>
          ) : filtered.map((m) => {
            const cfg = getSubjectConfig(m.subject);
            const ts  = TYPE_BADGE[m.type] || TYPE_BADGE.Other;
            return (
              <div key={m.id} className="material-card">
                <div className="material-card-top">
                  <div className={`material-icon-wrap ${cfg.iconClass}`}>
                    <Icon d={cfg.iconPath} size={22} color={cfg.iconColor} />
                  </div>
                  <div className="material-card-info">
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
                      <span className={`material-subject-tag ${cfg.tagClass}`}>{m.subject}</span>
                      <span style={{ padding: "2px 8px", borderRadius: "50px", background: ts.bg, color: ts.color, fontSize: "10px", fontWeight: 900 }}>
                        {m.type}
                      </span>
                    </div>
                    <div className="material-title">{m.title}</div>
                  </div>
                </div>

                <div className="material-card-footer">
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <div className="material-date">
                      <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" size={12} color="#9aaabb" />
                      {formatDate(m.date)}
                    </div>
                    <span style={{ padding: "2px 8px", borderRadius: "6px", background: "#f0fdf7", color: "#2db87b", fontSize: "10.5px", fontWeight: 700 }}>
                      {m.class}
                    </span>
                    {m.size && <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>{m.size}</span>}
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    {/* Preview button — teacher can view (no download) */}
                    <button
                      onClick={() => setPreviewMaterial(m)}
                      style={{
                        display: "flex", alignItems: "center", gap: "5px",
                        padding: "4px 10px", borderRadius: "8px",
                        border: "1.5px solid #bbf7d0", background: "#f0fdf7",
                        color: "#2db87b", fontSize: "11.5px", fontWeight: 700,
                        cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" size={11} color="#2db87b" />
                      Preview
                    </button>
                    {/* Remove button */}
                    <button
                      onClick={() => handleDelete(m.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: "5px",
                        padding: "4px 10px", borderRadius: "8px",
                        border: "1.5px solid #fca5a5", background: "#fff5f5",
                        color: "#e53e3e", fontSize: "11.5px", fontWeight: 700,
                        cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      <Icon d="M18 6L6 18M6 6l12 12" size={11} color="#e53e3e" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* View-Only Preview Modal */}
      {previewMaterial && (
        <PreviewModal material={previewMaterial} onClose={() => setPreviewMaterial(null)} />
      )}
    </div>
  );
}

export default TeacherMaterials;