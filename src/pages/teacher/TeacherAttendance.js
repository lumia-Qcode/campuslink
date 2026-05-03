import React, { useState, useEffect, useCallback } from "react";
import TeacherNavbar from "../../components/Teachernavbar";
import { getUser } from "../../services/auth";
import { fetchTeacherStudents, fetchTeacherAttendance, saveTeacherAttendance } from "../../services/teacherApi";

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

function TeacherAttendance() {
  const user = getUser();
  const teacherClasses = user?.classes || ["10-A", "10-B", "9-A"];

  const todayISO = new Date().toISOString().split("T")[0];

  const [selectedClass, setSelectedClass] = useState(teacherClasses[0] || "");
  const [selectedDate, setSelectedDate]   = useState(todayISO);
  const [students, setStudents]           = useState([]);
  const [attendance, setAttendance]       = useState({});
  const [saving, setSaving]               = useState(false);
  const [saved, setSaved]                 = useState(false);
  const [saveError, setSaveError]         = useState(null);
  const [viewMode, setViewMode]           = useState("mark");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [historyRecords, setHistoryRecords]   = useState([]);
  const [loadingHistory, setLoadingHistory]   = useState(false);

  // Load students for selected class
  const loadStudents = useCallback(async (cls) => {
    setLoadingStudents(true);
    try {
      const list = await fetchTeacherStudents(cls);
      const arr = Array.isArray(list) ? list : [];
      setStudents(arr);
      // Default everyone to Present
      const init = {};
      arr.forEach(s => { init[s.id] = "Present"; });
      setAttendance(init);
    } catch { setStudents([]); }
    finally { setLoadingStudents(false); }
  }, []);

  // Load existing attendance for class+date
  // Backend returns: { classLabel, date, rows: [{ studentId, name, rollNo, status, note }] }
  const loadAttendance = useCallback(async (cls, date) => {
    try {
      const data = await fetchTeacherAttendance(cls, date);
      // Support both { rows } (new backend shape) and { students } (old shape)
      const list = data?.rows || data?.students || data || [];
      if (list.length > 0) {
        const map = {};
        list.forEach(s => {
          const id = s.studentId || s.id;
          if (id && s.status) map[id] = s.status;
        });
        setAttendance(prev => ({ ...prev, ...map }));
      }
    } catch { /* no existing record is fine */ }
  }, []);

  useEffect(() => {
    loadStudents(selectedClass);
  }, [selectedClass, loadStudents]);

  useEffect(() => {
    if (selectedClass && selectedDate) loadAttendance(selectedClass, selectedDate);
  }, [selectedClass, selectedDate, loadAttendance]);

  // Load history records when switching to history view
  useEffect(() => {
    if (viewMode !== "history") return;
    async function loadHistory() {
      setLoadingHistory(true);
      const records = [];
      const now = new Date();
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        try {
          const data = await fetchTeacherAttendance(selectedClass, dateStr);
          // Support both shapes
          const list = data?.rows || data?.students || data || [];
          if (list.length > 0 && list.some(s => s.status)) {
            records.push({ date: dateStr, students: list });
          }
        } catch { /* skip */ }
      }
      setHistoryRecords(records);
      setLoadingHistory(false);
    }
    loadHistory();
  }, [viewMode, selectedClass]);

  const handleClassChange = (cls) => {
    setSelectedClass(cls);
    setSaved(false);
    setSaveError(null);
    setHistoryRecords([]);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSaved(false);
    setSaveError(null);
  };

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

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const records = students.map(s => ({
        studentId: s.id,
        status: attendance[s.id] || "Present",
        note: null,
      }));
      await saveTeacherAttendance(selectedClass, selectedDate, records);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (e) {
      setSaveError(e.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = Object.values(attendance).filter(v => v === s).length;
    return acc;
  }, {});

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
            <span style={{ color: "#9aaabb", fontWeight: 500, fontSize: "14px" }}>· Mark & Review</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {["mark", "history"].map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                style={{
                  padding: "6px 16px", borderRadius: "8px", border: "1.5px solid var(--border)",
                  background: viewMode === m ? "#2db87b" : "var(--bg-main)",
                  color: viewMode === m ? "#fff" : "var(--text-secondary)",
                  fontWeight: 700, fontSize: "12.5px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                }}>{m === "mark" ? "Mark Attendance" : "View History"}</button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Class</div>
              <div style={{ display: "flex", gap: "8px" }}>
                {teacherClasses.map(cls => (
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
                style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg-main)", color: "var(--text-primary)", fontWeight: 700, fontSize: "13px", fontFamily: "inherit", cursor: "pointer", outline: "none" }} />
            </div>
          </div>
        </div>

        {viewMode === "mark" ? (
          <>
            {/* Summary Chips */}
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

            {/* Bulk Buttons */}
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

              {loadingStudents ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>Loading students…</div>
              ) : students.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No students found for this class.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {students.map((student) => {
                    const current = attendance[student.id] || "Present";
                    const st = STATUS_STYLES[current];
                    return (
                      <div key={student.id} style={{
                        display: "flex", alignItems: "center", gap: "14px",
                        padding: "12px 16px", borderRadius: "12px",
                        border: `1.5px solid ${st.border}`, background: st.bg, transition: "all 0.15s",
                      }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: st.color + "25", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "13px", color: st.color, flexShrink: 0 }}>
                          {student.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13.5px", fontWeight: 800, color: "var(--text-primary)" }}>{student.name}</div>
                          <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Roll #{student.rollNo}</div>
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {STATUS_OPTIONS.map(s => {
                            const ss = STATUS_STYLES[s];
                            const isActive = current === s;
                            return (
                              <button key={s} onClick={() => setStatus(student.id, s)}
                                style={{
                                  padding: "4px 12px", borderRadius: "8px", border: `1.5px solid ${isActive ? ss.color : "var(--border)"}`,
                                  background: isActive ? ss.color : "var(--bg-main)",
                                  color: isActive ? "#fff" : "var(--text-muted)",
                                  fontWeight: 700, fontSize: "11.5px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                                }}>{s}</button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px", alignItems: "center" }}>
                {saveError && (
                  <span style={{ color: "#e53e3e", fontWeight: 700, fontSize: "13px" }}>{saveError}</span>
                )}
                {saved && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#2db87b", fontWeight: 700, fontSize: "13px" }}>
                    <Icon d="M22 11.08V12a10 10 0 1 1-5.93-9.14" size={16} color="#2db87b" />
                    Attendance Saved!
                  </span>
                )}
                <button onClick={handleSave} disabled={saving || students.length === 0}
                  style={{ padding: "10px 28px", borderRadius: "10px", border: "none", background: saving ? "#a0cdb8" : "linear-gradient(135deg, #2db87b, #1e9e63)", color: "#fff", fontWeight: 800, fontSize: "14px", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(45,184,123,0.35)" }}>
                  {saving ? "Saving…" : "Save Attendance"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="card">
            <div className="card-header" style={{ marginBottom: "16px" }}>
              <div className="card-title">
                <div className="card-title-icon icon-green">
                  <Icon d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" size={15} color="#2db87b" />
                </div>
                Attendance History — {selectedClass} (Last 7 days)
              </div>
            </div>
            {loadingHistory ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>Loading history…</div>
            ) : historyRecords.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No records found for the last 7 days.</div>
            ) : historyRecords.map(({ date, students: dayStudents }) => {
              const presentCount = dayStudents.filter(s => s.status === "Present").length;
              const total = dayStudents.length;
              const pct = total > 0 ? Math.round((presentCount / total) * 100) : 0;
              return (
                <div key={date} style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontWeight: 800, fontSize: "13.5px", color: "var(--text-primary)" }}>{date}</span>
                    <span style={{ fontWeight: 800, fontSize: "13px", color: pct >= 80 ? "#2db87b" : "#e53e3e" }}>{pct}% Present</span>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {dayStudents.map(s => {
                      const ss = STATUS_STYLES[s.status] || { color: "#9aaabb", bg: "#f0f4f8", border: "#e4eaf0" };
                      const id = s.studentId || s.id;
                      return (
                        <span key={id} style={{ padding: "2px 10px", borderRadius: "8px", background: ss.bg, color: ss.color, fontSize: "11px", fontWeight: 700, border: `1px solid ${ss.border}` }}>
                          {s.name?.split(" ")[0] || s.studentCode}: {s.status}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}

export default TeacherAttendance;