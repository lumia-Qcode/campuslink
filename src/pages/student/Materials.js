import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import { materials as mockMaterials } from "../../data/mockData";

const Icon = ({ d, size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const SUBJECT_CONFIG = {
  Maths:    { iconPath: "M12 6v6m0 0v6m0-6h6m-6 0H6", iconColor: "#e6a800", iconClass: "mat-maths",    tagClass: "mat-tag-maths"    },
  English:  { iconPath: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z", iconColor: "#9b6dff", iconClass: "mat-english",  tagClass: "mat-tag-english"  },
  Computer: { iconPath: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2", iconColor: "#4f8ef7", iconClass: "mat-computer", tagClass: "mat-tag-computer" },
  Science:  { iconPath: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18", iconColor: "#2db87b", iconClass: "mat-science",  tagClass: "mat-tag-science"  },
};

const getSubjectConfig = (subject) =>
  SUBJECT_CONFIG[subject] || {
    iconPath: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    iconColor: "#9aaabb",
    iconClass: "mat-default",
    tagClass: "mat-tag-default",
  };

const ALL_SUBJECTS = ["All", ...Object.keys(SUBJECT_CONFIG)];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const dt = new Date(dateStr);
  return dt.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function Materials() {
  const [materials] = useState(mockMaterials);
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = activeFilter === "All"
    ? materials
    : materials.filter(m => m.subject === activeFilter);

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-wrapper">

          {/* Header */}
          <div className="page-header">
            <div className="page-header-icon icon-blue">
              <Icon d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" size={22} color="#4f8ef7" />
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
                  <div className="empty-state-title">No materials found</div>
                  <div className="empty-state-sub">No materials available for {activeFilter}.</div>
                </div>
              ) : (
                filtered.map((mat, index) => {
                  const cfg = getSubjectConfig(mat.subject);
                  return (
                    <div className="material-card" key={index}>
                      <div className="material-card-top">
                        <div className={`material-icon-wrap ${cfg.iconClass}`}>
                          <Icon d={cfg.iconPath} size={22} color={cfg.iconColor} />
                        </div>
                        <div className="material-card-info">
                          <span className={`material-subject-tag ${cfg.tagClass}`}>{mat.subject}</span>
                          <div className="material-title">{mat.title}</div>
                        </div>
                      </div>
                      <div className="material-card-footer">
                        <div className="material-date">
                          <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" size={12} color="#9aaabb" />
                          {formatDate(mat.date)}
                        </div>
                        <button className="material-open-btn">
                          <Icon d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14" size={12} color="#1e9e63" />
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
      </main>
    </div>
  );
}

export default Materials;