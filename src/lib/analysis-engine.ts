import {
  AnalysisMeta,
  GapAnalysis,
  GapSeverity,
  RoleTrack,
  SKILL_LEVEL_WEIGHT,
  SkillGapDetail,
  SkillLevel,
  SkillProfile,
  normalizeSkillName,
} from '@/lib/analysis-types';
import {
  canonicalizeSkill,
  extractSkillSignals,
  inferRoleTrackFromProfiles,
  normalizeProfile,
} from '@/lib/skill-taxonomy';

export const FALLBACK_ANALYSIS: GapAnalysis = {
  candidate_profile: [
    { skill: 'React', level: 'intermediate', years: 2, evidence: 'Built customer-facing web flows and dashboard modules.' },
    { skill: 'JavaScript', level: 'advanced', years: 3, evidence: 'Hands-on frontend delivery in prior product role.' },
    { skill: 'Git', level: 'intermediate', years: 2, evidence: 'Version-controlled feature work.' },
  ],
  required_profile: [
    { skill: 'React', level: 'advanced', years: 3, evidence: 'Own the frontend architecture for the role.' },
    { skill: 'Next.js', level: 'intermediate', years: 2, evidence: 'Deliver SSR product surfaces and integrations.' },
    { skill: 'Docker', level: 'beginner', years: 1, evidence: 'Run and ship the application in a consistent environment.' },
    { skill: 'AWS', level: 'beginner', years: 1, evidence: 'Collaborate on cloud deployments and monitoring.' },
  ],
  candidate_skills: ['React', 'JavaScript', 'Git'],
  required_skills: ['React', 'Next.js', 'Docker', 'AWS'],
  missing_skills: ['React', 'Next.js', 'Docker', 'AWS'],
  role_track: 'engineering',
};

function safeLevel(input: unknown, fallback: SkillLevel): SkillLevel {
  if (input === 'beginner' || input === 'intermediate' || input === 'advanced') {
    return input;
  }
  return fallback;
}

function normalizeSkillArray(skills: unknown): string[] {
  if (!Array.isArray(skills)) {
    return [];
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of skills) {
    if (typeof item !== 'string' || !item.trim()) {
      continue;
    }

    const canonical = canonicalizeSkill(item);
    const normalized = normalizeSkillName(canonical);
    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(canonical);
  }

  return result;
}

function normalizeProfilePayload(
  profile: unknown,
  fallbackLevel: SkillLevel,
): SkillProfile[] {
  if (!Array.isArray(profile)) {
    return [];
  }

  const rawItems = profile
    .map((item) => {
      if (typeof item !== 'object' || !item || !('skill' in item)) {
        return null;
      }

      const entry = item as Record<string, unknown>;
      const rawSkill = typeof entry.skill === 'string' ? entry.skill.trim() : '';
      if (!rawSkill) {
        return null;
      }

      return {
        skill: canonicalizeSkill(rawSkill),
        level: safeLevel(entry.level, fallbackLevel),
        years: typeof entry.years === 'number' ? entry.years : undefined,
        evidence: typeof entry.evidence === 'string' ? entry.evidence.trim() : undefined,
        confidence: typeof entry.confidence === 'number' ? entry.confidence : undefined,
      } satisfies SkillProfile;
    })
    .filter((item): item is SkillProfile => item !== null);

  return normalizeProfile(rawItems);
}

function mergeProfiles(primary: SkillProfile[], secondary: SkillProfile[]): SkillProfile[] {
  const merged = new Map<string, SkillProfile>();

  for (const entry of [...primary, ...secondary]) {
    const key = normalizeSkillName(canonicalizeSkill(entry.skill));
    const existing = merged.get(key);

    merged.set(key, {
      skill: canonicalizeSkill(entry.skill),
      level:
        !existing || SKILL_LEVEL_WEIGHT[entry.level] >= SKILL_LEVEL_WEIGHT[existing.level]
          ? entry.level
          : existing.level,
      years: Math.max(existing?.years ?? 0, entry.years ?? 0) || undefined,
      evidence: existing?.evidence ?? entry.evidence,
      confidence: Math.max(existing?.confidence ?? 0, entry.confidence ?? 0) || undefined,
    });
  }

  return [...merged.values()].sort((a, b) => a.skill.localeCompare(b.skill));
}

