'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import translations from './translations.json';

export type Locale = 'en' | 'hi' | 'te';

const LOCALE_STORAGE_KEY = 'athleteiq_locale';

// Deep nested key access: "form.nameLabel" -> translations.en.form.nameLabel
function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

interface TranslationContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string) => string;
  dir: 'ltr' | 'rtl';
}

const TranslationContext = createContext<TranslationContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (path: string) => path,
  dir: 'ltr',
});

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (saved && (saved === 'en' || saved === 'hi' || saved === 'te')) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (mounted) {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    }
  }, [mounted]);

  const t = useCallback((path: string): string => {
    const localeData = (translations as any)[locale];
    if (!localeData) return path;
    return getNestedValue(localeData, path);
  }, [locale]);

  const dir: 'ltr' | 'rtl' = 'ltr';

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t, dir }}>
      <div dir={dir}>
        {children}
      </div>
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}