"use client";
import { motion } from 'framer-motion';
import { History as HistoryIcon, Clock, Target, Mic, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function History() {
  const dummyHistory = [
    { id: 1, role: 'Software Engineer', type: 'Technical', date: '2 hours ago', duration: '45 mins', score: 85 },
    { id: 2, role: 'Frontend Developer', type: 'Behavioral', date: 'Yesterday', duration: '30 mins', score: 92 },
    { id: 3, role: 'Full Stack Engineer', type: 'System Design', date: '3 days ago', duration: '50 mins', score: 78 },
  ];

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
          <HistoryIcon className="text-indigo-400" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Interview History</h1>
          <p className="text-slate-400 text-sm">Review your past performance and track your growth.</p>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-white/5">
        <div className="divide-y divide-white/5">
          {dummyHistory.map((item, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={item.id} 
              className="p-6 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group cursor-pointer"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-[#0a0a1a] flex items-center justify-center shadow-inner border border-white/5">
                  <Mic size={20} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{item.role}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><Target size={14} /> {item.type}</span>
                    <span className="flex items-center gap-1"><Calendar size={14} /> {item.date}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {item.duration}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-500 font-medium mb-1">Score</span>
                  <div className={`px-3 py-1 rounded-lg text-sm font-bold border ${
                    item.score >= 90 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    item.score >= 80 ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {item.score}%
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 text-slate-400 group-hover:text-white transition-all">
                  <ChevronRight size={16} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
