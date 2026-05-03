import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { fetchCalendar } from "../../services/studentApi";

const Icon = ({ d, size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function MiniCalendar({ highlightedDates = [] }) {
  const [date, setDate] = useState(new Date());

  const year      = date.getFullYear();
  const month     = date.getMonth();
  const monthName = date.toLocaleString("default", { month: "long" });

  const firstDay    = new Date(year, month, 1).getDay();
  const offset      = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = offset - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, isOther: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, isOther: false });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, isOther: true });

  const today = new Date();
  const isToday = (d, isOther) =>
    !isOther &&
    d === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const isEventDay = (d, isOther) => {
    if (isOther) return false;
    return highlightedDates.some(dateStr => {
      const dt = new Date(dateStr);
      return dt.getFullYear() === year && dt.getMonth() === month && dt.getDate() === d;
    });
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
        {DAYS.map(d => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}
        {cells.map((cell, i) => (
          <div key={i} className={[
            "cal-day",
            cell.isOther ? "other-month" : "",
            isToday(cell.day, cell.isOther) ? "today" : "",
            !isToday(cell.day, cell.isOther) && isEventDay(cell.day, cell.isOther) ? "highlighted" : "",
          ].filter(Boolean).join(" ")}>
            {cell.day}
          </div>
        ))}
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
  };
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function EventSkeleton() {
  return (
    <div className="event-card" style={{ opacity: 0.5 }}>
      <div className="event-date-block" style={{ background: "#eee", borderRadius: 8, width: 48, height: 52 }} />
      <div className="event-info" style={{ flex: 1 }}>
        <div style={{ background: "#eee", height: 14, borderRadius: 4, width: "60%", marginBottom: 8 }} />
        <div style={{ background: "#eee", height: 12, borderRadius: 4, width: "40%" }} />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function Calendar() {
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [monthFilter, setMonthFilter]   = useState("");
  const [typeFilter, setTypeFilter]     = useState("");

  // Re-fetch when filters change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchCalendar({ month: monthFilter || undefined, type: typeFilter || undefined })
      .then(data => { if (!cancelled) { setCalendarData(data); setLoading(false); } })
      .catch(err  => { if (!cancelled) { setError(err.message); setLoading(false); } });

    return () => { cancelled = true; };
  }, [monthFilter, typeFilter]);

  const events           = calendarData?.events          || [];
  const months           = calendarData?.months          || [];
  const upcomingCount    = calendarData?.upcomingCount   ?? 0;
  const highlightedDates = events.map(e => e.date);

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-wrapper" style={{ maxWidth: "1040px" }}>

          {/* Header */}
          <div className="page-header">
            <div className="page-header-icon icon-purple">
              <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={22} color="#9b6dff" />
            </div>
            <div>
              <div className="page-title">Academic Calendar</div>
              <div className="page-subtitle">
                {loading ? "Loading events…" : `${upcomingCount} upcoming event${upcomingCount !== 1 ? "s" : ""} this term`}
              </div>
            </div>
          </div>

          {/* Filters */}
          {!loading && !error && (months.length > 0 || true) && (
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              {/* Month filter */}
              <select
                value={monthFilter}
                onChange={e => setMonthFilter(e.target.value)}
                style={{
                  padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e0e0e0",
                  fontSize: 13, color: "#333", background: "#fff", cursor: "pointer",
                }}
              >
                <option value="">All Months</option>
                {months.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              {/* Type filter */}
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                style={{
                  padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e0e0e0",
                  fontSize: 13, color: "#333", background: "#fff", cursor: "pointer",
                }}
              >
                <option value="">All Types</option>
                <option value="exam">Exam</option>
                <option value="holiday">Holiday</option>
                <option value="event">Event</option>
                <option value="meeting">Meeting</option>
                <option value="activity">Activity</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div style={{
              background: "#fff1f1", border: "1px solid #ffd0d0", borderRadius: 10,
              padding: "16px 20px", color: "#cc0000", marginBottom: 20,
            }}>
              <strong>Failed to load calendar:</strong> {error}
            </div>
          )}

          {/* Layout: events left, calendar right */}
          <div className="calendar-layout">
            <div className="events-list">
              <div className="section-label">
                {monthFilter || typeFilter ? "Filtered Events" : "All Events"}
              </div>

              {/* Loading skeletons */}
              {loading && [1, 2, 3, 4].map(i => <EventSkeleton key={i} />)}

              {/* Events */}
              {!loading && events.map((event, index) => {
                const d = formatDate(event.date);
                return (
                  <div className="event-card" key={event.id || index}>
                    <div className="event-date-block">
                      <div className="event-date-day">{d.day}</div>
                      <div className="event-date-month">{d.month}</div>
                    </div>
                    <div className="event-info">
                      <div className="event-title">{event.title}</div>
                      <div className="event-day-label">{d.weekday} &mdash; {d.full}</div>
                      {event.description && (
                        <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                          {event.description}
                        </div>
                      )}
                    </div>
                    <span className={event.isUpcoming ? "event-upcoming-chip" : "event-past-chip"}>
                      {event.isUpcoming ? "Upcoming" : "Past"}
                    </span>
                  </div>
                );
              })}

              {/* Empty state */}
              {!loading && !error && events.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#aaa" }}>
                  <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={36} color="#ccc" />
                  <div style={{ marginTop: 12, fontSize: 15 }}>No events found</div>
                  {(monthFilter || typeFilter) && (
                    <button
                      onClick={() => { setMonthFilter(""); setTypeFilter(""); }}
                      style={{ marginTop: 8, fontSize: 13, color: "#9b6dff", background: "none", border: "none", cursor: "pointer" }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="calendar-card-large">
              <div className="section-label" style={{ marginBottom: "14px" }}>Calendar View</div>
              <MiniCalendar highlightedDates={highlightedDates} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Calendar;
