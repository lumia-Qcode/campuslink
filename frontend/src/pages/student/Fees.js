import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { apiStudentGetFees } from "../../services/api";

const Icon = ({ d, size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const STATUS_STYLES = {
  Paid:    { color: "#2db87b", bg: "#f0fdf7", border: "#2db87b44" },
  Pending: { color: "#e6a800", bg: "#fffbeb", border: "#e6a80044" },
  Overdue: { color: "#e53e3e", bg: "#fff5f5", border: "#e53e3e44" },
};

function Fees() {
  const [fees, setFees]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    apiStudentGetFees()
      .then(res => {
        setFees(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="app-layout"><Navbar />
        <main className="main-content">
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)" }}>Loading fees…</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-layout"><Navbar />
        <main className="main-content">
          <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ color: "#e53e3e" }}>Failed to load fees</div>
            <div style={{ color: "var(--text-muted)", fontSize: 14 }}>{error}</div>
          </div>
        </main>
      </div>
    );
  }

  const totalAmount = fees.reduce((s, f) => s + (f.amount || 0), 0);
  const totalPaid   = fees.filter(f => f.status === "Paid").reduce((s, f) => s + (f.amount || 0), 0);
  const totalDue    = totalAmount - totalPaid;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-wrapper">
          <div className="page-header">
            <div className="page-header-icon icon-yellow">
              <Icon d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z" size={22} color="#e6a800" />
            </div>
            <div>
              <div className="page-title">Fee Challans</div>
              <div className="page-subtitle">Fee history assigned by administration</div>
            </div>
          </div>

          {fees.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "64px 24px" }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>No Challans Yet</div>
              <div style={{ color: "var(--text-muted)", marginTop: 8 }}>Administration hasn't generated any fee challans yet.</div>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
                {[
                  { label: "Total Fees",   value: `PKR ${totalAmount.toLocaleString()}`,  color: "#9aaabb", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z" },
                  { label: "Amount Paid",  value: `PKR ${totalPaid.toLocaleString()}`,    color: "#2db87b", icon: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
                  { label: "Outstanding",  value: `PKR ${totalDue.toLocaleString()}`,     color: totalDue > 0 ? "#e53e3e" : "#2db87b", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
                ].map(s => (
                  <div key={s.label} className="card" style={{ padding: "20px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: s.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon d={s.icon} size={18} color={s.color} />
                      </div>
                      <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{s.label}</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 20, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Challan list */}
              <div className="card">
                <div className="section-label" style={{ marginBottom: 14 }}>All Challans</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {fees.map((fee, i) => {
                    const s = STATUS_STYLES[fee.status] || STATUS_STYLES.Pending;
                    const due = fee.dueDate ? new Date(fee.dueDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—";
                    const paid = fee.paidDate ? new Date(fee.paidDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : null;
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 12, background: s.bg, border: `1.5px solid ${s.border}` }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 4 }}>{fee.month}</div>
                          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                            Due: {due}
                            {paid ? ` · Paid: ${paid}` : ""}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 800, fontSize: 18, color: "var(--text-primary)" }}>PKR {(fee.amount || 0).toLocaleString()}</div>
                          <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700, background: "#fff", color: s.color, border: `1px solid ${s.border}` }}>
                            {fee.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Fees;
