import courseCatalog from './course-catalog.json';
import laborCatalogData from './labor-catalog.json';
import {
  CatalogCourse,
  GapAnalysis,
  LearningModule,
  PathwayResult,
  SKILL_LEVEL_WEIGHT,
  SkillLevel,
  normalizeSkillName,
} from './analysis-types';

const knowledgeCatalog = courseCatalog as CatalogCourse[];
const laborCatalog = laborCatalogData as CatalogCourse[];
const TRAINER_RATE_USD = 85;
const LOW_CONFIDENCE_THRESHOLD = 0.5;
const STALE_SKILL_THRESHOLD = 0.5;

function buildKnownSkillSet(analysis: GapAnalysis) {
  return new Set(
    analysis.candidate_profile
      .filter((item) => {
        const confidenceOk = typeof item.confidence !== 'number' || item.confidence >= LOW_CONFIDENCE_THRESHOLD;
        const decayOk = typeof item.decay_score !== 'number' || item.decay_score >= STALE_SKILL_THRESHOLD;
        return confidenceOk && decayOk;
      })
      .map((item) => normalizeSkillName(item.skill)),
  );
}

function getCandidateSignal(analysis: GapAnalysis, skill: string) {
  return analysis.candidate_profile.find(
    (item) => normalizeSkillName(item.skill) === normalizeSkillName(skill),
  );
}

function isLowConfidenceSkill(analysis: GapAnalysis, skill: string) {
  const profile = getCandidateSignal(analysis, skill);
  return typeof profile?.confidence === 'number' && profile.confidence < LOW_CONFIDENCE_THRESHOLD;
}

function isStaleSkill(analysis: GapAnalysis, skill: string) {
  const profile = getCandidateSignal(analysis, skill);
  return Boolean(profile?.is_stale || (typeof profile?.decay_score === 'number' && profile.decay_score < STALE_SKILL_THRESHOLD));
}

function getRequiredLevel(analysis: GapAnalysis, skill: string): SkillLevel {
  const profile = analysis.required_profile.find(
    (item) => normalizeSkillName(item.skill) === normalizeSkillName(skill),
  );
  return profile?.level ?? 'intermediate';
}

function getRequiredWeight(analysis: GapAnalysis, skill: string) {
  return SKILL_LEVEL_WEIGHT[getRequiredLevel(analysis, skill)];
}

function scoreCourse(course: CatalogCourse, skill: string, analysis: GapAnalysis): number {
  const normalizedSkill = normalizeSkillName(skill);
  const exactMatch = course.skills_covered.some((coveredSkill) => normalizeSkillName(coveredSkill) === normalizedSkill);
  const requiredLevel = SKILL_LEVEL_WEIGHT[getRequiredLevel(analysis, skill)];
  const difficultyLevel = SKILL_LEVEL_WEIGHT[course.difficulty];
  const levelDistance = Math.abs(requiredLevel - difficultyLevel);
  const breadthBonus = Math.min(course.skills_covered.length, 4);

  return (exactMatch ? 100 : 0) + breadthBonus - levelDistance * 5;
}

function resolveCoursePath(courseId: string, selectedIds: Set<string>, activeCatalog: CatalogCourse[]) {
  const course = activeCatalog.find((item) => item.id === courseId);
  if (!course) return;

  for (const prereq of course.prerequisites ?? []) {
    resolveCoursePath(prereq, selectedIds, activeCatalog);
  }

  selectedIds.add(courseId);
}

function mapCourses(analysis: GapAnalysis, activeCatalog: CatalogCourse[]) {
  const selectedIds = new Set<string>();
  const matchedMissingSkills = new Set<string>();
  const unmatchedMissingSkills: string[] = [];

  for (const skill of analysis.missing_skills) {
    const candidates = activeCatalog
      .filter((course) =>
        course.skills_covered.some((coveredSkill) => normalizeSkillName(coveredSkill) === normalizeSkillName(skill)),
      )
      .sort((a, b) => scoreCourse(b, skill, analysis) - scoreCourse(a, skill, analysis));

    const bestCourse = candidates[0];
    if (!bestCourse) {
      unmatchedMissingSkills.push(skill);
      continue;
    }

    matchedMissingSkills.add(skill);
    resolveCoursePath(bestCourse.id, selectedIds, activeCatalog);
  }

  return {
    matchedMissingSkills: Array.from(matchedMissingSkills),
    unmatchedMissingSkills,
    selectedCourses: activeCatalog.filter((course) => selectedIds.has(course.id)),
  };
}

function buildReasoning(course: CatalogCourse, analysis: GapAnalysis, refreshType: 'full' | 'partial-confidence' | 'partial-stale') {
  const targetedSkills = course.skills_covered.filter((skill) =>
    analysis.missing_skills.map(normalizeSkillName).includes(normalizeSkillName(skill)),
  );
  const prerequisiteText =
    course.prerequisites && course.prerequisites.length > 0
      ? `Prerequisites included: ${course.prerequisites.join(', ')}.`
      : 'No prerequisite modules were required ahead of this step.';

  const refreshText =
    refreshType === 'partial-confidence'
      ? 'Confidence-weighted detection suggests the skill is present but not strong enough for a full skip, so a partial refresher is recommended.'
      : refreshType === 'partial-stale'
        ? 'The skill appears on the resume but may be stale based on last-used recency, so a refresher is recommended instead of a full exemption.'
        : 'The role gap requires full module coverage.';

  return `Assigned from the grounded catalog to close ${targetedSkills.join(', ')}. Difficulty set to ${course.difficulty} based on the target role expectation. ${refreshText} ${prerequisiteText}`;
}

