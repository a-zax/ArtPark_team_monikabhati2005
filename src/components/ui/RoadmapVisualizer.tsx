"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Clock, Info } from "lucide-react";

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
  analysis 
}: { 
  pathway: PathwayStep[], 
  analysis: GapAnalysis 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full mt-24 pb-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold mb-4">Your Dynamic <span className="text-gradient">Pathway</span></h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          We&apos;ve bypassed the generic onboarding modules. Based on the gap analysis, here is the hyper-personalized training curriculum.
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-12 max-w-5xl mx-auto">
        
        {/* Gap Analysis Stats */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:w-1/3 space-y-6"
        >
          <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] transition-shadow">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
               <CheckCircle2 className="w-5 h-5 text-green-500" />
               Validated Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.candidate_skills.map(s => (
                <span key={s} className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded-full border border-green-500/20">{s}</span>
              ))}
            </div>
          </div>
          
          <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] transition-shadow">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
               <AlertCircle className="w-5 h-5 text-red-500" />
               Identified Gaps
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
           {/* Timeline Line */}
           <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-800" />

           <div className="space-y-10 relative">
              {pathway.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (index * 0.15) }}
                  className="flex gap-6 relative"
                >
                  <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-[#020617] border-[3px] border-primary flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
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
                        <p className="text-sm text-slate-300 leading-relaxed">
                          <span className="text-primary font-semibold block mb-1">Reasoning Trace</span>
                          {step.reasoning}
                        </p>
                      </div>
                    </div>

                  </div>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + (pathway.length * 0.15) }}
                className="flex gap-6 relative"
              >
                <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-green-500/10 border-[3px] border-green-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-xl font-bold text-green-400">Role Competency Achieved</p>
                  <p className="text-slate-400">Candidate is ready for independent deployment.</p>
                </div>
              </motion.div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