function buildSkillArray(...lists: SkillProfile[][]): string[] {
  const seen = new Set<string>();
  const skills: string[] = [];

  for (const list of lists) {
    for (const item of list) {
      const canonical = canonicalizeSkill(item.skill);
      const normalized = normalizeSkillName(canonical);
      if (seen.has(normalized)) {
        continue;
      }

      seen.add(normalized);
      skills.push(canonical);
    }
  }

  return skills;
}

function severityForGap(
  candidateLevel: SkillLevel | undefined,
  requiredLevel: SkillLevel,
): GapSeverity {
  if (!candidateLevel) {
    return requiredLevel === 'advanced' ? 'critical' : 'important';
  }

  const delta = SKILL_LEVEL_WEIGHT[requiredLevel] - SKILL_LEVEL_WEIGHT[candidateLevel];
  if (delta >= 2) return 'critical';
  if (delta === 1) return requiredLevel === 'advanced' ? 'critical' : 'important';
  return 'stretch';
}

export function deriveSkillGapDetails(analysis: GapAnalysis): SkillGapDetail[] {
  const candidateMap = new Map(
    analysis.candidate_profile.map((item) => [normalizeSkillName(item.skill), item]),
  );

  return analysis.required_profile
    .map((requiredSkill) => {
      const candidateSkill = candidateMap.get(normalizeSkillName(requiredSkill.skill));
      const candidateWeight = candidateSkill ? SKILL_LEVEL_WEIGHT[candidateSkill.level] : 0;
      const requiredWeight = SKILL_LEVEL_WEIGHT[requiredSkill.level];

      if (candidateWeight >= requiredWeight) {
        return null;
      }

      return {
        skill: requiredSkill.skill,
        candidate_level: candidateSkill?.level ?? 'not_observed',
        required_level: requiredSkill.level,
        severity: severityForGap(candidateSkill?.level, requiredSkill.level),
        matched_course_ids: [],
        evidence: candidateSkill?.evidence ?? requiredSkill.evidence,
      } satisfies SkillGapDetail;
    })
    .filter((item): item is SkillGapDetail => item !== null)
    .sort((a, b) => SKILL_LEVEL_WEIGHT[b.required_level] - SKILL_LEVEL_WEIGHT[a.required_level]);
}

export function normalizeStructuredAnalysis(payload: unknown): GapAnalysis {
  const data = typeof payload === 'object' && payload ? (payload as Record<string, unknown>) : {};
  const candidateProfile = normalizeProfilePayload(data.candidate_profile, 'beginner');
  const requiredProfile = normalizeProfilePayload(data.required_profile, 'intermediate');

  const candidateSkills = normalizeSkillArray(data.candidate_skills);
  const requiredSkills = normalizeSkillArray(data.required_skills);

  const mergedCandidateProfile =
    candidateProfile.length > 0
      ? candidateProfile
      : candidateSkills.map((skill) => ({ skill, level: 'beginner' as SkillLevel }));
  const mergedRequiredProfile =
    requiredProfile.length > 0
      ? requiredProfile
      : requiredSkills.map((skill) => ({ skill, level: 'intermediate' as SkillLevel }));

  const combinedAnalysis: GapAnalysis = {
    candidate_profile: normalizeProfile(mergedCandidateProfile),
    required_profile: normalizeProfile(mergedRequiredProfile),
    candidate_skills:
      candidateSkills.length > 0 ? candidateSkills : buildSkillArray(normalizeProfile(mergedCandidateProfile)),
    required_skills:
      requiredSkills.length > 0 ? requiredSkills : buildSkillArray(normalizeProfile(mergedRequiredProfile)),
    missing_skills: [],
    role_track: inferRoleTrackFromProfiles(mergedRequiredProfile, JSON.stringify(data)),
  };

  return {
    ...combinedAnalysis,
    missing_skills: deriveSkillGapDetails(combinedAnalysis).map((item) => item.skill),
  };
}

