"use client";
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function SkillAnalysis({ data }) {
  const skills = data?.skillAnalysis || {};

  const barData = [
    { name: 'Strength', value: skills.skillStrengthScore || 0 },
    { name: 'Market Relevance', value: skills.marketRelevanceScore || 0 },
    { name: 'Hiring Demand', value: skills.hiringDemandScore || 0 },
  ];
  const barColors = ['#818cf8', '#34d399', '#f59e0b'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Score chart */}
      <div className="glass" style={{ padding: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Skill Scores</p>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barSize={36}>
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {barData.map((_, i) => <Cell key={i} fill={barColors[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Detected Skills */}
        {skills.technicalSkills?.length > 0 && (
          <div className="glass" style={{ padding: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>✅ Detected Skills</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {skills.technicalSkills.map((s, i) => (
                <motion.span key={i} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.05 }}
                  style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', fontSize: 12, fontWeight: 600 }}>
                  {s}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Critical Skills */}
        {skills.missingCriticalSkills?.length > 0 && (
          <div className="glass" style={{ padding: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>❌ Missing Critical Skills</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {skills.missingCriticalSkills.map((s, i) => (
                <motion.span key={i} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.05 }}
                  style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 12, fontWeight: 600 }}>
                  {s}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Trending Skills */}
        {skills.trendingSkills?.length > 0 && (
          <div className="glass" style={{ padding: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>🔥 Trending in 2024</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {skills.trendingSkills.map((s, i) => (
                <span key={i} style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: 12, fontWeight: 600 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Top Skills To Add */}
        {skills.topSkillsToAdd?.length > 0 && (
          <div className="glass" style={{ padding: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>⬆️ Add These First</p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {skills.topSkillsToAdd.map((s, i) => (
                <li key={i} style={{ fontSize: 13, color: '#94a3b8', display: 'flex', gap: 8 }}>
                  <span style={{ color: '#818cf8', fontWeight: 800 }}>{i + 1}.</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Skill Gap Analysis */}
      {skills.skillGapAnalysis && (
        <div className="glass" style={{ padding: 20, borderLeft: '4px solid #818cf8' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>🧠 AI Skill Gap Analysis</p>
          <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.8 }}>{skills.skillGapAnalysis}</p>
        </div>
      )}
    </div>
  );
}
