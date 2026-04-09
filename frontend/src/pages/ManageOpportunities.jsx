import { useState, useEffect } from 'react';
import { 
  Building2, Users, Briefcase, MapPin, DollarSign, 
  Pencil, Trash2, Eye, X, Save, GraduationCap, 
  Award, Calendar, MessageSquare, ChevronLeft,
  CheckCircle, Loader2, AlertCircle, Download, FileText, FolderOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ManageOpportunities() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Edit State
  const [editingJob, setEditingJob] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Applicants State
  const [viewingApplicantsFor, setViewingApplicantsFor] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  // Map of studentEmail -> proof projects
  const [studentProofs, setStudentProofs] = useState({});
  // Rejection remarks: map of appId -> remark draft
  const [remarkDrafts, setRemarkDrafts] = useState({});
  // Which appId is in 'pending reject' mode (showing textarea)
  const [pendingReject, setPendingReject] = useState(null);

  const fetchData = () => {
    setLoading(true);
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        setMyJobs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching jobs:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.role !== 'Recruiter') {
        navigate('/dashboard');
        return;
      }
      setUser(parsed);
    } else {
      navigate('/login');
    }
    fetchData();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${editingJob.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (!response.ok) throw new Error('Failed to update');
      setEditingJob(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const response = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (response.ok) fetchData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const openApplicantsModal = async (job) => {
    setViewingApplicantsFor(job);
    setApplicantsLoading(true);
    setFetchError(null);
    setApplicants([]);
    setStudentProofs({});
    
    try {
      const response = await fetch(`/api/applications/${job.id}`);
      if (!response.ok) throw new Error('Failed to fetch applicants');
      const data = await response.json();
      setApplicants(data);

      // Fetch proof submissions for each unique student
      const uniqueEmails = [...new Set(data.map(a => a.studentEmail))];
      const proofResults = await Promise.all(
        uniqueEmails.map(email =>
          fetch(`/api/projects?email=${encodeURIComponent(email)}`)
            .then(r => r.json())
            .then(projects => ({ email, projects }))
            .catch(() => ({ email, projects: [] }))
        )
      );
      const proofsMap = {};
      proofResults.forEach(({ email, projects }) => { proofsMap[email] = projects; });
      setStudentProofs(proofsMap);
    } catch (err) {
      setFetchError('Failed to load applicants. Please try again.');
      console.error(err);
    } finally {
      setApplicantsLoading(false);
    }
  };

  const updateAppStatus = async (appId, newStatus, remark = '') => {
    try {
      const response = await fetch(`/api/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...(remark ? { rejectionRemark: remark } : {}) })
      });
      if (response.ok) {
        setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus, rejectionRemark: remark } : a));
        setPendingReject(null);
        setRemarkDrafts(prev => ({ ...prev, [appId]: '' }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setEditFormData({
      title: job.title,
      type: job.type,
      skills: (job.skills || []).join(', '),
      description: job.description,
      location: job.location,
      salary: job.salary
    });
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/recruiter-dashboard')}
            className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-brand-600 transition-all shadow-sm border border-slate-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-800">Manage Opportunities</h1>
            <p className="text-slate-500 font-medium">Oversee your postings and evaluate top talent</p>
          </div>
        </div>
        
        <div className="glass-card px-6 py-3 bg-brand-600 text-white flex items-center gap-3">
          <Briefcase className="w-5 h-5 opacity-80" />
          <span className="font-bold">{myJobs.length} Active Listings</span>
        </div>
      </div>

      <div className="grid gap-6">
        {myJobs.length > 0 ? (
          <div className="overflow-x-auto glass-card p-0 border-none shadow-xl">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Opportunity</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stats</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {myJobs.map((job) => (
                  <tr key={job.id} className="bg-white hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-lg font-extrabold text-slate-800 group-hover:text-brand-600 transition-colors">{job.title}</span>
                        <div className="flex gap-4 mt-1">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 capitalize">
                            <span className={`w-2 h-2 rounded-full ${job.type === 'Job' ? 'bg-blue-400' : 'bg-purple-400'}`}></span>
                            {job.type}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <MapPin className="w-3.5 h-3.5" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <DollarSign className="w-3.5 h-3.5" />
                            {job.salary}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-brand-50 rounded-2xl border border-brand-100 flex items-center gap-2">
                          <Users className="w-4 h-4 text-brand-600" />
                          <span className="text-sm font-black text-brand-700">{job.applicantCount || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openApplicantsModal(job)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all active:scale-95"
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </button>
                        <button 
                          onClick={() => openEditModal(job)}
                          className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(job.id)}
                          className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-24 glass-card border-dashed">
             <Briefcase className="w-16 h-16 mx-auto mb-6 text-slate-200" />
             <h3 className="text-xl font-bold text-slate-800">No Postings Found</h3>
             <p className="text-slate-400 mb-8 max-w-sm mx-auto">Start by creating your first opportunity from the dashboard to see it managed here.</p>
             <button onClick={() => navigate('/recruiter-dashboard')} className="btn-primary px-8">Back to Dashboard</button>
          </div>
        )}
      </div>

      {viewingApplicantsFor && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-50 rounded-[32px] w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl border border-white/20 animate-in zoom-in-95">
            <div className="px-10 py-8 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">Recruitment Desk</h2>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{viewingApplicantsFor.title} • Reviewing {applicants.length} Candidates</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingApplicantsFor(null)}
                className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-all border border-slate-100"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-slate-50/30">
              {applicantsLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                   <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
                   <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching Candidates...</p>
                </div>
              ) : fetchError ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
                   <AlertCircle className="w-12 h-12 text-red-500" />
                   <h3 className="text-xl font-bold text-slate-800">{fetchError}</h3>
                   <button onClick={() => openApplicantsModal(viewingApplicantsFor)} className="btn-primary px-8 mt-4">Try Again</button>
                </div>
              ) : applicants.length > 0 ? (
                applicants.map((app) => (
                  <div key={app.id} className={`p-8 bg-white rounded-3xl border transition-all group ${app.matchPercentage >= 90 ? 'border-brand-200 shadow-xl shadow-brand-500/5' : 'border-slate-100 shadow-sm hover:shadow-md'}`}>
                    <div className="flex flex-col lg:flex-row gap-10">
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 font-bold text-2xl group-hover:bg-brand-600 group-hover:text-white transition-colors">
                              {app.studentName.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-slate-800">{app.studentName}</h3>
                              <div className="flex gap-5 mt-1">
                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><GraduationCap className="w-4 h-4" /> {app.qualification}</span>
                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Briefcase className="w-4 h-4" /> {app.experience} EXP</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-3xl font-black leading-none ${app.matchPercentage >= 90 ? 'text-brand-600' : 'text-slate-700'}`}>{app.matchPercentage}%</div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Match Score</span>
                          </div>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative shadow-inner">
                          <MessageSquare className="absolute -top-3 -left-3 w-8 h-8 p-1 text-brand-600 bg-white rounded-full border border-slate-100" />
                          <p className="text-sm text-slate-600 italic leading-relaxed">"{app.coverMessage}"</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-brand-600" /> Technical Proficiency</p>
                            <div className="flex flex-wrap gap-2">
                              {app.studentSkills.map((s, i) => (
                                <span key={i} className="px-3 py-1 bg-white border border-slate-100 text-slate-600 text-[10px] font-bold rounded-lg uppercase">{s}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Verified Certifications</p>
                            <div className="flex flex-wrap gap-2">
                               {app.studentCourses.map((c, i) => (
                                <span key={i} className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-lg border border-green-100 italic">{c}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Certificates & Proof Submissions */}
                        <div className="mt-2 p-5 bg-brand-50/40 rounded-2xl border border-brand-100/60">
                          <p className="text-[10px] font-black text-brand-700 uppercase mb-4 flex items-center gap-2 tracking-widest">
                            <FolderOpen className="w-4 h-4" /> Certificates & Proof Submissions
                          </p>
                          {(studentProofs[app.studentEmail] || []).length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No files uploaded by this student.</p>
                          ) : (
                            <div className="grid gap-3">
                              {(studentProofs[app.studentEmail] || []).map(project => (
                                <div key={project.id}>
                                  <p className="text-[10px] font-extrabold text-slate-600 uppercase mb-2 tracking-wider">{project.title}</p>
                                  {project.files.map((file, fi) => (
                                    <div key={fi} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/60 shadow-sm mb-2">
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 bg-brand-50 rounded-lg text-brand-600 flex-shrink-0">
                                          <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-xs font-bold text-slate-700 truncate max-w-[160px]">{file.name}</span>
                                          <span className="text-[9px] font-black text-slate-400 uppercase">
                                            {(file.size / 1024).toFixed(1)} KB &bull; {new Date(file.uploadedAt).toLocaleDateString()}
                                          </span>
                                        </div>
                                      </div>
                                      <a
                                        href={file.path}
                                        download={file.name}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 text-white text-[10px] font-black rounded-xl hover:bg-brand-700 transition-all shadow-md shadow-brand-500/20"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        Download
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="lg:w-72 flex flex-col gap-4 border-l border-slate-100/50 pl-10 h-full">
                         <label className="text-[10px] font-black text-slate-400 uppercase px-2 tracking-widest mb-2">Hiring Decision</label>
                         
                         {app.status === 'Applied' ? (
                           <div className="flex flex-col gap-3">
                             <button 
                                onClick={() => updateAppStatus(app.id, 'Selected')}
                                className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-green-500/20 hover:bg-green-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                             >
                                <CheckCircle className="w-5 h-5" />
                                Select Candidate
                             </button>

                             {pendingReject === app.id ? (
                               <div className="flex flex-col gap-2">
                                 <textarea
                                   rows={3}
                                   className="w-full p-3 text-xs rounded-xl border-2 border-red-200 bg-red-50 text-slate-700 placeholder:text-slate-400 resize-none outline-none focus:border-red-400 font-medium"
                                   placeholder="Enter reason for rejection (optional)..."
                                   value={remarkDrafts[app.id] || ''}
                                   onChange={e => setRemarkDrafts(prev => ({ ...prev, [app.id]: e.target.value }))}
                                 />
                                 <div className="flex gap-2">
                                   <button
                                     onClick={() => updateAppStatus(app.id, 'Rejected', remarkDrafts[app.id] || '')}
                                     className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black text-xs hover:bg-red-700 transition-all"
                                   >
                                     Confirm Rejection
                                   </button>
                                   <button
                                     onClick={() => setPendingReject(null)}
                                     className="py-3 px-4 bg-slate-100 text-slate-600 rounded-xl font-black text-xs hover:bg-slate-200 transition-all"
                                   >
                                     Cancel
                                   </button>
                                 </div>
                               </div>
                             ) : (
                               <button 
                                  onClick={() => setPendingReject(app.id)}
                                  className="w-full py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                               >
                                  <X className="w-4 h-4" />
                                  Reject Candidate
                               </button>
                             )}
                           </div>
                         ) : (
                           <div className={`p-6 rounded-2xl text-center border-2 flex flex-col items-center gap-2 ${
                             app.status === 'Selected' 
                               ? 'bg-green-50 border-green-100 text-green-700' 
                               : 'bg-red-50 border-red-100 text-red-700'
                           }`}>
                             {app.status === 'Selected' ? (
                               <>
                                 <CheckCircle className="w-10 h-10 mb-2" />
                                 <span className="text-sm font-black uppercase tracking-tighter">Candidate Selected</span>
                                 <button 
                                   onClick={() => updateAppStatus(app.id, 'Applied')}
                                   className="mt-2 text-[10px] font-bold text-green-600 underline opacity-60 hover:opacity-100"
                                 >
                                   Reset Decision
                                 </button>
                               </>
                             ) : (
                               <>
                                 <X className="w-10 h-10 mb-2" />
                                 <span className="text-sm font-black uppercase tracking-tighter">Candidate Rejected</span>
                                 <button 
                                   onClick={() => updateAppStatus(app.id, 'Applied')}
                                   className="mt-2 text-[10px] font-bold text-red-600 underline opacity-60 hover:opacity-100"
                                 >
                                   Reset Decision
                                 </button>
                               </>
                             )}
                           </div>
                         )}

                         {app.matchPercentage >= 90 && (
                            <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 flex items-center gap-3">
                              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-brand-600 shadow-sm animate-pulse">
                                <Award className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] font-extrabold text-brand-700 uppercase tracking-widest leading-tight">Premium Match Lead</span>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center border-2 border-dashed border-slate-200 rounded-[40px] bg-white">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                      <Users className="w-10 h-10" />
                   </div>
                   <h3 className="text-xl font-black text-slate-800">No applicants yet</h3>
                   <p className="text-slate-400 max-w-[280px]">As soon as candidates start applying, they'll appear here for your review.</p>
                </div>
              )}
            </div>
            
            <div className="px-10 py-6 bg-white border-t border-slate-100 flex items-center justify-between">
               <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{applicants.length} Total Applications Reviewed</span>
               <button onClick={() => setViewingApplicantsFor(null)} className="px-10 py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-black transition-all shadow-xl shadow-slate-900/10">Close Desk</button>
            </div>
          </div>
        </div>
      )}

      {editingJob && (
         <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
               <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <h2 className="text-2xl font-black text-slate-800">Edit Posting</h2>
                  <button onClick={() => setEditingJob(null)} className="p-2 hover:bg-white rounded-full"><X /></button>
               </div>
               <form onSubmit={handleUpdate} className="p-10 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Title</label>
                        <input className="input-field py-4" value={editFormData.title} onChange={e => setEditFormData({...editFormData, title: e.target.value})} />
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Location</label>
                        <input className="input-field py-4" value={editFormData.location} onChange={e => setEditFormData({...editFormData, location: e.target.value})} />
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Salary</label>
                        <input className="input-field py-4" value={editFormData.salary} onChange={e => setEditFormData({...editFormData, salary: e.target.value})} />
                     </div>
                     <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Skills</label>
                        <input className="input-field py-4" value={editFormData.skills} onChange={e => setEditFormData({...editFormData, skills: e.target.value})} />
                     </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                     <button type="button" onClick={() => setEditingJob(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold">Cancel</button>
                     <button type="submit" className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/20">Save Changes</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}
