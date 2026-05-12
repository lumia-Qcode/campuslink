import React, { useState, useEffect } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import { getUser } from "../../services/auth";
import {
  apiGetStudents, apiGetTeachers, apiGetSections,
  apiGetFees, apiGetAnnouncements,
} from "../../services/api";

const CLASS_LEVELS = [
  { id: "playgroup", label: "Play Group" }, { id: "nursery", label: "Nursery" },
  { id: "prenursery", label: "Pre-Nursery" },
  { id: "1", label: "Class 1" }, { id: "2", label: "Class 2" },
  { id: "3", label: "Class 3" }, { id: "4", label: "Class 4" },
  { id: "5", label: "Class 5" }, { id: "6", label: "Class 6" },
  { id: "7", label: "Class 7" }, { id: "8", label: "Class 8" },
  { id: "9", label: "Class 9" }, { id: "X", label: "Class X" },
];

const Icon = ({ d, size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

function AdminDashboard() {
  const user = getUser();
  const [stats, setStats] = useState({ students: 0, teachers: 0, sections: 0, feesCollected: 0 });
  const [recentStudents, setRecentStudents] = useState([]);
  const [classDist, setClassDist] = useState([]);
  const [feeStatus, setFeeStatus] = useState({ paid: 0, pending: 0, overdue: 0 });
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, tRes, secRes, fRes, aRes] = await Promise.all([
          apiGetStudents(),
          apiGetTeachers(),
          apiGetSections(),
          apiGetFees(),
          apiGetAnnouncements(),
        ]);
        const students = sRes.data || [];
        const fees = fRes.data || [];

        setStats({
          students: students.length,
          teachers: (tRes.data || []).length,
          sections: (secRes.data || []).length,
          feesCollected: fees.filter(f => f.status === "Paid").reduce((s, f) => s + (f.amount || 0), 0),
        });

        setRecentStudents(students.slice(-6).reverse());

        const dist = CLASS_LEVELS.map(cl => ({
          label: cl.label,
          count: students.filter(s => s.classId === cl.id).length,
        })).filter(c => c.count > 0);
        setClassDist(dist);

        setFeeStatus({
          paid: fees.filter(f => f.status === "Paid").length,
          pending: fees.filter(f => f.status === "Pending").length,
          overdue: fees.filter(f => f.status === "Overdue").length,
        });

        setAnnouncements((aRes.data || []).slice(0, 3));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    {
      label: "Total Students",
      value: stats.students,
      icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
      color: "#9b6dff", bg: "#f5f3ff",
    },
    {
      label: "Total Teachers",
      value: stats.teachers,
      icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
      color: "#4f8ef7", bg: "#e8f0ff",
    },
    {
      label: "Active Sections",
      value: stats.sections,
      icon: "M4 6h16M4 12h16M4 18h7",
      color: "#2db87b", bg: "#e4f7ed",
    },
    {
      label: "Fees Collected",
      value: "Rs. " + stats.feesCollected.toLocaleString(),
      icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0-3 3v8a3 3 0 0 0 3 3z",
      color: "#f5c842", bg: "#fffbeb",
    },
  ];

  return (
    <div className="app-layout">
      <AdminNavbar />
      <main className="main-content">
        <div className="hero-banner" style={{ background: "linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #9b6dff 100%)" }}>
          <div>
            <div className="hero-greeting">Good morning, {user?.name || "Admin"} 👋</div>
            <div className="hero-date">
              {new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "10px 18px", color: "#fff", fontSize: 13, fontWeight: 700 }}>
              <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>Pending Fees</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{feeStatus.pending + feeStatus.overdue}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "10px 18px", color: "#fff", fontSize: 13, fontWeight: 700 }}>
              <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>Fees Paid</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{feeStatus.paid}</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
          {statCards.map((s, i) => (
            <div key={i} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ color: s.color }}>{loading ? "—" : s.value}</div>
                </div>
                <div style={{ background: s.bg, borderRadius: 12, padding: 10 }}>
                  <Icon d={s.icon} color={s.color} size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Recent Students</div>
              <a href="/admin/students" style={{ fontSize: 12, color: "#9b6dff", fontWeight: 700, textDecoration: "none" }}>View All →</a>
            </div>
            {loading ? (
              <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "20px 0" }}>Loading…</div>
            ) : recentStudents.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "20px 0" }}>
                No students yet. <a href="/admin/students" style={{ color: "#9b6dff" }}>Add one →</a>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {recentStudents.map(s => (
                  <div key={s._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
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
                        Class {s.classId} — Section {s.section} · Roll #{s.rollNo}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                      background: s.feeStatus === "Paid" ? "#e4f7ed" : s.feeStatus === "Pending" ? "#fffbeb" : "#fff5f5",
                      color: s.feeStatus === "Paid" ? "#15803d" : s.feeStatus === "Pending" ? "#b45309" : "#dc2626",
                    }}>{s.feeStatus || "Pending"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 14 }}>Class Distribution</div>
              {loading ? (
                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading…</div>
              ) : classDist.length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No students enrolled yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {classDist.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 70, fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>{c.label}</div>
                      <div style={{ flex: 1, background: "var(--bg-main)", borderRadius: 6, height: 8, overflow: "hidden" }}>
                        <div style={{
                          width: `${stats.students > 0 ? (c.count / stats.students) * 100 : 0}%`,
                          background: "linear-gradient(90deg, #9b6dff, #7c3aed)",
                          height: "100%", borderRadius: 6,
                        }} />
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#9b6dff", width: 20 }}>{c.count}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-title" style={{ marginBottom: 14 }}>Overall Fee Status</div>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { label: "Paid", color: "#2db87b", bg: "#e4f7ed", count: feeStatus.paid },
                  { label: "Pending", color: "#f5c842", bg: "#fffbeb", count: feeStatus.pending },
                  { label: "Overdue", color: "#ff5c5c", bg: "#fff5f5", count: feeStatus.overdue },
                ].map((item, i) => (
                  <div key={i} style={{ flex: 1, background: item.bg, borderRadius: 12, padding: "14px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{loading ? "—" : item.count}</div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: item.color, opacity: 0.8 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

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
                      background: "var(--bg-main)", cursor: "pointer",
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

        {!loading && announcements.length > 0 && (
          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-header">
              <div className="card-title">Recent Announcements</div>
              <a href="/admin/announcements" style={{ fontSize: 12, color: "#9b6dff", fontWeight: 700, textDecoration: "none" }}>View All →</a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {announcements.map(a => (
                <div key={a._id} style={{ padding: "10px 14px", background: "var(--bg-main)", borderRadius: 10, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{a.title}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
                      {new Date(a.createdAt).toLocaleDateString("en-PK")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
