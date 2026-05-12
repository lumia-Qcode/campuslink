import React, { useState, useEffect, useCallback } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import {
  apiGetStudents, apiCreateStudent, apiUpdateStudent, apiDeleteStudent,
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
const SECTIONS = ["A","B","C","D","E","F","G","H","I","J","K"];
const getClassLabel = (id) => CLASS_LEVELS.find(c => c.id === id)?.label || id;
const Icon = ({ d, size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color || "currentColor"} strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const feeColor = (s) =>
  s === "Paid"    ? { bg: "#e4f7ed", color: "#15803d" } :
  s === "Pending" ? { bg: "#fffbeb", color: "#b45309" } :
                    { bg: "#fff5f5", color: "#dc2626" };

const EMPTY_FORM = {
  name:"",email:"",cnic:"",dob:"",gender:"Male",phone:"",address:"",
  fatherName:"",fatherCnic:"",fatherPhone:"",fatherOccupation:"",
  motherName:"",motherPhone:"",classId:"X",section:"A",rollNo:"",
  username:"",password:"",
};

export default function AdminStudents() {
  const [students,setStudents]   = useState([]);
  const [loading,setLoading]     = useState(true);
  const [error,setError]         = useState("");
  const [showModal,setShowModal] = useState(false);
  const [form,setForm]           = useState(EMPTY_FORM);
  const [step,setStep]           = useState(1);
  const [search,setSearch]       = useState("");
  const [filterClass,setFilterClass] = useState("all");
  const [viewStudent,setViewStudent] = useState(null);
  const [editStudent,setEditStudent] = useState(null);
  const [editForm,setEditForm]   = useState(null);
  const [editErrors,setEditErrors] = useState({});
  const [deleteConfirm,setDeleteConfirm] = useState(null);
  const [successMsg,setSuccessMsg] = useState("");
  const [submitting,setSubmitting] = useState(false);
  const [errors,setErrors]       = useState({});
  const [newCreds,setNewCreds]   = useState(null);

  const flash = (msg) => { setSuccessMsg(msg); setTimeout(()=>setSuccessMsg(""),4000); };

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = {};
      if (filterClass !== "all") params.classId = filterClass;
      if (search) params.search = search;
      const res = await apiGetStudents(params);
      setStudents(res.data || []);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, [filterClass, search]);

  useEffect(() => { load(); }, [load]);

  const validate = () => {
    const e = {};
    if (step===1) {
      if (!form.name.trim()) e.name="Name is required";
      if (!form.cnic.trim()) e.cnic="CNIC/B-Form is required";
      if (!form.dob) e.dob="Date of birth is required";
    }
    if (step===2) {
      if (!form.fatherName.trim()) e.fatherName="Father's name is required";
      if (!form.fatherPhone.trim()) e.fatherPhone="Father's phone is required";
    }
    if (step===3) { if (!form.rollNo) e.rollNo="Roll number is required"; }
    if (step===4) {
      if (!form.username.trim()) e.username="Username is required";
      if (!form.password.trim()) e.password="Password is required";
      else if (form.password.length<6) e.password="Password must be at least 6 characters";
    }
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await apiCreateStudent({ ...form, rollNo: parseInt(form.rollNo) });
      setNewCreds({ username: form.username, password: form.password, name: form.name });
      flash(`Student "${form.name}" added successfully.`);
      setShowModal(false); setForm(EMPTY_FORM); setStep(1); setErrors({});
      load();
    } catch(e) { setErrors({ submit: e.message }); }
    finally { setSubmitting(false); }
  };

  const handleEditSubmit = async () => {
    const e = {};
    if (!editForm.name.trim()) e.name="Name is required";
    setEditErrors(e);
    if (Object.keys(e).length>0) return;
    setSubmitting(true);
    try {
      await apiUpdateStudent(editStudent._id, editForm);
      flash(`Student "${editForm.name}" updated.`);
      setEditStudent(null); setEditForm(null); load();
    } catch(err) { setEditErrors({ submit: err.message }); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    const s = students.find(s=>s._id===id);
    try { await apiDeleteStudent(id); flash(`Student "${s?.name}" removed.`); setDeleteConfirm(null); setViewStudent(null); load(); }
    catch(e) { setError(e.message); }
  };

  const inp = (label,key,type="text",opts={}) => (
    <div className="form-group">
      <label className="form-label">{label}{opts.required!==false&&" *"}</label>
      <input className={`form-input${errors[key]?" input-error":""}`} type={type}
        placeholder={opts.placeholder||`Enter ${label.toLowerCase()}`}
        value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} />
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
  const STEPS = ["Personal Info","Parent Info","Class Assignment","Login Credentials"];

  return (
    <div className="app-layout">
      <AdminNavbar />
      <main className="main-content">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:24,fontWeight:800}}>Students</h1>
            <p style={{color:"var(--text-muted)",fontSize:13,marginTop:2}}>{students.length} students enrolled</p>
          </div>
          <button className="btn-primary" style={{width:"auto",padding:"12px 22px",background:"linear-gradient(135deg,#9b6dff,#7c3aed)",display:"flex",alignItems:"center",gap:8}}
            onClick={()=>setShowModal(true)}>
            <Icon d="M12 5v14M5 12h14" size={15} color="#fff"/> Add Student
          </button>
        </div>

        {successMsg&&<div style={{background:"#e4f7ed",border:"1px solid #bbf7d0",borderRadius:10,padding:"12px 16px",marginBottom:16,color:"#15803d",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:8}}><Icon d="M9 11l3 3L22 4" size={15} color="#15803d"/>{successMsg}</div>}
        {error&&<div style={{background:"#fff5f5",border:"1px solid #fca5a5",borderRadius:10,padding:"12px 16px",marginBottom:16,color:"#dc2626",fontWeight:700,fontSize:13}}>{error}</div>}

        {newCreds&&(
          <div style={{background:"#f0f9ff",border:"1px solid #7dd3fc",borderRadius:12,padding:"16px 20px",marginBottom:18}}>
            <div style={{fontWeight:800,fontSize:14,color:"#0369a1",marginBottom:8}}>✅ Student Created — Share login credentials with {newCreds.name}</div>
            <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
              <div><span style={{fontSize:12,color:"#0369a1",fontWeight:600}}>Username: </span><strong>{newCreds.username}</strong></div>
              <div><span style={{fontSize:12,color:"#0369a1",fontWeight:600}}>Password: </span><strong>{newCreds.password}</strong></div>
            </div>
            <button onClick={()=>setNewCreds(null)} style={{marginTop:8,fontSize:11.5,color:"#64748b",background:"none",border:"none",cursor:"pointer"}}>Dismiss</button>
          </div>
        )}

        <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
          <div style={{position:"relative",flex:1,minWidth:200}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={15} color="var(--text-muted)"/></span>
            <input className="form-input" style={{paddingLeft:36}} placeholder="Search by name, username, or ID..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select className="teacher-form-select" value={filterClass} onChange={e=>setFilterClass(e.target.value)}>
            <option value="all">All Classes</option>
            {CLASS_LEVELS.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>

        <div className="card" style={{padding:0,overflow:"hidden"}}>
          {loading?(
            <div style={{textAlign:"center",padding:"40px 20px",color:"var(--text-muted)"}}>Loading students…</div>
          ):(
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"var(--bg-main)",borderBottom:"2px solid var(--border)"}}>
                    {["Student ID","Name","Class & Section","Contact","Parent","Fee Status","Actions"].map(h=>(
                      <th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:11.5,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.7px",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.length===0?(
                    <tr><td colSpan={7} style={{textAlign:"center",padding:"40px 20px",color:"var(--text-muted)",fontSize:14}}>No students found.</td></tr>
                  ):students.map(s=>{
                    const fc=feeColor(s.feeStatus);
                    return(
                      <tr key={s._id} style={{borderBottom:"1px solid var(--border)",transition:"background 0.15s"}}
                        onMouseEnter={e=>e.currentTarget.style.background="var(--bg-main)"}
                        onMouseLeave={e=>e.currentTarget.style.background=""}>
                        <td style={{padding:"12px 16px",fontSize:12.5,color:"var(--text-muted)",fontWeight:700}}>{s.studentId}</td>
                        <td style={{padding:"12px 16px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <div style={{width:34,height:34,borderRadius:"50%",flexShrink:0,background:s.gender==="Female"?"#f5f3ff":"#e8f0ff",color:s.gender==="Female"?"#7c3aed":"#2563eb",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12}}>
                              {s.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                            </div>
                            <div>
                              <div style={{fontWeight:700,fontSize:13,color:"var(--text-primary)"}}>{s.name}</div>
                              <div style={{fontSize:11.5,color:"var(--text-muted)"}}>@{s.username}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{padding:"12px 16px"}}>
                          <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,background:"#f5f3ff",color:"#7c3aed",fontSize:12,fontWeight:700}}>{getClassLabel(s.classId)} — {s.section}</div>
                          <div style={{fontSize:11,color:"var(--text-muted)",marginTop:3,paddingLeft:2}}>Roll #{s.rollNo}</div>
                        </td>
                        <td style={{padding:"12px 16px",fontSize:12.5,color:"var(--text-secondary)"}}>{s.phone||"—"}</td>
                        <td style={{padding:"12px 16px"}}>
                          <div style={{fontSize:12.5,fontWeight:600,color:"var(--text-primary)"}}>{s.fatherName||"—"}</div>
                          <div style={{fontSize:11.5,color:"var(--text-muted)"}}>{s.fatherPhone||""}</div>
                        </td>
                        <td style={{padding:"12px 16px"}}>
                          <span style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:fc.bg,color:fc.color}}>{s.feeStatus||"Pending"}</span>
                        </td>
                        <td style={{padding:"12px 16px"}}>
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={()=>setViewStudent(s)} style={{background:"#f5f3ff",color:"#7c3aed",border:"none",borderRadius:8,padding:"6px 10px",fontWeight:700,fontSize:12,cursor:"pointer"}}>View</button>
                            <button onClick={()=>{setEditStudent(s);setEditForm({...s});setEditErrors({});}} style={{background:"#e8f0ff",color:"#2563eb",border:"none",borderRadius:8,padding:"6px 10px",fontWeight:700,fontSize:12,cursor:"pointer"}}>Edit</button>
                            <button onClick={()=>setDeleteConfirm(s._id)} style={{background:"#fff5f5",color:"#dc2626",border:"none",borderRadius:8,padding:"6px 10px",fontWeight:700,fontSize:12,cursor:"pointer"}}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ADD STUDENT MODAL */}
        {showModal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:580,maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
              <div style={{padding:"24px 28px 20px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:800}}>Add New Student</div>
                  <div style={{fontSize:12.5,color:"var(--text-muted)",marginTop:2}}>Step {step} of 4 — {STEPS[step-1]}</div>
                </div>
                <button onClick={()=>{setShowModal(false);setForm(EMPTY_FORM);setStep(1);setErrors({});}} style={{background:"var(--bg-main)",border:"none",borderRadius:8,padding:8,cursor:"pointer"}}><Icon d="M18 6L6 18M6 6l12 12" size={16}/></button>
              </div>
              <div style={{padding:"14px 28px 0",display:"flex",gap:6}}>
                {[1,2,3,4].map(s=><div key={s} style={{flex:1,height:4,borderRadius:2,background:s<=step?"#9b6dff":"var(--border)",transition:"all 0.3s"}}/>)}
              </div>
              <div style={{padding:"20px 28px",overflowY:"auto",flex:1}}>
                {step===1&&(
                  <div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
                      {inp("Full Name","name")}{inp("Email Address","email","email",{required:false})}
                      {inp("CNIC / B-Form No.","cnic")}{inp("Date of Birth","dob","date")}
                      {inp("Phone Number","phone","tel",{required:false})}{sel("Gender","gender",["Male","Female"])}
                    </div>
                    {inp("Home Address","address","text",{required:false})}
                  </div>
                )}
                {step===2&&(
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:14}}>Father's Information</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
                      {inp("Father's Name","fatherName")}{inp("Father's CNIC","fatherCnic","text",{required:false})}
                      {inp("Father's Phone","fatherPhone","tel")}{inp("Father's Occupation","fatherOccupation","text",{required:false})}
                    </div>
                    <div style={{fontSize:12,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.7px",margin:"16px 0 14px"}}>Mother's Information</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
                      {inp("Mother's Name","motherName","text",{required:false})}{inp("Mother's Phone","motherPhone","tel",{required:false})}
                    </div>
                  </div>
                )}
                {step===3&&(
                  <div>
                    <div style={{background:"#f5f3ff",borderRadius:12,padding:"14px 16px",marginBottom:20,border:"1px solid #e9d5ff"}}>
                      <div style={{fontWeight:700,fontSize:13,color:"#7c3aed"}}>Assign to Class & Section</div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 16px"}}>
                      {sel("Class","classId",CLASS_LEVELS.map(c=>({value:c.id,label:c.label})))}
                      {sel("Section","section",SECTIONS)}
                      {inp("Roll Number","rollNo","number")}
                    </div>
                    <div style={{background:"var(--bg-main)",borderRadius:10,padding:"12px 14px",marginTop:8}}>
                      <div style={{fontSize:12,color:"var(--text-muted)",fontWeight:700}}>Preview</div>
                      <div style={{fontSize:14,fontWeight:800,color:"var(--text-primary)",marginTop:4}}>
                        {form.name||"Student"} → {CLASS_LEVELS.find(c=>c.id===form.classId)?.label} — Section {form.section}{form.rollNo?`, Roll #${form.rollNo}`:""}
                      </div>
                    </div>
                  </div>
                )}
                {step===4&&(
                  <div>
                    <div style={{background:"#f0f9ff",borderRadius:12,padding:"14px 16px",marginBottom:20,border:"1px solid #7dd3fc"}}>
                      <div style={{fontWeight:700,fontSize:13,color:"#0369a1"}}>Set Login Credentials</div>
                      <div style={{fontSize:12,color:"#0ea5e9",marginTop:3}}>The student will use these to log in to their portal.</div>
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
                {step<4
                  ?<button onClick={()=>{if(validate())setStep(s=>s+1);}} className="btn-primary" style={{width:"auto",padding:"11px 28px",background:"linear-gradient(135deg,#9b6dff,#7c3aed)"}}>Continue →</button>
                  :<button onClick={handleSubmit} disabled={submitting} className="btn-primary" style={{width:"auto",padding:"11px 28px",background:"linear-gradient(135deg,#2db87b,#1e9e63)",opacity:submitting?0.7:1}}>
                    {submitting?"Saving…":"✓ Add Student"}
                  </button>
                }
              </div>
            </div>
          </div>
        )}

        {/* VIEW STUDENT */}
        {viewStudent&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:540,maxHeight:"90vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
              <div style={{padding:"24px 28px 20px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:800}}>Student Profile</div>
                <button onClick={()=>setViewStudent(null)} style={{background:"var(--bg-main)",border:"none",borderRadius:8,padding:8,cursor:"pointer"}}><Icon d="M18 6L6 18M6 6l12 12" size={16}/></button>
              </div>
              <div style={{padding:"20px 28px"}}>
                <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24}}>
                  <div style={{width:60,height:60,borderRadius:"50%",background:viewStudent.gender==="Female"?"#f5f3ff":"#e8f0ff",color:viewStudent.gender==="Female"?"#7c3aed":"#2563eb",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:20}}>
                    {viewStudent.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                  </div>
                  <div>
                    <div style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:800}}>{viewStudent.name}</div>
                    <div style={{color:"var(--text-muted)",fontSize:13}}>{viewStudent.studentId} · @{viewStudent.username}</div>
                    <span style={{fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:20,background:feeColor(viewStudent.feeStatus).bg,color:feeColor(viewStudent.feeStatus).color}}>Fee: {viewStudent.feeStatus||"Pending"}</span>
                  </div>
                </div>
                {[
                  {title:"Personal Info",fields:[["CNIC","cnic"],["Date of Birth","dob"],["Gender","gender"],["Phone","phone"],["Address","address"]]},
                  {title:"Class Info",fields:[["Class",null,getClassLabel(viewStudent.classId)],["Section","section"],["Roll Number","rollNo"],["Admission Date","admissionDate"]]},
                  {title:"Parent Info",fields:[["Father's Name","fatherName"],["Father's Phone","fatherPhone"],["Occupation","fatherOccupation"],["Mother's Name","motherName"],["Mother's Phone","motherPhone"]]},
                ].map(sec=>(
                  <div key={sec.title} style={{marginBottom:20}}>
                    <div style={{fontSize:11.5,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:10}}>{sec.title}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 0"}}>
                      {sec.fields.map(([label,key,override])=>(
                        <div key={label}>
                          <div style={{fontSize:11,color:"var(--text-muted)",fontWeight:600}}>{label}</div>
                          <div style={{fontSize:13,fontWeight:700,color:"var(--text-primary)"}}>{override||(key?viewStudent[key]||"—":"—")}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EDIT STUDENT */}
        {editStudent&&editForm&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:560,maxHeight:"90vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
              <div style={{padding:"24px 28px 20px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:800}}>Edit Student Record</div>
                <button onClick={()=>setEditStudent(null)} style={{background:"var(--bg-main)",border:"none",borderRadius:8,padding:8,cursor:"pointer"}}><Icon d="M18 6L6 18M6 6l12 12" size={16}/></button>
              </div>
              <div style={{padding:"20px 28px"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
                  {[["Full Name","name"],["Email","email"],["Phone","phone"],["Section","section"],["Father's Name","fatherName"],["Father's Phone","fatherPhone"]].map(([label,key])=>(
                    <div key={key} className="form-group">
                      <label className="form-label">{label}</label>
                      <input className="form-input" value={editForm[key]||""} onChange={e=>setEditForm(f=>({...f,[key]:e.target.value}))}/>
                    </div>
                  ))}
                  <div className="form-group">
                    <label className="form-label">Class</label>
                    <select className="form-input" value={editForm.classId} onChange={e=>setEditForm(f=>({...f,classId:e.target.value}))}>
                      {CLASS_LEVELS.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
                {editErrors.submit&&<div style={{color:"#e53e3e",fontSize:12.5,marginTop:8,fontWeight:600}}>{editErrors.submit}</div>}
              </div>
              <div style={{padding:"16px 28px",borderTop:"1px solid var(--border)",display:"flex",gap:12}}>
                <button onClick={()=>setEditStudent(null)} style={{flex:1,padding:"11px",borderRadius:10,border:"1.5px solid var(--border)",background:"#fff",color:"var(--text-secondary)",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                <button onClick={handleEditSubmit} disabled={submitting} className="btn-primary" style={{flex:1,background:"linear-gradient(135deg,#4f8ef7,#2563eb)",opacity:submitting?0.7:1}}>{submitting?"Saving…":"✓ Update Record"}</button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRM */}
        {deleteConfirm&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{background:"#fff",borderRadius:16,padding:"28px 32px",maxWidth:380,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
              <div style={{width:52,height:52,background:"#fff5f5",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><Icon d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" size={22} color="#dc2626"/></div>
              <div style={{fontFamily:"var(--font-display)",fontSize:17,fontWeight:800,marginBottom:8}}>Remove Student?</div>
              <div style={{color:"var(--text-secondary)",fontSize:13.5,marginBottom:22}}>This will permanently remove the student record and their login account.</div>
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
