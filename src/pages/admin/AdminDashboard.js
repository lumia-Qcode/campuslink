import React from "react";
import AdminNavbar from "../../components/AdminNavbar";
import { getUser } from "../../services/auth";
import { mockStudents, mockTeachers, mockSections, mockFeeRecords, CLASS_LEVELS } from "../../data/adminMockData";

const Icon = ({ d, size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const statCards = [
  {
    label: "Total Students",
    value: mockStudents.length,
    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    color: "#6299d0", bg: "#f5f3ff",
  },
  {
    label: "Total Teachers",
    value: mockTeachers.length,
    icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    color: "#4f8ef7", bg: "#e8f0ff",
  },
  {
    label: "Active Sections",
    value: mockSections.length,
    icon: "M4 6h16M4 12h16M4 18h7",
    color: "#2db87b", bg: "#e4f7ed",
  },
  {
    label: "Fees Collected",
    value: "Rs. " + mockFeeRecords.filter(f => f.status === "Paid").reduce((s, f) => s + f.amount, 0).toLocaleString(),
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0-3 3v8a3 3 0 0 0 3 3z",
    color: "#f5c842", bg: "#fffbeb",
  },
];

function AdminDashboard() {
  const user = getUser();
  const pendingFees = mockFeeRecords.filter(f => f.status !== "Paid").length;
  const paidFees = mockFeeRecords.filter(f => f.status === "Paid").length;

  // Class distribution
  const classDist = CLASS_LEVELS.map(cl => ({
    label: cl.label,
    count: mockStudents.filter(s => s.classId === cl.id).length,
  })).filter(c => c.count > 0);

  return (
    <div className="app-layout">
      <AdminNavbar />
      <main className="main-content">
        {/* Hero Banner */}
        <div className="hero-banner" style={{ background: "linear-gradient(135deg, #b2cee2 0%, #6299d0 50%, #d1d871 100%)" }}>
          <div>
            <div className="hero-greeting">Good morning Mr Tariq 👋</div>
            <div className="hero-date">
              {new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "10px 18px", color: "#fff", fontSize: 13, fontWeight: 700 }}>
              <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>Pending Fees</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{pendingFees}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "10px 18px", color: "#fff", fontSize: 13, fontWeight: 700 }}>
              <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>Fee Collected</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{paidFees}</div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
          {statCards.map((s, i) => (
            <div key={i} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                </div>
                <div style={{ background: s.bg, borderRadius: 12, padding: 10 }}>
                  <Icon d={s.icon} color={s.color} size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Recent Students */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Recent Students</div>
              <a href="/admin/students" style={{ fontSize: 12, color: "#9b6dff", fontWeight: 700, textDecoration: "none" }}>View All →</a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {mockStudents.slice(0, 6).map(s => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: s.gender === "Female" ? "#f5f3ff" : "#e8f0ff",
                    color: s.gender === "Female" ? "#7c3aed" : "#2563eb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 13, flexShrink: 0,
                  }}>
                    {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>{s.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                      {s.classId === "X" ? "Class X" : s.classId.length <= 2 ? `Class ${s.classId}` : s.classId} — Section {s.section} · Roll #{s.rollNo}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                    background: s.feeStatus === "Paid" ? "#e4f7ed" : s.feeStatus === "Pending" ? "#fffbeb" : "#fff5f5",
                    color: s.feeStatus === "Paid" ? "#15803d" : s.feeStatus === "Pending" ? "#b45309" : "#dc2626",
                  }}>{s.feeStatus}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Class Distribution + Fee Summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 14 }}>Class Distribution</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {classDist.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 70, fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>{c.label}</div>
                    <div style={{ flex: 1, background: "var(--bg-main)", borderRadius: 6, height: 8, overflow: "hidden" }}>
                      <div style={{
                        width: `${(c.count / mockStudents.length) * 100}%`,
                        background: "linear-gradient(90deg, #9b6dff, #7c3aed)",
                        height: "100%", borderRadius: 6,
                      }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#9b6dff", width: 20 }}>{c.count}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-title" style={{ marginBottom: 14 }}>Fee Status — April 2026</div>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { label: "Paid", color: "#2db87b", bg: "#e4f7ed", count: mockFeeRecords.filter(f=>f.month==="April 2026"&&f.status==="Paid").length },
                  { label: "Pending", color: "#f5c842", bg: "#fffbeb", count: mockFeeRecords.filter(f=>f.month==="April 2026"&&f.status==="Pending").length },
                  { label: "Overdue", color: "#ff5c5c", bg: "#fff5f5", count: mockFeeRecords.filter(f=>f.month==="April 2026"&&f.status==="Overdue").length },
                ].map((item, i) => (
                  <div key={i} style={{ flex: 1, background: item.bg, borderRadius: 12, padding: "14px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.count}</div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: item.color, opacity: 0.8 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>Quick Actions</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "Add Student", href: "/admin/students", icon: "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 8v6M23 11h-6", color: "#9b6dff" },
                  { label: "Add Teacher", href: "/admin/teachers", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 8v6M23 11h-6", color: "#4f8ef7" },
                  { label: "New Section", href: "/admin/sections", icon: "M4 6h16M4 12h16M4 18h7M20 15v6M23 18h-6", color: "#2db87b" },
                  { label: "View Fees", href: "/admin/fees", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0-3 3v8a3 3 0 0 0 3 3z", color: "#f5c842" },
                ].map((q, i) => (
                  <a key={i} href={q.href} style={{ textDecoration: "none" }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "10px 12px", borderRadius: 10, border: "1.5px solid var(--border)",
                      background: "var(--bg-main)", cursor: "pointer", transition: "all 0.15s",
                    }}>
                      <Icon d={q.icon} color={q.color} size={15} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>{q.label}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
