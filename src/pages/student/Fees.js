import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { fetchFees } from "../../services/studentApi";

const Icon = ({ d, size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

function Fees() {
  const [feesData, setFeesData] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    fetchFees()
      .then(data => setFeesData(data))
      .catch(err  => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <div className="page-wrapper">
            <div className="card" style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
              Loading fee details...
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !feesData) {
    return (
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <div className="page-wrapper">
            <div className="discipline-empty">
              <div className="discipline-empty-icon">
                <Icon d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z" size={28} color="#e6a800" />
              </div>
              <div className="discipline-empty-title">No Fee Record</div>
              <div className="discipline-empty-sub">{error || "No fee information found for this student."}</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const paidPct    = Math.round((feesData.paid / feesData.total) * 100);
  const isFullyPaid = feesData.remaining === 0;

  const feeRows = [
    { label: "Total Fee",    value: `PKR ${feesData.total.toLocaleString()}`,     dotColor: "#9aaabb",  valueClass: "" },
    { label: "Amount Paid",  value: `PKR ${feesData.paid.toLocaleString()}`,      dotColor: "#2db87b",  valueClass: "green" },
    { label: "Remaining",    value: `PKR ${feesData.remaining.toLocaleString()}`, dotColor: feesData.remaining > 0 ? "#ff5c5c" : "#2db87b", valueClass: feesData.remaining > 0 ? "red" : "green" },
  ];

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-wrapper">

          {/* Header */}
          <div className="page-header">
            <div className="page-header-icon icon-yellow">
              <Icon d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z" size={22} color="#e6a800" />
            </div>
            <div>
              <div className="page-title">Fee Details</div>
              <div className="page-subtitle">Challan &amp; payment information</div>
            </div>
          </div>

          <div className="fees-layout">
            {/* Left column */}
            <div>
              {/* Summary hero card */}
              <div className="fee-summary-card">
                <div className="fee-summary-label">Total Fee — {feesData.challan}</div>
                <div className="fee-summary-amount">PKR {feesData.total.toLocaleString()}</div>
                <div className="fee-summary-badges">
                  <div className="fee-summary-chip">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {isFullyPaid ? "Fully Paid" : `${paidPct}% Paid`}
                  </div>
                  <div className="fee-summary-chip">
                    <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" size={12} color="currentColor" />
                    {feesData.challan}
                  </div>
                </div>
              </div>

              {/* Fee rows */}
              <div className="fee-rows-card">
                {feeRows.map((row, i) => (
                  <div className="fee-row" key={i}>
                    <div className="fee-row-label">
                      <div className="fee-row-label-dot" style={{ background: row.dotColor }} />
                      {row.label}
                    </div>
                    <div className={`fee-row-value ${row.valueClass}`}>{row.value}</div>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="fee-progress-wrap" style={{ marginTop: "16px", background: "var(--bg-card)", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border)", padding: "18px 22px" }}>
                <div className="fee-progress-top">
                  <span>Payment Progress</span>
                  <span style={{ color: "var(--green-dark)" }}>{paidPct}%</span>
                </div>
                <div className="fee-progress-bar">
                  <div className="fee-progress-fill" style={{ width: `${paidPct}%` }} />
                </div>
              </div>
            </div>

            {/* Right column: challan details */}
            <div className="challan-info-card">
              <div className="challan-paid-banner">
                <div className="challan-paid-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <div className="challan-paid-title">Fee Challan Status</div>
                  <div className="challan-paid-sub">{feesData.status || "Paid"}</div>
                </div>
              </div>

              <div className="section-label">Challan Details</div>

              {[
                { label: "Challan",   value: feesData.challan },
                { label: "Status",    value: feesData.status || "Paid" },
                { label: "Total",     value: `PKR ${feesData.total.toLocaleString()}` },
                { label: "Paid",      value: `PKR ${feesData.paid.toLocaleString()}` },
                { label: "Remaining", value: `PKR ${feesData.remaining.toLocaleString()}` },
              ].map((item, i) => (
                <div className="challan-detail-row" key={i}>
                  <span className="challan-detail-label">{item.label}</span>
                  <span className="challan-detail-value" style={item.label === "Status" ? { color: "var(--green-dark)" } : {}}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Fees;
