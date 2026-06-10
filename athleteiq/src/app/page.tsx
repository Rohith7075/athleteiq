// ─────────────────────────────────────────────
//  AthleteIQ — Main Page (App Entry Point)
// ─────────────────────────────────────────────

'use client';

import { useState, useEffect } from 'react';
import AthleteForm from '../components/AthleteForm';
import AudienceForm from '../components/AudienceForm';
import ResultsPanel, { ResultsSkeleton } from '../components/ResultsPanel';
import { AthleteProfile, AudienceProfile, SponsorRecommendation, AppStep } from '../types';

export default function Home() {
  const [step, setStep] = useState<AppStep>('athlete');
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);
  const [results, setResults] = useState<SponsorRecommendation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedProfile, setSavedProfile] = useState<AthleteProfile | null>(null);

  // Load saved profile from localStorage (client-side only to avoid hydration error)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('athleteiq_last_profile');
      if (saved) setSavedProfile(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  async function handleAudienceSubmit(audience: AudienceProfile) {
    if (!athlete) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ athlete, audience }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Something went wrong. Please try again.');
      }

      setResults(data.recommendations);
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error. Please try again.');
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
          <span className="font-black text-blue-700 text-lg tracking-tight">AthleteIQ</span>
          <span className="hidden sm:inline text-xs text-gray-400 ml-1">Sponsor Match Engine</span>
        </div>
        {step !== 'athlete' && (
          <button onClick={reset} className="text-xs text-gray-400 hover:text-blue-600 underline">
            Start over
          </button>
        )}
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
                  {s === 'athlete' ? 'Athlete Profile' : 'Audience Demographics'}
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
    </main>
  );
}
