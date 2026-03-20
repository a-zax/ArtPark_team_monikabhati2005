import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import localFont from 'next/font/local';

import Header from '@/components/layout/Header';
import Preloader from '@/components/ui/Preloader';

import './globals.css';

const HeroConstellation = dynamic(() => import('@/components/ui/HeroConstellation'), { ssr: false });

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'CogniSync AI | Adaptive Onboarding Engine',
  description:
    'Adaptive onboarding engine that parses resumes and role requirements, then maps grounded training plans.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen overflow-x-hidden bg-background font-sans text-foreground antialiased`}
      >
        <Preloader />
        <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_38%),radial-gradient(circle_at_80%_18%,_rgba(245,158,11,0.11),_transparent_30%),linear-gradient(180deg,_#07111f_0%,_#04070d_58%,_#02040a_100%)]" />
        <div className="pointer-events-none fixed inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:96px_96px]" />
        <div className="pointer-events-none fixed inset-0 z-0">
          <HeroConstellation />
        </div>
        <Header />
        <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-1 flex-col px-4 pb-16 pt-28 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
