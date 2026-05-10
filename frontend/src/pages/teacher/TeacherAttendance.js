import React, { useState } from "react";
import TeacherNavbar from "../../components/Teachernavbar";
import { classStudents, teacherAttendanceRecords } from "../../data/teacherMockData";

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const STATUS_OPTIONS = ["Present", "Absent", "Late", "Leave"];
const STATUS_STYLES = {
  Present: { color: "#2db87b", bg: "#f0fdf7", border: "#bbf7d0" },
  Absent:  { color: "#e53e3e", bg: "#fff5f5", border: "#fca5a5" },
  Late:    { color: "#e6a800", bg: "#fffbeb", border: "#fcd34d" },
  Leave:   { color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" },
};

// App's fixed "today" — May 7, 2026
const APP_TODAY = "2026-05-07";

function TeacherAttendance() {
  const classes = Object.keys(classStudents);
  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [selectedDate, setSelectedDate] = useState(APP_TODAY);
  const [attendance, setAttendance] = useState({});
  const [saved, setSaved] = useState(false);
  const [wasAlreadySaved, setWasAlreadySaved] = useState(false);
  const [dateError, setDateError] = useState("");
  const [viewMode, setViewMode] = useState("mark");

  // Report state
  const [reportClass, setReportClass] = useState(classes[0]);
  const [reportFrom, setReportFrom] = useState("2026-03-01");
  const [reportTo, setReportTo] = useState(APP_TODAY);
  const [reportData, setReportData] = useState(null);
  const [reportGenerated, setReportGenerated] = useState(false);

  const students = classStudents[selectedClass] || [];

  const initForDate = (cls, date) => {
    const records = teacherAttendanceRecords[cls]?.[date] || {};
    const init = {};
    (classStudents[cls] || []).forEach(s => {
      init[s.id] = records[s.id] || "Present";
    });
    return init;
  };

  const handleClassChange = (cls) => {
    setSelectedClass(cls);
    setAttendance(initForDate(cls, selectedDate));
    setSaved(false);
    setWasAlreadySaved(false);
    setDateError("");
  };

  const handleDateChange = (date) => {
    if (date > APP_TODAY) {
      setDateError("Attendance cannot be marked for a future date.");
      setSelectedDate(date);
      return;
    }
    setDateError("");
    setSelectedDate(date);
    setAttendance(initForDate(selectedClass, date));
    // If a record already exists for this date, the next save is an "update"
    const existing = teacherAttendanceRecords[selectedClass]?.[date];
    setWasAlreadySaved(!!existing && Object.keys(existing).length > 0);
    setSaved(false);
  };

  React.useEffect(() => {
    setAttendance(initForDate(selectedClass, selectedDate));
  // eslint-disable-next-line
  }, []);

  const setStatus = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
    setSaved(false);
  };

  const markAll = (status) => {
    const all = {};
    students.forEach(s => { all[s.id] = status; });
    setAttendance(all);
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setWasAlreadySaved(true); // any subsequent save on the same record is an update
  };

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = Object.values(attendance).filter(v => v === s).length;
    return acc;
  }, {});

  const historyDates = Object.keys(teacherAttendanceRecords[selectedClass] || {}).sort().reverse();

  // ── Report Generator ──
  const generateReport = () => {
    const reportStudents = classStudents[reportClass] || [];
    const allDates = Object.keys(teacherAttendanceRecords[reportClass] || {})
      .filter(d => d >= reportFrom && d <= reportTo)
      .sort();

    if (allDates.length === 0) {
      setReportData({ empty: true, reportClass, reportFrom, reportTo });
      setReportGenerated(true);
      return;
    }

    const studentSummary = reportStudents.map(student => {
      const statusCounts = { Present: 0, Absent: 0, Late: 0, Leave: 0 };
      allDates.forEach(date => {
        const status = teacherAttendanceRecords[reportClass]?.[date]?.[student.id] || "Absent";
        if (statusCounts[status] !== undefined) statusCounts[status]++;
      });
      const totalDays = allDates.length;
      const presentPct = Math.round((statusCounts.Present / totalDays) * 100);
      return { ...student, ...statusCounts, totalDays, presentPct };
    });

    const classPresent = studentSummary.reduce((a, s) => a + s.Present, 0);
    const classTotalSlots = reportStudents.length * allDates.length;
    const classAvgPct = classTotalSlots > 0 ? Math.round((classPresent / classTotalSlots) * 100) : 0;

    setReportData({ studentSummary, allDates, classAvgPct, reportClass, reportFrom, reportTo, empty: false });
    setReportGenerated(true);
  };

  const handlePrint = () => window.print();

  return (
    <div className="app-layout">
      <TeacherNavbar />
      <main className="main-content">

        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-greeting" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg,#2db87b,#1e9e63)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" size={18} color="#fff" />
            </div>
            <span>Attendance</span>
            <span style={{ color: "#9aaabb", fontWeight: 500, fontSize: "14px" }}>· Mark, Review & Report</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { key: "mark",    label: "Mark Attendance" },
              { key: "history", label: "View History"    },
              { key: "report",  label: "Generate Report" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setViewMode(key)}
                style={{
                  padding: "6px 16px", borderRadius: "8px", border: "1.5px solid var(--border)",
                  background: viewMode === key ? "#2db87b" : "var(--bg-main)",
                  color: viewMode === key ? "#fff" : "var(--text-secondary)",
                  fontWeight: 700, fontSize: "12.5px", cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.15s",
                }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Controls — shown for mark + history only */}
        {viewMode !== "report" && (
          <div className="card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Class</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {classes.map(cls => (
                    <button key={cls} onClick={() => handleClassChange(cls)}
                      style={{
                        padding: "7px 16px", borderRadius: "10px", border: "1.5px solid",
                        borderColor: selectedClass === cls ? "#2db87b" : "var(--border)",
                        background: selectedClass === cls ? "#f0fdf7" : "var(--bg-main)",
                        color: selectedClass === cls ? "#2db87b" : "var(--text-secondary)",
                        fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
                      }}>{cls}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Date</div>
                <input type="date" value={selectedDate} onChange={e => handleDateChange(e.target.value)}
                  style={{ padding: "8px 14px", borderRadius: "10px", border: `1.5px solid ${dateError ? "#fca5a5" : "var(--border)"}`, background: "var(--bg-main)", color: "var(--text-primary)", fontWeight: 700, fontSize: "13px", fontFamily: "inherit", cursor: "pointer", outline: "none" }} />
              </div>
            </div>
          </div>
        )}

        {/* TC-F15: Future date error banner */}
        {dateError && (
          <div style={{
            padding: "12px 18px", borderRadius: "10px",
            background: "#fff5f5", border: "1.5px solid #fca5a5",
            color: "#e53e3e", fontWeight: 700, fontSize: "13.5px",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <Icon d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" size={16} color="#e53e3e" />
            {dateError}
          </div>
        )}

        {/* ── MARK ATTENDANCE VIEW ── */}
        {viewMode === "mark" && !dateError && (
          <>
            {/* Summary Chips */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {STATUS_OPTIONS.map(s => {
                const st = STATUS_STYLES[s];
                return (
                  <div key={s} style={{ padding: "6px 16px", borderRadius: "20px", background: st.bg, border: `1.5px solid ${st.border}`, color: st.color, fontWeight: 800, fontSize: "12.5px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 900 }}>{counts[s]}</span> {s}
                  </div>
                );
              })}
            </div>

            {/* Bulk Buttons */}
            <div className="card" style={{ padding: "12px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12.5px", color: "var(--text-muted)", fontWeight: 700 }}>Mark All:</span>
                {STATUS_OPTIONS.map(s => {
                  const st = STATUS_STYLES[s];
                  return (
                    <button key={s} onClick={() => markAll(s)}
                      style={{
                        padding: "5px 14px", borderRadius: "8px", border: `1.5px solid ${st.border}`,
                        background: st.bg, color: st.color, fontWeight: 700, fontSize: "12px",
                        cursor: "pointer", fontFamily: "inherit",
                      }}>{s}</button>
                  );
                })}
              </div>
            </div>

            {/* Student List */}
            <div className="card">
              <div className="card-header" style={{ marginBottom: "16px" }}>
                <div className="card-title">
                  <div className="card-title-icon icon-green">
                    <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={15} color="#2db87b" />
                  </div>
                  Class {selectedClass} — {students.length} Students
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>{selectedDate}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {students.map((student) => {
                  const current = attendance[student.id] || "Present";
                  const st = STATUS_STYLES[current];
                  return (
                    <div key={student.id} style={{
                      display: "flex", alignItems: "center", gap: "14px",
                      padding: "12px 16px", borderRadius: "12px",
                      border: `1.5px solid ${st.border}`, background: st.bg,
                      transition: "all 0.15s",
                    }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: st.color + "25", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "13px", color: st.color, flexShrink: 0 }}>
                        {student.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13.5px", fontWeight: 800, color: "var(--text-primary)" }}>{student.name}</div>
                        <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Roll #{student.rollNo}</div>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {STATUS_OPTIONS.map(s => {
                          const ss = STATUS_STYLES[s];
                          const isActive = current === s;
                          return (
                            <button key={s} onClick={() => setStatus(student.id, s)}
                              style={{
                                padding: "4px 12px", borderRadius: "8px", border: `1.5px solid ${isActive ? ss.color : "var(--border)"}`,
                                background: isActive ? ss.color : "var(--bg-main)",
                                color: isActive ? "#fff" : "var(--text-muted)",
                                fontWeight: 700, fontSize: "11.5px", cursor: "pointer", fontFamily: "inherit",
                                transition: "all 0.15s",
                              }}>{s}</button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px", alignItems: "center" }}>
                {saved && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#2db87b", fontWeight: 700, fontSize: "13px" }}>
                    <Icon d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={16} color="#2db87b" />
                    {wasAlreadySaved ? "Attendance Updated!" : "Attendance Saved!"}
                  </span>
                )}
                <button onClick={handleSave}
                  style={{ padding: "10px 28px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #2db87b, #1e9e63)", color: "#fff", fontWeight: 800, fontSize: "14px", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(45,184,123,0.35)" }}>
                  {wasAlreadySaved ? "Update Attendance" : "Save Attendance"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── HISTORY VIEW ── */}
        {viewMode === "history" && (
          <div className="card">
            <div className="card-header" style={{ marginBottom: "16px" }}>
              <div className="card-title">
                <div className="card-title-icon icon-green">
                  <Icon d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" size={15} color="#2db87b" />
                </div>
                Attendance History — {selectedClass}
              </div>
            </div>
            {historyDates.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No records found</div>
            ) : historyDates.map((date) => {
              const dayRecords = teacherAttendanceRecords[selectedClass]?.[date] || {};
              const presentCount = Object.values(dayRecords).filter(v => v === "Present").length;
              const total = students.length;
              const pct = total > 0 ? Math.round((presentCount / total) * 100) : 0;
              return (
                <div key={date} style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontWeight: 800, fontSize: "13.5px", color: "var(--text-primary)" }}>{date}</span>
                    <span style={{ fontWeight: 800, fontSize: "13px", color: pct >= 80 ? "#2db87b" : "#e53e3e" }}>{pct}% Present</span>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {students.map(s => {
                      const status = dayRecords[s.id] || "—";
                      const ss = STATUS_STYLES[status] || { color: "#9aaabb", bg: "#f0f4f8", border: "#e4eaf0" };
                      return (
                        <span key={s.id} style={{ padding: "2px 10px", borderRadius: "8px", background: ss.bg, color: ss.color, fontSize: "11px", fontWeight: 700, border: `1px solid ${ss.border}` }}>
                          {s.name.split(" ")[0]}: {status}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── REPORT GENERATOR VIEW ── */}
        {viewMode === "report" && (
          <>
            {/* Report Controls Card */}
            <div className="card" style={{ padding: "20px" }}>
              <div className="card-header" style={{ marginBottom: "18px" }}>
                <div className="card-title">
                  <div className="card-title-icon icon-green">
                    <Icon d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 2h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2z" size={15} color="#2db87b" />
                  </div>
                  Attendance Report Generator
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
                {/* Class selector */}
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Class</div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {classes.map(cls => (
                      <button key={cls} onClick={() => { setReportClass(cls); setReportGenerated(false); }}
                        style={{
                          padding: "7px 16px", borderRadius: "10px", border: "1.5px solid",
                          borderColor: reportClass === cls ? "#2db87b" : "var(--border)",
                          background: reportClass === cls ? "#f0fdf7" : "var(--bg-main)",
                          color: reportClass === cls ? "#2db87b" : "var(--text-secondary)",
                          fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
                        }}>{cls}</button>
                    ))}
                  </div>
                </div>

                {/* Date range */}
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>From</div>
                  <input type="date" value={reportFrom}
                    onChange={e => { setReportFrom(e.target.value); setReportGenerated(false); }}
                    style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg-main)", color: "var(--text-primary)", fontWeight: 700, fontSize: "13px", fontFamily: "inherit", outline: "none" }} />
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>To</div>
                  <input type="date" value={reportTo} max={APP_TODAY}
                    onChange={e => { setReportTo(e.target.value); setReportGenerated(false); }}
                    style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg-main)", color: "var(--text-primary)", fontWeight: 700, fontSize: "13px", fontFamily: "inherit", outline: "none" }} />
                </div>

                <button onClick={generateReport}
                  style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #2db87b, #1e9e63)", color: "#fff", fontWeight: 800, fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(45,184,123,0.3)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Icon d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 2h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2z" size={16} color="#fff" />
                  Generate Report
                </button>
              </div>
            </div>

            {/* Report Output */}
            {reportGenerated && reportData && (
              reportData.empty ? (
                <div className="card" style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
                  <Icon d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" size={40} color="#d1dbe8" />
                  <p style={{ marginTop: "12px", fontSize: "14px", fontWeight: 700 }}>
                    No attendance records found for Class {reportData.reportClass} between {reportData.reportFrom} and {reportData.reportTo}.
                  </p>
                </div>
              ) : (
                <div className="card" id="attendance-report">
                  {/* Report Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: 900, color: "var(--text-primary)" }}>
                        Attendance Report — Class {reportData.reportClass}
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>
                        Period: {reportData.reportFrom} → {reportData.reportTo} · {reportData.allDates.length} school day{reportData.allDates.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      {/* Class average badge */}
                      <div style={{ padding: "8px 16px", borderRadius: "10px", background: reportData.classAvgPct >= 75 ? "#f0fdf7" : "#fff5f5", border: `1.5px solid ${reportData.classAvgPct >= 75 ? "#bbf7d0" : "#fca5a5"}`, textAlign: "center" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Class Avg</div>
                        <div style={{ fontSize: "22px", fontWeight: 900, color: reportData.classAvgPct >= 75 ? "#2db87b" : "#e53e3e" }}>{reportData.classAvgPct}%</div>
                      </div>
                      <button onClick={handlePrint}
                        style={{ padding: "10px 18px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg-main)", color: "var(--text-secondary)", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Icon d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" size={14} color="#9aaabb" />
                        Print / Download
                      </button>
                    </div>
                  </div>

                  {/* Overall status totals */}
                  <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
                    {STATUS_OPTIONS.map(s => {
                      const st = STATUS_STYLES[s];
                      const total = reportData.studentSummary.reduce((a, r) => a + (r[s] || 0), 0);
                      return (
                        <div key={s} style={{ padding: "8px 18px", borderRadius: "10px", background: st.bg, border: `1.5px solid ${st.border}`, display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "20px", fontWeight: 900, color: st.color }}>{total}</span>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: st.color }}>{s}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Per-student summary table */}
                  <table className="marks-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Student</th>
                        <th>Roll No</th>
                        <th style={{ color: STATUS_STYLES.Present.color }}>Present</th>
                        <th style={{ color: STATUS_STYLES.Absent.color }}>Absent</th>
                        <th style={{ color: STATUS_STYLES.Late.color }}>Late</th>
                        <th style={{ color: STATUS_STYLES.Leave.color }}>Leave</th>
                        <th>Total Days</th>
                        <th>Attendance %</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.studentSummary.map((student, i) => {
                        const isLow = student.presentPct < 75;
                        return (
                          <tr key={student.id} style={{ background: isLow ? "#fff9f9" : "transparent" }}>
                            <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{i + 1}</td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#f0fdf7", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "11px", color: "#2db87b", flexShrink: 0 }}>
                                  {student.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                </div>
                                <span style={{ fontWeight: 700, fontSize: "13px" }}>{student.name}</span>
                              </div>
                            </td>
                            <td className="component-col">#{student.rollNo}</td>
                            <td style={{ fontWeight: 800, color: STATUS_STYLES.Present.color }}>{student.Present}</td>
                            <td style={{ fontWeight: 800, color: STATUS_STYLES.Absent.color }}>{student.Absent}</td>
                            <td style={{ fontWeight: 800, color: STATUS_STYLES.Late.color }}>{student.Late}</td>
                            <td style={{ fontWeight: 800, color: STATUS_STYLES.Leave.color }}>{student.Leave}</td>
                            <td style={{ fontWeight: 700, color: "var(--text-secondary)" }}>{student.totalDays}</td>
                            <td>
                              <span style={{ fontWeight: 900, fontSize: "14px", color: isLow ? "#e53e3e" : "#2db87b" }}>
                                {student.presentPct}%
                              </span>
                            </td>
                            <td>
                              <span style={{
                                padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 800,
                                background: isLow ? "#fff5f5" : "#f0fdf7",
                                color: isLow ? "#e53e3e" : "#2db87b",
                                border: `1px solid ${isLow ? "#fca5a5" : "#bbf7d0"}`,
                              }}>
                                {isLow ? "⚠ Low" : "✓ Good"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div style={{ marginTop: "14px", fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>
                    ⚠ Students below 75% attendance are highlighted in red.
                  </div>
                </div>
              )
            )}
          </>
        )}

      </main>

      <style>{`
        @media print {
          .app-layout > *:not(.main-content) { display: none !important; }
          .topbar, .card:not(#attendance-report) { display: none !important; }
          #attendance-report { box-shadow: none !important; border: none !important; }
        }
      `}</style>
    </div>
  );
}

export default TeacherAttendance;