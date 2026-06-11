'use client';

import { useState, useEffect } from 'react';
import { useTranslation, Locale } from '../i18n/useTranslation';

export type AiProvider = 'gemini' | 'ollama';

const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  hi: 'हिन्दी (Hindi)',
  te: 'తెలుగు (Telugu)',
};

const AI_STORAGE_KEY = 'athleteiq_ai_config';

export interface AiConfig {
  provider: AiProvider;
  geminiApiKey: string;
  ollamaUrl: string;
  ollamaModel: string;
}

const DEFAULT_CONFIG: AiConfig = {
  provider: 'gemini',
  geminiApiKey: '',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3.2',
};

export function getAiConfig(): AiConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const saved = localStorage.getItem(AI_STORAGE_KEY);
    if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_CONFIG;
}

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { locale, setLocale, t } = useTranslation();
  const [aiConfig, setAiConfig] = useState<AiConfig>(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setAiConfig(getAiConfig());
      setSaved(false);
    }
  }, [open]);

  function handleSave() {
    localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(aiConfig));
    setSaved(true);
    setTimeout(() => onClose(), 800);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800">{t('settings.title')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        {/* Language Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">{t('settings.language')}</label>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(LOCALE_NAMES) as [Locale, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setLocale(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  locale === key
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-gray-100 mb-6" />

        {/* AI Provider Selection */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t('settings.aiProvider')}</label>
          <p className="text-xs text-gray-400 mb-2">{t('settings.aiProviderHint')}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setAiConfig(prev => ({ ...prev, provider: 'gemini' }))}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                aiConfig.provider === 'gemini'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              {t('settings.gemini')}
            </button>
            <button
              onClick={() => setAiConfig(prev => ({ ...prev, provider: 'ollama' }))}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                aiConfig.provider === 'ollama'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              {t('settings.ollama')}
            </button>
          </div>
        </div>

        {/* Gemini API Key (BYOK) */}
        {aiConfig.provider === 'gemini' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.apiKeyLabel')}</label>
            <p className="text-xs text-gray-400 mb-1">{t('settings.apiKeyHint')}</p>
            <input
              type="password"
              value={aiConfig.geminiApiKey}
              onChange={e => setAiConfig(prev => ({ ...prev, geminiApiKey: e.target.value }))}
              placeholder="AIzaSy..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Ollama Settings */}
        {aiConfig.provider === 'ollama' && (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.ollamaUrl')}</label>
              <input
                type="text"
                value={aiConfig.ollamaUrl}
                onChange={e => setAiConfig(prev => ({ ...prev, ollamaUrl: e.target.value }))}
                placeholder={t('settings.ollamaUrlPlaceholder')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.ollamaModel')}</label>
              <input
                type="text"
                value={aiConfig.ollamaModel}
                onChange={e => setAiConfig(prev => ({ ...prev, ollamaModel: e.target.value }))}
                placeholder={t('settings.ollamaModelPlaceholder')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {saved ? '✅ Saved!' : t('settings.save')}
        </button>
      </div>
    </div>
  );
}