"use client";
import { motion } from 'framer-motion';
import { Bookmark, FileText, Download, ExternalLink, PlayCircle } from 'lucide-react';

export default function Materials() {
  const materials = [
    { id: 1, type: 'guide', title: 'React Official Documentation', desc: 'The best place to deeply understand React hooks, rendering, and state management.', icon: FileText, color: 'text-teal-400', bg: 'bg-teal-500/10', link: 'https://react.dev/learn' },
    { id: 2, type: 'video', title: 'System Design Primer', desc: 'The most comprehensive guide to cracking the system design interview.', icon: PlayCircle, color: 'text-indigo-400', bg: 'bg-indigo-500/10', link: 'https://github.com/donnemartin/system-design-primer' },
    { id: 3, type: 'guide', title: 'FreeCodeCamp Interview Prep', desc: 'Thousands of coding challenges and interview questions across all tech stacks.', icon: Bookmark, color: 'text-blue-400', bg: 'bg-blue-500/10', link: 'https://www.freecodecamp.org/learn/coding-interview-prep/' },
    { id: 4, type: 'template', title: 'FAANG-level Resume Template', desc: 'Download standard ATS-optimized resume templates (Harvard format).', icon: Download, color: 'text-emerald-400', bg: 'bg-emerald-500/10', link: 'https://hwpi.harvard.edu/files/ocs/files/hes-resume-cover-letter-guide.pdf' },
    { id: 5, type: 'guide', title: 'MDN Web Docs (JavaScript)', desc: 'The gold standard for JavaScript concepts, closures, and prototypes.', icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
    { id: 6, type: 'video', title: 'ByteByteGo System Design', desc: 'Visual step-by-step videos of complex system architectures.', icon: PlayCircle, color: 'text-pink-400', bg: 'bg-pink-500/10', link: 'https://www.youtube.com/@ByteByteGo' },
  ];

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
          <Bookmark className="text-amber-400" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Saved Materials</h1>
          <p className="text-slate-400 text-sm">Curated resources and templates to help you prepare.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((mat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={mat.id} 
            className="glass rounded-2xl p-6 border border-white/5 flex flex-col h-full group hover:border-white/20 transition-colors"
          >
            <div className={`w-12 h-12 rounded-xl ${mat.bg} flex items-center justify-center mb-4`}>
              <mat.icon className={mat.color} size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{mat.title}</h3>
            <p className="text-slate-400 text-sm flex-1 leading-relaxed">{mat.desc}</p>
            
            <a href={mat.link} target="_blank" rel="noopener noreferrer" className="mt-6 w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors">
              Access Resource <ExternalLink size={14} />
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
