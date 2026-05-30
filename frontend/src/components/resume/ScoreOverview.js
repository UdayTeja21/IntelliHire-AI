"use client";
import { useEffect, useState } from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

function ScoreRing({ score, label, color, size = 110, delay = 0 }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let v = 0; const step = score / 60;
    const t = setInterval(() => { v += step; if (v >= score) { setDisplayed(score); clearInterval(t); } else setDisplayed(Math.floor(v)); }, 16);
    return () => clearInterval(t);
  }, [score]);
  const r = (size - 12) / 2, circ = 2 * Math.PI * r, dash = (displayed / 100) * circ;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, duration: 0.5 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={12} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={12}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.05s', filter: `drop-shadow(0 0 6px ${color})` }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 24, fontWeight: 900, color }}>{displayed}</span>
          <span style={{ fontSize: 10, color: '#64748b' }}>/ 100</span>
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textAlign: 'center' }}>{label}</span>
    </motion.div>
  );
}

export default function ScoreOverview({ data }) {
  const radarData = [
    { subject: 'ATS Score', score: Number(data.atsScore || data.ats_score || 0) },
    { subject: 'Technical', score: Number(data.technicalStrengthScore || data.technical_strength_score || data.technical_strength || data.technicalStrength || 0) },
    { subject: 'Projects', score: Number(data.projectQualityScore || data.project_quality_score || data.projectQuality || 0) },
    { subject: 'Communication', score: Number(data.communication || data.communicationScore || data.communication_score || 0) },
    { subject: 'Skill Match', score: Number(data.skillRelevance || data.skill_relevance || data.skillMatch || 0) },
    { subject: 'Structure', score: Number(data.resumeStructure || data.resume_structure || data.structureScore || 0) },
  ];

  const scores = [
    { label: 'ATS Score', value: Number(data.atsScore || data.ats_score || 0), color: '#818cf8' },
    { label: 'Technical Strength', value: Number(data.technicalStrengthScore || data.technical_strength_score || data.technical_strength || data.technicalStrength || 0), color: '#34d399' },
    { label: 'Project Quality', value: Number(data.projectQualityScore || data.project_quality_score || data.projectQuality || 0), color: '#f59e0b' },
    { label: 'Communication', value: Number(data.communication || data.communicationScore || data.communication_score || 0), color: '#ec4899' },
    { label: 'Skill Relevance', value: Number(data.skillRelevance || data.skill_relevance || data.skillMatch || 0), color: '#06b6d4' },
    { label: 'Resume Structure', value: Number(data.resumeStructure || data.resume_structure || data.structureScore || 0), color: '#a855f7' },
  ];

  const hiringProb = data.hiringProbability || 0;
  const passColor = hiringProb > 75 ? '#34d399' : hiringProb > 50 ? '#fbbf24' : '#f87171';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top verdict */}
      {data.overallVerdict && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="layered-card" style={{ padding: 20, borderLeft: '4px solid #6366f1' }}>
          <p style={{ fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 6 }}>🤖 AI OVERALL VERDICT</p>
          <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: 14 }}>{data.overallVerdict}</p>
        </motion.div>
      )}

      {/* Score rings */}
      <div className="layered-card" style={{ padding: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 }}>Score Breakdown (6 Metrics)</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 24 }}>
          {scores.map((s, idx) => <ScoreRing key={s.label} score={s.value} label={s.label} color={s.color} delay={idx * 0.1} />)}
        </div>
      </div>

      {/* Hiring Probability */}
      {hiringProb > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="layered-card" style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🎯</span>
            <div>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 16, display: 'block' }}>Hiring Probability Prediction</span>
              <span style={{ color: '#94a3b8', fontSize: 12 }}>Based on aggregated metrics</span>
            </div>
          </div>
          <span style={{ padding: '8px 20px', borderRadius: 999, background: `${passColor}18`, border: `1px solid ${passColor}40`, color: passColor, fontWeight: 800, fontSize: 18 }}>{hiringProb}%</span>
        </motion.div>
      )}

      {/* Radar */}
      <div className="layered-card" style={{ padding: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Competency Radar</p>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} itemStyle={{ color: '#818cf8', fontWeight: 'bold' }} />
              <Radar dataKey="score" stroke="#818cf8" fill="url(#colorUv)" fillOpacity={0.4} strokeWidth={3} dot={{ fill: '#818cf8', stroke: '#fff', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#c084fc" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* First impression */}
      {data.recruiterFirstImpression && (
        <div className="layered-card" style={{ padding: 20, borderLeft: '4px solid #34d399' }}>
          <p style={{ fontSize: 12, color: '#34d399', fontWeight: 700, marginBottom: 6 }}>👀 RECRUITER FIRST IMPRESSION (6 seconds)</p>
          <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: 14, fontStyle: 'italic' }}>"{data.recruiterFirstImpression}"</p>
        </div>
      )}
    </div>
  );
}
