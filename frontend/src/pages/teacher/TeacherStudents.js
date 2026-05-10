import React, { useState } from "react";
import TeacherNavbar from "../../components/Teachernavbar";
import { classStudents, teacherMarks, teacherAttendanceRecords } from "../../data/teacherMockData";

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

// All classes get shades of green
const CLASS_COLORS = { "10-A": "#2db87b", "10-B": "#1e9e63", "9-A": "#4ade80" };

function getAttendancePct(studentId, cls) {
  const records = teacherAttendanceRecords[cls] || {};
  const dates = Object.keys(records);
  if (!dates.length) return null;
  const present = dates.filter(d => records[d][studentId] === "Present").length;
  return Math.round((present / dates.length) * 100);
}

function getAvgMarks(studentId, cls) {
  const subjects = teacherMarks[cls] || {};
  const allMarks = Object.values(subjects).flat().filter(m => m.studentId === studentId);
  if (!allMarks.length) return null;
  const avg = Math.round(allMarks.reduce((a, m) => a + (m.marks / m.total) * 100, 0) / allMarks.length);
  return avg;
}

function TeacherStudents() {
  const classes = Object.keys(classStudents);
  const [selectedClass, setSelectedClass] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const allStudents = selectedClass === "All"
    ? Object.entries(classStudents).flatMap(([cls, students]) => students.map(s => ({ ...s, class: cls })))
    : (classStudents[selectedClass] || []).map(s => ({ ...s, class: selectedClass }));

  const filtered = allStudents.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || String(s.rollNo).includes(search)
  );

  const studentDetails = selectedStudent ? (() => {
    const cls = selectedStudent.class;
    const subjects = teacherMarks[cls] || {};
    const marksList = Object.entries(subjects).flatMap(([subj, records]) => {
      const m = records.find(r => r.studentId === selectedStudent.id);
      return m ? [{ subject: subj, ...m }] : [];
    });
    const attPct = getAttendancePct(selectedStudent.id, cls);
    const avgMark = getAvgMarks(selectedStudent.id, cls);
    return { marksList, attPct, avgMark };
  })() : null;

  return (
    <div className="app-layout">
      <TeacherNavbar />
      <main className="main-content">

        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-greeting" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg,#2db87b,#1e9e63)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" size={18} color="#fff" />
            </div>
            <span>My Students</span>
            <span style={{ color: "#9aaabb", fontWeight: 500, fontSize: "14px" }}>· {Object.values(classStudents).flat().length} total</span>
          </div>
        </div>

        {/* Controls */}
        <div className="card" style={{ padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>
                <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={15} color="#9aaabb" />
              </span>
              <input style={{ width: "100%", padding: "9px 12px 9px 36px", border: "1.5px solid var(--border)", borderRadius: "10px", background: "var(--bg-main)", color: "var(--text-primary)", fontSize: "13.5px", fontFamily: "inherit", outline: "none" }}
                placeholder="Search by name or roll no..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {["All", ...classes].map(cls => {
                return (
                  <button key={cls} onClick={() => setSelectedClass(cls)}
                    style={{ padding: "7px 16px", borderRadius: "10px", border: "1.5px solid", borderColor: selectedClass === cls ? "#2db87b" : "var(--border)", background: selectedClass === cls ? "#f0fdf7" : "var(--bg-main)", color: selectedClass === cls ? "#2db87b" : "var(--text-secondary)", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
                    {cls}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selectedStudent ? "1fr 340px" : "1fr", gap: "16px", alignItems: "start" }}>
          {/* Student List */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: "16px" }}>
              <div className="card-title">
                <div className="card-title-icon icon-green">
                  <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" size={15} color="#2db87b" />
                </div>
                {filtered.length} Student{filtered.length !== 1 ? "s" : ""}
              </div>
            </div>
            <table className="marks-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Roll No</th>
                  <th>Attendance</th>
                  <th>Avg Marks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student, i) => {
                  const attPct = getAttendancePct(student.id, student.class);
                  const avgMark = getAvgMarks(student.id, student.class);
                  const isSelected = selectedStudent?.id === student.id && selectedStudent?.class === student.class;
                  return (
                    <tr key={`${student.id}-${student.class}`} style={{ background: isSelected ? "#f0fdf7" : "transparent", cursor: "pointer" }} onClick={() => setSelectedStudent(isSelected ? null : student)}>
                      <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{i + 1}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f0fdf7", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "12px", color: "#2db87b", flexShrink: 0 }}>
                            {student.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <span style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--text-primary)" }}>{student.name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ padding: "2px 10px", borderRadius: "8px", background: "#f0fdf7", color: "#2db87b", fontWeight: 800, fontSize: "12px" }}>
                          {student.class}
                        </span>
                      </td>
                      <td className="component-col">#{student.rollNo}</td>
                      <td style={{ fontWeight: 800, color: attPct !== null ? (attPct >= 75 ? "#2db87b" : "#e53e3e") : "var(--text-muted)" }}>
                        {attPct !== null ? `${attPct}%` : "—"}
                      </td>
                      <td style={{ fontWeight: 800, color: avgMark !== null ? (avgMark >= 70 ? "#2db87b" : "#e6a800") : "var(--text-muted)" }}>
                        {avgMark !== null ? `${avgMark}%` : "—"}
                      </td>
                      <td>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedStudent(isSelected ? null : student); }}
                          style={{ padding: "4px 12px", borderRadius: "8px", border: "1.5px solid #bbf7d0", background: "#f0fdf7", color: "#2db87b", fontWeight: 700, fontSize: "11.5px", cursor: "pointer", fontFamily: "inherit" }}>
                          {isSelected ? "Close" : "View"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Student Detail Panel */}
          {selectedStudent && studentDetails && (
            <div className="card" style={{ position: "sticky", top: "20px", borderTop: "3px solid #2db87b" }}>
              <div style={{ textAlign: "center", padding: "16px 0 20px" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0fdf7", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "20px", color: "#2db87b", margin: "0 auto 10px" }}>
                  {selectedStudent.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div style={{ fontWeight: 900, fontSize: "16px", color: "var(--text-primary)" }}>{selectedStudent.name}</div>
                <div style={{ fontSize: "12.5px", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>
                  Class {selectedStudent.class} · Roll #{selectedStudent.rollNo}
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "14px" }}>
                  {studentDetails.attPct !== null && (
                    <div style={{ padding: "8px 14px", borderRadius: "10px", background: "#f0fdf7", border: "1.5px solid #bbf7d0" }}>
                      <div style={{ fontWeight: 900, fontSize: "18px", color: "#2db87b" }}>{studentDetails.attPct}%</div>
                      <div style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 700 }}>Attendance</div>
                    </div>
                  )}
                  {studentDetails.avgMark !== null && (
                    <div style={{ padding: "8px 14px", borderRadius: "10px", background: "#f0fdf7", border: "1.5px solid #bbf7d0" }}>
                      <div style={{ fontWeight: 900, fontSize: "18px", color: "#2db87b" }}>{studentDetails.avgMark}%</div>
                      <div style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 700 }}>Avg Marks</div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "10px" }}>Results</div>
                {studentDetails.marksList.length === 0 ? (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "13px", padding: "16px" }}>No marks recorded yet</div>
                ) : studentDetails.marksList.map((m, i) => {
                  const pct = Math.round((m.marks / m.total) * 100);
                  const col = pct >= 80 ? "#2db87b" : pct >= 60 ? "#2db87b" : "#e53e3e";
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < studentDetails.marksList.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>{m.subject}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>{m.component}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 900, fontSize: "15px", color: col }}>{pct}%</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>{m.marks}/{m.total}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button onClick={() => setSelectedStudent(null)}
                style={{ width: "100%", marginTop: "16px", padding: "10px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg-main)", color: "var(--text-secondary)", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
                Close Panel
              </button>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default TeacherStudents;