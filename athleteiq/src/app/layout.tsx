import type { Metadata } from 'next';
import './globals.css';
import Providers from '../components/Providers';

export const metadata: Metadata = {
  title: 'AthleteIQ — Sponsor Match Engine',
  description: 'AI-powered sponsor matching for sports marketing agencies.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
