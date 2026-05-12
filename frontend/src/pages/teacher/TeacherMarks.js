import React, { useState, useEffect, useCallback } from "react";
import TeacherNavbar from "../../components/Teachernavbar";
import {
  apiGetMyTeacherProfile,
  apiGetStudents,
  apiSaveMarks,
  apiGetMarks,
  apiGetMarksForClass,
} from "../../services/api";

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
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
  const [profile, setProfile]           = useState(null);
  const [sectionList, setSectionList]   = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [subjects, setSubjects]         = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedComponent, setSelectedComponent] = useState("MidTerm - I");
  const [total, setTotal]               = useState(100);
  const [students, setStudents]         = useState([]);
  const [editedMarks, setEditedMarks]   = useState({});
  const [markErrors, setMarkErrors]     = useState({});
  const [saved, setSaved]               = useState(false);
  const [saving, setSaving]             = useState(false);
  const [view, setView]                 = useState("enter");
  const [loading, setLoading]           = useState(true);
  const [summaryData, setSummaryData]   = useState([]);

  // Load profile and derive sections + subjects
  useEffect(() => {
    apiGetMyTeacherProfile().then(res => {
      const prof = res.data;
      setProfile(prof);
      const seen = new Map();
      (prof.assignedSections || []).forEach(s => {
        const key = `${s.classId}|${s.section}`;
        if (!seen.has(key)) seen.set(key, { classId: s.classId, section: s.section, label: `${s.classId}-${s.section}`, subjects: [] });
        seen.get(key).subjects.push(s.subject);
      });
      const list = [...seen.values()];
      setSectionList(list);
      if (list.length) {
        setSelectedSection(list[0]);
        setSubjects(list[0].subjects);
        if (list[0].subjects.length) setSelectedSubject(list[0].subjects[0]);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Load students when section changes
  useEffect(() => {
    if (!selectedSection) return;
    apiGetStudents({ classId: selectedSection.classId, section: selectedSection.section })
      .then(res => setStudents(res.data || []))
      .catch(() => setStudents([]));
  }, [selectedSection]);

  // Load existing marks when section/subject/component changes
  const loadMarks = useCallback(async () => {
    if (!selectedSection || !selectedSubject || !selectedComponent) return;
    try {
      const res = await apiGetMarks(selectedSection.classId, selectedSection.section, selectedSubject, selectedComponent);
      const records = res.data || [];
      const map = {};
      records.forEach(r => { map[r.studentId._id || r.studentId] = r.marks; });
      setEditedMarks(map);
    } catch (_) { setEditedMarks({}); }
    setSaved(false);
    setMarkErrors({});
  }, [selectedSection, selectedSubject, selectedComponent]);

  useEffect(() => { loadMarks(); }, [loadMarks]);

  // Load summary data
  useEffect(() => {
    if (view !== "summary" || !selectedSection) return;
    apiGetMarksForClass(selectedSection.classId, selectedSection.section)
      .then(res => setSummaryData(res.data || []))
      .catch(() => setSummaryData([]));
  }, [view, selectedSection]);

  const handleSectionChange = (sec) => {
    setSelectedSection(sec);
    setSubjects(sec.subjects);
    if (sec.subjects.length) setSelectedSubject(sec.subjects[0]);
    setEditedMarks({});
    setSaved(false);
  };

  const handleMarkChange = (studentId, value) => {
    const raw = value === "" ? "" : parseInt(value);
    let error = "";
    if (value !== "" && !isNaN(raw)) {
      if (raw < 0) error = "Marks cannot be negative.";
      else if (raw > total) error = `Cannot exceed ${total}.`;
    }
    setMarkErrors(prev => ({ ...prev, [studentId]: error }));
    setEditedMarks(prev => ({ ...prev, [studentId]: value === "" ? "" : raw }));
    setSaved(false);
  };

  const handleSave = async () => {
    const hasErrors = Object.values(markErrors).some(e => e);
    if (hasErrors || !selectedSection || !selectedSubject) return;
    setSaving(true);
    try {
      const records = students
        .filter(s => editedMarks[s._id] !== undefined && editedMarks[s._id] !== "")
        .map(s => ({ studentId: s._id, marks: Number(editedMarks[s._id]) }));
      if (!records.length) { alert("Enter at least one mark."); setSaving(false); return; }
      await apiSaveMarks({
        classId: selectedSection.classId,
        section: selectedSection.section,
        subject: selectedSubject,
        component: selectedComponent,
        total,
        records,
      });
      setSaved(true);
    } catch (e) {
      alert("Failed to save marks: " + (e.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const getMarkForStudent = (studentId) => {
    const v = editedMarks[studentId];
    return v !== undefined ? v : "";
  };

  const allVals = students.map(s => {
    const m = editedMarks[s._id];
    return (m !== undefined && m !== "" && !isNaN(Number(m))) ? Number(m) : null;
  }).filter(v => v !== null);

  const avg     = allVals.length ? Math.round(allVals.reduce((a, b) => a + b, 0) / allVals.length) : 0;
  const highest = allVals.length ? Math.max(...allVals) : 0;
  const lowest  = allVals.length ? Math.min(...allVals) : 0;
  const passing = allVals.filter(v => (v / total) * 100 >= 50).length;

  // Build summary by subject+component
  const summaryGrouped = {};
  summaryData.forEach(r => {
    const key = `${r.subject}||${r.component}`;
    if (!summaryGrouped[key]) summaryGrouped[key] = { subject: r.subject, component: r.component, records: [] };
    summaryGrouped[key].records.push(r);
  });

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
            {subjects.length > 0 && (
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Subject</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {subjects.map(sub => (
                    <button key={sub} onClick={() => { setSelectedSubject(sub); setEditedMarks({}); setSaved(false); }}
                      style={{ padding: "7px 16px", borderRadius: "10px", border: "1.5px solid", borderColor: selectedSubject === sub ? "#2db87b" : "var(--border)", background: selectedSubject === sub ? "#f0fdf7" : "var(--bg-main)", color: selectedSubject === sub ? "#2db87b" : "var(--text-secondary)", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
            <div className="stat-mini-row" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              {[
                { label: "Class Average", value: `${avg}/${total}`,           color: "#2db87b", icon: "M18 20V10M12 20V4M6 20v-6" },
                { label: "Highest",       value: `${highest}/${total}`,       color: "#1e9e63", icon: "M12 19V5M5 12l7-7 7 7" },
                { label: "Lowest",        value: `${lowest}/${total}`,        color: "#e53e3e", icon: "M12 5v14M5 12l7 7 7-7" },
                { label: "Passing",       value: `${passing}/${students.length}`, color: "#2db87b", icon: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
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

            <div className="card">
              <div className="card-header" style={{ marginBottom: "16px" }}>
                <div className="card-title">
                  <div className="card-title-icon icon-green">
                    <Icon d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" size={15} color="#2db87b" />
                  </div>
                  {selectedSubject} — {selectedComponent} — {selectedSection?.label}
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Out of {total}</span>
              </div>
              {students.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>No students in this section.</div>
              ) : (
                <table className="marks-table">
                  <thead><tr><th>#</th><th>Student</th><th>Roll No</th><th>Marks</th><th>%</th><th>Grade</th></tr></thead>
                  <tbody>
                    {students.map((student, i) => {
                      const m = getMarkForStudent(student._id);
                      const numMark = m !== "" && !isNaN(Number(m)) ? Number(m) : null;
                      const pct = numMark !== null ? Math.round((numMark / total) * 100) : null;
                      const g = pct !== null ? getGrade(pct) : null;
                      return (
                        <tr key={student._id}>
                          <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{i + 1}</td>
                          <td className="subject-col">{student.name}</td>
                          <td className="component-col">#{student.rollNo || student.studentId}</td>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <input type="number" min={0} max={total} value={m} onChange={e => handleMarkChange(student._id, e.target.value)} placeholder="—"
                                style={{ width: "80px", padding: "6px 10px", borderRadius: "8px", border: `1.5px solid ${markErrors[student._id] ? "#e53e3e" : "var(--border)"}`, background: markErrors[student._id] ? "#fff5f5" : "var(--bg-main)", color: "var(--text-primary)", fontWeight: 800, fontSize: "13.5px", fontFamily: "inherit", outline: "none", textAlign: "center" }} />
                              {markErrors[student._id] && <span style={{ fontSize: "10.5px", color: "#e53e3e", fontWeight: 700, width: "120px", lineHeight: 1.3 }}>{markErrors[student._id]}</span>}
                            </div>
                          </td>
                          <td style={{ fontWeight: 800, color: g ? g.color : "var(--text-muted)" }}>{pct !== null ? `${pct}%` : "—"}</td>
                          <td>{g ? <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "20px", background: g.bg, color: g.color, fontSize: "12px", fontWeight: 800 }}>{g.grade}</span> : <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px", alignItems: "center" }}>
                {Object.values(markErrors).some(e => e) && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#e53e3e", fontWeight: 700, fontSize: "13px" }}>
                    <Icon d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" size={16} color="#e53e3e" />
                    Fix errors before saving.
                  </span>
                )}
                {saved && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#2db87b", fontWeight: 700, fontSize: "13px" }}>
                    <Icon d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={16} color="#2db87b" /> Marks Saved!
                  </span>
                )}
                <button onClick={handleSave} disabled={saving || Object.values(markErrors).some(e => e)}
                  style={{ padding: "10px 28px", borderRadius: "10px", border: "none", background: saving || Object.values(markErrors).some(e => e) ? "#ccc" : "linear-gradient(135deg, #2db87b, #1e9e63)", color: "#fff", fontWeight: 800, fontSize: "14px", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(45,184,123,0.35)" }}>
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
                Marks Summary — {selectedSection?.label}
              </div>
            </div>
            {Object.values(summaryGrouped).length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>No marks recorded yet for this section.</div>
            ) : (
              Object.values(summaryGrouped).map((grp, idx) => {
                const avg2 = grp.records.length ? Math.round(grp.records.reduce((a, r) => a + (r.marks / r.total) * 100, 0) / grp.records.length) : 0;
                const g = getGrade(avg2);
                return (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--bg-main)", borderRadius: "10px", marginBottom: "8px" }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "13.5px", color: "var(--text-primary)" }}>{grp.subject}</div>
                      <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>{grp.records.length} students · {grp.component}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontWeight: 900, fontSize: "16px", color: g.color }}>{avg2}%</span>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", background: g.bg, color: g.color, fontSize: "12px", fontWeight: 800 }}>{g.grade}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}
export default TeacherMarks;
