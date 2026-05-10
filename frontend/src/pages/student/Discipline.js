import React from "react";
import Navbar from "../../components/Navbar";
import { discipline } from "../../data/mockData";

const Icon = ({ d, size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

function getStatusMeta(remarks) {
  if (!remarks) return { label: "No Record", colorClass: "good", iconPath: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z", iconColor: "#2db87b" };
  const lower = remarks.toLowerCase();
  if (lower.includes("excellent") || lower.includes("good") || lower.includes("commend") || lower.includes("outstanding")) {
    return { label: "Good Standing", colorClass: "good", iconPath: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z", iconColor: "#2db87b" };
  }
  if (lower.includes("warning") || lower.includes("caution") || lower.includes("improve")) {
    return { label: "Warning Issued", colorClass: "warning", iconPath: "M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", iconColor: "#e6a800" };
  }
  if (lower.includes("suspend") || lower.includes("serious") || lower.includes("violation")) {
    return { label: "Action Required", colorClass: "danger", iconPath: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z", iconColor: "#ff5c5c" };
  }
  return { label: "On Record", colorClass: "good", iconPath: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z", iconColor: "#2db87b" };
}

function Discipline() {
  const studentDiscipline = discipline ? discipline.find(d => d.studentId === 1) : null;
  const meta = getStatusMeta(studentDiscipline?.remarks);

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-wrapper">

          {/* Header */}
          <div className="page-header">
            <div className="page-header-icon icon-red">
              <Icon d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" size={22} color="#ff5c5c" />
            </div>
            <div>
              <div className="page-title">Discipline Record</div>
              <div className="page-subtitle">Student conduct & behaviour report</div>
            </div>
          </div>

          {studentDiscipline ? (
            <div className="discipline-wrapper">

              {/* Status card */}
              <div className="discipline-status-card">
                <div className={`discipline-status-icon ${meta.colorClass}`}>
                  <Icon d={meta.iconPath} size={28} color={meta.iconColor} />
                </div>
                <div>
                  <div className="discipline-status-label">Current Status</div>
                  <div className={`discipline-status-value ${meta.colorClass}`}>{meta.label}</div>
                </div>
              </div>

              {/* Remarks */}
              <div className="discipline-remarks-card">
                <div className="discipline-remarks-label">Teacher / Admin Remarks</div>
                <div className="discipline-remarks-text">{studentDiscipline.remarks}</div>
              </div>

            </div>
          ) : (
            <div className="discipline-empty">
              <div className="discipline-empty-icon">
                <Icon d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={30} color="#2db87b" />
              </div>
              <div className="discipline-empty-title">Clean Record</div>
              <div className="discipline-empty-sub">No discipline records found for this student.</div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default Discipline;