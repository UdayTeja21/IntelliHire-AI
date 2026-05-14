"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { Target, TrendingUp, Clock, Award, ArrowRight, FileText, Mic, Sparkles, ChevronRight } from 'lucide-react';

// Data is now fetched dynamically from the backend

function StatCard({ icon: Icon, label, value, color, delay }) {
  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-400 shadow-emerald-500/10',
    indigo: 'bg-indigo-500/10 text-indigo-400 shadow-indigo-500/10',
    amber: 'bg-amber-500/10 text-amber-400 shadow-amber-500/10',
    pink: 'bg-pink-500/10 text-pink-400 shadow-pink-500/10',
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="glass glass-hover p-6 flex items-center gap-5 rounded-2xl cursor-default">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${colorMap[color]}`}>
        <Icon size={26} />
      </div>
      <div>
        <p className="text-sm text-slate-400 mb-0.5">{label}</p>
        <p className="text-2xl font-black text-white">{value}</p>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    avg_interview_score: 0,
    interviews_completed: 0,
    practice_hours: 0,
    avg_ats_score: 0,
    lineData: [],
    radarData: [],
    recentInterviews: []
  });

  useEffect(() => {
    if (user) {
      api.get('/user/stats')
        .then(res => setStats(res.data))
        .catch(err => console.error("Failed to load stats:", err));
    }
  }, [user]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="glass px-4 py-3 rounded-xl shadow-xl text-sm">
          <p className="text-slate-400">{label}</p>
          <p className="text-indigo-400 font-bold">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="py-10 space-y-10">
      {/* Hero / Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden glass rounded-3xl p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-pink-600/10 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-indigo-400 font-medium">
              <Sparkles size={16} />
              {user ? `Welcome back, ${user.full_name?.split(' ')[0]}!` : 'Welcome to IntelliHire AI'}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Master Your Next <br />
              <span className="gradient-text">Interview</span>
            </h1>
            <p className="text-slate-400 max-w-lg leading-relaxed">
              AI-powered mock interviews and ATS resume analysis designed to get you hired at top companies.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link href="/interview" className="btn-primary">
              <Mic size={18} /> Start Interview <ArrowRight size={16} />
            </Link>
            <Link href="/resume" className="btn-secondary">
              <FileText size={18} /> Analyze Resume
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={Target} label="Avg. Interview Score" value={`${stats.avg_interview_score}%`} color="emerald" delay={0.1} />
        <StatCard icon={TrendingUp} label="Interviews Completed" value={stats.interviews_completed} color="indigo" delay={0.15} />
        <StatCard icon={Clock} label="Practice Hours" value={`${stats.practice_hours}h`} color="amber" delay={0.2} />
        <StatCard icon={Award} label="Avg. ATS Score" value={`${stats.avg_ats_score}%`} color="pink" delay={0.25} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass p-6 rounded-2xl lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Performance Trend</h3>
              <p className="text-xs text-slate-500">Last 7 days interview scores</p>
            </div>
            <span className="badge-success">↑ 29% this week</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.lineData?.length > 0 ? stats.lineData : [{day:'Mon',score:0}]}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ fill: '#ec4899', r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Radar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass p-6 rounded-2xl">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white">Skill Breakdown</h3>
            <p className="text-xs text-slate-500">Your strengths across categories</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={stats.radarData?.length > 0 ? stats.radarData : [{skill:'None',A:0}]}>
                <PolarGrid stroke="rgba(255,255,255,0.07)" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Radar name="Score" dataKey="A" stroke="#818cf8" fill="#6366f1" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Interviews */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.06] flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Interviews</h3>
            <p className="text-xs text-slate-500">Your latest practice sessions</p>
          </div>
          <Link href="/interview" className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            New Session <ChevronRight size={16} />
          </Link>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {stats.recentInterviews?.length > 0 ? stats.recentInterviews.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
              className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <Mic size={18} />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{item.role}</p>
                  <p className="text-xs text-slate-500">{item.type} · {item.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={item.score >= 85 ? 'badge-success' : item.score >= 70 ? 'badge-warning' : 'bg-slate-500/20 text-slate-300 px-2 py-1 rounded-md text-xs font-semibold'}>
                  {item.score}%
                </span>
              </div>
            </motion.div>
          )) : (
            <div className="p-6 text-center text-slate-500 text-sm">
              No recent interviews found. <Link href="/interview" className="text-indigo-400 underline">Start one now</Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
