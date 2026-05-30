"use client";
import { motion } from 'framer-motion';
import { BarChart2, Download, FileText, Target, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
// (I will do a proper replacement)
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

function StatCard({ icon: Icon, title, value, color, delay }) {
  const colorMap = {
    cyan: 'from-cyan-500/20 to-cyan-500/0 text-cyan-400 border-cyan-500/30',
    purple: 'from-purple-500/20 to-purple-500/0 text-purple-400 border-purple-500/30',
    pink: 'from-pink-500/20 to-pink-500/0 text-pink-400 border-pink-500/30',
    yellow: 'from-yellow-500/20 to-yellow-500/0 text-yellow-400 border-yellow-500/30',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="layered-card p-5 flex items-center gap-5 rounded-2xl relative overflow-hidden group">
      <div className={`absolute inset-0 bg-gradient-to-r ${colorMap[color]} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      
      <div className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center border bg-black/40 shadow-inner ${colorMap[color]}`}>
        <Icon size={24} />
      </div>
      <div className="relative z-10">
        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </motion.div>
  );
}

export default function Reports() {
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

  return (
    <div className="py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
            <BarChart2 className="text-indigo-400" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics & Reports</h1>
            <p className="text-slate-400 text-sm mt-1">Deep dive into your interview and resume metrics.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 glass-morphism hover:bg-white/10 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]">
          <Download size={16} /> Export Data
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} title="Avg Interview Score" value={`${stats.avg_interview_score}%`} color="cyan" delay={0} />
        <StatCard icon={TrendingUp} title="Interviews Done" value={stats.interviews_completed} color="purple" delay={0.1} />
        <StatCard icon={FileText} title="Avg ATS Score" value={`${stats.avg_ats_score}%`} color="pink" delay={0.2} />
        <StatCard icon={Zap} title="Technical Strength" value={`${stats.avg_technical_score}%`} color="yellow" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="layered-card animated-bg min-h-[400px] p-8 flex flex-col lg:col-span-2" style={{ backgroundSize: '300% 300%' }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-white">Performance Trajectory</h3>
              <p className="text-sm text-slate-300 opacity-80 mt-1">Tracking your mock interview scores over the last 7 days</p>
            </div>
          </div>
          
          <div className="flex-1 w-full relative bg-black/40 rounded-2xl border border-white/5 p-4 backdrop-blur-sm">
            {stats.lineData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.lineData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" dot={{ fill: '#1e1b4b', stroke: '#818cf8', strokeWidth: 2, r: 5 }} activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-80">
                <BarChart2 size={48} className="text-indigo-400/50 mb-4" />
                <h4 className="text-lg font-bold text-white mb-2">No historical data</h4>
                <p className="text-sm text-slate-400 max-w-xs">Complete some mock interviews to see your progress chart here.</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="layered-card min-h-[400px] p-6 flex flex-col items-center text-center">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white">Recruiter Readiness</h3>
            <p className="text-xs text-slate-400 mt-1">Multi-dimensional skill breakdown</p>
          </div>
          
          <div className="flex-1 w-full bg-black/40 rounded-2xl border border-white/5 relative">
            {stats.radarData && stats.radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={stats.radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(236,72,153,0.2)', borderRadius: '8px' }}
                    itemStyle={{ color: '#ec4899', fontWeight: 'bold' }}
                  />
                  <Radar name="Readiness" dataKey="A" stroke="#ec4899" strokeWidth={2} fill="#ec4899" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">Need more data</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
