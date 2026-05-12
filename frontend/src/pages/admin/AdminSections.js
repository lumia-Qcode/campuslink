import React, { useState, useEffect, useCallback } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import { apiGetSections, apiCreateSection, apiDeleteSection, apiGetTeachers } from "../../services/api";

const CLASS_LEVELS = [
  {id:"playgroup",label:"Play Group"},{id:"nursery",label:"Nursery"},{id:"prenursery",label:"Pre-Nursery"},
  {id:"1",label:"Class 1"},{id:"2",label:"Class 2"},{id:"3",label:"Class 3"},{id:"4",label:"Class 4"},
  {id:"5",label:"Class 5"},{id:"6",label:"Class 6"},{id:"7",label:"Class 7"},{id:"8",label:"Class 8"},
  {id:"9",label:"Class 9"},{id:"X",label:"Class X"},
];
const SUBJECTS_MAP = {
  early:["English","Urdu","Mathematics","Arts & Crafts","Physical Education","Moral Studies"],
  primary:["English","Urdu","Mathematics","Science","Social Studies","Islamiyat"],
  secondary:["English","Urdu","Mathematics","Science","Social Studies","Islamiyat","Computer Science","Pakistan Studies"],
};
const getSubjectsForClass = (classId) => {
  if(["playgroup","nursery","prenursery"].includes(classId)) return SUBJECTS_MAP.early;
  if(["1","2","3","4","5","6"].includes(classId)) return SUBJECTS_MAP.primary;
  return SUBJECTS_MAP.secondary;
};
const getClassLabel = (id) => CLASS_LEVELS.find(c=>c.id===id)?.label||id;
const SECTIONS = ["A","B","C","D","E","F","G","H","I","J","K"];

