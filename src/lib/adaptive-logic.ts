import { createRequire } from 'node:module';

import type {
  GapAnalysis,
  LearningModule,
  PathwayResult,
  PathwayStage,
  PathwayStageId,
  SkillGapDetail,
  SkillLevel,
} from './analysis-types.ts';
import { SKILL_LEVEL_WEIGHT, normalizeSkillName } from './analysis-types.ts';
import { deriveSkillGapDetails } from './analysis-engine.ts';

const require = createRequire(import.meta.url);

type CatalogCourse = {
  id: string;
  title: string;
  skills_covered: string[];
  difficulty: SkillLevel;
  estimated_hours: number;
  prerequisites?: string[];
  role_tags?: string[];
  outcomes?: string[];
};

const catalog = require('./course-catalog.json') as CatalogCourse[];
const TRAINER_RATE_USD = 85;

const STAGE_CONFIG: Record<PathwayStageId, { title: string; objective: string }> = {
  foundation: {
    title: 'Foundation',
    objective: 'Build baseline fluency before the hire is asked to deliver independently.',
  },
  core: {
    title: 'Core Ramp-Up',
    objective: 'Close the highest-impact capability gaps against the target role.',
  },
  applied: {
    title: 'Applied Readiness',
    objective: 'Rehearse production-like execution with mentor review and real deliverables.',
  },
};

function buildKnownSkillSet(analysis: GapAnalysis) {
  return new Set(analysis.candidate_skills.map(normalizeSkillName));
}

function getGapDetailsMap(gapDetails: SkillGapDetail[]) {
  return new Map(gapDetails.map((item) => [normalizeSkillName(item.skill), item]));
}

function scoreCourse(course: CatalogCourse, gap: SkillGapDetail, analysis: GapAnalysis): number {
  const normalizedGapSkill = normalizeSkillName(gap.skill);
  const exactMatch = course.skills_covered.some((skill) => normalizeSkillName(skill) === normalizedGapSkill);
  const targetLevel = SKILL_LEVEL_WEIGHT[gap.required_level];
  const courseLevel = SKILL_LEVEL_WEIGHT[course.difficulty];
  const levelPenalty = courseLevel >= targetLevel ? (courseLevel - targetLevel) * 4 : (targetLevel - courseLevel) * 8;
  const roleBonus = course.role_tags?.includes(analysis.role_track ?? 'general') ? 12 : 0;
  const multiGapBonus =
    course.skills_covered.filter((skill) => analysis.missing_skills.map(normalizeSkillName).includes(normalizeSkillName(skill))).length * 4;
  const prerequisitePenalty = (course.prerequisites?.length ?? 0) * 1.5;

  return (exactMatch ? 120 : 0) + roleBonus + multiGapBonus - levelPenalty - prerequisitePenalty;
}

function resolveCoursePath(courseId: string, selectedIds: Set<string>) {
  const course = catalog.find((item) => item.id === courseId);
  if (!course) {
    return;
  }

  for (const prerequisiteId of course.prerequisites ?? []) {
    resolveCoursePath(prerequisiteId, selectedIds);
  }

  selectedIds.add(courseId);
}

function sortCoursesByDependencies(courseIds: Set<string>) {
  const seen = new Set<string>();
  const ordered: CatalogCourse[] = [];

  function visit(courseId: string) {
    if (seen.has(courseId)) {
      return;
    }

    seen.add(courseId);
    const course = catalog.find((item) => item.id === courseId);
    if (!course) {
      return;
    }

    for (const prerequisiteId of course.prerequisites ?? []) {
      visit(prerequisiteId);
    }

    ordered.push(course);
  }

  for (const courseId of courseIds) {
    visit(courseId);
  }

  return ordered;
}

function pickStage(course: CatalogCourse): PathwayStageId {
  if (course.difficulty === 'beginner') return 'foundation';
  if (course.difficulty === 'advanced') return 'applied';
  return 'core';
}

