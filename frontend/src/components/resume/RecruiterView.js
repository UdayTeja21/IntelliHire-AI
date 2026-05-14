"use client";
import { motion } from 'framer-motion';

export default function RecruiterView({ data }) {
  const rec = data?.recruiterSimulation || {};
  const ats = data?.atsEngine || {};
  const match = data?.jobMatchAnalysis || {};

  const confColor = { High: '#34d399', Medium: '#f59e0b', Low: '#f87171' }[rec.hiringConfidence] || '#818cf8';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Hiring Decision */}
      <div className="glass" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Recruiter Decision</p>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: 'white' }}>
              {rec.wouldScheduleInterview ? '✅ Would Schedule Interview' : '❌ Would Not Proceed'}
            </h3>
          </div>
          <div style={{ padding: '8px 20px', borderRadius: 12, background: `${confColor}18`, border: `1px solid ${confColor}40`, color: confColor, fontWeight: 800, fontSize: 16 }}>
            {rec.hiringConfidence || 'N/A'} Confidence
          </div>
        </div>
        {rec.reasonForDecision && (
          <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>{rec.reasonForDecision}</p>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recruiter assessments */}
        {[
          ['💻 Technical Impression', rec.technicalImpression, '#818cf8'],
          ['🚀 Project Quality', rec.projectQualityReview, '#34d399'],
          ['📖 Readability', rec.resumeReadabilityReview, '#f59e0b'],
        ].map(([label, val, color]) => val && (
          <div key={label} className="glass" style={{ padding: 18, borderLeft: `3px solid ${color}` }}>
            <p style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{label}</p>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>{val}</p>
          </div>
        ))}

        {/* Job Match */}
        <div className="glass" style={{ padding: 18, borderLeft: '3px solid #06b6d4' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>📊 Job Match</p>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#06b6d4', marginBottom: 4 }}>{match.matchPercentage || 0}%</div>
          <p style={{ fontSize: 12, color: '#64748b' }}>{match.roleCompatibility || ''} compatibility · {match.yearsExperienceDetected || 'Unknown'} exp</p>
        </div>
      </div>

      {/* Standout + Red flags */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {rec.standoutElements?.length > 0 && (
          <div className="glass" style={{ padding: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>⭐ What Stood Out</p>
            {rec.standoutElements.map((s, i) => <p key={i} style={{ fontSize: 13, color: '#94a3b8', padding: '4px 0', display: 'flex', gap: 8 }}><span style={{ color: '#34d399' }}>★</span>{s}</p>)}
          </div>
        )}
        {rec.redFlags?.length > 0 && (
          <div className="glass" style={{ padding: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>🚩 Red Flags</p>
            {rec.redFlags.map((s, i) => <p key={i} style={{ fontSize: 13, color: '#94a3b8', padding: '4px 0', display: 'flex', gap: 8 }}><span style={{ color: '#f87171' }}>!</span>{s}</p>)}
          </div>
        )}
      </div>

      {/* ATS Engine */}
      {ats.keywordsFound?.length > 0 && (
        <div className="glass" style={{ padding: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>🤖 ATS Engine Report</p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            {[['Readability', `${ats.readabilityScore}/100`, '#818cf8'], ['Keyword Density', ats.keywordDensity, '#f59e0b'], ['ATS Verdict', ats.atsPassPrediction, ats.atsPassPrediction?.includes('pass') ? '#34d399' : '#f87171']].map(([l, v, c]) => v && (
              <div key={l} style={{ padding: '8px 16px', borderRadius: 10, background: `${c}12`, border: `1px solid ${c}30`, color: c, fontSize: 13, fontWeight: 700 }}>
                {l}: {v}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 6 }}>✅ Keywords Found</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {ats.keywordsFound.map((k, i) => <span key={i} style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(52,211,153,0.1)', color: '#34d399', fontSize: 11, fontWeight: 600 }}>{k}</span>)}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#f87171', marginBottom: 6 }}>❌ Missing Keywords</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {ats.missingKeywords?.map((k, i) => <span key={i} style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: 11, fontWeight: 600 }}>{k}</span>)}
              </div>
            </div>
          </div>
          {ats.whyScoreChanged && (
            <div style={{ marginTop: 12, padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: '3px solid #6366f1' }}>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>{ats.whyScoreChanged}</p>
            </div>
          )}
        </div>
      )}

      {/* Missing requirements */}
      {match.missingRequirements?.length > 0 && (
        <div className="glass" style={{ padding: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>📋 Missing Job Requirements</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {match.missingRequirements.map((r, i) => <span key={i} style={{ padding: '4px 12px', borderRadius: 999, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 12, fontWeight: 600 }}>{r}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}
