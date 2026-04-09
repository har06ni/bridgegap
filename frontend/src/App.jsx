import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, User, Briefcase, Sparkles, LogIn, 
  LogOut, UserPlus, LayoutDashboard, CheckCircle 
} from 'lucide-react';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import JobsPage from './pages/JobsPage';
import MatchResultPage from './pages/MatchResultPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ManageOpportunities from './pages/ManageOpportunities';
import MyApplicationsPage from './pages/MyApplicationsPage';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };
  
  const navItems = [
    { path: '/', label: 'Home', icon: <Home className="w-5 h-5" /> },
  ];

  if (user) {
    if (user.role === 'Student') {
      navItems.push({ path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> });
      navItems.push({ path: '/jobs', label: 'Opportunities', icon: <Briefcase className="w-5 h-5" /> });
      navItems.push({ path: '/applications', label: 'My Applications', icon: <CheckCircle className="w-5 h-5" /> });
    } else {
      navItems.push({ path: '/recruiter-dashboard', label: 'Admin', icon: <LayoutDashboard className="w-5 h-5" /> });
      navItems.push({ path: '/manage-opportunities', label: 'Manage', icon: <Briefcase className="w-5 h-5" /> });
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-brand-600 hover:opacity-80 transition-opacity">
            <Sparkles className="w-6 h-6" />
            <span className="font-bold text-xl tracking-tight">SkillBridge AI</span>
          </Link>
          <div className="flex gap-1 sm:gap-2 items-center">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${
                  location.pathname === item.path
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
            
            <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>
            
            {!user ? (
              <>
                <Link to="/login" className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-brand-600 font-medium text-sm">
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2 text-xs sm:text-sm">
                  Join Now
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-800 leading-tight">{user.name}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-tighter">{user.role}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-[-10rem] left-[-10rem] w-[40rem] h-[40rem] bg-brand-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10rem] right-[-10rem] w-[40rem] h-[40rem] bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
        
        <Navigation />
        
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 pt-24 pb-12 z-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/applications" element={<MyApplicationsPage />} />
            <Route path="/match/:id" element={<MatchResultPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
            <Route path="/manage-opportunities" element={<ManageOpportunities />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
