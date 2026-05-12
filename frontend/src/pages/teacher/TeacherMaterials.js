import React, { useState, useEffect } from "react";
import TeacherNavbar from "../../components/Teachernavbar";
import { apiGetMaterials, apiUploadMaterial, apiDeleteMaterial, apiGetMyTeacherProfile } from "../../services/api";

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const SUBJECT_CONFIG = {
  "Mathematics":      { iconPath: "M12 6v6m0 0v6m0-6h6m-6 0H6", iconColor: "#e6a800", iconClass: "mat-maths", tagClass: "mat-tag-maths" },
  "Computer Science": { iconPath: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2", iconColor: "#2db87b", iconClass: "mat-computer", tagClass: "mat-tag-computer" },
  "English":          { iconPath: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z", iconColor: "#9b6dff", iconClass: "mat-english", tagClass: "mat-tag-english" },
  "Science":          { iconPath: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18", iconColor: "#2db87b", iconClass: "mat-science", tagClass: "mat-tag-science" },
  "Physics":          { iconPath: "M13 10V3L4 14h7v7l9-11h-7z", iconColor: "#e6a800", iconClass: "mat-maths", tagClass: "mat-tag-maths" },
  "Urdu":             { iconPath: "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 0 1 6.412 9m6.088 9h7M11 21l5-10 5 10", iconColor: "#f97316", iconClass: "mat-default", tagClass: "mat-tag-default" },
};
const getSubjectConfig = (subject) =>
  SUBJECT_CONFIG[subject] || { iconPath: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", iconColor: "#9aaabb", iconClass: "mat-default", tagClass: "mat-tag-default" };

const FILE_TYPES = ["PDF", "PPT", "DOCX", "XLSX", "Other"];
const TYPE_BADGE = {
  PDF: { color: "#e53e3e", bg: "#fff5f5" }, PPT: { color: "#e6a800", bg: "#fffbeb" },
  DOCX: { color: "#2db87b", bg: "#f0fdf7" }, XLSX: { color: "#2db87b", bg: "#f0fdf7" }, Other: { color: "#9b6dff", bg: "#f5f3ff" },
};
const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "";
const canEmbed = (url) => !url ? false : url.startsWith("blob:") || url.includes("drive.google.com") || /\.pdf(\?|$)/i.test(url);

function PreviewModal({ material, onClose }) {
  if (!material) return null;
  const cfg = getSubjectConfig(material.subject);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(26,35,50,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--bg-card, #fff)", borderRadius: "20px", width: "100%", maxWidth: "860px", maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.22)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "18px 24px", borderBottom: "1.5px solid var(--border, #e4eaf0)", flexShrink: 0 }}>
          <div className={`material-icon-wrap ${cfg.iconClass}`} style={{ flexShrink: 0 }}>
            <Icon d={cfg.iconPath} size={22} color={cfg.iconColor} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>{material.title}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, marginTop: "2px" }}>{material.subject} · {material.classId}-{material.section}</div>
          </div>
          <span style={{ padding: "5px 12px", borderRadius: "8px", background: "#f0fdf7", color: "#2db87b", fontWeight: 700, fontSize: "12px" }}>View Only</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}>
            <Icon d="M18 6L6 18M6 6l12 12" size={20} />
          </button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: canEmbed(material.fileUrl) ? 0 : "40px 24px", display: "flex", alignItems: canEmbed(material.fileUrl) ? "stretch" : "center", justifyContent: "center", minHeight: "520px" }}>
          {canEmbed(material.fileUrl) ? (
            <iframe src={material.fileUrl} title={material.title} style={{ width: "100%", border: "none", minHeight: "520px", flex: 1 }} allow="autoplay" />
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: "20px", background: "#f0fdf7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <span style={{ fontSize: "20px", fontWeight: 900, color: "#2db87b" }}>{material.fileType || "FILE"}</span>
              </div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>{material.title}</div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>{material.subject}</div>
              {material.fileUrl && (
                <a href={material.fileUrl} target="_blank" rel="noreferrer"
                  style={{ padding: "10px 24px", borderRadius: "10px", background: "linear-gradient(135deg, #2db87b, #1e9e63)", color: "#fff", fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
                  Open / Download
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TeacherMaterials() {
  const [materials, setMaterials]         = useState([]);
  const [sectionList, setSectionList]     = useState([]);
  const [allSubjects, setAllSubjects]     = useState([]);
  const [showUpload, setShowUpload]       = useState(false);
  const [form, setForm]                   = useState({ title: "", subject: "", classId: "", section: "", fileType: "PDF", fileSize: "", fileUrl: "" });
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterSection, setFilterSection] = useState("All");
  const [search, setSearch]               = useState("");
  const [loading, setLoading]             = useState(true);
  const [uploading, setUploading]         = useState(false);
  const [uploaded, setUploaded]           = useState(false);
  const [uploadError, setUploadError]     = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [previewMaterial, setPreviewMaterial]   = useState(null);

  useEffect(() => {
    Promise.all([apiGetMaterials(), apiGetMyTeacherProfile()])
      .then(([matRes, profRes]) => {
        setMaterials(matRes.data || []);
        const prof = profRes.data;
        const seen = new Map();
        const subjSet = new Set();
        (prof.assignedSections || []).forEach(s => {
          const key = `${s.classId}|${s.section}`;
          if (!seen.has(key)) seen.set(key, { classId: s.classId, section: s.section, label: `${s.classId}-${s.section}` });
          subjSet.add(s.subject);
        });
        const list = [...seen.values()];
        setSectionList(list);
        setAllSubjects([...subjSet]);
        if (list.length) { setForm(p => ({ ...p, classId: list[0].classId, section: list[0].section, subject: [...subjSet][0] || "" })); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const ALLOWED_EXTENSIONS = ["PDF", "PPT", "PPTX", "DOC", "DOCX", "XLS", "XLSX"];
  const MAX_FILE_SIZE_MB = 20;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toUpperCase();
    const sizeMB = file.size / (1024 * 1024);
    if (!ALLOWED_EXTENSIONS.includes(ext)) { setUploadError("Unsupported file type. Use PDF, DOCX, PPT, XLSX."); setSelectedFileName(""); e.target.value = ""; return; }
    if (sizeMB > MAX_FILE_SIZE_MB) { setUploadError("File exceeds 20 MB limit."); setSelectedFileName(""); e.target.value = ""; return; }
    setUploadError("");
    const type = { PPTX: "PPT", DOC: "DOCX", XLS: "XLSX" }[ext] || (FILE_TYPES.includes(ext) ? ext : "Other");
    const sizeDisplay = sizeMB.toFixed(1) + " MB";
    const blobUrl = URL.createObjectURL(file);
    setSelectedFileName(file.name);
    setForm(p => ({ ...p, title: p.title || file.name.replace(/\.[^/.]+$/, ""), fileType: type, fileSize: sizeDisplay, fileUrl: blobUrl }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { setUploadError("Title is required."); return; }
    if (!form.fileUrl) { setUploadError("Please select a file."); return; }
    setUploading(true);
    try {
      const res = await apiUploadMaterial({ title: form.title, subject: form.subject, classId: form.classId, section: form.section, fileType: form.fileType, fileSize: form.fileSize, fileUrl: form.fileUrl });
      setMaterials(prev => [res.data, ...prev]);
      setForm(p => ({ ...p, title: "", fileUrl: "", fileSize: "" }));
      setSelectedFileName("");
      setShowUpload(false);
      setUploaded(true);
      setTimeout(() => setUploaded(false), 3000);
    } catch (e) {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiDeleteMaterial(id);
      setMaterials(prev => prev.filter(m => (m._id || m.id) !== id));
    } catch (_) { alert("Failed to delete material."); }
  };

  const filtered = materials.filter(m => {
    const sMatch = filterSubject === "All" || m.subject === filterSubject;
    const secMatch = filterSection === "All" || `${m.classId}-${m.section}` === filterSection;
    const qMatch = !search || m.title.toLowerCase().includes(search.toLowerCase());
    return sMatch && secMatch && qMatch;
  });

  const ALL_SUBJECTS_FILTER = ["All", ...allSubjects];
  const ALL_SECTIONS_FILTER = ["All", ...sectionList.map(s => s.label)];

  return (
    <div className="app-layout">
      <TeacherNavbar />
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-greeting" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="page-header-icon icon-green">
              <Icon d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" size={18} color="#2db87b" />
            </div>
            <span>Learning Materials</span>
            <span style={{ color: "var(--text-muted)", fontWeight: 500, fontSize: "14px" }}>· {materials.length} uploads</span>
          </div>
          <button onClick={() => setShowUpload(!showUpload)}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 20px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #2db87b, #1e9e63)", color: "#fff", fontWeight: 700, fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(45,184,123,0.35)" }}>
            <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" size={16} color="#fff" />
            Upload Material
          </button>
        </div>

        {uploaded && (
          <div style={{ padding: "12px 18px", borderRadius: "10px", background: "#f0fdf7", border: "1.5px solid #bbf7d0", color: "#2db87b", fontWeight: 700, fontSize: "13.5px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Icon d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={16} color="#2db87b" />
            Material uploaded successfully! Students can now view it.
          </div>
        )}

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

            <label htmlFor="teacher-file-input" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "24px", borderRadius: "12px", border: selectedFileName ? "2px solid #2db87b" : "2px dashed #bbf7d0", background: selectedFileName ? "#e8fdf3" : "#f0fdf7", cursor: "pointer", marginBottom: "18px" }}>
              <Icon d={selectedFileName ? "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" : "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"} size={28} color={selectedFileName ? "#1e9e63" : "#2db87b"} />
              <div style={{ fontSize: "14px", fontWeight: 700, color: selectedFileName ? "#1e9e63" : "#2db87b" }}>{selectedFileName ? `✓ ${selectedFileName}` : "Click to choose a file"}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>PDF, PPT, PPTX, DOC, DOCX · Max 20 MB</div>
            </label>
            <input id="teacher-file-input" type="file" accept="*/*" style={{ display: "none" }} onChange={handleFileSelect} />

            {uploadError && (
              <div style={{ marginBottom: "14px", padding: "10px 16px", borderRadius: "10px", background: "#fff5f5", border: "1.5px solid #fca5a5", color: "#e53e3e", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" size={16} color="#e53e3e" />
                {uploadError}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label className="form-label">Material Title</label>
                <input className="form-input" placeholder="e.g. Chapter 7 – Linear Equations" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Subject</label>
                <select className="form-input" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}>
                  {allSubjects.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Section</label>
                <select className="form-input" value={`${form.classId}|${form.section}`} onChange={e => {
                  const [classId, section] = e.target.value.split("|");
                  setForm(p => ({ ...p, classId, section }));
                }}>
                  {sectionList.map(s => <option key={s.label} value={`${s.classId}|${s.section}`}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">File Type</label>
                <select className="form-input" value={form.fileType} onChange={e => setForm(p => ({ ...p, fileType: e.target.value }))}>
                  {FILE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginTop: "18px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => { setShowUpload(false); setSelectedFileName(""); setUploadError(""); }}
                style={{ padding: "10px 20px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg-main)", color: "var(--text-secondary)", fontWeight: 700, fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={handleSubmit} disabled={uploading}
                style={{ padding: "10px 28px", borderRadius: "10px", border: "none", background: uploading ? "#9aaabb" : "linear-gradient(135deg, #2db87b, #1e9e63)", color: "#fff", fontWeight: 800, fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(45,184,123,0.35)" }}>
                {uploading ? "Uploading…" : "Upload"}
              </button>
            </div>
          </div>
        )}

        {/* Subject filter chips */}
        <div className="page-wrapper" style={{ padding: 0 }}>
          <div className="materials-layout">
            <div className="materials-filters">
              {ALL_SUBJECTS_FILTER.map(subject => (
                <button key={subject} className={`filter-chip ${filterSubject === subject ? "active" : ""}`} onClick={() => setFilterSubject(subject)}>{subject}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>
                <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={15} color="#9aaabb" />
              </span>
              <input style={{ width: "100%", padding: "9px 12px 9px 36px", border: "1.5px solid var(--border)", borderRadius: "10px", background: "var(--bg-main)", color: "var(--text-primary)", fontSize: "13.5px", fontFamily: "inherit", outline: "none" }}
                placeholder="Search materials…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select value={filterSection} onChange={e => setFilterSection(e.target.value)}
              style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg-main)", color: "var(--text-primary)", fontWeight: 700, fontSize: "13px", fontFamily: "inherit", outline: "none" }}>
              {ALL_SECTIONS_FILTER.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ fontSize: "12.5px", color: "var(--text-muted)", fontWeight: 600, padding: "4px 4px 8px" }}>
          Showing {filtered.length} material{filtered.length !== 1 ? "s" : ""}
        </div>

        <div className="materials-grid">
          {loading ? (
            <div className="empty-state"><div className="empty-state-title">Loading…</div></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Icon d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" size={28} color="#9aaabb" /></div>
              <div className="empty-state-title">No Materials Found</div>
              <div className="empty-state-sub">Upload some study materials to get started.</div>
            </div>
          ) : filtered.map(m => {
            const cfg = getSubjectConfig(m.subject);
            const ts  = TYPE_BADGE[m.fileType] || TYPE_BADGE.Other;
            const id  = m._id || m.id;
            return (
              <div key={id} className="material-card">
                <div className="material-card-top">
                  <div className={`material-icon-wrap ${cfg.iconClass}`}>
                    <Icon d={cfg.iconPath} size={22} color={cfg.iconColor} />
                  </div>
                  <div className="material-card-info">
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
                      <span className={`material-subject-tag ${cfg.tagClass}`}>{m.subject}</span>
                      <span style={{ padding: "2px 8px", borderRadius: "50px", background: ts.bg, color: ts.color, fontSize: "10px", fontWeight: 900 }}>{m.fileType}</span>
                    </div>
                    <div className="material-title">{m.title}</div>
                  </div>
                </div>
                <div className="material-card-footer">
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <div className="material-date">
                      <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" size={12} color="#9aaabb" />
                      {formatDate(m.createdAt)}
                    </div>
                    <span style={{ padding: "2px 8px", borderRadius: "6px", background: "#f0fdf7", color: "#2db87b", fontSize: "10.5px", fontWeight: 700 }}>{m.classId}-{m.section}</span>
                    {m.fileSize && <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>{m.fileSize}</span>}
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => setPreviewMaterial(m)}
                      style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "8px", border: "1.5px solid #bbf7d0", background: "#f0fdf7", color: "#2db87b", fontSize: "11.5px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" size={11} color="#2db87b" />
                      Preview
                    </button>
                    <button onClick={() => handleDelete(id)}
                      style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "8px", border: "1.5px solid #fca5a5", background: "#fff5f5", color: "#e53e3e", fontSize: "11.5px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
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
      {previewMaterial && <PreviewModal material={previewMaterial} onClose={() => setPreviewMaterial(null)} />}
    </div>
  );
}
export default TeacherMaterials;
