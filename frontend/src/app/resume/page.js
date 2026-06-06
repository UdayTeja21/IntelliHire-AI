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
import { useNotification } from '../../context/NotificationContext';
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

// Upgraded floating CSS graphic for light theme
const ATSGraphic = () => (
  <div className="relative w-64 h-36 flex items-center justify-center select-none animate-float hidden lg:flex shrink-0">
    {/* Ambient Glow */}
    <div className="absolute inset-0 bg-indigo-50 rounded-full blur-3xl pointer-events-none" />

    {/* ATS Score badge floating on left */}
    <div className="absolute left-0 top-6 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-3.5 rotate-[-8deg] z-20 scale-[0.85]">
      <div className="w-11 h-11 rounded-full border-2 border-emerald-500 flex flex-col items-center justify-center bg-emerald-50 shadow-sm">
        <span className="text-xs font-black text-emerald-600">92</span>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">ATS Score</p>
        <p className="text-[8px] text-emerald-600 font-bold">Excellent match</p>
      </div>
    </div>

    {/* Resume Document card floating on right */}
    <div className="absolute right-3 top-2 bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-slate-200 shadow-xl w-44 rotate-[6deg] z-10">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm" />
        <div className="w-14 h-1.5 bg-slate-200 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="w-full h-1 bg-slate-100 rounded-full" />
        <div className="w-[85%] h-1 bg-slate-100 rounded-full" />
        <div className="w-[90%] h-1 bg-slate-100 rounded-full" />
        <div className="w-[65%] h-1 bg-slate-100 rounded-full" />
      </div>
      
      {/* Miniature column chart inside document */}
      <div className="flex items-end justify-between gap-1 mt-4 h-6 border-b border-slate-100">
        <span className="w-2.5 bg-indigo-200 h-2 rounded-t-sm" />
        <span className="w-2.5 bg-indigo-300 h-3.5 rounded-t-sm" />
        <span className="w-2.5 bg-indigo-500 h-5 rounded-t-sm shadow-sm" />
        <span className="w-2.5 bg-purple-400 h-3 rounded-t-sm" />
      </div>
    </div>
    
    {/* Micro star sparkles */}
    <div className="absolute right-2 top-10 w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200 text-amber-500 shadow-sm rotate-12 animate-pulse">
      <Sparkles size={10} />
    </div>
  </div>
);

