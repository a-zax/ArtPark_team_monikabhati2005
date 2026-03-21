'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const STAGES = [
  'Loading workspace...',
  'Reading skill data...',
  'Preparing the course catalog...',
  'Starting the visual layer...',
  'Ready.',
];

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [done, setDone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const safetyTimer = window.setTimeout(() => {
      setDone(true);
    }, 10_000);

    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          window.clearInterval(interval);
          window.clearTimeout(safetyTimer);
          window.setTimeout(() => setDone(true), 800);
          return 100;
        }

        const next = current + Math.max(1, Math.floor((101 - current) / 6));
        const clamped = Math.min(100, next);

        setStage(Math.min(STAGES.length - 1, Math.floor(clamped / 21)));
        return clamped;
      });
    }, 80);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(safetyTimer);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {!done && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{
            clipPath: 'inset(0 0 100% 0)',
            opacity: 0,
            transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden bg-[#020617]"
        >
          <div className="absolute left-0 right-0 top-0 h-[8px] bg-primary/20" />
          <div className="absolute bottom-0 left-0 right-0 h-[8px] bg-primary/20" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[160px]" />

          <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8 px-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.4em] text-primary/60">
                ArtPark CodeForge 2026
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                CogniSync <span className="text-primary">AI</span>
              </h1>
            </motion.div>

            <div
              className="select-none text-[110px] font-black leading-none tracking-tighter text-white"
              style={{ textShadow: '0 0 50px rgba(59,130,246,0.3)' }}
            >
              {progress}
              <span className="ml-1 text-3xl font-bold text-primary">%</span>
            </div>

            <div className="h-[2px] w-full overflow-hidden rounded-full bg-slate-800/50">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                style={{ boxShadow: '0 0 15px rgba(59,130,246,0.6)' }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={stage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500"
              >
                {STAGES[stage]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
