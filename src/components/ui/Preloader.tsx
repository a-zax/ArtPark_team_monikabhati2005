"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = [
  "Parsing skill matrices...",
  "Mounting WebGL environments...",
  "Loading course catalog...",
  "Calibrating AI engine...",
  "Ready.",
];

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setProgress(current);
      // cycle through stage labels
      setStage(Math.min(STAGES.length - 1, Math.floor(current / 20)));
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => setDone(true), 500);
      }
    }, 25); // 25ms × 100 steps = 2.5s total

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {!done && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ clipPath: "inset(0 0 100% 0)", opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[999] bg-[#020617] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Top & Bottom cinematic bars */}
          <div className="absolute top-0 left-0 right-0 h-[10px] bg-primary/30" />
          <div className="absolute bottom-0 left-0 right-0 h-[10px] bg-primary/30" />

          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/15 blur-[160px] rounded-full -translate-y-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm px-8">

            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <p className="text-xs tracking-[0.5em] text-primary/70 uppercase font-mono mb-2">ArtPark CodeForge 2026</p>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">SyncPath <span className="text-primary">AI</span></h1>
            </motion.div>

            {/* Giant counter */}
            <div className="tabular-nums font-black text-[96px] leading-none text-white tracking-tighter select-none" style={{ textShadow: "0 0 60px rgba(59,130,246,0.4)" }}>
              {progress}
              <span className="text-3xl font-bold text-primary">%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-[3px] bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                style={{ width: `${progress}%`, boxShadow: "0 0 12px rgba(59,130,246,0.8)" }}
              />
            </div>

            {/* Stage label */}
            <AnimatePresence mode="wait">
              <motion.p
                key={stage}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="text-xs text-slate-500 font-mono tracking-widest uppercase"
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
