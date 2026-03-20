"use client";

import { motion } from 'framer-motion';
import { ArrowRight, FileText, Blocks, Zap, Crosshair, BrainCircuit, Activity } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center mx-auto pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="w-full flex flex-col items-center justify-center text-center mt-12 mb-32 relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6, type: "spring", stiffness: 150 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-panel mb-10 border-primary/30"
        >
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </div>
          <span className="text-sm font-semibold text-slate-300">ArtPark CodeForge Hackathon 2026</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]"
        >
          Hyper-Personalized <br className="hidden md:block" />
          <span className="text-gradient drop-shadow-lg">Onboarding Pathways.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="max-w-2xl text-lg md:text-xl text-slate-400 mb-12 font-medium leading-relaxed"
        >
          Eliminate &quot;one-size-fits-all&quot; corporate training. Our AI instantly parses your candidate&apos;s Resume against the Job Description to generate a dynamic, gap-free learning map.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-6"
        >
          <Link href="/upload" className="group relative flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 rounded-full font-bold text-lg overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-transform hover:scale-105 ring-2 ring-primary/50 ring-offset-2 ring-offset-background">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <FileText className="w-6 h-6 relative z-10" />
            <span className="relative z-10">Upload Resume & JD</span>
          </Link>
          
          <Link href="/upload" className="group flex items-center justify-center gap-3 glass-panel text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105">
            <Blocks className="w-5 h-5 text-accent group-hover:rotate-12 transition-transform" />
            <span>View Demo Pathway</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </motion.div>
        
        <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[140px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-accent/20 blur-[130px] rounded-full pointer-events-none -z-10" />
      </section>

      {/* 2. FEATURES SECTION */}
      <section id="features" className="w-full pt-20 pb-32 scroll-mt-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Why SyncPath <span className="text-primary">AI</span>?</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Standard training wastes 40% of an experienced hire&apos;s time. Our engine surgically patches missing knowledge without any redundancy.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <FeatureCard 
            icon={<BrainCircuit className="w-10 h-10 text-primary" />}
            title="Intelligent NLP Parsing"
            description="We extract verified competencies directly from unstructured Resumes and JDs with zero hallucinations."
            delay={0.1}
          />
          <FeatureCard 
            icon={<Crosshair className="w-10 h-10 text-accent" />}
            title="Precision Gap Analysis"
            description="Calculates the exact overlap between what a candidate already knows and what the role demands."
            delay={0.2}
          />
          <FeatureCard 
            icon={<Zap className="w-10 h-10 text-green-400" />}
            title="Adaptive Pathing"
            description="Our custom algorithm maps your skill gaps to grounded internal courses, generating a verified timeline."
            delay={0.3}
          />
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="w-full py-20 relative scroll-mt-24">
        <div className="absolute inset-0 bg-slate-900/40 skew-y-3 -z-10 border-y border-white/5" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">How it <span className="text-gradient">Works</span></h2>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-12 px-4">
          <Step 
            num="01" 
            title="Upload Documents" 
            desc="Drag and drop the candidate's resume and paste the target job description into our secure interface."
          />
          <Step 
            num="02" 
            title="Analysis Engine" 
            desc="Our models instantly identify core competencies. The logical engine processes missing proficiencies."
          />
          <Step 
            num="03" 
            title="Execute Pathway" 
            desc="The finalized visual roadmap is generated. Review the 'Reasoning Trace' to understand exactly why each step was prescribed."
          />
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="w-full py-32 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to transform onboarding?</h2>
        <Link href="/upload" className="inline-flex items-center gap-3 bg-white text-black px-10 py-5 rounded-full font-extrabold text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
          Launch Live Demo <Activity className="w-6 h-6" />
        </Link>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.5 }}
      className="glass-panel p-8 rounded-3xl flex flex-col items-start hover:border-primary/50 transition-colors group"
    >
      <div className="p-4 rounded-2xl bg-white/5 mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed font-medium">{description}</p>
    </motion.div>
  );
}

function Step({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="flex gap-6 md:gap-12 items-start group"
    >
      <div className="text-5xl md:text-7xl font-extrabold text-slate-800 select-none group-hover:text-primary transition-colors duration-500">
        {num}
      </div>
      <div className="pt-2 md:pt-4">
        <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-slate-400 text-lg leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}
