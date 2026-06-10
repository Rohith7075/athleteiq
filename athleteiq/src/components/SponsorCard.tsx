// ─────────────────────────────────────────────
//  AthleteIQ — SponsorCard Component
//  Renders a single sponsor recommendation
// ─────────────────────────────────────────────

'use client';

import { useState } from 'react';
import { SponsorRecommendation } from '../types';
import { scoreToColor, scoreLabel, dealTypeColor } from '../utils/parseResponse';

interface SponsorCardProps {
  rec: SponsorRecommendation;
}

export default function SponsorCard({ rec }: SponsorCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function copyPitch() {
    const text = `${rec.brandName} Sponsorship Pitch\n\n${rec.reasoning}\n\nAudience Fit: ${rec.audienceOverlap}\n\nPitch Angle: ${rec.pitchAngle}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const scoreStyle = scoreToColor(rec.matchScore);
  const dealStyle = dealTypeColor(rec.dealType);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* Rank badge */}
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {rec.rank}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">{rec.brandName}</h3>
            <p className="text-xs text-gray-400">{rec.brandCategory}</p>
          </div>
        </div>

        {/* Match Score */}
        <div className={`flex flex-col items-center px-3 py-1 rounded-lg border ${scoreStyle} flex-shrink-0`}>
          <span className="text-xl font-black leading-none">{rec.matchScore}</span>
          <span className="text-[10px] font-medium leading-tight">{scoreLabel(rec.matchScore)}</span>
        </div>
      </div>

      {/* Deal Type Tag */}
      <div className="mb-3">
        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${dealStyle}`}>
          {rec.dealType.charAt(0).toUpperCase() + rec.dealType.slice(1).replace('-', ' ')}
        </span>
      </div>

      {/* Pitch Angle (always visible) */}
      <div className="bg-blue-50 rounded-lg px-3 py-2 mb-3">
        <p className="text-xs font-semibold text-blue-800 mb-0.5">Pitch Angle</p>
        <p className="text-sm text-blue-900">{rec.pitchAngle}</p>
      </div>

      {/* Expandable Detail */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="text-xs text-blue-600 hover:text-blue-800 font-medium mb-2 flex items-center gap-1"
      >
        {expanded ? '▲ Hide details' : '▼ See reasoning & audience fit'}
      </button>

      {expanded && (
        <div className="space-y-3 pt-1 border-t border-gray-100">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Reasoning</p>
            <p className="text-sm text-gray-700">{rec.reasoning}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Audience Overlap</p>
            <p className="text-sm text-gray-700">{rec.audienceOverlap}</p>
          </div>
        </div>
      )}

      {/* Copy Button */}
      <button
        type="button"
        onClick={copyPitch}
        className={`mt-3 w-full py-2 rounded-lg text-sm font-medium border transition-all ${
          copied
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
        }`}
      >
        {copied ? '✅ Copied to clipboard!' : '📋 Copy pitch text'}
      </button>
    </div>
  );
}