export default function ResumeAnalyzer() {
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const fileInputRef = useRef(null);
  const debounceRef = useRef(null);

  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState('Fresher (0-1 years)');
  const [resumeText, setResumeText] = useState('');
  const [file, setFile] = useState(null);
  const [inputMode, setInputMode] = useState('text');
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanStage, setScanStage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  // Track previous score for improvement notifications
  const prevScoreRef = useRef(null);
  
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

      if (result.recruiterSimulation) {
        doc.setFontSize(14);
        doc.text('Recruiter First Impression', 14, nextY);
        doc.setFontSize(11);
        const splitImpression = doc.splitTextToSize(`"${result.recruiterSimulation.technicalImpression || result.recruiterSimulation.projectQualityReview || result.recruiterFirstImpression || 'N/A'}"`, 180);
        doc.text(splitImpression, 14, nextY + 7);
        nextY += (splitImpression.length * 6) + 15;
      }

      if (result.atsEngine && result.atsEngine.missingKeywords && result.atsEngine.missingKeywords.length > 0) {
        doc.setFontSize(14);
        doc.text('ATS Missing Keywords', 14, nextY);
        doc.setFontSize(11);
        const keywords = result.atsEngine.missingKeywords.join(', ');
        const splitK = doc.splitTextToSize(keywords, 180);
        doc.text(splitK, 14, nextY + 7);
        nextY += (splitK.length * 6) + 15;
      }

      if (result.skillAnalysis && result.skillAnalysis.missingCriticalSkills && result.skillAnalysis.missingCriticalSkills.length > 0) {
        doc.setFontSize(14);
        doc.text('Missing Critical Skills', 14, nextY);
        doc.setFontSize(11);
        const skills = result.skillAnalysis.missingCriticalSkills.join(', ');
        const splitS = doc.splitTextToSize(skills, 180);
        doc.text(splitS, 14, nextY + 7);
        nextY += (splitS.length * 6) + 15;
      }

      if (result.projectAnalysis && result.projectAnalysis.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Project Analysis', 14, 20);
        let pY = 30;
        result.projectAnalysis.forEach((p, idx) => {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`${idx + 1}. ${p.name || 'Project'}`, 14, pY);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          const pDesc = doc.splitTextToSize(p.suggestions ? p.suggestions.join('. ') : 'N/A', 180);
          doc.text(pDesc, 14, pY + 6);
          pY += (pDesc.length * 5) + 12;
          if (pY > 270) {
            doc.addPage();
            pY = 20;
          }
        });
        nextY = pY + 5;
      }

      if (result.improvementRoadmap && result.improvementRoadmap.length > 0) {
        if (nextY > 220) {
          doc.addPage();
          nextY = 20;
        }
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Improvement Roadmap', 14, nextY);
        doc.setFont('helvetica', 'normal');
        const roadmapBody = result.improvementRoadmap.map(r => [
          r.priority || '-',
          r.action || r.step || '-',
          r.impact || r.reason || '-'
        ]);
        doc.autoTable({
          startY: nextY + 5,
          head: [['Priority', 'Action', 'Impact']],
          body: roadmapBody,
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229] }
        });
      }

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

  const runAnalysis = useCallback(async (text, role, fileObj, mode, expLevel) => {
    const hasContent = mode === 'file' ? !!fileObj : text.trim().length > 100;
    if (!hasContent) return;
    setIsAnalyzing(true); setError(''); setActiveTab(0);
    let si = 0;
    setScanStage(stages[0]);
    const stageTimer = setInterval(() => { si = (si + 1) % stages.length; setScanStage(stages[si]); }, 1800);
    try {
      const fd = new FormData();
      fd.append('target_role', role);
      fd.append('experience_level', expLevel);
      if (mode === 'file' && fileObj) fd.append('file', fileObj);
      else fd.append('resume_text', text);
      const res = await api.post('/resume/analyze', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      const newScore = res.data?.overall_score || 0;
      if (prevScoreRef.current !== null && newScore > prevScoreRef.current) {
        const diff = newScore - prevScoreRef.current;
        addNotification({
          title: 'Improvement Detected! 🚀',
          message: `Great job! Your resume score improved by ${diff} point${diff > 1 ? 's' : ''}.`,
          type: 'success'
        });
      } else {
        addNotification({
          title: 'Resume Analysis Complete 📄',
          message: 'We have finished analyzing your resume.',
          type: 'success'
        });
      }
      
      prevScoreRef.current = newScore;
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
    debounceRef.current = setTimeout(() => runAnalysis(resumeText, targetRole, null, 'text', experienceLevel), 2000);
    return () => clearTimeout(debounceRef.current);
  }, [resumeText, targetRole, experienceLevel, inputMode, runAnalysis]);

  useEffect(() => {
    if (inputMode === 'file' && file) runAnalysis('', targetRole, file, 'file', experienceLevel);
  }, [file, targetRole, experienceLevel, inputMode, runAnalysis]);

  if (!user) return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center gap-6 text-center max-w-md mx-auto fade-in">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-md animate-float">
        <FileText size={32} />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 font-sans">Sign in to analyze your resume</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Get enterprise-grade AI resume intelligence powered by Gemini.</p>
      </div>
      <div className="flex gap-4.5 w-full mt-3">
        <button onClick={() => router.push('/login')} className="flex-1 py-2.5 bg-[#3b59df] text-white rounded-xl font-bold hover:bg-[#2c45b8] transition-colors">Sign In</button>
        <button onClick={() => router.push('/register')} className="flex-1 py-2.5 bg-white dark:bg-[#121629] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Create Account</button>
      </div>
    </div>
  );

  return (
    <div className="py-6 space-y-6 fade-in max-w-7xl mx-auto">
      
      {/* ─── Premium Header Banner ─── */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-[#121629] dark:via-[#151a2b] dark:to-[#0b0f19] p-6 md:p-10 border border-indigo-100 dark:border-[#1a1f33] shadow-sm relative flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden rounded-3xl md:rounded-[2.5rem]">
        
        <div className="flex-1 space-y-3 text-center md:text-left relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px] uppercase tracking-widest shadow-sm">
            <Sparkles size={12} className="animate-spin-slow" /> AI-Powered
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight font-sans">
            AI <span className="text-[#3b59df] dark:text-indigo-400">Resume Analyzer</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl text-sm font-medium leading-relaxed">
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
          <div className="bg-white dark:bg-[#121629] p-5 md:p-6 border border-slate-200 dark:border-white/5 shadow-sm relative rounded-3xl md:rounded-[1.5rem]">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-5 h-5 rounded-full bg-[#3b59df] text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 shadow-sm">
                1
              </span>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-wide flex items-center gap-2 font-sans">
                <Briefcase size={14} className="text-[#3b59df] dark:text-indigo-400" /> Target Job Role
              </h3>
            </div>
            
            <div className="relative flex items-center">
              <Briefcase className="absolute left-4 text-slate-400 dark:text-slate-500" size={15} />
              <select
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#1a1f33] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3b59df]/20 focus:border-[#3b59df] transition-all appearance-none cursor-pointer"
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 text-slate-500 pointer-events-none" size={14} />
            </div>
          </div>

          {/* Experience Level selection (Step 2) */}
          <div className="bg-white dark:bg-[#121629] p-5 md:p-6 border border-slate-200 dark:border-white/5 shadow-sm relative rounded-3xl md:rounded-[1.5rem]">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-5 h-5 rounded-full bg-[#3b59df] text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 shadow-sm">
                2
              </span>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-wide flex items-center gap-2 font-sans">
                <User size={14} className="text-[#3b59df] dark:text-indigo-400" /> Experience Level
              </h3>
            </div>
            
            <div className="relative flex items-center">
              <User className="absolute left-4 text-slate-400 dark:text-slate-500" size={15} />
              <select
                value={experienceLevel}
                onChange={e => setExperienceLevel(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#1a1f33] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3b59df]/20 focus:border-[#3b59df] transition-all appearance-none cursor-pointer"
              >
                {['Fresher (0-1 years)', 'Junior (1-3 years)', 'Mid-Level (3-5 years)', 'Senior (5+ years)'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 text-slate-500 pointer-events-none" size={14} />
            </div>
          </div>

          {/* Upload Resume Container (Step 3) */}
          <div className="bg-white dark:bg-[#121629] p-5 md:p-6 border border-slate-200 dark:border-white/5 shadow-sm relative rounded-3xl md:rounded-[1.5rem]">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-5 h-5 rounded-full bg-[#3b59df] text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 shadow-sm">
                3
              </span>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-wide flex items-center gap-2 font-sans">
                <FileText size={14} className="text-[#3b59df] dark:text-indigo-400" /> Upload Resume
              </h3>
            </div>

            {/* Paste/Upload Tabs Toggle */}
            <div className="flex gap-1 bg-slate-100 dark:bg-[#1a1f33] p-1.5 rounded-xl border border-slate-200 dark:border-white/5 mb-4">
              {[
                { label: '✏️ Paste Text', mode: 'text' },
                { label: '📎 Upload File', mode: 'file' }
              ].map((tab) => (
                <button
                  key={tab.mode}
                  onClick={() => setInputMode(tab.mode)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all duration-300 ${
                    inputMode === tab.mode 
                      ? 'bg-white dark:bg-[#252b43] text-slate-800 dark:text-white shadow-sm border border-slate-200 dark:border-white/10' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Paste mode layout */}
            {inputMode === 'text' ? (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1a1f33]">
                  <textarea 
                    value={resumeText} 
                    onChange={e => setResumeText(e.target.value)}
                    className="w-full bg-transparent p-3 text-[11px] text-slate-700 dark:text-slate-300 font-mono leading-relaxed outline-none min-h-[160px] resize-y"
                    placeholder="Paste your complete resume here... Make sure to include all sections for accurate analysis." 
                  />
                  
                  {isAnalyzing && (
                    <motion.div 
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
                      initial={{ top: '0%' }}
                      animate={{ top: '100%' }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                    />
                  )}

                  {/* Character trackers */}
                  <div className="flex items-center gap-3 px-3 py-1.5 border-t border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-[9px] text-slate-600 dark:text-slate-400 font-semibold font-sans">
                    <div>Words: <span className="text-slate-800 dark:text-slate-200 font-extrabold">{localStats.words}</span></div>
                    <div>Keywords: <span className="text-[#3b59df] dark:text-indigo-400 font-extrabold">{localStats.keywords}/{localStats.totalKeywords}</span></div>
                    <div className="ml-auto">{resumeText.length} / 20,000</div>
                  </div>
                </div>

                {resumeText.length >= 100 && (
                  <div className="p-2.5 rounded-xl border flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20">
                    {isAnalyzing ? (
                      <>
                        <RefreshCw size={11} className="text-indigo-600 dark:text-indigo-400 animate-spin" />
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 leading-none">{scanStage}</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 leading-none">
                          {lastUpdated ? `Updated at ${lastUpdated}` : 'Ready to analyze'}
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Clean Analyze Trigger button */}
                <button 
                  disabled={isAnalyzing || resumeText.length < 100}
                  onClick={() => runAnalysis(resumeText, targetRole, null, 'text', experienceLevel)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-sm ${
                    resumeText.length >= 100 
                      ? 'bg-[#3b59df] hover:bg-[#2c45b8] text-white cursor-pointer'
                      : 'bg-slate-100 dark:bg-[#1a1f33] text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-white/5'
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
                      ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' 
                      : file 
                        ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-500/10' 
                        : 'border-slate-300 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-[#1a1f33] bg-white dark:bg-[#121629]'
                  }`}
                >
                  <input ref={fileInputRef} type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) { setFile(f); setError(''); } }} />
                  
                  {file ? (
                    <div className="flex flex-col items-center gap-3">
                      <FileText size={42} className="text-emerald-500" />
                      <div>
                        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{file.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      
                      {isAnalyzing && <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 animate-pulse mt-2">{scanStage}</div>}
                      
                      <button 
                        onClick={e => { e.stopPropagation(); setFile(null); setResult(null); }} 
                        className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-none border-none cursor-pointer hover:text-red-600 mt-2"
                      >
                        <X size={12} /> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-[#1a1f33] flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                        <FilePlus size={22} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Drag & drop PDF / TXT</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1">Auto-scans immediately on upload</p>
                      </div>
                      <div className="px-4 py-2 mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20">
                        Browse Files
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && <div className="p-4 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold leading-relaxed">⚠️ {error}</div>}

          {result && (
            <button 
              onClick={() => { setResult(null); setResumeText(''); setFile(null); setLastUpdated(''); }} 
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 bg-white dark:bg-[#121629] text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer transition-colors shadow-sm"
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
                className="bg-white dark:bg-[#121629] p-12 border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-8 min-h-[500px]"
              >
                <div className="relative">
                  {/* Rotating loader ring */}
                  <div className="w-20 h-20 rounded-full border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 border-r-purple-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-3xl select-none">🧠</div>
                </div>

                <div className="text-center space-y-3 max-w-sm">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-sans">Deep AI Analysis Running</h3>
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">{scanStage}</p>
                  
                  {/* Glowing progress line */}
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-[#1a1f33] rounded-full overflow-hidden relative">
                    <motion.div 
                      className="h-full bg-indigo-500"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 12, ease: "linear" }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Analyzing for target role: {targetRole}</p>
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
                    <span key={s} className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
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
                className="bg-white dark:bg-[#121629] p-6 md:p-8 border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-6 min-h-[420px]"
              >
                {/* Visual anchor logo */}
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl shadow-sm">
                  <BarChart2 size={32} />
                </div>
                
                <div className="text-center space-y-4 max-w-sm">
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans">Ready to Analyze</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
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
                          ? 'bg-[#3b59df] text-white shadow-sm' 
                          : 'bg-white dark:bg-[#121629] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                  
                  {/* Download button */}
                  <button 
                    onClick={downloadReport} 
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer border bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-400 shrink-0 transition-colors ml-auto shadow-sm"
                  >
                    <Download size={15} /> Download Report
                  </button>

                  {isAnalyzing && (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-sm font-bold text-indigo-600 dark:text-indigo-400 shrink-0 select-none">
                      <RefreshCw size={14} className="animate-spin" /> Re-analyzing...
                    </div>
                  )}
                </div>

                {/* Sub panels contents display */}
                <div className="bg-white dark:bg-[#121629] p-8 border border-slate-200 dark:border-white/5 shadow-sm relative rounded-[1.5rem] min-h-[500px]">
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
