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
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

// ─── Silence-detection config ────────────────────────────────────────────────
const SILENCE_DELAY_MS = 8000; // ms of silence before auto-submitting

export default function Interview() {
  const { user } = useAuth();
  const router = useRouter();

  // ── Config phase ──
  const [config, setConfig] = useState({
    role: 'Frontend Developer',
    type: 'Technical',
    difficulty: 'Medium',
    experience: 'Junior (1-3 yrs)',
    domain: 'General / Tech'
  });
  const [resumeFile, setResumeFile] = useState(null);

  // ── Session phase ──
  const [session, setSession] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
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
  
  // Refs for async onstop handler
  const sessionRef = useRef(session);
  const currentIndexRef = useRef(currentIndex);
  const configRef = useRef(config);
  const isListeningRef = useRef(false);

  // keep refs in sync
  useEffect(() => { sessionRef.current = session; }, [session]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { configRef.current = config; }, [config]);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  useEffect(() => { finalTranscriptRef.current = finalTranscript; }, [finalTranscript]);
  useEffect(() => { liveTranscriptRef.current = liveTranscript; }, [liveTranscript]);
  useEffect(() => { isEvaluatingRef.current = isEvaluating; }, [isEvaluating]);
  useEffect(() => { isAiSpeakingRef.current = isAiSpeaking; }, [isAiSpeaking]);

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
      
      // Setup MediaRecorder for Whisper transcription (only use MediaRecorder to avoid conflicts)
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsEvaluating(true);
        setMicStatus('processing');
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        
        let answerToSubmit = finalTranscriptRef.current.trim();
        setLiveTranscript('Transcribing with Whisper AI (High Accuracy)...');
        
        try {
          const res = await api.post('/interview/transcribe', formData, {
             headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (res.data && res.data.text && res.data.text.trim()) {
             answerToSubmit = res.data.text.trim();
          }
        } catch (err) {
          console.error(err);
        }
        
        setFinalTranscript('');
        setLiveTranscript('Evaluating answer...');
        
        if (answerToSubmit) {
          const currentSession = sessionRef.current;
          const currentQIndex = currentIndexRef.current;
          const question = currentSession?.questions[currentQIndex];
          try {
            const evalRes = await api.post('/interview/evaluate', {
              session_id: currentSession.session_id,
              question: question.question,
              answer: answerToSubmit,
              role: configRef.current.role,
            });
            setResults(prev => [...prev, { question, answer: answerToSubmit, evaluation: evalRes.data.evaluation }]);
            if (evalRes.data.next_question) {
              setSession(prev => ({ ...prev, questions: [...prev.questions, evalRes.data.next_question] }));
              setCurrentIndex(prev => prev + 1);
            } else {
              setSession(prev => ({ ...prev, finished: true }));
            }
          } catch (err) {
            console.error('Evaluation failed', err);
          }
        }
        
        setIsEvaluating(false);
        setLiveTranscript('');
        setMicStatus('idle');
        stream.getTracks().forEach(track => track.stop());
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
    // If we are recording, stopListening will trigger onstop which handles Whisper + evaluation
    if (isListeningRef.current) {
      stopListening();
    } else {
      // Manual typing submission
      const answer = finalTranscriptRef.current.trim();
      if (!answer || isEvaluatingRef.current) return;
      
      setIsEvaluating(true);
      setLiveTranscript('Evaluating answer...');
      const currentSession = sessionRef.current;
      const currentQIndex = currentIndexRef.current;
      const question = currentSession?.questions[currentQIndex];
      
      try {
        const evalRes = await api.post('/interview/evaluate', {
          session_id: currentSession.session_id,
          question: question.question,
          answer: answer,
          role: configRef.current.role,
        });
        setResults(prev => [...prev, { question, answer: answer, evaluation: evalRes.data.evaluation }]);
        if (evalRes.data.next_question) {
          setSession(prev => ({ ...prev, questions: [...prev.questions, evalRes.data.next_question] }));
          setCurrentIndex(prev => prev + 1);
        } else {
          setSession(prev => ({ ...prev, finished: true }));
        }
      } catch (err) {
        console.error('Evaluation failed', err);
      }
      setIsEvaluating(false);
      setLiveTranscript('');
      setFinalTranscript('');
    }
  }, [stopListening]);

  // ─── Start session ───
  const startSession = async () => {
    // We allow starting without resume since the backend can fetch the latest one automatically
    setIsStarting(true);
    try {
      const formData = new FormData();
      formData.append('role', config.role);
      formData.append('type', config.type);
      formData.append('difficulty', config.difficulty);
      formData.append('experience', config.experience);
      formData.append('domain', config.domain);
      if (resumeFile) {
        formData.append('file', resumeFile);
      }

      const res = await api.post('/interview/start', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSession(res.data);
    } catch {
      alert('Failed to start session. Ensure backend is running.');
    } finally {
      setIsStarting(false);
    }
  };

  const scoreColor = (s) => s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';

  if (!user) return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center gap-6 text-center max-w-md mx-auto fade-in">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-md animate-float">
        <User size={32} />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-sans">Sign in to start mock interview</h2>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">Practice with our AI and get real-time feedback on your performance.</p>
      </div>
      <div className="flex gap-4.5 w-full mt-3">
        <button onClick={() => router.push('/login')} className="flex-1 py-2.5 bg-[#3b59df] text-white rounded-xl font-bold hover:bg-[#2c45b8] transition-colors">Sign In</button>
        <button onClick={() => router.push('/register')} className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors">Create Account</button>
      </div>
    </div>
  );

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
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
            {/* Design accents */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col items-center text-center mb-5 relative z-10">
              <div className="w-12 h-12 rounded-full border border-dashed border-indigo-200 flex items-center justify-center bg-indigo-50 text-indigo-600 mb-2.5 animate-pulse">
                <Settings size={22} className="text-indigo-600" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-wide text-slate-900 font-sans">Configure Interview</h1>
              <p className="text-xs text-slate-500 font-semibold tracking-wide mt-1 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-indigo-500"></span> Fully voice-driven
                <span className="w-1 h-1 rounded-full bg-purple-500"></span> Hands-free
                <span className="w-1 h-1 rounded-full bg-cyan-500"></span> AI-powered
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 relative z-10">
              {/* Job Role Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Job Role</label>
                <div className="relative flex items-center">
                  <Briefcase className="absolute left-4 text-slate-400" size={15} />
                  <select
                    value={config.role}
                    onChange={e => setConfig({ ...config, role: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    {popularRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 text-slate-500 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Grid: Interview Type & Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Interview Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Interview Type</label>
                  <div className="relative flex items-center">
                    <Code className="absolute left-4 text-slate-400" size={15} />
                    <select
                      value={config.type}
                      onChange={e => setConfig({ ...config, type: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                    >
                      <option>Technical</option>
                      <option>Behavioral</option>
                      <option>HR</option>
                    </select>
                    <ChevronDown className="absolute right-4 text-slate-500 pointer-events-none" size={14} />
                  </div>
                </div>

                {/* Difficulty */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Difficulty</label>
                  <div className="relative flex items-center">
                    <Signal className="absolute left-4 text-slate-400" size={15} />
                    <select
                      value={config.difficulty}
                      onChange={e => setConfig({ ...config, difficulty: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                    >
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                    <ChevronDown className="absolute right-4 text-slate-500 pointer-events-none" size={14} />
                  </div>
                </div>
              </div>

              {/* Grid: Experience & Domain */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Experience Level */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Experience Level</label>
                  <div className="relative flex items-center">
                    <Signal className="absolute left-4 text-slate-400" size={15} />
                    <select
                      value={config.experience}
                      onChange={e => setConfig({ ...config, experience: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                    >
                      <option>Entry Level (0-1 yrs)</option>
                      <option>Junior (1-3 yrs)</option>
                      <option>Mid-Level (3-5 yrs)</option>
                      <option>Senior (5-8+ yrs)</option>
                      <option>Lead/Manager (8+ yrs)</option>
                    </select>
                    <ChevronDown className="absolute right-4 text-slate-500 pointer-events-none" size={14} />
                  </div>
                </div>

                {/* Domain / Industry */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Domain / Industry</label>
                  <div className="relative flex items-center">
                    <Briefcase className="absolute left-4 text-slate-400" size={15} />
                    <select
                      value={config.domain}
                      onChange={e => setConfig({ ...config, domain: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                    >
                      <option>General / Tech</option>
                      <option>FinTech / Banking</option>
                      <option>E-commerce / Retail</option>
                      <option>Healthcare / MedTech</option>
                      <option>EdTech</option>
                      <option>SaaS / B2B</option>
                    </select>
                    <ChevronDown className="absolute right-4 text-slate-500 pointer-events-none" size={14} />
                  </div>
                </div>
              </div>

              {/* Based on Resume (File Upload) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Upload Resume</label>
                <div className="relative flex items-center">
                  <FileText className="absolute left-4 text-slate-400" size={15} />
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={e => setResumeFile(e.target.files[0])}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                  />
                </div>
              </div>

              {/* Microphone alert card */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm mt-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Mic size={15} />
                </div>
                <div className="text-xs text-slate-600 leading-relaxed font-semibold mt-1">
                  The interview is <span className="text-indigo-600 font-bold">interactive and voice-driven</span>. Click the mic to speak, review your transcribed answer in the text box, and click Send when you're ready.
                </div>
              </div>

              {/* Start button */}
              <button 
                onClick={startSession}
                disabled={isStarting}
                className="w-full mt-2 flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-[#3b59df] hover:bg-[#2c45b8] text-white font-bold text-sm cursor-pointer shadow-md transition-all duration-300 active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isStarting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Initializing Session...
                  </>
                ) : (
                  <>
                    <PlayCircle size={22} className="text-white" />
                    Start Interview
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT: Tips & Guide Column (1 col) */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Tips Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600 shrink-0">
                  <Sparkles size={16} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-wide font-sans">Tips for Best Experience</h3>
              </div>

              {/* Tips Grid list */}
              <div className="space-y-5.5 relative z-10">
                {[
                  {
                    title: "Speak Clearly",
                    desc: "Answer in complete sentences for better evaluation.",
                    icon: Mic,
                    color: "bg-indigo-50 text-indigo-600"
                  },
                  {
                    title: "Stay Focused",
                    desc: "Avoid background noise and interruptions.",
                    icon: Target,
                    color: "bg-purple-50 text-purple-600"
                  },
                  {
                    title: "Take Your Time",
                    desc: "There's no rush. Think, speak, and respond.",
                    icon: Clock,
                    color: "bg-cyan-50 text-cyan-600"
                  },
                  {
                    title: "Be Honest",
                    desc: "AI gives better feedback when you're real.",
                    icon: Heart,
                    color: "bg-rose-50 text-rose-600"
                  }
                ].map((tip, idx) => {
                  const Icon = tip.icon;
                  return (
                    <div key={idx} className="flex gap-4">
                      <div className={`w-9.5 h-9.5 rounded-xl flex items-center justify-center shrink-0 ${tip.color}`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 tracking-wide">{tip.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium mt-0.5">{tip.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Need Help Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden flex items-center justify-between">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  <Headphones size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 tracking-wide">Need help?</h4>
                  <p className="text-xs text-slate-500 leading-normal font-medium mt-0.5">Check our guide or contact support.</p>
                </div>
              </div>
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
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm relative text-center flex flex-col items-center gap-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative w-32 h-32 rounded-full border-[6px] flex flex-col items-center justify-center bg-white shadow-lg z-10"
               style={{ borderColor: scoreColor(avgScore) }}>
            <span className="text-4xl font-extrabold text-slate-800 font-sans">{avgScore}</span>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">/ 100</span>
          </div>

          <div className="space-y-2 relative z-10">
            <h1 className="text-3xl font-extrabold text-slate-900 font-sans">Interview Complete!</h1>
            <p className="text-sm font-bold text-slate-500 tracking-wide">
              {config.role} <span className="text-slate-300">•</span> {config.type} <span className="text-slate-300">•</span> {config.difficulty}
            </p>
          </div>

          <div className="flex gap-4 flex-wrap justify-center mt-3 relative z-10">
            <button 
              onClick={downloadInterviewReport}
              className="flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl bg-[#3b59df] hover:bg-[#2c45b8] text-white font-bold text-sm cursor-pointer shadow-md transition-colors"
            >
              <Download size={16} /> Download Report
            </button>
            <button 
              onClick={() => { setSession(null); setResults([]); setCurrentIndex(0); }}
              className="flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm cursor-pointer transition-colors"
            >
              New Interview
            </button>
          </div>
        </div>

        {/* Detailed Feedback Cards */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
              <BarChart2 size={18} />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 font-sans">Detailed Feedback</h2>
          </div>

          {results.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5"
            >
              {/* Question Row */}
              <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
                <span className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-extrabold text-xs shrink-0 font-sans">
                  Q{i + 1}
                </span>
                <p className="text-sm font-bold text-slate-800 leading-relaxed flex-1 mt-0.5">{r.question.question}</p>
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
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 relative">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-sans">Your Answer</span>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium italic">"{r.answer}"</p>
                </div>

                {/* Feedback */}
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-2 font-sans">AI Feedback</span>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{r.evaluation.feedback}</p>
                  
                  {r.evaluation.strengths?.length > 0 && (
                    <div className="mt-4">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block font-sans">✓ Strengths</span>
                      <ul className="text-xs text-slate-600 mt-1.5 space-y-1 font-medium pl-1">
                        {r.evaluation.strengths.map((s, idx) => <li key={idx}>• {s}</li>)}
                      </ul>
                    </div>
                  )}

                  {r.evaluation.weaknesses?.length > 0 && (
                    <div className="mt-4">
                      <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block font-sans">⚠️ Areas for Improvement</span>
                      <ul className="text-xs text-slate-600 mt-1.5 space-y-1 font-medium pl-1">
                        {r.evaluation.weaknesses.map((w, idx) => <li key={idx}>• {w}</li>)}
                      </ul>
                    </div>
                  )}

                  {r.evaluation.suggestedAnswer && (
                    <div className="mt-4">
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block font-sans">💡 Suggested Better Answer</span>
                      <p className="text-xs text-slate-700 leading-relaxed mt-1.5 font-medium font-sans border-l-2 border-indigo-200 pl-2.5 py-0.5">{r.evaluation.suggestedAnswer}</p>
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
  const progress = ((currentIndex) / 10) * 100;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto w-full py-4 gap-4 fade-in">

      {/* Top Details panel */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between shadow-sm">
        <div className="flex gap-2.5">
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-indigo-50 text-indigo-600">
            {config.type}
          </span>
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-50 border border-slate-100 text-slate-600">
            {config.role}
          </span>
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-50 border border-slate-100 text-slate-600">
            {config.difficulty}
          </span>
        </div>
        
        {/* Progress tracker */}
        <div className="flex items-center gap-4">
          <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs font-extrabold text-slate-500 font-sans tracking-wide">
            {currentIndex + 1} / 10
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
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Bot size={16} />
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 text-sm font-medium text-slate-700 leading-relaxed shadow-sm relative rounded-bl-sm">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">IntelliHire AI</span>
                  {r.question.question}
                </div>
              </motion.div>

              {/* User answer bubble */}
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-end gap-3 max-w-[80%] ml-auto flex-row-reverse"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-extrabold shrink-0 shadow-sm">
                  T
                </div>
                <div className="p-4 rounded-2xl bg-indigo-600 text-sm font-medium text-white leading-relaxed shadow-sm relative rounded-br-sm text-right">
                  <span className="text-[9px] font-black text-indigo-200 uppercase tracking-widest block mb-1 text-right">You</span>
                  {r.answer}
                </div>
              </motion.div>

              {/* Score tag */}
              <div className="flex justify-start pl-11">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-600 shadow-sm"
                     style={{ borderLeft: `4px solid ${scoreColor(r.evaluation.score)}` }}>
                  <CheckCircle size={13} className="text-emerald-500" />
                  Score: <span className="font-extrabold text-slate-800">{r.evaluation.score}/100</span> — {r.evaluation.feedback?.split('.')[0]}
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
            <div className={`w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 relative ${isAiSpeaking ? 'animate-[pulse_1s_infinite]' : ''}`}>
              <Bot size={16} />
              {isAiSpeaking && <span className="absolute inset-0 rounded-full border border-indigo-300" />}
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 text-sm font-medium text-slate-700 leading-relaxed shadow-sm relative rounded-bl-sm">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">IntelliHire AI</span>
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
            className="flex items-center gap-3 pl-11 text-slate-500 text-sm font-medium tracking-wide"
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
      <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col items-center gap-4 shadow-sm">
        
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
                }}
                disabled={isListening || isEvaluating}
                placeholder={isListening ? "Recording... (Text will appear after clicking Send)" : "Speak your answer or type it here."}
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-800 text-sm min-h-[100px] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium resize-y ${isListening ? 'opacity-70 bg-indigo-50' : ''}`}
              />
              <button
                onClick={submitAnswer}
                disabled={(!isListening && !finalTranscript) || isEvaluating}
                className="self-end px-6 py-2.5 rounded-xl bg-[#3b59df] hover:bg-[#2c45b8] text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isListening ? 'Send Answer' : 'Submit Typed Answer'}
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
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer hover:scale-105 ${isListening ? 'bg-indigo-50 border-2 border-indigo-400 shadow-md' : 'bg-slate-100 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200'}`}
          >
            {isListening && (
              <>
                <span className="absolute inset-0 border-2 border-indigo-400 rounded-full animate-ping opacity-75" />
              </>
            )}
            <Mic size={24} className={isListening ? 'text-indigo-600' : ''} />
          </div>

          {/* Dynamic Audio waveforms */}
          <div className="flex items-center gap-0.5 h-8 mt-1.5">
            {barHeights.map((h, i) => (
              <span
                key={i}
                className="w-0.5 bg-indigo-500 rounded-full transition-all duration-75"
                style={{ height: `${h}px`, opacity: isListening ? 0.75 + Math.random() * 0.25 : 0.2 }}
              />
            ))}
          </div>

          {/* Micro status label */}
          <p className="text-xs font-bold text-slate-500 tracking-wide mt-1">
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
