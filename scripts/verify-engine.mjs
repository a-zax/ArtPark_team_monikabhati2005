import assert from 'node:assert/strict';

import { generateAdaptivePathway } from '../src/lib/adaptive-logic.ts';
import { buildHeuristicAnalysis } from '../src/lib/analysis-engine.ts';
import { demoScenarios } from '../src/lib/demo-scenarios.ts';

function runScenario(label, resumeText, jdText, verify) {
  const { analysis, warnings } = buildHeuristicAnalysis(resumeText, jdText);
  const pathway = generateAdaptivePathway(analysis);
  verify({ analysis, pathway, warnings });

  return {
    label,
    missingSkills: analysis.missing_skills,
    modules: pathway.pathway.map((step) => step.id),
    readiness: pathway.gap_summary.role_readiness_score,
  };
}

const summaries = [];

summaries.push(
  runScenario(
    'Frontend engineer adaptation',
    demoScenarios[0].resumeText,
    demoScenarios[0].jdText,
    ({ analysis, pathway }) => {
      assert(analysis.missing_skills.includes('Next.js'), 'Expected Next.js to be identified as a gap.');
      assert(pathway.pathway.some((step) => step.id === 'nextjs_app_router'), 'Expected Next.js module in pathway.');
      assert(pathway.gap_summary.coverage_ratio > 0.5, 'Expected most gaps to be grounded.');
    },
  ),
);

summaries.push(
  runScenario(
    'Support lead adaptation',
    demoScenarios[1].resumeText,
    demoScenarios[1].jdText,
    ({ analysis, pathway }) => {
      assert(analysis.missing_skills.includes('Escalation Management'), 'Expected escalations to remain a gap.');
      assert(
        pathway.pathway.some((step) => step.id === 'support_escalations'),
        'Expected support escalations module in pathway.',
      );
      assert(pathway.skill_gap_details.length >= 2, 'Expected multiple support gaps to be identified.');
    },
  ),
);

summaries.push(
  runScenario(
    'No-gap profile',
    `Priya Rao
Senior Analyst
- 5 years of SQL, Excel, data analysis, reporting, and Power BI delivery.
- Built dashboards and recurring business review reporting.`,
    `We are hiring a Senior Analyst with strong SQL, Excel, data analysis, reporting, and Power BI skills. Candidates should be comfortable building dashboards and presenting findings.`,
    ({ analysis, pathway }) => {
      assert.equal(analysis.missing_skills.length, 0, 'Expected no gaps for the matched analyst profile.');
      assert.equal(pathway.pathway.length, 0, 'Expected no modules when the candidate already meets the requirements.');
      assert.equal(pathway.gap_summary.total_estimated_hours, 0, 'Expected zero training hours for no-gap scenario.');
    },
  ),
);

console.log('Verification passed for adaptive engine scenarios:\n');
for (const summary of summaries) {
  console.log(`- ${summary.label}`);
  console.log(`  Missing skills: ${summary.missingSkills.join(', ') || 'None'}`);
  console.log(`  Modules: ${summary.modules.join(', ') || 'None'}`);
  console.log(`  Role readiness: ${summary.readiness}%`);
}
