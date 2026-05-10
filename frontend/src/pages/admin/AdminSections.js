import React, { useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import { mockSections as initialSections, mockTeachers, CLASS_LEVELS, getClassLabel, getTeacherName, getSubjectsForClass } from "../../data/adminMockData";

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const SECTIONS = ["A","B","C","D","E","F","G","H","I","J","K"];

export default function AdminSections() {
  const [sections, setSections] = useState(initialSections);
  const [showModal, setShowModal] = useState(false);
  const [filterClass, setFilterClass] = useState("all");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ classId: "X", section: "A", subject: "Mathematics", teacherId: "" });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const filtered = sections.filter(s => {
    const matchClass = filterClass === "all" || s.classId === filterClass;
    const matchSearch = s.subject.toLowerCase().includes(search.toLowerCase()) ||
      getClassLabel(s.classId).toLowerCase().includes(search.toLowerCase()) ||
      getTeacherName(s.teacherId).toLowerCase().includes(search.toLowerCase());
    return matchClass && matchSearch;
  });

  const subjectsForForm = getSubjectsForClass(form.classId);

  const validate = () => {
    const e = {};
    if (!form.teacherId) e.teacherId = "Please assign a teacher";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    const exists = sections.find(s => s.classId === form.classId && s.section === form.section && s.subject === form.subject);
    if (exists) {
      setErrors({ teacherId: "This class-section-subject combination already exists" });
      return;
    }
    const newSection = {
      id: `s${sections.length + 1}`,
      classId: form.classId,
      section: form.section,
      subject: form.subject,
      teacherId: form.teacherId,
      studentCount: 0,
    };
    setSections(prev => [...prev, newSection]);
    setSuccessMsg(`Section created: ${newSection.subject} · ${getClassLabel(newSection.classId)} — ${newSection.section}`);
    setTimeout(() => setSuccessMsg(""), 4000);
    setShowModal(false);
    setForm({ classId: "X", section: "A", subject: "Mathematics", teacherId: "" });
    setErrors({});
  };

  // Group by class for summary
  const classSummary = CLASS_LEVELS.map(cl => ({
    ...cl,
    count: sections.filter(s => s.classId === cl.id).length,
  })).filter(c => c.count > 0);

  const SUBJECT_COLORS = [
    "#9b6dff","#4f8ef7","#2db87b","#f5c842","#ff5c5c","#10b981","#f59e0b","#8b5cf6","#06b6d4","#ec4899",
  ];

  const getSubjectColor = (subject) => {
    const idx = ["Mathematics","English","Urdu","Science","Social Studies","Islamiyat","Computer Science","Pakistan Studies","Arts & Crafts","Physical Education"].indexOf(subject);
    return SUBJECT_COLORS[idx % SUBJECT_COLORS.length] || "#9b6dff";
  };

  return (
    <div className="app-layout">
      <AdminNavbar />
      <main className="main-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800 }}>Sections & Subjects</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>{sections.length} sections across all classes</p>
          </div>
          <button className="btn-primary" style={{ width: "auto", padding: "12px 22px", background: "linear-gradient(135deg, #2db87b, #1e9e63)", display: "flex", alignItems: "center", gap: 8 }}
            onClick={() => setShowModal(true)}>
            <Icon d="M12 5v14M5 12h14" size={15} color="#fff" />
            Create Section
          </button>
        </div>

        {successMsg && (
          <div style={{ background: "#e4f7ed", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#15803d", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon d="M9 11l3 3L22 4" size={15} color="#15803d" />
            {successMsg}
          </div>
        )}

        {/* Class Summary Chips */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          <button onClick={() => setFilterClass("all")}
            style={{ padding: "7px 16px", borderRadius: 20, border: `2px solid ${filterClass === "all" ? "#2db87b" : "var(--border)"}`, background: filterClass === "all" ? "#e4f7ed" : "#fff", color: filterClass === "all" ? "#15803d" : "var(--text-secondary)", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>
            All Classes ({sections.length})
          </button>
          {classSummary.map(c => (
            <button key={c.id} onClick={() => setFilterClass(c.id)}
              style={{ padding: "7px 16px", borderRadius: 20, border: `2px solid ${filterClass === c.id ? "#2db87b" : "var(--border)"}`, background: filterClass === c.id ? "#e4f7ed" : "#fff", color: filterClass === c.id ? "#15803d" : "var(--text-secondary)", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>
              {c.label} ({c.count})
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={15} color="var(--text-muted)" />
          </span>
          <input className="form-input" style={{ paddingLeft: 40 }} placeholder="Search by subject, class, or teacher name..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Sections Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
          {filtered.map(s => {
            const teacher = mockTeachers.find(t => t.id === s.teacherId);
            const color = getSubjectColor(s.subject);
            return (
              <div key={s.id} className="card" style={{ padding: "18px", borderLeft: `4px solid ${color}`, transition: "transform 0.15s, box-shadow 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 3 }}>{s.subject}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>
                      {getClassLabel(s.classId)} — {s.section}
                    </div>
                  </div>
                  <span style={{ background: color + "15", color, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>
                    {s.studentCount} students
                  </span>
                </div>

                <div style={{ background: "var(--bg-main)", borderRadius: 10, padding: "10px 12px" }}>
                  {teacher ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#e8f0ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, flexShrink: 0 }}>
                        {teacher.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 12.5 }}>{teacher.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{teacher.department}</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12.5, color: "var(--text-muted)", fontStyle: "italic" }}>No teacher assigned</div>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "50px 20px", color: "var(--text-muted)", fontSize: 14 }}>
              No sections found for the selected filter.
            </div>
          )}
        </div>

        {/* CREATE SECTION MODAL */}
        {showModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
              <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>Create New Section</div>
                <button onClick={() => { setShowModal(false); setErrors({}); }} style={{ background: "var(--bg-main)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer" }}>
                  <Icon d="M18 6L6 18M6 6l12 12" size={16} />
                </button>
              </div>
              <div style={{ padding: "20px 28px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                  <div className="form-group">
                    <label className="form-label">Class *</label>
                    <select className="form-input" value={form.classId}
                      onChange={e => {
                        const cid = e.target.value;
                        const subs = getSubjectsForClass(cid);
                        setForm(f => ({ ...f, classId: cid, subject: subs[0] }));
                      }}>
                      {CLASS_LEVELS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section *</label>
                    <select className="form-input" value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))}>
                      {SECTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <select className="form-input" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                    {subjectsForForm.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign Teacher *</label>
                  <select className={`form-input${errors.teacherId ? " input-error" : ""}`} value={form.teacherId} onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))}>
                    <option value="">— Select a teacher —</option>
                    {mockTeachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.department})</option>)}
                  </select>
                  {errors.teacherId && <div style={{ color: "#e53e3e", fontSize: 11.5, marginTop: 4, fontWeight: 600 }}>{errors.teacherId}</div>}
                </div>
                <div style={{ background: "var(--bg-main)", borderRadius: 10, padding: "12px 14px", marginTop: 4 }}>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 700 }}>Preview</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)", marginTop: 3 }}>
                    {form.subject} · {getClassLabel(form.classId)} — Section {form.section}
                    {form.teacherId && ` → ${getTeacherName(form.teacherId)}`}
                  </div>
                </div>
              </div>
              <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", gap: 12 }}>
                <button onClick={() => { setShowModal(false); setErrors({}); }}
                  style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid var(--border)", background: "#fff", color: "var(--text-secondary)", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                  Cancel
                </button>
                <button onClick={handleAdd} className="btn-primary" style={{ flex: 1, background: "linear-gradient(135deg,#2db87b,#1e9e63)" }}>
                  ✓ Create Section
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
