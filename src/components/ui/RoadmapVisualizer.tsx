"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Clock, Info, TrendingDown, Users, Target, Activity } from "lucide-react";
import { useEffect, useState } from "react";

interface PathwayStep {
  id: string;
  title: string;
  reasoning: string;
  estimated_hours: number;
}

interface GapAnalysis {
  candidate_skills: string[];
  required_skills: string[];
  missing_skills: string[];
}

export default function RoadmapVisualizer({ 
  pathway, 
  analysis,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  roi_metrics,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mentorship_match,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sandbox_project
}: { 
  pathway: PathwayStep[], 
  analysis: GapAnalysis,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  roi_metrics: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mentorship_match: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sandbox_project: any
}) {

  useEffect(() => {
    // Fire confetti when the roadmap fully generates
    const totalDelay = 0.5 + (pathway.length * 0.1) + 0.6;
    const timer = setTimeout(() => {
      import("canvas-confetti").then((module) => {
        const confetti = module.default;
        confetti({
          particleCount: 200,
          spread: 90,
          origin: { y: 0.9 },
          colors: ['#3b82f6', '#10b981', '#8b5cf6']
        });
      });
    }, totalDelay * 1000);
    return () => clearTimeout(timer);
  }, [pathway.length]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full mt-24 pb-32"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
          <Activity className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold text-accent">Holistic Integration Plan</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Your Dynamic <span className="text-gradient">Pathway</span></h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          We&apos;ve completely bypassed generic onboarding. Below is your optimized curriculum, assigned mentorship, and exact corporate ROI calculation based purely on your missing gaps.
        </p>
      </motion.div>

      {/* NEW: Corporate ROI & Mentorship Dashboard */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        
        {/* ROI Metrics */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 rounded-3xl border-l-4 border-l-green-400 shadow-[0_4px_30px_rgba(74,222,128,0.1)] relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-400/10 rounded-full blur-xl" />
          <TrendingDown className="w-8 h-8 text-green-400 mb-4" />
          <h3 className="text-slate-400 font-semibold mb-1">Corporate ROI (Time Saved)</h3>
          <p className="text-3xl font-extrabold text-white mb-2">{roi_metrics.total_hours_saved} Hours Bypassed</p>
          <p className="text-sm text-green-400 font-medium">Equating to ${roi_metrics.budget_saved_usd.toLocaleString()} in saved training budget by skipping {roi_metrics.redundant_modules_bypassed} redundant modules.</p>
        </motion.div>

        {/* Mentorship Match */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 rounded-3xl border-l-4 border-l-primary shadow-[0_4px_30px_rgba(59,130,246,0.1)] relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
          <Users className="w-8 h-8 text-primary mb-4" />
          <h3 className="text-slate-400 font-semibold mb-1">Assigned AI Mentor Match</h3>
          <p className="text-2xl font-extrabold text-white mb-1">{mentorship_match.name}</p>
          <p className="text-sm text-primary font-bold mb-3">{mentorship_match.role}</p>
          <p className="text-sm text-slate-300">{mentorship_match.reason}</p>
        </motion.div>

        {/* Sandbox Project */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6 rounded-3xl border-l-4 border-l-accent shadow-[0_4px_30px_rgba(139,92,246,0.1)] relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-accent/10 rounded-full blur-xl" />
          <Target className="w-8 h-8 text-accent mb-4" />
          <h3 className="text-slate-400 font-semibold mb-1">Day-1 Practical Sandbox</h3>
          <p className="text-xl font-extrabold text-white mb-2 leading-tight">{sandbox_project.title}</p>
          <p className="text-sm text-slate-300">{sandbox_project.description}</p>
        </motion.div>

      </div>

      <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
        
        {/* Gap Analysis Stats */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:w-1/3 space-y-6"
        >
          <div className="glass-panel rounded-2xl p-6 border border-green-500/20 hover:border-green-500/40 transition-colors">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
               <CheckCircle2 className="w-5 h-5 text-green-500" />
               Validated Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.candidate_skills.map(s => (
                <span key={s} className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded-full border border-green-500/20">{s}</span>
              ))}
            </div>
          </div>
          
          <div className="glass-panel rounded-2xl p-6 border border-red-500/20 hover:border-red-500/40 transition-colors">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
               <AlertCircle className="w-5 h-5 text-red-500" />
               Identified Knowledge Gaps
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.missing_skills.map(s => (
                <span key={s} className="px-3 py-1 bg-red-500/10 text-red-400 text-xs font-semibold rounded-full border border-red-500/20">{s}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Vertical Timeline */}
        <div className="lg:w-2/3 relative">
           <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-800" />

           <div className="space-y-10 relative">
              {pathway.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (index * 0.1) }}
                  className="flex gap-6 relative"
                >
                  <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-[#020617] border-[3px] border-primary flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                    <span className="font-bold text-primary">{index + 1}</span>
                  </div>

                  <div className="flex-1 glass-panel rounded-2xl p-6 group hover:border-primary/50 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                      <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{step.title}</h4>
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 flex-shrink-0">
                        <Clock className="w-4 h-4" />
                        {step.estimated_hours}h
                      </span>
                    </div>

                    {/* Reasoning Trace Component */}
                    <div className="relative overflow-hidden mt-4 p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-start gap-3">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
                      <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-300 leading-relaxed font-mono">
                          <span className="text-primary font-bold block mb-1 font-sans">Reasoning Trace</span>
                          <Typewriter text={step.reasoning} delay={0.5 + (index * 0.1) + 0.2} />
                        </p>
                      </div>
                    </div>

                  </div>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + (pathway.length * 0.1) }}
                className="flex gap-6 relative"
              >
                <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-green-500/10 border-[3px] border-green-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-xl font-bold text-green-400">Role Competency Achieved</p>
                  <p className="text-slate-400">Candidate is fully integrated and ready for independent deployment.</p>
                </div>
              </motion.div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function Typewriter({ text, delay }: { text: string, delay: number }) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setInView(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!inView) return <span className="opacity-0">{text}</span>;

  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.015 } },
        hidden: {}
      }}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          variants={{
            visible: { opacity: 1, display: "inline" },
            hidden: { opacity: 0, display: "none" }
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}
