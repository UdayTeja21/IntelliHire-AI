"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, PlayCircle, Bot, User, Send, Mic, MicOff } from 'lucide-react';
import api from '../../lib/api';

export default function Interview() {
  const [config, setConfig] = useState({ role: 'Frontend Developer', type: 'Technical', difficulty: 'Medium', resume_id: '' });
  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [interimAnswer, setInterimAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [shouldAutoSend, setShouldAutoSend] = useState(false);
  const [results, setResults] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;

        let finalTranscriptStr = "";

        recognitionRef.current.onresult = (event) => {
          let interimTranscript = '';
          let newlyFinal = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              newlyFinal += event.results[i][0].transcript + ' ';
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (newlyFinal) {
             setCurrentAnswer(prev => prev + newlyFinal);
          }
          setInterimAnswer(interimTranscript);
        };

        recognitionRef.current.onerror = (event) => {
          if (event.error === 'network') {
            console.warn('Speech recognition network error. This is a harmless browser glitch.');
          } else {
            console.warn('Speech recognition error:', event.error);
          }
          
          if (event.error === 'not-allowed') {
            alert('Microphone access is blocked. Please allow microphone access in your browser settings.');
          }
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
          setShouldAutoSend(true);
        };
      }
    }
  }, []);

  useEffect(() => {
    api.get('/resume/history').then(res => setResumes(res.data)).catch(err => console.error(err));
  }, []);

  // Text-to-Speech for AI Questions
  useEffect(() => {
    if (session && !session.finished && session.questions[currentIndex]) {
      const text = session.questions[currentIndex].question;
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsAiSpeaking(true);
        utterance.onend = () => setIsAiSpeaking(false);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [session, currentIndex]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (e) {
        console.error('Speech recognition failed to start', e);
      }
    }
  };

  useEffect(() => {
    if (shouldAutoSend && !isRecording && !isEvaluating) {
      const finalAns = currentAnswer + interimAnswer;
      if (finalAns.trim()) {
        handleSend();
      }
      setShouldAutoSend(false);
    }
  }, [shouldAutoSend, isRecording, isEvaluating, currentAnswer, interimAnswer]);

  const startSession = async () => {
    try {
      const payload = { ...config, resume_id: config.resume_id ? parseInt(config.resume_id) : null };
      const res = await api.post('/interview/start', payload);
      setSession(res.data);
    } catch (error) {
      console.error(error);
      alert('Failed to start session. Ensure backend is running.');
    }
  };

  const handleSend = async () => {
    const finalAnswer = currentAnswer + interimAnswer;
    if (!finalAnswer.trim() || isEvaluating) return;

    setIsEvaluating(true);
    const question = session.questions[currentIndex];
    
    try {
      const res = await api.post('/interview/evaluate', {
        session_id: session.session_id,
        question: question.question,
        answer: finalAnswer,
        role: config.role
      });
      
      setResults(prev => [...prev, { question, answer: finalAnswer, evaluation: res.data }]);
      setCurrentAnswer('');
      setInterimAnswer('');
      
      if (isRecording) {
        recognitionRef.current?.stop();
        setIsRecording(false);
      }
      
      if (currentIndex < session.questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Finished
        setSession({ ...session, finished: true });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsEvaluating(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [results, currentIndex, isEvaluating]);

  if (!session) {
    return (
      <div className="max-w-xl mx-auto py-12 space-y-8 fade-in">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full glass-panel flex items-center justify-center text-indigo-400">
            <Settings size={32} />
          </div>
          <h2 className="text-3xl font-bold">Configure Interview</h2>
          <p className="text-slate-400">Customize your AI mock interview experience</p>
        </div>

        <div className="glass-panel p-8 space-y-6">
          <div className="space-y-2">
            <label className="font-medium text-slate-200">Job Role</label>
            <input 
              type="text" 
              value={config.role} 
              onChange={e => setConfig({...config, role: e.target.value})}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-slate-200">Interview Type</label>
            <select 
              value={config.type} 
              onChange={e => setConfig({...config, type: e.target.value})}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-indigo-500"
            >
              <option>Technical</option>
              <option>Behavioral</option>
              <option>HR</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="font-medium text-slate-200">Difficulty</label>
            <select 
              value={config.difficulty} 
              onChange={e => setConfig({...config, difficulty: e.target.value})}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-indigo-500"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="font-medium text-slate-200">Base on Resume (Optional)</label>
            <select 
              value={config.resume_id} 
              onChange={e => setConfig({...config, resume_id: e.target.value})}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">-- Generic Interview --</option>
              {resumes.map(r => (
                <option key={r.id} value={r.id}>Resume {r.id} - {r.target_role} ({new Date(r.created_at).toLocaleDateString()})</option>
              ))}
            </select>
          </div>
          
          <button onClick={startSession} className="w-full btn-primary flex items-center justify-center gap-2 mt-4">
            <PlayCircle size={20} /> Generate Interview
          </button>
        </div>
      </div>
    );
  }

  if (session.finished) {
    const avgScore = Math.round(results.reduce((acc, curr) => acc + curr.evaluation.score, 0) / results.length);
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-8 fade-in">
        <div className="glass-panel p-8 text-center space-y-4">
          <h2 className="text-3xl font-bold">Interview Complete!</h2>
          <div className="w-32 h-32 mx-auto rounded-full border-8 border-indigo-500 flex flex-col items-center justify-center bg-indigo-500/10">
            <span className="text-4xl font-bold">{avgScore}%</span>
            <span className="text-xs text-indigo-300">Overall Score</span>
          </div>
          
          <div className="flex gap-4 justify-center mt-6">
            <button onClick={() => window.print()} className="btn-primary flex items-center gap-2">
              <FileText size={18} /> Download Report
            </button>
            <button onClick={() => window.location.href = '/'} className="bg-slate-800 text-white hover:bg-slate-700 px-6 py-3 rounded-xl font-medium transition-colors border border-slate-700 flex items-center gap-2">
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold">Detailed Feedback</h3>
          {results.map((res, i) => (
            <div key={i} className="glass-panel p-6 space-y-4">
              <h4 className="font-bold text-lg border-b border-slate-700 pb-2">Q{i+1}: {res.question.question}</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Your Answer:</p>
                  <p className="bg-slate-800/50 p-4 rounded-lg italic text-slate-300">{res.answer}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Feedback ({res.evaluation.score}/100):</p>
                  <p className="bg-indigo-500/10 p-4 rounded-lg text-indigo-200">{res.evaluation.feedback}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 h-[calc(100vh-100px)] flex flex-col fade-in">
      <div className="glass-panel p-4 mb-4 flex justify-between items-center rounded-xl">
        <div>
          <h2 className="font-bold">{config.type} Interview</h2>
          <p className="text-sm text-slate-400">{config.role} • {config.difficulty}</p>
        </div>
        <div className="text-sm bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
          Question {currentIndex + 1} of {session.questions.length}
        </div>
      </div>

      <div className="glass-panel flex-grow flex flex-col overflow-hidden rounded-xl">
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {results.map((res, idx) => (
              <div key={idx} className="space-y-6">
                <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-sm border border-slate-700">
                    {res.question.question}
                  </div>
                </motion.div>
                <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="flex gap-4 justify-end">
                  <div className="bg-indigo-600 p-4 rounded-2xl rounded-tr-sm">
                    {res.answer}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-white" />
                  </div>
                </motion.div>
              </div>
            ))}
          </AnimatePresence>

          {/* Current Question */}
          <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="flex gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all ${isAiSpeaking ? 'bg-gradient-to-br from-indigo-400 to-pink-400 scale-110' : 'bg-gradient-to-br from-indigo-500 to-pink-500'}`}>
              <Bot size={20} className="text-white" />
            </div>
            <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-sm border border-slate-700 max-w-[80%]">
              <p>{session.questions[currentIndex]?.question}</p>
              {isAiSpeaking && (
                <div className="flex gap-1 mt-3 items-end h-4">
                  <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-indigo-500 rounded-full" />
                  <motion.div animate={{ height: [6, 16, 6] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-pink-500 rounded-full" />
                  <motion.div animate={{ height: [8, 10, 8] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1 bg-indigo-500 rounded-full" />
                  <motion.div animate={{ height: [4, 14, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-pink-500 rounded-full" />
                </div>
              )}
            </div>
          </motion.div>

          {isEvaluating && (
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex gap-2 items-center text-slate-400 pl-14">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
              <span className="text-sm ml-2">Evaluating...</span>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-slate-700/50 bg-slate-900/50 flex gap-4 relative">
          {isRecording && (
            <div className="absolute -top-8 left-12 flex gap-1 items-end h-6 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/50 backdrop-blur-sm">
              <motion.div animate={{ height: [4, 16, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-rose-500 rounded-full" />
              <motion.div animate={{ height: [8, 20, 8] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-1 bg-rose-400 rounded-full" />
              <motion.div animate={{ height: [6, 12, 6] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-rose-500 rounded-full" />
              <span className="text-[10px] text-rose-400 font-medium ml-1">Listening...</span>
            </div>
          )}
          <button 
            className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isRecording ? 'bg-rose-500/20 text-rose-500 border border-rose-500/50 scale-105' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            onClick={toggleRecording}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <textarea
            value={currentAnswer + interimAnswer}
            onChange={e => setCurrentAnswer(e.target.value)}
            disabled={isEvaluating}
            placeholder="Type your answer here..."
            className="flex-grow bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 resize-none h-12 py-3"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button 
            onClick={handleSend}
            disabled={(!currentAnswer.trim() && !interimAnswer.trim()) || isEvaluating}
            className="px-6 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-medium disabled:opacity-50 flex-shrink-0 hover:bg-indigo-600 transition-colors gap-2"
          >
            Submit Answer <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
