// ─────────────────────────────────────────────
//  AthleteIQ — ResultsPanel Component
//  Shows the ranked list of sponsor recommendations (i18n enabled)
// ─────────────────────────────────────────────

'use client';

import { useTranslation } from '../i18n/useTranslation';
import { SponsorRecommendation, AthleteProfile } from '../types';
import SponsorCard from './SponsorCard';
import ExportButton from './ExportButton';

interface ResultsPanelProps {
  results: SponsorRecommendation[];
  athlete: AthleteProfile;
  onReset: () => void;
}

export default function ResultsPanel({ results, athlete, onReset }: ResultsPanelProps) {
  const { t } = useTranslation();
  const topScore = results[0]?.matchScore ?? 0;
  const avgScore = Math.round(results.reduce((s, r) => s + r.matchScore, 0) / results.length);

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">
              ⚡ {results.length} {t('results.matchesFound')}
            </h2>
            <p className="text-blue-100 text-sm">
              {t('results.for')} <span className="font-semibold text-white">{athlete.name}</span> •{' '}
              {athlete.sport.charAt(0).toUpperCase() + athlete.sport.slice(1)} •{' '}
              {athlete.careerStage.charAt(0).toUpperCase() + athlete.careerStage.slice(1)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black">{topScore}</div>
            <div className="text-xs text-blue-200">{t('results.topScore')}</div>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <div className="bg-white/10 rounded-lg px-3 py-2 text-center">
            <div className="text-lg font-bold">{avgScore}</div>
            <div className="text-xs text-blue-200">{t('results.avgScore')}</div>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-2 text-center">
            <div className="text-lg font-bold">{results.filter(r => r.matchScore >= 80).length}</div>
            <div className="text-xs text-blue-200">{t('results.excellentFits')}</div>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-2 text-center">
            <div className="text-lg font-bold">
              {[...new Set(results.map(r => r.dealType))].length}
            </div>
            <div className="text-xs text-blue-200">{t('results.dealTypes')}</div>
          </div>
        </div>
      </div>

      {/* Export */}
      <ExportButton results={results} athlete={athlete} />

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {results.map(rec => (
          <SponsorCard key={rec.rank} rec={rec} />
        ))}
      </div>

      {/* Start Over */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-gray-500 hover:text-blue-600 underline underline-offset-2"
        >
          {t('results.newMatch')}
        </button>
      </div>
    </div>
  );
}

// ── Loading Skeleton ─────────────────────────────
export function ResultsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
      <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-44 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}