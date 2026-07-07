import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/i18n/I18nProvider';

export const metadata: Metadata = {
  title: 'Uzhavar Vazhi — உழவர் வழி',
  description:
    'Tamil Nadu Farmer Financial Readiness App — Loan and insurance eligibility for all 38 districts',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ta">
      <body className="min-h-screen flex flex-col bg-cream">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
