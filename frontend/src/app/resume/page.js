"use client";
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Briefcase, 
  Download, 
  FilePlus, 
  FileText, 
  RefreshCw, 
  X, 
  Zap, 
  Sparkles, 
  ChevronRight, 
  Search, 
  BarChart2, 
  User, 
  Lightbulb, 
  Rocket, 
  ChevronDown,
  TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import ImprovementPlan from '../../components/resume/ImprovementPlan';
import ProjectAnalysis from '../../components/resume/ProjectAnalysis';
import RecruiterView from '../../components/resume/RecruiterView';
import ScoreOverview from '../../components/resume/ScoreOverview';
import SectionAnalysis from '../../components/resume/SectionAnalysis';
import SkillAnalysis from '../../components/resume/SkillAnalysis';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

const ROLES = ['Software Engineer','Frontend Developer','Backend Developer','Full Stack Developer','Data Scientist','AI/ML Engineer','DevOps Engineer','Product Manager','UI/UX Designer','Data Analyst'];
const TABS = ['Overview','Sections','Projects','Skills','Recruiter View','Improvement Plan'];

const ROLES_KEYWORDS = {
  'Software Engineer': ['Python', 'Java', 'Algorithms', 'Data Structures', 'Git', 'Agile', 'SQL', 'Unit Testing', 'CI/CD'],
  'Frontend Developer': ['React', 'TypeScript', 'Tailwind', 'CSS', 'HTML', 'JavaScript', 'Next.js', 'Redux', 'UX'],
  'Backend Developer': ['Node.js', 'Express', 'PostgreSQL', 'Microservices', 'Docker', 'Redis', 'GraphQL', 'API', 'Go'],
  'Full Stack Developer': ['React', 'Node.js', 'Database', 'Auth', 'Deployment', 'System Design', 'JavaScript', 'AWS'],
  'Data Scientist': ['Python', 'Pandas', 'NumPy', 'TensorFlow', 'Scikit-Learn', 'Statistics', 'R', 'SQL', 'Deep Learning'],
  'AI/ML Engineer': ['Neural Networks', 'NLP', 'PyTorch', 'Transformers', 'CV', 'LLMs', 'Model Optimization', 'Python'],
  'DevOps Engineer': ['Kubernetes', 'Docker', 'Terraform', 'Jenkins', 'Cloud', 'Monitoring', 'Linux', 'Automation'],
  'Product Manager': ['Roadmap', 'Strategy', 'User Research', 'Agile', 'Scrum', 'Stakeholder', 'Data-driven', 'Product Life Cycle'],
  'UI/UX Designer': ['Figma', 'Prototyping', 'User Flows', 'Design Systems', 'Adobe XD', 'Research', 'Accessibility', 'Wireframes'],
  'Data Analyst': ['SQL', 'Tableau', 'Power BI', 'Excel', 'Data Cleaning', 'Visualization', 'Dashboards', 'Reporting']
};

function useCountUp(target, duration = 1000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) { setCount(0); return; }
    let v = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      v += step;
      if (v >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(v));
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return count;
}

export { useCountUp };

// Upgraded floating CSS graphic
const ATSGraphic = () => (
  <div className="relative w-64 h-36 flex items-center justify-center select-none animate-float hidden lg:flex shrink-0">
    {/* Ambient Glow */}
    <div className="absolute inset-0 bg-[#6366f1]/8 rounded-full blur-3xl pointer-events-none" />

    {/* ATS Score badge floating on left */}
    <div className="absolute left-0 top-6 bg-[#070611]/90 backdrop-blur-md p-3.5 rounded-2xl border border-[#6366f1]/25 shadow-2xl flex items-center gap-3.5 rotate-[-8deg] z-20 scale-[0.85] shadow-[0_15px_30px_-5px_rgba(99,102,241,0.25)]">
      <div className="w-11 h-11 rounded-full border-2 border-teal-500/80 flex flex-col items-center justify-center bg-black/40 shadow-[0_0_12px_rgba(20,184,166,0.3)]">
        <span className="text-xs font-black text-teal-400">92</span>
      </div>
      <div>
        <p className="text-[10px] font-black text-white uppercase tracking-wider">ATS Score</p>
        <p className="text-[8px] text-teal-400 font-bold">Excellent match</p>
      </div>
    </div>

    {/* Resume Document card floating on right */}
    <div className="absolute right-3 top-2 bg-slate-800/95 backdrop-blur-md p-5 rounded-2xl border border-white/5 shadow-2xl w-44 rotate-[6deg] z-10 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_6px_#14b8a6]" />
        <div className="w-14 h-1.5 bg-slate-700/80 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="w-full h-1 bg-slate-800 rounded-full" />
        <div className="w-[85%] h-1 bg-slate-800 rounded-full" />
        <div className="w-[90%] h-1 bg-slate-800 rounded-full" />
        <div className="w-[65%] h-1 bg-slate-800 rounded-full" />
      </div>
      
      {/* Miniature column chart inside document */}
      <div className="flex items-end justify-between gap-1 mt-4 h-6 border-b border-white/5">
        <span className="w-2.5 bg-teal-500/30 h-2 rounded-t-sm" />
        <span className="w-2.5 bg-teal-500/50 h-3.5 rounded-t-sm" />
        <span className="w-2.5 bg-teal-500 h-5 rounded-t-sm shadow-[0_0_5px_rgba(20,184,166,0.4)]" />
        <span className="w-2.5 bg-blue-500 h-3 rounded-t-sm" />
      </div>
    </div>
    
    {/* Micro star sparkles */}
    <div className="absolute right-2 top-10 w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30 text-amber-400 shadow-md rotate-12 animate-pulse">
      <Sparkles size={10} />
    </div>
  </div>
);

