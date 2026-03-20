"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useMemo } from "react";

import { GapAnalysis, SKILL_LEVEL_WEIGHT, normalizeSkillName } from "@/lib/analysis-types";

export default function SkillRadar({ analysis }: { analysis: GapAnalysis }) {
  const data = useMemo(() => {
    const candidateMap = new Map(
      analysis.candidate_profile.map((item) => {
        const confidenceBoost = typeof item.confidence === "number" ? item.confidence : 0.7;
        const decayFactor = typeof item.decay_score === "number" ? item.decay_score : confidenceBoost;
        return [
          normalizeSkillName(item.skill),
          {
            score: Math.round(SKILL_LEVEL_WEIGHT[item.level] * 33 * decayFactor),
            confidence: typeof item.confidence === "number" ? item.confidence : null,
            decay: typeof item.decay_score === "number" ? item.decay_score : null,
            stale: Boolean(item.is_stale),
          },
        ];
      }),
    );
    const requiredMap = new Map(
      analysis.required_profile.map((item) => [normalizeSkillName(item.skill), SKILL_LEVEL_WEIGHT[item.level] * 33]),
    );

    const allSkills = Array.from(
      new Set([
        ...analysis.required_profile.map((item) => item.skill),
        ...analysis.candidate_profile.map((item) => item.skill),
      ]),
    ).slice(0, 10);

    return allSkills.map((skill) => ({
      subject: skill,
      Candidate: candidateMap.get(normalizeSkillName(skill))?.score ?? 0,
      Required: requiredMap.get(normalizeSkillName(skill)) ?? 0,
      confidence: candidateMap.get(normalizeSkillName(skill))?.confidence ?? null,
      decay: candidateMap.get(normalizeSkillName(skill))?.decay ?? null,
      stale: candidateMap.get(normalizeSkillName(skill))?.stale ?? false,
    }));
  }, [analysis]);

  return (
    <div className="w-full h-[400px] bg-slate-900/40 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col pt-6">
      <div className="absolute top-6 left-6 z-10">
        <h3 className="text-xl font-bold text-white mb-1">Competency Mapping</h3>
        <p className="text-xs text-slate-400">Candidate proficiency vs. target-role expectation</p>
      </div>
      <div className="flex-1 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="50%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="Required" dataKey="Required" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
            <Radar name="Candidate" dataKey="Candidate" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.35} />
            <Tooltip
              formatter={(value, name, payload) => {
                if (name === "Candidate" && payload?.payload) {
                  const confidence = typeof payload.payload.confidence === "number" ? `${Math.round(payload.payload.confidence * 100)}%` : "n/a";
                  const decay = typeof payload.payload.decay === "number" ? `${Math.round(payload.payload.decay * 100)}%` : "n/a";
                  const stale = payload.payload.stale ? "Yes" : "No";
                  return [`${value} | confidence ${confidence} | decay ${decay} | stale ${stale}`, "Candidate"];
                }
                return [value, name];
              }}
              contentStyle={{
                backgroundColor: "rgba(15,23,42,0.9)",
                borderColor: "rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "white",
              }}
              itemStyle={{ color: "white" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 pb-6 mt-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 opacity-60" />
          <span className="text-xs text-slate-300 font-semibold">Candidate Confidence-Weighted</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-accent opacity-60" />
          <span className="text-xs text-slate-300 font-semibold">Required</span>
        </div>
      </div>
    </div>
  );
}
