import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import dynamic from 'next/dynamic';

const HeroConstellation = dynamic(() => import('@/components/ui/HeroConstellation'), { ssr: false });

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'SyncPath AI | Adaptive Onboarding Engine',
  description: 'AI-driven, adaptive learning engine for hyper-personalized onboarding pathways.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} font-sans antialiased text-foreground min-h-screen flex flex-col overflow-x-hidden relative`}>
        {/* Deep, glowing background radial gradient */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-background to-background -z-20 pointer-events-none" />
        
        {/* Global 3D Interactive Layer */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <HeroConstellation />
        </div>
        
        <Header />
        
        <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
