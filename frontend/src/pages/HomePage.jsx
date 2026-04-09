import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Brain, Target } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center animate-fade-in">
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 bg-brand-400 blur-2xl opacity-20 rounded-full animate-pulse" />
        <div className="relative bg-white/50 backdrop-blur-sm border border-brand-100 px-4 py-2 rounded-full text-brand-600 font-medium text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Career Matching</span>
        </div>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
        Bridge the gap between <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-blue-500">
          your skills & dream job
        </span>
      </h1>
      
      <p className="text-xl text-slate-600 max-w-2xl mb-12">
        Our intelligent matching system analyzes your profile to find perfectly curated opportunities tailored specifically to your unique skill set.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full md:w-auto">
        <Link to="/dashboard" className="btn-primary flex items-center justify-center gap-2 text-lg">
          Create Profile
          <ArrowRight className="w-5 h-5" />
        </Link>
        <Link to="/jobs" className="px-8 py-3 bg-white border border-slate-200 hover:border-brand-300 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-all duration-300 shadow-sm text-lg flex items-center justify-center">
          Browse Jobs
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl text-left">
        <div className="glass-card p-6 flex items-start gap-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="p-3 bg-brand-100 text-brand-600 rounded-xl">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Smart Analysis</h3>
            <p className="text-slate-600">Enter your skills and let our system cross-reference them with current industry demands.</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-start gap-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Precision Matching</h3>
            <p className="text-slate-600">See exactly which skills you have and what you need to learn for any specific role.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
