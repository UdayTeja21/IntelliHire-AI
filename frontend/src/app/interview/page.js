"use client";
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart2, Bot, CheckCircle, Download, Mic, PlayCircle, Settings, User } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../lib/api';

// ─── Silence-detection config ────────────────────────────────────────────────
const SILENCE_DELAY_MS = 2200; // ms of silence before auto-submitting

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
  // useEffect(() => {
  //   api.get('/resume/history').then(r => setResumes(r.data)).catch(() => {});
  // }, []);
  useEffect(() => {
  api.get('/api/v1/resume/history')
    .then(r => setResumes(r.data))
    .catch(() => {});
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
          prev.map(() => Math.random() * 36 + 4)
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
  // Build SpeechRecognition once
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.maxAlternatives = 1;

    rec.onresult = (evt) => {
      let interim = '';
      let newFinal = '';
      for (let i = evt.resultIndex; i < evt.results.length; i++) {
        if (evt.results[i].isFinal) {
          newFinal += evt.results[i][0].transcript + ' ';
        } else {
          interim += evt.results[i][0].transcript;
        }
      }
      if (newFinal) {
        setFinalTranscript(prev => prev + newFinal);
      }
      setLiveTranscript(interim);

      // reset silence timer on every speech event
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        // user has been silent — auto-submit
        if (!isEvaluatingRef.current && !isAiSpeakingRef.current) {
          const full = (finalTranscriptRef.current + liveTranscriptRef.current).trim();
          if (full) submitAnswer(full);
        }
      }, SILENCE_DELAY_MS);
    };

    rec.onerror = (evt) => {
      if (evt.error === 'not-allowed') {
        alert('Microphone access is blocked. Please allow microphone in your browser settings.');
      } else if (evt.error !== 'network' && evt.error !== 'aborted') {
        console.warn('SR error:', evt.error);
      }
    };

    rec.onend = () => {
      // Auto-restart if we should still be listening
      if (!isAiSpeakingRef.current && !isEvaluatingRef.current) {
        try { rec.start(); } catch (_) {}
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = rec;
  }, []); // eslint-disable-line

  // ─────────────────────────────────────────────────────────────────────────
  // Start / stop mic
  // ─────────────────────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
      setMicStatus('listening');
    } catch (_) {}
  }, [isListening]);

  const stopListening = useCallback(() => {
    clearTimeout(silenceTimerRef.current);
    try { recognitionRef.current?.stop(); } catch (_) {}
    setIsListening(false);
    setMicStatus('idle');
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

  // ─────────────────────────────────────────────────────────────────────────
  // Submit answer
  // ─────────────────────────────────────────────────────────────────────────
  const submitAnswer = useCallback(async (answer) => {
    if (!answer.trim() || isEvaluatingRef.current) return;

    clearTimeout(silenceTimerRef.current);
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

  // ─────────────────────────────────────────────────────────────────────────
  // Start session
  // ─────────────────────────────────────────────────────────────────────────
  const startSession = async () => {
    try {
      const payload = { ...config, resume_id: config.resume_id ? parseInt(config.resume_id) : null };
      const res = await api.post('/interview/start', payload);
      setSession(res.data);
    } catch {
      alert('Failed to start session. Ensure backend is running.');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Score colour helper
  // ─────────────────────────────────────────────────────────────────────────
  const scoreColor = (s) => s >= 75 ? '#34d399' : s >= 50 ? '#fbbf24' : '#f87171';

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Config screen
  // ═══════════════════════════════════════════════════════════════════════════
  if (!session) {
    return (
      <div className="ih-page fade-in">
        <div className="ih-config-card">
          {/* Header */}
          <div className="ih-config-header">
            <div className="ih-config-icon">
              <Settings size={28} />
            </div>
            <h1 className="ih-config-title">Configure Interview</h1>
            <p className="ih-config-sub">Fully voice-driven · Hands-free · AI-powered</p>
          </div>

          {/* Form */}
          <div className="ih-form">
            <div className="ih-form-group">
              <label className="ih-label">Job Role</label>
              <input
                type="text"
                value={config.role}
                onChange={e => setConfig({ ...config, role: e.target.value })}
                className="ih-input"
                placeholder="e.g. Frontend Developer"
              />
            </div>

            <div className="ih-form-row">
              <div className="ih-form-group">
                <label className="ih-label">Interview Type</label>
                <select
                  value={config.type}
                  onChange={e => setConfig({ ...config, type: e.target.value })}
                  className="ih-input"
                >
                  <option>Technical</option>
                  <option>Behavioral</option>
                  <option>HR</option>
                </select>
              </div>
              <div className="ih-form-group">
                <label className="ih-label">Difficulty</label>
                <select
                  value={config.difficulty}
                  onChange={e => setConfig({ ...config, difficulty: e.target.value })}
                  className="ih-input"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
            </div>

            <div className="ih-form-group">
              <label className="ih-label">Based on Resume (Optional)</label>
              <select
                value={config.resume_id}
                onChange={e => setConfig({ ...config, resume_id: e.target.value })}
                className="ih-input"
              >
                <option value="">— Generic Interview —</option>
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>
                    Resume #{r.id} — {r.target_role} ({new Date(r.created_at).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Info box */}
            <div className="ih-info-box">
              <Mic size={16} className="ih-info-icon" />
              <span>The interview is <strong>completely hands-free</strong>. Your mic activates automatically after each question. Just speak your answer — it submits on silence.</span>
            </div>

            <button onClick={startSession} className="ih-start-btn">
              <PlayCircle size={22} />
              Start Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Results screen
  // ═══════════════════════════════════════════════════════════════════════════
  if (session.finished) {
    const avgScore = results.length
      ? Math.round(results.reduce((a, c) => a + c.evaluation.score, 0) / results.length)
      : 0;

    const downloadInterviewReport = async () => {
      try {
        const response = await api.get(`/interview/${session.session_id}/report`);
        const reportData = response.data;
        
        let report = `INTELLIHIRE AI - INTERVIEW ANALYSIS REPORT\n`;
        report += `=============================================\n\n`;
        report += `Generated on: ${new Date().toLocaleString()}\n`;
        report += `Role: ${config.role}\n`;
        report += `Type: ${config.type}\n`;
        report += `Difficulty: ${config.difficulty}\n\n`;
        
        report += `PERFORMANCE SUMMARY:\n`;
        report += `--------------------\n`;
        report += `Average Score: ${avgScore}/100\n`;
        report += `Questions Answered: ${results.length}\n`;
        report += `Completion Rate: ${Math.round((results.length / session.questions.length) * 100)}%\n\n`;
        
        report += `QUESTION-BY-QUESTION ANALYSIS:\n`;
        report += `-------------------------------\n`;
        results.forEach((r, i) => {
          report += `Q${i + 1}: ${r.question.question}\n`;
          report += `Your Score: ${r.evaluation.score}/100\n`;
          report += `Feedback: ${r.evaluation.feedback}\n`;
          if (r.evaluation.strengths?.length) {
            report += `Strengths: ${r.evaluation.strengths.join(', ')}\n`;
          }
          if (r.evaluation.weaknesses?.length) {
            report += `Areas for Improvement: ${r.evaluation.weaknesses.join(', ')}\n`;
          }
          report += `\n`;
        });
        
        if (reportData.strengths?.length) {
          report += `OVERALL STRENGTHS:\n`;
          report += `-------------------\n`;
          reportData.strengths.forEach(strength => report += `• ${strength}\n`);
          report += `\n`;
        }
        
        if (reportData.weaknesses?.length) {
          report += `AREAS FOR IMPROVEMENT:\n`;
          report += `-----------------------\n`;
          reportData.weaknesses.forEach(weakness => report += `• ${weakness}\n`);
          report += `\n`;
        }
        
        report += `RECOMMENDATIONS:\n`;
        report += `-----------------\n`;
        reportData.recommendations.forEach(rec => report += `• ${rec}\n`);
        
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `IntelliHire_Interview_Report_${config.role.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Failed to download report:', err);
      }
    };

    return (
      <div className="ih-page fade-in">
        <div className="ih-results-hero">
          <div className="ih-score-ring" style={{ '--ring-color': scoreColor(avgScore) }}>
            <span className="ih-score-num">{avgScore}</span>
            <span className="ih-score-label">/ 100</span>
          </div>
          <h1 className="ih-results-title">Interview Complete</h1>
          <p className="ih-results-sub">{config.role} · {config.type} · {config.difficulty}</p>
          <div className="ih-results-actions">
            <button onClick={downloadInterviewReport} className="ih-start-btn" style={{ gap: '0.5rem', padding: '0.7rem 1.4rem', fontSize: '0.9rem' }}>
              <Download size={18} /> Download Report
            </button>
            <button onClick={() => { setSession(null); setResults([]); setCurrentIndex(0); }} className="ih-ghost-btn">
              New Interview
            </button>
          </div>
        </div>

        <div className="ih-results-list">
          <h2 className="ih-section-title"><BarChart2 size={20} /> Detailed Feedback</h2>
          {results.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="ih-result-card"
            >
              <div className="ih-result-q-row">
                <span className="ih-q-num">Q{i + 1}</span>
                <p className="ih-q-text">{r.question.question}</p>
                <span className="ih-score-badge" style={{ '--badge-color': scoreColor(r.evaluation.score) }}>
                  {r.evaluation.score}/100
                </span>
              </div>
              <div className="ih-result-body">
                <div className="ih-answer-block">
                  <p className="ih-block-label">Your Answer</p>
                  <p className="ih-block-text">{r.answer}</p>
                </div>
                <div className="ih-feedback-block">
                  <p className="ih-block-label">AI Feedback</p>
                  <p className="ih-block-text">{r.evaluation.feedback}</p>
                  {r.evaluation.strengths?.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <p className="ih-block-label" style={{ fontSize: '0.8rem', color: '#10b981' }}>✓ Strengths</p>
                      <ul style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>
                        {r.evaluation.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                      </ul>
                    </div>
                  )}
                  {r.evaluation.weaknesses?.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <p className="ih-block-label" style={{ fontSize: '0.8rem', color: '#f59e0b' }}>⚠️ Areas for Improvement</p>
                      <ul style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>
                        {r.evaluation.weaknesses.map((w, i) => <li key={i}>• {w}</li>)}
                      </ul>
                    </div>
                  )}
                  {r.evaluation.suggestedAnswer && (
                    <div style={{ marginTop: 12 }}>
                      <p className="ih-block-label" style={{ fontSize: '0.8rem', color: '#6366f1' }}>💡 Suggested Better Answer</p>
                      <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: 4, fontStyle: 'italic' }}>{r.evaluation.suggestedAnswer}</p>
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
  // RENDER — Interview screen
  // ═══════════════════════════════════════════════════════════════════════════
  const combinedTranscript = (finalTranscript + liveTranscript).trim();
  const progress = ((currentIndex) / session.questions.length) * 100;

  return (
    <div className="ih-interview-wrap fade-in">

      {/* ── Top bar ── */}
      <div className="ih-topbar">
        <div className="ih-topbar-left">
          <span className="ih-role-tag">{config.type}</span>
          <span className="ih-role-tag secondary">{config.role}</span>
          <span className="ih-role-tag secondary">{config.difficulty}</span>
        </div>
        <div className="ih-progress-wrap">
          <div className="ih-progress-bar">
            <motion.div
              className="ih-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <span className="ih-progress-label">
            {currentIndex + 1} / {session.questions.length}
          </span>
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="ih-chat-area">

        {/* Past Q&A */}
        <AnimatePresence>
          {results.map((r, idx) => (
            <div key={idx} className="ih-qa-pair">
              {/* AI bubble */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="ih-bubble-row ai"
              >
                <div className="ih-avatar ai-avatar"><Bot size={18} /></div>
                <div className="ih-bubble ai-bubble">
                  <p className="ih-bubble-role">IntelliHire AI</p>
                  <p>{r.question.question}</p>
                </div>
              </motion.div>

              {/* User bubble */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="ih-bubble-row user"
              >
                <div className="ih-bubble user-bubble">
                  <p className="ih-bubble-role user-role">You</p>
                  <p>{r.answer}</p>
                </div>
                <div className="ih-avatar user-avatar"><User size={18} /></div>
              </motion.div>

              {/* Inline score chip */}
              <div className="ih-score-chip" style={{ '--chip-color': scoreColor(r.evaluation.score) }}>
                <CheckCircle size={13} />
                Score: {r.evaluation.score}/100 — {r.evaluation.feedback?.split('.')[0]}
              </div>
            </div>
          ))}
        </AnimatePresence>

        {/* Current AI question */}
        {!isEvaluating && (
          <motion.div
            key={`q-${currentIndex}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="ih-bubble-row ai"
          >
            <div className={`ih-avatar ai-avatar ${isAiSpeaking ? 'speaking' : ''}`}>
              <Bot size={18} />
              {isAiSpeaking && <span className="speaking-ring" />}
            </div>
            <div className="ih-bubble ai-bubble current-q">
              <p className="ih-bubble-role">IntelliHire AI</p>
              <p>{session.questions[currentIndex]?.question}</p>
              {isAiSpeaking && (
                <div className="ih-voice-bars ai-bars">
                  {[...Array(5)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="ih-bar ai-bar"
                      animate={{ height: ['4px', `${12 + i * 3}px`, '4px'] }}
                      transition={{ repeat: Infinity, duration: 0.4 + i * 0.1, ease: 'easeInOut' }}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Evaluating state */}
        {isEvaluating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ih-evaluating"
          >
            <div className="ih-eval-dots">
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="ih-eval-dot"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                />
              ))}
            </div>
            <span>Evaluating your answer…</span>
          </motion.div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* ── Hands-free voice panel ── */}
      <div className="ih-voice-panel">
        {/* Live transcript */}
        <AnimatePresence>
          {combinedTranscript && !isEvaluating && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="ih-live-transcript"
            >
              <User size={13} className="ih-live-icon" />
              <span>{combinedTranscript}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Central mic orb */}
        <div className="ih-mic-center">
          <div className={`ih-mic-orb ${isListening ? 'active' : ''} ${isEvaluating ? 'processing' : ''} ${isAiSpeaking ? 'ai-speaking' : ''}`}>
            {/* Ripple rings */}
            {isListening && (
              <>
                <span className="ih-ripple r1" />
                <span className="ih-ripple r2" />
                <span className="ih-ripple r3" />
              </>
            )}
            <Mic size={28} className="ih-mic-icon" />
          </div>

          {/* Waveform */}
          <div className="ih-waveform">
            {barHeights.map((h, i) => (
              <span
                key={i}
                className="ih-wv-bar"
                style={{ height: `${h}px`, opacity: isListening ? 0.7 + Math.random() * 0.3 : 0.2 }}
              />
            ))}
          </div>

          {/* Status label */}
          <p className="ih-mic-status">
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
