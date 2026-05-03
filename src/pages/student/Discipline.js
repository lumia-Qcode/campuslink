import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { fetchDiscipline } from "../../services/studentApi";

const Icon = ({ d, size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusCard({ statusMeta }) {
  if (!statusMeta) return null;
  return (
    <div className="discipline-status-card">
      <div className={`discipline-status-icon ${statusMeta.colorClass}`}>
        <Icon d={statusMeta.iconPath} size={28} color={statusMeta.iconColor} />
      </div>
      <div>
        <div className="discipline-status-label">Current Status</div>
        <div className={`discipline-status-value ${statusMeta.colorClass}`}>{statusMeta.label}</div>
      </div>
    </div>
  );
}

function RecordCard({ record, isLatest }) {
  if (!record) return null;
  const meta = record.statusMeta;
  return (
    <div
      className="discipline-remarks-card"
      style={isLatest ? {} : { opacity: 0.85, marginTop: 12 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div className="discipline-remarks-label" style={{ marginBottom: 0 }}>
          {isLatest ? "Latest Remark" : "Previous Remark"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {meta && (
            <span
              style={{
                fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                background: meta.colorClass === "danger" ? "#fff0f0" : meta.colorClass === "warning" ? "#fffbea" : "#f0fff6",
                color: meta.iconColor,
                border: `1px solid ${meta.iconColor}33`,
              }}
            >
              {meta.label}
            </span>
          )}
          <span style={{ fontSize: 12, color: "#aaa" }}>{record.date}</span>
        </div>
      </div>
      <div className="discipline-remarks-text">{record.remarks}</div>
      {record.issuedBy && (
        <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
          — {record.issuedBy}
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="discipline-wrapper">
      <div style={{ background: "#f5f5f5", borderRadius: 12, height: 80, marginBottom: 16, animation: "pulse 1.5s infinite" }} />
      <div style={{ background: "#f5f5f5", borderRadius: 12, height: 120, animation: "pulse 1.5s infinite" }} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function Discipline() {
  const [disciplineData, setDisciplineData] = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [showHistory, setShowHistory]       = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchDiscipline()
      .then(data => { if (!cancelled) { setDisciplineData(data); setLoading(false); } })
      .catch(err  => { if (!cancelled) { setError(err.message); setLoading(false); } });

    return () => { cancelled = true; };
  }, []);

  // History records = all records except the latest
  const historyRecords = disciplineData?.records?.slice(1) || [];

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-wrapper">

          {/* Header */}
          <div className="page-header">
            <div className="page-header-icon icon-red">
              <Icon
                d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"
                size={22}
                color="#ff5c5c"
              />
            </div>
            <div>
              <div className="page-title">Discipline Record</div>
              <div className="page-subtitle">Student conduct & behaviour report</div>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div style={{
              background: "#fff1f1", border: "1px solid #ffd0d0", borderRadius: 10,
              padding: "16px 20px", color: "#cc0000",
            }}>
              <strong>Failed to load discipline record:</strong> {error}
            </div>
          )}

          {/* Loading state */}
          {loading && <LoadingSkeleton />}

          {/* Clean record */}
          {!loading && !error && disciplineData && !disciplineData.hasRecords && (
            <div className="discipline-empty">
              <div className="discipline-empty-icon">
                <Icon d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={30} color="#2db87b" />
              </div>
              <div className="discipline-empty-title">Clean Record</div>
              <div className="discipline-empty-sub">No discipline records found for this student.</div>
            </div>
          )}

          {/* Records exist */}
          {!loading && !error && disciplineData?.hasRecords && (
            <div className="discipline-wrapper">

              {/* Overall status */}
              <StatusCard statusMeta={disciplineData.statusMeta} />

              {/* Latest record */}
              <RecordCard record={disciplineData.latestRecord} isLatest={true} />

              {/* History toggle */}
              {historyRecords.length > 0 && (
                <>
                  <button
                    onClick={() => setShowHistory(v => !v)}
                    style={{
                      marginTop: 12, background: "none", border: "1.5px solid #e0e0e0",
                      borderRadius: 8, padding: "6px 14px", fontSize: 13, color: "#555",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                    }}
                  >
                    <Icon
                      d={showHistory ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                      size={14}
                    />
                    {showHistory ? "Hide history" : `Show ${historyRecords.length} older record${historyRecords.length !== 1 ? "s" : ""}`}
                  </button>

                  {showHistory && historyRecords.map((record, i) => (
                    <RecordCard key={record.id || i} record={record} isLatest={false} />
                  ))}
                </>
              )}

            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default Discipline;
