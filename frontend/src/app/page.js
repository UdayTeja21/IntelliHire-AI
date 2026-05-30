"use client";
import { motion } from 'framer-motion';
import { ArrowRight, Bot, ChevronRight, Mic, FileText, Target, TrendingUp, Star, Zap, Rocket, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

function StatCard({ icon: Icon, title, value, subtitle, color, delay }) {
  const colorMap = {
    teal: 'from-teal-500/10 to-teal-500/0 text-teal-400 border-teal-500/20',
    slate: 'from-slate-500/10 to-slate-500/0 text-slate-400 border-slate-500/20',
    emerald: 'from-emerald-500/10 to-emerald-500/0 text-emerald-400 border-emerald-500/20',
    blue: 'from-blue-500/10 to-blue-500/0 text-blue-400 border-blue-500/20',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="glass p-5 flex items-center gap-5 rounded-2xl relative overflow-hidden group border-white/5 bg-slate-800/40">
      <div className={`absolute inset-0 bg-gradient-to-r ${colorMap[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className={`relative z-10 w-16 h-16 rounded-xl flex items-center justify-center border bg-slate-900/50 ${colorMap[color]}`}>
        <Icon size={24} />
      </div>
      <div className="relative z-10">
        <p className="text-sm font-semibold text-slate-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <p className={`text-xs font-semibold ${colorMap[color].split(' ')[2]}`}>{subtitle}</p>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    avg_interview_score: 0,
    interviews_completed: 0,
    avg_ats_score: 0,
    avg_technical_score: 0,
    lineData: [],
  });

  useEffect(() => {
    if (user) {
      api.get('/user/stats')
        .then(res => setStats(res.data))
        .catch(err => console.error("Failed to load stats:", err));
    }
  }, [user]);

  const readiness = Math.round((stats.avg_ats_score + stats.avg_interview_score) / 2) || 29;

  return (
    <div className="py-2 space-y-6">
      {/* Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
        className="relative overflow-hidden rounded-[1.5rem] p-8 md:p-12 border border-slate-700/50 bg-slate-800/50 shadow-xl flex flex-col md:flex-row items-center justify-between gap-10 min-h-[250px]">
        
        {/* Glow Effects */}
        <div className="absolute top-[-50%] left-[-10%] w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/20 bg-teal-500/10 text-teal-300 font-semibold text-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
            </span>
            Welcome back, {user ? user.email?.split('@')[0].toUpperCase() : 'USER'}! 👋
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Master Your Next <span className="text-teal-400">Career Move</span>
          </h1>
          <p className="text-slate-300 max-w-md text-base font-medium leading-relaxed">
            Enterprise-grade ATS resume analysis and AI mock interviews tailored for modern recruiters.
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-4 flex-shrink-0 w-full md:w-72">
          <Link href="/interview" className="flex items-center justify-between bg-slate-800/80 hover:bg-slate-700/80 p-5 rounded-2xl border border-slate-600/50 transition-all hover:-translate-y-1 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 group-hover:bg-teal-500/20 transition-colors">
                <Mic size={20} className="text-teal-400" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-base">Start Interview</p>
                <p className="text-xs text-slate-400">Begin a new mock session</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link href="/resume" className="flex items-center justify-between bg-slate-800/80 hover:bg-slate-700/80 p-5 rounded-2xl border border-slate-600/50 transition-all hover:-translate-y-1 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                <FileText size={20} className="text-blue-400" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-base">Analyze Resume</p>
                <p className="text-xs text-slate-400">Get AI-powered ATS analysis</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} title="Avg. Interview Score" value={`${stats.avg_interview_score}%`} subtitle={stats.avg_interview_score > 0 ? 'Good progress!' : 'Keep practicing!'} color="teal" delay={0.1} />
        <StatCard icon={TrendingUp} title="Interviews Completed" value={stats.interviews_completed} subtitle={stats.interviews_completed > 0 ? 'Consistent!' : "Let's complete your first!"} color="slate" delay={0.2} />
        <StatCard icon={Star} title="Avg. ATS Score" value={`${stats.avg_ats_score}%`} subtitle={stats.avg_ats_score > 70 ? 'Excellent match!' : 'Needs improvement'} color="emerald" delay={0.3} />
        <StatCard icon={Zap} title="Overall Readiness" value={`${readiness}%`} subtitle={readiness > 70 ? 'Ready for jobs!' : 'Keep improving!'} color="blue" delay={0.4} />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 lg:col-span-2 flex flex-col min-h-[350px] bg-slate-800/40 border-slate-700/50">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-teal-400" size={20} />
              <div>
                <h3 className="text-lg font-bold text-white">Performance Trend</h3>
                <p className="text-xs text-slate-400">Last 7 days interview scores</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full relative flex items-center justify-center">
            {stats.lineData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.lineData}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={3} fill="url(#scoreGrad)" dot={{ fill: '#0f172a', stroke: '#14b8a6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#14b8a6' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center opacity-80 pb-10">
                <div className="relative w-20 h-20 mb-4 flex items-center justify-center bg-slate-800 rounded-full border border-slate-700">
                  <Rocket size={32} className="text-slate-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">No data yet</h4>
                <p className="text-sm text-slate-400 max-w-xs">Complete interviews to see your performance trend here.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Interview Readiness */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-6 flex flex-col min-h-[350px] bg-slate-800/40 border-slate-700/50">
          <div className="flex items-center gap-3 mb-8">
            <Target className="text-teal-400" size={20} />
            <h3 className="text-lg font-bold text-white">Interview Readiness</h3>
          </div>

          <div className="flex-1 flex flex-col items-center justify-between gap-6">
            <div className="relative w-48 h-24 flex items-end justify-center overflow-hidden">
              {/* Semi-circle Gauge */}
              <div className="absolute top-0 w-48 h-48 rounded-full border-[12px] border-slate-800 border-b-transparent border-r-transparent transform -rotate-45" />
              <div className="absolute top-0 w-48 h-48 rounded-full border-[12px] border-teal-500 border-b-transparent border-r-transparent transform -rotate-45" 
                   style={{ strokeDasharray: `${readiness}, 100`, clipPath: `polygon(0 0, 100% 0, 100% ${readiness > 50 ? '100%' : '50%'}, 0 100%)` }} />
              
              <div className="text-center relative z-10 bg-[#0f172a] pt-6 pb-2 px-8 rounded-t-full">
                <span className="text-4xl font-bold text-white">{readiness}<span className="text-xl text-slate-400">%</span></span>
                <p className="text-sm font-bold text-teal-500 mt-1">Getting Started</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center leading-relaxed px-4">
              You're on your way! Keep practicing to boost your confidence and skills.
            </p>

            <div className="w-full mt-4 bg-slate-800 border border-slate-600 p-4 rounded-xl flex items-center justify-between group cursor-pointer hover:border-slate-500 transition-colors">
              <div className="flex items-center gap-4">
                <Rocket size={20} className="text-teal-400" />
                <div>
                  <p className="text-sm font-bold text-white">Consistency is key!</p>
                  <p className="text-xs text-slate-400">Aim for 3-5 interviews per week.</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-white transition-colors" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
