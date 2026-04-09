import { useState, useEffect } from 'react';
import { 
  UserCircle, Save, AlertCircle, CheckCircle, ChevronRight,
  CloudUpload, FileText, Trash2, Download, ExternalLink,
  Plus, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: '', skills: '', interests: '', courses: '', links: '' });
  const [savedProfile, setSavedProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Projects State
  const [projects, setProjects] = useState([]);
  const [projectTitle, setProjectTitle] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return;
    const userData = JSON.parse(savedUser);

    // Fetch Profile
    fetch(`/api/profile?email=${encodeURIComponent(userData.email)}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setSavedProfile(data);
          setProfile({
            name: data.name || '',
            skills: (data.skills || []).join(', ') || '',
            interests: data.interests || '',
            courses: (data.courses || []).join(', ') || '',
            links: (data.links || []).join('\n') || ''
          });
        }
      });

    // Fetch Projects
    fetchProjects(userData.email);
  }, []);

  const fetchProjects = (email) => {
    fetch(`/api/projects?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error('Error fetching projects:', err));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!projectTitle || selectedFiles.length === 0) return;

    const savedUser = localStorage.getItem('user');
    const userData = JSON.parse(savedUser);

    setUploading(true);
    const formData = new FormData();
    formData.append('email', userData.email);
    formData.append('title', projectTitle);
    Array.from(selectedFiles).forEach(file => {
      formData.append('files', file);
    });

    try {
      const res = await fetch('/api/projects/upload', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      
      setProjectTitle('');
      setSelectedFiles([]);
      e.target.reset();
      fetchProjects(userData.email);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project and its files?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const savedUser = localStorage.getItem('user');
        fetchProjects(JSON.parse(savedUser).email);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return;
    const userData = JSON.parse(savedUser);

    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          name: profile.name,
          skills: profile.skills, 
          interests: profile.interests,
          courses: profile.courses,
          links: profile.links
        })
      });
      const data = await res.json();
      setSavedProfile(data.profile);
      
      const updatedUser = { ...userData, name: data.profile.name };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 shadow-sm">
            <UserCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Student Dashboard</h1>
            <p className="text-slate-500 font-medium">Manage your profile and track active applications</p>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/applications')}
          className="btn-primary px-8 py-4 flex items-center gap-2 shadow-xl shadow-brand-500/10 active:scale-95 transition-all text-sm font-bold"
        >
          <CheckCircle className="w-5 h-5" />
          Track Applications
          <ChevronRight className="w-4 h-4 opacity-50" />
        </button>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-8">
          {/* Profile Form */}
          <div className="glass-card p-6 md:p-8">
            <h2 className="text-xl font-black mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-600" />
              Update Your Profile
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</label>
                <input 
                  type="text" required className="input-field" placeholder="John Doe"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Skills (comma separated)</label>
                <input 
                  type="text" className="input-field" placeholder="React, Node.js, Python"
                  value={profile.skills}
                  onChange={(e) => setProfile({...profile, skills: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Interests</label>
                <textarea 
                  className="input-field min-h-[100px] resize-y" placeholder="Tell us what you're passionate about..."
                  value={profile.interests}
                  onChange={(e) => setProfile({...profile, interests: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Courses & Certifications</label>
                <input 
                  type="text" className="input-field" placeholder="AWS Cloud Practitioner, React Advanced..."
                  value={profile.courses}
                  onChange={(e) => setProfile({...profile, courses: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-brand-500" />
                  Project Links (GitHub / Google Drive)
                </label>
                <textarea 
                  className="input-field min-h-[90px] resize-y font-mono text-xs" 
                  placeholder="https://github.com/username/project&#10;https://drive.google.com/share/...&#10;One link per line"
                  value={profile.links}
                  onChange={(e) => setProfile({...profile, links: e.target.value})}
                />
                <p className="text-[10px] text-slate-400 mt-1">Add one link per line. These will be visible to recruiters.</p>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 px-10">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
                {success && <span className="ml-4 text-green-600 font-bold text-sm">Updated Successfully!</span>}
              </div>
            </form>
          </div>

          {/* Project Showcase / Proof Submission */}
          <div className="glass-card p-6 md:p-8 border-brand-100">
            <h2 className="text-xl font-black mb-6 border-b border-slate-100 pb-2 flex items-center gap-2 text-brand-900">
              <CloudUpload className="w-5 h-5 text-brand-600" />
              Project Showcase & Proof Submission
            </h2>
            
            <form onSubmit={handleUpload} className="space-y-4 mb-10">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Project Title</label>
                <input 
                  type="text" required className="input-field" placeholder="e.g., E-commerce Dashboard"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Project Files (PDF, Images, ZIP)</label>
                <div className="relative group">
                  <input 
                    type="file" multiple required 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => setSelectedFiles(e.target.files)}
                  />
                  <div className="w-full py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:border-brand-300 group-hover:bg-brand-50/50 transition-all">
                    <CloudUpload className="w-10 h-10 text-slate-300 group-hover:text-brand-500" />
                    <span className="text-sm font-bold text-slate-500 group-hover:text-brand-700">
                      {selectedFiles.length > 0 ? `${selectedFiles.length} files selected` : 'Click or Drop files here'}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-black">Max 10MB per file</span>
                  </div>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={uploading || !projectTitle || selectedFiles.length === 0}
                className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                  uploading ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-900/10'
                }`}
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                {uploading ? 'Uploading Proof...' : 'Submit Project Proof'}
              </button>
            </form>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">My Submissions</h3>
              {projects.length > 0 ? projects.map(project => (
                <div key={project.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group relative">
                  <button 
                    onClick={() => deleteProject(project.id)}
                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <h4 className="font-extrabold text-slate-800 mb-4 pr-10">{project.title}</h4>
                  <div className="grid gap-3">
                    {project.files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/50 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700 truncate max-w-[180px]">{file.name}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>
                        <a 
                          href={file.path} target="_blank" rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                          title="View/Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-slate-400 italic text-sm">No projects submitted yet.</div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          {savedProfile && savedProfile.name ? (
            <div className="glass-card p-6 md:p-8 bg-gradient-to-br from-brand-600 to-brand-800 text-white h-auto sm:sticky sm:top-24">
              <div className="mb-8">
                 <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-white mb-4 border border-white/30 shadow-2xl">
                    <span className="text-4xl font-black">{savedProfile.name.charAt(0)}</span>
                 </div>
                 <h2 className="text-2xl font-black uppercase tracking-tight">{savedProfile.name}</h2>
                 <p className="text-brand-100 font-medium opacity-80">SkillBridge Student Scholar</p>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-[10px] font-black text-brand-200 uppercase tracking-widest mb-3 opacity-60">Verified Expertise</h3>
                  {savedProfile.skills && savedProfile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {savedProfile.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-xs font-bold text-white uppercase tracking-tighter">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : <p className="text-white/40 text-xs font-bold uppercase tracking-widest">No skills added yet</p>}
                </div>
                
                <div>
                  <h3 className="text-[10px] font-black text-brand-200 uppercase tracking-widest mb-1 opacity-60">Professional Bio</h3>
                  <p className="text-white/90 text-sm italic font-medium leading-relaxed">"{savedProfile.interests || 'Add your bio to shine!'}"</p>
                </div>

                <div>
                   <h3 className="text-[10px] font-black text-brand-200 uppercase tracking-widest mb-3 opacity-60">Learning Journey</h3>
                   <div className="flex flex-col gap-2">
                      {savedProfile.courses && savedProfile.courses.length > 0 ? savedProfile.courses.map((course, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                           <CheckCircle className="w-4 h-4 text-brand-200" />
                           <span className="text-[11px] font-bold uppercase">{course}</span>
                        </div>
                      )) : <span className="text-white/40 text-[10px] font-bold uppercase">No certifications listed</span>}
                   </div>
                </div>

                {savedProfile.links && savedProfile.links.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-black text-brand-200 uppercase tracking-widest mb-3 opacity-60">Project Links</h3>
                    <div className="flex flex-col gap-2">
                      {savedProfile.links.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group/link"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-brand-200 flex-shrink-0" />
                          <span className="text-[10px] font-bold text-white/80 truncate group-hover/link:text-white">{link}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 md:p-8 text-center flex flex-col items-center justify-center min-h-[300px] border-dashed bg-slate-50/50">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <UserCircle className="w-8 h-8" />
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-tighter text-xs">No profile snapshot yet.<br /> Fill out the form to generate one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
