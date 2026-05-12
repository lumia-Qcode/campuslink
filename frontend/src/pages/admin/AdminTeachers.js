import React, { useState, useEffect, useCallback } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import {
  apiGetTeachers, apiCreateTeacher, apiDeleteTeacher,
  apiGetSections, apiCreateSection,
} from "../../services/api";

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
const getSubjects = (classId) => {
  if(["playgroup","nursery","prenursery"].includes(classId)) return SUBJECTS_MAP.early;
  if(["1","2","3","4","5","6"].includes(classId)) return SUBJECTS_MAP.primary;
  return SUBJECTS_MAP.secondary;
};
const getClassLabel = (id) => CLASS_LEVELS.find(c=>c.id===id)?.label||id;
const SECTIONS = ["A","B","C","D","E","F","G","H","I","J","K"];
const DEPARTMENTS = ["Mathematics","Languages","Science","Social Studies","Islamiyat","Computer Science","Early Education","Physical Education","Arts"];

const Icon = ({d,size=16,color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||"currentColor"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);

const EMPTY_FORM = { name:"",email:"",cnic:"",dob:"",gender:"Female",phone:"",address:"",qualification:"",department:"",joinDate:"",username:"",password:"" };

export default function AdminTeachers() {
  const [teachers,setTeachers]   = useState([]);
  const [sections,setSections]   = useState([]);
  const [loading,setLoading]     = useState(true);
  const [error,setError]         = useState("");
  const [showModal,setShowModal] = useState(false);
  const [form,setForm]           = useState(EMPTY_FORM);
  const [step,setStep]           = useState(1);
  const [search,setSearch]       = useState("");
  const [viewTeacher,setViewTeacher] = useState(null);
  const [showAssign,setShowAssign]   = useState(null);
  const [assignClass,setAssignClass] = useState("X");
  const [assignSection,setAssignSection] = useState("A");
  const [assignSubject,setAssignSubject] = useState("Mathematics");
  const [errors,setErrors]       = useState({});
  const [successMsg,setSuccessMsg] = useState("");
  const [deleteConfirm,setDeleteConfirm] = useState(null);
  const [submitting,setSubmitting] = useState(false);
  const [newCreds,setNewCreds]   = useState(null);

  const flash = (msg) => { setSuccessMsg(msg); setTimeout(()=>setSuccessMsg(""),4000); };

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [tRes,sRes] = await Promise.all([apiGetTeachers(),apiGetSections()]);
      setTeachers(tRes.data||[]);
      setSections(sRes.data||[]);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  },[]);

  useEffect(()=>{ load(); },[load]);

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.email||"").toLowerCase().includes(search.toLowerCase()) ||
    (t.department||"").toLowerCase().includes(search.toLowerCase())
  );

  const validate = () => {
    const e = {};
    if(step===1){
      if(!form.name.trim()) e.name="Name is required";
      if(!form.cnic.trim()) e.cnic="CNIC is required";
    }
    if(step===2){
      if(!form.qualification.trim()) e.qualification="Qualification is required";
      if(!form.department) e.department="Department is required";
    }
    if(step===3){
      if(!form.username.trim()) e.username="Username is required";
      if(!form.password.trim()) e.password="Password is required";
      else if(form.password.length<6) e.password="Min 6 characters";
    }
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const handleSubmit = async () => {
    if(!validate()) return;
    setSubmitting(true);
    try {
      await apiCreateTeacher(form);
      setNewCreds({username:form.username,password:form.password,name:form.name});
      flash(`Teacher "${form.name}" added successfully.`);
      setShowModal(false); setForm(EMPTY_FORM); setStep(1); setErrors({});
      load();
    } catch(e){ setErrors({submit:e.message}); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    const t = teachers.find(t=>t._id===id);
    try { await apiDeleteTeacher(id); flash(`Teacher "${t?.name}" removed.`); setDeleteConfirm(null); setViewTeacher(null); load(); }
    catch(e){ setError(e.message); }
  };

  const handleAssignSection = async () => {
    try {
      await apiCreateSection({ classId:assignClass, section:assignSection, subject:assignSubject, teacherId:showAssign._id });
      flash(`${showAssign.name} assigned to ${getClassLabel(assignClass)} — Section ${assignSection} (${assignSubject})`);
      setShowAssign(null); load();
    } catch(e){ flash("Error: "+e.message); setShowAssign(null); }
  };

  const getSectionsForTeacher = (t) => sections.filter(s => {
    const tid = s.teacherId?._id||s.teacherId;
    return tid===t._id||tid===t._id?.toString();
  });

  const inp = (label,key,type="text",opts={}) => (
    <div className="form-group">
      <label className="form-label">{label}{opts.required!==false&&" *"}</label>
      <input className={`form-input${errors[key]?" input-error":""}`} type={type}
        placeholder={opts.placeholder||`Enter ${label.toLowerCase()}`}
        value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}/>
      {errors[key]&&<div style={{color:"#e53e3e",fontSize:11.5,marginTop:4,fontWeight:600}}>{errors[key]}</div>}
    </div>
  );
  const sel = (label,key,options) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select className="form-input" value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}>
        {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
      </select>
    </div>
  );
  const STEPS = ["Personal Info","Professional Info","Login Credentials"];

  return (
    <div className="app-layout">
      <AdminNavbar/>
      <main className="main-content">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:24,fontWeight:800}}>Teachers</h1>
            <p style={{color:"var(--text-muted)",fontSize:13,marginTop:2}}>{teachers.length} staff members</p>
          </div>
          <button className="btn-primary" style={{width:"auto",padding:"12px 22px",background:"linear-gradient(135deg,#4f8ef7,#2563eb)",display:"flex",alignItems:"center",gap:8}} onClick={()=>setShowModal(true)}>
            <Icon d="M12 5v14M5 12h14" size={15} color="#fff"/> Add Teacher
          </button>
        </div>

        {successMsg&&<div style={{background:"#e4f7ed",border:"1px solid #bbf7d0",borderRadius:10,padding:"12px 16px",marginBottom:16,color:"#15803d",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:8}}><Icon d="M9 11l3 3L22 4" size={15} color="#15803d"/>{successMsg}</div>}
        {error&&<div style={{background:"#fff5f5",border:"1px solid #fca5a5",borderRadius:10,padding:"12px 16px",marginBottom:16,color:"#dc2626",fontWeight:700,fontSize:13}}>{error}</div>}

        {newCreds&&(
          <div style={{background:"#f0f9ff",border:"1px solid #7dd3fc",borderRadius:12,padding:"16px 20px",marginBottom:18}}>
            <div style={{fontWeight:800,fontSize:14,color:"#0369a1",marginBottom:8}}>✅ Teacher Created — Share login credentials with {newCreds.name}</div>
            <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
              <div><span style={{fontSize:12,color:"#0369a1",fontWeight:600}}>Username: </span><strong>{newCreds.username}</strong></div>
              <div><span style={{fontSize:12,color:"#0369a1",fontWeight:600}}>Password: </span><strong>{newCreds.password}</strong></div>
            </div>
            <button onClick={()=>setNewCreds(null)} style={{marginTop:8,fontSize:11.5,color:"#64748b",background:"none",border:"none",cursor:"pointer"}}>Dismiss</button>
          </div>
        )}

        <div style={{position:"relative",marginBottom:20}}>
          <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={15} color="var(--text-muted)"/></span>
          <input className="form-input" style={{paddingLeft:40}} placeholder="Search teachers by name, email, or department..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>

        {loading?(
          <div style={{textAlign:"center",padding:"40px 20px",color:"var(--text-muted)"}}>Loading teachers…</div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:16}}>
            {filtered.map(t=>{
              const tSections=getSectionsForTeacher(t);
              return(
                <div key={t._id} className="card" style={{padding:"20px",display:"flex",flexDirection:"column",gap:14}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                    <div style={{width:46,height:46,borderRadius:"50%",flexShrink:0,background:t.gender==="Female"?"#fdf4ff":"#eff6ff",color:t.gender==="Female"?"#a855f7":"#3b82f6",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16}}>
                      {t.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:800,fontSize:14.5,color:"var(--text-primary)"}}>{t.name}</div>
                      <div style={{fontSize:12,color:"var(--text-muted)"}}>{t.email||`@${t.username}`}</div>
                      <div style={{marginTop:4}}><span style={{background:"#e8f0ff",color:"#1d4ed8",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20}}>{t.department||"—"}</span></div>
                    </div>
                    <div style={{fontSize:11,fontWeight:700,color:"var(--text-muted)"}}>{t.teacherId}</div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,background:"var(--bg-main)",borderRadius:10,padding:"10px 12px"}}>
                    <div><div style={{fontSize:10.5,color:"var(--text-muted)",fontWeight:600}}>Qualification</div><div style={{fontSize:12.5,fontWeight:700,color:"var(--text-primary)"}}>{t.qualification||"—"}</div></div>
                    <div><div style={{fontSize:10.5,color:"var(--text-muted)",fontWeight:600}}>Joined</div><div style={{fontSize:12.5,fontWeight:700,color:"var(--text-primary)"}}>{t.joinDate?new Date(t.joinDate).toLocaleDateString("en-PK"):"—"}</div></div>
                  </div>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6}}>Assigned Sections ({tSections.length})</div>
                    {tSections.length===0
                      ?<div style={{fontSize:12,color:"var(--text-muted)",fontStyle:"italic"}}>No sections assigned yet</div>
                      :<div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                        {tSections.map(s=>(
                          <span key={s._id} style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:"#e4f7ed",color:"#15803d"}}>
                            {s.subject} · {getClassLabel(s.classId)} {s.section}
                          </span>
                        ))}
                      </div>
                    }
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:"auto"}}>
                    <button onClick={()=>setViewTeacher(t)} style={{flex:1,padding:"8px",borderRadius:8,border:"1.5px solid var(--border)",background:"#fff",color:"var(--text-secondary)",fontWeight:700,fontSize:12.5,cursor:"pointer",fontFamily:"inherit"}}>View Profile</button>
                    <button onClick={()=>{setShowAssign(t);setAssignClass("X");setAssignSection("A");setAssignSubject("Mathematics");}}
                      style={{flex:1,padding:"8px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#4f8ef7,#2563eb)",color:"#fff",fontWeight:700,fontSize:12.5,cursor:"pointer",fontFamily:"inherit"}}>Assign Section</button>
                    <button onClick={()=>setDeleteConfirm(t._id)} style={{padding:"8px 10px",borderRadius:8,border:"1.5px solid #fca5a5",background:"#fff5f5",color:"#dc2626",fontWeight:700,fontSize:12.5,cursor:"pointer",fontFamily:"inherit"}}>
                      <Icon d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" size={13} color="#dc2626"/>
                    </button>
                  </div>
                </div>
              );
            })}
            {!loading&&filtered.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:"40px 20px",color:"var(--text-muted)"}}>No teachers found.</div>}
          </div>
        )}

        {/* ADD TEACHER MODAL */}
        {showModal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:560,maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
              <div style={{padding:"24px 28px 20px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:800}}>Add New Teacher</div>
                  <div style={{fontSize:12.5,color:"var(--text-muted)",marginTop:2}}>Step {step} of 3 — {STEPS[step-1]}</div>
                </div>
                <button onClick={()=>{setShowModal(false);setForm(EMPTY_FORM);setStep(1);setErrors({});}} style={{background:"var(--bg-main)",border:"none",borderRadius:8,padding:8,cursor:"pointer"}}><Icon d="M18 6L6 18M6 6l12 12" size={16}/></button>
              </div>
              <div style={{display:"flex",gap:6,padding:"14px 28px 0"}}>
                {[1,2,3].map(s=><div key={s} style={{flex:1,height:4,borderRadius:2,background:s<=step?"#4f8ef7":"var(--border)"}}/>)}
              </div>
              <div style={{padding:"20px 28px",overflowY:"auto",flex:1}}>
                {step===1&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
                    {inp("Full Name","name")}{inp("Email Address","email","email",{required:false})}
                    {inp("CNIC No.","cnic")}{inp("Date of Birth","dob","date",{required:false})}
                    {inp("Phone Number","phone","tel",{required:false})}{sel("Gender","gender",["Male","Female"])}
                    <div className="form-group" style={{gridColumn:"1/-1"}}><label className="form-label">Home Address</label><input className="form-input" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))}/></div>
                  </div>
                )}
                {step===2&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
                    {inp("Qualification","qualification")}
                    <div className="form-group">
                      <label className="form-label">Department *</label>
                      <select className={`form-input${errors.department?" input-error":""}`} value={form.department} onChange={e=>setForm(f=>({...f,department:e.target.value}))}>
                        <option value="">Select department</option>
                        {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
                      </select>
                      {errors.department&&<div style={{color:"#e53e3e",fontSize:11.5,marginTop:4,fontWeight:600}}>{errors.department}</div>}
                    </div>
                    {inp("Join Date","joinDate","date",{required:false})}
                  </div>
                )}
                {step===3&&(
                  <div>
                    <div style={{background:"#e8f0ff",borderRadius:12,padding:"14px 16px",marginBottom:20,border:"1px solid #bfdbfe"}}>
                      <div style={{fontWeight:700,fontSize:13,color:"#1d4ed8"}}>Set Login Credentials</div>
                      <div style={{fontSize:12,color:"#3b82f6",marginTop:3}}>The teacher will use these to log in to their portal.</div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
                      {inp("Username","username")}{inp("Password","password","text")}
                    </div>
                    {errors.submit&&<div style={{color:"#e53e3e",fontSize:12.5,marginTop:8,fontWeight:600}}>{errors.submit}</div>}
                  </div>
                )}
              </div>
              <div style={{padding:"16px 28px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"space-between",gap:12}}>
                <button onClick={step===1?()=>{setShowModal(false);setForm(EMPTY_FORM);setStep(1);setErrors({});}:()=>setStep(s=>s-1)}
                  style={{padding:"11px 22px",borderRadius:10,border:"1.5px solid var(--border)",background:"#fff",color:"var(--text-secondary)",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
                  {step===1?"Cancel":"← Back"}
                </button>
                {step<3
                  ?<button onClick={()=>{if(validate())setStep(s=>s+1);}} className="btn-primary" style={{width:"auto",padding:"11px 28px",background:"linear-gradient(135deg,#4f8ef7,#2563eb)"}}>Continue →</button>
                  :<button onClick={handleSubmit} disabled={submitting} className="btn-primary" style={{width:"auto",padding:"11px 28px",background:"linear-gradient(135deg,#2db87b,#1e9e63)",opacity:submitting?0.7:1}}>{submitting?"Saving…":"✓ Add Teacher"}</button>
                }
              </div>
            </div>
          </div>
        )}

        {/* ASSIGN SECTION MODAL */}
        {showAssign&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:440,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
              <div style={{padding:"24px 28px 20px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:800}}>Assign Section</div>
                <button onClick={()=>setShowAssign(null)} style={{background:"var(--bg-main)",border:"none",borderRadius:8,padding:8,cursor:"pointer"}}><Icon d="M18 6L6 18M6 6l12 12" size={16}/></button>
              </div>
              <div style={{padding:"20px 28px"}}>
                <div style={{background:"#e8f0ff",borderRadius:10,padding:"12px 14px",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:"#bfdbfe",color:"#1d4ed8",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800}}>{showAssign.name.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                  <div><div style={{fontWeight:700,fontSize:13}}>{showAssign.name}</div><div style={{fontSize:11.5,color:"var(--text-muted)"}}>{showAssign.department}</div></div>
                </div>
                <div className="form-group">
                  <label className="form-label">Class</label>
                  <select className="form-input" value={assignClass} onChange={e=>{setAssignClass(e.target.value);setAssignSubject(getSubjects(e.target.value)[0]);}}>
                    {CLASS_LEVELS.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
                  <div className="form-group">
                    <label className="form-label">Section</label>
                    <select className="form-input" value={assignSection} onChange={e=>setAssignSection(e.target.value)}>
                      {SECTIONS.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <select className="form-input" value={assignSubject} onChange={e=>setAssignSubject(e.target.value)}>
                      {getSubjects(assignClass).map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{background:"var(--bg-main)",borderRadius:10,padding:"10px 14px",marginTop:4}}>
                  <div style={{fontSize:12,color:"var(--text-muted)",fontWeight:700}}>Assignment Preview</div>
                  <div style={{fontSize:13.5,fontWeight:800,color:"var(--text-primary)",marginTop:3}}>{assignSubject} · {getClassLabel(assignClass)} — Section {assignSection}</div>
                </div>
              </div>
              <div style={{padding:"16px 28px",borderTop:"1px solid var(--border)",display:"flex",gap:12}}>
                <button onClick={()=>setShowAssign(null)} style={{flex:1,padding:"11px",borderRadius:10,border:"1.5px solid var(--border)",background:"#fff",color:"var(--text-secondary)",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                <button onClick={handleAssignSection} className="btn-primary" style={{flex:1,background:"linear-gradient(135deg,#4f8ef7,#2563eb)"}}>Assign</button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW TEACHER */}
        {viewTeacher&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:500,maxHeight:"90vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
              <div style={{padding:"24px 28px 20px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:800}}>Teacher Profile</div>
                <button onClick={()=>setViewTeacher(null)} style={{background:"var(--bg-main)",border:"none",borderRadius:8,padding:8,cursor:"pointer"}}><Icon d="M18 6L6 18M6 6l12 12" size={16}/></button>
              </div>
              <div style={{padding:"20px 28px"}}>
                <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:22}}>
                  <div style={{width:60,height:60,borderRadius:"50%",background:"#eff6ff",color:"#3b82f6",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:20}}>{viewTeacher.name.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                  <div>
                    <div style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:800}}>{viewTeacher.name}</div>
                    <div style={{color:"var(--text-muted)",fontSize:13}}>{viewTeacher.teacherId} · @{viewTeacher.username}</div>
                    <span style={{background:"#e8f0ff",color:"#1d4ed8",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20}}>{viewTeacher.department}</span>
                  </div>
                </div>
                {[
                  {title:"Personal Info",fields:[["CNIC","cnic"],["Gender","gender"],["Phone","phone"],["Address","address"]]},
                  {title:"Professional Info",fields:[["Qualification","qualification"],["Department","department"],["Join Date","joinDate"]]},
                ].map(sec=>(
                  <div key={sec.title} style={{marginBottom:20}}>
                    <div style={{fontSize:11.5,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:10}}>{sec.title}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 0"}}>
                      {sec.fields.map(([label,key])=>(
                        <div key={label}><div style={{fontSize:11,color:"var(--text-muted)",fontWeight:600}}>{label}</div><div style={{fontSize:13,fontWeight:700}}>{viewTeacher[key]||"—"}</div></div>
                      ))}
                    </div>
                  </div>
                ))}
                <div>
                  <div style={{fontSize:11.5,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:10}}>Assigned Sections</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {getSectionsForTeacher(viewTeacher).length===0
                      ?<div style={{fontSize:12.5,color:"var(--text-muted)",fontStyle:"italic"}}>No sections assigned</div>
                      :getSectionsForTeacher(viewTeacher).map(s=>(
                        <span key={s._id} style={{background:"#e4f7ed",color:"#15803d",fontSize:12,fontWeight:700,padding:"4px 12px",borderRadius:20}}>{s.subject} · {getClassLabel(s.classId)} {s.section}</span>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {deleteConfirm&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{background:"#fff",borderRadius:16,padding:"28px 32px",maxWidth:380,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
              <div style={{fontFamily:"var(--font-display)",fontSize:17,fontWeight:800,marginBottom:8}}>Remove Teacher?</div>
              <div style={{color:"var(--text-secondary)",fontSize:13.5,marginBottom:22}}>This will permanently remove the teacher record and their login account.</div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setDeleteConfirm(null)} style={{flex:1,padding:"11px",borderRadius:10,border:"1.5px solid var(--border)",background:"#fff",color:"var(--text-secondary)",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                <button onClick={()=>handleDelete(deleteConfirm)} style={{flex:1,padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#ff5c5c,#dc2626)",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
