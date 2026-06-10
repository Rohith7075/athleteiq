import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AthleteIQ — Sponsor Match Engine',
  description: 'AI-powered sponsor matching for sports marketing agencies.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