function mapCourses(analysis: GapAnalysis, gapDetails: SkillGapDetail[]) {
  const selectedIds = new Set<string>();
  const matchedMissingSkills = new Set<string>();
  const unmatchedMissingSkills: string[] = [];
  const gapCourseMap = new Map<string, string[]>();

  for (const gap of gapDetails) {
    const candidates = catalog
      .filter((course) =>
        course.skills_covered.some((coveredSkill) => normalizeSkillName(coveredSkill) === normalizeSkillName(gap.skill)),
      )
      .sort((a, b) => scoreCourse(b, gap, analysis) - scoreCourse(a, gap, analysis));

    const bestCourse = candidates[0];
    if (!bestCourse) {
      unmatchedMissingSkills.push(gap.skill);
      gapCourseMap.set(normalizeSkillName(gap.skill), []);
      continue;
    }

    matchedMissingSkills.add(gap.skill);
    resolveCoursePath(bestCourse.id, selectedIds);
    gapCourseMap.set(normalizeSkillName(gap.skill), [bestCourse.id]);
  }

  return {
    matchedMissingSkills: [...matchedMissingSkills],
    unmatchedMissingSkills,
    gapCourseMap,
    selectedCourses: sortCoursesByDependencies(selectedIds),
  };
}

function buildReasoning(course: CatalogCourse, analysis: GapAnalysis, gapMap: Map<string, SkillGapDetail>) {
  const targetedGaps = course.skills_covered
    .map((skill) => gapMap.get(normalizeSkillName(skill)))
    .filter((item): item is SkillGapDetail => Boolean(item));

  const gapText =
    targetedGaps.length > 0
      ? targetedGaps
          .map((gap) => {
            const candidateLevel = gap.candidate_level === 'not_observed' ? 'not yet observed' : gap.candidate_level;
            return `${gap.skill} (${candidateLevel} to ${gap.required_level})`;
          })
          .join(', ')
      : 'the remaining role gap';

  const prerequisiteText =
    course.prerequisites && course.prerequisites.length > 0
      ? `Prerequisite coverage is already sequenced through ${course.prerequisites.join(', ')}.`
      : 'No earlier catalog module is required before this step.';

  return `Assigned from the grounded catalog to close ${gapText}. The module difficulty is ${course.difficulty} so the learner reaches the role expectation without skipping required scaffolding. ${prerequisiteText}`;
}

function calculateRoi(analysis: GapAnalysis) {
  const knownSkills = buildKnownSkillSet(analysis);
  let bypassedHours = 0;
  let bypassedModules = 0;

  for (const course of catalog) {
    const knownCoverage = course.skills_covered.filter((skill) => knownSkills.has(normalizeSkillName(skill))).length;
    if (knownCoverage === 0) {
      continue;
    }

    const coverageRatio = knownCoverage / course.skills_covered.length;
    if (coverageRatio >= 0.5) {
      bypassedHours += Math.round(course.estimated_hours * coverageRatio);
      bypassedModules += 1;
    }
  }

  return {
    total_hours_saved: bypassedHours,
    budget_saved_usd: bypassedHours * TRAINER_RATE_USD,
    redundant_modules_bypassed: bypassedModules,
  };
}

function buildStages(pathway: LearningModule[]): PathwayStage[] {
  return (['foundation', 'core', 'applied'] as PathwayStageId[])
    .map((stageId) => {
      const modules = pathway.filter((module) => module.stage === stageId);
      if (modules.length === 0) {
        return null;
      }

      return {
        id: stageId,
        title: STAGE_CONFIG[stageId].title,
        objective: STAGE_CONFIG[stageId].objective,
        estimated_hours: modules.reduce((total, module) => total + module.estimated_hours, 0),
        module_ids: modules.map((module) => module.id),
      } satisfies PathwayStage;
    })
    .filter((stage): stage is PathwayStage => stage !== null);
}

function pickTopGap(gapDetails: SkillGapDetail[]) {
  return gapDetails[0]?.skill ?? 'role-specific onboarding';
}

function buildPathwayOverview(analysis: GapAnalysis, totalHours: number, matchedSkills: string[]) {
  const roleTrackLabel = analysis.role_track ? analysis.role_track[0].toUpperCase() + analysis.role_track.slice(1) : 'Role';
  const businessDays = Math.max(2, Math.ceil(totalHours / 4));

  return {
    title: `${roleTrackLabel} ramp-up plan`,
    timeframe: `~${businessDays} focused working days`,
    explanation:
      matchedSkills.length > 0
        ? `The pathway starts with the missing foundations, then moves into role-critical modules for ${matchedSkills.join(', ')} before the final mentor-reviewed sandbox.`
        : 'The candidate already meets the catalog-covered expectations, so the pathway can focus on sandbox validation instead of remedial coursework.',
  };
}

