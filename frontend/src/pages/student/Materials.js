import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { apiStudentGetMaterials } from "../../services/api";

const Icon = ({ d, size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const SUBJECT_CONFIG = {
  Mathematics:        { iconPath: "M12 6v6m0 0v6m0-6h6m-6 0H6", iconColor: "#e6a800", iconClass: "mat-maths", tagClass: "mat-tag-maths" },
  English:            { iconPath: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z", iconColor: "#9b6dff", iconClass: "mat-english", tagClass: "mat-tag-english" },
  "Computer Science": { iconPath: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2", iconColor: "#4f8ef7", iconClass: "mat-computer", tagClass: "mat-tag-computer" },
  Science:            { iconPath: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18", iconColor: "#2db87b", iconClass: "mat-science", tagClass: "mat-tag-science" },
  Physics:            { iconPath: "M13 10V3L4 14h7v7l9-11h-7z", iconColor: "#e6a800", iconClass: "mat-maths", tagClass: "mat-tag-maths" },
};

function getSubjectConfig(subject) {
  return SUBJECT_CONFIG[subject] || {
    iconPath: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    iconColor: "#9aaabb", iconClass: "mat-default", tagClass: "mat-tag-default",
  };
}

function canEmbedUrl(url) {
  if (!url) return false;
  if (url.startsWith("blob:")) return true;
  if (url.includes("drive.google.com")) return true;
  if (/\.pdf(\?|$)/i.test(url)) return true;
  return false;
}

function Materials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeSubject, setActiveSubject] = useState("All");
  const [previewUrl, setPreviewUrl]       = useState(null);
  const [previewTitle, setPreviewTitle]   = useState("");

  useEffect(() => {
    apiStudentGetMaterials()
      .then(res => {
        setMaterials(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="app-layout"><Navbar />
        <main className="main-content">
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)" }}>Loading materials…</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-layout"><Navbar />
        <main className="main-content">
          <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ color: "#e53e3e" }}>Failed to load materials</div>
            <div style={{ color: "var(--text-muted)", fontSize: 14 }}>{error}</div>
          </div>
        </main>
      </div>
    );
  }

  const subjects = ["All", ...Array.from(new Set(materials.map(m => m.subject))).sort()];
  const filtered = activeSubject === "All" ? materials : materials.filter(m => m.subject === activeSubject);

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {/* Preview modal */}
        {previewUrl && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={() => setPreviewUrl(null)}>
            <div style={{ background: "var(--card-bg)", borderRadius: 16, overflow: "hidden", width: "90%", maxWidth: 800, height: "80vh", display: "flex", flexDirection: "column" }}
              onClick={e => e.stopPropagation()}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700 }}>{previewTitle}</span>
                <button onClick={() => setPreviewUrl(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 20 }}>×</button>
              </div>
              <iframe src={previewUrl} title={previewTitle} style={{ flex: 1, border: "none" }} />
            </div>
          </div>
        )}

        <div className="page-wrapper">
          <div className="page-header">
            <div className="page-header-icon icon-blue">
              <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" size={22} color="#4f8ef7" />
            </div>
            <div>
              <div className="page-title">Study Materials</div>
              <div className="page-subtitle">{materials.length} file{materials.length !== 1 ? "s" : ""} uploaded by your teachers</div>
            </div>
          </div>

          {/* Subject filter */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {subjects.map(s => (
              <button key={s} onClick={() => setActiveSubject(s)}
                className={activeSubject === s ? "filter-chip active" : "filter-chip"}
                style={{ cursor: "pointer" }}>{s}</button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "64px 24px" }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>No Materials Yet</div>
              <div style={{ color: "var(--text-muted)", marginTop: 8 }}>
                {activeSubject === "All" ? "Your teachers haven't uploaded any materials for your section." : `No materials for ${activeSubject} yet.`}
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {filtered.map((m, i) => {
                const cfg = getSubjectConfig(m.subject);
                const uploadDate = m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "";
                const canEmbed   = canEmbedUrl(m.fileUrl);
                return (
                  <div key={i} className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
                      <div className={`material-icon-wrap ${cfg.iconClass}`} style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon d={cfg.iconPath} size={20} color={cfg.iconColor} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{m.subject}</div>
                      </div>
                    </div>
                    <div style={{ padding: "12px 18px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
                        <span>By {m.teacherId?.name || "Teacher"}</span>
                        <span>{uploadDate}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {canEmbed && (
                          <button onClick={() => { setPreviewUrl(m.fileUrl); setPreviewTitle(m.title); }}
                            style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                            <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" size={14} color={cfg.iconColor} />
                            Preview
                          </button>
                        )}
                        {m.fileUrl && (
                          <a href={m.fileUrl} target="_blank" rel="noopener noreferrer"
                            style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: `1px solid ${cfg.iconColor}44`, background: cfg.iconColor + "12", color: cfg.iconColor, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textDecoration: "none" }}>
                            <Icon d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={14} color={cfg.iconColor} />
                            Download
                          </a>
                        )}
                      </div>
                    </div>
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

export default Materials;
