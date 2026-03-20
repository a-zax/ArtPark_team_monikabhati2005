"use client";

import { motion } from 'framer-motion';
import { ArrowRight, FileText, Blocks } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center text-center mt-12 mb-20">
      
      {/* Badge container */}
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

      {/* Main hero text w/ staggering */}
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

      {/* Action Buttons */}
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
      
      {/* Abstract Background Blur Nodes */}
      <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-accent/20 blur-[130px] rounded-full pointer-events-none -z-10" />
    </div>
  );
}
