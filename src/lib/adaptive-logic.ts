import courseCatalog from './course-catalog.json';

export interface GapAnalysis {
  candidate_skills: string[];
  required_skills: string[];
  missing_skills: string[];
}

export interface LearningModule {
  id: string;
  title: string;
  reasoning: string;
  estimated_hours: number;
}

/**
 * Adaptive Pathing Algorithm for Hackathon:
 * 1. Identifies the exact skill gap.
 * 2. Scans the grounded Course Catalog.
 * 3. Builds an optimal sequence of courses covering missing skills.
 */
export function generateAdaptivePathway(analysis: GapAnalysis): LearningModule[] {
  const pathway: LearningModule[] = [];
  const coveredSkills = new Set<string>();

  for (const missingSkill of analysis.missing_skills) {
    if (coveredSkills.has(missingSkill.toLowerCase())) continue;

    const bestCourse = courseCatalog.find(c => 
      c.skills_covered.some(s => s.toLowerCase() === missingSkill.toLowerCase())
    );

    if (bestCourse) {
      if (!pathway.find(p => p.id === bestCourse.id)) {
        pathway.push({
          id: bestCourse.id,
          title: bestCourse.title,
          reasoning: `Recommended to bridge the gap in "${missingSkill}", required by the Job Description but missing from candidate's profile.`,
          estimated_hours: bestCourse.estimated_hours
        });
        
        bestCourse.skills_covered.forEach(s => coveredSkills.add(s.toLowerCase()));
      }
    } else {
      // Fallback for skills without direct mapping
       pathway.push({
          id: `custom_${missingSkill.replace(/\s+/g, '_')}`,
          title: `Custom Module: Fundamentals of ${missingSkill}`,
          reasoning: `Auto-generated module for "${missingSkill}" as it is critical for the role.`,
          estimated_hours: 2
        });
    }
  }

  return pathway;
}
