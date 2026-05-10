import React, { useState } from "react";
import TeacherNavbar from "../../components/Teachernavbar";
import { classStudents, teacherMarks } from "../../data/teacherMockData";

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
  const allClasses = Object.keys(classStudents);
  const [selectedClass, setSelectedClass] = useState(allClasses[0]);
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [selectedComponent, setSelectedComponent] = useState("MidTerm - I");
  const [total, setTotal] = useState(100);
  const [editedMarks, setEditedMarks] = useState({});
  const [markErrors, setMarkErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [view, setView] = useState("enter");

  const students = classStudents[selectedClass] || [];

  const existingMarks = teacherMarks[selectedClass]?.[selectedSubject] || [];
  const subjectsForClass = Object.keys(teacherMarks[selectedClass] || {});
  const allSubjects = Array.from(new Set([...subjectsForClass, "Mathematics", "Computer Science"]));

  const getMarkForStudent = (studentId) => {
    if (editedMarks[studentId] !== undefined) return editedMarks[studentId];
    const existing = existingMarks.find(m => m.studentId === studentId);
    return existing ? existing.marks : "";
  };

  const handleMarkChange = (studentId, value) => {
    const raw = value === "" ? "" : parseInt(value);
    let error = "";
    if (value !== "" && !isNaN(raw)) {
      if (raw < 0) {
        error = "Marks cannot be negative.";
      } else if (raw > total) {
        error = `Marks cannot exceed the maximum of ${total}.`;
      }
    }
    setMarkErrors(prev => ({ ...prev, [studentId]: error }));
    // Only store the raw value (don't clamp) so the error is visible
    setEditedMarks(prev => ({ ...prev, [studentId]: value === "" ? "" : raw }));
    setSaved(false);
  };

  const handleSave = () => {
    // Block save if any validation errors exist
    const hasErrors = Object.values(markErrors).some(e => e);
    if (hasErrors) return;
    setSaved(true);
  };

  const allVals = students.map(s => {
    const m = getMarkForStudent(s.id);
    return typeof m === "number" ? m : (m !== "" ? parseInt(m) : null);
  }).filter(v => v !== null && !isNaN(v));

  const avg = allVals.length ? Math.round(allVals.reduce((a, b) => a + b, 0) / allVals.length) : 0;
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
                style={{
                  padding: "6px 16px", borderRadius: "8px", border: "1.5px solid var(--border)",
                  background: view === m ? "#2db87b" : "var(--bg-main)",
                  color: view === m ? "#fff" : "var(--text-secondary)",
                  fontWeight: 700, fontSize: "12.5px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                }}>{m === "enter" ? "Enter Marks" : "View Summary"}</button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Class</div>
              <div style={{ display: "flex", gap: "8px" }}>
                {allClasses.map(cls => (
                  <button key={cls} onClick={() => { setSelectedClass(cls); setEditedMarks({}); setSaved(false); }}
                    style={{ padding: "7px 16px", borderRadius: "10px", border: "1.5px solid", borderColor: selectedClass === cls ? "#2db87b" : "var(--border)", background: selectedClass === cls ? "#f0fdf7" : "var(--bg-main)", color: selectedClass === cls ? "#2db87b" : "var(--text-secondary)", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
                    {cls}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Subject</div>
              <div style={{ display: "flex", gap: "8px" }}>
                {allSubjects.map(sub => (
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
            {/* Stats Row */}
            <div className="stat-mini-row" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              {[
                { label: "Class Average",  value: `${avg}/${total}`,    color: "#2db87b", icon: "M18 20V10M12 20V4M6 20v-6" },
                { label: "Highest",        value: `${highest}/${total}`,color: "#1e9e63", icon: "M12 19V5M5 12l7-7 7 7"    },
                { label: "Lowest",         value: `${lowest}/${total}`, color: "#e53e3e", icon: "M12 5v14M5 12l7 7 7-7"    },
                { label: "Passing",        value: `${passing}/${students.length}`, color: "#2db87b", icon: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
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

              <table className="marks-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Roll No</th>
                    <th>Marks Obtained</th>
                    <th>%</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, i) => {
                    const m = getMarkForStudent(student.id);
                    const numMark = typeof m === "number" ? m : (m !== "" ? parseInt(m) : null);
                    const pct = numMark !== null && !isNaN(numMark) ? Math.round((numMark / total) * 100) : null;
                    const g = pct !== null ? getGrade(pct) : null;
                    return (
                      <tr key={student.id}>
                        <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{i + 1}</td>
                        <td className="subject-col">{student.name}</td>
                        <td className="component-col">#{student.rollNo}</td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <input type="number" min={0} max={total}
                            value={m === "" ? "" : m}
                            onChange={e => handleMarkChange(student.id, e.target.value)}
                            placeholder="—"
                            style={{
                              width: "80px", padding: "6px 10px", borderRadius: "8px",
                              border: `1.5px solid ${markErrors[student.id] ? "#e53e3e" : "var(--border)"}`,
                              background: markErrors[student.id] ? "#fff5f5" : "var(--bg-main)",
                              color: "var(--text-primary)", fontWeight: 800, fontSize: "13.5px",
                              fontFamily: "inherit", outline: "none", textAlign: "center",
                              transition: "border-color 0.15s",
                            }}
                            onFocus={e => e.target.style.borderColor = markErrors[student.id] ? "#e53e3e" : "#2db87b"}
                            onBlur={e => e.target.style.borderColor = markErrors[student.id] ? "#e53e3e" : "var(--border)"}
                          />
                          {markErrors[student.id] && (
                            <span style={{ fontSize: "10.5px", color: "#e53e3e", fontWeight: 700, width: "120px", lineHeight: 1.3 }}>
                              {markErrors[student.id]}
                            </span>
                          )}
                          </div>
                        </td>
                        <td style={{ fontWeight: 800, color: g ? g.color : "var(--text-muted)" }}>
                          {pct !== null ? `${pct}%` : "—"}
                        </td>
                        <td>
                          {g ? (
                            <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "20px", background: g.bg, color: g.color, fontSize: "12px", fontWeight: 800 }}>
                              {g.grade}
                            </span>
                          ) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px", alignItems: "center" }}>
                {Object.values(markErrors).some(e => e) && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#e53e3e", fontWeight: 700, fontSize: "13px" }}>
                    <Icon d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" size={16} color="#e53e3e" />
                    Please fix validation errors before saving.
                  </span>
                )}
                {saved && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#2db87b", fontWeight: 700, fontSize: "13px" }}>
                    <Icon d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={16} color="#2db87b" />
                    Marks Saved!
                  </span>
                )}
                <button onClick={handleSave}
                  style={{ padding: "10px 28px", borderRadius: "10px", border: "none", background: Object.values(markErrors).some(e => e) ? "#ccc" : "linear-gradient(135deg, #2db87b, #1e9e63)", color: "#fff", fontWeight: 800, fontSize: "14px", cursor: Object.values(markErrors).some(e => e) ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: Object.values(markErrors).some(e => e) ? "none" : "0 4px 12px rgba(45,184,123,0.35)" }}>
                  Save Marks
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Summary View */
          <div className="card">
            <div className="card-header" style={{ marginBottom: "16px" }}>
              <div className="card-title">
                <div className="card-title-icon icon-green">
                  <Icon d="M18 20V10M12 20V4M6 20v-6" size={15} color="#2db87b" />
                </div>
                Marks Summary — All Classes
              </div>
            </div>
            {Object.entries(teacherMarks).map(([cls, subjects]) => (
              <div key={cls} style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ padding: "2px 10px", borderRadius: "8px", background: "#f0fdf7", color: "#2db87b" }}>Class {cls}</span>
                </div>
                {Object.entries(subjects).map(([subj, records]) => {
                  const avg2 = records.length ? Math.round(records.reduce((a, b) => a + (b.marks / b.total) * 100, 0) / records.length) : 0;
                  const g = getGrade(avg2);
                  return (
                    <div key={subj} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--bg-main)", borderRadius: "10px", marginBottom: "8px" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "13.5px", color: "var(--text-primary)" }}>{subj}</div>
                        <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>{records.length} students · {records[0]?.component}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontWeight: 900, fontSize: "16px", color: g.color }}>{avg2}%</span>
                        <span style={{ padding: "3px 10px", borderRadius: "20px", background: g.bg, color: g.color, fontSize: "12px", fontWeight: 800 }}>{g.grade}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

export default TeacherMarks;