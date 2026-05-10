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

function TeacherAttendance() {
  const classes = Object.keys(classStudents);
  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [selectedDate, setSelectedDate] = useState("2026-03-28");
  const [attendance, setAttendance] = useState({});
  const [saved, setSaved] = useState(false);
  const [viewMode, setViewMode] = useState("mark");

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
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setAttendance(initForDate(selectedClass, date));
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

  const handleSave = () => setSaved(true);

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = Object.values(attendance).filter(v => v === s).length;
    return acc;
  }, {});

  const historyDates = Object.keys(teacherAttendanceRecords[selectedClass] || {}).sort().reverse();

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
                  fontWeight: 700, fontSize: "12.5px", cursor: "pointer", fontFamily: "inherit",
                  textTransform: "capitalize", transition: "all 0.15s",
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

              <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                {saved && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#2db87b", fontWeight: 700, fontSize: "13px" }}>
                    <Icon d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={16} color="#2db87b" />
                    Attendance Saved!
                  </span>
                )}
                <button onClick={handleSave}
                  style={{ padding: "10px 28px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #2db87b, #1e9e63)", color: "#fff", fontWeight: 800, fontSize: "14px", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(45,184,123,0.35)" }}>
                  Save Attendance
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

      </main>
    </div>
  );
}

export default TeacherAttendance;