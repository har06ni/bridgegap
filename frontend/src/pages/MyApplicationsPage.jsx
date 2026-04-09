import { useState, useEffect } from 'react';
import { 
  Briefcase, MapPin, DollarSign, Clock, 
  CheckCircle2, XCircle, Loader2, Sparkles,
  ChevronRight, Calendar, Building2, ListChecks,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = (email) => {
    setLoading(true);
    fetch(`/api/applications/student?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        // Sort reverse chronological
        const sorted = data.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        setApplications(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching applications:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      fetchApplications(parsed.email);
    } else {
      navigate('/login');
    }
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selected':
        return (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-green-500 text-white rounded-full text-xs font-black shadow-lg shadow-green-500/30 animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            SELECTED
          </div>
        );
      case 'Rejected':
        return (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-black border border-red-200">
            <XCircle className="w-4 h-4" />
            REJECTED
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-xs font-black border border-slate-200">
            <Clock className="w-4 h-4" />
            APPLIED
          </div>
        );
    }
  };

  if (!user && !loading) return null;

  const stats = {
    total: applications.length,
    selected: applications.filter(a => a.status === 'Selected').length
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-3">
            My Applications
            <Sparkles className="w-8 h-8 text-brand-500" />
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Track your progress and interview invitations in real-time.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
             <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                <ListChecks className="w-6 h-6" />
             </div>
             <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total</div>
                <div className="text-xl font-black text-slate-800 leading-none">{stats.total}</div>
             </div>
          </div>
          <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
             <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                <TrendingUp className="w-6 h-6" />
             </div>
             <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Selected</div>
                <div className="text-xl font-black text-slate-800 leading-none">{stats.selected}</div>
             </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mb-4" />
          <p className="text-slate-400 font-bold">Fetching your journey...</p>
        </div>
      ) : applications.length > 0 ? (
        <div className="grid gap-6">
          {applications.map((app) => (
            <div key={app.id} className="group relative">
              <div className="absolute inset-0 bg-brand-600 rounded-[32px] translate-y-2 translate-x-1 opacity-0 group-hover:opacity-10 transition-all duration-300"></div>
              
              <div className={`relative bg-white p-8 rounded-[32px] border transition-all duration-300 ${
                app.status === 'Selected' ? 'border-green-200 shadow-xl shadow-green-500/5' : 'border-slate-100 shadow-sm'
              }`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-colors">
                          <Building2 className="w-6 h-6" />
                       </div>
                       <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{app.company}</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-4">{app.jobTitle}</h2>
                    
                    <div className="flex flex-wrap gap-5 text-sm font-bold text-slate-400 mb-6">
                       <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {app.location}</span>
                       <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> {app.salary}</span>
                       <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(app.appliedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                       <div className="flex items-center gap-3 pr-6 border-r border-slate-200/50">
                          <div className="relative w-12 h-12 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="24" cy="24" r="20" className="stroke-slate-200 fill-none" strokeWidth="3" />
                              <circle 
                                cx="24" cy="24" r="20" 
                                className="stroke-brand-500 fill-none transition-all duration-1000"
                                strokeWidth="3" 
                                strokeDasharray={`${2 * Math.PI * 20}`}
                                strokeDashoffset={`${2 * Math.PI * 20 * (1 - (app.matchPercentage || 0) / 100)}`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-brand-700">
                               {app.matchPercentage}%
                            </span>
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Match Score</span>
                       </div>

                       <div className="flex-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Qualifications at Apply Time</p>
                          <div className="flex flex-wrap gap-2">
                             {(app.courses && app.courses.length > 0) ? app.courses.map((course, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 shadow-sm">
                                   {course}
                                </span>
                             )) : (
                                <span className="text-[10px] font-bold text-slate-400 italic">No certifications listed</span>
                             )}
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4 min-w-[140px]">
                    {getStatusBadge(app.status)}
                    <button 
                      onClick={() => navigate('/jobs')}
                      className="p-2 text-slate-300 hover:text-brand-600 transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {app.status === 'Selected' && (
                  <div className="mt-8 p-6 bg-green-50 rounded-2xl border border-green-200 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-green-800">Congratulations!</h4>
                        <p className="text-green-700 text-sm leading-relaxed">
                          You have been selected for an **offline interview**. Our recruitment team will reach out to your registered email soon with the schedule.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {app.status === 'Rejected' && (
                  <div className="mt-6 p-5 bg-red-50 rounded-2xl border border-red-100">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-black text-red-700 uppercase tracking-widest mb-1">Recruiter Feedback</p>
                        <p className="text-sm text-red-600 leading-relaxed italic">
                          {app.rejectionRemark
                            ? `"${app.rejectionRemark}"`
                            : 'Thank you for your interest. Unfortunately, the team has decided not to move forward with your application at this time.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
           <Briefcase className="w-20 h-20 mx-auto mb-6 text-slate-100" />
           <h3 className="text-2xl font-black text-slate-800">No applications yet</h3>
           <p className="text-slate-400 mt-2 mb-8 max-w-sm mx-auto">You haven't applied to any roles. Explore our opportunities and bridge the gap to your career!</p>
           <button 
             onClick={() => navigate('/jobs')}
             className="btn-primary px-10 py-4 shadow-xl shadow-brand-500/20"
           >
             Explore Opportunities
           </button>
        </div>
      )}
    </div>
  );
}
