"use client";
import { motion } from 'framer-motion';
import { History as HistoryIcon, Clock, Target, Mic, Calendar, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/interview/history')
      .then(res => {
        setHistory(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch interview history:", err);
        setLoading(false);
      });
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return 'Unknown date';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="py-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
          <HistoryIcon className="text-indigo-600" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Interview History</h1>
          <p className="text-slate-500 text-sm font-medium">Review your past performance and track your growth.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
            <Mic size={48} className="mb-4 text-slate-200" />
            <h3 className="text-lg font-bold text-slate-700">No interviews yet</h3>
            <p className="text-sm font-medium">Start a mock interview to see your history here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.map((item, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={item.id} 
                className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                    <Mic size={20} className="text-indigo-500 group-hover:text-indigo-700 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors">{item.role}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 mt-1.5">
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-600"><Target size={12} /> {item.type}</span>
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-600"><Clock size={12} /> {item.difficulty}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(item.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end mt-4 sm:mt-0">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Overall Score</span>
                    <div className={`px-3 py-1 rounded-lg text-sm font-black border shadow-sm ${
                      item.score >= 85 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                      item.score >= 70 ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 
                      'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>
                      {item.score}%
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center group-hover:bg-indigo-600 text-slate-400 group-hover:text-white transition-all border border-slate-200 group-hover:border-indigo-600 shadow-sm">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
