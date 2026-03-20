export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type ObservedSkillLevel = SkillLevel | 'not_observed';
export type GapSeverity = 'critical' | 'important' | 'stretch';
export type RoleTrack =
  | 'engineering'
  | 'analytics'
  | 'operations'
  | 'support'
  | 'sales'
  | 'finance'
  | 'general';
export type AnalysisMode = 'heuristic' | 'hybrid' | 'demo';
export type PathwayStageId = 'foundation' | 'core' | 'applied';

export interface SkillProfile {
  skill: string;
  level: SkillLevel;
  years?: number;
  evidence?: string;
  confidence?: number;
}

export interface GapAnalysis {
  candidate_profile: SkillProfile[];
  required_profile: SkillProfile[];
  candidate_skills: string[];
  required_skills: string[];
  missing_skills: string[];
  role_track?: RoleTrack;
}

export interface SkillGapDetail {
  skill: string;
  candidate_level: ObservedSkillLevel;
  required_level: SkillLevel;
  severity: GapSeverity;
  matched_course_ids: string[];
  evidence?: string;
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
  stage: PathwayStageId;
  outcomes: string[];
}

export interface PathwayStage {
  id: PathwayStageId;
  title: string;
  objective: string;
  estimated_hours: number;
  module_ids: string[];
}

export interface PathwayResult {
  pathway: LearningModule[];
  stages: PathwayStage[];
  skill_gap_details: SkillGapDetail[];
  gap_summary: {
    role_readiness_score: number;
    coverage_ratio: number;
    matched_missing_skills: string[];
    unmatched_missing_skills: string[];
    total_estimated_hours: number;
  };
  roi_metrics: {
    total_hours_saved: number;
    budget_saved_usd: number;
    redundant_modules_bypassed: number;
  };
  pathway_overview: {
    title: string;
    timeframe: string;
    explanation: string;
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

export interface AnalysisMeta {
  analysis_mode: AnalysisMode;
  used_llm: boolean;
  simulated: boolean;
  role_track: RoleTrack;
  warnings: string[];
  security: {
    resume_flagged: boolean;
    jd_flagged: boolean;
  };
  rate_limit: {
    remaining: number;
    reset_ms: number;
  };
}

export const SKILL_LEVEL_WEIGHT: Record<SkillLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export const GAP_SEVERITY_LABEL: Record<GapSeverity, string> = {
  critical: 'Critical',
  important: 'Important',
  stretch: 'Stretch',
};

export function normalizeSkillName(skill: string): string {
  return skill.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function compareSkillLevels(
  candidateLevel: SkillLevel | undefined,
  requiredLevel: SkillLevel,
): number {
  return (SKILL_LEVEL_WEIGHT[candidateLevel ?? 'beginner'] ?? 0) - SKILL_LEVEL_WEIGHT[requiredLevel];
}
