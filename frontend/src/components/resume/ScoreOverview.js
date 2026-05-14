"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

function ScoreRing({ score, label, color, size = 110 }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let v = 0; const step = score / 60;
    const t = setInterval(() => { v += step; if (v >= score) { setDisplayed(score); clearInterval(t); } else setDisplayed(Math.floor(v)); }, 16);
    return () => clearInterval(t);
  }, [score]);
  const r = (size - 12) / 2, circ = 2 * Math.PI * r, dash = (displayed / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
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
    </div>
  );
}

export default function ScoreOverview({ data }) {
  const radarData = [
    { subject: 'ATS', score: data.atsScore || 0 },
    { subject: 'Recruiter', score: data.recruiterScore || 0 },
    { subject: 'Quality', score: data.resumeQualityScore || 0 },
    { subject: 'Skills', score: data.skillAnalysis?.skillStrengthScore || 0 },
    { subject: 'Projects', score: data.sectionAnalysis?.projects?.score || 0 },
    { subject: 'Match', score: data.jobMatchAnalysis?.matchPercentage || 0 },
  ];

  const scores = [
    { label: 'ATS Score', value: data.atsScore || 0, color: '#818cf8' },
    { label: 'Recruiter Score', value: data.recruiterScore || 0, color: '#34d399' },
    { label: 'Hiring Probability', value: data.hiringProbability || 0, color: '#f59e0b' },
    { label: 'Resume Quality', value: data.resumeQualityScore || 0, color: '#ec4899' },
    { label: 'Interview Chance', value: data.interviewSelectionProbability || 0, color: '#06b6d4' },
    { label: 'Job Match', value: data.jobMatchAnalysis?.matchPercentage || 0, color: '#a78bfa' },
  ];

  const atsPass = data.atsEngine?.atsPassPrediction || '';
  const passColor = atsPass.includes('pass') ? '#34d399' : atsPass.includes('Might') ? '#fbbf24' : '#f87171';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top verdict */}
      {data.overallVerdict && (
        <div className="glass" style={{ padding: 20, borderLeft: '4px solid #6366f1' }}>
          <p style={{ fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 6 }}>🤖 AI OVERALL VERDICT</p>
          <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: 14 }}>{data.overallVerdict}</p>
        </div>
      )}

      {/* Score rings */}
      <div className="glass" style={{ padding: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 }}>Score Breakdown</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {scores.map(s => <ScoreRing key={s.label} score={s.value} label={s.label} color={s.color} />)}
        </div>
      </div>

      {/* ATS Pass prediction */}
      {atsPass && (
        <div className="glass" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: 14 }}>ATS System Prediction</span>
          <span style={{ padding: '4px 16px', borderRadius: 999, background: `${passColor}18`, border: `1px solid ${passColor}40`, color: passColor, fontWeight: 700, fontSize: 13 }}>{atsPass}</span>
        </div>
      )}

      {/* Radar */}
      <div className="glass" style={{ padding: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Competency Radar</p>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} dot={{ fill: '#818cf8', r: 4 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* First impression */}
      {data.recruiterFirstImpression && (
        <div className="glass" style={{ padding: 20, borderLeft: '4px solid #34d399' }}>
          <p style={{ fontSize: 12, color: '#34d399', fontWeight: 700, marginBottom: 6 }}>👀 RECRUITER FIRST IMPRESSION (6 seconds)</p>
          <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: 14, fontStyle: 'italic' }}>"{data.recruiterFirstImpression}"</p>
        </div>
      )}
    </div>
  );
}
