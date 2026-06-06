"use client";
import { motion } from 'framer-motion';
import { BarChart2, Download, FileText, Target, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

function StatCard({ icon: Icon, title, value, color, delay }) {
  const colorMap = {
    cyan: 'from-emerald-50 to-emerald-100/50 text-emerald-600 border-emerald-200 bg-emerald-50 text-emerald-600',
    purple: 'from-indigo-50 to-indigo-100/50 text-indigo-600 border-indigo-200 bg-indigo-50 text-indigo-600',
    pink: 'from-pink-50 to-pink-100/50 text-pink-600 border-pink-200 bg-pink-50 text-pink-600',
    yellow: 'from-amber-50 to-amber-100/50 text-amber-600 border-amber-200 bg-amber-50 text-amber-600',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className={`bg-white dark:bg-[#121629] p-5 flex items-center gap-5 rounded-2xl relative overflow-hidden group border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${colorMap[color].split(' ')[0]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center border shadow-sm ${colorMap[color].split(' ').slice(1).join(' ')}`}>
        <Icon size={24} />
      </div>
      <div className="relative z-10">
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-200">{value}</p>
      </div>
    </motion.div>
  );
}

export default function Reports() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    avg_interview_score: 0,
    interviews_completed: 0,
    avg_ats_score: 0,
    avg_technical_score: 0,
    lineData: [],
    radarData: [],
  });

  useEffect(() => {
    if (user) {
      api.get('/user/stats')
        .then(res => setStats(res.data))
        .catch(err => console.error("Failed to load stats:", err));
    }
  }, [user]);

  const handleExport = async () => {
    if (!stats) return;
    try {
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');

      const doc = new jsPDF();
      doc.setFont('helvetica');

      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229);
      doc.text('IntelliHire AI - User Analytics Report', 14, 20);

      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
      if (user && user.email) {
        doc.text(`User: ${user.email}`, 14, 34);
      }

      doc.setFontSize(14);
      doc.setTextColor(20, 20, 20);
      doc.text('Performance Summary', 14, 45);

      doc.autoTable({
        startY: 50,
        head: [['Metric', 'Value']],
        body: [
          ['Average Interview Score', `${stats.avg_interview_score || 0}%`],
          ['Interviews Completed', `${stats.interviews_completed || 0}`],
          ['Practice Hours', `${stats.practice_hours || 0} hrs`],
          ['Average ATS Score', `${stats.avg_ats_score || 0}%`],
          ['Technical Strength', `${stats.avg_technical_score || 0}%`],
          ['Project Quality', `${stats.avg_project_score || 0}%`],
          ['Hiring Probability', `${stats.avg_hiring_probability || 0}%`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] }
      });

      let nextY = doc.lastAutoTable.finalY + 15;

      if (stats.radarData && stats.radarData.length > 0) {
        doc.setFontSize(14);
        doc.text('Recruiter Readiness Breakdown', 14, nextY);
        const radarBody = stats.radarData.map(r => [r.skill, `${r.A}%`]);
        doc.autoTable({
          startY: nextY + 5,
          head: [['Skill Area', 'Score']],
          body: radarBody,
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229] }
        });
        nextY = doc.lastAutoTable.finalY + 15;
      }

      if (stats.missingSkills && stats.missingSkills.length > 0) {
        if (nextY > 250) {
            doc.addPage();
            nextY = 20;
        }
        doc.setFontSize(14);
        doc.text('Missing Critical Skills', 14, nextY);
        doc.setFontSize(11);
        const missingStr = stats.missingSkills.join(', ');
        const splitM = doc.splitTextToSize(missingStr, 180);
        doc.text(splitM, 14, nextY + 7);
        nextY += (splitM.length * 6) + 15;
      }

      if (stats.recentInterviews && stats.recentInterviews.length > 0) {
        if (nextY > 200) {
            doc.addPage();
            nextY = 20;
        }
        doc.setFontSize(14);
        doc.text('Recent Interviews', 14, nextY);
        const recentBody = stats.recentInterviews.map(r => [
          r.role || '-', r.type || '-', `${r.score}%` || '-', r.date || '-'
        ]);
        doc.autoTable({
          startY: nextY + 5,
          head: [['Role', 'Type', 'Score', 'Date']],
          body: recentBody,
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229] }
        });
      }

      doc.save(`IntelliHire_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    }
  };

  if (!user) return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center gap-6 text-center max-w-md mx-auto fade-in">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-md animate-float">
        <BarChart2 size={32} />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 font-sans">Sign in to view reports</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Please sign in to see your interview analytics and performance trajectory.</p>
      </div>
      <div className="flex gap-4.5 w-full mt-3">
        <button onClick={() => router.push('/login')} className="flex-1 py-2.5 bg-[#3b59df] text-white rounded-xl font-bold hover:bg-[#2c45b8] transition-colors">Sign In</button>
        <button onClick={() => router.push('/register')} className="flex-1 py-2.5 bg-white dark:bg-[#121629] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-[#1a1f33] transition-colors">Create Account</button>
      </div>
    </div>
  );

  return (
    <div className="py-6 space-y-8 max-w-7xl mx-auto fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
            <BarChart2 className="text-indigo-600 dark:text-indigo-400" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Analytics & Reports</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Deep dive into your interview and resume metrics.</p>
          </div>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 bg-white dark:bg-[#121629] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#1a1f33] px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-sm">
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
          className="bg-white dark:bg-[#121629] border border-slate-200 dark:border-white/5 shadow-sm rounded-3xl min-h-[400px] p-8 flex flex-col lg:col-span-2 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Performance Trajectory</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Tracking your mock interview scores over the last 7 days</p>
            </div>
          </div>
          
          <div className="flex-1 w-full relative bg-slate-50/50 dark:bg-[#1a1f33]/50 rounded-2xl border border-slate-100 dark:border-white/5 p-4 z-10">
            {stats.lineData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.lineData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dx={-10} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                    itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" dot={{ fill: '#ffffff', stroke: '#4f46e5', strokeWidth: 3, r: 5 }} activeDot={{ r: 8, stroke: '#ffffff', strokeWidth: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <BarChart2 size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">No historical data</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs font-medium">Complete some mock interviews to see your progress chart here.</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white dark:bg-[#121629] border border-slate-200 dark:border-white/5 shadow-sm rounded-3xl min-h-[400px] p-6 flex flex-col items-center text-center">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recruiter Readiness</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Multi-dimensional skill breakdown</p>
          </div>
          
          <div className="flex-1 w-full bg-slate-50/50 dark:bg-[#1a1f33]/50 rounded-2xl border border-slate-100 dark:border-white/5 relative">
            {stats.radarData && stats.radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={stats.radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#ffffff', border: '1px solid #fbcfe8', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#db2777', fontWeight: 'bold' }}
                  />
                  <Radar name="Readiness" dataKey="A" stroke="#db2777" strokeWidth={2} fill="#fbcfe8" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 font-medium text-sm">Need more data</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
