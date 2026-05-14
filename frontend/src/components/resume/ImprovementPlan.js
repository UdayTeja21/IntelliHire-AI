"use client";
import { motion } from 'framer-motion';

const PRIORITY_COLORS = { High: '#f87171', Medium: '#f59e0b', Low: '#34d399' };

export default function ImprovementPlan({ data }) {
  const imp = data?.aiImprovements || {};
  const roadmap = data?.improvementRoadmap || [];
  const path = data?.learningPath || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Better Summary */}
      {imp.betterSummary && (
        <div className="glass" style={{ padding: 20, borderLeft: '4px solid #34d399' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>✨ AI-Optimized Summary</p>
          <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.8, fontStyle: 'italic' }}>"{imp.betterSummary}"</p>
        </div>
      )}

      {/* Stronger Bullet Points */}
      {imp.strongerBulletPoints?.length > 0 && (
        <div className="glass" style={{ padding: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>💥 Stronger Bullet Points</p>
          {imp.strongerBulletPoints.map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              style={{ padding: '10px 14px', marginBottom: 8, background: 'rgba(99,102,241,0.06)', borderLeft: '3px solid #6366f1', borderRadius: '0 10px 10px 0' }}>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>▶ {b}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* ATS Keywords + Power Verbs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {imp.atsKeywordsToAdd?.length > 0 && (
          <div className="glass" style={{ padding: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>🔑 ATS Keywords to Add</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {imp.atsKeywordsToAdd.map((k, i) => <span key={i} style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: 12, fontWeight: 600 }}>{k}</span>)}
            </div>
          </div>
        )}
        {imp.powerActionVerbs?.length > 0 && (
          <div className="glass" style={{ padding: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>⚡ Power Action Verbs</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {imp.powerActionVerbs.map((v, i) => <span key={i} style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa', fontSize: 12, fontWeight: 700 }}>{v}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* Formatting Tips */}
      {imp.formattingTips?.length > 0 && (
        <div className="glass" style={{ padding: 18 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>📐 Formatting Tips</p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {imp.formattingTips.map((t, i) => <li key={i} style={{ fontSize: 13, color: '#94a3b8', display: 'flex', gap: 8 }}><span style={{ color: '#06b6d4' }}>→</span>{t}</li>)}
          </ul>
        </div>
      )}

      {/* Roadmap */}
      {roadmap.length > 0 && (
        <div className="glass" style={{ padding: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>🗺️ Improvement Roadmap</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {roadmap.map((item, i) => {
              const c = PRIORITY_COLORS[item.priority] || '#818cf8';
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  style={{ display: 'flex', gap: 14, padding: '14px 16px', background: `${c}08`, border: `1px solid ${c}20`, borderRadius: 12 }}>
                  <span style={{ padding: '2px 10px', borderRadius: 999, background: `${c}18`, color: c, fontSize: 11, fontWeight: 800, height: 'fit-content', flexShrink: 0 }}>{item.priority}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, color: 'white', fontWeight: 600, marginBottom: 4 }}>{item.action}</p>
                    <p style={{ fontSize: 12, color: '#64748b' }}>Impact: {item.impact} · Est. time: {item.timeToComplete}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Learning Path */}
      {path.length > 0 && (
        <div className="glass" style={{ padding: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>📚 Suggested Learning Path</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {path.map((item, i) => {
              const c = PRIORITY_COLORS[item.priority] || '#818cf8';
              return (
                <div key={i} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>{item.skill}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 999, background: `${c}18`, color: c, fontSize: 11, fontWeight: 700 }}>{item.priority}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>{item.reason}</p>
                  {item.resources?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {item.resources.map((r, j) => <span key={j} style={{ padding: '2px 10px', borderRadius: 999, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', fontSize: 11, fontWeight: 600 }}>📖 {r}</span>)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
