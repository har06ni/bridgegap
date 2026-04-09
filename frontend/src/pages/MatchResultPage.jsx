import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Trophy, Send, Lock, AlertTriangle } from 'lucide-react';

export default function MatchResultPage() {
  const { id } = useParams();
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      setError('Please login to view match results');
      setLoading(false);
      return;
    }
    const userData = JSON.parse(savedUser);

    fetch(`/api/match/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userData.email })
    })
      .then(res => {
        console.log('POST /api/match response status:', res.status);
        if (!res.ok) throw new Error('Failed to fetch match');
        return res.json();
      })
      .then(data => {
        console.log('POST /api/match data:', data);
        setMatchData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleApply = () => {
    setApplied(true);
    // In a real app, this would POST to /api/apply
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div className="max-w-2xl mx-auto text-center p-12 glass-card">
        <p className="text-red-500 mb-4">Error: {error || 'Could not find match data'}</p>
        <Link to="/jobs" className="text-brand-600 hover:underline">Back to Jobs</Link>
      </div>
    );
  }

  const { matchPercentage, matchedSkills, missingSkills } = matchData;
  const canApply = matchPercentage >= 75;
  
  let scoreColor = 'text-red-500';
  let scoreBg = 'from-red-500/20 to-red-600/20';
  let scoreStroke = 'stroke-red-500';
  if (matchPercentage >= 75) {
    scoreColor = 'text-green-500';
    scoreBg = 'from-green-400/20 to-green-500/20';
    scoreStroke = 'stroke-green-500';
  } else if (matchPercentage >= 50) {
    scoreColor = 'text-amber-500';
    scoreBg = 'from-amber-400/20 to-amber-500/20';
    scoreStroke = 'stroke-amber-500';
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/jobs" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Opportunities
      </Link>

      <div className="glass-card overflow-hidden transition-all duration-500">
        <div className={`p-8 md:p-12 text-center bg-gradient-to-b ${scoreBg} border-b border-white/50`}>
          <div className="flex justify-center mb-6">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" className="stroke-slate-200/50 fill-none w-full h-full" strokeWidth="12" />
                <circle 
                  cx="96" cy="96" r="88" 
                  className={`${scoreStroke} fill-none w-full h-full transition-all duration-1000 ease-in-out`}
                  strokeWidth="12" 
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - matchPercentage / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-6xl font-bold ${scoreColor}`}>{matchPercentage}%</span>
                <span className="text-sm font-medium text-slate-600 uppercase tracking-widest mt-1">Match</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
            <Trophy className={`w-6 h-6 ${scoreColor}`} />
            {matchPercentage >= 75 ? 'Great Match!' : matchPercentage >= 50 ? 'Good Potential' : 'Needs Upskilling'}
          </h1>
          <p className="text-slate-600 mt-2 max-w-lg mx-auto">
            {matchPercentage >= 75 
              ? "You have most of the required skills for this position. Consider applying!"
              : "You might want to brush up on a few skills before applying for this role."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          <div className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-semibold text-slate-800">Matched Skills</h2>
            </div>
            {matchedSkills.length > 0 ? (
              <ul className="space-y-3">
                {matchedSkills.map((skill, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700 bg-green-50 rounded-lg px-4 py-2 border border-green-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="font-medium capitalize">{skill}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-sm italic">No matched skills for this job.</p>
            )}
          </div>

          <div className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <XCircle className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-semibold text-slate-800">Missing Skills</h2>
            </div>
            {missingSkills.length > 0 ? (
              <ul className="space-y-3">
                {missingSkills.map((skill, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700 bg-red-50 rounded-lg px-4 py-2 border border-red-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="font-medium capitalize">{skill}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-sm italic">You meet all the requirements! Perfect.</p>
            )}
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/30">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Validated Courses & Certifications</h2>
          {matchData.courses && matchData.courses.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {matchData.courses.map((course, i) => (
                <div key={i} className="px-4 py-2 bg-white border border-brand-100 rounded-xl shadow-sm text-sm font-semibold text-brand-700 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                  {course}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No additional certifications provided for this application.</p>
          )}
        </div>

        <div className="p-8 bg-white border-t border-slate-100 text-center">
          {!applied ? (
            <div className="flex flex-col items-center gap-4">
              {!canApply && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-full text-xs font-bold border border-amber-100 animate-pulse">
                  <AlertTriangle className="w-4 h-4" />
                  You need at least 75% match to apply. Improve your skills!
                </div>
              )}
              <button 
                onClick={handleApply}
                disabled={!canApply}
                className={`w-full max-w-sm py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all duration-300 ${
                  canApply 
                    ? 'btn-primary shadow-xl shadow-brand-500/20' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                {canApply ? <Send className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                {canApply ? 'Apply Now' : 'Application Locked'}
              </button>
            </div>
          ) : (
            <div className="py-2 animate-in fade-in zoom-in duration-500">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Application Sent!</h3>
                <p className="text-slate-500">Good luck! The recruiter will review your profile shortly.</p>
                <Link to="/jobs" className="mt-4 text-brand-600 font-semibold hover:underline">Browse more opportunities</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
