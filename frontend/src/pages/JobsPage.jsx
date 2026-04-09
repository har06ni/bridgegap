import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Building, ChevronRight, Search, X, 
  GraduationCap, CheckCircle2, AlertCircle, Info, 
  BookOpen, ExternalLink, Send, Lock
} from 'lucide-react';

const COURSE_MAP = {
  'React': { name: 'React - The Complete Guide (Udemy)', link: '#' },
  'Node.js': { name: 'Complete Node.js Developer Course', link: '#' },
  'JavaScript': { name: 'Modern JavaScript From The Beginning', link: '#' },
  'Python': { name: 'Python for Data Science Bootcamp', link: '#' },
  'SQL': { name: 'SQL & Databases for Beginners', link: '#' },
  'Tailwind CSS': { name: 'Tailwind CSS From Scratch', link: '#' },
  'Figma': { name: 'UI/UX Design Essentials', link: '#' },
  'Docker': { name: 'Docker and Kubernetes Guide', link: '#' },
  'MongoDB': { name: 'MongoDB - The Complete Guide', link: '#' },
  'Express': { name: 'Just Express (Pro Express)', link: '#' },
  'TypeScript': { name: 'Understanding TypeScript', link: '#' }
};

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [studentSkills, setStudentSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('Job');
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const userData = savedUser ? JSON.parse(savedUser) : null;

    // 1. Initial Load from LocalStorage for instant UI feedback
    if (userData) {
      const storageKey = `applied_jobs_${userData.email}`;
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        setAppliedJobs(new Set(JSON.parse(cached)));
      }
    }

    const fetchJobs = fetch('/api/jobs').then(res => res.json());
    const fetchProfile = userData 
      ? fetch(`/api/profile?email=${encodeURIComponent(userData.email)}`).then(res => res.json())
      : Promise.resolve({ skills: [] });
    const fetchApps = userData
      ? fetch(`/api/applications/student?email=${encodeURIComponent(userData.email)}`).then(res => res.json())
      : Promise.resolve([]);

    Promise.all([fetchJobs, fetchProfile, fetchApps])
      .then(([jobsData, profileData, appsData]) => {
        setJobs(jobsData);
        setStudentSkills(profileData.skills || []);
        
        // 2. Sync with Backend
        if (userData) {
          const backendIds = appsData.map(app => Number(app.jobId));
          const storageKey = `applied_jobs_${userData.email}`;
          
          setAppliedJobs(prev => {
            const next = new Set([...Array.from(prev), ...backendIds]);
            localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
            return next;
          });
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const calculateMatch = (requiredSkills) => {
    if (!requiredSkills || requiredSkills.length === 0) return { percentage: 100, matched: [], missing: [] };
    
    const studentSkillsLower = studentSkills.map(s => s.toLowerCase());
    const matched = requiredSkills.filter(s => studentSkillsLower.includes(s.toLowerCase()));
    const missing = requiredSkills.filter(s => !studentSkillsLower.includes(s.toLowerCase()));
    const percentage = Math.round((matched.length / requiredSkills.length) * 100);
    
    return { percentage, matched, missing };
  };

  const handleApply = async (jobId, percentage, jobTitle) => {
    const savedUser = localStorage.getItem('user');
    const userData = savedUser ? JSON.parse(savedUser) : null;
    
    if (!userData) return;

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          jobTitle,
          studentEmail: userData.email,
          studentName: userData.name,
          matchPercentage: percentage,
          coverMessage: `I have a ${percentage}% match for this position and I am excited to apply!`,
          qualification: 'Degree in Computer Science',
          experience: 'Relevant Projects & Internships',
          courses: userData.courses || []
        })
      });

      // 409 = already applied — silently mark as applied (state sync)
      if (response.status === 409) {
        setAppliedJobs(prev => {
          const next = new Set([...Array.from(prev), jobId]);
          localStorage.setItem(`applied_jobs_${userData.email}`, JSON.stringify(Array.from(next)));
          return next;
        });
        return;
      }

      if (!response.ok) throw new Error('Failed to record application');

      // Update Local State & Cache
      setAppliedJobs(prev => {
        const next = new Set([...Array.from(prev), jobId]);
        localStorage.setItem(`applied_jobs_${userData.email}`, JSON.stringify(Array.from(next)));
        return next;
      });
    } catch (err) {
      alert(`Application Error: ${err.message}`);
    }
  };

  const filteredJobs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const typedJobs = jobs.filter(job => job.type === activeType);
    
    if (!query) return typedJobs;

    return typedJobs.filter(job => 
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      (job.skills && job.skills.some(skill => skill.toLowerCase().includes(query)))
    );
  }, [jobs, searchQuery, activeType]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-3">
            {activeType === 'Job' ? <Briefcase className="w-8 h-8 text-brand-600" /> : <GraduationCap className="w-8 h-8 text-brand-600" />}
            {activeType === 'Job' ? 'Job Listings' : 'Internship Openings'}
          </h1>
          <p className="text-slate-600 mt-2">
            {activeType === 'Job' 
              ? 'Maximize your career potential with matched roles.' 
              : 'Find internships that align with your current skills.'}
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full md:w-auto">
          <div className="flex p-1 bg-slate-200/50 backdrop-blur-sm rounded-xl self-center md:self-end">
            <button 
              onClick={() => setActiveType('Job')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                activeType === 'Job' 
                  ? 'bg-white text-brand-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Jobs
            </button>
            <button 
              onClick={() => setActiveType('Internship')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                activeType === 'Internship' 
                  ? 'bg-white text-brand-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Internships
            </button>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
            <input 
              type="text" 
              className="input-field pl-10 pr-10 shadow-sm focus:ring-2 focus:ring-brand-500/20" 
              placeholder={`Search ${activeType.toLowerCase()}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-8">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => {
              const { percentage, matched, missing } = calculateMatch(job.skills);
              const canApply = percentage >= 75;
              const isApplied = appliedJobs.has(job.id);

              return (
                <div key={job.id} className="glass-card overflow-hidden group hover:border-brand-300 transition-all duration-300">
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className="text-2xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                            {job.title}
                          </h2>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-50 text-brand-600 text-[10px] font-bold uppercase tracking-widest rounded-md border border-brand-100">
                            <Info className="w-3 h-3" />
                            {job.type}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 mb-6">
                          <Building className="w-4 h-4" />
                          <span className="font-medium text-lg">{job.company}</span>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              Required Skills
                              <span className="normal-case font-normal text-slate-400">({matched.length}/{job.skills?.length})</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {job.skills && job.skills.map((skill, index) => {
                                const isMatched = matched.includes(skill);
                                return (
                                  <span 
                                    key={index} 
                                    className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 border transition-colors ${
                                      isMatched 
                                        ? 'bg-green-50 text-green-700 border-green-100' 
                                        : 'bg-slate-50 text-slate-500 border-slate-100'
                                    }`}
                                  >
                                    {isMatched ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                                    {skill}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex flex-col justify-center items-center md:items-end">
                            <div className="relative w-24 h-24 flex items-center justify-center mb-2">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle cx="48" cy="48" r="42" className="stroke-slate-100 fill-none" strokeWidth="6" />
                                <circle 
                                  cx="48" cy="48" r="42" 
                                  className={`${percentage >= 75 ? 'stroke-green-500' : 'stroke-red-500'} fill-none transition-all duration-1000`}
                                  strokeWidth="6" 
                                  strokeDasharray={`${2 * Math.PI * 42}`}
                                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - percentage / 100)}`}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-xl font-bold ${percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>{percentage}%</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase">Match</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {percentage >= 75 ? (
                                <div className="text-green-600 text-xs font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Eligible
                                </div>
                              ) : (
                                <div className="text-red-500 text-xs font-bold flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  Not Eligible
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center pt-6 border-t border-slate-100">
                      {isApplied ? (
                        <div className="flex-1 w-full bg-green-50 text-green-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-green-100">
                          <CheckCircle2 className="w-5 h-5" />
                          Applied Successfully
                        </div>
                      ) : (
                        <>
                          {!canApply && (
                            <div className="flex-1 flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                              <p className="text-xs text-amber-900 font-medium">
                                You need at least 75% match to apply. Improve your skills to reach the threshold!
                              </p>
                            </div>
                          )}
                          <div className={canApply ? "flex-1 w-full" : ""}>
                            <button 
                              onClick={() => handleApply(job.id, percentage, job.title)}
                              disabled={!canApply}
                              className={`w-full py-4 px-8 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                                canApply 
                                  ? 'btn-primary shadow-lg shadow-brand-500/20' 
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              }`}
                            >
                              {canApply ? <Send className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                              Apply for {activeType}
                            </button>
                          </div>
                        </>
                      )}
                      
                      <Link 
                        to={`/match/${job.id}`}
                        className="p-4 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded-xl transition-all"
                        title="View Detailed Breakdown"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </Link>
                    </div>
                  </div>

                  {missing.length > 0 && (
                    <div className="bg-slate-50/80 border-t border-slate-100 p-6 md:px-8">
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-4 h-4 text-brand-600" />
                        <h3 className="text-[11px] font-bold text-brand-900 uppercase tracking-widest">Path to Success: Recommended Learning</h3>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {missing.map((skill, idx) => {
                          const suggestion = COURSE_MAP[skill];
                          return (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-brand-200 hover:shadow-sm transition-all group/item">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Learn {skill}</span>
                                <span className="text-xs font-semibold text-slate-700 truncate max-w-[180px]">
                                  {suggestion ? suggestion.name : `Mastering ${skill} fundamentals`}
                                </span>
                              </div>
                              <a 
                                href={suggestion ? suggestion.link : "#"} 
                                className="p-2 bg-brand-50 text-brand-600 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity"
                                title="Visit Course"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center p-16 text-slate-500 glass-card bg-slate-50/50 flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-700">No jobs found</p>
                <p className="text-sm">Try adjusting your search query or keywords.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
