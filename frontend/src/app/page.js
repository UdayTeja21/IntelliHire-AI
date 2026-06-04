"use client";
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  ChevronRight, 
  FileText, 
  Mic, 
  UploadCloud, 
  TrendingUp, 
  Calendar, 
  Shield, 
  Zap,
  ArrowUpRight,
  ArrowUp,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const defaultStats = {
  avg_interview_score: 0,
  interviews_completed: 0,
  avg_ats_score: 0,
  avg_hiring_probability: 0,
  lineData: [],
  radarData: [],
  skills: [
    { name: 'Technical', score: 0 },
    { name: 'Communication', score: 0 },
    { name: 'Skill Match', score: 0 },
    { name: 'Project', score: 0 },
    { name: 'Readiness', score: 0 },
  ],
  extractedSkills: [],
  missingSkills: ['Docker', 'System Design', 'CI/CD']
};

export default function Dashboard() {
  const { user } = useAuth();
  const userName = user ? (user.full_name || user.email?.split('@')[0]) : 'Guest';
  const [stats, setStats] = useState(defaultStats);

  useEffect(() => {
    if (user) {
      api.get('/user/stats')
        .then(res => {
          const data = res.data;
          setStats({
            ...defaultStats,
            ...data,
            skills: [
              { name: 'Technical', score: data.avg_technical_score || 0 },
              { name: 'Communication', score: data.avg_communication_score || 0 },
              { name: 'Skill Match', score: data.avg_skill_relevance || 0 },
              { name: 'Project', score: data.avg_project_score || 0 },
              { name: 'Readiness', score: data.avg_hiring_probability || 0 },
            ]
          });
        })
        .catch(err => console.error("Failed to load stats:", err));
    }
  }, [user]);

  const { lineData, radarData, skills, missingSkills, extractedSkills } = stats;

  const displaySkills = (extractedSkills && extractedSkills.length > 0)
    ? extractedSkills.slice(0, 5).map((skillName, index) => ({
        name: skillName,
        // Fallback dummy calculation for skill score using the overall relevance score
        score: Math.max(60, (stats.avg_skill_relevance || 85) - (index * 4))
      }))
    : skills;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-8">
      
      {/* ─── ROW 1: Hero & Actions ─── */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Main Banner */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} 
          className="flex-1 rounded-[1.5rem] p-8 md:p-10 border border-indigo-50 bg-gradient-to-br from-[#f8f9ff] via-[#f3f4ff] to-[#eaeaff] flex flex-col justify-center relative overflow-hidden">
          
          <div className="relative z-10 space-y-4 max-w-lg">
            <p className="text-slate-700 font-bold text-sm">Good morning, {userName} 👋</p>
            <h1 className="text-4xl md:text-[2.75rem] font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Your AI-Powered<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Career Copilot
              </span>
            </h1>
            <p className="text-slate-600 text-sm font-medium leading-relaxed mt-2 max-w-sm">
              Get AI-powered insights, practice interviews, and improve your skills to land your dream job.
            </p>
          </div>

          {/* Abstract 3D illustration overlay */}
          <div className="absolute right-[-20px] top-0 bottom-0 w-[55%] hidden md:flex items-center justify-center select-none pointer-events-none">
            {/* Soft background glow */}
            <div className="absolute w-64 h-64 bg-white/40 rounded-full blur-3xl"></div>
            
            <div className="relative w-full h-full flex items-center justify-center transform scale-110">
              {/* Back Card */}
              <div className="absolute top-[15%] right-[20%] w-[240px] h-[160px] bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)] border border-white/60 transform rotate-[8deg] translate-x-8 p-4">
                <div className="flex gap-2 mb-3">
                  <div className="w-8 h-8 rounded bg-indigo-50"></div>
                  <div className="flex-1 space-y-1.5 py-1">
                    <div className="h-2 bg-slate-100 rounded-full w-3/4"></div>
                    <div className="h-2 bg-slate-100 rounded-full w-1/2"></div>
                  </div>
                </div>
                <div className="h-16 w-full bg-slate-50 rounded-lg flex items-end px-2 pb-2 gap-2">
                  <div className="w-full h-6 bg-indigo-100 rounded-t-sm"></div>
                  <div className="w-full h-10 bg-indigo-200 rounded-t-sm"></div>
                  <div className="w-full h-12 bg-indigo-400 rounded-t-sm"></div>
                  <div className="w-full h-8 bg-indigo-100 rounded-t-sm"></div>
                </div>
              </div>

              {/* Front Card */}
              <div className="absolute top-[35%] right-[35%] w-[220px] h-[140px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] border border-white transform -rotate-[4deg] p-5 flex items-center gap-4">
                <div className="w-16 h-20 bg-indigo-50 rounded-xl border border-indigo-100/50"></div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <div className="h-2 bg-slate-100 rounded-full flex-1"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <div className="h-2 bg-slate-100 rounded-full w-3/4"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <div className="h-2 bg-slate-100 rounded-full w-5/6"></div>
                  </div>
                </div>
              </div>

              {/* Score Badge */}
              <div className="absolute top-[20%] right-[15%] w-14 h-14 bg-white rounded-full shadow-xl border border-slate-50 flex items-center justify-center transform translate-y-4">
                <div className="w-12 h-12 rounded-full border-[3px] border-emerald-400 flex items-center justify-center">
                  <span className="text-sm font-extrabold text-slate-800">92</span>
                </div>
              </div>
              
              {/* Star sparkles */}
              <svg className="absolute top-[25%] left-[20%] w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
              <svg className="absolute bottom-[20%] right-[10%] w-6 h-6 text-white/50" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons Column */}
        <div className="flex flex-col gap-4 w-full lg:w-[320px] flex-shrink-0">
          <Link href="/interview" className="flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center mr-4 shadow-inner">
              <Mic size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-slate-900 text-sm mb-0.5">Start Mock Interview</p>
              <p className="text-xs text-slate-500 font-medium">Practice with AI interviewers</p>
            </div>
            <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-slate-50 transition-colors">
              <ArrowRight size={14} className="text-slate-400 group-hover:text-slate-700" />
            </div>
          </Link>

          <Link href="/resume" className="flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center mr-4 shadow-inner">
              <FileText size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-slate-900 text-sm mb-0.5">Analyze Resume</p>
              <p className="text-xs text-slate-500 font-medium">Get AI feedback on your resume</p>
            </div>
            <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-slate-50 transition-colors">
              <ArrowRight size={14} className="text-slate-400 group-hover:text-slate-700" />
            </div>
          </Link>

          <Link href="/materials" className="flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center mr-4 shadow-inner">
              <UploadCloud size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-slate-900 text-sm mb-0.5">Upload Materials</p>
              <p className="text-xs text-slate-500 font-medium">Upload notes or documents</p>
            </div>
            <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-slate-50 transition-colors">
              <ArrowRight size={14} className="text-slate-400 group-hover:text-slate-700" />
            </div>
          </Link>
        </div>
      </div>

      {/* ─── ROW 2: Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col relative overflow-hidden">
          <div className="flex items-start gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-600 text-white shadow-sm shrink-0">
              <TrendingUp size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-800">Average Interview Score</p>
              <div className="flex items-end justify-between mt-1">
                <p className="text-2xl font-black text-slate-900">{stats.avg_interview_score}%</p>
                {/* Mini Sparkline */}
                <div className="w-16 h-8 -mb-1">
                  <svg viewBox="0 0 100 30" className="w-full h-full">
                    <polyline points="0,25 20,20 40,25 60,15 80,20 100,5" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold mt-1">
            <span className="text-emerald-500 flex items-center"><ArrowUp size={12} className="mr-0.5" />+</span>
            <span className="text-slate-500">trending up</span>
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col relative overflow-hidden">
          <div className="flex items-start gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500 text-white shadow-sm shrink-0">
              <Calendar size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-800">Interviews Completed</p>
              <div className="flex items-end justify-between mt-1">
                <p className="text-2xl font-black text-slate-900">{stats.interviews_completed}</p>
                <div className="w-16 h-8 -mb-1">
                  <svg viewBox="0 0 100 30" className="w-full h-full">
                    <polyline points="0,20 20,25 40,15 60,20 80,10 100,15" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold mt-1">
            <span className="text-emerald-500 flex items-center"><ArrowUp size={12} className="mr-0.5" />+</span>
            <span className="text-slate-500">total complete</span>
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col relative overflow-hidden">
          <div className="flex items-start gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500 text-white shadow-sm shrink-0">
              <Shield size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-800">Average ATS Score</p>
              <div className="flex items-end justify-between mt-1">
                <p className="text-2xl font-black text-slate-900">{stats.avg_ats_score}%</p>
                <div className="w-16 h-8 -mb-1">
                  <svg viewBox="0 0 100 30" className="w-full h-full">
                    <polyline points="0,25 20,25 40,20 60,15 80,10 100,5" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold mt-1">
            <span className="text-emerald-500 flex items-center"><ArrowUp size={12} className="mr-0.5" />+</span>
            <span className="text-slate-500">solid score</span>
          </div>
        </motion.div>

        {/* Card 4 */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col relative overflow-hidden">
          <div className="flex items-start gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-500 text-white shadow-sm shrink-0">
              <Zap size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-800">Overall Readiness</p>
              <div className="flex items-end justify-between mt-1">
                <p className="text-2xl font-black text-slate-900">{stats.avg_hiring_probability}%</p>
                <div className="w-16 h-8 -mb-1">
                  <svg viewBox="0 0 100 30" className="w-full h-full">
                    <polyline points="0,20 20,25 40,15 60,5 80,15 100,5" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold mt-1">
            <span className="text-emerald-500 flex items-center"><ArrowUp size={12} className="mr-0.5" />+</span>
            <span className="text-slate-500">keep improving</span>
          </div>
        </motion.div>
      </div>

      {/* ─── ROW 3: Charts ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Chart 1: Performance Trend (Area) - Col span 2 */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 lg:col-span-2 border border-slate-100 shadow-sm flex flex-col min-h-[340px]">
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Performance Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Your performance over time</p>
            </div>
            <div className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 flex items-center gap-2 cursor-pointer hover:bg-slate-50 shadow-sm">
              Last 7 Days
              <ChevronDown size={14} />
            </div>
          </div>
          
          <div className="flex-1 w-full relative -ml-4">
            {lineData && lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} domain={[0, 100]} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2.5 border border-slate-100 shadow-lg rounded-xl text-center">
                            <p className="text-[10px] font-bold text-slate-500 mb-0.5">{payload[0].payload.day}</p>
                            <p className="text-xs font-extrabold text-slate-900">Score: {payload[0].value}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore2)" 
                    activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 3 }} 
                    dot={{ r: 4, fill: '#fff', stroke: '#8b5cf6', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">Loading chart data...</div>
            )}
          </div>
        </motion.div>

        {/* Chart 2: Strengths Overview (Progress Bars) - Col span 1 */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col min-h-[340px]">
          
          <div className="mb-6">
            <h3 className="text-base font-extrabold text-slate-900">Strengths Overview</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Top skills found in your resume</p>
          </div>

          <div className="space-y-4 mb-6">
            {displaySkills.map((skill, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="w-[88px] text-xs font-bold text-slate-800 truncate">{skill.name}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.score}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-indigo-500 rounded-full"
                  />
                </div>
                <span className="w-8 text-right text-xs font-extrabold text-slate-600">{skill.score}%</span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-800 mb-2.5">Missing Skills</p>
            <div className="flex flex-wrap gap-2">
              {missingSkills && missingSkills.length > 0 ? missingSkills.slice(0, 5).map((s, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600">
                  {s}
                </span>
              )) : (
                <span className="text-xs font-medium text-slate-400">None detected</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Chart 3: Interview Readiness (Radar) - Col span 1 */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col min-h-[340px]">
          
          <div className="mb-2">
            <h3 className="text-base font-extrabold text-slate-900">Interview Readiness</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Performance across key areas</p>
          </div>

          <div className="flex-1 w-full relative">
            {radarData && radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <PolarAngleAxis 
                    dataKey="skill" 
                    tick={(props) => {
                      const { payload, x, y, cx, cy } = props;
                      const isTop = y < cy - 20;
                      const isBottom = y > cy + 20;
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text x={0} y={0} dy={isTop ? -10 : isBottom ? 15 : 5} textAnchor="middle" fill="#475569" fontSize="9" fontWeight="bold">
                            {payload.value}
                          </text>
                          <text x={0} y={0} dy={isTop ? 2 : isBottom ? 27 : 17} textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="900">
                            {radarData.find(d => d.skill === payload.value)?.A}%
                          </text>
                        </g>
                      );
                    }}
                  />
                  <Radar name="Score" dataKey="A" stroke="#a855f7" strokeWidth={2} fill="#a855f7" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">Loading radar data...</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ─── ROW 4: Bottom Sections ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Your Career Journey - Col span 2 */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl p-6 lg:col-span-2 border border-slate-100 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 mb-8">Your Career Journey</h3>
          
          <div className="relative flex items-center justify-between px-4 pb-4">
            {/* Connecting Line */}
            <div className="absolute left-[10%] right-[10%] top-6 h-0.5 bg-slate-100 -z-10">
              <div className="h-full bg-gradient-to-r from-indigo-500 via-emerald-500 to-slate-200 w-[60%]"></div>
            </div>

            {/* Timeline Steps */}
            {[
              { title: 'Resume Uploaded', date: stats.avg_ats_score > 0 ? 'Done' : 'Pending', icon: UploadCloud, color: 'text-indigo-600', bg: 'bg-indigo-600 text-white', border: 'border-white', status: stats.avg_ats_score > 0 ? 'done' : 'pending' },
              { title: 'ATS Optimized', date: stats.avg_ats_score >= 70 ? 'Done' : 'In Progress', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-600 text-white', border: 'border-white', status: stats.avg_ats_score >= 70 ? 'done' : 'pending' },
              { title: 'Mock Interview', date: stats.interviews_completed > 0 ? 'Done' : 'Pending', icon: Mic, color: 'text-emerald-500', bg: 'bg-emerald-500 text-white', border: 'border-white', status: stats.interviews_completed > 0 ? 'done' : 'pending' },
              { title: 'Confidence Improved', date: stats.avg_interview_score >= 75 ? 'Done' : 'Pending', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500 text-white', border: 'border-white', status: stats.avg_interview_score >= 75 ? 'done' : 'pending' },
              { title: 'Job Ready', date: stats.avg_hiring_probability >= 80 ? 'Done' : 'In Progress', icon: Zap, color: 'text-purple-500', bg: 'bg-white text-slate-300', border: 'border-slate-200 border-dashed', status: stats.avg_hiring_probability >= 80 ? 'done' : 'pending' }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 shadow-sm z-10 ${step.status === 'done' ? step.bg : 'bg-white text-slate-300 border-slate-200 border-dashed'}`}>
                  {step.status === 'done' ? <step.icon size={18} /> : (
                    <svg className="w-5 h-5 text-indigo-300 fill-current" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-xs font-bold text-slate-800">{step.title}</p>
                  <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{step.date}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Insights - Col span 1 */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-extrabold text-slate-900">AI Insights</h3>
            <span className="text-xs font-bold text-indigo-600 cursor-pointer hover:underline flex items-center">
              View All <ChevronRight size={14} />
            </span>
          </div>

          <div className="space-y-4 flex-1">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                <ArrowUpRight size={14} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700 leading-snug">Your average ATS score is <span className="font-bold text-slate-900">{stats.avg_ats_score}%</span>.</p>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 shrink-0">Today</span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 mt-0.5">
                <Mic size={14} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700 leading-snug">You have completed <span className="font-bold text-slate-900">{stats.interviews_completed}</span> mock interviews.</p>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 shrink-0">Recent</span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0 mt-0.5">
                <Zap size={14} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700 leading-snug">Your hiring readiness sits at <span className="font-bold text-slate-900">{stats.avg_hiring_probability}%</span>.</p>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 shrink-0">Recent</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