function buildMentorRecommendation(analysis: GapAnalysis, topGap: string, gapDetails: SkillGapDetail[]) {
  const highestGap = gapDetails[0];
  const mentorRole =
    highestGap?.severity === 'critical'
      ? 'Principal Mentor'
      : highestGap?.required_level === 'advanced'
        ? 'Staff Mentor'
        : 'Senior Mentor';

  return {
    name:
      analysis.role_track === 'analytics'
        ? 'Rhea Narang'
        : analysis.role_track === 'operations'
          ? 'Karan Mehta'
          : analysis.role_track === 'support'
            ? 'Ira Sethi'
            : analysis.role_track === 'sales'
              ? 'Nikhil Arora'
              : analysis.role_track === 'finance'
                ? 'Maya Desai'
                : 'Jordan Kim',
    role: `${mentorRole} for ${topGap}`,
    reason: `Assigned because ${topGap} is the highest-priority competency gap and should be reviewed early to reduce onboarding drift.`,
  };
}

function buildSandboxProject(
  analysis: GapAnalysis,
  gapDetails: SkillGapDetail[],
  unmatchedMissingSkills: string[],
) {
  const focusSkills = gapDetails.slice(0, 3).map((item) => item.skill);
  const focusText = focusSkills.length > 0 ? focusSkills.join(', ') : 'role validation';

  if (analysis.role_track === 'operations') {
    return {
      title: `Operational drill for ${focusText}`,
      description:
        unmatchedMissingSkills.length > 0
          ? `The sandbox walks through catalog-covered skills first, while ${unmatchedMissingSkills.join(', ')} stays with mentor review so the system never invents fake training.`
          : `The learner completes a shift-style simulation that applies ${focusText} to real handoffs, SOP checks, and reporting.`,
    };
  }

  return {
    title: `Guided onboarding project for ${focusText}`,
    description:
      unmatchedMissingSkills.length > 0
        ? `The sandbox focuses on catalog-covered gaps in ${focusText}, while ${unmatchedMissingSkills.join(', ')} is escalated for manual review instead of fabricated content.`
        : `The final exercise converts ${focusText} into a realistic deliverable so the learner proves execution readiness, not just course completion.`,
  };
}

export function generateAdaptivePathway(analysis: GapAnalysis): PathwayResult {
  const gapDetails = deriveSkillGapDetails(analysis);
  const gapMap = getGapDetailsMap(gapDetails);
  const { matchedMissingSkills, unmatchedMissingSkills, gapCourseMap, selectedCourses } = mapCourses(analysis, gapDetails);
  const readinessPenalty = matchedMissingSkills.length * 6 + unmatchedMissingSkills.length * 18;
  const roleReadinessScore = Math.max(30, 100 - readinessPenalty);
  const coverageRatio = gapDetails.length === 0 ? 1 : matchedMissingSkills.length / gapDetails.length;

  const skillGapDetails = gapDetails.map((gap) => ({
    ...gap,
    matched_course_ids: gapCourseMap.get(normalizeSkillName(gap.skill)) ?? [],
  }));

  const pathway: LearningModule[] = selectedCourses.map((course) => ({
    id: course.id,
    title: course.title,
    reasoning: buildReasoning(course, analysis, gapMap),
    estimated_hours: course.estimated_hours,
    difficulty: course.difficulty,
    skills_targeted: course.skills_covered.filter((skill) =>
      analysis.missing_skills.map(normalizeSkillName).includes(normalizeSkillName(skill)),
    ),
    prerequisites: course.prerequisites ?? [],
    grounding: 'catalog',
    stage: pickStage(course),
    outcomes: course.outcomes ?? [],
  }));

  const totalEstimatedHours = pathway.reduce((total, module) => total + module.estimated_hours, 0);
  const topGap = pickTopGap(skillGapDetails);

  return {
    pathway,
    stages: buildStages(pathway),
    skill_gap_details: skillGapDetails,
    gap_summary: {
      role_readiness_score: roleReadinessScore,
      coverage_ratio: Number(coverageRatio.toFixed(2)),
      matched_missing_skills: matchedMissingSkills,
      unmatched_missing_skills: unmatchedMissingSkills,
      total_estimated_hours: totalEstimatedHours,
    },
    roi_metrics: calculateRoi(analysis),
    pathway_overview: buildPathwayOverview(analysis, totalEstimatedHours, matchedMissingSkills),
    mentorship_match: buildMentorRecommendation(analysis, topGap, skillGapDetails),
    sandbox_project: buildSandboxProject(analysis, skillGapDetails, unmatchedMissingSkills),
  };
}
