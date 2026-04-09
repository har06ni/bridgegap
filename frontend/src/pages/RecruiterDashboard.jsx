import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Users, PlusCircle, Briefcase, 
  MapPin, DollarSign, CheckCircle, Sparkles, 
  LayoutDashboard, ChevronRight, Award
} from 'lucide-react';

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Job',
    skills: '',
    description: '',
    location: '',
    salary: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const fetchData = () => {
    fetch('/api/candidates')
      .then(res => res.json())
      .then(data => setCandidates(data))
      .catch(err => console.error('Error fetching candidates:', err));

    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => setMyJobs(data))
      .catch(err => console.error('Error fetching jobs:', err));
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchData();
  }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          company: user.company
        })
      });

      if (!response.ok) throw new Error('Failed to post job');

      setSuccess(true);
      setFormData({
        title: '',
        type: 'Job',
        skills: '',
        description: '',
        location: '',
        salary: ''
      });
      
      fetchData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-brand-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-brand-500/20">
              <Building2 className="w-8 h-8" />
           </div>
           <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">{user.company}</h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Recruiter Command Center • {user.name}</p>
           </div>
        </div>
        
        <button 
          onClick={() => navigate('/manage-opportunities')}
          className="btn-primary px-10 py-5 flex items-center gap-3 shadow-2xl shadow-brand-500/20 active:scale-95 transition-all text-sm font-black uppercase tracking-wider"
        >
          <LayoutDashboard className="w-5 h-5" />
          Manage My Opportunities
          <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="glass-card px-10 py-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 text-blue-500/10 group-hover:scale-110 transition-transform"><Briefcase className="w-24 h-24" /></div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 block">Live Listings</span>
           <span className="text-5xl font-black text-slate-800">{myJobs.length}</span>
        </div>
        <div className="glass-card px-10 py-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 text-green-500/10 group-hover:scale-110 transition-transform"><Users className="w-24 h-24" /></div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 block">Total Applicants</span>
           <span className="text-5xl font-black text-slate-800">{myJobs.reduce((acc, job) => acc + (job.applicantCount || 0), 0)}</span>
        </div>
        <div className="glass-card px-10 py-8 relative overflow-hidden group border-brand-500/20 bg-brand-50/30">
           <div className="absolute top-0 right-0 p-8 text-brand-500/10 group-hover:scale-110 transition-transform"><Sparkles className="w-24 h-24" /></div>
           <span className="text-[10px] font-black text-brand-400 uppercase tracking-[0.3em] mb-2 block">Available Talent</span>
           <span className="text-5xl font-black text-brand-600">{candidates.length}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="glass-card p-10 bg-white/80">
          <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
            <PlusCircle className="w-6 h-6 text-brand-600" />
            Launch Opportunity
          </h2>
          <form onSubmit={handlePostJob} className="space-y-6">
            <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-8">
              <button 
                type="button" 
                onClick={() => setFormData({...formData, type: 'Job'})}
                className={`flex-1 py-3 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${formData.type === 'Job' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Full-Time Job
              </button>
              <button 
                type="button" 
                onClick={() => setFormData({...formData, type: 'Internship'})}
                className={`flex-1 py-3 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${formData.type === 'Internship' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Internship
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Title *</label>
                <input 
                  type="text" required className="input-field py-4" 
                  placeholder={formData.type === 'Job' ? "e.g. Senior Software Engineer" : "e.g. Frontend Development Intern"}
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Location *</label>
                <input 
                  type="text" required className="input-field py-4" placeholder="e.g. Tokyo (Remote)"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Comp/Stipend *</label>
                <input 
                  type="text" required className="input-field py-4" placeholder="e.g. $8000/mo"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Tech Stack * (comma separated)</label>
              <input 
                type="text" required className="input-field py-4" 
                placeholder="React, Node.js, GraphQL, PostgreSQL"
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Description *</label>
              <textarea 
                required className="input-field min-h-[140px] py-4" 
                placeholder="Outline the role, responsibilities, and requirements..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-5 flex items-center justify-center gap-3 shadow-2xl shadow-brand-500/30 active:scale-95 transition-all text-sm font-black uppercase tracking-widest"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <PlusCircle className="w-5 h-5" />}
              Publish Posting
            </button>

            {success && (
              <div className="p-5 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <CheckCircle className="w-5 h-5" />
                Posting is live on the student portal!
              </div>
            )}
          </form>
        </div>

        <div className="flex flex-col gap-10">
          <div className="glass-card p-10 bg-slate-900 border-none shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 text-brand-500/5"><Award className="w-48 h-48" /></div>
             <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3 relative z-10">
                <Sparkles className="w-6 h-6 text-brand-400" />
                Talent Spotlight
             </h2>
             <div className="space-y-6 relative z-10">
                {candidates.slice(0, 3).map((candidate, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center text-white font-black">{candidate.name.charAt(0)}</div>
                        <div>
                           <div className="font-bold text-white mb-0.5">{candidate.name}</div>
                           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{candidate.skills.slice(0, 2).join(' • ')}</div>
                        </div>
                     </div>
                     <button onClick={() => navigate('/manage-opportunities')} className="p-2 text-slate-400 hover:text-white transition-colors"><ChevronRight className="w-5 h-5" /></button>
                  </div>
                ))}
             </div>
             <button onClick={() => navigate('/manage-opportunities')} className="mt-8 w-full py-4 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all text-xs font-bold uppercase tracking-widest">Explore Full Talent Database</button>
          </div>

          <div className="glass-card p-10 flex flex-col items-center justify-center text-center bg-brand-600 border-none shadow-2xl">
             <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
                <LayoutDashboard className="w-8 h-8 text-white" />
             </div>
             <h3 className="text-xl font-black text-white mb-2">Review Applications</h3>
             <p className="text-brand-100 text-sm mb-8 leading-relaxed">Check skill match scores, resume messages, and select candidates for interviews.</p>
             <button 
               onClick={() => navigate('/manage-opportunities')}
               className="w-full py-4 bg-white text-brand-600 rounded-xl font-black shadow-lg hover:bg-slate-50 transition-all text-xs uppercase tracking-widest"
             >
               Go to Recruitment Desk
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
