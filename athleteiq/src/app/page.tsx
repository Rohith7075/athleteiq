// ─────────────────────────────────────────────
//  AthleteIQ — Main Page (App Entry Point)
//  With i18n + multi-AI provider support
// ─────────────────────────────────────────────

'use client';

import { useState, useEffect } from 'react';
import AthleteForm from '../components/AthleteForm';
import AudienceForm from '../components/AudienceForm';
import ResultsPanel, { ResultsSkeleton } from '../components/ResultsPanel';
import SettingsModal, { getAiConfig, AiConfig } from '../components/SettingsModal';
import { useTranslation } from '../i18n/useTranslation';
import { AthleteProfile, AudienceProfile, SponsorRecommendation, AppStep } from '../types';

const LOCALE_LABELS: Record<string, string> = {
  en: 'EN',
  hi: 'हि',
  te: 'తె',
};

export default function Home() {
  const { t, locale, setLocale } = useTranslation();
  const [step, setStep] = useState<AppStep>('athlete');
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);
  const [results, setResults] = useState<SponsorRecommendation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedProfile, setSavedProfile] = useState<AthleteProfile | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Load saved profile from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('athleteiq_last_profile');
      if (saved) setSavedProfile(JSON.parse(saved));
    } catch {}
  }, []);

  async function handleAudienceSubmit(audience: AudienceProfile) {
    if (!athlete) return;
    setLoading(true);
    setError(null);

    try {
      // Get AI config from localStorage (BYOK + provider selection)
      const aiConfig = getAiConfig();

      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ athlete, audience, aiConfig }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? t('errors.generic'));
      }

      setResults(data.recommendations);
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'));
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep('athlete');
    setAthlete(null);
    setResults(null);
    setError(null);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="font-black text-blue-700 text-lg tracking-tight">{t('app.header')}</span>
          <span className="hidden sm:inline text-xs text-gray-400 ml-1">{t('app.tagline')}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Language quick-switch */}
          <select
            value={locale}
            onChange={e => setLocale(e.target.value as any)}
            className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="te">తెలుగు</option>
          </select>

          {/* Settings */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="text-xs text-gray-400 hover:text-blue-600 underline"
            title={t('settings.title')}
          >
            ⚙️ {t('nav.settings')}
          </button>

          {step !== 'athlete' && (
            <button onClick={reset} className="text-xs text-gray-400 hover:text-blue-600 underline">
              {t('nav.startOver')}
            </button>
          )}
        </div>
      </nav>

      {/* Step Progress */}
      {step !== 'results' && (
        <div className="max-w-xl mx-auto px-4 pt-5">
          <div className="flex items-center gap-2 mb-6">
            {(['athlete', 'audience'] as AppStep[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${step === s ? 'bg-blue-600 text-white' : i < ['athlete','audience','results'].indexOf(step) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {i + 1}
                </div>
                <span className={`text-xs font-medium ${step === s ? 'text-blue-700' : 'text-gray-400'}`}>
                  {s === 'athlete' ? t('steps.athlete') : t('steps.audience')}
                </span>
                {i < 1 && <div className="flex-1 h-px bg-gray-200" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="max-w-xl mx-auto px-4 pb-16">
        <div className={step === 'results' ? '' : 'bg-white rounded-2xl shadow-sm border border-gray-100 p-6'}>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              ⚠️ {error}
            </div>
          )}

          {step === 'athlete' && (
            <AthleteForm
              onSubmit={(profile) => { setAthlete(profile); setStep('audience'); }}
              defaultValues={savedProfile}
            />
          )}

          {step === 'audience' && (
            <AudienceForm
              onSubmit={handleAudienceSubmit}
              onBack={() => setStep('athlete')}
              loading={loading}
            />
          )}

          {step === 'results' && loading && <ResultsSkeleton />}

          {step === 'results' && results && athlete && (
            <ResultsPanel results={results} athlete={athlete} onReset={reset} />
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </main>
  );
}
