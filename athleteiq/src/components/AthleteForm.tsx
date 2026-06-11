// ─────────────────────────────────────────────
//  AthleteIQ — AthleteForm Component
//  Step 1: Collect athlete profile (i18n enabled)
// ─────────────────────────────────────────────

'use client';

import { useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { AthleteProfile, SportType, CareerStage, SocialPlatform } from '../types';
import { getStatsForSport } from '../utils/promptBuilder';

interface AthleteFormProps {
  onSubmit: (profile: AthleteProfile) => void;
  defaultValues?: AthleteProfile | null;
}

const SPORTS: { value: SportType; label: string }[] = [
  { value: 'football', label: '⚽ Football' },
  { value: 'basketball', label: '🏀 Basketball' },
  { value: 'tennis', label: '🎾 Tennis' },
  { value: 'cricket', label: '🏏 Cricket' },
  { value: 'formula1', label: '🏎️ Formula 1' },
  { value: 'golf', label: '⛳ Golf' },
  { value: 'swimming', label: '🏊 Swimming' },
  { value: 'athletics', label: '🏃 Athletics' },
  { value: 'boxing', label: '🥊 Boxing' },
  { value: 'cycling', label: '🚴 Cycling' },
  { value: 'other', label: '🏅 Other' },
];

const CAREER_STAGES: { value: CareerStage; label: string; desc: string }[] = [
  { value: 'emerging', label: 'Emerging', desc: 'Rising star, building profile' },
  { value: 'established', label: 'Established', desc: 'Recognized competitor, consistent results' },
  { value: 'elite', label: 'Elite', desc: 'Top-tier, global recognition' },
];

const PLATFORMS: { value: SocialPlatform; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'facebook', label: 'Facebook' },
];

export default function AthleteForm({ onSubmit, defaultValues }: AthleteFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [sport, setSport] = useState<SportType>(defaultValues?.sport ?? 'football');
  const [careerStage, setCareerStage] = useState<CareerStage>(defaultValues?.careerStage ?? 'established');
  const [geoBase, setGeoBase] = useState(defaultValues?.geographicBase ?? '');
  const [platform, setPlatform] = useState<SocialPlatform>(defaultValues?.primaryPlatform ?? 'instagram');
  const [followers, setFollowers] = useState(defaultValues?.followerCount?.toString() ?? '');
  const [stats, setStats] = useState<Record<string, string>>(() => {
    if (defaultValues?.stats) {
      return Object.fromEntries(
        Object.entries(defaultValues.stats).map(([k, v]) => [k, String(v)])
      );
    }
    return {};
  });

  const statLabels = getStatsForSport(sport);

  function handleStatChange(label: string, value: string) {
    setStats(prev => ({ ...prev, [label]: value }));
  }

  function handleSportChange(newSport: SportType) {
    setSport(newSport);
    setStats({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const profile: AthleteProfile = {
      name: name.trim(),
      sport,
      careerStage,
      geographicBase: geoBase.trim(),
      primaryPlatform: platform,
      followerCount: parseInt(followers.replace(/[^0-9]/g, ''), 10) || 0,
      stats: Object.fromEntries(
        Object.entries(stats).filter(([, v]) => v.trim().length > 0)
      ),
    };

    try {
      localStorage.setItem('athleteiq_last_profile', JSON.stringify(profile));
    } catch {}

    onSubmit(profile);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">{t('form.athleteTitle')}</h2>
        <p className="text-sm text-gray-500">{t('form.athleteSubtitle')}</p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.nameLabel')}</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t('form.namePlaceholder')}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Sport */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.sportLabel')}</label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {SPORTS.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => handleSportChange(s.value)}
              className={`text-xs px-2 py-2 rounded-lg border transition-all ${
                sport === s.value
                  ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Stats */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.statsLabel')}</label>
        <div className="grid grid-cols-2 gap-3">
          {statLabels.map(label => (
            <div key={label}>
              <label className="block text-xs text-gray-500 mb-1">{label}</label>
              <input
                type="text"
                value={stats[label] ?? ''}
                onChange={e => handleStatChange(label, e.target.value)}
                placeholder="—"
                className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Career Stage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.careerStageLabel')}</label>
        <div className="grid grid-cols-3 gap-2">
          {CAREER_STAGES.map(cs => (
            <button
              key={cs.value}
              type="button"
              onClick={() => setCareerStage(cs.value)}
              className={`text-left p-3 rounded-lg border transition-all ${
                careerStage === cs.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="text-sm font-semibold">{cs.label}</div>
              <div className={`text-xs mt-0.5 ${careerStage === cs.value ? 'text-blue-100' : 'text-gray-400'}`}>
                {cs.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Social + Followers */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.platformLabel')}</label>
          <select
            value={platform}
            onChange={e => setPlatform(e.target.value as SocialPlatform)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PLATFORMS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.followersLabel')}</label>
          <input
            type="text"
            value={followers}
            onChange={e => setFollowers(e.target.value)}
            placeholder={t('form.followersPlaceholder')}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Geography */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.geoLabel')}</label>
        <input
          type="text"
          value={geoBase}
          onChange={e => setGeoBase(e.target.value)}
          placeholder={t('form.geoPlaceholder')}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
      >
        {t('form.nextBtn')}
      </button>
    </form>
  );
}