'use client';

import { ReactNode } from 'react';
import { TranslationProvider } from '../i18n/useTranslation';

export default function Providers({ children }: { children: ReactNode }) {
  return <TranslationProvider>{children}</TranslationProvider>;
}