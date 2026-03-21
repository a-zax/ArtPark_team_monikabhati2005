'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Target,
  TrendingDown,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const STEPS = [
  { id: 0, label: 'Upload Documents' },
  { id: 1, label: 'Analysis Running' },
  { id: 2, label: 'Roadmap Ready' },
  { id: 3, label: 'ROI and Mentors' },
];

const STATUS_ITEMS = [
  { label: 'Extracting resume signals', done: true },
  { label: 'Mapping job requirements', done: true },
  { label: 'Comparing skill levels', done: true },
  { label: 'Sequencing the learning path', done: false },
];

const CURRENT_SKILLS = ['React', 'Git', 'CSS', 'JavaScript'];
const TARGET_GAPS = ['Next.js', 'Docker', 'Machine Learning'];

const PATHWAY_MODULES = [
  { step: 1, title: 'Next.js Fundamentals and App Router', hours: 4 },
  { step: 2, title: 'Docker Containerization and CI/CD', hours: 6 },
  { step: 3, title: 'Machine Learning Foundations', hours: 8 },
];

const ROI_CARDS = [
  {
    Icon: TrendingDown,
    color: 'text-green-400',
    accent: 'border-l-green-400',
    bg: 'bg-green-400/5',
    title: 'Hours Saved',
    value: '45 hrs',
    sub: '$3,825 budget saved',
    sub2: '4 modules bypassed',
  },
  {
    Icon: Users,
    color: 'text-primary',
    accent: 'border-l-primary',
    bg: 'bg-primary/5',
    title: 'Mentor Match',
    value: 'Dr. E. Rostova',
    sub: 'Principal Engineer',
    sub2: 'Next.js reviewer',
  },
  {
    Icon: Target,
    color: 'text-accent',
    accent: 'border-l-accent',
    bg: 'bg-accent/5',
    title: 'Day 1 Sandbox',
    value: 'Micro-Deploy',
    sub: 'Next.js project',
    sub2: 'Practical first task',
  },
];

const STEP_DURATION = 3800;

const slide = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.35, ease: 'easeOut' as const },
};