export default function ResumeAnalyzer() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const debounceRef = useRef(null);

  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [resumeText, setResumeText] = useState('');
  const [file, setFile] = useState(null);
  const [inputMode, setInputMode] = useState('text');
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanStage, setScanStage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');
  const [localStats, setLocalStats] = useState({ words: 0, keywords: 0, totalKeywords: 0 });

  const downloadReport = async () => {
    if (!result || !result.resume_id) return;
    try {
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');

      const doc = new jsPDF();
      doc.setFont('helvetica');

      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229);
      doc.text('IntelliHire AI - Resume Report', 14, 20);

      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
      doc.text(`Target Role: ${targetRole}`, 14, 34);

      doc.setFontSize(14);
      doc.setTextColor(20, 20, 20);
      doc.text('Score Breakdown', 14, 45);

      const tScore = result.technicalStrengthScore || result.technicalStrength || result.technical_strength_score || 0;
      const pScore = result.projectQualityScore || result.projectQuality || result.project_quality_score || 0;
      const hProb = result.hiringProbability || result.hiring_probability || 0;

      doc.autoTable({
        startY: 50,
        head: [['Metric', 'Score (out of 100)']],
        body: [
          ['ATS Score', result.atsScore || result.ats_score || 0],
          ['Recruiter Score', result.recruiterScore || result.recruiter_score || 0],
          ['Technical Strength', tScore],
          ['Project Quality', pScore],
          ['Hiring Probability', hProb]
        ],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] }
      });

      let nextY = doc.lastAutoTable.finalY + 15;

      doc.setFontSize(14);
      doc.text('Overall Verdict', 14, nextY);
      doc.setFontSize(11);
      const splitVerdict = doc.splitTextToSize(result.overallVerdict || 'N/A', 180);
      doc.text(splitVerdict, 14, nextY + 7);

      nextY += (splitVerdict.length * 6) + 15;

      doc.setFontSize(14);
      doc.text('Recruiter First Impression', 14, nextY);
      doc.setFontSize(11);
      const splitImpression = doc.splitTextToSize(`"${result.recruiterFirstImpression || 'N/A'}"`, 180);
      doc.text(splitImpression, 14, nextY + 7);

      doc.save(`IntelliHire_Resume_Report_${targetRole.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Failed to download report:', err);
    }
  };

  // Instant local analysis as you type
  useEffect(() => {
    if (inputMode !== 'text') return;
    const words = resumeText.trim() ? resumeText.trim().split(/\s+/).length : 0;
    const keywords = ROLES_KEYWORDS[targetRole] || [];
    const found = keywords.filter(k => new RegExp(`\\b${k}\\b`, 'gi').test(resumeText)).length;
    setLocalStats({ words, keywords: found, totalKeywords: keywords.length });
  }, [resumeText, targetRole, inputMode]);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.type === 'application/pdf' || f.type === 'text/plain')) { setFile(f); setError(''); }
    else setError('Upload a PDF or TXT file.');
  }, []);

  const stages = ['Parsing resume structure...', 'Scanning keywords...', 'Analyzing projects...', 'Evaluating skills...', 'Running ATS engine...', 'Simulating recruiter review...', 'Generating insights...'];

  const runAnalysis = useCallback(async (text, role, fileObj, mode) => {
    const hasContent = mode === 'file' ? !!fileObj : text.trim().length > 100;
    if (!hasContent) return;
    setIsAnalyzing(true); setError(''); setActiveTab(0);
    let si = 0;
    setScanStage(stages[0]);
    const stageTimer = setInterval(() => { si = (si + 1) % stages.length; setScanStage(stages[si]); }, 1800);
    try {
      const fd = new FormData();
      fd.append('target_role', role);
      if (mode === 'file' && fileObj) fd.append('file', fileObj);
      else fd.append('resume_text', text);
      const res = await api.post('/resume/analyze', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(res.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Make sure backend is running.');
    } finally {
      clearInterval(stageTimer); setIsAnalyzing(false); setScanStage('');
    }
  }, []);

  useEffect(() => {
    if (inputMode !== 'text' || resumeText.trim().length < 100) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runAnalysis(resumeText, targetRole, null, 'text'), 2000);
    return () => clearTimeout(debounceRef.current);
  }, [resumeText, targetRole, inputMode, runAnalysis]);

  useEffect(() => {
    if (inputMode === 'file' && file) runAnalysis('', targetRole, file, 'file');
  }, [file, targetRole, inputMode, runAnalysis]);

  if (!user) return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center gap-6 text-center max-w-md mx-auto fade-in">
      <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400 shadow-xl animate-float">
        <FileText size={32} />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-white font-sans">Sign in to analyze your resume</h2>
        <p className="text-sm text-slate-400 font-semibold leading-relaxed">Get enterprise-grade AI resume intelligence powered by Gemini.</p>
      </div>
      <div className="flex gap-4.5 w-full mt-3">
        <button onClick={() => router.push('/login')} className="btn-primary flex-1">Sign In</button>
        <button onClick={() => router.push('/register')} className="btn-secondary flex-1">Create Account</button>
      </div>
    </div>
  );

  return (
    <div className="py-6 space-y-6 fade-in max-w-7xl mx-auto">
      
      {/* ─── Premium Header Banner ─── */}
      <div className="glass-premium p-8 md:p-10 border border-slate-700/50 bg-slate-800/50 shadow-2xl relative flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden rounded-[2.5rem]">
        {/* Glow Circles */}
        <div className="absolute top-[-50%] left-[-10%] w-[380px] h-[380px] bg-teal-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[10%] w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="flex-1 space-y-3 text-center md:text-left relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 font-extrabold text-[10px] uppercase tracking-widest shadow-md">
            <Sparkles size={12} className="animate-spin-slow" /> AI-Powered
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight font-sans">
            AI <span className="text-teal-400">Resume Analyzer</span>
          </h1>
          <p className="text-slate-300 max-w-xl text-sm font-semibold leading-relaxed">
            Deep line-by-line analysis. Real-time ATS scoring. Recruiter simulation. Powered by Gemini AI.
          </p>
        </div>

        {/* Floating CSS illustration */}
        <ATSGraphic />
      </div>

      {/* Grid container for left Workspace & right Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* ─── LEFT: Input Workspace ─── */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Target Role selection (Step 1) */}
          <div className="glass-premium p-6 border border-slate-700/50 shadow-lg relative rounded-[1.5rem]">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-5 h-5 rounded-full bg-teal-500 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 shadow-md">
                1
              </span>
              <h3 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2 font-sans">
                <Briefcase size={14} className="text-teal-400" /> Target Job Role
              </h3>
            </div>
            
            <div className="custom-select-wrap">
              <Briefcase className="input-icon" size={15} />
              <select
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                className="input-field cursor-pointer font-semibold appearance-none pr-10 py-2.5"
              >
                {ROLES.map(r => (
                  <option key={r} value={r} className="bg-[#0b0a1a] text-white">{r}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 text-slate-500 pointer-events-none" size={14} />
            </div>
          </div>

          {/* Upload Resume Container (Step 2) */}
          <div className="glass-premium p-6 border border-slate-700/50 shadow-lg relative rounded-[1.5rem]">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-5 h-5 rounded-full bg-teal-500 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 shadow-md">
                2
              </span>
              <h3 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2 font-sans">
                <FileText size={14} className="text-teal-400" /> Upload Resume
              </h3>
            </div>

            {/* Paste/Upload Tabs Toggle */}
            <div className="flex gap-1 bg-[#03030a] p-1.5 rounded-xl border border-white/5 mb-4">
              {[
                { label: '✏️ Paste Text', mode: 'text' },
                { label: '📎 Upload File', mode: 'file' }
              ].map((tab) => (
                <button
                  key={tab.mode}
                  onClick={() => setInputMode(tab.mode)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all duration-300 ${
                    inputMode === tab.mode 
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md border-t border-white/10' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Paste mode layout */}
            {inputMode === 'text' ? (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#03030a]">
                  <textarea 
                    value={resumeText} 
                    onChange={e => setResumeText(e.target.value)}
                    className="w-full bg-transparent p-3 text-[11px] text-slate-300 font-mono leading-relaxed outline-none min-h-[160px] resize-y"
                    placeholder="Paste your complete resume here... Make sure to include all sections for accurate analysis." 
                  />
                  
                  {isAnalyzing && (
                    <motion.div 
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_12px_#6366f1]"
                      initial={{ top: '0%' }}
                      animate={{ top: '100%' }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                    />
                  )}

                  {/* Character trackers */}
                  <div className="flex items-center gap-3 px-3 py-1.5 border-t border-white/[0.04] bg-white/[0.01] text-[9px] text-slate-500 font-semibold font-sans">
                    <div>Words: <span className="text-slate-300 font-extrabold">{localStats.words}</span></div>
                    <div>Keywords: <span className="text-teal-400 font-extrabold">{localStats.keywords}/{localStats.totalKeywords}</span></div>
                    <div className="ml-auto">{resumeText.length} / 20,000</div>
                  </div>
                </div>

                {resumeText.length >= 100 && (
                  <div className="p-2.5 rounded-xl border flex items-center gap-2 bg-indigo-500/5 border-indigo-500/15">
                    {isAnalyzing ? (
                      <>
                        <RefreshCw size={11} className="text-indigo-400 animate-spin" />
                        <span className="text-[11px] font-bold text-indigo-400 leading-none">{scanStage}</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_6px_#14b8a6]" />
                        <span className="text-[11px] font-bold text-teal-400 leading-none">
                          {lastUpdated ? `Updated at ${lastUpdated}` : 'Ready to analyze'}
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Clean Analyze Trigger button */}
                <button 
                  disabled={isAnalyzing || resumeText.length < 100}
                  onClick={() => runAnalysis(resumeText, targetRole, null, 'text')}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-extrabold text-xs border-t transition-all ${
                    resumeText.length >= 100 
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 text-white cursor-pointer shadow-lg border-white/10'
                      : 'bg-white/5 border-white/[0.02] text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Sparkles size={14} /> Analyze Resume
                </button>
              </div>
            ) : (
              /* File drag-and-drop upload mode */
              <div className="space-y-4">
                <div 
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }} 
                  onDragLeave={() => setIsDragging(false)} 
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-500/5' 
                      : file 
                        ? 'border-teal-500/40 bg-teal-500/[0.01]' 
                        : 'border-white/10 hover:border-white/20 bg-white/[0.01]'
                  }`}
                >
                  <input ref={fileInputRef} type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) { setFile(f); setError(''); } }} />
                  
                  {file ? (
                    <div className="flex flex-col items-center gap-3">
                      <FileText size={42} className="text-teal-400" />
                      <div>
                        <p className="text-xs font-extrabold text-white truncate max-w-[200px]">{file.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      
                      {isAnalyzing && <div className="text-xs font-bold text-indigo-400 animate-pulse mt-2">{scanStage}</div>}
                      
                      <button 
                        onClick={e => { e.stopPropagation(); setFile(null); setResult(null); }} 
                        className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-none border-none cursor-pointer hover:text-red-300 mt-2"
                      >
                        <X size={12} /> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 border border-white/10 animate-pulse">
                        <FilePlus size={22} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-white">Drag & drop PDF / TXT</p>
                        <p className="text-[10px] text-slate-500 font-bold mt-1">Auto-scans immediately on upload</p>
                      </div>
                      <div className="px-4 py-2 mt-2 text-xs font-bold text-indigo-300 border border-indigo-500/20 bg-indigo-500/5 rounded-xl hover:bg-indigo-500/10">
                        Browse Files
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && <div className="p-4 rounded-xl border border-red-500/15 bg-red-500/5 text-red-400 text-xs font-semibold leading-relaxed">⚠️ {error}</div>}

          {result && (
            <button 
              onClick={() => { setResult(null); setResumeText(''); setFile(null); setLastUpdated(''); }} 
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 cursor-pointer transition-colors"
            >
              <RefreshCw size={13} /> Clear & Restart
            </button>
          )}
        </div>

        {/* ─── RIGHT: Analysis Dashboard Results ─── */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            
            {/* Running loader screen */}
            {isAnalyzing && !result && (
              <motion.div 
                key="scanning" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="glass-premium p-12 border border-white/5 shadow-xl flex flex-col items-center justify-center gap-8 min-h-[500px]"
              >
                <div className="relative">
                  {/* Rotating loader ring */}
                  <div className="w-20 h-20 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 border-r-purple-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-3xl select-none">🧠</div>
                </div>

                <div className="text-center space-y-3 max-w-sm">
                  <h3 className="text-xl font-extrabold text-white font-sans">Deep AI Analysis Running</h3>
                  <p className="text-sm font-bold text-indigo-400 animate-pulse">{scanStage}</p>
                  
                  {/* Glowing progress line */}
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative border border-white/[0.02]">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-500 via-indigo-500 to-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 12, ease: "linear" }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">Analyzing for target role: {targetRole}</p>
                </div>

                {/* Sub-stages indicators */}
                <div className="flex flex-wrap gap-2.5 justify-center max-w-md mt-2">
                  {[
                    'Line-by-line scan',
                    'Keyword detection',
                    'Project analysis',
                    'Skill evaluation',
                    'ATS engine',
                    'Recruiter simulation'
                  ].map((s) => (
                    <span key={s} className="px-3 py-1.5 rounded-xl border border-indigo-500/15 bg-indigo-500/5 text-[10px] font-bold text-indigo-300">
                      ⚙️ {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Empty landing landing workspace dashboard layout */}
            {!result && !isAnalyzing && (
              <motion.div 
                key="empty" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="glass-premium p-6 md:p-8 border border-slate-700/50 shadow-xl flex flex-col items-center justify-center gap-6 min-h-[420px]"
              >
                {/* Visual anchor logo */}
                <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 text-2xl shadow-xl animate-float font-sans font-black">
                  <BarChart2 size={32} />
                </div>
                
                <div className="text-center space-y-4 max-w-sm">
                  <h3 className="text-2xl font-extrabold text-white font-sans">Ready to Analyze</h3>
                  <p className="text-sm text-slate-400 font-semibold leading-relaxed">
                    Paste your resume text or upload a PDF on the left panel to begin. Our AI will instantly scan your resume against your selected target role and provide actionable insights.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Results workspace tabs */}
            {result && (
              <motion.div key="result" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                
                {/* Tab selector bar */}
                <div className="flex flex-wrap gap-3 pb-2 items-center">
                  {TABS.map((tab, i) => (
                    <button 
                      key={tab} 
                      onClick={() => setActiveTab(i)} 
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all duration-300 shrink-0 ${
                        activeTab === i 
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg border-t border-white/10' 
                          : 'bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                  
                  {/* Download button */}
                  <button 
                    onClick={downloadReport} 
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer border bg-teal-500/10 border-teal-500/35 hover:bg-teal-500/20 text-teal-400 shrink-0 transition-colors ml-auto shadow-md hover:shadow-lg"
                  >
                    <Download size={15} /> Download Report
                  </button>

                  {isAnalyzing && (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm font-bold text-indigo-400 shrink-0 select-none">
                      <RefreshCw size={14} className="animate-spin" /> Re-analyzing...
                    </div>
                  )}
                </div>

                {/* Sub panels contents display */}
                <div className="glass p-8 border border-white/5 shadow-xl relative rounded-[1.5rem] min-h-[500px]">
                  <AnimatePresence mode="wait">
                    {activeTab === 0 && <motion.div key="t0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ScoreOverview data={result} /></motion.div>}
                    {activeTab === 1 && <motion.div key="t1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SectionAnalysis data={result} /></motion.div>}
                    {activeTab === 2 && <motion.div key="t2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ProjectAnalysis data={result} /></motion.div>}
                    {activeTab === 3 && <motion.div key="t3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SkillAnalysis data={result} /></motion.div>}
                    {activeTab === 4 && <motion.div key="t4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><RecruiterView data={result} /></motion.div>}
                    {activeTab === 5 && <motion.div key="t5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ImprovementPlan data={result} /></motion.div>}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