function calculateRoi(analysis: GapAnalysis, activeCatalog: CatalogCourse[]) {
  const knownSkills = buildKnownSkillSet(analysis);
  let bypassedHours = 0;
  let bypassedModules = 0;

  for (const course of activeCatalog) {
    const covered = course.skills_covered;
    const knownCoverage = covered.filter((skill) => knownSkills.has(normalizeSkillName(skill))).length;
    if (knownCoverage === 0) continue;

    const coverageRatio = knownCoverage / covered.length;
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

function pickTopGap(analysis: GapAnalysis) {
  return (
    analysis.required_profile
      .filter((item) => analysis.missing_skills.map(normalizeSkillName).includes(normalizeSkillName(item.skill)))
      .sort((a, b) => SKILL_LEVEL_WEIGHT[b.level] - SKILL_LEVEL_WEIGHT[a.level])[0]?.skill ??
    analysis.missing_skills[0] ??
    'role-specific onboarding'
  );
}

export function generateAdaptivePathway(analysis: GapAnalysis, domainType: string = 'knowledge'): PathwayResult {
  const activeCatalog = domainType === 'labor' ? laborCatalog : knowledgeCatalog;
  const { matchedMissingSkills, unmatchedMissingSkills, selectedCourses } = mapCourses(analysis, activeCatalog);
  const weightedMatchedPenalty = matchedMissingSkills.reduce((sum, skill) => {
    const lowConfidencePenalty = isLowConfidenceSkill(analysis, skill) ? 4 : 0;
    const stalePenalty = isStaleSkill(analysis, skill) ? 6 : 0;
    return sum + lowConfidencePenalty + stalePenalty;
  }, 0);
  const weightedUnmatchedPenalty = unmatchedMissingSkills.reduce(
    (sum, skill) => sum + getRequiredWeight(analysis, skill) * 10,
    0,
  );
  const baseMissingPenalty = analysis.missing_skills.reduce(
    (sum, skill) => sum + getRequiredWeight(analysis, skill) * 6,
    0,
  );
  const roleReadinessScore = Math.max(20, 100 - baseMissingPenalty - weightedMatchedPenalty - weightedUnmatchedPenalty);
  const coverageRatio =
    analysis.missing_skills.length === 0
      ? 1
      : matchedMissingSkills.length / analysis.missing_skills.length;

  const pathway: LearningModule[] = selectedCourses.map((course) => {
    const skillsTargeted = course.skills_covered.filter((skill) =>
      analysis.missing_skills.map(normalizeSkillName).includes(normalizeSkillName(skill))
    );

    const lowConfidenceRefresh = skillsTargeted.some((tgtSkill) => isLowConfidenceSkill(analysis, tgtSkill));
    const staleRefresh = skillsTargeted.some((tgtSkill) => isStaleSkill(analysis, tgtSkill));
    const isPartial = lowConfidenceRefresh || staleRefresh;
    const refreshType: 'full' | 'partial-confidence' | 'partial-stale' =
      lowConfidenceRefresh ? 'partial-confidence' : staleRefresh ? 'partial-stale' : 'full';
    const partialTitleSuffix =
      refreshType === 'partial-confidence'
        ? ' (Confidence Refresh)'
        : refreshType === 'partial-stale'
          ? ' (Decay Refresh)'
          : '';

    return {
      id: course.id,
      title: isPartial ? `${course.title}${partialTitleSuffix}` : course.title,
      reasoning: buildReasoning(course, analysis, refreshType),
      estimated_hours:
        refreshType === 'partial-confidence'
          ? Math.max(1, Math.round(course.estimated_hours * 0.6))
          : refreshType === 'partial-stale'
            ? Math.max(1, Math.round(course.estimated_hours * 0.5))
            : course.estimated_hours,
      difficulty: course.difficulty,
      skills_targeted: skillsTargeted,
      prerequisites: course.prerequisites ?? [],
      grounding: 'catalog',
      is_partial: isPartial,
    };
  });

  const topGap = pickTopGap(analysis);
  const sandboxSkills = matchedMissingSkills.slice(0, 3);
  const sandboxFocus = sandboxSkills.length > 0 ? sandboxSkills.join(', ') : topGap;
  const mentorRoleBase = getRequiredLevel(analysis, topGap);
  const mentorTitle =
    mentorRoleBase === 'advanced'
      ? 'Principal Mentor'
      : mentorRoleBase === 'intermediate'
        ? 'Senior Mentor'
        : 'Onboarding Coach';

  return {
    pathway,
    catalog: activeCatalog,
    gap_summary: {
      role_readiness_score: roleReadinessScore,
      coverage_ratio: Number(coverageRatio.toFixed(2)),
      matched_missing_skills: matchedMissingSkills,
      unmatched_missing_skills: unmatchedMissingSkills,
    },
    roi_metrics: calculateRoi(analysis, activeCatalog),
    mentorship_match: {
      name: mentorRoleBase === 'advanced' ? 'Avery Rao' : mentorRoleBase === 'intermediate' ? 'Jordan Kim' : 'Samira Patel',
      role: `${mentorTitle} for ${topGap}`,
      reason: `Assigned because ${topGap} is the highest-priority remaining competency gap and needs guided ramp-up before independent delivery.`,
    },
    sandbox_project: {
      title: `Guided onboarding project for ${sandboxFocus}`,
      description:
        unmatchedMissingSkills.length > 0
          ? `The initial sandbox focuses on catalog-covered gaps in ${sandboxFocus}, while unmatched requirements (${unmatchedMissingSkills.join(', ')}) are flagged for mentor-led calibration rather than hallucinated modules.`
          : `The sandbox converts the identified gaps in ${sandboxFocus} into a practical assignment so the learner demonstrates competency, not just course completion.`,
    },
  };
}
