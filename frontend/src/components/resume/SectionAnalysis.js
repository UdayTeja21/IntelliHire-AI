"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const SECTION_ICONS = { summary: '📝', skills: '⚡', experience: '💼', projects: '🚀', education: '🎓', certifications: '🏆', achievements: '🌟' };

function ScoreBar({ score }) {
  const color = score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8 }}
          style={{ height: '100%', background: color, borderRadius: 999 }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 800, color, minWidth: 32 }}>{score}</span>
    </div>
  );
}

function SectionCard({ sectionKey, data }) {
  const [open, setOpen] = useState(sectionKey === 'skills');
  const icon = SECTION_ICONS[sectionKey] || '📋';
  const score = data?.score || 0;
  const color = score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171';

  return (
    <div className="glass" style={{ overflow: 'hidden', borderRadius: 14 }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontWeight: 700, color: 'white', textTransform: 'capitalize', fontSize: 15 }}>{sectionKey}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color }}>{score}/100</span>
          </div>
          <ScoreBar score={score} />
        </div>
        {open ? <ChevronUp size={16} style={{ color: '#475569', flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: '#475569', flexShrink: 0 }} />}
      </button>

      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Detected */}
          {(data?.detected) && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Detected</p>
              {Array.isArray(data.detected)
                ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{data.detected.map((d, i) => <span key={i} style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', fontSize: 12, fontWeight: 600 }}>{d}</span>)}</div>
                : <p style={{ fontSize: 13, color: '#94a3b8' }}>{data.detected}</p>
              }
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Strengths */}
            {data?.strengths?.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>✅ Strengths</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {data.strengths.map((s, i) => <li key={i} style={{ fontSize: 13, color: '#94a3b8', display: 'flex', gap: 8 }}><span style={{ color: '#34d399', flexShrink: 0 }}>•</span>{s}</li>)}
                </ul>
              </div>
            )}
            {/* Weaknesses */}
            {data?.weaknesses?.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>⚠️ Weaknesses</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {data.weaknesses.map((s, i) => <li key={i} style={{ fontSize: 13, color: '#94a3b8', display: 'flex', gap: 8 }}><span style={{ color: '#f87171', flexShrink: 0 }}>•</span>{s}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {data?.suggestions?.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>💡 Suggestions</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {data.suggestions.map((s, i) => <li key={i} style={{ fontSize: 13, color: '#94a3b8', display: 'flex', gap: 8, padding: '8px 12px', background: 'rgba(99,102,241,0.05)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.1)' }}><span style={{ color: '#818cf8', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>{s}</li>)}
              </ul>
            </div>
          )}

          {/* Optimized version */}
          {data?.optimizedVersion && (
            <div style={{ padding: 14, background: 'rgba(52,211,153,0.05)', borderRadius: 10, border: '1px solid rgba(52,211,153,0.15)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>✨ AI Optimized Version</p>
              <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, fontStyle: 'italic' }}>{data.optimizedVersion}</p>
            </div>
          )}

          {/* Impactful / Weak lines */}
          {data?.impactfulLines?.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>💥 Strong Lines</p>
              {data.impactfulLines.map((l, i) => <div key={i} style={{ fontSize: 13, color: '#94a3b8', padding: '6px 12px', background: 'rgba(52,211,153,0.05)', borderLeft: '3px solid #34d399', borderRadius: '0 8px 8px 0', marginBottom: 4 }}>{l}</div>)}
            </div>
          )}
          {data?.weakLines?.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>👎 Weak Lines</p>
              {data.weakLines.map((l, i) => <div key={i} style={{ fontSize: 13, color: '#94a3b8', padding: '6px 12px', background: 'rgba(239,68,68,0.05)', borderLeft: '3px solid #f87171', borderRadius: '0 8px 8px 0', marginBottom: 4 }}>{l}</div>)}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function SectionAnalysis({ data }) {
  const sections = data?.sectionAnalysis || {};
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="glass" style={{ padding: '14px 18px', borderLeft: '4px solid #6366f1' }}>
        <p style={{ fontSize: 13, color: '#818cf8', fontWeight: 600 }}>🔍 Section-by-section analysis of every part of your resume. Click any section to expand.</p>
      </div>
      {Object.entries(sections).map(([key, val]) => <SectionCard key={key} sectionKey={key} data={val} />)}
    </div>
  );
}
