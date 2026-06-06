"use client";
import { motion } from 'framer-motion';
import { Bookmark, FileText, Download, ExternalLink, PlayCircle } from 'lucide-react';

export default function Materials() {
  const materials = [
    { id: 1, type: 'guide', title: 'React Official Documentation', desc: 'The best place to deeply understand React hooks, rendering, and state management.', icon: FileText, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100', link: 'https://react.dev/learn' },
    { id: 2, type: 'video', title: 'System Design Primer', desc: 'The most comprehensive guide to cracking the system design interview.', icon: PlayCircle, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100', link: 'https://github.com/donnemartin/system-design-primer' },
    { id: 3, type: 'guide', title: 'FreeCodeCamp Interview Prep', desc: 'Thousands of coding challenges and interview questions across all tech stacks.', icon: Bookmark, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', link: 'https://www.freecodecamp.org/learn/coding-interview-prep/' },
    { id: 4, type: 'template', title: 'FAANG-level Resume Template', desc: 'Download standard ATS-optimized resume templates (Harvard format).', icon: Download, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', link: 'https://hwpi.harvard.edu/files/ocs/files/hes-resume-cover-letter-guide.pdf' },
    { id: 5, type: 'guide', title: 'MDN Web Docs (JavaScript)', desc: 'The gold standard for JavaScript concepts, closures, and prototypes.', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
    { id: 6, type: 'video', title: 'ByteByteGo System Design', desc: 'Visual step-by-step videos of complex system architectures.', icon: PlayCircle, color: 'text-pink-600', bg: 'bg-pink-50 border-pink-100', link: 'https://www.youtube.com/@ByteByteGo' },
  ];

  return (
    <div className="py-6 space-y-6 max-w-7xl mx-auto fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center border border-amber-200 dark:border-amber-500/20 shadow-sm">
          <Bookmark className="text-amber-500 dark:text-amber-400" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Saved Materials</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Curated resources and templates to help you prepare.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((mat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={mat.id} 
            className="bg-white dark:bg-[#121629] rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-sm flex flex-col h-full group hover:shadow-md hover:border-slate-300 dark:hover:border-white/10 transition-all"
          >
            <div className={`w-12 h-12 rounded-xl ${mat.bg.replace('bg-', 'bg-').replace('border-', 'border-')} dark:bg-slate-800/50 dark:border-white/5 border flex items-center justify-center mb-4`}>
              <mat.icon className={`${mat.color}`} size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{mat.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm flex-1 leading-relaxed">{mat.desc}</p>
            
            <a href={mat.link} target="_blank" rel="noopener noreferrer" className="mt-6 w-full py-2.5 rounded-xl bg-slate-50 dark:bg-[#1a1f33] hover:bg-slate-100 dark:hover:bg-[#252b43] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold flex items-center justify-center gap-2 transition-colors">
              Access Resource <ExternalLink size={14} />
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
