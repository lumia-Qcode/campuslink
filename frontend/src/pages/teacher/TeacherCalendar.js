import React, { useState, useEffect } from "react";
import TeacherNavbar from "../../components/Teachernavbar";
import { apiGetCalendarEvents, apiCreateCalendarEvent, apiDeleteCalendarEvent } from "../../services/api";

const Icon = ({ d, size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const CAL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TAG_STYLES = {
  exam:     { color: "#e53e3e", bg: "#fff5f5", border: "#fca5a5", label: "Exam"     },
  holiday:  { color: "#2db87b", bg: "#f0fdf7", border: "#bbf7d0", label: "Holiday"  },
  event:    { color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd", label: "Event"    },
  reminder: { color: "#e6a800", bg: "#fffbeb", border: "#fcd34d", label: "Reminder" },
  other:    { color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb", label: "Other"    },
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
    const dateStr = `${year}-${pad(month + 1)}-${pad(cell.day)}`;
    onDayClick(dateStr);
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
              !cell.isOther ? "clickable-day" : "",
            ].filter(Boolean).join(" ")}
            onClick={() => handleClick(cell)}
            title={!cell.isOther ? "Click to add event" : ""}
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

function TeacherCalendar() {
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ date: "", event: "", tag: "other" });
  const [posting, setPosting]     = useState(false);
  const [posted, setPosted]       = useState(false);
  const [formError, setFormError] = useState("");
  const [filterTag, setFilterTag] = useState("All");

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
    if (!form.date)  { setFormError("Please select a date."); return; }
    if (!form.event.trim()) { setFormError("Event name cannot be empty."); return; }
    setFormError("");
    setPosting(true);
    try {
      const res = await apiCreateCalendarEvent({ date: form.date, event: form.event, tag: form.tag });
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
    } catch (_) { alert("Failed to delete event."); }
  };

  const highlightedDates = events.map(e => e.date);

  const filtered = filterTag === "All"
    ? events
    : events.filter(e => e.tag === filterTag.toLowerCase());

  return (
    <div className="app-layout">
      <TeacherNavbar />
      <main className="main-content">
        <div className="page-wrapper" style={{ maxWidth: "1040px" }}>

          {/* Header */}
          <div className="page-header">
            <div className="page-header-icon icon-purple">
              <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={22} color="#9b6dff" />
            </div>
            <div style={{ flex: 1 }}>
              <div className="page-title">Academic Calendar</div>
              <div className="page-subtitle">{events.length} events this term</div>
            </div>
            <button onClick={() => { setShowForm(!showForm); setFormError(""); }}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 20px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #9b6dff, #7c3aed)", color: "#fff", fontWeight: 700, fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(155,109,255,0.35)" }}>
              <Icon d="M12 5v14M5 12h14" size={16} color="#fff" />
              Add Event
            </button>
          </div>

          {/* Success banner */}
          {posted && (
            <div style={{ padding: "12px 18px", borderRadius: "10px", background: "#f5f3ff", border: "1.5px solid #c4b5fd", color: "#7c3aed", fontWeight: 700, fontSize: "13.5px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Icon d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={16} color="#7c3aed" />
              Event added successfully!
            </div>
          )}

          {/* Add event form */}
          {showForm && (
            <div className="card" style={{ border: "2px solid #c4b5fd", background: "linear-gradient(135deg, #f5f3ff, #fff)", marginBottom: "20px" }}>
              <div className="card-header" style={{ marginBottom: "18px" }}>
                <div className="card-title">
                  <div className="card-title-icon" style={{ background: "#f5f3ff" }}>
                    <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={15} color="#9b6dff" />
                  </div>
                  Add New Event
                </div>
                <button onClick={() => { setShowForm(false); setFormError(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                  <Icon d="M18 6L6 18M6 6l12 12" size={18} />
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={form.date}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Event Name</label>
                  <input className="form-input" placeholder="e.g. Mid-term Exams Begin"
                    value={form.event} onChange={e => setForm(p => ({ ...p, event: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select className="form-input" value={form.tag}
                    onChange={e => setForm(p => ({ ...p, tag: e.target.value }))}>
                    {Object.entries(TAG_STYLES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formError && (
                <div style={{ marginBottom: "12px", padding: "10px 14px", borderRadius: "8px", background: "#fff5f5", border: "1.5px solid #fca5a5", color: "#e53e3e", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Icon d="M12 9v4m0 4h.01" size={15} color="#e53e3e" />
                  {formError}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button onClick={() => { setShowForm(false); setFormError(""); }}
                  style={{ padding: "10px 20px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg-main)", color: "var(--text-secondary)", fontWeight: 700, fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit" }}>
                  Cancel
                </button>
                <button onClick={handlePost} disabled={posting}
                  style={{ padding: "10px 28px", borderRadius: "10px", border: "none", background: posting ? "#9aaabb" : "linear-gradient(135deg, #9b6dff, #7c3aed)", color: "#fff", fontWeight: 800, fontSize: "13.5px", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(155,109,255,0.35)" }}>
                  {posting ? "Adding…" : "Add Event"}
                </button>
              </div>
            </div>
          )}

          {/* Tag filter */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
            {["All", ...Object.keys(TAG_STYLES)].map(f => {
              const ts   = TAG_STYLES[f.toLowerCase()];
              const isActive = filterTag === f;
              return (
                <button key={f} onClick={() => setFilterTag(f)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    padding: "5px 14px", borderRadius: "20px",
                    border: `1.5px solid ${isActive && ts ? ts.border : "var(--border)"}`,
                    background: isActive && ts ? ts.bg : "var(--bg-main)",
                    color: isActive && ts ? ts.color : isActive ? "#9b6dff" : "var(--text-secondary)",
                    fontWeight: 700, fontSize: "12.5px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  }}>
                  {f === "All" ? "All" : TAG_STYLES[f.toLowerCase()]?.label}
                  <span style={{ padding: "1px 6px", borderRadius: "10px", fontSize: "10.5px", fontWeight: 800, background: "rgba(0,0,0,0.07)" }}>
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
                {filterTag === "All" ? "All Events" : TAG_STYLES[filterTag.toLowerCase()]?.label + " Events"}
              </div>

              {loading ? (
                <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                  <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={36} color="#d1dbe8" />
                  <p style={{ marginTop: "12px", fontSize: "14px" }}>No events. Click a calendar date to add one.</p>
                </div>
              ) : filtered.map((event, index) => {
                const d        = formatDate(event.date);
                const upcoming = isUpcoming(event.date);
                const ts       = TAG_STYLES[event.tag] || TAG_STYLES.other;
                const id       = event._id || event.id;
                return (
                  <div className="event-card" key={id || index}
                    style={{ display: "flex", alignItems: "center", gap: "0", borderLeft: `3px solid ${ts.color}`, overflow: "hidden" }}>
                    <div className="event-date-block" style={{ background: ts.bg }}>
                      <div className="event-date-day" style={{ color: ts.color }}>{d.day}</div>
                      <div className="event-date-month" style={{ color: ts.color }}>{d.month}</div>
                    </div>
                    <div className="event-info" style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ padding: "2px 8px", borderRadius: "20px", background: ts.bg, color: ts.color, border: `1px solid ${ts.border}`, fontSize: "10.5px", fontWeight: 700 }}>{ts.label}</span>
                      </div>
                      <div className="event-title">{event.event}</div>
                      <div className="event-day-label">{d.weekday} — {d.full}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", padding: "12px 14px", flexShrink: 0 }}>
                      <span className={upcoming ? "event-upcoming-chip" : "event-past-chip"}>
                        {upcoming ? "Upcoming" : "Past"}
                      </span>
                      <button onClick={() => handleDelete(id)}
                        style={{ padding: "4px 10px", borderRadius: "7px", border: "1.5px solid #fca5a5", background: "#fff5f5", color: "#e53e3e", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Icon d="M18 6L6 18M6 6l12 12" size={10} color="#e53e3e" />
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
                <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600, marginLeft: "8px" }}>Click a date to add event</span>
              </div>
              <MiniCalendar highlightedDates={highlightedDates} onDayClick={handleDayClick} />
            </div>
          </div>

        </div>
      </main>

      <style>{`
        .clickable-day { cursor: pointer; transition: background 0.15s, color 0.15s; }
        .clickable-day:hover { background: #f5f3ff !important; color: #7c3aed !important; border-radius: 6px; }
        .cal-day.highlighted { background: #f0fdf7; color: #2db87b; font-weight: 800; border-radius: 6px; }
      `}</style>
    </div>
  );
}

export default TeacherCalendar;
