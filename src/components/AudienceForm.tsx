// ─────────────────────────────────────────────
//  AthleteIQ — AudienceForm Component
//  Step 2: Collect audience demographics
// ─────────────────────────────────────────────

'use client';

import { useState } from 'react';
import { AudienceProfile, InterestTag } from '../types';

interface AudienceFormProps {
  onSubmit: (profile: AudienceProfile) => void;
  onBack: () => void;
  loading?: boolean;
}

const INTEREST_TAGS: { value: InterestTag; label: string; emoji: string }[] = [
  { value: 'fitness', label: 'Fitness', emoji: '💪' },
  { value: 'fashion', label: 'Fashion', emoji: '👗' },
  { value: 'gaming', label: 'Gaming', emoji: '🎮' },
  { value: 'travel', label: 'Travel', emoji: '✈️' },
  { value: 'finance', label: 'Finance', emoji: '💰' },
  { value: 'food', label: 'Food', emoji: '🍕' },
  { value: 'technology', label: 'Technology', emoji: '💻' },
  { value: 'music', label: 'Music', emoji: '🎵' },
  { value: 'lifestyle', label: 'Lifestyle', emoji: '🌿' },
  { value: 'health', label: 'Health', emoji: '❤️' },
  { value: 'education', label: 'Education', emoji: '📚' },
  { value: 'automotive', label: 'Automotive', emoji: '🚗' },
];

const AGE_RANGES = ['13-17', '18-24', '25-34', '35-44', '45+'] as const;

export default function AudienceForm({ onSubmit, onBack, loading }: AudienceFormProps) {
  const [ages, setAges] = useState<Record<string, number>>({
    '13-17': 5, '18-24': 35, '25-34': 35, '35-44': 18, '45+': 7,
  });
  const [male, setMale] = useState(55);
  const [female, setFemale] = useState(40);
  const [other, setOther] = useState(5);
  const [geos, setGeos] = useState(['', '', '']);
  const [interests, setInterests] = useState<InterestTag[]>([]);
  const [engagement, setEngagement] = useState('3.8');

  const ageTotal = Object.values(ages).reduce((a, b) => a + b, 0);
  const genderTotal = male + female + other;

  function toggleInterest(tag: InterestTag) {
    setInterests(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }

  function handleGeoChange(idx: number, value: string) {
    setGeos(prev => { const next = [...prev]; next[idx] = value; return next; });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const profile: AudienceProfile = {
      ageDistribution: {
        '13-17': ages['13-17'],
        '18-24': ages['18-24'],
        '25-34': ages['25-34'],
        '35-44': ages['35-44'],
        '45+': ages['45+'],
      },
      genderSplit: { male, female, other },
      topGeographies: geos.filter(g => g.trim().length > 0),
      interestTags: interests,
      engagementRate: parseFloat(engagement) || 0,
    };

    onSubmit(profile);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Audience Demographics</h2>
        <p className="text-sm text-gray-500">Step 2 of 2 — Describe the athlete's audience</p>
      </div>

      {/* Age Distribution */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Age Distribution</label>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ageTotal === 100 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            Total: {ageTotal}%
          </span>
        </div>
        <div className="space-y-2">
          {AGE_RANGES.map(range => (
            <div key={range} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-10">{range}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={ages[range]}
                onChange={e => setAges(prev => ({ ...prev, [range]: parseInt(e.target.value) }))}
                className="flex-1 accent-blue-600"
              />
              <span className="text-sm font-medium text-gray-700 w-10 text-right">{ages[range]}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gender Split */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Gender Split</label>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${genderTotal === 100 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            Total: {genderTotal}%
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[['Male', male, setMale], ['Female', female, setFemale], ['Other', other, setOther]].map(([label, val, setter]) => (
            <div key={label as string}>
              <label className="text-xs text-gray-500 mb-1 block">{label as string}</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={val as number}
                  onChange={e => (setter as (v: number) => void)(parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <span className="text-xs text-gray-400">%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Geographies */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Top Audience Geographies (up to 3)</label>
        <div className="space-y-2">
          {geos.map((g, i) => (
            <input
              key={i}
              type="text"
              value={g}
              onChange={e => handleGeoChange(i, e.target.value)}
              placeholder={`Geography ${i + 1} — e.g. India`}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ))}
        </div>
      </div>

      {/* Interest Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Audience Interests
          <span className="ml-2 text-xs text-gray-400 font-normal">Select all that apply</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {INTEREST_TAGS.map(tag => (
            <button
              key={tag.value}
              type="button"
              onClick={() => toggleInterest(tag.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                interests.includes(tag.value)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              {tag.emoji} {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Engagement Rate */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Engagement Rate (%)
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={engagement}
          onChange={e => setEngagement(e.target.value)}
          placeholder="e.g. 4.2"
          required
          className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">Average likes + comments ÷ followers × 100</p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border border-gray-300 text-gray-600 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Finding Sponsors…
            </>
          ) : (
            '⚡ Find Sponsor Matches'
          )}
        </button>
      </div>
    </form>
  );
}
