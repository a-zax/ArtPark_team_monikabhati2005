"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Gauge,
  Info,
  Layers,
  Target,
  TrendingDown,
  Users,
  Activity,
} from "lucide-react";
import { useEffect, useState } from "react";

import { downloadICS } from "@/lib/ics";
import { GapAnalysis, LearningModule, PathwayResult } from "@/lib/analysis-types";
import KnowledgeQuizModal from "./KnowledgeQuizModal";
import SkillRadar from "./SkillRadar";

type Props = {
  pathway: LearningModule[];
  catalog: PathwayResult["catalog"];
  analysis: GapAnalysis;
  gap_summary: PathwayResult["gap_summary"];
  roi_metrics: PathwayResult["roi_metrics"];
  mentorship_match: PathwayResult["mentorship_match"];
  sandbox_project: PathwayResult["sandbox_project"];
};

export default function RoadmapVisualizer({
  pathway,
  catalog,
  analysis,
  gap_summary,
  roi_metrics,
  mentorship_match,
  sandbox_project,
}: Props) {
  const [quizSkill, setQuizSkill] = useState<string | null>(null);
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});
  const [showStandardPath, setShowStandardPath] = useState(false);
  const standardHours = catalog.reduce((sum, item) => sum + item.estimated_hours, 0);
  const personalizedHours = pathway.reduce((sum, item) => sum + item.estimated_hours, 0);
  const skippedModules = Math.max(0, catalog.length - pathway.length);

  const toggleStandardPath = (val: boolean) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => setShowStandardPath(val));
    } else {
      setShowStandardPath(val);
    }
  };

  useEffect(() => {
    const el = document.getElementById("roadmap-top");
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 200);
    }

    const totalDelay = 0.5 + pathway.length * 0.1 + 0.6;
    const timer = setTimeout(() => {
      import("canvas-confetti").then((module) => {
        module.default({
          particleCount: 180,
          spread: 90,
          origin: { y: 0.88 },
          colors: ["#3b82f6", "#10b981", "#8b5cf6"],
        });
      });
    }, totalDelay * 1000);

    return () => clearTimeout(timer);
  }, [pathway.length]);

  return (
    <motion.div id="roadmap-top" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full mt-24 pb-32">
      <style jsx global>{`
        ::view-transition-group(*),
        ::view-transition-old(*),
        ::view-transition-new(*) {
          animation-duration: 0.4s;
          animation-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
        }
      `}</style>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
          <Activity className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold text-accent">Adaptive Onboarding Plan</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
          Your Dynamic <span className="text-gradient">Pathway</span>
        </h2>
        <p className="text-slate-400 max-w-3xl mx-auto text-lg">
          This roadmap is grounded in the internal catalog, sequenced with prerequisites, and calibrated against the
          candidate&apos;s current proficiency versus target-role expectations.
        </p>
        <button
          onClick={() => {
            const events = pathway.map((step, index) => {
              const date = new Date();
              date.setDate(date.getDate() + 1 + index);
              date.setHours(9, 0, 0, 0);
              return {
                title: step.title,
                description: step.reasoning,
                start: date,
                durationHours: step.estimated_hours,
              };
            });
            downloadICS(events, "CogniSync_Onboarding.ics");
          }}
          className="mt-6 inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 transition-colors px-6 py-2.5 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(59,130,246,0.15)]"
        >
          <Calendar className="w-4 h-4" />
          Export Schedule to Calendar (.ics)
        </button>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
        <MetricCard
          icon={<Gauge className="w-8 h-8 text-emerald-400 mb-4" />}
          title="Role Readiness"
          value={`${gap_summary.role_readiness_score}%`}
          note={`${Math.round(gap_summary.coverage_ratio * 100)}% of identified gaps are covered by grounded catalog modules.`}
          accent="border-l-emerald-400"
        />
        <MetricCard
          icon={<TrendingDown className="w-8 h-8 text-green-400 mb-4" />}
          title="Training Time Saved"
          value={`${roi_metrics.total_hours_saved}h`}
          note={`Estimated budget saved: $${roi_metrics.budget_saved_usd.toLocaleString()} by bypassing ${roi_metrics.redundant_modules_bypassed} partially redundant modules.`}
          accent="border-l-green-400"
        />
        <MetricCard
          icon={<Users className="w-8 h-8 text-primary mb-4" />}
          title="Mentor Assignment"
          value={mentorship_match.name}
          note={`${mentorship_match.role}. ${mentorship_match.reason}`}
          accent="border-l-primary"
        />
        <MetricCard
          icon={<Target className="w-8 h-8 text-accent mb-4" />}
          title="Sandbox Focus"
          value={sandbox_project.title}
          note={sandbox_project.description}
          accent="border-l-accent"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="lg:w-1/3 space-y-6">
          <ProfileCard title="Candidate Profile" tone="green" items={analysis.candidate_profile} />
          <ProfileCard title="Role Requirements" tone="violet" items={analysis.required_profile} />

          <div className="glass-panel rounded-2xl p-6 border border-red-500/20">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Gap Summary
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {analysis.missing_skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-red-500/10 text-red-400 text-xs font-semibold rounded-full border border-red-500/20"
                >
                  {skill}
                </span>
              ))}
            </div>
            {gap_summary.unmatched_missing_skills.length > 0 ? (
              <p className="text-sm text-amber-300 leading-relaxed">
                Manual review required for: {gap_summary.unmatched_missing_skills.join(", ")}. These were intentionally
                not converted into fabricated modules.
              </p>
            ) : (
              <p className="text-sm text-slate-300 leading-relaxed">
                Every detected gap is mapped to at least one verified course from the catalog.
              </p>
            )}
          </div>

          <SkillRadar analysis={analysis} />
        </motion.div>

        <div className="lg:w-2/3 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white">Recommended Sequence</h3>
              <p className="text-sm text-slate-400 mt-1">
                Compare generic onboarding against the AI-adaptive path and make the time savings visible.
              </p>
            </div>
            
            <div className="bg-slate-900/50 p-1 rounded-full border border-white/10 inline-flex relative w-full sm:w-[320px]">
              <button
                onClick={() => toggleStandardPath(true)}
                className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all z-10 ${
                  showStandardPath ? "text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "text-slate-400 hover:text-slate-300"
                }`}
              >
                Standard Onboarding
              </button>
              <button
                onClick={() => toggleStandardPath(false)}
                className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all z-10 ${
                  !showStandardPath ? "text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "text-slate-400 hover:text-slate-300"
                }`}
              >
                Personalized Path
              </button>
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary/20 border border-primary/30 rounded-full transition-all duration-300 ${
                  showStandardPath ? "left-1 bg-white/10 border-white/20" : "left-[calc(50%+4px)] bg-primary/20 border-primary/30"
                }`}
                style={{ transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)" }}
              />
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel rounded-2xl px-4 py-3 border border-white/10">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-bold">Standard Track</p>
              <p className="text-2xl font-extrabold text-white mt-1">{catalog.length} modules</p>
              <p className="text-sm text-slate-400 mt-1">{standardHours} total hours</p>
            </div>
            <div className="glass-panel rounded-2xl px-4 py-3 border border-primary/20">
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary/70 font-bold">AI-Adaptive Track</p>
              <p className="text-2xl font-extrabold text-white mt-1">{pathway.length} modules</p>
              <p className="text-sm text-slate-300 mt-1">{personalizedHours} total hours</p>
            </div>
            <div className="glass-panel rounded-2xl px-4 py-3 border border-green-500/20">
              <p className="text-[11px] uppercase tracking-[0.2em] text-green-400/80 font-bold">Visible Impact</p>
              <p className="text-2xl font-extrabold text-white mt-1">{skippedModules} modules bypassed</p>
              <p className="text-sm text-slate-300 mt-1">{Math.max(0, standardHours - personalizedHours)} hours trimmed</p>
            </div>
          </div>

          <div className="absolute left-[27px] top-[74px] bottom-6 w-0.5 bg-slate-800" />

          <div className="space-y-10 relative">
            {(showStandardPath ? catalog : pathway).map((item, index) => {
              const inPathway = pathway.some((p) => p.id === item.id);
              const step = inPathway ? pathway.find((p) => p.id === item.id)! : (item as LearningModule);
              const isBypassed = showStandardPath && !inPathway;
              const reasoningStr = inPathway ? step.reasoning : "Bypassed based on your existing proficiency.";

              return (
              <motion.div
                key={step.id}
                style={{ viewTransitionName: `module-${step.id}` }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={`flex gap-6 relative ${isBypassed ? "opacity-50 grayscale" : ""}`}
              >
                <div className={`relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-[#020617] border-[3px] flex items-center justify-center transition-colors ${isBypassed ? "border-slate-700" : "border-primary shadow-[0_0_20px_rgba(59,130,246,0.3)]"}`}>
                  <span className={`font-bold transition-colors ${isBypassed ? "text-slate-500" : "text-primary"}`}>{index + 1}</span>
                </div>

                <div className={`flex-1 glass-panel rounded-2xl p-6 group transition-colors ${isBypassed ? "border-slate-800/50" : "hover:border-primary/50"}`}>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div>
                        <h4 className={`text-xl font-bold transition-colors ${isBypassed ? "text-slate-500 line-through" : "text-white group-hover:text-primary"}`}>{step.title}</h4>
                        <p className="text-sm text-slate-400 mt-1">
                          Targets {step.skills_targeted?.join(", ") || "foundational readiness"} • {step.difficulty} level
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {step.is_partial && !isBypassed && (
                          <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border bg-orange-500/10 text-orange-400 border-orange-500/30">
                            <Activity className="w-3.5 h-3.5" />
                            Guided Refresher
                          </span>
                        )}
                        {quizScores[step.title] !== undefined ? (
                          <span
                            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
                              quizScores[step.title] === 3
                                ? "bg-green-500/10 text-green-400 border-green-500/30"
                                : quizScores[step.title] === 2
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                  : "bg-red-500/10 text-red-400 border-red-500/30"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Scored: {quizScores[step.title]}/3
                          </span>
                        ) : (
                          <button
                            onClick={() => setQuizSkill(step.title)}
                            className="flex items-center gap-1.5 text-sm font-bold text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20 hover:bg-accent/20 transition-colors"
                          >
                            <Layers className="w-4 h-4" />
                            Test Knowledge
                          </button>
                        )}
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                          <Clock className="w-4 h-4" />
                          {step.estimated_hours}h
                        </span>
                      </div>
                    </div>

                    {step.prerequisites.length > 0 && (
                      <p className="text-xs text-slate-400">
                        Prerequisites: {step.prerequisites.join(", ")}
                      </p>
                    )}

                    <div className="relative overflow-hidden p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-start gap-3">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
                      <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className={`text-sm leading-relaxed ${isBypassed ? "text-slate-500" : "text-slate-300"}`}>
                          <span className={`${isBypassed ? "text-slate-400" : "text-primary"} font-bold block mb-1`}>Reasoning Trace</span>
                          <Typewriter text={reasoningStr} delay={isBypassed ? 0 : 0.55 + index * 0.1} />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )})}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 + pathway.length * 0.1 }}
              className="flex gap-6 relative"
            >
              <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-green-500/10 border-[3px] border-green-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xl font-bold text-green-400">Role Competency Path Established</p>
                <p className="text-slate-400">
                  The candidate now has a grounded, sequenced onboarding path toward independent execution.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <KnowledgeQuizModal
        skill={quizSkill || ""}
        isOpen={!!quizSkill}
        onClose={() => setQuizSkill(null)}
        onComplete={(score) => {
          if (quizSkill) {
            setQuizScores((prev) => ({ ...prev, [quizSkill]: score }));
          }
        }}
      />
    </motion.div>
  );
}

