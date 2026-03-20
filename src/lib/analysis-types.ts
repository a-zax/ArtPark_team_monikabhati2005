export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface SkillProfile {
  skill: string;
  level: SkillLevel;
  years?: number;
  evidence?: string;
  confidence?: number;
  last_used_year?: number;
}

export interface GapAnalysis {
  candidate_profile: SkillProfile[];
  required_profile: SkillProfile[];
  candidate_skills: string[];
  required_skills: string[];
  missing_skills: string[];
}

export interface CatalogCourse {
  id: string;
  title: string;
  skills_covered: string[];
  difficulty: SkillLevel;
  estimated_hours: number;
  prerequisites?: string[];
  role_tags?: string[];
}

export interface LearningModule {
  id: string;
  title: string;
  reasoning: string;
  estimated_hours: number;
  difficulty: SkillLevel;
  skills_targeted: string[];
  prerequisites: string[];
  grounding: 'catalog';
  is_partial?: boolean;
}

export interface PathwayResult {
  pathway: LearningModule[];
  catalog: CatalogCourse[];
  gap_summary: {
    role_readiness_score: number;
    coverage_ratio: number;
    matched_missing_skills: string[];
    unmatched_missing_skills: string[];
  };
  roi_metrics: {
    total_hours_saved: number;
    budget_saved_usd: number;
    redundant_modules_bypassed: number;
  };
  mentorship_match: {
    name: string;
    role: string;
    reason: string;
  };
  sandbox_project: {
    title: string;
    description: string;
  };
}

export const SKILL_LEVEL_WEIGHT: Record<SkillLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export function normalizeSkillName(skill: string): string {
  return skill.trim().toLowerCase();
}
