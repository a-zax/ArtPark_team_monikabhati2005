"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = [
  "Initializing neural engines...",
  "Calibrating skill gap analysis...",
  "Syncing corporate catalog...",
  "Mounting 3D environments...",
  "Engine Ready.",
];

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const safety = setTimeout(() => {
      setDone(true);
    }, 10000);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          clearTimeout(safety);
          setTimeout(() => setDone(true), 800);
          return 100;
        }

        const next = prev + Math.max(1, Math.floor((101 - prev) / 6));
        const limitedNext = Math.min(100, next);
        setStage(Math.min(STAGES.length - 1, Math.floor(limitedNext / 21)));
        return limitedNext;
      });
    }, 80);

    return () => {
      clearInterval(interval);
      clearTimeout(safety);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {!done && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ 
            clipPath: "inset(0 0 100% 0)", 
            opacity: 0,
            transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 z-[999] bg-[#020617] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Top & Bottom cinematic bars */}
          <div className="absolute top-0 left-0 right-0 h-[8px] bg-primary/20" />
          <div className="absolute bottom-0 left-0 right-0 h-[8px] bg-primary/20" />

          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 blur-[160px] rounded-full -translate-y-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm px-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <p className="text-[10px] tracking-[0.4em] text-primary/60 uppercase font-mono mb-2">ArtPark CodeForge 2026</p>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                CogniSync <span className="text-primary">AI</span>
              </h1>
            </motion.div>

            {/* Giant counter */}
            <div className="tabular-nums font-black text-[110px] leading-none text-white tracking-tighter select-none" style={{ textShadow: "0 0 50px rgba(59,130,246,0.3)" }}>
              {progress}
              <span className="text-3xl font-bold text-primary ml-1">%</span>
            </div>

            <div className="w-full h-[2px] bg-slate-800/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 15 }}
                style={{ boxShadow: "0 0 15px rgba(59,130,246,0.6)" }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={stage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-xs text-slate-500 font-mono tracking-[0.2em] uppercase"
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
