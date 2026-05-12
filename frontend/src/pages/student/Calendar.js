import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { apiStudentGetCalendar, apiStudentAddCalendarEvent, apiStudentDeleteCalendarEvent } from "../../services/api";

const Icon = ({ d, size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TAG_STYLES = {
  exam:     { color: "#e53e3e", bg: "#fff5f5", label: "Exam" },
  holiday:  { color: "#16a34a", bg: "#f0fdf4", label: "Holiday" },
  event:    { color: "#7c3aed", bg: "#f5f3ff", label: "Event" },
  reminder: { color: "#0ea5e9", bg: "#f0f9ff", label: "Reminder" },
  other:    { color: "#6b7280", bg: "#f9fafb", label: "Other" },
};

const ROLE_STYLES = {
  admin:   { color: "#e6a800", label: "Admin" },
  teacher: { color: "#4f8ef7", label: "Teacher" },
  student: { color: "#2db87b", label: "Personal" },
};

function MiniCalendar({ highlightedDates = [], selectedDate, onSelectDate }) {
  const [date, setDate] = useState(new Date());

  const year  = date.getFullYear();
  const month = date.getMonth();
  const monthName = date.toLocaleString("default", { month: "long" });

  const firstDay   = new Date(year, month, 1).getDay();
  const offset     = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = offset - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, isOther: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, isOther: false });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, isOther: true });

  const today = new Date();
  const isToday = (d, isOther) =>
    !isOther && d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const isEventDay = (d, isOther) => {
    if (isOther) return false;
    return highlightedDates.some(dateStr => {
      const dt = new Date(dateStr);
      return dt.getFullYear() === year && dt.getMonth() === month && dt.getDate() === d;
    });
  };

  const isSelected = (d, isOther) => {
    if (isOther || !selectedDate) return false;
    const sd = new Date(selectedDate);
    return sd.getFullYear() === year && sd.getMonth() === month && sd.getDate() === d;
  };

  const handleClick = (d, isOther) => {
    if (isOther) return;
    const selected = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    onSelectDate(selected);
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
        {DAYS.map(d => <div key={d} className="cal-day-header">{d}</div>)}
        {cells.map((cell, i) => (
          <div key={i}
            onClick={() => handleClick(cell.day, cell.isOther)}
            className={[
              "cal-day",
              cell.isOther ? "other-month" : "",
              isToday(cell.day, cell.isOther) ? "today" : "",
              isSelected(cell.day, cell.isOther) ? "selected" : "",
              !isToday(cell.day, cell.isOther) && !isSelected(cell.day, cell.isOther) && isEventDay(cell.day, cell.isOther) ? "highlighted" : "",
            ].filter(Boolean).join(" ")}
            style={{ cursor: cell.isOther ? "default" : "pointer" }}>
            {cell.day}
          </div>
        ))}
      </div>
    </div>
  );
}

function AddEventModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], event: "", tag: "other" });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");

  const handleSubmit = async () => {
    if (!form.event.trim()) { setErr("Please enter an event name."); return; }
    setSaving(true);
    try {
      await onAdd(form);
      onClose();
    } catch (e) {
      setErr(e.message || "Failed to save");
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}>
      <div style={{ background: "var(--card-bg)", borderRadius: 18, padding: "28px 28px", width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 20 }}>Add Personal Event</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Event Name</label>
            <input type="text" value={form.event} onChange={e => setForm(f => ({ ...f, event: e.target.value }))}
              placeholder="e.g. Study session, Test prep…"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Tag</label>
            <select value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box" }}>
              <option value="other">Other</option>
              <option value="exam">Exam / Test</option>
              <option value="reminder">Reminder</option>
              <option value="event">Event</option>
            </select>
          </div>
          {err && <div style={{ color: "#e53e3e", fontSize: 13 }}>{err}</div>}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#9b6dff,#7c3aed)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : "Add Event"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  const dt = new Date(dateStr);
  return {
    day:     dt.getDate(),
    month:   dt.toLocaleString("default", { month: "short" }).toUpperCase(),
    weekday: dt.toLocaleString("default", { weekday: "long" }),
    full:    dt.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
    isoDate: dateStr,
  };
}

