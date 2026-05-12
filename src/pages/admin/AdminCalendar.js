import React, { useState, useEffect } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import { apiGetCalendarEvents, apiCreateCalendarEvent, apiDeleteCalendarEvent } from "../../services/api";

const Icon = ({ d, size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const CAL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TAG_STYLES = {
  exam:     { color: "var(--red)",          bg: "#fff5f5",              border: "#fca5a5",              label: "Exam"     },
  holiday:  { color: "var(--forest-dark)",  bg: "var(--forest-light)",  border: "var(--mint)",          label: "Holiday"  },
  event:    { color: "var(--plum-dark)",    bg: "var(--plum-light)",    border: "var(--plum)",          label: "Event"    },
  reminder: { color: "var(--slate-dark)",   bg: "var(--slate-light)",   border: "var(--slate-blue)",    label: "Reminder" },
  other:    { color: "var(--text-muted)",   bg: "var(--bg-card-alt)",   border: "var(--border)",        label: "Other"    },
};

function MiniCalendar({ highlightedDates = [], onDayClick }) {
  const now  = new Date();
  const [date, setDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const year  = date.getFullYear();
  const month = date.getMonth();
  const monthName   = date.toLocaleString("default", { month: "long" });
  const firstDay    = new Date(year, month, 1).getDay();
  const offset      = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = offset - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, isOther: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, isOther: false });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, isOther: true });

  const isToday = (d, isOther) =>
    !isOther && d === now.getDate() && month === now.getMonth() && year === now.getFullYear();

  const isEventDay = (d, isOther) => {
    if (isOther) return false;
    return highlightedDates.some(ds => {
      const dt = new Date(ds);
      return dt.getFullYear() === year && dt.getMonth() === month && dt.getDate() === d;
    });
  };

  const handleClick = (cell) => {
    if (cell.isOther || !onDayClick) return;
    const pad = (n) => String(n).padStart(2, "0");
    onDayClick(`${year}-${pad(month + 1)}-${pad(cell.day)}`);
  };

  return (
    <div className="mini-calendar">
      <div className="cal-header">
        <button className="cal-nav-btn" onClick={() => setDate(new Date(year, month - 1, 1))}>
          <Icon d="M15 18l-6-6 6-6" size={14} />
        </button>
        <span className="cal-month">{monthName} {year}</span>
        <button className="cal-nav-btn" onClick={() => setDate(new Date(year, month + 1, 1))}>
          <Icon d="M9 18l6-6-6-6" size={14} />
        </button>
      </div>
      <div className="cal-grid">
        {CAL_DAYS.map(d => <div key={d} className="cal-day-header">{d}</div>)}
        {cells.map((cell, i) => (
          <div key={i}
            className={[
              "cal-day",
              cell.isOther ? "other-month" : "",
              isToday(cell.day, cell.isOther) ? "today" : "",
              !isToday(cell.day, cell.isOther) && isEventDay(cell.day, cell.isOther) ? "highlighted" : "",
              !cell.isOther ? "A-clickable-day" : "",
            ].filter(Boolean).join(" ")}
            onClick={() => handleClick(cell)}
          >
            {cell.day}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  const dt = new Date(dateStr + "T00:00:00");
  return {
    day:     dt.getDate(),
    month:   dt.toLocaleString("default", { month: "short" }).toUpperCase(),
    weekday: dt.toLocaleString("default", { weekday: "long" }),
    full:    dt.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
  };
}

function isUpcoming(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr + "T00:00:00") >= today;
}

function AdminCalendar() {
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ date: "", event: "", tag: "other" });
  const [posting, setPosting]     = useState(false);
  const [posted, setPosted]       = useState(false);
  const [formError, setFormError] = useState("");
  const [filterTag, setFilterTag] = useState("All");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    apiGetCalendarEvents()
      .then(res => setEvents(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDayClick = (dateStr) => {
    setForm(p => ({ ...p, date: dateStr }));
    setShowForm(true);
    setFormError("");
  };

  const handlePost = async () => {
    if (!form.date) { setFormError("Please select a date."); return; }
    if (!form.event.trim()) { setFormError("Event name cannot be empty."); return; }
    setFormError("");
    setPosting(true);
    try {
      const res = await apiCreateCalendarEvent({ date: form.date, event: form.event.trim(), tag: form.tag });
      setEvents(prev => [...prev, res.data].sort((a, b) => a.date.localeCompare(b.date)));
      setForm({ date: "", event: "", tag: "other" });
      setShowForm(false);
      setPosted(true);
      setTimeout(() => setPosted(false), 3000);
    } catch (_) {
      setFormError("Failed to add event. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiDeleteCalendarEvent(id);
      setEvents(prev => prev.filter(e => (e._id || e.id) !== id));
      setDeleteConfirm(null);
    } catch (_) { alert("Failed to delete event."); }
  };

  const highlightedDates = events.map(e => e.date);
  const filtered = filterTag === "All" ? events : events.filter(e => e.tag === filterTag.toLowerCase());

  return (
    <div className="app-layout">
      <AdminNavbar />
      <main className="main-content">
        <div className="page-wrapper" style={{ maxWidth: "1060px" }}>

          {/* Header */}
          <div className="page-header">
            <div className="page-header-icon icon-teal">
              <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={22} color="var(--teal-dark)" />
            </div>
            <div style={{ flex: 1 }}>
              <div className="page-title">Academic Calendar</div>
              <div className="page-subtitle">{events.length} events · visible to all portals</div>
            </div>
            <button onClick={() => { setShowForm(!showForm); setFormError(""); }}
              className="A-action-btn solid-slate"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon d="M12 5v14M5 12h14" size={15} color="#fff" />
              Add Event
            </button>
          </div>

          {/* Success banner */}
          {posted && (
            <div style={{ padding: "12px 18px", borderRadius: "var(--radius-sm)", background: "var(--forest-light)", border: "1.5px solid var(--mint)", color: "var(--forest-dark)", fontWeight: 700, fontSize: "13.5px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Icon d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={16} color="var(--forest-dark)" />
              Event added successfully — visible to all teachers and students.
            </div>
          )}

          {/* Add event form */}
          {showForm && (
            <div className="card" style={{ border: "1.5px solid var(--teal)", background: "var(--teal-light)", marginBottom: "20px" }}>
              <div className="card-header" style={{ marginBottom: "18px" }}>
                <div className="card-title">
                  <div className="card-title-icon icon-teal">
                    <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={15} color="var(--teal-dark)" />
                  </div>
                  Add New School Event
                </div>
                <button onClick={() => { setShowForm(false); setFormError(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                  <Icon d="M18 6L6 18M6 6l12 12" size={18} />
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input A-form-input" value={form.date}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Event Name</label>
                  <input className="form-input A-form-input" placeholder="e.g. Mid-term Exams Begin"
                    value={form.event} onChange={e => setForm(p => ({ ...p, event: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select className="form-input A-form-input" value={form.tag}
                    onChange={e => setForm(p => ({ ...p, tag: e.target.value }))}>
                    {Object.entries(TAG_STYLES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formError && (
                <div style={{ marginBottom: "12px", padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "#fff5f5", border: "1.5px solid #fca5a5", color: "var(--red)", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Icon d="M12 9v4m0 4h.01" size={15} color="var(--red)" />
                  {formError}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button onClick={() => { setShowForm(false); setFormError(""); }}
                  style={{ padding: "9px 20px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
                  Cancel
                </button>
                <button onClick={handlePost} disabled={posting}
                  className="A-action-btn solid-teal"
                  style={{ opacity: posting ? 0.7 : 1 }}>
                  {posting ? "Adding…" : "Add Event"}
                </button>
              </div>
            </div>
          )}

          {/* Tag filter */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
            {["All", ...Object.keys(TAG_STYLES)].map(f => {
              const ts = TAG_STYLES[f.toLowerCase()];
              const isActive = filterTag === f;
              return (
                <button key={f} onClick={() => setFilterTag(f)}
                  style={{
                    padding: "5px 14px", borderRadius: "var(--radius-sm)",
                    border: `1.5px solid ${isActive && ts ? "var(--teal)" : "var(--border)"}`,
                    background: isActive ? "var(--teal-light)" : "var(--bg-card)",
                    color: isActive ? "var(--teal-dark)" : "var(--text-secondary)",
                    fontWeight: 700, fontSize: "12.5px", cursor: "pointer", fontFamily: "inherit",
                  }}>
                  {f === "All" ? "All Events" : TAG_STYLES[f.toLowerCase()]?.label}
                  <span style={{ marginLeft: "6px", padding: "1px 6px", borderRadius: "3px", fontSize: "10.5px", fontWeight: 800, background: "rgba(0,0,0,0.07)" }}>
                    {f === "All" ? events.length : events.filter(e => e.tag === f.toLowerCase()).length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Layout: events left, calendar right */}
          <div className="calendar-layout">
            <div className="events-list">
              <div className="section-label">
                {filterTag === "All" ? "All Events" : (TAG_STYLES[filterTag.toLowerCase()]?.label + " Events")}
              </div>

              {loading ? (
                <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>Loading events…</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: "48px 32px", textAlign: "center", color: "var(--text-muted)", background: "var(--bg-card)", borderRadius: "var(--radius-md)", border: "1.5px dashed var(--border)" }}>
                  <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={36} color="var(--border)" />
                  <div style={{ marginTop: "12px", fontWeight: 700, fontSize: "14px" }}>No events yet</div>
                  <div style={{ fontSize: "12.5px", marginTop: "4px" }}>Click a date on the calendar or use the "Add Event" button</div>
                </div>
              ) : filtered.map((event, index) => {
                const d        = formatDate(event.date);
                const upcoming = isUpcoming(event.date);
                const ts       = TAG_STYLES[event.tag] || TAG_STYLES.other;
                const id       = event._id || event.id;
                return (
                  <div className="event-card" key={id || index}
                    style={{ borderLeft: "3px solid var(--teal-dark)", overflow: "hidden" }}>
                    <div className="event-date-block">
                      <div className="event-date-day">{d.day}</div>
                      <div className="event-date-month">{d.month}</div>
                    </div>
                    <div className="event-info" style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ padding: "2px 8px", borderRadius: "var(--radius-sm)", background: "var(--forest-dark)", color: "#fff", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{ts.label}</span>
                        <span style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 600 }}>
                          {event.role === "admin" ? "Admin" : event.role === "teacher" ? "Teacher" : ""}
                        </span>
                      </div>
                      <div className="event-title">{event.event}</div>
                      <div className="event-day-label">{d.weekday} — {d.full}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", padding: "12px 14px", flexShrink: 0 }}>
                      <span className={upcoming ? "event-upcoming-chip" : "event-past-chip"}>
                        {upcoming ? "Upcoming" : "Past"}
                      </span>
                      <button onClick={() => setDeleteConfirm(id)}
                        style={{ padding: "4px 10px", borderRadius: "var(--radius-sm)", border: "1.5px solid #fca5a5", background: "#fff5f5", color: "var(--red)", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" size={11} color="var(--red)" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="calendar-card-large">
              <div className="section-label" style={{ marginBottom: "14px" }}>
                Calendar View
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, marginLeft: "8px" }}>Click a date to add</span>
              </div>
              <MiniCalendar highlightedDates={highlightedDates} onDayClick={handleDayClick} />
              <div style={{ marginTop: "14px", padding: "10px 12px", background: "var(--forest-light)", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--mint)" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--forest-dark)", marginBottom: "4px" }}>
                  Admin events are visible to all portals
                </div>
                <div style={{ fontSize: "11px", color: "var(--forest-dark)", opacity: 0.75 }}>
                  Teachers and students can see events you post here.
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="A-modal-overlay">
          <div className="A-modal" style={{ maxWidth: 380, textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "var(--radius-sm)", background: "#fff5f5", border: "1.5px solid #fca5a5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" size={24} color="var(--red)" />
            </div>
            <div className="A-modal-title" style={{ textAlign: "center" }}>Delete Event?</div>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", marginBottom: "22px" }}>This will permanently remove the event for all users.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setDeleteConfirm(null)}
                style={{ flex: 1, padding: "11px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                style={{ flex: 1, padding: "11px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--red)", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .A-clickable-day { cursor: pointer; }
        .A-clickable-day:hover { background: var(--teal-light) !important; color: var(--teal-dark) !important; }
      `}</style>
    </div>
  );
}

export default AdminCalendar;