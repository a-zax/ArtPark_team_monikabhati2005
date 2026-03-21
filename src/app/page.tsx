'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Blocks,
  BrainCircuit,
  Crosshair,
  FileText,
  Zap,
} from 'lucide-react';

import DemoAnimation from '@/components/ui/DemoAnimation';
import MagneticButton from '@/components/ui/MagneticButton';

const ParticleGlobe = dynamic(() => import('@/components/ui/ParticleGlobe'), {
  ssr: false,
});

const features = [
  {
    title: 'Structured Skill Parsing',
    description:
      'The app extracts grounded competencies from resumes and job descriptions, then normalizes them into a role-ready profile.',
    icon: BrainCircuit,
    iconClassName: 'text-primary',
  },
  {
    title: 'Targeted Gap Analysis',
    description:
      'It highlights where the candidate is already ready, where they are under-leveled, and where training is still required.',
    icon: Crosshair,
    iconClassName: 'text-accent',
  },
  {
    title: 'Adaptive Pathing',
    description:
      'The pathing engine sequences catalog-backed modules with prerequisites, mentor support, and sandbox work.',
    icon: Zap,
    iconClassName: 'text-green-400',
  },
];

const workflowSteps = [
  {
    num: '01',
    title: 'Upload Documents',
    desc: "Drag in the candidate's resume and paste the target job description into the upload flow.",
  },
  {
    num: '02',
    title: 'Run Analysis',
    desc: 'The parser extracts current strengths and target expectations, then calculates the real gap.',
  },
  {
    num: '03',
    title: 'Review the Pathway',
    desc: 'A staged roadmap is generated with reasoning traces, mentor guidance, and a grounded sandbox project.',
  },
];

export default function Home() {
  return (
    <div className="mx-auto flex w-full flex-col items-center pb-20">
      <section className="relative mb-32 mt-12 flex w-full flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6, type: 'spring', stiffness: 150 }}
          className="glass-panel mb-10 inline-flex items-center gap-2 rounded-full border-primary/30 px-5 py-2"
        >
          <div className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
          </div>
          <span className="text-sm font-semibold text-slate-300">ArtPark CodeForge Hackathon 2026</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
          className="mb-8 text-5xl font-extrabold tracking-tight leading-[1.1] md:text-7xl"
        >
          Adaptive onboarding <br className="hidden md:block" />
          <span className="text-gradient drop-shadow-lg">
            that respects what people already know.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mb-12 max-w-2xl text-lg font-medium leading-relaxed text-slate-400 md:text-xl"
        >
          Parse a resume, compare it to the target role, and generate a grounded ramp-up plan
          that closes only the skills that are still missing.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative z-20 flex flex-col items-center gap-6 sm:flex-row"
        >
          <MagneticButton>
            <Link
              href="/upload"
              className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-primary px-8 py-4 text-lg font-bold text-white shadow-[0_0_40px_rgba(59,130,246,0.4)] ring-2 ring-primary/50 ring-offset-2 ring-offset-background transition-transform"
            >
              <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 ease-out group-hover:translate-y-0" />
              <FileText className="relative z-10 h-6 w-6" />
              <span className="relative z-10">Upload Resume and JD</span>
            </Link>
          </MagneticButton>

          <MagneticButton>
            <Link
              href="/upload"
              className="group glass-panel flex items-center justify-center gap-3 rounded-full px-8 py-4 text-lg font-bold text-white transition-all hover:border-white/20 hover:bg-white/10"
            >
              <Blocks className="h-5 w-5 text-accent transition-transform group-hover:rotate-12" />
              <span>View Demo Pathway</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1.5" />
            </Link>
          </MagneticButton>
        </motion.div>

        <div className="pointer-events-none absolute left-[30%] top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[140px]" />
        <div className="pointer-events-none absolute right-[20%] top-[40%] -z-10 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[130px]" />
      </section>

      <section
        id="features"
        className="flex min-h-[90vh] w-full scroll-mt-24 flex-col justify-center pb-32 pt-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-5xl">
            Why CogniSync <span className="text-primary">AI</span>?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            Strong hires should skip what they already know. Newer hires should get the right
            scaffolding before they are asked to deliver.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 px-4 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <FeatureCard
                key={feature.title}
                icon={<Icon className={`h-10 w-10 ${feature.iconClassName}`} />}
                title={feature.title}
                description={feature.description}
                delay={0.1 + index * 0.1}
              />
            );
          })}
        </div>
      </section>

      <section
        id="how-it-works"
        className="relative flex min-h-[90vh] w-full scroll-mt-24 flex-col justify-center pb-32 pt-20"
      >
        <ParticleGlobe />
        <div className="absolute inset-0 -z-10 skew-y-3 border-y border-white/5 bg-slate-900/40" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-5xl">
            How it <span className="text-gradient">Works</span>
          </h2>
        </motion.div>

        <div className="mx-auto max-w-4xl space-y-12 px-4">
          {workflowSteps.map((step) => (
            <Step key={step.num} num={step.num} title={step.title} desc={step.desc} />
          ))}
        </div>
      </section>

      <DemoAnimation />

      <section className="w-full py-32 text-center">
        <h2 className="mb-8 text-4xl font-bold md:text-5xl">
          Ready to show adaptive onboarding in action?
        </h2>
        <Link
          href="/upload"
          className="inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-xl font-extrabold text-black shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95"
        >
          Launch Live Demo <Activity className="h-6 w-6" />
        </Link>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['15deg', '-15deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-15deg', '15deg']);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const xPct = (event.clientX - rect.left) / rect.width - 0.5;
    const yPct = (event.clientY - rect.top) / rect.height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay, duration: 0.5 }}
      style={{ perspective: 1200 }}
      className="group relative h-full w-full cursor-pointer"
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="glass-panel flex h-full flex-col items-start rounded-3xl border border-white/5 bg-slate-900/40 p-8 transition-colors hover:bg-slate-800/60"
      >
        <div
          style={{ transform: 'translateZ(70px)' }}
          className="mb-6 rounded-2xl bg-white/5 p-4 shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-colors group-hover:bg-primary/20"
        >
          {icon}
        </div>
        <h3
          style={{ transform: 'translateZ(40px)' }}
          className="mb-3 text-2xl font-bold drop-shadow-md"
        >
          {title}
        </h3>
        <p
          style={{ transform: 'translateZ(20px)' }}
          className="font-medium leading-relaxed text-slate-400"
        >
          {description}
        </p>
      </motion.div>
    </motion.div>
  );
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="group flex items-start gap-6 md:gap-12"
    >
      <div className="select-none text-5xl font-extrabold text-slate-800 transition-colors duration-500 group-hover:text-primary md:text-7xl">
        {num}
      </div>
      <div className="pt-2 md:pt-4">
        <h3 className="mb-2 text-2xl font-bold text-white">{title}</h3>
        <p className="text-lg leading-relaxed text-slate-400">{desc}</p>
      </div>
    </motion.div>
  );
}
