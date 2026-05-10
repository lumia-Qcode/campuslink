import React, { useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import { CLASS_LEVELS, mockTeachers, getClassLabel, getTeacherName } from "../../data/adminMockData";

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAY_SHORT = { Monday:"Mon", Tuesday:"Tue", Wednesday:"Wed", Thursday:"Thu", Friday:"Fri" };

const PERIODS = [
  "8:00 - 8:45", "8:45 - 9:30", "9:30 - 10:15",
  "10:15 - 10:30", // break
  "10:30 - 11:15", "11:15 - 12:00", "12:00 - 12:45",
  "12:45 - 1:15",  // lunch
  "1:15 - 2:00", "2:00 - 2:45",
];

const TEACHING_PERIODS = PERIODS.filter(p => !p.includes("10:15") && !p.includes("12:45"));

const SUBJECT_COLORS = {
  "Mathematics":      { color: "#3a4f99", bg: "#dce7f4" },
  "English":          { color: "#3a4f99", bg: "#dce7f4" },
  "Urdu":             { color: "#6299d0", bg: "#fff7ed" },
  "Science":          { color: "#6299d0", bg: "#f0f9ff" },
  "Social Studies":   { color: "#d97706", bg: "#f7f7e8" },
  "Islamiyat":        { color: "#16a34a", bg: "#f0fdf4" },
  "Computer Science": { color: "#6299d0", bg: "#dce7f4" },
  "Pakistan Studies": { color: "#dc2626", bg: "#fff5f5" },
  "Arts & Crafts":    { color: "#ec4899", bg: "#fdf2f8" },
  "Physical Education":{ color: "#6299d0", bg: "#dce7f4" },
  "Moral Studies":    { color: "#6299d0", bg: "#dce7f4" },
};

const getSubjectStyle = (s) => SUBJECT_COLORS[s] || { color: "#5a6a7e", bg: "#ecece5" };

const SECTIONS = ["A","B","C","D","E","J"];

// Initial timetable mock data
const INITIAL_TIMETABLES = {
  "X-A": {
    Monday:    [
      { period:"8:00 - 8:45",   subject:"Mathematics",     teacher:"T-001", room:"R-101" },
      { period:"8:45 - 9:30",   subject:"English",         teacher:"T-002", room:"R-102" },
      { period:"9:30 - 10:15",  subject:"Urdu",            teacher:"T-004", room:"R-101" },
      { period:"10:30 - 11:15", subject:"Science",         teacher:"T-003", room:"Lab-1" },
      { period:"11:15 - 12:00", subject:"Islamiyat",       teacher:"T-004", room:"R-103" },
      { period:"1:15 - 2:00",   subject:"Computer Science",teacher:"T-001", room:"Lab-2" },
      { period:"2:00 - 2:45",   subject:"Social Studies",  teacher:"T-002", room:"R-102" },
    ],
    Tuesday:   [
      { period:"8:00 - 8:45",   subject:"English",         teacher:"T-002", room:"R-102" },
      { period:"8:45 - 9:30",   subject:"Mathematics",     teacher:"T-001", room:"R-101" },
      { period:"9:30 - 10:15",  subject:"Science",         teacher:"T-003", room:"Lab-1" },
      { period:"10:30 - 11:15", subject:"Urdu",            teacher:"T-004", room:"R-101" },
      { period:"11:15 - 12:00", subject:"Computer Science",teacher:"T-001", room:"Lab-2" },
      { period:"1:15 - 2:00",   subject:"Mathematics",     teacher:"T-001", room:"R-101" },
    ],
    Wednesday: [
      { period:"8:00 - 8:45",   subject:"Science",         teacher:"T-003", room:"Lab-1" },
      { period:"8:45 - 9:30",   subject:"Urdu",            teacher:"T-004", room:"R-101" },
      { period:"9:30 - 10:15",  subject:"English",         teacher:"T-002", room:"R-102" },
      { period:"10:30 - 11:15", subject:"Mathematics",     teacher:"T-001", room:"R-101" },
      { period:"11:15 - 12:00", subject:"Islamiyat",       teacher:"T-004", room:"R-103" },
    ],
    Thursday:  [
      { period:"8:00 - 8:45",   subject:"Computer Science",teacher:"T-001", room:"Lab-2" },
      { period:"8:45 - 9:30",   subject:"Science",         teacher:"T-003", room:"Lab-1" },
      { period:"9:30 - 10:15",  subject:"Mathematics",     teacher:"T-001", room:"R-101" },
      { period:"10:30 - 11:15", subject:"English",         teacher:"T-002", room:"R-102" },
      { period:"11:15 - 12:00", subject:"Social Studies",  teacher:"T-002", room:"R-102" },
    ],
    Friday:    [
      { period:"8:00 - 8:45",   subject:"Urdu",            teacher:"T-004", room:"R-101" },
      { period:"8:45 - 9:30",   subject:"Mathematics",     teacher:"T-001", room:"R-101" },
      { period:"9:30 - 10:15",  subject:"Islamiyat",       teacher:"T-004", room:"R-103" },
      { period:"10:30 - 11:15", subject:"Science",         teacher:"T-003", room:"Lab-1" },
      { period:"11:15 - 12:00", subject:"English",         teacher:"T-002", room:"R-102" },
    ],
  },
  "9-A": {
    Monday:   [
      { period:"8:00 - 8:45",   subject:"Mathematics",    teacher:"T-001", room:"R-201" },
      { period:"8:45 - 9:30",   subject:"Science",        teacher:"T-003", room:"Lab-1" },
      { period:"9:30 - 10:15",  subject:"English",        teacher:"T-002", room:"R-202" },
      { period:"10:30 - 11:15", subject:"Urdu",           teacher:"T-004", room:"R-201" },
    ],
    Tuesday:  [
      { period:"8:00 - 8:45",   subject:"Science",        teacher:"T-003", room:"Lab-1" },
      { period:"8:45 - 9:30",   subject:"Mathematics",    teacher:"T-001", room:"R-201" },
      { period:"10:30 - 11:15", subject:"English",        teacher:"T-002", room:"R-202" },
    ],
    Wednesday:[], Thursday:[], Friday:[],
  },
};

const EMPTY_PERIOD = { period: TEACHING_PERIODS[0], subject: "Mathematics", teacher: "", room: "" };

export default function AdminTimetable() {
  const [timetables, setTimetables] = useState(INITIAL_TIMETABLES);
  const [selectedClass, setSelectedClass] = useState("X");
  const [selectedSection, setSelectedSection] = useState("A");
  const [activeDay, setActiveDay] = useState("Monday");
  const [view, setView] = useState("week"); // week | day
  const [showAddModal, setShowAddModal] = useState(false);
  const [addDay, setAddDay] = useState("Monday");
  const [addForm, setAddForm] = useState(EMPTY_PERIOD);
  const [editEntry, setEditEntry] = useState(null); // { day, index, entry }
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState({});

  const key = `${selectedClass}-${selectedSection}`;
  const currentTT = timetables[key] || { Monday:[], Tuesday:[], Wednesday:[], Thursday:[], Friday:[] };

  const getDay = (day) => currentTT[day] || [];

  const validate = (form) => {
    const e = {};
    if (!form.subject) e.subject = "Subject required";
    if (!form.teacher) e.teacher = "Teacher required";
    if (!form.room.trim()) e.room = "Room required";
    // check duplicate period
    const dayEntries = getDay(addDay);
    const isDuplicate = dayEntries.some((e, idx) => e.period === form.period && (editEntry === null || idx !== editEntry.index));
    if (isDuplicate) e.period = "A period slot already exists for this time";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    if (!validate(addForm)) return;
    setTimetables(prev => {
      const dayArr = [...(prev[key]?.[addDay] || [])];
      dayArr.push({ ...addForm });
      dayArr.sort((a, b) => TEACHING_PERIODS.indexOf(a.period) - TEACHING_PERIODS.indexOf(b.period));
      return { ...prev, [key]: { ...prev[key], [addDay]: dayArr } };
    });
    setSuccessMsg(`Period added: ${addForm.subject} on ${addDay}`);
    setTimeout(() => setSuccessMsg(""), 3500);
    setShowAddModal(false);
    setAddForm(EMPTY_PERIOD);
    setErrors({});
  };

  const handleEdit = () => {
    if (!validate(addForm)) return;
    setTimetables(prev => {
      const dayArr = [...(prev[key]?.[editEntry.day] || [])];
      dayArr[editEntry.index] = { ...addForm };
      dayArr.sort((a, b) => TEACHING_PERIODS.indexOf(a.period) - TEACHING_PERIODS.indexOf(b.period));
      return { ...prev, [key]: { ...prev[key], [editEntry.day]: dayArr } };
    });
    setSuccessMsg("Period updated successfully.");
    setTimeout(() => setSuccessMsg(""), 3500);
    setEditEntry(null);
    setAddForm(EMPTY_PERIOD);
    setErrors({});
  };

  const handleDelete = (day, index) => {
    setTimetables(prev => {
      const dayArr = [...(prev[key]?.[day] || [])];
      dayArr.splice(index, 1);
      return { ...prev, [key]: { ...prev[key], [day]: dayArr } };
    });
  };

  const openEdit = (day, index, entry) => {
    setEditEntry({ day, index, entry });
    setAddForm({ ...entry });
    setErrors({});
  };

  const openAdd = (day) => {
    setAddDay(day);
    setAddForm(EMPTY_PERIOD);
    setErrors({});
    setShowAddModal(true);
  };

  const FormFields = ({ form, setForm, daySelect }) => (
    <div>
      {daySelect && (
        <div className="form-group">
          <label className="form-label">Day</label>
          <select className="form-input" value={addDay} onChange={e => setAddDay(e.target.value)}>
            {DAYS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <div className="form-group">
          <label className="form-label">Period Time *</label>
          <select className={`form-input${errors.period ? " input-error" : ""}`} value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))}>
            {TEACHING_PERIODS.map(p => <option key={p}>{p}</option>)}
          </select>
          {errors.period && <div style={{ color: "#e05555", fontSize: 11.5, marginTop: 4, fontWeight: 600 }}>{errors.period}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Subject *</label>
          <select className={`form-input${errors.subject ? " input-error" : ""}`} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
            {Object.keys(SUBJECT_COLORS).map(s => <option key={s}>{s}</option>)}
          </select>
          {errors.subject && <div style={{ color: "#e05555", fontSize: 11.5, marginTop: 4, fontWeight: 600 }}>{errors.subject}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Teacher *</label>
          <select className={`form-input${errors.teacher ? " input-error" : ""}`} value={form.teacher} onChange={e => setForm(f => ({ ...f, teacher: e.target.value }))}>
            <option value="">— Select Teacher —</option>
            {mockTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {errors.teacher && <div style={{ color: "#e05555", fontSize: 11.5, marginTop: 4, fontWeight: 600 }}>{errors.teacher}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Room *</label>
          <input className={`form-input${errors.room ? " input-error" : ""}`} placeholder="e.g. R-101, Lab-1" value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} />
          {errors.room && <div style={{ color: "#e05555", fontSize: 11.5, marginTop: 4, fontWeight: 600 }}>{errors.room}</div>}
        </div>
      </div>
    </div>
  );

  const PeriodCard = ({ entry, day, index }) => {
    const st = getSubjectStyle(entry.subject);
    return (
      <div style={{ background: st.bg, border: `1.5px solid ${st.color}33`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: st.color, marginBottom: 2 }}>{entry.period}</div>
          <div style={{ fontWeight: 800, fontSize: 13.5, color: "var(--text-primary)" }}>{entry.subject}</div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 1, display: "flex", gap: 10 }}>
            <span>{getTeacherName(entry.teacher)}</span>
            <span>·</span>
            <span>{entry.room}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button onClick={() => openEdit(day, index, entry)}
            style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: 7, padding: "5px 8px", cursor: "pointer" }}>
            <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={13} color="var(--text-secondary)" />
          </button>
          <button onClick={() => handleDelete(day, index)}
            style={{ background: "#fff5f5", border: "1.5px solid #fca5a5", borderRadius: 7, padding: "5px 8px", cursor: "pointer" }}>
            <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" size={13} color="#dc2626" />
          </button>
        </div>
      </div>
    );
  };

  const totalPeriods = DAYS.reduce((sum, d) => sum + getDay(d).length, 0);
  const subjects = [...new Set(DAYS.flatMap(d => getDay(d).map(e => e.subject)))];

  return (
    <div className="app-layout">
      <AdminNavbar />
      <main className="main-content">

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800 }}>Timetable Manager</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>Build and manage class timetables</p>
          </div>
          <button className="btn-primary"
            style={{ width: "auto", padding: "12px 22px", background: "linear-gradient(135deg, #3a4f99, #13233d)", display: "flex", alignItems: "center", gap: 8 }}
            onClick={() => openAdd(activeDay)}>
            <Icon d="M12 5v14M5 12h14" size={15} color="#fff" />
            Add Period
          </button>
        </div>

        {successMsg && (
          <div style={{ background: "#dce7f4", border: "1px solid #b2cee2", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#15803d", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon d="M9 11l3 3L22 4" size={15} color="#15803d" /> {successMsg}
          </div>
        )}

        {/* Class Selector */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label className="form-label" style={{ margin: 0, whiteSpace: "nowrap" }}>Class</label>
              <select className="teacher-form-select" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                {CLASS_LEVELS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label className="form-label" style={{ margin: 0 }}>Section</label>
              <div style={{ display: "flex", gap: 6 }}>
                {SECTIONS.map(s => (
                  <button key={s} onClick={() => setSelectedSection(s)}
                    style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${selectedSection === s ? "#3a4f99" : "var(--border)"}`, background: selectedSection === s ? "#dce7f4" : "#fff", color: selectedSection === s ? "#13233d" : "var(--text-secondary)", fontWeight: 800, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              {["week","day"].map(v => (
                <button key={v} onClick={() => setView(v)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1.5px solid var(--border)", background: view === v ? "#3a4f99" : "var(--bg-main)", color: view === v ? "#fff" : "var(--text-secondary)", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>
                  {v === "week" ? "Week" : "Day"} View
                </button>
              ))}
            </div>
          </div>

          {/* Summary chips */}
          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <span style={{ background: "#dce7f4", color: "#13233d", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>
              {getClassLabel(selectedClass)} — {selectedSection}
            </span>
            <span style={{ background: "var(--bg-main)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>
              {totalPeriods} periods/week
            </span>
            {subjects.map(s => {
              const st = getSubjectStyle(s);
              return <span key={s} style={{ background: st.bg, color: st.color, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>{s}</span>;
            })}
          </div>
        </div>

        {/* Day Tabs (for day view) */}
        {view === "day" && (
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {DAYS.map(d => (
              <button key={d} onClick={() => setActiveDay(d)}
                style={{ flex: 1, padding: "10px 8px", borderRadius: 10, border: `2px solid ${activeDay === d ? "#3a4f99" : "var(--border)"}`, background: activeDay === d ? "#dce7f4" : "#fff", color: activeDay === d ? "#13233d" : "var(--text-secondary)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                {DAY_SHORT[d]}
                <div style={{ fontSize: 10.5, fontWeight: 700, marginTop: 2, color: activeDay === d ? "#3a4f99" : "var(--text-muted)" }}>{getDay(d).length} periods</div>
              </button>
            ))}
          </div>
        )}

        {/* WEEK VIEW */}
        {view === "week" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
            {DAYS.map(day => (
              <div key={day}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>{DAY_SHORT[day]}</div>
                  <button onClick={() => openAdd(day)}
                    style={{ background: "#dce7f4", border: "1.5px solid #b2cee2", borderRadius: 8, padding: "4px 8px", cursor: "pointer", color: "#13233d", fontWeight: 700, fontSize: 11.5, display: "flex", alignItems: "center", gap: 3, fontFamily: "inherit" }}>
                    <Icon d="M12 5v14M5 12h14" size={11} color="#13233d" /> Add
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {PERIODS.map(period => {
                    const isBreak = period === "10:15 - 10:30" || period === "12:45 - 1:15";
                    if (isBreak) {
                      return (
                        <div key={period} style={{ background: "#f8f9fa", border: "1px dashed var(--border)", borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
                          <div style={{ fontSize: 9.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            {period === "10:15 - 10:30" ? "☕ Break" : "🍽 Lunch"}
                          </div>
                          <div style={{ fontSize: 9.5, color: "var(--text-muted)" }}>{period}</div>
                        </div>
                      );
                    }
                    const entry = getDay(day).find(e => e.period === period);
                    const idx = getDay(day).findIndex(e => e.period === period);
                    if (!entry) {
                      return (
                        <div key={period} style={{ border: "1.5px dashed var(--border)", borderRadius: 8, padding: "10px", textAlign: "center", cursor: "pointer", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#dce7f4"; e.currentTarget.style.borderColor = "#6299d0"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.borderColor = ""; }}
                          onClick={() => { setAddDay(day); setAddForm(f => ({ ...EMPTY_PERIOD, period })); setErrors({}); setShowAddModal(true); }}>
                          <div style={{ fontSize: 9.5, color: "var(--text-muted)", fontWeight: 600 }}>{period}</div>
                          <div style={{ fontSize: 10, color: "#6299d0", fontWeight: 700, marginTop: 2 }}>+ Add</div>
                        </div>
                      );
                    }
                    const st = getSubjectStyle(entry.subject);
                    return (
                      <div key={period} style={{ background: st.bg, border: `1.5px solid ${st.color}33`, borderRadius: 8, padding: "8px 10px", cursor: "pointer", position: "relative", group: true }}
                        onClick={() => openEdit(day, idx, entry)}>
                        <div style={{ fontSize: 9.5, fontWeight: 700, color: st.color }}>{entry.period}</div>
                        <div style={{ fontWeight: 800, fontSize: 12.5, color: "var(--text-primary)" }}>{entry.subject}</div>
                        <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{entry.room}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DAY VIEW */}
        {view === "day" && (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", background: "linear-gradient(135deg,#3a4f99,#13233d)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: "#fff" }}>
                {activeDay} — {getClassLabel(selectedClass)} {selectedSection}
              </div>
              <button onClick={() => openAdd(activeDay)}
                style={{ background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: 8, padding: "7px 14px", cursor: "pointer", color: "#fff", fontWeight: 700, fontSize: 12.5, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
                <Icon d="M12 5v14M5 12h14" size={13} color="#fff" /> Add Period
              </button>
            </div>
            <div style={{ padding: 16 }}>
              {PERIODS.map(period => {
                const isBreak = period === "10:15 - 10:30" || period === "12:45 - 1:15";
                if (isBreak) {
                  return (
                    <div key={period} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#f8f9fa", borderRadius: 10, marginBottom: 8, border: "1px dashed var(--border)" }}>
                      <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 700, width: 100, flexShrink: 0 }}>{period}</div>
                      <div style={{ fontSize: 12.5, color: "var(--text-muted)", fontStyle: "italic" }}>
                        {period === "10:15 - 10:30" ? "☕ Short Break" : "🍽 Lunch Break"}
                      </div>
                    </div>
                  );
                }
                const entries = getDay(activeDay).filter(e => e.period === period);
                const entry = entries[0];
                const idx = getDay(activeDay).findIndex(e => e.period === period);
                return (
                  <div key={period} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", width: 100, flexShrink: 0 }}>{period}</div>
                    {entry ? (
                      <div style={{ flex: 1 }}>
                        <PeriodCard entry={entry} day={activeDay} index={idx} />
                      </div>
                    ) : (
                      <div style={{ flex: 1, border: "1.5px dashed var(--border)", borderRadius: 10, padding: "10px 14px", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 12.5 }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#dce7f4"; e.currentTarget.style.borderColor = "#6299d0"; e.currentTarget.style.color = "#13233d"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.borderColor = ""; e.currentTarget.style.color = ""; }}
                        onClick={() => { setAddDay(activeDay); setAddForm(f => ({ ...EMPTY_PERIOD, period })); setErrors({}); setShowAddModal(true); }}>
                        <Icon d="M12 5v14M5 12h14" size={14} color="var(--text-muted)" /> Free Period — click to assign
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ADD PERIOD MODAL */}
        {showAddModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(196, 187, 187, 0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 500, boxShadow: "0 20px 60px rgba(94, 142, 104, 0.2)" }}>
              <div style={{ padding: "22px 28px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>Add Period</div>
                <button onClick={() => { setShowAddModal(false); setErrors({}); }} style={{ background: "var(--bg-main)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer" }}>
                  <Icon d="M18 6L6 18M6 6l12 12" size={16} />
                </button>
              </div>
              <div style={{ padding: "20px 28px" }}>
                <FormFields form={addForm} setForm={setAddForm} daySelect={true} />
              </div>
              <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", gap: 12 }}>
                <button onClick={() => { setShowAddModal(false); setErrors({}); }}
                  style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid var(--border)", background: "#fff", color: "var(--text-secondary)", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                <button onClick={handleAdd} className="btn-primary" style={{ flex: 1, background: "8089b1" }}>Add Period</button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT PERIOD MODAL */}
        {editEntry && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 500, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
              <div style={{ padding: "22px 28px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>Edit Period — {editEntry.day}</div>
                <button onClick={() => { setEditEntry(null); setErrors({}); }} style={{ background: "var(--bg-main)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer" }}>
                  <Icon d="M18 6L6 18M6 6l12 12" size={16} />
                </button>
              </div>
              <div style={{ padding: "20px 28px" }}>
                <FormFields form={addForm} setForm={setAddForm} daySelect={false} />
              </div>
              <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", gap: 12 }}>
                <button onClick={() => { setEditEntry(null); setErrors({}); }}
                  style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid var(--border)", background: "#fff", color: "var(--text-secondary)", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                <button onClick={handleEdit} className="btn-primary" style={{ flex: 1, background: "linear-gradient(135deg,#3a4f99,#13233d)" }}>Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
