"use client";

import { useEffect, useState } from "react";

const STAGES = [
  "Parsing skill matrices...",
  "Mounting WebGL environments...",
  "Loading course catalog...",
  "Calibrating AI engine...",
  "Ready.",
];

const MIN_VISIBLE_MS = 2800;
const FAILSAFE_HIDE_MS = 6500;

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let current = 0;

    const interval = window.setInterval(() => {
      current = Math.min(current + 2, 100);
      setProgress(current);
      setStage(Math.min(STAGES.length - 1, Math.floor(current / 20)));

      if (current >= 100) {
        window.clearInterval(interval);
      }
    }, 45);

    const closeTimer = window.setTimeout(() => {
      setProgress(100);
      setStage(STAGES.length - 1);
      setIsClosing(true);
      window.setTimeout(() => setIsHidden(true), 650);
    }, MIN_VISIBLE_MS);

    const failsafeTimer = window.setTimeout(() => {
      setIsHidden(true);
    }, FAILSAFE_HIDE_MS);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(closeTimer);
      window.clearTimeout(failsafeTimer);
    };
  }, []);

  if (isHidden) {
    return null;
  }

  return (
    <div
      className={`preloader-shell fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ${
        isClosing ? "opacity-0 pointer-events-none scale-[1.02]" : "opacity-100"
      }`}
    >
      <div className="absolute top-0 left-0 right-0 h-[10px] bg-primary/30" />
      <div className="absolute bottom-0 left-0 right-0 h-[10px] bg-primary/30" />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/15 blur-[160px] rounded-full -translate-y-1/2 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm px-8">
        <div className="text-center">
          <p className="text-xs tracking-[0.5em] text-primary/70 uppercase font-mono mb-2">ArtPark CodeForge 2026</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            CogniSync <span className="text-primary">AI</span>
          </h1>
        </div>

        <div
          className="tabular-nums font-black text-[96px] leading-none text-white tracking-tighter select-none"
          style={{ textShadow: "0 0 60px rgba(59,130,246,0.4)" }}
        >
          {progress}
          <span className="text-3xl font-bold text-primary">%</span>
        </div>

        <div className="w-full h-[3px] bg-slate-800 rounded-full overflow-hidden">
          <div className="preloader-bar h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
        </div>

        <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">{STAGES[stage]}</p>
      </div>
    </div>
  );
}
