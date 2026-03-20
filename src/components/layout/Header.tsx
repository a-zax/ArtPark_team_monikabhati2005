"use client";

import { motion } from 'framer-motion';
import { BrainCircuit, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-12 glass-panel border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center p-2 rounded-xl bg-primary/20 border border-primary/50 text-primary overflow-hidden">
            <motion.div 
               animate={{ rotate: 360 }} 
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent opacity-50"
            />
            <BrainCircuit className="w-6 h-6 relative z-10" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">
            Cogni<span className="text-primary">Sync</span> AI
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Approach</Link>
          <Link href="/#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Workflow</Link>
          <Link href="/#demo" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Demo</Link>
        </nav>
        <Link href="/upload" className="flex items-center gap-2 text-sm font-semibold bg-white text-black px-6 py-2.5 rounded-full hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95">
          <Sparkles className="w-4 h-4 text-primary" />
          Open Analyzer
        </Link>
      </div>
    </motion.header>
  );
}
