import React, { useState, useEffect } from "react";
import TeacherNavbar from "../../components/Teachernavbar";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../services/auth";
import {
  apiGetMyTeacherProfile, apiGetStudents, apiGetMaterials,
  apiGetAnnouncements, apiGetTeacherTimetable,
} from "../../services/api";

const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const CAL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function MiniCalendar() {
  const now = new Date();
  const [date, setDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const year = date.getFullYear(), month = date.getMonth();
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
    !isOther && d === now.getDate() && month === now.getMonth() && year === now.getFullYear();
  return (
    <div className="mini-calendar">
      <div className="cal-header">
        <button className="cal-nav-btn" onClick={() => setDate(new Date(year, month - 1, 1))}><Icon d="M15 18l-6-6 6-6" size={14} /></button>
        <span className="cal-month">{monthName} {year}</span>
        <button className="cal-nav-btn" onClick={() => setDate(new Date(year, month + 1, 1))}><Icon d="M9 18l6-6-6-6" size={14} /></button>
      </div>
      <div className="cal-grid">
        {CAL_DAYS.map(d => <div key={d} className="cal-day-header">{d}</div>)}
        {cells.map((cell, i) => (
          <div key={i} className={["cal-day", cell.isOther ? "other-month" : "", isToday(cell.day, cell.isOther) ? "today" : ""].filter(Boolean).join(" ")}>
            {cell.day}
          </div>
        ))}
      </div>
    </div>
  );
}

const TAG_STYLES = {
  urgent: { bg: "var(--red)",       label: "Urgent"  },
  event:  { bg: "var(--plum)",      label: "Event"   },
  info:   { bg: "var(--sky-dark)",  label: "Info"    },
  notice: { bg: "var(--teal-dark)", label: "Notice"  },
};

function TeacherDashboard() {
  const user = getUser();
  const navigate = useNavigate();
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const dayIndex = today.getDay();
  const dayLabels = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const [activeDay, setActiveDay] = useState(DAYS.includes(dayLabels[dayIndex]) ? dayLabels[dayIndex] : "Mon");

  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [profRes, annRes, matRes] = await Promise.all([
          apiGetMyTeacherProfile(), apiGetAnnouncements({ role: "teacher" }), apiGetMaterials(),
        ]);
        const prof = profRes.data;
        setProfile(prof);
        setAnnouncements(annRes.data || []);
        setMaterials(matRes.data || []);
        const ttRes = await apiGetTeacherTimetable(prof._id);
        setTimetable(ttRes.data || []);
        const sects = prof.assignedSections || [];
        const pairs = [...new Map(sects.map(s => [`${s.classId}|${s.section}`, { classId: s.classId, section: s.section }])).values()];
        let all = [];
        for (const { classId, section } of pairs) {
          try { const r = await apiGetStudents({ classId, section }); all = [...all, ...(r.data || [])]; } catch (_) {}
        }
        setStudents(all);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    load();
  }, []);

  const sections = profile?.assignedSections || [];
  const classSectionGroups = {};
  sections.forEach(s => {
    const key = `${s.classId}-${s.section}`;
    if (!classSectionGroups[key]) classSectionGroups[key] = { classId: s.classId, section: s.section, subjects: [] };
    classSectionGroups[key].subjects.push(s.subject);
  });
  const dayMap = { Mon:"Monday", Tue:"Tuesday", Wed:"Wednesday", Thu:"Thursday", Fri:"Friday" };
  const todaySchedule = timetable.filter(t => t.day === dayMap[activeDay]);
  const initials = user?.name
    ? user.name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s*/i,"").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()
    : "T";

  const statCards = [
    { label: "Total Students", value: students.length,      icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75", c: "var(--forest-dark)", bg: "var(--forest-light)", b: "var(--mint)" },
    { label: "Classes Today",  value: todaySchedule.length, icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",                                                                                   c: "var(--sky-dark)",   bg: "var(--sky-light)",   b: "var(--sky)"  },
    { label: "Materials",      value: materials.length,     icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z",                                     c: "var(--olive-dark)", bg: "var(--olive-light)", b: "var(--olive)"},
    { label: "My Sections",    value: sections.length,      icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",                                                          c: "var(--plum-dark)",  bg: "var(--plum-light)",  b: "var(--plum)" },
  ];

  return (
    <div className="app-layout">
      <TeacherNavbar />
      <main className="main-content">

        <div className="topbar">
          <div className="topbar-greeting">
            Hello, <span style={{color:"var(--plum)"}}>{user?.name?.split(" ").slice(-1)[0] || "Teacher"}</span>!
            {profile && <span style={{color:"var(--text-muted)",fontWeight:600,fontSize:"14px",marginLeft:"10px"}}>ID: {profile.teacherId}</span>}
          </div>
          <div className="topbar-date">
            <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={15} color="var(--plum)" />
            {dateStr}
          </div>
        </div>

        {/* Hero — plum/slate gradient from T-hero CSS class */}
        <div className="T-hero">
          <div className="hero-text" style={{position:"relative",zIndex:1}}>
            <h2>Welcome, {user?.name || "Teacher"}!</h2>
            <p>{loading ? "Loading your schedule…" : `${todaySchedule.length} class${todaySchedule.length!==1?"es":""} scheduled today.`}</p>
            <button className="hero-btn" onClick={() => navigate("/teacher/attendance")}>Mark Today's Attendance</button>
          </div>
          <svg width="86" height="86" viewBox="0 0 86 86" fill="none" style={{position:"relative",zIndex:1}}>
            <circle cx="43" cy="43" r="43" fill="rgba(255,255,255,0.08)"/>
            <rect x="18" y="26" width="50" height="36" rx="3" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8"/>
            <path d="M18 34h50" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
            <rect x="26" y="40" width="8" height="6" rx="1.5" fill="rgba(255,255,255,0.3)"/>
            <rect x="39" y="40" width="8" height="6" rx="1.5" fill="rgba(255,255,255,0.3)"/>
            <rect x="52" y="40" width="8" height="6" rx="1.5" fill="rgba(255,255,255,0.3)"/>
          </svg>
        </div>

        {/* Stats */}
        <div className="stat-mini-row">
          {statCards.map((s,i) => (
            <div key={i} className="stat-mini" style={{borderLeft:`3px solid ${s.b}`}}>
              <div className="stat-mini-icon" style={{background:s.bg}}>
                <Icon d={s.icon} size={20} color={s.c} />
              </div>
              <div>
                <div className="stat-mini-label">{s.label}</div>
                <div className="stat-mini-value" style={{color:s.c}}>{loading ? "…" : s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Row 1: Schedule + Announcements */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"18px",marginBottom:"18px"}}>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon icon-purple"><Icon d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" size={15} color="var(--plum-dark)"/></div>
                Today's Schedule
              </div>
              <span className="card-link" onClick={() => navigate("/teacher/timetable")}>Full Timetable</span>
            </div>
            <div style={{display:"flex",gap:"6px",marginBottom:"12px",flexWrap:"wrap"}}>
              {DAYS.map(d => (
                <button key={d} onClick={() => setActiveDay(d)} style={{padding:"5px 13px",borderRadius:"var(--radius-sm)",border:"1.5px solid",borderColor:activeDay===d?"var(--plum-dark)":"var(--border)",background:activeDay===d?"var(--plum)":"var(--bg-card)",color:activeDay===d?"#fff":"var(--text-secondary)",fontWeight:700,fontSize:"12px",cursor:"pointer",fontFamily:"inherit"}}>{d}</button>
              ))}
            </div>
            {loading ? <div style={{textAlign:"center",padding:"28px",color:"var(--text-muted)",fontSize:"13px"}}>Loading…</div>
            : todaySchedule.length === 0 ? <div style={{textAlign:"center",padding:"24px 16px",color:"var(--text-muted)",fontSize:"13px",background:"var(--bg-page)",borderRadius:"var(--radius-sm)",border:"1.5px dashed var(--border)"}}>No classes on {dayMap[activeDay]}</div>
            : <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                {todaySchedule.map((item,i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 12px",borderRadius:"var(--radius-sm)",background:"var(--plum-light)",border:"1.5px solid var(--plum)",borderLeft:"3px solid var(--plum-dark)"}}>
                    <div style={{padding:"4px 10px",borderRadius:"var(--radius-sm)",background:"var(--plum)",color:"#fff",fontSize:"11px",fontWeight:800,flexShrink:0}}>{item.period}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:"13px",fontWeight:800,color:"var(--text-primary)"}}>{item.subject}</div>
                      <div style={{fontSize:"11px",color:"var(--text-muted)",fontWeight:600}}>Class {item.classId}{item.section} · {item.room||"—"}</div>
                    </div>
                  </div>
                ))}
              </div>}
          </div>

          <div className="card card-alt">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon icon-teal"><Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={15} color="var(--teal-dark)"/></div>
                Announcements
              </div>
              <span className="card-link" onClick={() => navigate("/teacher/announcements")}>See All</span>
            </div>
            {loading ? <div style={{color:"var(--text-muted)",fontSize:"13px",padding:"20px 0",textAlign:"center"}}>Loading…</div>
            : announcements.length === 0 ? <div style={{color:"var(--text-muted)",fontSize:"13px",padding:"20px 0",textAlign:"center"}}>No announcements yet.</div>
            : announcements.slice(0,3).map((a,i) => {
                const ts = TAG_STYLES[a.tag] || TAG_STYLES.info;
                return (
                  <div key={i} style={{padding:"12px 0",borderBottom:i<2?"1px solid var(--teal)":"none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"5px"}}>
                      <span style={{padding:"2px 8px",borderRadius:"var(--radius-sm)",background:ts.bg,color:"#fff",fontSize:"10px",fontWeight:700,textTransform:"uppercase"}}>{ts.label}</span>
                      <span style={{fontSize:"11px",color:"var(--text-muted)",fontWeight:600,marginLeft:"auto"}}>{new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style={{fontSize:"13px",fontWeight:800,color:"var(--text-primary)",marginBottom:"3px"}}>{a.title}</div>
                    <div style={{fontSize:"12px",color:"var(--text-secondary)",lineHeight:1.5}}>{a.content}</div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Row 2: My Classes + Uploads */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"18px",marginBottom:"18px"}}>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon icon-green"><Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={15} color="var(--forest-dark)"/></div>
                My Classes
              </div>
              <span className="card-link" onClick={() => navigate("/teacher/students")}>All Students</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {loading ? <div style={{color:"var(--text-muted)",fontSize:"13px"}}>Loading…</div>
              : Object.keys(classSectionGroups).length === 0 ? <div style={{color:"var(--text-muted)",fontSize:"13px",padding:"20px 0",textAlign:"center"}}>No sections assigned yet.</div>
              : Object.values(classSectionGroups).map((grp,i) => {
                  const secStudents = students.filter(s => s.classId===grp.classId && s.section===grp.section);
                  const label = `${grp.classId}-${grp.section}`;
                  return (
                    <div key={i} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 12px",borderRadius:"var(--radius-sm)",background:"var(--forest-light)",border:"1.5px solid var(--mint)"}}>
                      <div style={{width:38,height:38,borderRadius:"var(--radius-sm)",background:"var(--forest-dark)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{fontSize:"10px",fontWeight:900,color:"#fff"}}>{label}</span>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:"13px",fontWeight:800,color:"var(--text-primary)"}}>Class {label}</div>
                        <div style={{fontSize:"11.5px",color:"var(--text-muted)",fontWeight:600}}>{secStudents.length} students · {grp.subjects.join(", ")}</div>
                      </div>
                      <div style={{display:"flex"}}>
                        {secStudents.slice(0,4).map((_,si) => (
                          <div key={si} style={{width:22,height:22,borderRadius:"50%",background:"var(--forest)",border:"2px solid var(--forest-light)",marginLeft:si>0?"-5px":0}}/>
                        ))}
                        {secStudents.length > 4 && <div style={{width:22,height:22,borderRadius:"50%",background:"var(--border)",border:"2px solid var(--forest-light)",marginLeft:"-5px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"8px",fontWeight:800,color:"var(--text-muted)"}}>+{secStudents.length-4}</div>}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon icon-yellow"><Icon d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" size={15} color="var(--olive-dark)"/></div>
                Recent Uploads
              </div>
              <span className="card-link" onClick={() => navigate("/teacher/materials")}>Upload New</span>
            </div>
            {loading ? <div style={{color:"var(--text-muted)",fontSize:"13px"}}>Loading…</div>
            : materials.length === 0 ? <div style={{color:"var(--text-muted)",fontSize:"13px",padding:"20px 0",textAlign:"center"}}>No materials uploaded yet.</div>
            : materials.slice(0,4).map((m,i) => {
                const tc={"PDF":"var(--red)","PPT":"var(--olive-dark)","DOCX":"var(--forest-dark)"}[m.fileType]||"var(--plum-dark)";
                const tbg={"PDF":"#fff0f0","PPT":"var(--olive-light)","DOCX":"var(--forest-light)"}[m.fileType]||"var(--plum-light)";
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 0",borderBottom:i<3?"1px solid var(--border)":"none"}}>
                    <div style={{width:36,height:36,borderRadius:"var(--radius-sm)",background:tbg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{fontSize:"9px",fontWeight:900,color:tc}}>{m.fileType||"FILE"}</span>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:"13px",fontWeight:700,color:"var(--text-primary)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.title}</div>
                      <div style={{fontSize:"11px",color:"var(--text-muted)",fontWeight:600}}>{m.classId}-{m.section} · {new Date(m.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Row 3: Profile + Calendar + Quick Actions */}
        <div className="dashboard-grid-three">

          <div className="profile-panel" style={{borderTop:"3px solid var(--plum)"}}>
            <div className="profile-avatar-wrap">
              <div className="profile-avatar" style={{background:"linear-gradient(135deg,var(--plum-dark),var(--plum))"}}>{initials}</div>
              <div className="profile-name">{user?.name||"Teacher"}</div>
              <div className="profile-class" style={{color:"var(--plum)"}}>{profile?.department||"—"}</div>
              <div className="profile-id-chip" style={{background:"var(--plum)",color:"#fff"}}>
                <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={12} color="#fff"/>
                ID: {profile?.teacherId||"—"}
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {[
                {label:"Email",    value: user?.email||profile?.email||"—"},
                {label:"Sections", value: sections.length ? [...new Set(sections.map(s=>`${s.classId}-${s.section}`))].join(", ") : "—"},
                {label:"Session",  value: "2025–2026"},
              ].map((item,i) => (
                <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:"12.5px",padding:"7px 0",borderBottom:"1px solid var(--border)"}}>
                  <span style={{color:"var(--text-muted)",fontWeight:600}}>{item.label}</span>
                  <span style={{fontWeight:700,color:"var(--text-primary)",maxWidth:"140px",textAlign:"right",wordBreak:"break-word"}}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon icon-teal"><Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={15} color="var(--teal-dark)"/></div>
                Calendar
              </div>
              <span className="card-link" onClick={() => navigate("/teacher/calendar")}>Events</span>
            </div>
            <MiniCalendar />
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon icon-purple"><Icon d="M13 10V3L4 14h7v7l9-11h-7z" size={15} color="var(--plum-dark)"/></div>
                Quick Actions
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"8px"}}>
              {[
                {label:"Mark Attendance", path:"/teacher/attendance",    icon:"M9 11l3 3L22 4",                                    c:"var(--forest-dark)", bg:"var(--forest-light)", b:"var(--mint)"},
                {label:"Enter Marks",     path:"/teacher/marks",         icon:"M14 2H6a2 2 0 0 0-2 2v16h16V8z",                    c:"var(--sky-dark)",    bg:"var(--sky-light)",    b:"var(--sky)"},
                {label:"Upload Material", path:"/teacher/materials",     icon:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12", c:"var(--olive-dark)",  bg:"var(--olive-light)",  b:"var(--olive)"},
                {label:"Announcements",   path:"/teacher/announcements", icon:"M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9",        c:"var(--teal-dark)",   bg:"var(--teal-light)",   b:"var(--teal)"},
                {label:"My Timetable",    path:"/teacher/timetable",     icon:"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01", c:"var(--plum-dark)",   bg:"var(--plum-light)",   b:"var(--plum)"},
                {label:"My Students",     path:"/teacher/students",      icon:"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",          c:"var(--mint-dark)",   bg:"var(--mint-light)",   b:"var(--mint)"},
              ].map((a,i) => (
                <button key={i} onClick={() => navigate(a.path)}
                  style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"7px",padding:"12px 6px",borderRadius:"var(--radius-sm)",border:`1.5px solid ${a.b}`,background:a.bg,cursor:"pointer",fontFamily:"inherit",transition:"transform 0.15s"}}
                  onMouseOver={e=>e.currentTarget.style.transform="translateY(-2px)"}
                  onMouseOut={e=>e.currentTarget.style.transform="none"}>
                  <div style={{width:32,height:32,borderRadius:"var(--radius-sm)",background:"rgba(255,255,255,0.7)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Icon d={a.icon} size={16} color={a.c}/>
                  </div>
                  <span style={{fontSize:"11px",fontWeight:700,color:a.c,textAlign:"center",lineHeight:1.3}}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default TeacherDashboard;