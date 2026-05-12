import React, { useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
const CLASS_LEVELS = [{id:"playgroup",label:"Play Group"},{id:"nursery",label:"Nursery"},{id:"prenursery",label:"Pre-Nursery"},{id:"1",label:"Class 1"},{id:"2",label:"Class 2"},{id:"3",label:"Class 3"},{id:"4",label:"Class 4"},{id:"5",label:"Class 5"},{id:"6",label:"Class 6"},{id:"7",label:"Class 7"},{id:"8",label:"Class 8"},{id:"9",label:"Class 9"},{id:"X",label:"Class X"}];
const getClassLabel = (id) => CLASS_LEVELS.find(c=>c.id===id)?.label||id;

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const TYPE_STYLES = {
  scholarship: { bg: "#f5f3ff", color: "#7c3aed", border: "#c4b5fd", label: "Scholarship", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  discount:    { bg: "#fffbeb", color: "#d97706", border: "#fcd34d", label: "Fee Discount", icon: "M9 14l6-6M9.5 9a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM14.5 14a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM3 6h18M3 12h18M3 18h18" },
  sibling:     { bg: "#f0fdf4", color: "#16a34a", border: "#86efac", label: "Sibling Discount", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  merit:       { bg: "#eff5ff", color: "#2563eb", border: "#93c5fd", label: "Merit Award",  icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  need:        { bg: "#fff0f0", color: "#e53e3e", border: "#fca5a5", label: "Need-Based",   icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" },
};

const STATUS_STYLES = {
  pending:   { bg: "#fffbeb", color: "#b45309", border: "#fcd34d", label: "Pending Review" },
  approved:  { bg: "#e4f7ed", color: "#15803d", border: "#bbf7d0", label: "Approved"       },
  rejected:  { bg: "#fff0f0", color: "#dc2626", border: "#fca5a5", label: "Rejected"        },
  reviewing: { bg: "#eff5ff", color: "#2563eb", border: "#93c5fd", label: "Under Review"   },
};

const INITIAL_APPLICATIONS = [
  {
    id: "FA-001", studentId: "STU-005", studentName: "Usman Tariq",
    classId: "9", section: "A", type: "need", appliedDate: "2026-03-15",
    requestedAmount: 3000, approvedAmount: null, status: "pending",
    reason: "Father recently lost his job due to factory closure. Family of 6 with no secondary income. Requesting 40% fee waiver for the remaining academic year.",
    documents: ["Income Certificate", "Unemployment Letter", "Family Registration Certificate"],
    reviewNote: "",
  },
  {
    id: "FA-002", studentId: "STU-001", studentName: "Ali Ahmed",
    classId: "X", section: "A", type: "merit", appliedDate: "2026-03-10",
    requestedAmount: 4250, approvedAmount: 4250, status: "approved",
    reason: "Secured 1st position in Class 9 annual exams with 96% aggregate. Applying for the academic excellence merit scholarship for Class X.",
    documents: ["Result Card", "Recommendation Letter", "School Merit Certificate"],
    reviewNote: "Outstanding academic performance. Full merit scholarship approved for this term.",
  },
  {
    id: "FA-003", studentId: "STU-008", studentName: "Zara Butt",
    classId: "6", section: "A", type: "sibling", appliedDate: "2026-03-20",
    requestedAmount: 1300, approvedAmount: null, status: "reviewing",
    reason: "Two siblings currently enrolled in Class 3 and Class 1. Requesting sibling discount as per school policy (15% on second child, 20% on third child).",
    documents: ["Sibling Enrollment Proof", "Parent CNIC", "School Fee Challan"],
    reviewNote: "Enrollment of siblings verified. Awaiting finance department approval.",
  },
  {
    id: "FA-004", studentId: "STU-011", studentName: "Omar Cheema",
    classId: "1", section: "A", type: "discount", appliedDate: "2026-02-28",
    requestedAmount: 2000, approvedAmount: null, status: "rejected",
    reason: "Requesting general fee discount due to financial hardship. Father is a daily wage worker.",
    documents: ["Parent CNIC", "Affidavit"],
    reviewNote: "Insufficient documentation. NADRA income certificate not provided. Application rejected. May reapply with complete documents.",
  },
  {
    id: "FA-005", studentId: "STU-003", studentName: "Bilal Raza",
    classId: "X", section: "B", type: "scholarship", appliedDate: "2026-04-01",
    requestedAmount: 8500, approvedAmount: null, status: "pending",
    reason: "Applying for the Govt. of Punjab scholarship program for top 5% students. Secured 94% in board exams. Father is a retired government servant with limited pension.",
    documents: ["Board Result Card", "Parent Pension Slip", "B-Form Copy", "Affidavit"],
    reviewNote: "",
  },
  {
    id: "FA-006", studentId: "STU-006", studentName: "Ayesha Noor",
    classId: "9", section: "B", type: "merit", appliedDate: "2026-03-25",
    requestedAmount: 3750, approvedAmount: 3750, status: "approved",
    reason: "Topped district-level science Olympiad. Applying for special achievement scholarship.",
    documents: ["Olympiad Certificate", "Result Card", "Recommendation Letter"],
    reviewNote: "District Olympiad rank verified. Special achievement scholarship approved.",
  },
  {
    id: "FA-007", studentId: "STU-010", studentName: "Fatima Siddiq",
    classId: "3", section: "A", type: "need", appliedDate: "2026-04-05",
    requestedAmount: 2750, approvedAmount: null, status: "pending",
    reason: "Mother is a widow with three children in school. Monthly income is less than PKR 25,000. Requesting 50% fee waiver on humanitarian grounds.",
    documents: ["Death Certificate (Father)", "Income Affidavit", "BISP Registration"],
    reviewNote: "",
  },
];

const formatDate = (d) => new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });

export default function AdminFinancialAid() {
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType]     = useState("all");
  const [search, setSearch]             = useState("");
  const [selectedApp, setSelectedApp]   = useState(null);
  const [reviewNote, setReviewNote]     = useState("");
  const [approveAmount, setApproveAmount] = useState("");
  const [successMsg, setSuccessMsg]     = useState("");

  const filtered = applications.filter(a => {
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    const matchType   = filterType   === "all" || a.type   === filterType;
    const matchSearch = a.studentName.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const updateStatus = (id, newStatus, note, amount) => {
    setApplications(prev => prev.map(a =>
      a.id === id ? {
        ...a, status: newStatus,
        reviewNote: note || a.reviewNote,
        approvedAmount: newStatus === "approved" ? (parseFloat(amount) || a.requestedAmount) : null,
      } : a
    ));
    const app = applications.find(a => a.id === id);
    setSuccessMsg(`${app?.studentName}'s application has been ${newStatus}.`);
    setTimeout(() => setSuccessMsg(""), 4000);
    setSelectedApp(null);
    setReviewNote("");
    setApproveAmount("");
  };

  const stats = {
    total:     applications.length,
    pending:   applications.filter(a => a.status === "pending").length,
    reviewing: applications.filter(a => a.status === "reviewing").length,
    approved:  applications.filter(a => a.status === "approved").length,
    rejected:  applications.filter(a => a.status === "rejected").length,
    totalApproved: applications.filter(a => a.status === "approved").reduce((s, a) => s + (a.approvedAmount || 0), 0),
  };

  return (
    <div className="app-layout">
      <AdminNavbar />
      <main className="main-content">

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800 }}>Financial Aid Portal</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>Review scholarship and fee discount applications</p>
        </div>

        {successMsg && (
          <div style={{ background: "#e4f7ed", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#15803d", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon d="M9 11l3 3L22 4" size={15} color="#15803d" /> {successMsg}
          </div>
        )}

        {/* Summary Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total",     value: stats.total,     color: "#9b6dff", bg: "#f5f3ff" },
            { label: "Pending",   value: stats.pending,   color: "#d97706", bg: "#fffbeb" },
            { label: "Reviewing", value: stats.reviewing, color: "#2563eb", bg: "#eff5ff" },
            { label: "Approved",  value: stats.approved,  color: "#15803d", bg: "#e4f7ed" },
            { label: "Rejected",  value: stats.rejected,  color: "#dc2626", bg: "#fff0f0" },
            { label: "Aid Given", value: `Rs.${(stats.totalApproved/1000).toFixed(0)}k`, color: "#15803d", bg: "#e4f7ed" },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: 12, padding: "14px 12px", border: `1.5px solid ${s.color}33`, textAlign: "center" }}>
              <div style={{ fontSize: i === 5 ? 16 : 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: s.color, opacity: 0.8, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={15} color="var(--text-muted)" />
            </span>
            <input className="form-input" style={{ paddingLeft: 40 }} placeholder="Search by student name or application ID..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="teacher-form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select className="teacher-form-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            {Object.entries(TYPE_STYLES).map(([k, ts]) => <option key={k} value={k}>{ts.label}</option>)}
          </select>
        </div>

        {/* Applications List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "50px", background: "#fff", borderRadius: 14, border: "1.5px dashed var(--border)" }}>
              <Icon d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" size={28} color="var(--text-muted)" />
              <div style={{ marginTop: 12, fontWeight: 700, color: "var(--text-secondary)", fontSize: 15 }}>No applications found</div>
            </div>
          )}
          {filtered.map(app => {
            const ts = TYPE_STYLES[app.type]    || TYPE_STYLES.discount;
            const ss = STATUS_STYLES[app.status] || STATUS_STYLES.pending;
            return (
              <div key={app.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow-sm)", transition: "box-shadow 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--shadow-md)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "var(--shadow-sm)"}>
                <div style={{ height: 3, background: ts.color }} />
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    {/* Avatar */}
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: ts.bg, color: ts.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                      {app.studentName.split(" ").map(n => n[0]).join("").slice(0,2)}
                    </div>

                    <div style={{ flex: 1 }}>
                      {/* Top row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800 }}>{app.studentName}</div>
                        <span style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 600 }}>{app.id}</span>
                        <span style={{ background: "#f5f3ff", color: "#7c3aed", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>
                          {getClassLabel(app.classId)} — {app.section}
                        </span>
                      </div>

                      {/* Tags row */}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                        <span style={{ background: ts.bg, color: ts.color, border: `1px solid ${ts.border}`, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
                          <Icon d={ts.icon} size={10} color={ts.color} /> {ts.label}
                        </span>
                        <span style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                          {ss.label}
                        </span>
                        <span style={{ background: "var(--bg-main)", color: "var(--text-muted)", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                          Applied: {formatDate(app.appliedDate)}
                        </span>
                      </div>

                      {/* Reason preview */}
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55, margin: "0 0 10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {app.reason}
                      </p>

                      {/* Amount + docs row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                        <div style={{ background: app.status === "approved" ? "#e4f7ed" : "var(--bg-main)", borderRadius: 8, padding: "6px 12px" }}>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>Requested</div>
                          <div style={{ fontWeight: 800, fontSize: 13.5, color: "var(--text-primary)" }}>Rs. {app.requestedAmount.toLocaleString()}</div>
                        </div>
                        {app.approvedAmount && (
                          <div style={{ background: "#e4f7ed", borderRadius: 8, padding: "6px 12px" }}>
                            <div style={{ fontSize: 10, color: "#15803d", fontWeight: 600 }}>Approved</div>
                            <div style={{ fontWeight: 800, fontSize: 13.5, color: "#15803d" }}>Rs. {app.approvedAmount.toLocaleString()}</div>
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {app.documents.map((doc, i) => (
                            <span key={i} style={{ background: "var(--bg-main)", color: "var(--text-muted)", fontSize: 10.5, fontWeight: 600, padding: "3px 8px", borderRadius: 6, display: "flex", alignItems: "center", gap: 3 }}>
                              <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" size={10} color="var(--text-muted)" /> {doc}
                            </span>
                          ))}
                        </div>
                        <button onClick={() => { setSelectedApp(app); setReviewNote(app.reviewNote || ""); setApproveAmount(app.approvedAmount || app.requestedAmount); }}
                          style={{ marginLeft: "auto", padding: "7px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#9b6dff,#7c3aed)", color: "#fff", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                          <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" size={13} color="#fff" />
                          Review
                        </button>
                      </div>

                      {/* Review note if exists */}
                      {app.reviewNote && (
                        <div style={{ marginTop: 10, padding: "8px 12px", background: ss.bg, border: `1px solid ${ss.border}`, borderRadius: 8, fontSize: 12, color: ss.color, fontWeight: 600 }}>
                          <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" size={12} color={ss.color} /> {app.reviewNote}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* REVIEW MODAL */}
        {selectedApp && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 600, maxHeight: "93vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
              {/* Modal Header */}
              <div style={{ padding: "22px 28px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>Review Application</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>{selectedApp.id} · {selectedApp.studentName}</div>
                </div>
                <button onClick={() => setSelectedApp(null)} style={{ background: "var(--bg-main)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer" }}>
                  <Icon d="M18 6L6 18M6 6l12 12" size={16} />
                </button>
              </div>

              <div style={{ padding: "20px 28px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Student info */}
                <div style={{ background: "var(--bg-main)", borderRadius: 12, padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {[
                    ["Student", selectedApp.studentName],
                    ["Class", `${getClassLabel(selectedApp.classId)} — ${selectedApp.section}`],
                    ["Applied On", formatDate(selectedApp.appliedDate)],
                    ["Aid Type", TYPE_STYLES[selectedApp.type]?.label],
                    ["Requested", `Rs. ${selectedApp.requestedAmount.toLocaleString()}`],
                    ["Status", STATUS_STYLES[selectedApp.status]?.label],
                  ].map(([k,v]) => (
                    <div key={k}>
                      <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 600 }}>{k}</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Reason */}
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>Application Reason</div>
                  <div style={{ background: "#fafbfc", borderRadius: 10, padding: "14px 16px", border: "1.5px solid var(--border)", fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                    {selectedApp.reason}
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>Submitted Documents</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {selectedApp.documents.map((doc, i) => (
                      <div key={i} style={{ background: "#e4f7ed", color: "#15803d", fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 20, display: "flex", alignItems: "center", gap: 6, border: "1px solid #bbf7d0" }}>
                        <Icon d="M9 11l3 3L22 4" size={12} color="#15803d" /> {doc}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Approved Amount */}
                {selectedApp.status !== "rejected" && (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Approved Amount (Rs.)</label>
                    <input className="form-input" type="number" placeholder={selectedApp.requestedAmount}
                      value={approveAmount} onChange={e => setApproveAmount(e.target.value)} />
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4 }}>Requested: Rs. {selectedApp.requestedAmount.toLocaleString()}</div>
                  </div>
                )}

                {/* Review Note */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Review Note</label>
                  <textarea className="form-input" rows={3} placeholder="Add a note explaining the decision..."
                    style={{ resize: "none", lineHeight: 1.6 }}
                    value={reviewNote} onChange={e => setReviewNote(e.target.value)} />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => setSelectedApp(null)}
                  style={{ padding: "11px 20px", borderRadius: 10, border: "1.5px solid var(--border)", background: "#fff", color: "var(--text-secondary)", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" }}>
                  Close
                </button>
                <button onClick={() => updateStatus(selectedApp.id, "reviewing", reviewNote, approveAmount)}
                  style={{ padding: "11px 18px", borderRadius: 10, border: "1.5px solid #93c5fd", background: "#eff5ff", color: "#2563eb", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" }}>
                  Mark Under Review
                </button>
                <button onClick={() => updateStatus(selectedApp.id, "rejected", reviewNote, approveAmount)}
                  style={{ padding: "11px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#ff5c5c,#dc2626)", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" }}>
                  Reject
                </button>
                <button onClick={() => updateStatus(selectedApp.id, "approved", reviewNote, approveAmount)}
                  style={{ flex: 1, padding: "11px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#2db87b,#1e9e63)", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Icon d="M9 11l3 3L22 4" size={15} color="#fff" />
                  Approve — Rs. {parseFloat(approveAmount || selectedApp.requestedAmount).toLocaleString()}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
