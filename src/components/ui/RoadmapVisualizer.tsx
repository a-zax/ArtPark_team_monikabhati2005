"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Gauge,
  Layers,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  AnalysisMeta,
  GAP_SEVERITY_LABEL,
  GapAnalysis,
  LearningModule,
  PathwayResult,
} from "@/lib/analysis-types";
import { downloadICS } from "@/lib/ics";

import KnowledgeQuizModal from "./KnowledgeQuizModal";
import SkillRadar from "./SkillRadar";

type Props = {
  pathway: LearningModule[];
  stages: PathwayResult["stages"];
  skill_gap_details: PathwayResult["skill_gap_details"];
  pathway_overview: PathwayResult["pathway_overview"];
  analysis: GapAnalysis;
  gap_summary: PathwayResult["gap_summary"];
  roi_metrics: PathwayResult["roi_metrics"];
  mentorship_match: PathwayResult["mentorship_match"];
  sandbox_project: PathwayResult["sandbox_project"];
  meta: AnalysisMeta;
};

export default function RoadmapVisualizer({
  pathway,
  stages,
  skill_gap_details,
  pathway_overview,
  analysis,
  gap_summary,
  roi_metrics,
  mentorship_match,
  sandbox_project,
  meta,
}: Props) {
  const [quizSkill, setQuizSkill] = useState<string | null>(null);
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});

  const modeLabel = useMemo(() => {
    if (meta.analysis_mode === "hybrid") return "Hybrid parsing";
    if (meta.analysis_mode === "heuristic") return "Deterministic parsing";
    return "Demo fallback";
  }, [meta.analysis_mode]);

  useEffect(() => {
    const anchor = document.getElementById("roadmap-top");
    if (anchor) {
      window.setTimeout(() => anchor.scrollIntoView({ behavior: "smooth", block: "start" }), 180);
    }

    const timer = window.setTimeout(() => {
      import("canvas-confetti").then((module) => {
        module.default({
          particleCount: 140,
          spread: 78,
          origin: { y: 0.88 },
          colors: ["#38bdf8", "#f59e0b", "#34d399"],
        });
      });
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div id="roadmap-top" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-24 w-full pb-28">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-14 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Adaptive onboarding plan ready</span>
        </div>
        <h2 className="mb-3 text-4xl font-extrabold md:text-5xl">
          Personalized <span className="text-gradient">Training Roadmap</span>
        </h2>
        <p className="mx-auto max-w-3xl text-lg text-slate-300">{pathway_overview.explanation}</p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Badge>{modeLabel}</Badge>
          <Badge>{meta.role_track} track</Badge>
          <Badge>{pathway_overview.timeframe}</Badge>
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
            className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/15"
          >
            <Calendar className="h-4 w-4" />
            Export schedule
          </button>
        </div>
      </motion.div>

      <div className="mb-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Gauge className="mb-4 h-8 w-8 text-emerald-400" />}
          title="Role readiness"
          value={`${gap_summary.role_readiness_score}%`}
          note={`${Math.round(gap_summary.coverage_ratio * 100)}% of detected gaps are mapped to grounded modules.`}
        />
        <MetricCard
          icon={<Clock className="mb-4 h-8 w-8 text-primary" />}
          title="Training load"
          value={`${gap_summary.total_estimated_hours}h`}
          note={`${pathway.length} module${pathway.length === 1 ? "" : "s"} across ${stages.length} staged ramp-up block${stages.length === 1 ? "" : "s"}.`}
        />
        <MetricCard
          icon={<TrendingDown className="mb-4 h-8 w-8 text-green-400" />}
          title="Time saved"
          value={`${roi_metrics.total_hours_saved}h`}
          note={`Estimated savings: $${roi_metrics.budget_saved_usd.toLocaleString()} and ${roi_metrics.redundant_modules_bypassed} redundant modules skipped.`}
        />
        <MetricCard
          icon={<Users className="mb-4 h-8 w-8 text-accent" />}
          title="Mentor"
          value={mentorship_match.name}
          note={`${mentorship_match.role}. ${mentorship_match.reason}`}
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_1.6fr]">
        <div className="space-y-6">
          <div className="glass-panel panel-outline rounded-[28px] p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-2 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Engine transparency</h3>
                <p className="text-sm text-slate-400">What the system used to produce this pathway.</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <p>
                <span className="font-semibold text-white">Mode:</span> {modeLabel}
              </p>
              <p>
                <span className="font-semibold text-white">Role track:</span> {meta.role_track}
              </p>
              <p>
                <span className="font-semibold text-white">Security flags:</span>{" "}
                {meta.security.resume_flagged || meta.security.jd_flagged ? "Input sanitized" : "No suspicious input detected"}
              </p>
              <p>
                <span className="font-semibold text-white">Rate limit remaining:</span> {meta.rate_limit.remaining}
              </p>
            </div>
            {meta.warnings.length > 0 && (
              <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                <p className="mb-2 text-sm font-semibold text-amber-200">Notes</p>
                <div className="space-y-2 text-sm text-amber-100">
                  {meta.warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ProfileCard title="Candidate profile" tone="green" items={analysis.candidate_profile} />
          <ProfileCard title="Role requirements" tone="amber" items={analysis.required_profile} />

          <div className="glass-panel panel-outline rounded-[28px] p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-2 text-red-300">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Skill gap matrix</h3>
                <p className="text-sm text-slate-400">Under-proficiency is treated as a gap, not only missing skills.</p>
              </div>
            </div>

            <div className="space-y-3">
              {skill_gap_details.length > 0 ? (
                skill_gap_details.map((gap) => (
                  <div
                    key={gap.skill}
                    className="rounded-2xl border border-white/8 bg-white/5 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{gap.skill}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          Current: {gap.candidate_level === "not_observed" ? "Not observed" : gap.candidate_level} | Target:{" "}
                          {gap.required_level}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          gap.severity === "critical"
                            ? "bg-red-500/15 text-red-300"
                            : gap.severity === "important"
                              ? "bg-amber-400/15 text-amber-200"
                              : "bg-slate-700 text-slate-200"
                        }`}
                      >
                        {GAP_SEVERITY_LABEL[gap.severity]}
                      </span>
                    </div>
                    {gap.matched_course_ids.length > 0 ? (
                      <p className="mt-3 text-xs text-slate-400">Mapped module: {gap.matched_course_ids.join(", ")}</p>
                    ) : (
                      <p className="mt-3 text-xs text-amber-200">No grounded module matched this skill. Manual review recommended.</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                  No material gaps were detected. The candidate is already close to role readiness.
                </div>
              )}
            </div>
          </div>

          <SkillRadar analysis={analysis} />
        </div>

        <div className="space-y-6">
          <div className="glass-panel panel-outline rounded-[28px] p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-2 text-primary">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{pathway_overview.title}</h3>
                <p className="text-sm text-slate-400">{sandbox_project.description}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {stages.map((stage) => (
                <div key={stage.id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{stage.title}</p>
                  <p className="mt-3 text-2xl font-bold text-white">{stage.estimated_hours}h</p>
                  <p className="mt-2 text-sm text-slate-400">{stage.objective}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative space-y-8">
            <div className="absolute left-[27px] top-6 bottom-6 hidden w-px bg-slate-800 lg:block" />

            {pathway.length > 0 ? (
              pathway.map((step, index) => {
                const quizKey = step.id;
                const quizLabel = step.skills_targeted[0] ?? step.title;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + index * 0.07 }}
                    className="relative flex gap-5"
                  >
                    <div className="relative z-10 hidden h-14 w-14 shrink-0 items-center justify-center rounded-full border-[3px] border-primary bg-[#06111d] shadow-[0_0_24px_rgba(56,189,248,0.2)] lg:flex">
                      <span className="font-bold text-primary">{index + 1}</span>
                    </div>

                    <div className="glass-panel panel-outline flex-1 rounded-[28px] p-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              <Badge>{step.stage}</Badge>
                              <Badge>{step.difficulty}</Badge>
                            </div>
                            <h4 className="text-2xl font-bold text-white">{step.title}</h4>
                            <p className="mt-2 text-sm leading-relaxed text-slate-400">
                              Targets {step.skills_targeted.join(", ") || "role readiness"}.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {quizScores[quizKey] !== undefined ? (
                              <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                                  quizScores[quizKey] === 3
                                    ? "bg-green-500/15 text-green-300"
                                    : quizScores[quizKey] === 2
                                      ? "bg-amber-400/15 text-amber-200"
                                      : "bg-red-500/15 text-red-300"
                                }`}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Score: {quizScores[quizKey]}/3
                              </span>
                            ) : (
                              <button
                                onClick={() => setQuizSkill(quizLabel)}
                                className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/15"
                              >
                                <Layers className="h-4 w-4" />
                                Test knowledge
                              </button>
                            )}
                            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                              <Clock className="h-4 w-4" />
                              {step.estimated_hours}h
                            </span>
                          </div>
                        </div>

                        {step.prerequisites.length > 0 && (
                          <p className="text-xs text-slate-400">
                            Prerequisites: {step.prerequisites.join(", ")}
                          </p>
                        )}

                        {step.outcomes.length > 0 && (
                          <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Expected outcomes</p>
                            <div className="space-y-1.5 text-sm text-slate-300">
                              {step.outcomes.map((outcome) => (
                                <p key={outcome}>{outcome}</p>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="rounded-2xl border border-primary/15 bg-primary/6 p-4">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Reasoning trace</p>
                          <p className="text-sm leading-relaxed text-slate-300">{step.reasoning}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="glass-panel panel-outline rounded-[28px] p-6 text-slate-300">
                No catalog modules were required for this profile. Use the sandbox and mentor review as the final
                readiness check.
              </div>
            )}

            <div className="glass-panel panel-outline rounded-[28px] p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-400">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{sandbox_project.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{sandbox_project.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <KnowledgeQuizModal
        skill={quizSkill || ""}
        isOpen={Boolean(quizSkill)}
        onClose={() => setQuizSkill(null)}
        onComplete={(score) => {
          if (quizSkill) {
            setQuizScores((current) => ({ ...current, [pathway.find((step) => (step.skills_targeted[0] ?? step.title) === quizSkill)?.id ?? quizSkill]: score }));
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
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  note: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel panel-outline rounded-[28px] p-6"
    >
      {icon}
      <p className="mb-1 text-sm font-semibold text-slate-400">{title}</p>
      <p className="mb-2 text-2xl font-extrabold text-white">{value}</p>
      <p className="text-sm leading-relaxed text-slate-300">{note}</p>
    </motion.div>
  );
}

function ProfileCard({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "green" | "amber";
  items: GapAnalysis["candidate_profile"];
}) {
  const toneClass =
    tone === "green"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
      : "border-amber-400/20 bg-amber-400/10 text-amber-100";

  return (
    <div className="glass-panel panel-outline rounded-[28px] p-6">
      <h3 className="mb-4 text-lg font-bold text-white">{title}</h3>
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={`${title}-${item.skill}`} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-white">{item.skill}</p>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${toneClass}`}>{item.level}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                {typeof item.years === "number" ? `${item.years}+ years inferred` : "Years not confidently inferred"}
                {item.evidence ? ` | ${item.evidence}` : ""}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-4 text-sm text-slate-400">
            No profile signals were extracted from this side of the input.
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-slate-200">
      {children}
    </span>
  );
}
