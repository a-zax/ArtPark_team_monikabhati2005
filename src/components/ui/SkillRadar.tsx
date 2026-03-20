"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { useMemo } from "react";

interface SkillRadarProps {
  candidateSkills: string[];
  requiredSkills: string[];
  missingSkills: string[];
}

export default function SkillRadar({ candidateSkills, requiredSkills, missingSkills }: SkillRadarProps) {
  const data = useMemo(() => {
    // Combine all unique skills
    const allSkills = Array.from(new Set([...candidateSkills, ...requiredSkills, ...missingSkills])).slice(0, 10);
    
    return allSkills.map(skill => {
      const hasSkill = candidateSkills.includes(skill);
      const requiresSkill = requiredSkills.includes(skill);
      return {
        subject: skill,
        Candidate: hasSkill ? 100 : (requiresSkill ? 20 : 0),
        Required: requiresSkill ? 100 : 0,
      };
    });
  }, [candidateSkills, requiredSkills, missingSkills]);

  return (
    <div className="w-full h-[400px] bg-slate-900/40 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col pt-6">
      <div className="absolute top-6 left-6 z-10">
        <h3 className="text-xl font-bold text-white mb-1">Competency Mapping</h3>
        <p className="text-xs text-slate-400">Candidate vs. Job Requirements</p>
      </div>
      <div className="flex-1 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600 }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            
            <Radar
              name="Required"
              dataKey="Required"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.15}
            />
            <Radar
              name="Candidate"
              dataKey="Candidate"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.4}
            />
            
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
              itemStyle={{ color: 'white' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 pb-6 mt-2">
         <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 opacity-60"></span>
            <span className="text-xs text-slate-300 font-semibold">Candidate</span>
         </div>
         <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-accent opacity-60"></span>
            <span className="text-xs text-slate-300 font-semibold">Required</span>
         </div>
      </div>
    </div>
  );
}
