import React, { useState, useEffect } from "react";
import TeacherNavbar from "../../components/Teachernavbar";
import { apiGetMyTeacherProfile, apiGetStudents, apiGetStudentMarks, apiGetStudentAttendance } from "../../services/api";

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

function TeacherStudents() {
  const [profile, setProfile]         = useState(null);
  const [sectionList, setSectionList] = useState([]);
  const [selectedSection, setSelectedSection] = useState("All");
  const [allStudents, setAllStudents] = useState([]);
  const [search, setSearch]           = useState("");
  const [loading, setLoading]         = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetail, setStudentDetail]     = useState(null);
  const [detailLoading, setDetailLoading]     = useState(false);

  useEffect(() => {
    apiGetMyTeacherProfile().then(async res => {
      const prof = res.data;
      setProfile(prof);
      const seen = new Map();
      (prof.assignedSections || []).forEach(s => {
        const key = `${s.classId}|${s.section}`;
        if (!seen.has(key)) seen.set(key, { classId: s.classId, section: s.section, label: `${s.classId}-${s.section}` });
      });
      const list = [...seen.values()];
      setSectionList(list);
      let all = [];
      for (const sec of list) {
        try {
          const res2 = await apiGetStudents({ classId: sec.classId, section: sec.section });
          all = [...all, ...(res2.data || []).map(s => ({ ...s, sectionLabel: sec.label }))];
        } catch (_) {}
      }
      setAllStudents(all);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadStudentDetail = async (student) => {
    setSelectedStudent(student);
    setStudentDetail(null);
    setDetailLoading(true);
    try {
      const [marksRes, attRes] = await Promise.all([
        apiGetStudentMarks(student._id),
        apiGetStudentAttendance(student._id),
      ]);
      const marks = marksRes.data || [];
      const attRecords = attRes.data || [];
      const totalDays = attRecords.length;
      const presentDays = attRecords.filter(r => r.status === "Present").length;
      const attPct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : null;
      const avgMark = marks.length
        ? Math.round(marks.reduce((a, m) => a + (m.marks / m.total) * 100, 0) / marks.length)
        : null;
      setStudentDetail({ marks, attPct, avgMark });
    } catch (_) {
      setStudentDetail({ marks: [], attPct: null, avgMark: null });
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = allStudents.filter(s => {
    const secMatch = selectedSection === "All" || s.sectionLabel === selectedSection;
    const qMatch   = !search || s.name.toLowerCase().includes(search.toLowerCase()) || String(s.rollNo || s.studentId).includes(search);
    return secMatch && qMatch;
  });

  return (
    <div className="app-layout">
      <TeacherNavbar />
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-greeting" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg,#2db87b,#1e9e63)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" size={18} color="#fff" />
            </div>
            <span>My Students</span>
            <span style={{ color: "#9aaabb", fontWeight: 500, fontSize: "14px" }}>· {allStudents.length} total</span>
          </div>
        </div>

        <div className="card" style={{ padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>
                <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={15} color="#9aaabb" />
              </span>
              <input style={{ width: "100%", padding: "9px 12px 9px 36px", border: "1.5px solid var(--border)", borderRadius: "10px", background: "var(--bg-main)", color: "var(--text-primary)", fontSize: "13.5px", fontFamily: "inherit", outline: "none" }}
                placeholder="Search by name or roll no..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["All", ...sectionList.map(s => s.label)].map(label => (
                <button key={label} onClick={() => setSelectedSection(label)}
                  style={{ padding: "7px 16px", borderRadius: "10px", border: "1.5px solid", borderColor: selectedSection === label ? "#2db87b" : "var(--border)", background: selectedSection === label ? "#f0fdf7" : "var(--bg-main)", color: selectedSection === label ? "#2db87b" : "var(--text-secondary)", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selectedStudent ? "1fr 340px" : "1fr", gap: "16px", alignItems: "start" }}>
          <div className="card">
            <div className="card-header" style={{ marginBottom: "16px" }}>
              <div className="card-title">
                <div className="card-title-icon icon-green">
                  <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" size={15} color="#2db87b" />
                </div>
                {loading ? "Loading…" : `${filtered.length} Student${filtered.length !== 1 ? "s" : ""}`}
              </div>
            </div>
            {loading ? <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>Loading students…</div>
            : filtered.length === 0 ? <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>No students found.</div>
            : (
              <table className="marks-table">
                <thead>
                  <tr><th>#</th><th>Name</th><th>Section</th><th>Roll No</th><th>Attendance</th><th>Avg Marks</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {filtered.map((student, i) => {
                    const isSelected = selectedStudent?._id === student._id;
                    return (
                      <tr key={student._id} style={{ background: isSelected ? "#f0fdf7" : "transparent", cursor: "pointer" }} onClick={() => isSelected ? setSelectedStudent(null) : loadStudentDetail(student)}>
                        <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{i + 1}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f0fdf7", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "12px", color: "#2db87b", flexShrink: 0 }}>
                              {student.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </div>
                            <span style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--text-primary)" }}>{student.name}</span>
                          </div>
                        </td>
                        <td><span style={{ padding: "2px 10px", borderRadius: "8px", background: "#f0fdf7", color: "#2db87b", fontWeight: 800, fontSize: "12px" }}>{student.sectionLabel}</span></td>
                        <td className="component-col">#{student.rollNo || student.studentId}</td>
                        <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>—</td>
                        <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>—</td>
                        <td>
                          <button onClick={e => { e.stopPropagation(); isSelected ? setSelectedStudent(null) : loadStudentDetail(student); }}
                            style={{ padding: "4px 12px", borderRadius: "8px", border: "1.5px solid #bbf7d0", background: "#f0fdf7", color: "#2db87b", fontWeight: 700, fontSize: "11.5px", cursor: "pointer", fontFamily: "inherit" }}>
                            {isSelected ? "Close" : "View"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {selectedStudent && (
            <div className="card" style={{ position: "sticky", top: "20px", borderTop: "3px solid #2db87b" }}>
              <div style={{ textAlign: "center", padding: "16px 0 20px" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0fdf7", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "20px", color: "#2db87b", margin: "0 auto 10px" }}>
                  {selectedStudent.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div style={{ fontWeight: 900, fontSize: "16px", color: "var(--text-primary)" }}>{selectedStudent.name}</div>
                <div style={{ fontSize: "12.5px", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>
                  Class {selectedStudent.sectionLabel} · Roll #{selectedStudent.rollNo || selectedStudent.studentId}
                </div>

                {detailLoading ? (
                  <div style={{ padding: "20px", color: "var(--text-muted)" }}>Loading details…</div>
                ) : studentDetail && (
                  <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "14px" }}>
                    {studentDetail.attPct !== null && (
                      <div style={{ padding: "8px 14px", borderRadius: "10px", background: "#f0fdf7", border: "1.5px solid #bbf7d0" }}>
                        <div style={{ fontWeight: 900, fontSize: "18px", color: "#2db87b" }}>{studentDetail.attPct}%</div>
                        <div style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 700 }}>Attendance</div>
                      </div>
                    )}
                    {studentDetail.avgMark !== null && (
                      <div style={{ padding: "8px 14px", borderRadius: "10px", background: "#f0fdf7", border: "1.5px solid #bbf7d0" }}>
                        <div style={{ fontWeight: 900, fontSize: "18px", color: "#2db87b" }}>{studentDetail.avgMark}%</div>
                        <div style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 700 }}>Avg Marks</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {studentDetail && (
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "10px" }}>Results</div>
                  {studentDetail.marks.length === 0 ? (
                    <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "13px", padding: "16px" }}>No marks recorded yet</div>
                  ) : studentDetail.marks.map((m, i) => {
                    const pct = Math.round((m.marks / m.total) * 100);
                    const col = pct >= 70 ? "#2db87b" : pct >= 50 ? "#e6a800" : "#e53e3e";
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < studentDetail.marks.length - 1 ? "1px solid var(--border)" : "none" }}>
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
              )}

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