function MetricCard({
  icon,
  title,
  value,
  note,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  note: string;
  accent: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-panel p-6 rounded-3xl border-l-4 ${accent} relative overflow-hidden`}
    >
      {icon}
      <h3 className="text-slate-400 font-semibold mb-1">{title}</h3>
      <p className="text-2xl font-extrabold text-white mb-2 leading-tight">{value}</p>
      <p className="text-sm text-slate-300 leading-relaxed">{note}</p>
    </motion.div>
  );
}

function ProfileCard({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "green" | "violet";
  items: GapAnalysis["candidate_profile"];
}) {
  const toneClasses =
    tone === "green"
      ? "border-green-500/20 text-green-400 bg-green-500/10"
      : "border-accent/20 text-accent bg-accent/10";

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-bold mb-4 text-white">{title}</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={`${title}-${item.skill}`} className="rounded-xl border border-white/5 bg-white/5 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-white">{item.skill}</p>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${toneClasses}`}>{item.level}</span>
            </div>

            {tone === "green" && typeof item.confidence === "number" && (
              <div className="mt-3">
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${item.confidence * 100}%` }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Confidence Score</span>
                  <span className="text-[10px] text-slate-400 font-bold">{Math.round(item.confidence * 100)}%</span>
                </div>
              </div>
            )}

            {tone === "green" && item.is_stale && (
              <div className="mt-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs p-2.5 rounded-lg flex items-start gap-2 leading-tight">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>{item.skill} potentially stale.</strong> Last used {item.last_used_year}. Recommend a refresher module even though it&apos;s on your resume.
                </span>
              </div>
            )}

            <p className="text-xs text-slate-400 mt-2">
              {typeof item.years === "number" ? `${item.years}+ years inferred` : "Years not confidently inferred"}
              {item.evidence ? ` • ${item.evidence}` : ""}
              {typeof item.decay_score === "number" ? ` • decay score ${Math.round(item.decay_score * 100)}%` : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Typewriter({ text, delay }: { text: string; delay: number }) {
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
        visible: { transition: { staggerChildren: 0.01 } },
        hidden: {},
      }}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          variants={{
            visible: { opacity: 1, display: "inline" },
            hidden: { opacity: 0, display: "none" },
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}
