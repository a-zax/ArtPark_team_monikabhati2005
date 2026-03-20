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

function buildKnownSkillSet(analysis: GapAnalysis) {
  return new Set(analysis.candidate_skills.map(normalizeSkillName));
}

function getRequiredLevel(analysis: GapAnalysis, skill: string): SkillLevel {
  const profile = analysis.required_profile.find(
    (item) => normalizeSkillName(item.skill) === normalizeSkillName(skill),
  );
  return profile?.level ?? 'intermediate';
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

function buildReasoning(course: CatalogCourse, analysis: GapAnalysis): string {
  const targetedSkills = course.skills_covered.filter((skill) =>
    analysis.missing_skills.map(normalizeSkillName).includes(normalizeSkillName(skill)),
  );
  const prerequisiteText =
    course.prerequisites && course.prerequisites.length > 0
      ? `Prerequisites included: ${course.prerequisites.join(', ')}.`
      : 'No prerequisite modules were required ahead of this step.';

  return `Assigned from the grounded catalog to close ${targetedSkills.join(', ')}. Difficulty set to ${course.difficulty} based on the target role expectation. ${prerequisiteText}`;
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
  const readinessPenalty = matchedMissingSkills.length * 8 + unmatchedMissingSkills.length * 18;
  const roleReadinessScore = Math.max(25, 100 - readinessPenalty);
  const coverageRatio =
    analysis.missing_skills.length === 0
      ? 1
      : matchedMissingSkills.length / analysis.missing_skills.length;

  const pathway: LearningModule[] = selectedCourses.map((course) => {
    const skillsTargeted = course.skills_covered.filter((skill) =>
      analysis.missing_skills.map(normalizeSkillName).includes(normalizeSkillName(skill))
    );

    const isPartial = skillsTargeted.some((tgtSkill) => {
      const p = analysis.candidate_profile.find((cp) => normalizeSkillName(cp.skill) === normalizeSkillName(tgtSkill));
      return p && typeof p.confidence === 'number' && p.confidence < 0.5;
    });

    return {
      id: course.id,
      title: isPartial ? `${course.title} (Partial Refresher)` : course.title,
      reasoning: buildReasoning(course, analysis),
      estimated_hours: isPartial ? Math.max(1, Math.round(course.estimated_hours / 2)) : course.estimated_hours,
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
