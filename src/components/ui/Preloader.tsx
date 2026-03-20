"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cinematic countdown effect mirroring heavy asset loading
    const duration = 2800; // 2.8 seconds total loading time
    const intervalTime = 30; // update every 30ms
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsLoading(false), 400); // Hold at 100% for brief moment
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[999] bg-[#020617] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Cinematic lighting effect */}
          <div className="absolute top-0 w-[800px] h-[500px] bg-primary/20 blur-[130px] rounded-full -translate-y-1/2" />
          
          <div className="relative z-10 text-center flex flex-col items-center">
             <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="mb-8"
             >
                <div className="text-sm font-bold tracking-[0.4em] text-primary/80 uppercase mb-6 flex items-center justify-center gap-3">
                   <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                   Initializing SyncPath AI Core
                   <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
                <div className="h-[2px] w-64 md:w-80 bg-slate-800 rounded-full overflow-hidden relative mx-auto">
                   <motion.div 
                     className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                     style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                   />
                </div>
             </motion.div>
             
             <div className="tabular-nums font-mono text-7xl md:text-9xl font-black text-white mix-blend-overlay opacity-90 tracking-tighter">
                {Math.floor(progress)}
                <span className="text-4xl text-primary/50">%</span>
             </div>
          </div>
          
          <div className="absolute bottom-12 text-slate-500 text-sm font-mono tracking-widest uppercase animate-pulse">
             Mounting WebGL Environments...
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
