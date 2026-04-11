import React, { useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import { mockStudents as initialStudents, mockTeachers, CLASS_LEVELS, getClassLabel } from "../../data/adminMockData";

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const SECTIONS = ["A","B","C","D","E","F","G","H","I","J","K"];

const EMPTY_FORM = {
  name: "", email: "", cnic: "", dob: "", gender: "Male",
  phone: "", address: "",
  fatherName: "", fatherCnic: "", fatherPhone: "", fatherOccupation: "",
  motherName: "", motherPhone: "",
  classId: "X", section: "A", rollNo: "",
};

export default function AdminStudents() {
  const [students, setStudents] = useState(initialStudents);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [step, setStep] = useState(1); // 1=personal, 2=parent, 3=class
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [viewStudent, setViewStudent] = useState(null);
  const [errors, setErrors] = useState({});

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());
    const matchClass = filterClass === "all" || s.classId === filterClass;
    return matchSearch && matchClass;
  });

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.name.trim()) e.name = "Name is required";
      if (!form.email.trim()) e.email = "Email is required";
      if (!form.dob) e.dob = "Date of birth is required";
      if (!form.cnic.trim()) e.cnic = "CNIC/B-Form is required";
    }
    if (step === 2) {
      if (!form.fatherName.trim()) e.fatherName = "Father's name is required";
      if (!form.fatherPhone.trim()) e.fatherPhone = "Father's phone is required";
    }
    if (step === 3) {
      if (!form.rollNo) e.rollNo = "Roll number is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validate()) setStep(s => s + 1); };
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = () => {
    if (!validate()) return;
    const newStudent = {
      ...form,
      id: `STU-${String(students.length + 1).padStart(3, "0")}`,
      rollNo: parseInt(form.rollNo),
      admissionDate: new Date().toISOString().split("T")[0],
      feeStatus: "Pending",
    };
    setStudents(prev => [...prev, newStudent]);
    setShowModal(false);
    setForm(EMPTY_FORM);
    setStep(1);
    setErrors({});
  };

  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM); setStep(1); setErrors({}); };

  const inp = (label, key, type = "text", opts = {}) => (
    <div className="form-group">
      <label className="form-label">{label}{opts.required !== false && " *"}</label>
      <input className={`form-input${errors[key] ? " input-error" : ""}`}
        type={type} placeholder={opts.placeholder || `Enter ${label.toLowerCase()}`}
        value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
      {errors[key] && <div style={{ color: "#e53e3e", fontSize: 11.5, marginTop: 4, fontWeight: 600 }}>{errors[key]}</div>}
    </div>
  );

  const sel = (label, key, options) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select className="form-input" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}>
        {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
      </select>
    </div>
  );

  const feeColor = (s) => s === "Paid" ? { bg: "#e4f7ed", color: "#15803d" } : s === "Pending" ? { bg: "#fffbeb", color: "#b45309" } : { bg: "#fff5f5", color: "#dc2626" };

  return (
    <div className="app-layout">
      <AdminNavbar />
      <main className="main-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800 }}>Students</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>{students.length} students enrolled</p>
          </div>
          <button className="btn-primary" style={{ width: "auto", padding: "12px 22px", background: "linear-gradient(135deg, #9b6dff, #7c3aed)", display: "flex", alignItems: "center", gap: 8 }}
            onClick={() => setShowModal(true)}>
            <Icon d="M12 5v14M5 12h14" size={15} color="#fff" />
            Add Student
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={15} color="var(--text-muted)" />
            <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Search by name, email, or ID..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={15} color="var(--text-muted)" />
            </span>
          </div>
          <select className="teacher-form-select" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="all">All Classes</option>
            {CLASS_LEVELS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>

        {/* Students Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg-main)", borderBottom: "2px solid var(--border)" }}>
                  {["Student ID","Name","Class & Section","Contact","Parent","Fee Status","Action"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.7px", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", fontSize: 14 }}>No students found.</td></tr>
                ) : filtered.map((s, i) => {
                  const fc = feeColor(s.feeStatus);
                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-main)"}
                      onMouseLeave={e => e.currentTarget.style.background = ""}>
                      <td style={{ padding: "12px 16px", fontSize: 12.5, color: "var(--text-muted)", fontWeight: 700 }}>{s.id}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                            background: s.gender === "Female" ? "#f5f3ff" : "#e8f0ff",
                            color: s.gender === "Female" ? "#7c3aed" : "#2563eb",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 800, fontSize: 12,
                          }}>
                            {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>{s.name}</div>
                            <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: "#f5f3ff", color: "#7c3aed", fontSize: 12, fontWeight: 700 }}>
                          {getClassLabel(s.classId)} — {s.section}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3, paddingLeft: 2 }}>Roll #{s.rollNo}</div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12.5, color: "var(--text-secondary)" }}>{s.phone || "—"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>{s.fatherName}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{s.fatherPhone}</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: fc.bg, color: fc.color }}>{s.feeStatus}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <button onClick={() => setViewStudent(s)} style={{ background: "#f5f3ff", color: "#7c3aed", border: "none", borderRadius: 8, padding: "6px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ADD STUDENT MODAL */}
        {showModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 580, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
              {/* Modal Header */}
              <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>Add New Student</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>Step {step} of 3 — {["Personal Info","Parent Info","Class Assignment"][step-1]}</div>
                </div>
                <button onClick={closeModal} style={{ background: "var(--bg-main)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer" }}>
                  <Icon d="M18 6L6 18M6 6l12 12" size={16} />
                </button>
              </div>

              {/* Step Indicator */}
              <div style={{ padding: "16px 28px 0", display: "flex", gap: 6 }}>
                {[1,2,3].map(s => (
                  <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? "#9b6dff" : "var(--border)", transition: "all 0.3s" }} />
                ))}
              </div>

              {/* Modal Body */}
              <div style={{ padding: "20px 28px", overflowY: "auto", flex: 1 }}>
                {step === 1 && (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                      {inp("Full Name", "name", "text", { required: true })}
                      {inp("Email Address", "email", "email")}
                      {inp("CNIC / B-Form No.", "cnic")}
                      {inp("Date of Birth", "dob", "date")}
                      {inp("Phone Number", "phone", "tel", { required: false })}
                      {sel("Gender", "gender", ["Male","Female"])}
                    </div>
                    {inp("Home Address", "address", "text", { required: false })}
                  </div>
                )}
                {step === 2 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 14 }}>Father's Information</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                      {inp("Father's Name", "fatherName")}
                      {inp("Father's CNIC", "fatherCnic", "text", { required: false })}
                      {inp("Father's Phone", "fatherPhone", "tel")}
                      {inp("Father's Occupation", "fatherOccupation", "text", { required: false })}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.7px", margin: "16px 0 14px" }}>Mother's Information</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                      {inp("Mother's Name", "motherName", "text", { required: false })}
                      {inp("Mother's Phone", "motherPhone", "tel", { required: false })}
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div>
                    <div style={{ background: "#f5f3ff", borderRadius: 12, padding: "14px 16px", marginBottom: 20, border: "1px solid #e9d5ff" }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#7c3aed" }}>Assign to Class & Section</div>
                      <div style={{ fontSize: 12, color: "#9b6dff", marginTop: 3 }}>Select the class, section, and roll number for this student.</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
                      {sel("Class", "classId", CLASS_LEVELS.map(c => ({ value: c.id, label: c.label })))}
                      {sel("Section", "section", SECTIONS)}
                      {inp("Roll Number", "rollNo", "number")}
                    </div>
                    <div style={{ background: "var(--bg-main)", borderRadius: 10, padding: "12px 14px", marginTop: 8 }}>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>Preview Assignment</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)", marginTop: 4 }}>
                        {form.name || "Student"} → {CLASS_LEVELS.find(c => c.id === form.classId)?.label} — Section {form.section}
                        {form.rollNo ? `, Roll #${form.rollNo}` : ""}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: 12 }}>
                <button onClick={step === 1 ? closeModal : prevStep}
                  style={{ padding: "11px 22px", borderRadius: 10, border: "1.5px solid var(--border)", background: "#fff", color: "var(--text-secondary)", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                  {step === 1 ? "Cancel" : "← Back"}
                </button>
                {step < 3
                  ? <button onClick={nextStep} className="btn-primary" style={{ width: "auto", padding: "11px 28px", background: "linear-gradient(135deg, #9b6dff, #7c3aed)" }}>Continue →</button>
                  : <button onClick={handleSubmit} className="btn-primary" style={{ width: "auto", padding: "11px 28px", background: "linear-gradient(135deg, #2db87b, #1e9e63)" }}>✓ Add Student</button>
                }
              </div>
            </div>
          </div>
        )}

        {/* VIEW STUDENT MODAL */}
        {viewStudent && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 540, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
              <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>Student Profile</div>
                <button onClick={() => setViewStudent(null)} style={{ background: "var(--bg-main)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer" }}>
                  <Icon d="M18 6L6 18M6 6l12 12" size={16} />
                </button>
              </div>
              <div style={{ padding: "20px 28px" }}>
                {/* Avatar */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", background: viewStudent.gender === "Female" ? "#f5f3ff" : "#e8f0ff", color: viewStudent.gender === "Female" ? "#7c3aed" : "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20 }}>
                    {viewStudent.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>{viewStudent.name}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{viewStudent.id} · {viewStudent.email}</div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: feeColor(viewStudent.feeStatus).bg, color: feeColor(viewStudent.feeStatus).color }}>
                      Fee: {viewStudent.feeStatus}
                    </span>
                  </div>
                </div>
                {/* Info Sections */}
                {[
                  { title: "Personal Info", fields: [["CNIC","cnic"],["Date of Birth","dob"],["Gender","gender"],["Phone","phone"],["Address","address"]] },
                  { title: "Class Info", fields: [["Class",null,getClassLabel(viewStudent.classId)],["Section","section"],["Roll Number","rollNo"],["Admission Date","admissionDate"]] },
                  { title: "Parent Info", fields: [["Father's Name","fatherName"],["Father's CNIC","fatherCnic"],["Father's Phone","fatherPhone"],["Father's Occupation","fatherOccupation"],["Mother's Name","motherName"],["Mother's Phone","motherPhone"]] },
                ].map(section => (
                  <div key={section.title} style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 10 }}>{section.title}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 0" }}>
                      {section.fields.map(([label, key, override]) => (
                        <div key={label}>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{override || (key ? viewStudent[key] || "—" : "—")}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function feeColor(s) {
  return s === "Paid" ? { bg: "#e4f7ed", color: "#15803d" } : s === "Pending" ? { bg: "#fffbeb", color: "#b45309" } : { bg: "#fff5f5", color: "#dc2626" };
}
