"use client";
import { AnimatePresence, motion } from 'framer-motion';
import { 
  BarChart2, 
  Bot, 
  CheckCircle, 
  Download, 
  Mic, 
  PlayCircle, 
  Settings, 
  User, 
  Briefcase, 
  Code, 
  Signal, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Target, 
  Clock, 
  Heart, 
  Headphones, 
  HelpCircle,
  Play,
  ChevronDown
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../lib/api';

// ─── Silence-detection config ────────────────────────────────────────────────
const SILENCE_DELAY_MS = 15000; // ms of silence before auto-submitting

export default function Interview() {
  // ── Config phase ──
  const [config, setConfig] = useState({
    role: 'Frontend Developer',
    type: 'Technical',
    difficulty: 'Medium',
    resume_id: '',
  });
  const [resumes, setResumes] = useState([]);

  // ── Session phase ──
  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState([]);

  // ── Voice state ──
  const [liveTranscript, setLiveTranscript] = useState(''); // interim words
  const [finalTranscript, setFinalTranscript] = useState(''); // confirmed words
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [micStatus, setMicStatus] = useState('idle'); // 'idle' | 'listening' | 'processing'

  // ── Waveform bars ──
  const [barHeights, setBarHeights] = useState(Array(24).fill(4));

  // ── Refs ──
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const liveTranscriptRef = useRef('');
  const isEvaluatingRef = useRef(false);
  const isAiSpeakingRef = useRef(false);
  const scrollRef = useRef(null);
  const animFrameRef = useRef(null);

  // keep refs in sync
  useEffect(() => { finalTranscriptRef.current = finalTranscript; }, [finalTranscript]);
  useEffect(() => { liveTranscriptRef.current = liveTranscript; }, [liveTranscript]);
  useEffect(() => { isEvaluatingRef.current = isEvaluating; }, [isEvaluating]);
  useEffect(() => { isAiSpeakingRef.current = isAiSpeaking; }, [isAiSpeaking]);

  // ── Fetch resumes ──
  useEffect(() => {
    // Load resume history for dropdown
    api.get('/resume/history').then(r => setResumes(r.data)).catch(() => {});
  }, []);

  // ── Scroll to bottom ──
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [results, currentIndex, isEvaluating, liveTranscript]);

  // ─────────────────────────────────────────────────────────────────────────
  // Waveform animation while listening
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isListening) {
      const animate = () => {
        setBarHeights(prev =>
          prev.map(() => Math.random() * 32 + 4)
        );
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animFrameRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animFrameRef.current);
      setBarHeights(Array(24).fill(4));
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isListening]);

  // ─────────────────────────────────────────────────────────────────────────
  // Setup MediaRecorder for Whisper AI Transcription
  // ─────────────────────────────────────────────────────────────────────────
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Start / stop mic
  // ─────────────────────────────────────────────────────────────────────────
  const startListening = useCallback(async () => {
    if (isListening) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        
        setMicStatus('processing');
        setLiveTranscript('Transcribing with Whisper AI...');
        
        try {
          const res = await api.post('/interview/transcribe', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (res.data && res.data.text) {
            setFinalTranscript(prev => prev + (prev ? ' ' : '') + res.data.text);
          }
        } catch (err) {
          console.error('Transcription failed:', err);
        } finally {
          setLiveTranscript('');
          setMicStatus('idle');
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsListening(true);
      setMicStatus('listening');
    } catch (err) {
      alert('Microphone access denied or not available.');
      console.error(err);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // TTS — speak question, then auto-start listening
  // ─────────────────────────────────────────────────────────────────────────
  const speakQuestion = useCallback((text) => {
    if (!('speechSynthesis' in window)) {
      startListening();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      isAiSpeakingRef.current = true;
      setIsAiSpeaking(true);
      stopListening();
    };
    utterance.onend = () => {
      isAiSpeakingRef.current = false;
      setIsAiSpeaking(false);
      // small delay then start listening
      setTimeout(() => startListening(), 600);
    };
    utterance.onerror = () => {
      isAiSpeakingRef.current = false;
      setIsAiSpeaking(false);
      startListening();
    };

    window.speechSynthesis.speak(utterance);
  }, [startListening, stopListening]);

  // Speak whenever question changes
  useEffect(() => {
    if (!session || session.finished) return;
    const q = session.questions[currentIndex];
    if (q) {
      setFinalTranscript('');
      setLiveTranscript('');
      speakQuestion(q.question);
    }
  }, [session, currentIndex]); // eslint-disable-line

  const submitAnswer = useCallback(async () => {
    const answer = (finalTranscriptRef.current + " " + liveTranscriptRef.current).trim();
    if (!answer || isEvaluatingRef.current) return;

    stopListening();
    setIsEvaluating(true);
    setMicStatus('processing');
    setFinalTranscript('');
    setLiveTranscript('');

    const question = session?.questions[currentIndex];
    if (!question) { setIsEvaluating(false); return; }

    try {
      const res = await api.post('/interview/evaluate', {
        session_id: session.session_id,
        question: question.question,
        answer,
        role: config.role,
      });

      setResults(prev => [...prev, { question, answer, evaluation: res.data }]);

      if (currentIndex < session.questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setSession(prev => ({ ...prev, finished: true }));
      }
    } catch (err) {
      console.error('Evaluation failed', err);
    } finally {
      setIsEvaluating(false);
      setMicStatus('idle');
    }
  }, [session, currentIndex, config.role, stopListening]);

  // ─── Start session ───
  const startSession = async () => {
    if (!config.resume_id) {
      alert('Please upload and select your resume before starting the interview. You can upload it in the ATS section.');
      return;
    }
    try {
      const payload = { ...config, resume_id: parseInt(config.resume_id) };
      const res = await api.post('/interview/start', payload);
      setSession(res.data);
    } catch {
      alert('Failed to start session. Ensure backend is running.');
    }
  };

  const scoreColor = (s) => s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Config screen (Two-column redesign matching mockup)
  // ═══════════════════════════════════════════════════════════════════════════
  if (!session) {
    const popularRoles = [
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'Software Engineer',
      'Data Scientist',
      'AI/ML Engineer',
      'DevOps Engineer',
      'Product Manager',
      'UI/UX Designer',
    ];

    return (
      <div className="py-2 max-w-5xl mx-auto w-full fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          
          {/* LEFT: Configure Interview Card (2 cols) */}
          <div className="lg:col-span-2 glass-premium p-6 border border-white/5 shadow-2xl relative">
            {/* Design accents */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-12 h-12 rounded-full border border-dashed border-indigo-500/50 flex items-center justify-center bg-indigo-500/5 text-indigo-400 mb-2.5 shadow-[0_0_20px_rgba(99,102,241,0.15)] animate-pulse">
                <Settings size={22} className="text-indigo-400" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-wide text-white font-sans">Configure Interview</h1>
              <p className="text-xs text-slate-400 font-semibold tracking-wide mt-1 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-indigo-400"></span> Fully voice-driven
                <span className="w-1 h-1 rounded-full bg-purple-400"></span> Hands-free
                <span className="w-1 h-1 rounded-full bg-cyan-400"></span> AI-powered
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Job Role Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Job Role</label>
                <div className="custom-select-wrap">
                  <Briefcase className="input-icon" size={15} />
                  <select
                    value={config.role}
                    onChange={e => setConfig({ ...config, role: e.target.value })}
                    className="input-field cursor-pointer font-semibold appearance-none pr-10 py-2.5"
                  >
                    {popularRoles.map(role => (
                      <option key={role} value={role} className="bg-[#0b0a1a] text-white">{role}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 text-slate-500 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Grid: Interview Type & Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Interview Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Interview Type</label>
                  <div className="custom-select-wrap">
                    <Code className="input-icon" size={15} />
                    <select
                      value={config.type}
                      onChange={e => setConfig({ ...config, type: e.target.value })}
                      className="input-field cursor-pointer font-semibold appearance-none pr-10 py-2.5"
                    >
                      <option className="bg-[#0b0a1a] text-white">Technical</option>
                      <option className="bg-[#0b0a1a] text-white">Behavioral</option>
                      <option className="bg-[#0b0a1a] text-white">HR</option>
                    </select>
                    <ChevronDown className="absolute right-4 text-slate-500 pointer-events-none" size={14} />
                  </div>
                </div>

                {/* Difficulty */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Difficulty</label>
                  <div className="custom-select-wrap">
                    <Signal className="input-icon" size={15} />
                    <select
                      value={config.difficulty}
                      onChange={e => setConfig({ ...config, difficulty: e.target.value })}
                      className="input-field cursor-pointer font-semibold appearance-none pr-10 py-2.5"
                    >
                      <option className="bg-[#0b0a1a] text-white">Easy</option>
                      <option className="bg-[#0b0a1a] text-white">Medium</option>
                      <option className="bg-[#0b0a1a] text-white">Hard</option>
                    </select>
                    <ChevronDown className="absolute right-4 text-slate-500 pointer-events-none" size={14} />
                  </div>
                </div>
              </div>

              {/* Based on Resume (Optional) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Based on Resume</label>
                <div className="custom-select-wrap">
                  <FileText className="input-icon" size={15} />
                  <select
                    value={config.resume_id}
                    onChange={e => setConfig({ ...config, resume_id: e.target.value })}
                    className="input-field cursor-pointer font-semibold appearance-none pr-10 py-2.5"
                  >
                    <option value="" disabled className="bg-[#0b0a1a] text-white">— Select Your Resume —</option>
                    {resumes.map(r => (
                      <option key={r.id} value={r.id} className="bg-[#0b0a1a] text-white">
                        Resume #{r.id} — {r.file_name || r.target_role} ({new Date(r.created_at).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 text-slate-500 pointer-events-none" size={14} />
                </div>
              </div>

              {/* Microphone alert card */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 shadow-[inset_0_0_15px_rgba(99,102,241,0.05)] mt-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 shrink-0">
                  <Mic size={15} />
                </div>
                <div className="text-xs text-slate-300 leading-relaxed font-semibold">
                  The interview is <span className="text-indigo-300">interactive and voice-driven</span>. Click the mic to speak, review your transcribed answer in the text box, and click Send when you're ready.
                </div>
              </div>

              {/* Start button */}
              <button 
                onClick={startSession}
                className="w-full mt-2 flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-sm cursor-pointer tracking-wider shadow-[0_8px_30px_rgba(99,102,241,0.45)] border-t border-white/10 transition-all duration-300 active:scale-[0.99]"
              >
                <PlayCircle size={22} className="text-white fill-white/10" />
                Start Interview
              </button>
            </div>
          </div>

          {/* RIGHT: Tips & Guide Column (1 col) */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Tips Card */}
            <div className="glass-premium p-6 border border-white/5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-2xl" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 shrink-0">
                  <Sparkles size={16} />
                </div>
                <h3 className="text-base font-extrabold text-white tracking-wide font-sans">Tips for Best Experience</h3>
              </div>

              {/* Tips Grid list */}
              <div className="space-y-5.5">
                {[
                  {
                    title: "Speak Clearly",
                    desc: "Answer in complete sentences for better evaluation.",
                    icon: Mic,
                    color: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                  },
                  {
                    title: "Stay Focused",
                    desc: "Avoid background noise and interruptions.",
                    icon: Target,
                    color: "bg-purple-500/10 border-purple-500/30 text-purple-400"
                  },
                  {
                    title: "Take Your Time",
                    desc: "There's no rush. Think, speak, and respond.",
                    icon: Clock,
                    color: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                  },
                  {
                    title: "Be Honest",
                    desc: "AI gives better feedback when you're real.",
                    icon: Heart,
                    color: "bg-pink-500/10 border-pink-500/30 text-pink-400"
                  }
                ].map((tip, idx) => {
                  const Icon = tip.icon;
                  return (
                    <div key={idx} className="flex gap-4">
                      <div className={`w-9.5 h-9.5 rounded-xl border flex items-center justify-center shrink-0 shadow-md ${tip.color}`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-wide">{tip.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-semibold mt-0.5">{tip.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Need Help Card */}
            <div className="glass-premium p-6 border border-white/5 shadow-xl relative overflow-hidden flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
                  <Headphones size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white tracking-wide">Need help?</h4>
                  <p className="text-xs text-slate-400 leading-normal font-semibold mt-0.5">Check our guide or contact support.</p>
                </div>
              </div>
              <button className="px-4 py-2 text-xs font-bold text-slate-300 border border-white/10 hover:border-white/20 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-all duration-300">
                View Guide
              </button>
            </div>
            
          </div>
          
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Results screen (Sleek redesigned view)
  // ═══════════════════════════════════════════════════════════════════════════
  if (session.finished) {
    const avgScore = results.length
      ? Math.round(results.reduce((a, c) => a + c.evaluation.score, 0) / results.length)
      : 0;

    const downloadInterviewReport = async () => {
      try {
        const response = await api.get(`/interview/${session.session_id}/report`);
        const reportData = response.data;
        
        const { jsPDF } = await import('jspdf');
        await import('jspdf-autotable');
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text('IntelliHire AI', 14, 20);
        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text('Interview Analysis Report', 14, 28);
        
        doc.setFontSize(10);
        doc.text(`Role: ${config.role} | Type: ${config.type} | Difficulty: ${config.difficulty}`, 14, 36);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 42);
        
        doc.setLineWidth(0.5);
        doc.line(14, 46, 196, 46);

        // Performance Summary
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Performance Summary', 14, 56);
        
        doc.autoTable({
          startY: 62,
          head: [['Metric', 'Value']],
          body: [
            ['Average Score', `${avgScore}/100`],
            ['Questions Answered', `${results.length}`],
            ['Completion Rate', `${Math.round((results.length / session.questions.length) * 100)}%`]
          ],
          theme: 'grid',
          headStyles: { fillColor: [79, 70, 229] }
        });

        // Question Analysis
        let currentY = doc.lastAutoTable.finalY + 14;
        doc.setFontSize(12);
        doc.text('Detailed Feedback', 14, currentY);
        
        results.forEach((r, i) => {
          doc.autoTable({
            startY: currentY + 6,
            head: [[`Q${i + 1}: ${r.question.question}`]],
            body: [
              [`Score: ${r.evaluation.score}/100`],
              [`Your Answer: ${r.answer}`],
              [`AI Feedback: ${r.evaluation.feedback}`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] }
          });
          currentY = doc.lastAutoTable.finalY + 10;
        });
        
        if (reportData.recommendations?.length > 0) {
          doc.addPage();
          doc.setFontSize(12);
          doc.text('Recommendations', 14, 20);
          const recBody = reportData.recommendations.map(r => [r]);
          doc.autoTable({
            startY: 28,
            body: recBody,
            theme: 'striped'
          });
        }

        doc.save(`IntelliHire_Interview_Report_${config.role.replace(/\s+/g, '_')}.pdf`);
      } catch (err) {
        console.error('Failed to download report:', err);
      }
    };

    return (
      <div className="py-6 max-w-4xl mx-auto w-full fade-in space-y-8">
        
        {/* Results Hero banner */}
        <div className="glass-premium p-10 border border-indigo-500/10 shadow-2xl relative text-center flex flex-col items-center gap-6">
          <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center bg-[#03030a] shadow-[0_0_30px_rgba(99,102,241,0.2)]"
               style={{ borderColor: scoreColor(avgScore) }}>
            <span className="text-4xl font-extrabold text-white font-sans">{avgScore}</span>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">/ 100</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-white font-sans">Interview Complete!</h1>
            <p className="text-sm font-bold text-slate-400 tracking-wide">
              {config.role} <span className="text-slate-600">•</span> {config.type} <span className="text-slate-600">•</span> {config.difficulty}
            </p>
          </div>

          <div className="flex gap-4 flex-wrap justify-center mt-3">
            <button 
              onClick={downloadInterviewReport}
              className="flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-sm cursor-pointer shadow-lg border-t border-white/10 transition-colors"
            >
              <Download size={16} /> Download Report
            </button>
            <button 
              onClick={() => { setSession(null); setResults([]); setCurrentIndex(0); }}
              className="flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-bold text-sm cursor-pointer transition-colors"
            >
              New Interview
            </button>
          </div>
        </div>

        {/* Detailed Feedback Cards */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <BarChart2 className="text-indigo-400" size={20} />
            <h2 className="text-xl font-extrabold text-white font-sans">Detailed Feedback</h2>
          </div>

          {results.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass p-6 border border-white/5 shadow-lg space-y-5"
            >
              {/* Question Row */}
              <div className="flex items-start gap-4 pb-4 border-b border-white/5">
                <span className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/35 flex items-center justify-center text-indigo-400 font-extrabold text-xs shrink-0 font-sans shadow-md">
                  Q{i + 1}
                </span>
                <p className="text-sm font-bold text-white leading-relaxed flex-1 mt-0.5">{r.question.question}</p>
                <span 
                  className="px-3.5 py-1.5 rounded-full text-xs font-black text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: scoreColor(r.evaluation.score) }}
                >
                  {r.evaluation.score}/100
                </span>
              </div>

              {/* QA Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Your Answer */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 relative">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 font-sans">Your Answer</span>
                  <p className="text-sm text-slate-300 leading-relaxed font-semibold italic">"{r.answer}"</p>
                </div>

                {/* Feedback */}
                <div className="p-4 rounded-xl bg-indigo-500/[0.02] border border-indigo-500/5">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2 font-sans">AI Feedback</span>
                  <p className="text-sm text-slate-300 leading-relaxed font-semibold">{r.evaluation.feedback}</p>
                  
                  {r.evaluation.strengths?.length > 0 && (
                    <div className="mt-4">
                      <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest block font-sans">✓ Strengths</span>
                      <ul className="text-xs text-slate-400 mt-1.5 space-y-1 font-semibold pl-1">
                        {r.evaluation.strengths.map((s, idx) => <li key={idx}>• {s}</li>)}
                      </ul>
                    </div>
                  )}

                  {r.evaluation.weaknesses?.length > 0 && (
                    <div className="mt-4">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block font-sans">⚠️ Areas for Improvement</span>
                      <ul className="text-xs text-slate-400 mt-1.5 space-y-1 font-semibold pl-1">
                        {r.evaluation.weaknesses.map((w, idx) => <li key={idx}>• {w}</li>)}
                      </ul>
                    </div>
                  )}

                  {r.evaluation.suggestedAnswer && (
                    <div className="mt-4">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block font-sans">💡 Suggested Better Answer</span>
                      <p className="text-xs text-indigo-200/90 leading-relaxed mt-1.5 font-semibold font-sans border-l-2 border-indigo-500/40 pl-2.5 py-0.5">{r.evaluation.suggestedAnswer}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Active Interview screen
  // ═══════════════════════════════════════════════════════════════════════════
  const combinedTranscript = (finalTranscript + liveTranscript).trim();
  const progress = ((currentIndex) / session.questions.length) * 100;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto w-full py-4 gap-4 fade-in">

      {/* Top Details panel */}
      <div className="glass-premium p-4 border border-white/5 flex items-center justify-between shadow-lg">
        <div className="flex gap-2.5">
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-md">
            {config.type}
          </span>
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-slate-300">
            {config.role}
          </span>
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-slate-300">
            {config.difficulty}
          </span>
        </div>
        
        {/* Progress tracker */}
        <div className="flex items-center gap-4">
          <div className="w-28 h-2 bg-white/5 rounded-full overflow-hidden border border-white/[0.02]">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs font-extrabold text-slate-400 font-sans tracking-wide">
            {currentIndex + 1} / {session.questions.length}
          </span>
        </div>
      </div>

      {/* Dialogue chat logs */}
      <div className="flex-1 overflow-y-auto px-1 space-y-6 scrollbar-thin">
        <AnimatePresence>
          {results.map((r, idx) => (
            <div key={idx} className="space-y-4">
              {/* AI question bubble */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-end gap-3 max-w-[80%]"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                  <Bot size={16} />
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-sm font-semibold text-slate-200 leading-relaxed shadow-sm relative rounded-bl-sm">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">IntelliHire AI</span>
                  {r.question.question}
                </div>
              </motion.div>

              {/* User answer bubble */}
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-end gap-3 max-w-[80%] ml-auto flex-row-reverse"
              >
                <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-extrabold shrink-0 shadow-md">
                  T
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 border border-indigo-500/20 text-sm font-semibold text-white leading-relaxed shadow-md relative rounded-br-sm text-right">
                  <span className="text-[9px] font-black text-white/50 uppercase tracking-widest block mb-1 text-right">You</span>
                  {r.answer}
                </div>
              </motion.div>

              {/* Score tag */}
              <div className="flex justify-start pl-11">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-slate-300 shadow-md"
                     style={{ borderLeft: `3px solid ${scoreColor(r.evaluation.score)}` }}>
                  <CheckCircle size={13} className="text-teal-400" />
                  Score: <span className="text-white font-extrabold">{r.evaluation.score}/100</span> — {r.evaluation.feedback?.split('.')[0]}
                </div>
              </div>
            </div>
          ))}
        </AnimatePresence>

        {/* Current Active AI question */}
        {!isEvaluating && (
          <motion.div
            key={`q-${currentIndex}`}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-end gap-3 max-w-[80%]"
          >
            <div className={`w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg relative ${isAiSpeaking ? 'animate-[pulse_1s_infinite]' : ''}`}>
              <Bot size={16} />
              {isAiSpeaking && <span className="speaking-ring absolute inset-0 rounded-full border border-indigo-400" />}
            </div>
            <div className="p-4 rounded-2xl bg-[#080714] border border-indigo-500/25 text-sm font-semibold text-slate-100 leading-relaxed shadow-[0_0_15px_rgba(99,102,241,0.06)] relative rounded-bl-sm">
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1">IntelliHire AI</span>
              {session.questions[currentIndex]?.question}
              
              {isAiSpeaking && (
                <div className="flex items-end gap-0.5 mt-3 h-4">
                  {[...Array(5)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="w-0.5 bg-indigo-400 rounded-full"
                      animate={{ height: ['4px', `${12 + i * 2}px`, '4px'] }}
                      transition={{ repeat: Infinity, duration: 0.4 + i * 0.08, ease: 'easeInOut' }}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Evaluating State Loader */}
        {isEvaluating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 pl-11 text-slate-400 text-sm font-semibold tracking-wide"
          >
            <div className="flex gap-1.5 items-center">
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                />
              ))}
            </div>
            <span>Evaluating your answer…</span>
          </motion.div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Voice controls & Transcript panel */}
      <div className="glass-premium p-5 border border-white/5 flex flex-col items-center gap-4 shadow-xl">
        
        {/* Live Transcript Display */}
        <AnimatePresence>
          {!isAiSpeaking && !isEvaluating ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full flex flex-col gap-3"
            >
              <textarea
                value={finalTranscript + (liveTranscript ? " " + liveTranscript : "")}
                onChange={(e) => {
                  setFinalTranscript(e.target.value);
                  setLiveTranscript("");
                }}
                placeholder="Listening... Speak your answer or type it here."
                className="w-full bg-[#0a0f1c]/50 border border-teal-500/30 rounded-xl px-5 py-4 text-teal-100 text-sm min-h-[100px] shadow-[inset_0_0_20px_rgba(20,184,166,0.05)] focus:outline-none focus:border-teal-400 font-semibold resize-y"
              />
              <button
                onClick={submitAnswer}
                disabled={!combinedTranscript || isEvaluating}
                className="self-end px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(20,184,166,0.2)]"
              >
                Send Answer
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Mic control Orb and Waveforms */}
        <div className="flex flex-col items-center gap-3">
          <div 
            onClick={() => {
              if (isListening) stopListening();
              else startListening();
            }}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer hover:scale-105 ${isListening ? 'bg-teal-500/10 border-2 border-teal-400 shadow-[0_0_25px_rgba(20,184,166,0.3)]' : 'bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-teal-400 hover:border-teal-500/50'}`}
          >
            {isListening && (
              <>
                <span className="ih-ripple r1" />
                <span className="ih-ripple r2" />
                <span className="ih-ripple r3" />
              </>
            )}
            <Mic size={24} className={isListening ? 'text-teal-400' : ''} />
          </div>

          {/* Dynamic Audio waveforms */}
          <div className="flex items-center gap-0.5 h-8 mt-1.5">
            {barHeights.map((h, i) => (
              <span
                key={i}
                className="w-0.5 bg-teal-500/80 rounded-full transition-all duration-75"
                style={{ height: `${h}px`, opacity: isListening ? 0.75 + Math.random() * 0.25 : 0.2 }}
              />
            ))}
          </div>

          {/* Micro status label */}
          <p className="text-xs font-bold text-slate-400 tracking-wide mt-1">
            {isAiSpeaking && '🔊 AI is speaking…'}
            {isListening && !isAiSpeaking && '🎙️ Listening — speak your answer'}
            {isEvaluating && '⚙️ Evaluating…'}
            {!isAiSpeaking && !isListening && !isEvaluating && '⏳ Preparing…'}
          </p>
        </div>
      </div>
    </div>
  );
}