export default function DemoAnimation() {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);

    const fill = window.setInterval(
      () => setProgress((current) => (current >= 100 ? 100 : current + 1)),
      STEP_DURATION / 100,
    );
    const next = window.setTimeout(() => {
      setStep((current) => (current + 1) % STEPS.length);
    }, STEP_DURATION);

    return () => {
      window.clearInterval(fill);
      window.clearTimeout(next);
    };
  }, [step]);

  return (
    <section id="demo" className="w-full scroll-mt-32 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8 text-center"
      >
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.4em] text-primary/70">
          Live Product Preview
        </p>
        <h2 className="mb-3 text-3xl font-bold md:text-5xl">
          See CogniSync <span className="text-gradient">In Action</span>
        </h2>
        <p className="mx-auto max-w-lg text-base text-slate-400">
          Watch the adaptive onboarding flow step through upload, analysis, and delivery.
        </p>
      </motion.div>

      <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
        {STEPS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setStep(index)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold transition-all duration-300 ${
              step === index
                ? 'border-primary bg-primary text-white shadow-[0_0_14px_rgba(59,130,246,0.5)]'
                : 'border-slate-700 text-slate-400 hover:border-primary/50 hover:text-slate-200'
            }`}
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                step === index ? 'bg-white/20' : 'bg-slate-800'
              }`}
            >
              {index + 1}
            </span>
            {item.label}
          </button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
        className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f1e] shadow-[0_0_80px_rgba(59,130,246,0.12)]"
      >
        <div className="flex items-center gap-3 border-b border-white/5 bg-slate-900 px-5 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <div className="mx-3 flex h-7 flex-1 items-center gap-2 rounded-lg bg-slate-800 px-3 py-1">
            <div className="h-3 w-3 shrink-0 rounded-full border border-slate-600" />
            <span className="truncate font-mono text-xs text-slate-500">
              localhost:3000 - CogniSync
            </span>
          </div>
          <div className="hidden items-center gap-1.5 sm:flex">
            {STEPS.map((item) => (
              <div
                key={item.id}
                className={`rounded-full transition-all duration-500 ${
                  step === item.id ? 'h-1 w-6 bg-primary' : 'h-1 w-1.5 bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="h-0.5 bg-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'linear', duration: 0.1 }}
          />
        </div>

        <div className="relative flex min-h-[400px] items-center justify-center overflow-hidden bg-[#020617] p-6 md:p-8">
          <div className="pointer-events-none absolute left-1/4 top-0 h-72 w-72 rounded-full bg-primary/5 blur-[80px]" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-accent/5 blur-[80px]" />

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="upload"
                {...slide}
                className="flex w-full max-w-2xl flex-col gap-8"
              >
                <div className="text-center">
                  <h3 className="mb-2 text-2xl font-extrabold md:text-3xl">
                    Start the <span className="text-gradient">Analysis</span>
                  </h3>
                  <p className="text-sm text-slate-400">
                    Provide the candidate material and target role requirements.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="glass-panel flex flex-col items-center gap-4 rounded-2xl border border-primary/20 p-6 transition-colors hover:border-primary/40">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="mb-1 text-sm font-bold text-white">resume_john_doe.pdf</p>
                      <p className="text-xs text-slate-500">248 KB | PDF document</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded
                    </span>
                  </div>

                  <div className="glass-panel flex flex-col items-center gap-4 rounded-2xl border border-accent/20 p-6 transition-colors hover:border-accent/40">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
                      <FileText className="h-6 w-6 text-accent" />
                    </div>
                    <div className="text-center">
                      <p className="mb-1 text-sm font-bold text-white">senior_engineer_jd.txt</p>
                      <p className="text-xs text-slate-500">Job description | pasted</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-3.5 text-sm font-extrabold text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    Generate Pathway <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="analyzing"
                {...slide}
                className="flex w-full max-w-md flex-col items-center gap-8 text-center"
              >
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-primary"
                  />
                  <BrainCircuit className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="mb-2 text-2xl font-extrabold">Analysis in Progress</h3>
                  <p className="text-sm text-slate-400">
                    Extracting signals and matching them against role expectations.
                  </p>
                </div>
                <div className="w-full space-y-3 text-left">
                  {STATUS_ITEMS.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.35 }}
                      className="glass-panel flex items-center gap-3 rounded-xl px-4 py-3"
                    >
                      {item.done ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
                      ) : (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                      )}
                      <span
                        className={`text-sm ${
                          item.done ? 'text-slate-300' : 'font-semibold text-white'
                        }`}
                      >
                        {item.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="roadmap"
                {...slide}
                className="flex w-full max-w-2xl flex-col gap-6"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-extrabold md:text-3xl">
                    Your <span className="text-gradient">Pathway</span>
                  </h3>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {CURRENT_SKILLS.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {skill}
                    </span>
                  ))}
                  {TARGET_GAPS.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="space-y-3">
                  {PATHWAY_MODULES.map((module, index) => (
                    <motion.div
                      key={module.step}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="glass-panel flex items-center gap-4 rounded-xl px-5 py-4 transition-colors hover:border-primary/40"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10 text-sm font-extrabold text-primary">
                        {module.step}
                      </div>
                      <p className="flex-1 text-sm font-semibold text-white md:text-base">
                        {module.title}
                      </p>
                      <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                        <Clock className="h-3 w-3" />
                        {module.hours}h
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="roi"
                {...slide}
                className="flex w-full max-w-2xl flex-col gap-6"
              >
                <div className="text-center">
                  <h3 className="mb-2 text-2xl font-extrabold md:text-3xl">
                    Readiness <span className="text-gradient">Summary</span>
                  </h3>
                  <p className="text-sm text-slate-400">
                    Hours saved, mentor assignment, and first practical task.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {ROI_CARDS.map((card) => (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`glass-panel flex flex-col gap-2 rounded-2xl border-l-4 p-5 ${card.accent} ${card.bg}`}
                    >
                      <card.Icon className={`h-7 w-7 ${card.color}`} />
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {card.title}
                      </p>
                      <p className="text-base font-extrabold leading-tight text-white">
                        {card.value}
                      </p>
                      <p className={`text-xs font-medium ${card.color}`}>{card.sub}</p>
                      <p className="text-xs text-slate-500">{card.sub2}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="flex justify-center">
                  <div className="glass-panel inline-flex items-center gap-2.5 rounded-full border border-green-500/20 px-6 py-3 text-sm font-bold text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    Role competency achieved - candidate ready for deployment
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
