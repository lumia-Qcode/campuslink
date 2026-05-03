import React, { useState, useEffect, useCallback } from "react";
import TeacherNavbar from "../../components/Teachernavbar";
import { getUser } from "../../services/auth";
import { fetchTeacherStudents, fetchTeacherMarks, saveTeacherMarks } from "../../services/teacherApi";

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const COMPONENTS = ["MidTerm - I", "MidTerm - II", "Final", "Quiz", "Assignment"];

function getGrade(pct) {
  if (pct >= 90) return { grade: "A+", color: "#2db87b", bg: "#f0fdf7" };
  if (pct >= 80) return { grade: "A",  color: "#2db87b", bg: "#f0fdf7" };
  if (pct >= 70) return { grade: "B",  color: "#1e9e63", bg: "#ecfdf5" };
  if (pct >= 60) return { grade: "C",  color: "#e6a800", bg: "#fffbeb" };
  return           { grade: "D",  color: "#e53e3e", bg: "#fff5f5" };
}

function TeacherMarks() {
  const user = getUser();
  const teacherClasses  = user?.classes   || ["10-A", "10-B", "9-A"];
  const teacherSubjects = user?.subjects  || ["Mathematics", "Computer Science"];

  const [selectedClass,     setSelectedClass]     = useState(teacherClasses[0] || "");
  const [selectedSubject,   setSelectedSubject]   = useState(teacherSubjects[0] || "Mathematics");
  const [selectedComponent, setSelectedComponent] = useState("MidTerm - I");
  const [total, setTotal] = useState(100);

  // students list from API
  const [students,     setStudents]     = useState([]);
  // existingMap: { studentId: { marks, total } }
  const [existingMap,  setExistingMap]  = useState({});
  const [editedMarks,  setEditedMarks]  = useState({});

  const [loading, setLoading]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [saved,   setSaved]     = useState(false);
  const [error,   setError]     = useState(null);
  const [view,    setView]      = useState("enter");

  const loadData = useCallback(async () => {
    setLoading(true);
    setEditedMarks({});
    setExistingMap({});
    setError(null);
    try {
      const [studentList, marksData] = await Promise.all([
        fetchTeacherStudents(selectedClass),
        fetchTeacherMarks(selectedClass, selectedSubject, selectedComponent),
      ]);

      setStudents(Array.isArray(studentList) ? studentList : []);

      // Backend returns { classLabel, subject, component, rows }
      // rows: [{ studentId, name, rollNo, marks, total, ... }]
      const rows = marksData?.rows || marksData?.entries || marksData || [];
      const map = {};
      rows.forEach(e => {
        if (e.marks !== null && e.marks !== undefined) {
          map[e.studentId || e.id] = { marks: e.marks, total: e.total || 100 };
        }
      });
      setExistingMap(map);
      const firstWithMarks = rows.find(r => r.total);
      if (firstWithMarks) setTotal(firstWithMarks.total || 100);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedSubject, selectedComponent]);

  useEffect(() => { loadData(); }, [loadData]);

  const getMarkForStudent = (studentId) => {
    if (editedMarks[studentId] !== undefined) return editedMarks[studentId];
    return existingMap[studentId]?.marks ?? "";
  };

  const handleMarkChange = (studentId, value) => {
    const num = Math.min(parseInt(value) || 0, total);
    setEditedMarks(prev => ({ ...prev, [studentId]: num }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const entries = students
        .map(s => ({
          studentId: s.id,
          marks: getMarkForStudent(s.id) !== "" ? Number(getMarkForStudent(s.id)) : 0,
          total,
        }))
        .filter(e => !isNaN(e.marks));

      await saveTeacherMarks(selectedClass, selectedSubject, selectedComponent, entries);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
      await loadData();
    } catch (e) {
      setError(e.message || "Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  const allVals = students.map(s => {
    const m = getMarkForStudent(s.id);
    return (m !== "" && m !== undefined) ? Number(m) : null;
  }).filter(v => v !== null && !isNaN(v));

  const avg     = allVals.length ? Math.round(allVals.reduce((a, b) => a + b, 0) / allVals.length) : 0;
  const highest = allVals.length ? Math.max(...allVals) : 0;
  const lowest  = allVals.length ? Math.min(...allVals) : 0;
  const passing = allVals.filter(v => (v / total) * 100 >= 50).length;

  return (
    <div className="app-layout">
      <TeacherNavbar />
      <main className="main-content">

        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-greeting" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg,#2db87b,#1e9e63)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" size={18} color="#fff" />
            </div>
            <span>Enter Marks</span>
            <span style={{ color: "#9aaabb", fontWeight: 500, fontSize: "14px" }}>· Academic Records</span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {["enter", "summary"].map(m => (
              <button key={m} onClick={() => setView(m)}
                style={{ padding: "6px 16px", borderRadius: "8px", border: "1.5px solid var(--border)", background: view === m ? "#2db87b" : "var(--bg-main)", color: view === m ? "#fff" : "var(--text-secondary)", fontWeight: 700, fontSize: "12.5px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                {m === "enter" ? "Enter Marks" : "View Summary"}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Class</div>
              <div style={{ display: "flex", gap: "8px" }}>
                {teacherClasses.map(cls => (
                  <button key={cls} onClick={() => { setSelectedClass(cls); setEditedMarks({}); setSaved(false); }}
                    style={{ padding: "7px 16px", borderRadius: "10px", border: "1.5px solid", borderColor: selectedClass === cls ? "#2db87b" : "var(--border)", background: selectedClass === cls ? "#f0fdf7" : "var(--bg-main)", color: selectedClass === cls ? "#2db87b" : "var(--text-secondary)", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
                    {cls}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Subject</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {teacherSubjects.map(sub => (
                  <button key={sub} onClick={() => { setSelectedSubject(sub); setEditedMarks({}); setSaved(false); }}
                    style={{ padding: "7px 16px", borderRadius: "10px", border: "1.5px solid", borderColor: selectedSubject === sub ? "#2db87b" : "var(--border)", background: selectedSubject === sub ? "#f0fdf7" : "var(--bg-main)", color: selectedSubject === sub ? "#2db87b" : "var(--text-secondary)", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
                    {sub}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Component</div>
              <select value={selectedComponent} onChange={e => { setSelectedComponent(e.target.value); setEditedMarks({}); setSaved(false); }}
                style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg-main)", color: "var(--text-primary)", fontWeight: 700, fontSize: "13px", fontFamily: "inherit", outline: "none" }}>
                {COMPONENTS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Total Marks</div>
              <input type="number" min={1} max={200} value={total} onChange={e => setTotal(parseInt(e.target.value) || 100)}
                style={{ padding: "8px 14px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg-main)", color: "var(--text-primary)", fontWeight: 700, fontSize: "13px", fontFamily: "inherit", outline: "none", width: "90px" }} />
            </div>
          </div>
        </div>

        {view === "enter" ? (
          <>
            {/* Stats */}
            <div className="stat-mini-row" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              {[
                { label: "Class Average", value: `${avg}/${total}`,    color: "#2db87b", icon: "M18 20V10M12 20V4M6 20v-6" },
                { label: "Highest",       value: `${highest}/${total}`,color: "#1e9e63", icon: "M12 19V5M5 12l7-7 7 7"    },
                { label: "Lowest",        value: `${lowest}/${total}`, color: "#e53e3e", icon: "M12 5v14M5 12l7 7 7-7"    },
                { label: "Passing",       value: `${passing}/${students.length}`, color: "#2db87b", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14" },
              ].map((s, i) => (
                <div key={i} className="stat-mini" style={{ justifyContent: "center" }}>
                  <div className="stat-mini-icon" style={{ background: s.color + "15" }}>
                    <Icon d={s.icon} size={20} color={s.color} />
                  </div>
                  <div>
                    <div className="stat-mini-label">{s.label}</div>
                    <div className="stat-mini-value" style={{ color: s.color }}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Marks Table */}
            <div className="card">
              <div className="card-header" style={{ marginBottom: "16px" }}>
                <div className="card-title">
                  <div className="card-title-icon icon-green">
                    <Icon d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" size={15} color="#2db87b" />
                  </div>
                  {selectedSubject} — {selectedComponent} — Class {selectedClass}
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Out of {total}</span>
              </div>

              {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>Loading…</div>
              ) : error ? (
                <div style={{ padding: "16px", color: "#e53e3e", background: "#fff5f5", borderRadius: "10px", fontWeight: 700 }}>{error}</div>
              ) : (
                <table className="marks-table">
                  <thead>
                    <tr><th>#</th><th>Student</th><th>Roll No</th><th>Marks Obtained</th><th>%</th><th>Grade</th></tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px" }}>No students found for this class</td></tr>
                    ) : students.map((student, i) => {
                      const m = getMarkForStudent(student.id);
                      const numMark = (m !== "" && m !== undefined) ? Number(m) : null;
                      const pct = numMark !== null && !isNaN(numMark) ? Math.round((numMark / total) * 100) : null;
                      const g = pct !== null ? getGrade(pct) : null;
                      return (
                        <tr key={student.id}>
                          <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{i + 1}</td>
                          <td className="subject-col">{student.name}</td>
                          <td className="component-col">#{student.rollNo}</td>
                          <td>
                            <input type="number" min={0} max={total}
                              value={m === "" || m === undefined ? "" : m}
                              onChange={e => handleMarkChange(student.id, e.target.value)}
                              placeholder="—"
                              style={{ width: "80px", padding: "6px 10px", borderRadius: "8px", border: "1.5px solid var(--border)", background: "var(--bg-main)", color: "var(--text-primary)", fontWeight: 800, fontSize: "13.5px", fontFamily: "inherit", outline: "none", textAlign: "center" }}
                              onFocus={e => e.target.style.borderColor = "#2db87b"}
                              onBlur={e => e.target.style.borderColor = "var(--border)"}
                            />
                          </td>
                          <td style={{ fontWeight: 800, color: g ? g.color : "var(--text-muted)" }}>
                            {pct !== null ? `${pct}%` : "—"}
                          </td>
                          <td>
                            {g ? (
                              <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "20px", background: g.bg, color: g.color, fontSize: "12px", fontWeight: 800 }}>{g.grade}</span>
                            ) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px", alignItems: "center" }}>
                {error && <span style={{ color: "#e53e3e", fontWeight: 700, fontSize: "13px" }}>{error}</span>}
                {saved && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#2db87b", fontWeight: 700, fontSize: "13px" }}>
                    <Icon d="M22 11.08V12a10 10 0 1 1-5.93-9.14" size={16} color="#2db87b" />
                    Marks Saved! Students can now see their results.
                  </span>
                )}
                <button onClick={handleSave} disabled={saving || students.length === 0}
                  style={{ padding: "10px 28px", borderRadius: "10px", border: "none", background: saving ? "#a0cdb8" : "linear-gradient(135deg, #2db87b, #1e9e63)", color: "#fff", fontWeight: 800, fontSize: "14px", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(45,184,123,0.35)" }}>
                  {saving ? "Saving…" : "Save Marks"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="card">
            <div className="card-header" style={{ marginBottom: "16px" }}>
              <div className="card-title">
                <div className="card-title-icon icon-green">
                  <Icon d="M18 20V10M12 20V4M6 20v-6" size={15} color="#2db87b" />
                </div>
                Marks Summary — {selectedClass} / {selectedSubject}
              </div>
            </div>
            {students.map((s) => {
              const m = existingMap[s.id];
              if (!m) return null;
              const pct = Math.round((m.marks / (m.total || 100)) * 100);
              const g = getGrade(pct);
              return (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--bg-main)", borderRadius: "10px", marginBottom: "8px" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "13.5px", color: "var(--text-primary)" }}>{s.name}</div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Roll #{s.rollNo}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontWeight: 900, fontSize: "16px", color: g.color }}>{pct}%</span>
                    <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-muted)" }}>{m.marks}/{m.total || 100}</span>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", background: g.bg, color: g.color, fontSize: "12px", fontWeight: 800 }}>{g.grade}</span>
                  </div>
                </div>
              );
            })}
            {students.every(s => !existingMap[s.id]) && (
              <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "13px" }}>
                No marks entered yet for this component.
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default TeacherMarks;