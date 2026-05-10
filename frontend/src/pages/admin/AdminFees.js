import React, { useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import { mockFeeRecords, CLASS_LEVELS, getClassLabel } from "../../data/adminMockData";

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const MONTHS = [...new Set(mockFeeRecords.map(f => f.month))];

const statusStyle = (s) => {
  if (s === "Paid")    return { bg: "#e4f7ed", color: "#15803d", dot: "#2db87b" };
  if (s === "Pending") return { bg: "#fffbeb", color: "#b45309", dot: "#f5c842" };
  return                       { bg: "#fff5f5", color: "#dc2626", dot: "#ff5c5c" };
};

export default function AdminFees() {
  const [records, setRecords] = useState(mockFeeRecords);
  const [filterMonth, setFilterMonth] = useState("April 2026");
  const [filterClass, setFilterClass] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ studentName: "", studentId: "", classId: "X", section: "A", month: "April 2026", amount: "", dueDate: "", status: "Pending" });
  const [addErrors, setAddErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const filtered = records.filter(r => {
    const matchMonth = filterMonth === "all" || r.month === filterMonth;
    const matchClass = filterClass === "all" || r.classId === filterClass;
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const matchSearch = r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.studentId.toLowerCase().includes(search.toLowerCase());
    return matchMonth && matchClass && matchStatus && matchSearch;
  });

  const summary = {
    paid: filtered.filter(r => r.status === "Paid").reduce((s, r) => s + r.amount, 0),
    pending: filtered.filter(r => r.status === "Pending").reduce((s, r) => s + r.amount, 0),
    overdue: filtered.filter(r => r.status === "Overdue").reduce((s, r) => s + r.amount, 0),
    total: filtered.reduce((s, r) => s + r.amount, 0),
  };

  const markPaid = (id) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "Paid", paidDate: new Date().toISOString().split("T")[0] } : r));
    setSuccessMsg("Fee record marked as Paid.");
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const validateAddFee = () => {
    const e = {};
    if (!addForm.studentName.trim()) e.studentName = "Student name is required";
    if (!addForm.studentId.trim()) e.studentId = "Student ID is required";
    if (!addForm.amount) e.amount = "Fee amount is required";
    else if (parseFloat(addForm.amount) <= 0) e.amount = "Fee amount must be a positive value.";
    if (!addForm.dueDate) e.dueDate = "Due date is required";
    setAddErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddFee = () => {
    if (!validateAddFee()) return;
    const newRecord = {
      id: `FR-${String(records.length + 1).padStart(3, "0")}`,
      studentId: addForm.studentId,
      studentName: addForm.studentName,
      classId: addForm.classId,
      section: addForm.section,
      month: addForm.month,
      amount: parseFloat(addForm.amount),
      dueDate: addForm.dueDate,
      status: addForm.status,
      paidDate: null,
    };
    setRecords(prev => [...prev, newRecord]);
    setSuccessMsg(`Fee record added for ${addForm.studentName} — Rs. ${parseFloat(addForm.amount).toLocaleString()}.`);
    setTimeout(() => setSuccessMsg(""), 4000);
    setShowAddModal(false);
    setAddForm({ studentName: "", studentId: "", classId: "X", section: "A", month: "April 2026", amount: "", dueDate: "", status: "Pending" });
    setAddErrors({});
  };

  return (
    <div className="app-layout">
      <AdminNavbar />
      <main className="main-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800 }}>Fee Management</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>Track and manage student fee payments</p>
          </div>
          <button className="btn-primary" style={{ width: "auto", padding: "12px 22px", background: "linear-gradient(135deg,#9b6dff,#7c3aed)", display: "flex", alignItems: "center", gap: 8 }}
            onClick={() => setShowAddModal(true)}>
            <Icon d="M12 5v14M5 12h14" size={15} color="#fff" />
            Add Fee Record
          </button>
        </div>

        {successMsg && (
          <div style={{ background: "#e4f7ed", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 16px", margin: "16px 0", color: "#15803d", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon d="M9 11l3 3L22 4" size={15} color="#15803d" />
            {successMsg}
          </div>
        )}

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total Dues", value: summary.total, color: "#9b6dff", bg: "#f5f3ff", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0-3 3v8a3 3 0 0 0 3 3z" },
            { label: "Collected",  value: summary.paid,  color: "#2db87b", bg: "#e4f7ed", icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" },
            { label: "Pending",   value: summary.pending,color: "#f5c842", bg: "#fffbeb", icon: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
            { label: "Overdue",   value: summary.overdue,color: "#ff5c5c", bg: "#fff5f5", icon: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" },
          ].map((s, i) => (
            <div key={i} className="card" style={{ borderTop: `3px solid ${s.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color, marginTop: 4 }}>Rs. {s.value.toLocaleString()}</div>
                </div>
                <div style={{ background: s.bg, borderRadius: 10, padding: 8 }}>
                  <Icon d={s.icon} color={s.color} size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={15} color="var(--text-muted)" />
            </span>
            <input className="form-input" style={{ paddingLeft: 40 }} placeholder="Search by student name or ID..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="teacher-form-select" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            <option value="all">All Months</option>
            {MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
          <select className="teacher-form-select" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="all">All Classes</option>
            {CLASS_LEVELS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <select className="teacher-form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        {/* Fee Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg-main)", borderBottom: "2px solid var(--border)" }}>
                  {["Student","Class","Month","Amount","Due Date","Paid On","Status","Action"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.7px", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No records found.</td></tr>
                ) : filtered.map(r => {
                  const ss = statusStyle(r.status);
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-main)"}
                      onMouseLeave={e => e.currentTarget.style.background = ""}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{r.studentName}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{r.studentId}</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: "#f5f3ff", color: "#7c3aed", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                          {getClassLabel(r.classId)} — {r.section}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{r.month}</td>
                      <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>Rs. {r.amount.toLocaleString()}</td>
                      <td style={{ padding: "12px 16px", fontSize: 12.5, color: r.status === "Overdue" ? "#dc2626" : "var(--text-secondary)", fontWeight: r.status === "Overdue" ? 700 : 600 }}>{r.dueDate}</td>
                      <td style={{ padding: "12px 16px", fontSize: 12.5, color: "var(--text-secondary)" }}>{r.paidDate || "—"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: ss.bg, color: ss.color }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: ss.dot, display: "inline-block" }} />
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {r.status !== "Paid" ? (
                          <button onClick={() => markPaid(r.id)}
                            style={{ background: "#e4f7ed", color: "#15803d", border: "none", borderRadius: 8, padding: "6px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                            Mark Paid
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>Cleared</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", background: "var(--bg-main)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 600 }}>{filtered.length} record{filtered.length !== 1 ? "s" : ""} shown</span>
            <div style={{ display: "flex", gap: 16 }}>
              <span style={{ fontSize: 12.5, color: "#15803d", fontWeight: 700 }}>Paid: Rs. {filtered.filter(r=>r.status==="Paid").reduce((s,r)=>s+r.amount,0).toLocaleString()}</span>
              <span style={{ fontSize: 12.5, color: "#dc2626", fontWeight: 700 }}>Outstanding: Rs. {filtered.filter(r=>r.status!=="Paid").reduce((s,r)=>s+r.amount,0).toLocaleString()}</span>
            </div>
          </div>
        </div>
        {/* ADD FEE RECORD MODAL */}
        {showAddModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
              <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>Add Fee Record</div>
                <button onClick={() => { setShowAddModal(false); setAddErrors({}); }} style={{ background: "var(--bg-main)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer" }}>
                  <Icon d="M18 6L6 18M6 6l12 12" size={16} />
                </button>
              </div>
              <div style={{ padding: "20px 28px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                  {[["Student Name","studentName","text"],["Student ID","studentId","text"]].map(([label,key,type]) => (
                    <div key={key} className="form-group">
                      <label className="form-label">{label} *</label>
                      <input className={`form-input${addErrors[key] ? " input-error" : ""}`} type={type}
                        value={addForm[key]} onChange={e => setAddForm(f => ({ ...f, [key]: e.target.value }))} />
                      {addErrors[key] && <div style={{ color: "#e53e3e", fontSize: 11.5, marginTop: 4, fontWeight: 600 }}>{addErrors[key]}</div>}
                    </div>
                  ))}
                  <div className="form-group">
                    <label className="form-label">Class</label>
                    <select className="form-input" value={addForm.classId} onChange={e => setAddForm(f => ({ ...f, classId: e.target.value }))}>
                      {CLASS_LEVELS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section</label>
                    <input className="form-input" value={addForm.section} onChange={e => setAddForm(f => ({ ...f, section: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fee Amount (Rs.) *</label>
                    <input className={`form-input${addErrors.amount ? " input-error" : ""}`} type="number"
                      placeholder="e.g. 3500"
                      value={addForm.amount} onChange={e => setAddForm(f => ({ ...f, amount: e.target.value }))} />
                    {addErrors.amount && <div style={{ color: "#e53e3e", fontSize: 11.5, marginTop: 4, fontWeight: 600 }}>{addErrors.amount}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date *</label>
                    <input className={`form-input${addErrors.dueDate ? " input-error" : ""}`} type="date"
                      value={addForm.dueDate} onChange={e => setAddForm(f => ({ ...f, dueDate: e.target.value }))} />
                    {addErrors.dueDate && <div style={{ color: "#e53e3e", fontSize: 11.5, marginTop: 4, fontWeight: 600 }}>{addErrors.dueDate}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Month</label>
                    <select className="form-input" value={addForm.month} onChange={e => setAddForm(f => ({ ...f, month: e.target.value }))}>
                      {MONTHS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-input" value={addForm.status} onChange={e => setAddForm(f => ({ ...f, status: e.target.value }))}>
                      <option>Pending</option><option>Paid</option><option>Overdue</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", gap: 12 }}>
                <button onClick={() => { setShowAddModal(false); setAddErrors({}); }}
                  style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid var(--border)", background: "#fff", color: "var(--text-secondary)", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                <button onClick={handleAddFee} className="btn-primary" style={{ flex: 1, background: "linear-gradient(135deg,#9b6dff,#7c3aed)" }}>✓ Save Record</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}