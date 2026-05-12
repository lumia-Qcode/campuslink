import React, { useState, useEffect, useCallback } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import {
  apiGetFees, apiMarkFeePaid, apiMarkFeeOverdue, apiDeleteFee,
  apiGenerateMonthlyFees, apiGetStudents, apiCreateFee, apiGetFeeMonths,
} from "../../services/api";

const CLASS_LEVELS = [
  {id:"playgroup",label:"Play Group"},{id:"nursery",label:"Nursery"},{id:"prenursery",label:"Pre-Nursery"},
  {id:"1",label:"Class 1"},{id:"2",label:"Class 2"},{id:"3",label:"Class 3"},{id:"4",label:"Class 4"},
  {id:"5",label:"Class 5"},{id:"6",label:"Class 6"},{id:"7",label:"Class 7"},{id:"8",label:"Class 8"},
  {id:"9",label:"Class 9"},{id:"X",label:"Class X"},
];
const getClassLabel = (id) => CLASS_LEVELS.find(c=>c.id===id)?.label||id;
const Icon = ({d,size=16,color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||"currentColor"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const statusStyle = (s) => {
  if(s==="Paid")    return {bg:"#e4f7ed",color:"#15803d",dot:"#2db87b"};
  if(s==="Pending") return {bg:"#fffbeb",color:"#b45309",dot:"#f5c842"};
  return                    {bg:"#fff5f5",color:"#dc2626",dot:"#ff5c5c"};
};

export default function AdminFees() {
  const [records,setRecords]     = useState([]);
  const [months,setMonths]       = useState([]);
  const [students,setStudents]   = useState([]);
  const [loading,setLoading]     = useState(true);
  const [error,setError]         = useState("");
  const [filterMonth,setFilterMonth] = useState("all");
  const [filterClass,setFilterClass] = useState("all");
  const [filterStatus,setFilterStatus] = useState("all");
  const [search,setSearch]       = useState("");
  const [showAddModal,setShowAddModal] = useState(false);
  const [showGenModal,setShowGenModal] = useState(false);
  const [addForm,setAddForm]     = useState({studentId:"",month:"",dueDate:"",status:"Pending"});
  const [genForm,setGenForm]     = useState({month:"",dueDate:""});
  const [addErrors,setAddErrors] = useState({});
  const [successMsg,setSuccessMsg] = useState("");
  const [submitting,setSubmitting] = useState(false);

  const flash = (msg) => { setSuccessMsg(msg); setTimeout(()=>setSuccessMsg(""),4000); };

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = {};
      if(filterMonth!=="all") params.month=filterMonth;
      if(filterClass!=="all") params.classId=filterClass;
      if(filterStatus!=="all") params.status=filterStatus;
      if(search) params.search=search;
      const [fRes,mRes,sRes] = await Promise.all([
        apiGetFees(params), apiGetFeeMonths(), apiGetStudents()
      ]);
      setRecords(fRes.data||[]);
      setMonths(mRes.data||[]);
      setStudents(sRes.data||[]);
    } catch(e){ setError(e.message); }
    finally { setLoading(false); }
  },[filterMonth,filterClass,filterStatus,search]);

  useEffect(()=>{ load(); },[load]);

  const markPaid = async (id) => {
    try { await apiMarkFeePaid(id); flash("Fee marked as Paid."); load(); }
    catch(e){ setError(e.message); }
  };
  const markOverdue = async (id) => {
    try { await apiMarkFeeOverdue(id); flash("Fee marked as Overdue."); load(); }
    catch(e){ setError(e.message); }
  };
  const handleDelete = async (id) => {
    try { await apiDeleteFee(id); flash("Fee record deleted."); load(); }
    catch(e){ setError(e.message); }
  };

  const handleAddFee = async () => {
    const e = {};
    if(!addForm.studentId) e.studentId="Select a student";
    if(!addForm.month.trim()) e.month="Month is required";
    if(!addForm.dueDate) e.dueDate="Due date is required";
    setAddErrors(e);
    if(Object.keys(e).length>0) return;
    setSubmitting(true);
    try {
      await apiCreateFee(addForm);
      flash("Fee record added.");
      setShowAddModal(false);
      setAddForm({studentId:"",month:"",dueDate:"",status:"Pending"});
      load();
    } catch(err){ setAddErrors({submit:err.message}); }
    finally { setSubmitting(false); }
  };

  const handleGenerate = async () => {
    const e = {};
    if(!genForm.month.trim()) e.month="Month is required (e.g. May 2026)";
    if(!genForm.dueDate) e.dueDate="Due date is required";
    setAddErrors(e);
    if(Object.keys(e).length>0) return;
    setSubmitting(true);
    try {
      const res = await apiGenerateMonthlyFees(genForm.month, genForm.dueDate);
      flash(`Generated ${res.count} fee records for ${genForm.month}.`);
      setShowGenModal(false);
      setGenForm({month:"",dueDate:""});
      load();
    } catch(err){ setAddErrors({submit:err.message}); }
    finally { setSubmitting(false); }
  };

  const summary = {
    paid:    records.filter(r=>r.status==="Paid").reduce((s,r)=>s+(r.amount||0),0),
    pending: records.filter(r=>r.status==="Pending").reduce((s,r)=>s+(r.amount||0),0),
    overdue: records.filter(r=>r.status==="Overdue").reduce((s,r)=>s+(r.amount||0),0),
    total:   records.reduce((s,r)=>s+(r.amount||0),0),
  };

  return (
    <div className="app-layout">
      <AdminNavbar/>
      <main className="main-content">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:24,fontWeight:800}}>Fee Management</h1>
            <p style={{color:"var(--text-muted)",fontSize:13,marginTop:2}}>{records.length} records</p>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setShowGenModal(true)} style={{padding:"10px 18px",borderRadius:10,border:"1.5px solid #9b6dff",background:"#f5f3ff",color:"#7c3aed",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
              Generate Monthly
            </button>
            <button onClick={()=>setShowAddModal(true)} className="btn-primary" style={{width:"auto",padding:"10px 18px",background:"linear-gradient(135deg,#f5c842,#d97706)",display:"flex",alignItems:"center",gap:8}}>
              <Icon d="M12 5v14M5 12h14" size={14} color="#fff"/> Add Fee Record
            </button>
          </div>
        </div>

        {successMsg&&<div style={{background:"#e4f7ed",border:"1px solid #bbf7d0",borderRadius:10,padding:"12px 16px",marginBottom:16,color:"#15803d",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:8}}><Icon d="M9 11l3 3L22 4" size={15} color="#15803d"/>{successMsg}</div>}
        {error&&<div style={{background:"#fff5f5",border:"1px solid #fca5a5",borderRadius:10,padding:"12px 16px",marginBottom:16,color:"#dc2626",fontWeight:700,fontSize:13}}>{error}</div>}

        {/* Summary Cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
          {[
            {label:"Total Revenue",value:summary.total,color:"#7c3aed",bg:"#f5f3ff"},
            {label:"Collected",value:summary.paid,color:"#15803d",bg:"#e4f7ed"},
            {label:"Pending",value:summary.pending,color:"#b45309",bg:"#fffbeb"},
            {label:"Overdue",value:summary.overdue,color:"#dc2626",bg:"#fff5f5"},
          ].map(c=>(
            <div key={c.label} className="card" style={{background:c.bg,border:`1.5px solid ${c.color}22`}}>
              <div style={{fontSize:11.5,fontWeight:700,color:c.color,textTransform:"uppercase",letterSpacing:"0.5px"}}>{c.label}</div>
              <div style={{fontSize:20,fontWeight:800,color:c.color,marginTop:4}}>Rs. {c.value.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
          <div style={{position:"relative",flex:1,minWidth:180}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={14} color="var(--text-muted)"/></span>
            <input className="form-input" style={{paddingLeft:34,fontSize:13}} placeholder="Search student..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select className="teacher-form-select" value={filterMonth} onChange={e=>setFilterMonth(e.target.value)}>
            <option value="all">All Months</option>
            {months.map(m=><option key={m} value={m}>{m}</option>)}
          </select>
          <select className="teacher-form-select" value={filterClass} onChange={e=>setFilterClass(e.target.value)}>
            <option value="all">All Classes</option>
            {CLASS_LEVELS.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <select className="teacher-form-select" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div className="card" style={{padding:0,overflow:"hidden"}}>
          {loading?(
            <div style={{textAlign:"center",padding:"40px 20px",color:"var(--text-muted)"}}>Loading fee records…</div>
          ):(
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"var(--bg-main)",borderBottom:"2px solid var(--border)"}}>
                    {["Student","Class","Month","Amount","Due Date","Status","Actions"].map(h=>(
                      <th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:11.5,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.7px",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.length===0?(
                    <tr><td colSpan={7} style={{textAlign:"center",padding:"40px 20px",color:"var(--text-muted)",fontSize:14}}>No fee records found.</td></tr>
                  ):records.map(r=>{
                    const st=statusStyle(r.status);
                    return(
                      <tr key={r._id} style={{borderBottom:"1px solid var(--border)",transition:"background 0.15s"}}
                        onMouseEnter={e=>e.currentTarget.style.background="var(--bg-main)"}
                        onMouseLeave={e=>e.currentTarget.style.background=""}>
                        <td style={{padding:"12px 16px"}}>
                          <div style={{fontWeight:700,fontSize:13,color:"var(--text-primary)"}}>{r.studentName}</div>
                          <div style={{fontSize:11.5,color:"var(--text-muted)"}}>{r.studentCode}</div>
                        </td>
                        <td style={{padding:"12px 16px",fontSize:12.5,color:"var(--text-secondary)"}}>{getClassLabel(r.classId)} — {r.section}</td>
                        <td style={{padding:"12px 16px",fontSize:12.5,fontWeight:600,color:"var(--text-primary)"}}>{r.month}</td>
                        <td style={{padding:"12px 16px",fontWeight:800,fontSize:13,color:"var(--text-primary)"}}>Rs. {(r.amount||0).toLocaleString()}</td>
                        <td style={{padding:"12px 16px",fontSize:12.5,color:"var(--text-muted)"}}>{r.dueDate?new Date(r.dueDate).toLocaleDateString("en-PK"):"—"}</td>
                        <td style={{padding:"12px 16px"}}>
                          <span style={{fontSize:11.5,fontWeight:700,padding:"4px 12px",borderRadius:20,background:st.bg,color:st.color,display:"inline-flex",alignItems:"center",gap:5}}>
                            <span style={{width:6,height:6,borderRadius:"50%",background:st.dot,flexShrink:0}}/>
                            {r.status}
                          </span>
                          {r.paidDate&&<div style={{fontSize:10.5,color:"var(--text-muted)",marginTop:2}}>Paid: {new Date(r.paidDate).toLocaleDateString("en-PK")}</div>}
                        </td>
                        <td style={{padding:"12px 16px"}}>
                          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                            {r.status!=="Paid"&&(
                              <button onClick={()=>markPaid(r._id)} style={{background:"#e4f7ed",color:"#15803d",border:"none",borderRadius:8,padding:"5px 10px",fontWeight:700,fontSize:11.5,cursor:"pointer",whiteSpace:"nowrap"}}>Mark Paid</button>
                            )}
                            {r.status==="Pending"&&(
                              <button onClick={()=>markOverdue(r._id)} style={{background:"#fff5f5",color:"#dc2626",border:"none",borderRadius:8,padding:"5px 10px",fontWeight:700,fontSize:11.5,cursor:"pointer",whiteSpace:"nowrap"}}>Overdue</button>
                            )}
                            <button onClick={()=>handleDelete(r._id)} style={{background:"var(--bg-main)",color:"var(--text-muted)",border:"none",borderRadius:8,padding:"5px 8px",fontWeight:700,fontSize:11.5,cursor:"pointer"}}>✕</button>
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

        {/* ADD FEE MODAL */}
        {showAddModal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:460,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
              <div style={{padding:"24px 28px 20px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:800}}>Add Fee Record</div>
                <button onClick={()=>setShowAddModal(false)} style={{background:"var(--bg-main)",border:"none",borderRadius:8,padding:8,cursor:"pointer"}}><Icon d="M18 6L6 18M6 6l12 12" size={16}/></button>
              </div>
              <div style={{padding:"20px 28px"}}>
                <div className="form-group">
                  <label className="form-label">Student *</label>
                  <select className={`form-input${addErrors.studentId?" input-error":""}`} value={addForm.studentId} onChange={e=>setAddForm(f=>({...f,studentId:e.target.value}))}>
                    <option value="">— Select student —</option>
                    {students.map(s=><option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>)}
                  </select>
                  {addErrors.studentId&&<div style={{color:"#e53e3e",fontSize:11.5,marginTop:4,fontWeight:600}}>{addErrors.studentId}</div>}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
                  <div className="form-group">
                    <label className="form-label">Month * (e.g. May 2026)</label>
                    <input className={`form-input${addErrors.month?" input-error":""}`} placeholder="May 2026" value={addForm.month} onChange={e=>setAddForm(f=>({...f,month:e.target.value}))}/>
                    {addErrors.month&&<div style={{color:"#e53e3e",fontSize:11.5,marginTop:4,fontWeight:600}}>{addErrors.month}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date *</label>
                    <input className={`form-input${addErrors.dueDate?" input-error":""}`} type="date" value={addForm.dueDate} onChange={e=>setAddForm(f=>({...f,dueDate:e.target.value}))}/>
                    {addErrors.dueDate&&<div style={{color:"#e53e3e",fontSize:11.5,marginTop:4,fontWeight:600}}>{addErrors.dueDate}</div>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Status</label>
                  <select className="form-input" value={addForm.status} onChange={e=>setAddForm(f=>({...f,status:e.target.value}))}>
                    <option>Pending</option><option>Paid</option><option>Overdue</option>
                  </select>
                </div>
                <div style={{background:"#fffbeb",borderRadius:10,padding:"10px 14px",fontSize:12.5,color:"#92400e",fontWeight:600}}>
                  ℹ️ Fee amount is auto-calculated from the student's class level.
                </div>
                {addErrors.submit&&<div style={{color:"#e53e3e",fontSize:12.5,marginTop:8,fontWeight:600}}>{addErrors.submit}</div>}
              </div>
              <div style={{padding:"16px 28px",borderTop:"1px solid var(--border)",display:"flex",gap:12}}>
                <button onClick={()=>setShowAddModal(false)} style={{flex:1,padding:"11px",borderRadius:10,border:"1.5px solid var(--border)",background:"#fff",color:"var(--text-secondary)",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                <button onClick={handleAddFee} disabled={submitting} className="btn-primary" style={{flex:1,background:"linear-gradient(135deg,#f5c842,#d97706)",opacity:submitting?0.7:1}}>{submitting?"Saving…":"✓ Add Record"}</button>
              </div>
            </div>
          </div>
        )}

        {/* GENERATE MONTHLY MODAL */}
        {showGenModal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:440,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
              <div style={{padding:"24px 28px 20px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:800}}>Generate Monthly Fees</div>
                <button onClick={()=>setShowGenModal(false)} style={{background:"var(--bg-main)",border:"none",borderRadius:8,padding:8,cursor:"pointer"}}><Icon d="M18 6L6 18M6 6l12 12" size={16}/></button>
              </div>
              <div style={{padding:"20px 28px"}}>
                <div style={{background:"#f5f3ff",borderRadius:10,padding:"12px 14px",marginBottom:18,fontSize:13,color:"#7c3aed",fontWeight:600}}>
                  This will create fee records for ALL enrolled students for the given month (skipping any already generated).
                </div>
                <div className="form-group">
                  <label className="form-label">Month * (e.g. May 2026)</label>
                  <input className={`form-input${addErrors.month?" input-error":""}`} placeholder="May 2026" value={genForm.month} onChange={e=>setGenForm(f=>({...f,month:e.target.value}))}/>
                  {addErrors.month&&<div style={{color:"#e53e3e",fontSize:11.5,marginTop:4,fontWeight:600}}>{addErrors.month}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date *</label>
                  <input className={`form-input${addErrors.dueDate?" input-error":""}`} type="date" value={genForm.dueDate} onChange={e=>setGenForm(f=>({...f,dueDate:e.target.value}))}/>
                  {addErrors.dueDate&&<div style={{color:"#e53e3e",fontSize:11.5,marginTop:4,fontWeight:600}}>{addErrors.dueDate}</div>}
                </div>
                {addErrors.submit&&<div style={{color:"#e53e3e",fontSize:12.5,marginTop:8,fontWeight:600}}>{addErrors.submit}</div>}
              </div>
              <div style={{padding:"16px 28px",borderTop:"1px solid var(--border)",display:"flex",gap:12}}>
                <button onClick={()=>setShowGenModal(false)} style={{flex:1,padding:"11px",borderRadius:10,border:"1.5px solid var(--border)",background:"#fff",color:"var(--text-secondary)",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                <button onClick={handleGenerate} disabled={submitting} style={{flex:1,padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#9b6dff,#7c3aed)",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit",opacity:submitting?0.7:1}}>{submitting?"Generating…":"⚡ Generate"}</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
