'use client';

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useMemo } from 'react';

import { GapAnalysis, SKILL_LEVEL_WEIGHT, normalizeSkillName } from '@/lib/analysis-types';

export default function SkillRadar({ analysis }: { analysis: GapAnalysis }) {
  const data = useMemo(() => {
    const candidateMap = new Map(
      analysis.candidate_profile.map((item) => [normalizeSkillName(item.skill), SKILL_LEVEL_WEIGHT[item.level] * 33]),
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
      Candidate: candidateMap.get(normalizeSkillName(skill)) ?? 0,
      Required: requiredMap.get(normalizeSkillName(skill)) ?? 0,
    }));
  }, [analysis]);

  return (
    <div className="relative flex h-[400px] w-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-slate-900/40 pt-6">
      <div className="absolute left-6 top-6 z-10">
        <h3 className="mb-1 text-xl font-bold text-white">Competency Mapping</h3>
        <p className="text-xs text-slate-400">Candidate proficiency vs. target-role expectation</p>
      </div>
      <div className="mt-4 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="50%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 600 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="Required" dataKey="Required" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
            <Radar name="Candidate" dataKey="Candidate" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.35} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15,23,42,0.9)',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: 'white',
              }}
              itemStyle={{ color: 'white' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex justify-center gap-6 pb-6">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 opacity-60" />
          <span className="text-xs text-slate-300 font-semibold">Candidate</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-accent opacity-60" />
          <span className="text-xs text-slate-300 font-semibold">Required</span>
        </div>
      </div>
    </div>
  );
}
