import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import { calendar } from "../../data/mockData";

const Icon = ({ d, size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function MiniCalendar({ highlightedDates = [] }) {
  const [date, setDate] = useState(new Date(2026, 3, 1)); // April 2026
  const today = new Date(2026, 3, 1); // April 1

  const year = date.getFullYear();
  const month = date.getMonth();
  const monthName = date.toLocaleString("default", { month: "long" });

  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = offset - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, isOther: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, isOther: false });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, isOther: true });

  const isToday = (d, isOther) =>
    !isOther && d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

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
    day: dt.getDate(),
    month: dt.toLocaleString("default", { month: "short" }).toUpperCase(),
    weekday: dt.toLocaleString("default", { weekday: "long" }),
    full: dt.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
  };
}

function isUpcoming(dateStr) {
  const dt = new Date(dateStr);
  const now = new Date(2026, 2, 15); // "today"
  return dt >= now;
}

function Calendar() {
  const highlightedDates = calendar.map(e => e.date);

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
              <div className="page-subtitle">{calendar.length} upcoming events this term</div>
            </div>
          </div>

          {/* Layout: events left, calendar right */}
          <div className="calendar-layout">
            <div className="events-list">
              <div className="section-label">All Events</div>
              {calendar.map((event, index) => {
                const d = formatDate(event.date);
                const upcoming = isUpcoming(event.date);
                return (
                  <div className="event-card" key={index}>
                    <div className="event-date-block">
                      <div className="event-date-day">{d.day}</div>
                      <div className="event-date-month">{d.month}</div>
                    </div>
                    <div className="event-info">
                      <div className="event-title">{event.event}</div>
                      <div className="event-day-label">{d.weekday} &mdash; {d.full}</div>
                    </div>
                    <span className={upcoming ? "event-upcoming-chip" : "event-past-chip"}>
                      {upcoming ? "Upcoming" : "Past"}
                    </span>
                  </div>
                );
              })}
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