function Calendar() {
  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterRole, setFilterRole] = useState("All");

  const load = () => {
    setLoading(true);
    apiStudentGetCalendar()
      .then(res => { setEvents(res.data || []); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(load, []);

  const handleAdd = async (data) => {
    await apiStudentAddCalendarEvent(data);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this personal event?")) return;
    await apiStudentDeleteCalendarEvent(id);
    load();
  };

  const highlightedDates = events.map(e => e.date);

  const filteredEvents = events.filter(e => {
    if (filterRole === "All")      return true;
    if (filterRole === "Personal") return e.role === "student";
    if (filterRole === "Teacher")  return e.role === "teacher";
    if (filterRole === "Admin")    return e.role === "admin";
    return true;
  }).filter(e => {
    if (!selectedDate) return true;
    return e.date === selectedDate;
  });

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {showAddModal && <AddEventModal onAdd={handleAdd} onClose={() => setShowAddModal(false)} />}

        <div className="page-wrapper" style={{ maxWidth: "1040px" }}>
          <div className="page-header">
            <div className="page-header-icon icon-purple">
              <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={22} color="#9b6dff" />
            </div>
            <div style={{ flex: 1 }}>
              <div className="page-title">Academic Calendar</div>
              <div className="page-subtitle">{events.length} events this term</div>
            </div>
            <button onClick={() => setShowAddModal(true)}
              style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#9b6dff,#7c3aed)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <Icon d="M12 5v14M5 12h14" size={16} color="#fff" />
              Add Event
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
            {["All", "Teacher", "Admin", "Personal"].map(f => (
              <button key={f} className={filterRole === f ? "filter-chip active" : "filter-chip"}
                onClick={() => setFilterRole(f)} style={{ cursor: "pointer" }}>{f}</button>
            ))}
            {selectedDate && (
              <button onClick={() => setSelectedDate(null)}
                style={{ padding: "5px 12px", borderRadius: 99, fontSize: 13, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon d="M18 6L6 18M6 6l12 12" size={13} />
                Clear date filter
              </button>
            )}
          </div>

          <div className="calendar-layout">
            {/* Events list */}
            <div className="events-list">
              <div className="section-label">
                {selectedDate ? `Events on ${new Date(selectedDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}` : "All Events"}
              </div>

              {loading ? (
                <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
              ) : error ? (
                <div style={{ padding: "32px 0", textAlign: "center", color: "#e53e3e" }}>{error}</div>
              ) : filteredEvents.length === 0 ? (
                <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-muted)" }}>
                  {selectedDate ? "No events on this date." : "No events yet."}
                </div>
              ) : filteredEvents.map((evt, i) => {
                const d          = formatDate(evt.date);
                const tagStyle   = TAG_STYLES[evt.tag] || TAG_STYLES.other;
                const roleStyle  = ROLE_STYLES[evt.role] || ROLE_STYLES.other;
                const isUpcoming = evt.date >= today;
                const isPersonal = evt.role === "student";

                return (
                  <div className="event-card" key={evt._id || i}
                    style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                    <div className="event-date-block" style={{ textAlign: "center", minWidth: 44 }}>
                      <div className="event-date-day" style={{ fontSize: 22, fontWeight: 900 }}>{d.day}</div>
                      <div className="event-date-month" style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>{d.month}</div>
                    </div>
                    <div className="event-info" style={{ flex: 1 }}>
                      <div className="event-title" style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{evt.event}</div>
                      <div className="event-day-label" style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span>{d.weekday}</span>
                        <span style={{ padding: "2px 7px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: tagStyle.bg, color: tagStyle.color }}>{tagStyle.label}</span>
                        <span style={{ padding: "2px 7px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: roleStyle.color + "18", color: roleStyle.color }}>{roleStyle.label}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: isUpcoming ? "#f0fdf7" : "#f9fafb", color: isUpcoming ? "#2db87b" : "#9aaabb" }}>
                        {isUpcoming ? "Upcoming" : "Past"}
                      </span>
                      {isPersonal && (
                        <button onClick={() => handleDelete(evt._id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#e53e3e", padding: "4px" }}>
                          <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" size={14} color="#e53e3e" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calendar widget */}
            <div className="calendar-card-large">
              <div className="section-label" style={{ marginBottom: "14px" }}>
                Calendar View
                {selectedDate && <span style={{ color: "#9b6dff", marginLeft: 8, fontSize: 12, fontWeight: 600 }}>· {selectedDate}</span>}
              </div>
              <MiniCalendar
                highlightedDates={highlightedDates}
                selectedDate={selectedDate}
                onSelectDate={d => setSelectedDate(prev => prev === d ? null : d)}
              />
              <div style={{ marginTop: 14, fontSize: 12, color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#9b6dff", display: "inline-block" }} /> Highlighted = has events
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#4f8ef7", display: "inline-block" }} /> Selected = filtering by date
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Calendar;
