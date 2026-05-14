"use client";
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { FileText, FilePlus, X, RefreshCw, Zap, Upload, Briefcase } from 'lucide-react';
import ScoreOverview from '../../components/resume/ScoreOverview';
import SectionAnalysis from '../../components/resume/SectionAnalysis';
import ProjectAnalysis from '../../components/resume/ProjectAnalysis';
import SkillAnalysis from '../../components/resume/SkillAnalysis';
import RecruiterView from '../../components/resume/RecruiterView';
import ImprovementPlan from '../../components/resume/ImprovementPlan';

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
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center' }}>
      <div className="glass" style={{ width: 80, height: 80, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}><FileText size={40} /></div>
      <h2 style={{ fontSize: 24, fontWeight: 800 }}>Sign in to analyze your resume</h2>
      <p style={{ color: '#64748b', maxWidth: 360 }}>Get enterprise-grade AI resume intelligence powered by Gemini.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => router.push('/login')} className="btn-primary">Sign In</button>
        <button onClick={() => router.push('/register')} className="btn-secondary">Create Account</button>
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop: 32, paddingBottom: 60 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 999, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          <Zap size={14} /> Enterprise AI Resume Intelligence Engine
          {isAnalyzing && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block', animation: 'glowPulse 1s infinite' }} />}
        </div>
        <h1 className="gradient-text" style={{ fontSize: 40, fontWeight: 900, marginBottom: 12 }}>AI Resume Analyzer</h1>
        <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 560, margin: '0 auto' }}>
          Deep line-by-line analysis. Real-time ATS scoring. Recruiter simulation. Powered by Gemini AI.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>
        {/* LEFT — Input Panel */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Role */}
          <div className="glass" style={{ padding: 20 }}>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Briefcase size={15} style={{ color: '#818cf8' }} /> Target Job Role
            </label>
            <input type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)}
              className="input-field" placeholder="e.g. Software Engineer" list="roles-list" />
            <datalist id="roles-list">{ROLES.map(r => <option key={r} value={r} />)}</datalist>
          </div>

          {/* Mode + Input */}
          <div className="glass" style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 6, background: '#0f172a', padding: 4, borderRadius: 12, marginBottom: 16 }}>
              {['✏️ Paste Text', '📎 Upload File'].map((label, i) => {
                const m = i === 0 ? 'text' : 'file';
                return (
                  <button key={m} onClick={() => setInputMode(m)} style={{
                    flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                    background: inputMode === m ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'transparent',
                    color: inputMode === m ? 'white' : '#64748b',
                  }}>{label}</button>
                );
              })}
            </div>

            {inputMode === 'text' ? (
              <div>
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 12 }}>
                  <textarea value={resumeText} onChange={e => { setResumeText(e.target.value); }}
                    className="input-field" style={{ height: 420, resize: 'vertical', fontFamily: 'monospace', fontSize: 11, lineHeight: 1.7, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                    placeholder="Paste your complete resume here...&#10;&#10;AI begins scanning automatically 2 seconds after you stop typing (100+ characters needed)." />
                  
                  <AnimatePresence>
                    {isAnalyzing && (
                      <motion.div 
                        initial={{ top: '0%' }}
                        animate={{ top: '100%' }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #818cf8, transparent)', boxShadow: '0 0 15px #818cf8', zIndex: 10, pointerEvents: 'none' }}
                      />
                    )}
                  </AnimatePresence>

                  <div style={{ 
                    display: 'flex', gap: 16, padding: '8px 16px', background: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.08)', borderTop: 'none', 
                    borderBottomLeftRadius: 12, borderBottomRightRadius: 12 
                  }}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      Words: <span style={{ color: '#cbd5e1', fontWeight: 700 }}>{localStats.words}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      Match: <span style={{ color: localStats.keywords > 0 ? '#34d399' : '#64748b', fontWeight: 700 }}>{localStats.keywords}/{localStats.totalKeywords}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginLeft: 'auto' }}>
                      {resumeText.length} chars {resumeText.length >= 100 ? '✓ Ready' : `(${100 - resumeText.length} more)`}
                    </div>
                  </div>
                </div>
                {resumeText.length >= 100 && (
                  <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 10, background: isAnalyzing ? 'rgba(99,102,241,0.1)' : 'rgba(52,211,153,0.08)', border: `1px solid ${isAnalyzing ? 'rgba(99,102,241,0.3)' : 'rgba(52,211,153,0.2)'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isAnalyzing
                      ? <><RefreshCw size={13} style={{ color: '#818cf8', animation: 'spin 1s linear infinite' }} /><span style={{ fontSize: 12, color: '#818cf8', fontWeight: 600 }}>{scanStage}</span></>
                      : <><span style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>✓ {lastUpdated ? `Updated at ${lastUpdated}` : 'Ready to scan'}</span></>
                    }
                  </div>
                )}
              </div>
            ) : (
              <div onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{ border: `2px dashed ${isDragging ? '#818cf8' : file ? '#34d399' : '#334155'}`, borderRadius: 16, padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: file ? 'rgba(52,211,153,0.04)' : 'transparent', transition: 'all 0.3s' }}>
                <input ref={fileInputRef} type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) { setFile(f); setError(''); } }} />
                {file ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <FileText size={40} style={{ color: '#34d399' }} />
                    <div><p style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>{file.name}</p><p style={{ fontSize: 12, color: '#64748b' }}>{(file.size / 1024).toFixed(1)} KB</p></div>
                    {isAnalyzing && <div style={{ fontSize: 12, color: '#818cf8', fontWeight: 600 }}>{scanStage}</div>}
                    <button onClick={e => { e.stopPropagation(); setFile(null); setResult(null); }} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <X size={12} /> Remove
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <FilePlus size={40} style={{ color: '#334155' }} className="animate-float" />
                    <p style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>Drop PDF or TXT</p>
                    <p style={{ fontSize: 12, color: '#475569' }}>Auto-scans immediately on upload</p>
                    <div style={{ padding: '6px 16px', borderRadius: 999, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', fontSize: 12, color: '#818cf8', fontWeight: 600 }}>
                      Browse Files
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13 }}>⚠️ {error}</div>}

          {result && (
            <button onClick={() => { setResult(null); setResumeText(''); setFile(null); setLastUpdated(''); }} className="btn-secondary" style={{ width: '100%', marginTop: 4 }}>
              <RefreshCw size={14} /> Clear & Restart
            </button>
          )}
        </motion.div>

        {/* RIGHT — Results */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <AnimatePresence mode="wait">
            {/* Scanning animation */}
            {isAnalyzing && !result && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass" style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, minHeight: 500 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 90, height: 90, borderRadius: '50%', border: '4px solid rgba(99,102,241,0.1)', borderTop: '4px solid #6366f1', borderRight: '4px solid #a855f7', animation: 'spin 1s linear infinite' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🧠</div>
                </div>
                <div style={{ textAlign: 'center', width: '100%', maxWidth: 300 }}>
                  <h3 style={{ fontWeight: 800, color: 'white', marginBottom: 8, fontSize: 20 }}>Deep AI Analysis Running</h3>
                  <p style={{ color: '#818cf8', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>{scanStage}</p>
                  
                  {/* Dynamic Progress Bar */}
                  <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden', marginBottom: 16 }}>
                    <motion.div 
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 12, ease: "linear" }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, #4f46e5, #a855f7)', boxShadow: '0 0 10px rgba(99,102,241,0.5)' }}
                    />
                  </div>
                  
                  <p style={{ color: '#475569', fontSize: 13 }}>Analyzing for: {targetRole}</p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 400 }}>
                  {['Line-by-line scan','Keyword detection','Project analysis','Skill evaluation','ATS engine','Recruiter simulation'].map((s, i) => (
                    <span key={s} style={{ padding: '5px 12px', borderRadius: 999, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', fontSize: 11, color: '#818cf8', fontWeight: 600 }}>
                      ⚙️ {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Empty state */}
            {!result && !isAnalyzing && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass" style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, minHeight: 500, textAlign: 'center' }}>
                <div className="animate-float" style={{ fontSize: 60 }}>🎯</div>
                <div>
                  <h3 style={{ fontWeight: 800, color: 'white', fontSize: 22, marginBottom: 8 }}>Enterprise AI Ready</h3>
                  <p style={{ color: '#475569', maxWidth: 360, fontSize: 14, lineHeight: 1.7 }}>
                    Paste your resume on the left. Our AI will perform deep line-by-line analysis, ATS scoring, project evaluation, and recruiter simulation — all in real-time.
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, width: '100%', maxWidth: 380 }}>
                  {[['🔍','Line-by-line scan'],['📊','ATS Engine'],['🎭','Recruiter AI'],['💡','Skill Gap'],['🚀','Project Rating'],['🗺️','Growth Path']].map(([e,l]) => (
                    <div key={l} className="glass" style={{ padding: '14px 8px', borderRadius: 12, textAlign: 'center' }}>
                      <div style={{ fontSize: 22, marginBottom: 4 }}>{e}</div>
                      <p style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>{l}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Results */}
            {result && (
              <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                {/* Tab Bar */}
                <div style={{ display: 'flex', gap: 4, overflowX: 'auto', marginBottom: 20, padding: '4px 0' }}>
                  {TABS.map((tab, i) => (
                    <button key={tab} onClick={() => setActiveTab(i)} style={{
                      padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap', transition: 'all 0.2s',
                      background: activeTab === i ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'rgba(255,255,255,0.04)',
                      color: activeTab === i ? 'white' : '#64748b',
                      boxShadow: activeTab === i ? '0 4px 15px rgba(99,102,241,0.3)' : 'none',
                    }}>{tab}</button>
                  ))}
                  {isAnalyzing && <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, background: 'rgba(99,102,241,0.1)', fontSize: 12, color: '#818cf8', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> Re-analyzing...
                  </div>}
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === 0 && <motion.div key="t0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ScoreOverview data={result} /></motion.div>}
                  {activeTab === 1 && <motion.div key="t1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SectionAnalysis data={result} /></motion.div>}
                  {activeTab === 2 && <motion.div key="t2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ProjectAnalysis data={result} /></motion.div>}
                  {activeTab === 3 && <motion.div key="t3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SkillAnalysis data={result} /></motion.div>}
                  {activeTab === 4 && <motion.div key="t4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><RecruiterView data={result} /></motion.div>}
                  {activeTab === 5 && <motion.div key="t5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ImprovementPlan data={result} /></motion.div>}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