export function buildHeuristicAnalysis(resumeText: string, jdText: string): {
  analysis: GapAnalysis;
  warnings: string[];
} {
  const candidateProfile = normalizeProfile(extractSkillSignals(resumeText, 'resume'));
  const requiredProfile = normalizeProfile(extractSkillSignals(jdText, 'jd'));
  const roleTrack = inferRoleTrackFromProfiles(requiredProfile, jdText);
  const analysis: GapAnalysis = {
    candidate_profile: candidateProfile,
    required_profile: requiredProfile,
    candidate_skills: buildSkillArray(candidateProfile),
    required_skills: buildSkillArray(requiredProfile),
    missing_skills: [],
    role_track: roleTrack,
  };

  const warnings: string[] = [];
  if (resumeText.length < 200) {
    warnings.push('Resume text was short, so candidate skill extraction may be conservative.');
  }
  if (jdText.length < 250) {
    warnings.push('Job description text was short, so role expectations may be incomplete.');
  }
  if (candidateProfile.length === 0) {
    warnings.push('No known skills were detected in the resume. A manual review is recommended.');
  }
  if (requiredProfile.length === 0) {
    warnings.push('No catalog-aligned requirements were detected in the job description.');
  }

  return {
    analysis: {
      ...analysis,
      missing_skills: deriveSkillGapDetails(analysis).map((item) => item.skill),
    },
    warnings,
  };
}

export function mergeAnalyses(heuristic: GapAnalysis, llmAnalysis?: GapAnalysis): GapAnalysis {
  if (!llmAnalysis) {
    return {
      ...heuristic,
      missing_skills: deriveSkillGapDetails(heuristic).map((item) => item.skill),
    };
  }

  const candidateProfile = mergeProfiles(heuristic.candidate_profile, llmAnalysis.candidate_profile);
  const requiredProfile = mergeProfiles(heuristic.required_profile, llmAnalysis.required_profile);
  const roleTrack = llmAnalysis.role_track ?? heuristic.role_track ?? inferRoleTrackFromProfiles(requiredProfile, '');

  const merged: GapAnalysis = {
    candidate_profile: candidateProfile,
    required_profile: requiredProfile,
    candidate_skills: normalizeSkillArray([
      ...heuristic.candidate_skills,
      ...llmAnalysis.candidate_skills,
      ...buildSkillArray(candidateProfile),
    ]),
    required_skills: normalizeSkillArray([
      ...heuristic.required_skills,
      ...llmAnalysis.required_skills,
      ...buildSkillArray(requiredProfile),
    ]),
    missing_skills: [],
    role_track: roleTrack,
  };

  return {
    ...merged,
    missing_skills: deriveSkillGapDetails(merged).map((item) => item.skill),
  };
}

export function buildAnalysisMeta(input: {
  analysisMode: AnalysisMeta['analysis_mode'];
  usedLlm: boolean;
  simulated: boolean;
  roleTrack: RoleTrack;
  warnings: string[];
  resumeFlagged: boolean;
  jdFlagged: boolean;
  remaining: number;
  resetMs: number;
}): AnalysisMeta {
  return {
    analysis_mode: input.analysisMode,
    used_llm: input.usedLlm,
    simulated: input.simulated,
    role_track: input.roleTrack,
    warnings: input.warnings,
    security: {
      resume_flagged: input.resumeFlagged,
      jd_flagged: input.jdFlagged,
    },
    rate_limit: {
      remaining: input.remaining,
      reset_ms: input.resetMs,
    },
  };
}

export function buildPromptSeed(analysis: GapAnalysis) {
  return {
    role_track: analysis.role_track ?? 'general',
    candidate_skill_hints: analysis.candidate_skills.slice(0, 18),
    required_skill_hints: analysis.required_skills.slice(0, 18),
  };
}
