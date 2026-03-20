"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { FileText, ArrowRight, BrainCircuit, CheckCircle2, AlertCircle, Clock, TrendingDown, Users, Target } from "lucide-react";

const STEPS = [
  { id: 0, label: "Step 1 — Upload Documents" },
  { id: 1, label: "Step 2 — AI Analysis Running" },
  { id: 2, label: "Step 3 — Roadmap Generated" },
  { id: 3, label: "Step 4 — ROI & Mentors Assigned" },
];

const DURATION = 3500; // ms per step

export default function DemoAnimation() {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // Advance steps on a timer
  useEffect(() => {
    const ticker = setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length);
      setProgress(0);
    }, DURATION);
    return () => clearInterval(ticker);
  }, []);

  // Progress bar within each step
  useEffect(() => {
    setProgress(0);
    const bar = setInterval(() => {
      setProgress((p) => Math.min(100, p + 1));
    }, DURATION / 100);
    return () => clearInterval(bar);
  }, [step]);

  return (
    <section id="demo" className="w-full py-24 scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <p className="text-xs tracking-[0.4em] text-primary/70 uppercase font-mono mb-3">Live Product Preview</p>
        <h2 className="text-3xl md:text-5xl font-bold mb-4">
          See SyncPath <span className="text-gradient">In Action</span>
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          Watch the full adaptive onboarding pipeline run automatically below.
        </p>
      </motion.div>

      {/* Browser chrome wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="max-w-4xl mx-auto glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.15)]"
      >
        {/* Browser top bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/80 border-b border-white/5">
          <span className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <span className="w-3 h-3 rounded-full bg-green-500/70" />
          <div className="flex-1 mx-4 h-6 rounded-md bg-slate-800 flex items-center px-3 gap-2">
            <div className="w-3 h-3 rounded-full border border-slate-600" />
            <span className="text-xs text-slate-500 font-mono">localhost:3000/upload</span>
          </div>
          {/* Step indicator pills */}
          <div className="hidden sm:flex gap-1">
            {STEPS.map((s) => (
              <div key={s.id} className={`h-1.5 rounded-full transition-all duration-500 ${step === s.id ? "w-6 bg-primary" : "w-1.5 bg-slate-700"}`} />
            ))}
          </div>
        </div>

        {/* Step progress bar */}
        <div className="h-0.5 bg-slate-800">
          <motion.div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>

        {/* Screen content */}
        <div className="relative bg-[#020617] min-h-[420px] flex items-center justify-center p-8 overflow-hidden">
          {/* Screen label */}
          <div className="absolute top-4 left-4 text-xs font-mono text-slate-600 tracking-wider">{STEPS[step].label}</div>

          <AnimatePresence mode="wait">

            {/* STEP 0: Upload */}
            {step === 0 && (
              <motion.div key="upload" {...slide} className="w-full max-w-xl flex flex-col gap-6">
                <p className="text-center text-2xl font-extrabold">Initialize <span className="text-gradient">Analysis</span></p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel rounded-xl p-5 flex flex-col items-center gap-3 border border-primary/20">
                    <FileText className="w-8 h-8 text-primary" />
                    <p className="text-sm font-semibold text-slate-300">resume_john.pdf</p>
                    <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-xs text-green-400 font-bold">Uploaded</motion.div>
                  </div>
                  <div className="glass-panel rounded-xl p-5 flex flex-col items-center gap-3 border border-accent/20">
                    <FileText className="w-8 h-8 text-accent" />
                    <p className="text-sm font-semibold text-slate-300">job_description.txt</p>
                    <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} className="text-xs text-green-400 font-bold">Uploaded</motion.div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold text-sm">
                    Formulate Pathway <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 1: AI Running */}
            {step === 1 && (
              <motion.div key="analyzing" {...slide} className="flex flex-col items-center gap-6 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 rounded-full border-4 border-primary/30 border-t-primary"
                />
                <BrainCircuit className="w-10 h-10 text-primary absolute" />
                <p className="text-xl font-bold">AI Engine Processing...</p>
                <div className="space-y-2 text-left w-full max-w-xs">
                  {["Extracting NLP entities","Mapping skill graph","Calculating gap delta","Building DAG pathway"].map((t, i) => (
                    <motion.div key={t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.4 }} className="flex items-center gap-2 text-sm text-slate-400">
                      <motion.div animate={{ scale: [0.8, 1.2, 1] }} transition={{ delay: i * 0.4 + 0.3, duration: 0.4 }} className="w-3 h-3 rounded-full bg-primary/70" />
                      {t}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Roadmap */}
            {step === 2 && (
              <motion.div key="roadmap" {...slide} className="w-full max-w-xl space-y-3">
                <p className="text-center text-xl font-extrabold mb-4">Your Dynamic <span className="text-gradient">Pathway</span></p>
                <div className="flex gap-3 mb-2">
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> React, Git, CSS</span>
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Next.js, Docker</span>
                </div>
                {[
                  { n: 1, title: "Next.js Fundamentals", h: 4 },
                  { n: 2, title: "Docker & CI/CD Deployment", h: 6 },
                  { n: 3, title: "ML Foundations Crash Course", h: 8 },
                ].map((m, i) => (
                  <motion.div key={m.n} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }} className="flex items-center gap-3 glass-panel rounded-xl p-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">{m.n}</div>
                    <p className="flex-1 text-sm font-semibold">{m.title}</p>
                    <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20"><Clock className="w-3 h-3" />{m.h}h</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* STEP 3: ROI Dashboard */}
            {step === 3 && (
              <motion.div key="roi" {...slide} className="w-full max-w-xl grid grid-cols-3 gap-4">
                {[
                  { icon: TrendingDown, color: "text-green-400", border: "border-l-green-400", title: "Hours Saved", value: "45 hrs", sub: "$3,825 budget saved" },
                  { icon: Users, color: "text-primary", border: "border-l-primary", title: "Mentor Matched", value: "Dr. E. Rostova", sub: "Next.js SME" },
                  { icon: Target, color: "text-accent", border: "border-l-accent", title: "Day-1 Sandbox", value: "Live Project", sub: "Next.js micro-deploy" },
                ].map((c, i) => (
                  <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }} className={`glass-panel rounded-xl p-4 border-l-4 ${c.border}`}>
                    <c.icon className={`w-6 h-6 ${c.color} mb-2`} />
                    <p className="text-xs text-slate-400 mb-1">{c.title}</p>
                    <p className="font-extrabold text-sm text-white leading-tight">{c.value}</p>
                    <p className={`text-xs mt-1 ${c.color}`}>{c.sub}</p>
                  </motion.div>
                ))}
                <div className="col-span-3 flex justify-center mt-2">
                  <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    Role Competency Achieved — Integration Complete
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}

const slide = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.4 },
};
