"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FileText, ArrowRight, BrainCircuit,
  CheckCircle2, AlertCircle, Clock,
  TrendingDown, Users, Target, Loader2
} from "lucide-react";

const STEPS = [
  { id: 0, label: "Upload Documents" },
  { id: 1, label: "AI Analysing" },
  { id: 2, label: "Roadmap Ready" },
  { id: 3, label: "ROI & Mentors" },
];

const STEP_DURATION = 3800;

export default function DemoAnimation() {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const fill = setInterval(() => setProgress((p) => (p >= 100 ? 100 : p + 1)), STEP_DURATION / 100);
    const next = setTimeout(() => {
      setStep((s) => (s + 1) % STEPS.length);
    }, STEP_DURATION);
    return () => { clearInterval(fill); clearTimeout(next); };
  }, [step]);

  return (
    <section id="demo" className="w-full py-24 scroll-mt-24">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <p className="text-xs tracking-[0.4em] text-primary/70 uppercase font-mono mb-3">Live Product Preview</p>
        <h2 className="text-3xl md:text-5xl font-bold mb-4">
          See SyncPath <span className="text-gradient">In Action</span>
        </h2>
        <p className="text-slate-400 max-w-lg mx-auto text-base">
          Watch the full adaptive onboarding pipeline run automatically below.
        </p>
      </motion.div>

      {/* Step nav pills */}
      <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(i)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-300 ${
              step === i
                ? "bg-primary text-white border-primary shadow-[0_0_14px_rgba(59,130,246,0.5)]"
                : "text-slate-400 border-slate-700 hover:border-primary/50 hover:text-slate-200"
            }`}
          >
            <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${step === i ? "bg-white/20" : "bg-slate-800"}`}>{i + 1}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Browser frame */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
        className="max-w-4xl mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.12)] bg-[#0a0f1e]"
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-3 px-5 py-3 bg-slate-900 border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 mx-3 flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5 h-8">
            <div className="w-3 h-3 rounded-full border border-slate-600 flex-shrink-0" />
            <span className="text-xs text-slate-500 font-mono truncate">localhost:3000 — SyncPath AI</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`rounded-full transition-all duration-500 ${step === s.id ? "w-6 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-slate-700"}`}
              />
            ))}
          </div>
        </div>

        {/* Loading bar */}
        <div className="h-0.5 bg-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
          />
        </div>

        {/* Screen body */}
        <div className="relative bg-[#020617] min-h-[460px] flex items-center justify-center p-8 md:p-12 overflow-hidden">
          {/* Subtle glows */}
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent/5 blur-[80px] rounded-full pointer-events-none" />

          <AnimatePresence mode="wait">

            {/* ── STEP 0: Upload ── */}
            {step === 0 && (
              <motion.div key="upload" {...slide} className="w-full max-w-2xl flex flex-col gap-8">
                <div className="text-center">
                  <h3 className="text-2xl md:text-3xl font-extrabold mb-2">Initialize <span className="text-gradient">Analysis</span></h3>
                  <p className="text-slate-400 text-sm">Provide your documents to begin the adaptive process.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Resume card */}
                  <div className="glass-panel rounded-2xl p-6 flex flex-col items-center gap-4 border border-primary/20 hover:border-primary/40 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-white text-sm mb-1">resume_john_doe.pdf</p>
                      <p className="text-xs text-slate-500">248 KB • PDF Document</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                    </span>
                  </div>
                  {/* JD card */}
                  <div className="glass-panel rounded-2xl p-6 flex flex-col items-center gap-4 border border-accent/20 hover:border-accent/40 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                      <FileText className="w-6 h-6 text-accent" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-white text-sm mb-1">senior_engineer_jd.txt</p>
                      <p className="text-xs text-slate-500">Job Description • Pasted</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                    </span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-3.5 rounded-full font-extrabold text-sm shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    Formulate Pathway <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 1: AI Running ── */}
            {step === 1 && (
              <motion.div key="analyzing" {...slide} className="w-full max-w-md flex flex-col items-center gap-8 text-center">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-primary"
                  />
                  <BrainCircuit className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold mb-2">AI Engine Processing</h3>
                  <p className="text-slate-400 text-sm">Extracting and evaluating candidate proficiencies...</p>
                </div>
                <div className="w-full space-y-3 text-left">
                  {[
                    { label: "Extracting NLP entities from resume", done: true },
                    { label: "Mapping required JD skills", done: true },
                    { label: "Computing gap delta matrix", done: true },
                    { label: "Constructing DAG learning pathway", done: false },
                  ].map((t, i) => (
                    <motion.div
                      key={t.label}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.35 }}
                      className="flex items-center gap-3 glass-panel rounded-xl px-4 py-3"
                    >
                      {t.done
                        ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        : <Loader2 className="w-4 h-4 text-primary flex-shrink-0 animate-spin" />}
                      <span className={`text-sm ${t.done ? "text-slate-300" : "text-white font-semibold"}`}>{t.label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Roadmap ── */}
            {step === 2 && (
              <motion.div key="roadmap" {...slide} className="w-full max-w-2xl flex flex-col gap-6">
                <div className="text-center">
                  <h3 className="text-2xl md:text-3xl font-extrabold mb-2">Your Dynamic <span className="text-gradient">Pathway</span></h3>
                </div>
                {/* Skill tags */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {["React", "Git", "CSS", "JS"].map(s => (
                    <span key={s} className="text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />{s}
                    </span>
                  ))}
                  {["Next.js", "Docker", "ML"].map(s => (
                    <span key={s} className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{s}
                    </span>
                  ))}
                </div>
                {/* Timeline */}
                <div className="space-y-3">
                  {[
                    { n: 1, title: "Next.js Fundamentals & App Router", h: 4 },
                    { n: 2, title: "Docker Containerization & CI/CD", h: 6 },
                    { n: 3, title: "Machine Learning Foundations", h: 8 },
                  ].map((m, i) => (
                    <motion.div
                      key={m.n}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="flex items-center gap-4 glass-panel rounded-xl px-5 py-4 hover:border-primary/40 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center text-sm font-extrabold text-primary flex-shrink-0">
                        {m.n}
                      </div>
                      <p className="flex-1 font-semibold text-sm md:text-base text-white">{m.title}</p>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full flex-shrink-0">
                        <Clock className="w-3 h-3" />{m.h}h
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: ROI Dashboard ── */}
            {step === 3 && (
              <motion.div key="roi" {...slide} className="w-full max-w-2xl flex flex-col gap-6">
                <div className="text-center">
                  <h3 className="text-2xl md:text-3xl font-extrabold mb-2">Holistic <span className="text-gradient">Integration Plan</span></h3>
                  <p className="text-slate-400 text-sm">ROI calculated, mentor matched, sandbox deployed.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { Icon: TrendingDown, color: "text-green-400", accent: "border-l-green-400", bg: "bg-green-400/5", title: "Hours Saved", value: "45 hrs", sub: "$3,825 budget saved", sub2: "4 modules bypassed" },
                    { Icon: Users, color: "text-primary", accent: "border-l-primary", bg: "bg-primary/5", title: "AI Mentor Match", value: "Dr. E. Rostova", sub: "Principal Engineer", sub2: "Next.js SME" },
                    { Icon: Target, color: "text-accent", accent: "border-l-accent", bg: "bg-accent/5", title: "Day-1 Sandbox", value: "Micro-Deploy", sub: "Next.js project", sub2: "Practical first task" },
                  ].map((c) => (
                    <motion.div
                      key={c.title}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`glass-panel rounded-2xl p-5 border-l-4 ${c.accent} ${c.bg} flex flex-col gap-2`}
                    >
                      <c.Icon className={`w-7 h-7 ${c.color}`} />
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{c.title}</p>
                      <p className={`font-extrabold text-base leading-tight text-white`}>{c.value}</p>
                      <p className={`text-xs ${c.color} font-medium`}>{c.sub}</p>
                      <p className="text-xs text-slate-500">{c.sub2}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2.5 text-green-400 font-bold text-sm glass-panel border border-green-500/20 px-6 py-3 rounded-full">
                    <CheckCircle2 className="w-5 h-5" />
                    Role Competency Achieved — Candidate Ready for Deployment
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
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};
