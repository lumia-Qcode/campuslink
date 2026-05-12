import React, { useState, useEffect, useCallback } from "react";
import TeacherNavbar from "../../components/Teachernavbar";
import {
  apiGetMyTeacherProfile,
  apiGetStudents,
  apiSaveAttendance,
  apiGetAttendanceForDate,
  apiGetAttendanceDates,
  apiGetAttendanceReport,
} from "../../services/api";

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const STATUS_OPTIONS = ["Present", "Absent", "Late", "Leave"];
const STATUS_STYLES = {
  Present: { color: "#2db87b", bg: "#f0fdf7", border: "#bbf7d0" },
  Absent:  { color: "#e53e3e", bg: "#fff5f5", border: "#fca5a5" },
  Late:    { color: "#e6a800", bg: "#fffbeb", border: "#fcd34d" },
  Leave:   { color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" },
};

const APP_TODAY = new Date().toISOString().split("T")[0];

function TeacherAttendance() {
  const [profile, setProfile]           = useState(null);
  const [sectionList, setSectionList]   = useState([]); // [{ classId, section, label }]
  const [selectedSection, setSelectedSection] = useState(null);
  const [students, setStudents]         = useState([]);
  const [selectedDate, setSelectedDate] = useState(APP_TODAY);
  const [attendance, setAttendance]     = useState({});
  const [saved, setSaved]               = useState(false);
  const [wasAlreadySaved, setWasAlreadySaved] = useState(false);
  const [saving, setSaving]             = useState(false);
  const [dateError, setDateError]       = useState("");
  const [viewMode, setViewMode]         = useState("mark");
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");

  // History
  const [historyDates, setHistoryDates] = useState([]);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Report
  const [reportFrom, setReportFrom]       = useState("2026-01-01");
  const [reportTo, setReportTo]           = useState(APP_TODAY);
  const [reportData, setReportData]       = useState(null);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  // Load profile + build section list
  useEffect(() => {
    apiGetMyTeacherProfile()
      .then(res => {
        const prof = res.data;
        setProfile(prof);
        const seen = new Map();
        (prof.assignedSections || []).forEach(s => {
          const key = `${s.classId}|${s.section}`;
          if (!seen.has(key)) seen.set(key, { classId: s.classId, section: s.section, label: `${s.classId}-${s.section}` });
        });
        const list = [...seen.values()];
        setSectionList(list);
        if (list.length) setSelectedSection(list[0]);
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  // Load students when section changes
  useEffect(() => {
    if (!selectedSection) return;
    apiGetStudents({ classId: selectedSection.classId, section: selectedSection.section })
      .then(res => setStudents(res.data || []))
      .catch(() => setStudents([]));
  }, [selectedSection]);

  // Load existing attendance when section or date changes
  const loadAttendanceForDate = useCallback(async (section, date) => {
    if (!section) return;
    try {
      const res = await apiGetAttendanceForDate(section.classId, section.section, date);
      const records = res.data || [];
      const map = {};
      records.forEach(r => { map[r.studentId._id || r.studentId] = r.status; });
      setAttendance(map);
      setWasAlreadySaved(records.length > 0);
    } catch (_) {
      setAttendance({});
      setWasAlreadySaved(false);
    }
    setSaved(false);
  }, []);

  useEffect(() => {
    if (selectedSection && selectedDate && !dateError) {
      loadAttendanceForDate(selectedSection, selectedDate);
    }
  }, [selectedSection, selectedDate, dateError, loadAttendanceForDate]);

  // Load history dates when switching to history tab
  useEffect(() => {
    if (viewMode === "history" && selectedSection) {
      setHistoryLoading(true);
      apiGetAttendanceDates(selectedSection.classId, selectedSection.section)
        .then(res => {
          const dates = (res.data || []).sort().reverse();
          setHistoryDates(dates);
          // Load records for all those dates
          if (dates.length) {
            return apiGetAttendanceReport(selectedSection.classId, selectedSection.section, dates[dates.length - 1], dates[0]);
          }
        })
        .then(res => { if (res) setHistoryRecords(res.data || []); })
        .catch(() => {})
        .finally(() => setHistoryLoading(false));
    }
  }, [viewMode, selectedSection]);

  const handleSectionChange = (sec) => {
    setSelectedSection(sec);
    setAttendance({});
    setSaved(false);
    setWasAlreadySaved(false);
  };

  const handleDateChange = (date) => {
    if (date > APP_TODAY) {
      setDateError("Attendance cannot be marked for a future date.");
      setSelectedDate(date);
      return;
    }
    setDateError("");
    setSelectedDate(date);
  };

  const setStatus = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
    setSaved(false);
  };

  const markAll = (status) => {
    const all = {};
    students.forEach(s => { all[s._id] = status; });
    setAttendance(all);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!selectedSection || !students.length) return;
    setSaving(true);
    try {
      const records = students.map(s => ({
        studentId: s._id,
        status: attendance[s._id] || "Present",
      }));
      await apiSaveAttendance({
        classId: selectedSection.classId,
        section: selectedSection.section,
        date: selectedDate,
        records,
      });
      setSaved(true);
      setWasAlreadySaved(true);
    } catch (e) {
      alert("Failed to save attendance: " + (e.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const generateReport = async () => {
    if (!selectedSection) return;
    setReportLoading(true);
    setReportGenerated(false);
    try {
      const res = await apiGetAttendanceReport(selectedSection.classId, selectedSection.section, reportFrom, reportTo);
      const rawRecords = res.data || [];
      if (!rawRecords.length) {
        setReportData({ empty: true });
        setReportGenerated(true);
        return;
      }
      const allDates = [...new Set(rawRecords.map(r => r.date))].sort();
      const studentMap = {};
      students.forEach(s => { studentMap[s._id] = { ...s, Present: 0, Absent: 0, Late: 0, Leave: 0 }; });
      rawRecords.forEach(r => {
        const sid = r.studentId._id || r.studentId;
        if (studentMap[sid]) studentMap[sid][r.status] = (studentMap[sid][r.status] || 0) + 1;
      });
      const studentSummary = Object.values(studentMap).map(s => {
        const totalDays = allDates.length;
        const presentPct = totalDays > 0 ? Math.round((s.Present / totalDays) * 100) : 0;
        return { ...s, totalDays, presentPct };
      });
      const classPresent = studentSummary.reduce((a, s) => a + s.Present, 0);
      const classTotalSlots = students.length * allDates.length;
      const classAvgPct = classTotalSlots > 0 ? Math.round((classPresent / classTotalSlots) * 100) : 0;
      setReportData({ studentSummary, allDates, classAvgPct, empty: false });
      setReportGenerated(true);
    } catch (e) {
      alert("Failed to generate report.");
    } finally {
      setReportLoading(false);
    }
  };

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = students.filter(st => (attendance[st._id] || "Present") === s).length;
    return acc;
  }, {});

  if (loading) return (
    <div className="app-layout"><TeacherNavbar />
      <main className="main-content"><div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>Loading…</div></main>
    </div>
  );

  return (
    <div className="app-layout">
      <TeacherNavbar />
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-greeting" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg,#2db87b,#1e9e63)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" size={18} color="#fff" />
            </div>
            <span>Attendance</span>
            <span style={{ color: "#9aaabb", fontWeight: 500, fontSize: "14px" }}>· Mark, Review & Report</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {[{ key: "mark", label: "Mark Attendance" }, { key: "history", label: "View History" }, { key: "report", label: "Generate Report" }].map(({ key, label }) => (
              <button key={key} onClick={() => setViewMode(key)}
                style={{ padding: "6px 16px", borderRadius: "8px", border: "1.5px solid var(--border)", background: viewMode === key ? "#2db87b" : "var(--bg-main)", color: viewMode === key ? "#fff" : "var(--text-secondary)", fontWeight: 700, fontSize: "12.5px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>{label}</button>
            ))}
          </div>
        </div>

        {error && <div style={{ padding: "12px 18px", borderRadius: "10px", background: "#fff5f5", border: "1.5px solid #fca5a5", color: "#e53e3e", fontWeight: 700 }}>{error}</div>}

        {viewMode !== "report" && (
          <div className="card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Section</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {sectionList.map(sec => (
                    <button key={sec.label} onClick={() => handleSectionChange(sec)}
                      style={{ padding: "7px 16px", borderRadius: "10px", border: "1.5px solid", borderColor: selectedSection?.label === sec.label ? "#2db87b" : "var(--border)", background: selectedSection?.label === sec.label ? "#f0fdf7" : "var(--bg-main)", color: selectedSection?.label === sec.label ? "#2db87b" : "var(--text-secondary)", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
                      {sec.label}
                    </button>
                  ))}
                  {!sectionList.length && <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>No sections assigned</span>}
                </div>
              </div>
              {viewMode === "mark" && (
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Date</div>
                  <input type="date" value={selectedDate} onChange={e => handleDateChange(e.target.value)}
                    style={{ padding: "8px 14px", borderRadius: "10px", border: `1.5px solid ${dateError ? "#fca5a5" : "var(--border)"}`, background: "var(--bg-main)", color: "var(--text-primary)", fontWeight: 700, fontSize: "13px", fontFamily: "inherit", outline: "none" }} />
                </div>
              )}
            </div>
          </div>
        )}

        {dateError && (
          <div style={{ padding: "12px 18px", borderRadius: "10px", background: "#fff5f5", border: "1.5px solid #fca5a5", color: "#e53e3e", fontWeight: 700, fontSize: "13.5px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Icon d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" size={16} color="#e53e3e" />
            {dateError}
          </div>
        )}

        {/* MARK VIEW */}
        {viewMode === "mark" && !dateError && (
          <>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {STATUS_OPTIONS.map(s => {
                const st = STATUS_STYLES[s];
                return (
                  <div key={s} style={{ padding: "6px 16px", borderRadius: "20px", background: st.bg, border: `1.5px solid ${st.border}`, color: st.color, fontWeight: 800, fontSize: "12.5px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "16px", fontWeight: 900 }}>{counts[s]}</span> {s}
                  </div>
                );
              })}
            </div>

            <div className="card" style={{ padding: "12px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12.5px", color: "var(--text-muted)", fontWeight: 700 }}>Mark All:</span>
                {STATUS_OPTIONS.map(s => {
                  const st = STATUS_STYLES[s];
                  return (
                    <button key={s} onClick={() => markAll(s)}
                      style={{ padding: "5px 14px", borderRadius: "8px", border: `1.5px solid ${st.border}`, background: st.bg, color: st.color, fontWeight: 700, fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>{s}</button>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <div className="card-header" style={{ marginBottom: "16px" }}>
                <div className="card-title">
                  <div className="card-title-icon icon-green">
                    <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={15} color="#2db87b" />
                  </div>
                  {selectedSection ? `Class ${selectedSection.label}` : "Select a section"} — {students.length} Students
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>{selectedDate}</span>
              </div>

              {students.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>No students found in this section.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {students.map(student => {
                    const current = attendance[student._id] || "Present";
                    const st = STATUS_STYLES[current];
                    return (
                      <div key={student._id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${st.border}`, background: st.bg, transition: "all 0.15s" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: st.color + "25", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "13px", color: st.color, flexShrink: 0 }}>
                          {student.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13.5px", fontWeight: 800, color: "var(--text-primary)" }}>{student.name}</div>
                          <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Roll #{student.rollNo || student.studentId}</div>
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {STATUS_OPTIONS.map(s => {
                            const ss = STATUS_STYLES[s];
                            const isActive = current === s;
                            return (
                              <button key={s} onClick={() => setStatus(student._id, s)}
                                style={{ padding: "4px 12px", borderRadius: "8px", border: `1.5px solid ${isActive ? ss.color : "var(--border)"}`, background: isActive ? ss.color : "var(--bg-main)", color: isActive ? "#fff" : "var(--text-muted)", fontWeight: 700, fontSize: "11.5px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>{s}</button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px", alignItems: "center" }}>
                {saved && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#2db87b", fontWeight: 700, fontSize: "13px" }}>
                    <Icon d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={16} color="#2db87b" />
                    {wasAlreadySaved ? "Attendance Updated!" : "Attendance Saved!"}
                  </span>
                )}
                <button onClick={handleSave} disabled={saving || !students.length}
                  style={{ padding: "10px 28px", borderRadius: "10px", border: "none", background: saving ? "#9aaabb" : "linear-gradient(135deg, #2db87b, #1e9e63)", color: "#fff", fontWeight: 800, fontSize: "14px", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(45,184,123,0.35)" }}>
                  {saving ? "Saving…" : wasAlreadySaved ? "Update Attendance" : "Save Attendance"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* HISTORY VIEW */}
        {viewMode === "history" && (
          <div className="card">
            <div className="card-header" style={{ marginBottom: "16px" }}>
              <div className="card-title">
                <div className="card-title-icon icon-green">
                  <Icon d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" size={15} color="#2db87b" />
                </div>
                Attendance History — {selectedSection?.label}
              </div>
            </div>
            {historyLoading ? <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>Loading history…</div>
            : historyDates.length === 0 ? <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No records found</div>
            : historyDates.map(date => {
              const dayRecords = historyRecords.filter(r => r.date === date);
              const presentCount = dayRecords.filter(r => r.status === "Present").length;
              const total = students.length;
              const pct = total > 0 ? Math.round((presentCount / total) * 100) : 0;
              return (
                <div key={date} style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontWeight: 800, fontSize: "13.5px", color: "var(--text-primary)" }}>{date}</span>
                    <span style={{ fontWeight: 800, fontSize: "13px", color: pct >= 80 ? "#2db87b" : "#e53e3e" }}>{pct}% Present</span>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {dayRecords.map((r, ri) => {
                      const name = r.studentId?.name || "Student";
                      const status = r.status;
                      const ss = STATUS_STYLES[status] || { color: "#9aaabb", bg: "#f0f4f8", border: "#e4eaf0" };
                      return (
                        <span key={ri} style={{ padding: "2px 10px", borderRadius: "8px", background: ss.bg, color: ss.color, fontSize: "11px", fontWeight: 700, border: `1px solid ${ss.border}` }}>
                          {name.split(" ")[0]}: {status}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* REPORT VIEW */}
        {viewMode === "report" && (
          <>
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
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Section</div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {sectionList.map(sec => (
                      <button key={sec.label} onClick={() => handleSectionChange(sec)}
                        style={{ padding: "7px 16px", borderRadius: "10px", border: "1.5px solid", borderColor: selectedSection?.label === sec.label ? "#2db87b" : "var(--border)", background: selectedSection?.label === sec.label ? "#f0fdf7" : "var(--bg-main)", color: selectedSection?.label === sec.label ? "#2db87b" : "var(--text-secondary)", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
                        {sec.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>From</div>
                  <input type="date" value={reportFrom} onChange={e => { setReportFrom(e.target.value); setReportGenerated(false); }}
                    style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg-main)", color: "var(--text-primary)", fontWeight: 700, fontSize: "13px", fontFamily: "inherit", outline: "none" }} />
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>To</div>
                  <input type="date" value={reportTo} max={APP_TODAY} onChange={e => { setReportTo(e.target.value); setReportGenerated(false); }}
                    style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg-main)", color: "var(--text-primary)", fontWeight: 700, fontSize: "13px", fontFamily: "inherit", outline: "none" }} />
                </div>
                <button onClick={generateReport} disabled={reportLoading}
                  style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: reportLoading ? "#9aaabb" : "linear-gradient(135deg, #2db87b, #1e9e63)", color: "#fff", fontWeight: 800, fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(45,184,123,0.3)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Icon d="M9 17v-2m3 2v-4m3 4v-6" size={16} color="#fff" />
                  {reportLoading ? "Generating…" : "Generate Report"}
                </button>
              </div>
            </div>

            {reportGenerated && reportData && (
              reportData.empty ? (
                <div className="card" style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
                  <p style={{ fontSize: "14px", fontWeight: 700 }}>No attendance records found for the selected period.</p>
                </div>
              ) : (
                <div className="card" id="attendance-report">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: 900, color: "var(--text-primary)" }}>Attendance Report — {selectedSection?.label}</div>
                      <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>Period: {reportFrom} → {reportTo} · {reportData.allDates.length} days</div>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <div style={{ padding: "8px 16px", borderRadius: "10px", background: reportData.classAvgPct >= 75 ? "#f0fdf7" : "#fff5f5", border: `1.5px solid ${reportData.classAvgPct >= 75 ? "#bbf7d0" : "#fca5a5"}`, textAlign: "center" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Class Avg</div>
                        <div style={{ fontSize: "22px", fontWeight: 900, color: reportData.classAvgPct >= 75 ? "#2db87b" : "#e53e3e" }}>{reportData.classAvgPct}%</div>
                      </div>
                      <button onClick={() => window.print()} style={{ padding: "10px 18px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg-main)", color: "var(--text-secondary)", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>Print</button>
                    </div>
                  </div>

                  <table className="marks-table">
                    <thead>
                      <tr>
                        <th>#</th><th>Student</th><th>Roll No</th>
                        <th style={{ color: STATUS_STYLES.Present.color }}>Present</th>
                        <th style={{ color: STATUS_STYLES.Absent.color }}>Absent</th>
                        <th style={{ color: STATUS_STYLES.Late.color }}>Late</th>
                        <th style={{ color: STATUS_STYLES.Leave.color }}>Leave</th>
                        <th>Days</th><th>%</th><th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.studentSummary.map((s, i) => {
                        const isLow = s.presentPct < 75;
                        return (
                          <tr key={s._id} style={{ background: isLow ? "#fff9f9" : "transparent" }}>
                            <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{i + 1}</td>
                            <td><div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#f0fdf7", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "11px", color: "#2db87b" }}>
                                {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </div>
                              <span style={{ fontWeight: 700, fontSize: "13px" }}>{s.name}</span>
                            </div></td>
                            <td className="component-col">#{s.rollNo || s.studentId}</td>
                            <td style={{ fontWeight: 800, color: STATUS_STYLES.Present.color }}>{s.Present}</td>
                            <td style={{ fontWeight: 800, color: STATUS_STYLES.Absent.color }}>{s.Absent}</td>
                            <td style={{ fontWeight: 800, color: STATUS_STYLES.Late.color }}>{s.Late}</td>
                            <td style={{ fontWeight: 800, color: STATUS_STYLES.Leave.color }}>{s.Leave}</td>
                            <td style={{ fontWeight: 700, color: "var(--text-secondary)" }}>{s.totalDays}</td>
                            <td><span style={{ fontWeight: 900, fontSize: "14px", color: isLow ? "#e53e3e" : "#2db87b" }}>{s.presentPct}%</span></td>
                            <td><span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 800, background: isLow ? "#fff5f5" : "#f0fdf7", color: isLow ? "#e53e3e" : "#2db87b", border: `1px solid ${isLow ? "#fca5a5" : "#bbf7d0"}` }}>{isLow ? "⚠ Low" : "✓ Good"}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div style={{ marginTop: "14px", fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>⚠ Students below 75% are highlighted in red.</div>
                </div>
              )
            )}
          </>
        )}
      </main>
    </div>
  );
}
export default TeacherAttendance;
