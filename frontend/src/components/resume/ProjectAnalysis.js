"use client";
import { motion } from 'framer-motion';

const LEVEL_COLORS = { Beginner: '#64748b', Intermediate: '#818cf8', Advanced: '#34d399', Enterprise: '#f59e0b' };

function ScorePill({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center', padding: '12px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize: 20, fontWeight: 900, color: color || '#818cf8', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 10, color: '#475569', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

export default function ProjectAnalysis({ data }) {
  const projects = data?.projectAnalysis || [];

  if (!projects.length) return (
    <div className="glass" style={{ padding: 40, textAlign: 'center', color: '#475569' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
      <p style={{ fontWeight: 700, color: 'white', marginBottom: 6 }}>No Projects Detected</p>
      <p style={{ fontSize: 13 }}>Add a Projects section to your resume for AI project-level evaluation.</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="glass" style={{ padding: '14px 18px', borderLeft: '4px solid #6366f1' }}>
        <p style={{ fontSize: 13, color: '#818cf8', fontWeight: 600 }}>🚀 Deep AI analysis of each project — complexity, recruiter value, tech stack, and improvements.</p>
      </div>

      {projects.map((proj, i) => {
        const levelColor = LEVEL_COLORS[proj.level] || '#818cf8';
        return (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontWeight: 800, color: 'white', fontSize: 17, marginBottom: 6 }}>{proj.name || `Project ${i + 1}`}</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ padding: '3px 12px', borderRadius: 999, background: `${levelColor}18`, border: `1px solid ${levelColor}40`, color: levelColor, fontSize: 12, fontWeight: 700 }}>{proj.level || 'Unknown'}</span>
                  {proj.aiIntegration && proj.aiIntegration !== 'No' && <span style={{ padding: '3px 12px', borderRadius: 999, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', color: '#a78bfa', fontSize: 12, fontWeight: 600 }}>🤖 AI Integrated</span>}
                </div>
              </div>
            </div>

            {/* Scores */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
              <ScorePill label="Complexity" value={`${proj.complexityScore || 0}`} color="#818cf8" />
              <ScorePill label="Recruiter Value" value={`${proj.recruiterValue || 0}`} color="#34d399" />
              <ScorePill label="Level" value={proj.level?.split(' ')[0] || 'N/A'} color={levelColor} />
            </div>

            {/* Tech Stack */}
            {proj.technologies?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Tech Stack</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {proj.technologies.map((t, j) => <span key={j} style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', fontSize: 12, fontWeight: 600 }}>{t}</span>)}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              {[['🌍 Real-World Impact', proj.realWorldImpact], ['📈 Scalability', proj.scalability], ['🚀 Deployment', proj.deploymentPractices]].filter(([,v]) => v).map(([label, val]) => (
                <div key={label} style={{ padding: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize: 11, color: '#475569', fontWeight: 700, marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: 13, color: '#94a3b8' }}>{val}</p>
                </div>
              ))}
            </div>

            {proj.strengths?.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>✅ Strengths</p>
                {proj.strengths.map((s, j) => <p key={j} style={{ fontSize: 13, color: '#94a3b8', padding: '4px 0', display: 'flex', gap: 8 }}><span style={{ color: '#34d399' }}>•</span>{s}</p>)}
              </div>
            )}

            {proj.optimizedDescription && (
              <div style={{ padding: 14, background: 'rgba(52,211,153,0.05)', borderRadius: 10, border: '1px solid rgba(52,211,153,0.15)', marginTop: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>✨ AI Optimized Description</p>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, fontStyle: 'italic' }}>{proj.optimizedDescription}</p>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