const Icon = ({d,size=16,color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||"currentColor"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);

export default function AdminSections() {
  const [sections,setSections]   = useState([]);
  const [teachers,setTeachers]   = useState([]);
  const [loading,setLoading]     = useState(true);
  const [error,setError]         = useState("");
  const [showModal,setShowModal] = useState(false);
  const [filterClass,setFilterClass] = useState("all");
  const [search,setSearch]       = useState("");
  const [form,setForm]           = useState({classId:"X",section:"A",subject:"Mathematics",teacherId:""});
  const [errors,setErrors]       = useState({});
  const [successMsg,setSuccessMsg] = useState("");
  const [deleteConfirm,setDeleteConfirm] = useState(null);
  const [submitting,setSubmitting] = useState(false);

  const flash = (msg) => { setSuccessMsg(msg); setTimeout(()=>setSuccessMsg(""),4000); };

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [sRes,tRes] = await Promise.all([apiGetSections(),apiGetTeachers()]);
      setSections(sRes.data||[]);
      setTeachers(tRes.data||[]);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  },[]);

  useEffect(()=>{ load(); },[load]);

  const handleClassChange = (classId) => {
    const subs = getSubjectsForClass(classId);
    setForm(f=>({...f, classId, subject:subs[0]}));
  };

  const filtered = sections.filter(s => {
    const matchClass = filterClass==="all"||s.classId===filterClass;
    const teacher = teachers.find(t=>t._id===(s.teacherId?._id||s.teacherId));
    const matchSearch = (s.subject||"").toLowerCase().includes(search.toLowerCase())||
      getClassLabel(s.classId).toLowerCase().includes(search.toLowerCase())||
      (teacher?.name||"").toLowerCase().includes(search.toLowerCase());
    return matchClass&&matchSearch;
  });

  const getTeacherName = (teacherId) => {
    const id = teacherId?._id||teacherId;
    const t = teachers.find(t=>t._id===id||t._id?.toString()===id?.toString());
    return t?t.name:"Unassigned";
  };

  const validate = () => {
    const e = {};
    if(!form.teacherId) e.teacherId="Please assign a teacher";
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const handleAdd = async () => {
    if(!validate()) return;
    setSubmitting(true);
    try {
      await apiCreateSection(form);
      flash(`Section created: ${form.subject} · ${getClassLabel(form.classId)} — ${form.section}`);
      setShowModal(false);
      setForm({classId:"X",section:"A",subject:"Mathematics",teacherId:""});
      setErrors({});
      load();
    } catch(e){ setErrors({submit:e.message}); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try { await apiDeleteSection(id); flash("Section removed."); setDeleteConfirm(null); load(); }
    catch(e){ setError(e.message); }
  };

  const subjectsForForm = getSubjectsForClass(form.classId);

  return (
    <div className="app-layout">
      <AdminNavbar/>
      <main className="main-content">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:24,fontWeight:800}}>Sections</h1>
            <p style={{color:"var(--text-muted)",fontSize:13,marginTop:2}}>{sections.length} sections configured</p>
          </div>
          <button className="btn-primary" style={{width:"auto",padding:"12px 22px",background:"linear-gradient(135deg,#2db87b,#1e9e63)",display:"flex",alignItems:"center",gap:8}} onClick={()=>setShowModal(true)}>
            <Icon d="M12 5v14M5 12h14" size={15} color="#fff"/> Add Section
          </button>
        </div>

        {successMsg&&<div style={{background:"#e4f7ed",border:"1px solid #bbf7d0",borderRadius:10,padding:"12px 16px",marginBottom:16,color:"#15803d",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:8}}><Icon d="M9 11l3 3L22 4" size={15} color="#15803d"/>{successMsg}</div>}
        {error&&<div style={{background:"#fff5f5",border:"1px solid #fca5a5",borderRadius:10,padding:"12px 16px",marginBottom:16,color:"#dc2626",fontWeight:700,fontSize:13}}>{error}</div>}

        <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
          <div style={{position:"relative",flex:1,minWidth:200}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={15} color="var(--text-muted)"/></span>
            <input className="form-input" style={{paddingLeft:36}} placeholder="Search by subject, class, or teacher..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select className="teacher-form-select" value={filterClass} onChange={e=>setFilterClass(e.target.value)}>
            <option value="all">All Classes</option>
            {CLASS_LEVELS.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>

        <div className="card" style={{padding:0,overflow:"hidden"}}>
          {loading?(
            <div style={{textAlign:"center",padding:"40px 20px",color:"var(--text-muted)"}}>Loading sections…</div>
          ):(
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"var(--bg-main)",borderBottom:"2px solid var(--border)"}}>
                    {["Class","Section","Subject","Teacher","Actions"].map(h=>(
                      <th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:11.5,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.7px",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length===0?(
                    <tr><td colSpan={5} style={{textAlign:"center",padding:"40px 20px",color:"var(--text-muted)",fontSize:14}}>No sections found.</td></tr>
                  ):filtered.map(s=>(
                    <tr key={s._id} style={{borderBottom:"1px solid var(--border)",transition:"background 0.15s"}}
                      onMouseEnter={e=>e.currentTarget.style.background="var(--bg-main)"}
                      onMouseLeave={e=>e.currentTarget.style.background=""}>
                      <td style={{padding:"12px 16px"}}>
                        <span style={{background:"#f5f3ff",color:"#7c3aed",fontSize:12,fontWeight:700,padding:"4px 12px",borderRadius:20}}>{getClassLabel(s.classId)}</span>
                      </td>
                      <td style={{padding:"12px 16px",fontSize:14,fontWeight:800,color:"var(--text-primary)"}}>Section {s.section}</td>
                      <td style={{padding:"12px 16px",fontSize:13,fontWeight:600,color:"var(--text-primary)"}}>{s.subject}</td>
                      <td style={{padding:"12px 16px",fontSize:13,color:"var(--text-secondary)"}}>{getTeacherName(s.teacherId)}</td>
                      <td style={{padding:"12px 16px"}}>
                        <button onClick={()=>setDeleteConfirm(s._id)} style={{background:"#fff5f5",color:"#dc2626",border:"1.5px solid #fca5a5",borderRadius:8,padding:"6px 12px",fontWeight:700,fontSize:12,cursor:"pointer"}}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ADD SECTION MODAL */}
        {showModal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:480,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
              <div style={{padding:"24px 28px 20px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:800}}>Create New Section</div>
                <button onClick={()=>{setShowModal(false);setErrors({});}} style={{background:"var(--bg-main)",border:"none",borderRadius:8,padding:8,cursor:"pointer"}}><Icon d="M18 6L6 18M6 6l12 12" size={16}/></button>
              </div>
              <div style={{padding:"20px 28px"}}>
                <div style={{background:"#f0fdf4",borderRadius:12,padding:"12px 16px",marginBottom:18,border:"1px solid #bbf7d0"}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#15803d"}}>Section = Class + Subject + Teacher assignment</div>
                  <div style={{fontSize:12,color:"#16a34a",marginTop:2}}>Each class can have multiple sections per subject.</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
                  <div className="form-group">
                    <label className="form-label">Class</label>
                    <select className="form-input" value={form.classId} onChange={e=>handleClassChange(e.target.value)}>
                      {CLASS_LEVELS.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section</label>
                    <select className="form-input" value={form.section} onChange={e=>setForm(f=>({...f,section:e.target.value}))}>
                      {SECTIONS.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select className="form-input" value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))}>
                    {subjectsForForm.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign Teacher *</label>
                  <select className={`form-input${errors.teacherId?" input-error":""}`} value={form.teacherId} onChange={e=>setForm(f=>({...f,teacherId:e.target.value}))}>
                    <option value="">— Select teacher —</option>
                    {teachers.map(t=><option key={t._id} value={t._id}>{t.name} ({t.department||""})</option>)}
                  </select>
                  {errors.teacherId&&<div style={{color:"#e53e3e",fontSize:11.5,marginTop:4,fontWeight:600}}>{errors.teacherId}</div>}
                </div>
                <div style={{background:"var(--bg-main)",borderRadius:10,padding:"10px 14px"}}>
                  <div style={{fontSize:12,color:"var(--text-muted)",fontWeight:700}}>Preview</div>
                  <div style={{fontSize:13.5,fontWeight:800,color:"var(--text-primary)",marginTop:3}}>
                    {form.subject} · {getClassLabel(form.classId)} — Section {form.section}
                  </div>
                </div>
                {errors.submit&&<div style={{color:"#e53e3e",fontSize:12.5,marginTop:8,fontWeight:600}}>{errors.submit}</div>}
              </div>
              <div style={{padding:"16px 28px",borderTop:"1px solid var(--border)",display:"flex",gap:12}}>
                <button onClick={()=>{setShowModal(false);setErrors({});}} style={{flex:1,padding:"11px",borderRadius:10,border:"1.5px solid var(--border)",background:"#fff",color:"var(--text-secondary)",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                <button onClick={handleAdd} disabled={submitting} className="btn-primary" style={{flex:1,background:"linear-gradient(135deg,#2db87b,#1e9e63)",opacity:submitting?0.7:1}}>{submitting?"Saving…":"✓ Create Section"}</button>
              </div>
            </div>
          </div>
        )}

        {deleteConfirm&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{background:"#fff",borderRadius:16,padding:"28px 32px",maxWidth:380,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
              <div style={{fontFamily:"var(--font-display)",fontSize:17,fontWeight:800,marginBottom:8}}>Remove Section?</div>
              <div style={{color:"var(--text-secondary)",fontSize:13.5,marginBottom:22}}>This will remove the section configuration.</div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setDeleteConfirm(null)} style={{flex:1,padding:"11px",borderRadius:10,border:"1.5px solid var(--border)",background:"#fff",color:"var(--text-secondary)",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                <button onClick={()=>handleDelete(deleteConfirm)} style={{flex:1,padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#ff5c5c,#dc2626)",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Remove</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
