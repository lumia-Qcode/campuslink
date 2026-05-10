import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import { materials as mockMaterials } from "../../data/mockData";
import { teacherMaterials } from "../../data/teacherMockData";
import { loadTeacherMaterials } from "../../services/sharedMaterials";

const Icon = ({ d, size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const SUBJECT_CONFIG = {
  Mathematics:        { iconPath: "M12 6v6m0 0v6m0-6h6m-6 0H6",                                                                                         iconColor: "#e6a800", iconClass: "mat-maths",    tagClass: "mat-tag-maths"    },
  English:            { iconPath: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z",                     iconColor: "#9b6dff", iconClass: "mat-english",  tagClass: "mat-tag-english"  },
  "Computer Science": { iconPath: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2", iconColor: "#4f8ef7", iconClass: "mat-computer", tagClass: "mat-tag-computer" },
  Science:            { iconPath: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18",     iconColor: "#2db87b", iconClass: "mat-science",  tagClass: "mat-tag-science"  },
  Urdu:               { iconPath: "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 0 1 6.412 9m6.088 9h7M11 21l5-10 5 10",                                       iconColor: "#f97316", iconClass: "mat-default",  tagClass: "mat-tag-default"  },
  Physics:            { iconPath: "M13 10V3L4 14h7v7l9-11h-7z",                                                                                          iconColor: "#e6a800", iconClass: "mat-maths",    tagClass: "mat-tag-maths"    },
};

const SUBJECT_ALIASES = {
  Maths:    "Mathematics",
  Computer: "Computer Science",
};

const normaliseSubject = (s) => SUBJECT_ALIASES[s] || s;

const getSubjectConfig = (subject) =>
  SUBJECT_CONFIG[normaliseSubject(subject)] || {
    iconPath: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    iconColor: "#9aaabb",
    iconClass: "mat-default",
    tagClass: "mat-tag-default",
  };

/**
 * Returns true if the URL can be embedded in an <iframe>.
 * Supports: blob URLs, Google Drive /preview links, and direct PDF URLs.
 */
function canEmbedUrl(url) {
  if (!url) return false;
  if (url.startsWith("blob:")) return true;
  if (url.includes("drive.google.com")) return true;
  if (/\.pdf(\?|$)/i.test(url)) return true;
  return false;
}

function getMergedMaterials() {
  // Load teacher-uploaded materials (persisted or from mock data)
  const teacherUploads = loadTeacherMaterials(teacherMaterials).map(m => ({
    ...m,
    subject: normaliseSubject(m.subject),
    _fromTeacher: true,
  }));
  // mockMaterials is now empty — only teacher uploads show for students
  const studentMaterials = mockMaterials.map(m => ({ ...m, subject: normaliseSubject(m.subject) }));
  return [...studentMaterials, ...teacherUploads];
}

function buildSubjectList(materials) {
  const seen = new Set(["All"]);
  const list = ["All"];
  materials.forEach(m => {
    const s = normaliseSubject(m.subject);
    if (!seen.has(s)) { seen.add(s); list.push(s); }
  });
  return list;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const dt = new Date(dateStr);
  return dt.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

// ── Student Material Modal — preview + download ──────────────────────────────
function MaterialModal({ material, onClose }) {
  const [downloading, setDownloading] = React.useState(false);

  if (!material) return null;

  const embedable = canEmbedUrl(material.fileUrl);
  const downloadSrc = material.downloadUrl || material.fileUrl || null;

  /**
   * Force a real file download by fetching the PDF as a blob,
   * creating a temporary object URL, and clicking a hidden anchor.
   * This bypasses the browser's "open PDF in tab" behaviour for
   * cross-origin URLs where the `download` attribute is ignored.
   */
  const handleDownload = async () => {
    if (!downloadSrc || downloading) return;

    // Blob URLs (device-uploaded files) already work with a plain anchor click
    if (downloadSrc.startsWith("blob:")) {
      const a = document.createElement("a");
      a.href = downloadSrc;
      a.download = material.title || "file";
      a.click();
      return;
    }

    setDownloading(true);
    try {
      const response = await fetch(downloadSrc);
      if (!response.ok) throw new Error("Fetch failed");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      // Derive a sensible filename: use title + .pdf if no extension present
      const hasExt = /\.[a-z0-9]{2,5}$/i.test(material.title || "");
      a.download = hasExt ? material.title : `${material.title || "file"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
      // TC-F07: File not available — show user-friendly error instead of silently opening a tab
      alert("File not available. Please contact your teacher.");
    } finally {
      setDownloading(false);
    }
  };

  const cfg = getSubjectConfig(material.subject);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(26,35,50,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--bg-card, #fff)", borderRadius: "20px",
          width: "100%", maxWidth: "860px", maxHeight: "92vh",
          display: "flex", flexDirection: "column",
          boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: "14px",
          padding: "18px 24px", borderBottom: "1.5px solid var(--border, #e4eaf0)",
          flexShrink: 0,
        }}>
          <div className={`material-icon-wrap ${cfg.iconClass}`} style={{ flexShrink: 0 }}>
            <Icon d={cfg.iconPath} size={22} color={cfg.iconColor} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.3 }}>{material.title}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, marginTop: "2px" }}>
              {normaliseSubject(material.subject)}
              {material._fromTeacher && material.class ? ` · ${material.class}` : ""}
              {material.date ? ` · ${formatDate(material.date)}` : ""}
            </div>
          </div>

          {/* Students always get a download button — fetches blob to force save-to-disk */}
          {downloadSrc && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 14px", borderRadius: "10px",
                background: downloading ? "#d1fae5" : "var(--green-light, #e8f8f1)",
                color: "var(--green-dark, #1e9e63)",
                fontWeight: 700, fontSize: "12.5px",
                border: "none", cursor: downloading ? "wait" : "pointer",
                flexShrink: 0, fontFamily: "inherit",
                opacity: downloading ? 0.7 : 1,
                transition: "opacity 0.15s",
              }}
            >
              <Icon d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={14} color="var(--green-dark, #1e9e63)" />
              {downloading ? "Downloading…" : "Download"}
            </button>
          )}

          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px", flexShrink: 0 }}
          >
            <Icon d="M18 6L6 18M6 6l12 12" size={20} />
          </button>
        </div>

        {/* Modal Body */}
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
                width: 80, height: 80, borderRadius: "20px",
                background: "#f0fdf7", display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <span style={{ fontSize: "20px", fontWeight: 900, color: "var(--green-dark,#1e9e63)" }}>{material.type || "FILE"}</span>
              </div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>{material.title}</div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>
                {material.size ? `${material.size} · ` : ""}{normaliseSubject(material.subject)}
              </div>
              {downloadSrc ? (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    padding: "11px 24px", borderRadius: "12px",
                    background: "linear-gradient(135deg, var(--green-primary,#2db87b), var(--green-dark,#1e9e63))",
                    color: "#fff", fontWeight: 700, fontSize: "14px",
                    border: "none", cursor: downloading ? "wait" : "pointer",
                    fontFamily: "inherit", opacity: downloading ? 0.7 : 1,
                  }}
                >
                  <Icon d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={16} color="#fff" />
                  {downloading ? "Downloading…" : "Download File"}
                </button>
              ) : (
                <div style={{ padding: "16px 24px", borderRadius: "12px", background: "#fff5f5", border: "1.5px solid #fca5a5", color: "#e53e3e", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "10px" }}>
                  <Icon d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" size={18} color="#e53e3e" />
                  File not available. Please contact your teacher.
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
function Materials() {
  const [materials]   = useState(getMergedMaterials);
  const [activeFilter, setActiveFilter] = useState("All");
  const [openMaterial, setOpenMaterial] = useState(null);

  const ALL_SUBJECTS = buildSubjectList(materials);

  const filtered = activeFilter === "All"
    ? materials
    : materials.filter(m => normaliseSubject(m.subject) === activeFilter);

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-wrapper">

          {/* Header */}
          <div className="page-header">
            <div className="page-header-icon icon-green">
              <Icon d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" size={22} color="var(--green-dark,#1e9e63)" />
            </div>
            <div>
              <div className="page-title">Learning Materials</div>
              <div className="page-subtitle">{materials.length} resources available</div>
            </div>
          </div>

          <div className="materials-layout">
            {/* Subject filters */}
            <div className="materials-filters">
              {ALL_SUBJECTS.map(subject => (
                <button
                  key={subject}
                  className={`filter-chip ${activeFilter === subject ? "active" : ""}`}
                  onClick={() => setActiveFilter(subject)}
                >
                  {subject}
                </button>
              ))}
            </div>

            {/* Cards grid */}
            <div className="materials-grid">
              {filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" size={28} color="#9aaabb" />
                  </div>
                  <div className="empty-state-title">No Materials Found</div>
                  <div className="empty-state-sub">
                    {activeFilter === "All"
                      ? "No learning materials are available yet. Your teacher has not uploaded any files."
                      : `No materials available for ${activeFilter}.`}
                  </div>
                </div>
              ) : (
                filtered.map((mat, index) => {
                  const cfg = getSubjectConfig(mat.subject);
                  return (
                    <div className="material-card" key={mat.id ?? index}>
                      <div className="material-card-top">
                        <div className={`material-icon-wrap ${cfg.iconClass}`}>
                          <Icon d={cfg.iconPath} size={22} color={cfg.iconColor} />
                        </div>
                        <div className="material-card-info">
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
                            <span className={`material-subject-tag ${cfg.tagClass}`}>{normaliseSubject(mat.subject)}</span>
                            {mat._fromTeacher && mat.type && (
                              <span style={{ padding: "2px 7px", borderRadius: "50px", background: "#f0fdf7", color: "var(--green-dark,#1e9e63)", fontSize: "9.5px", fontWeight: 900 }}>
                                {mat.type}
                              </span>
                            )}
                            {mat._fromTeacher && mat.class && (
                              <span style={{ padding: "2px 7px", borderRadius: "50px", background: "#f0fdf7", color: "#2db87b", fontSize: "9.5px", fontWeight: 800 }}>
                                {mat.class}
                              </span>
                            )}
                          </div>
                          <div className="material-title">{mat.title}</div>
                        </div>
                      </div>
                      <div className="material-card-footer">
                        <div className="material-date">
                          <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" size={12} color="#9aaabb" />
                          {formatDate(mat.date)}
                        </div>
                        <button
                          className="material-open-btn"
                          onClick={() => setOpenMaterial(mat)}
                        >
                          <Icon d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14" size={12} color="var(--green-dark, #1e9e63)" />
                          Open
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* File viewer modal with preview + download */}
        {openMaterial && (
          <MaterialModal
            material={openMaterial}
            onClose={() => setOpenMaterial(null)}
          />
        )}
      </main>
    </div>
  );
}

export default Materials;