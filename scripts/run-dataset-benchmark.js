const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const benchmarkDir = path.join(rootDir, '.codex-engine-test');
const runtimeDir = path.join(benchmarkDir, 'runtime');
const casesPath = path.join(benchmarkDir, 'benchmark-cases.json');
const reportJsonPath = path.join(benchmarkDir, 'benchmark-report.json');
const reportMdPath = path.join(benchmarkDir, 'benchmark-report.md');

function runOrFail(command, args, label) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: false,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}`);
  }
}

function average(values) {
  if (values.length === 0) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

function round2(value) {
  return Number(value.toFixed(2));
}

function summarizeGroup(items) {
  const unmatchedDenominator = items.reduce(
    (sum, item) => sum + Math.max(1, item.result.gap_summary.matched_missing_skills.length + item.result.gap_summary.unmatched_missing_skills.length),
    0,
  );
  const unmatchedCount = items.reduce(
    (sum, item) => sum + item.result.gap_summary.unmatched_missing_skills.length,
    0,
  );

  return {
    count: items.length,
    avg_readiness: average(items.map((item) => item.result.gap_summary.role_readiness_score)),
    avg_coverage: average(items.map((item) => item.result.gap_summary.coverage_ratio)),
    avg_hours_saved: average(items.map((item) => item.result.roi_metrics.total_hours_saved)),
    avg_modules_recommended: average(items.map((item) => item.result.pathway.length)),
    pathway_hit_rate: average(items.map((item) => (item.result.pathway.length > 0 ? 1 : 0))),
    unmatched_gap_rate: round2(unmatchedCount / unmatchedDenominator),
    catalog_grounding_rate: average(
      items.map((item) => (item.result.pathway.every((module) => module.grounding === 'catalog') ? 1 : 0)),
    ),
  };
}

function buildMarkdownReport(report) {
  const lines = [];
  lines.push('# Dataset Benchmark Report');
  lines.push('');
  lines.push('## Summary');
  lines.push(`- Total benchmark cases: ${report.summary.total_cases}`);
  lines.push(`- Aligned cases: ${report.summary.aligned_cases}`);
  lines.push(`- Stress cases: ${report.summary.stress_cases}`);
  lines.push(`- Readiness delta (aligned - stress): ${report.summary.readiness_delta}`);
  lines.push(`- Coverage delta (aligned - stress): ${report.summary.coverage_delta}`);
  lines.push(`- Catalog grounding rate: ${report.summary.catalog_grounding_rate}`);
  lines.push('');
  lines.push('## Dataset Usability');
  lines.push(`- Resume rows: ${report.dataset_summary.resume_rows}`);
  lines.push(`- Job rows: ${report.dataset_summary.job_rows}`);
  lines.push(`- Usable tech jobs: ${report.dataset_summary.usable_tech_jobs}`);
  lines.push(`- Usable positive resumes: ${report.dataset_summary.usable_positive_resumes}`);
  lines.push(`- Usable negative resumes: ${report.dataset_summary.usable_negative_resumes}`);
  lines.push('');
  lines.push('## Metrics By Group');
  for (const [label, metrics] of Object.entries(report.groups)) {
    lines.push(`### ${label}`);
    lines.push(`- Count: ${metrics.count}`);
    lines.push(`- Average readiness: ${metrics.avg_readiness}`);
    lines.push(`- Average coverage: ${metrics.avg_coverage}`);
    lines.push(`- Average modules recommended: ${metrics.avg_modules_recommended}`);
    lines.push(`- Average hours saved: ${metrics.avg_hours_saved}`);
    lines.push(`- Pathway hit rate: ${metrics.pathway_hit_rate}`);
    lines.push(`- Unmatched gap rate: ${metrics.unmatched_gap_rate}`);
    lines.push(`- Catalog grounding rate: ${metrics.catalog_grounding_rate}`);
  }
  lines.push('');
  lines.push('## Example Cases');
  report.examples.forEach((example) => {
    lines.push(`### ${example.case_id}`);
    lines.push(`- Label: ${example.label}`);
    lines.push(`- Resume category: ${example.resume_category}`);
    lines.push(`- Job title: ${example.job_title}`);
    lines.push(`- Readiness: ${example.readiness}`);
    lines.push(`- Coverage: ${example.coverage}`);
    lines.push(`- Missing skills: ${example.missing_skills.join(', ') || 'None'}`);
    lines.push(`- Unmatched gaps: ${example.unmatched_missing_skills.join(', ') || 'None'}`);
    lines.push(`- Modules: ${example.modules.join(', ') || 'None'}`);
  });
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main() {
  runOrFail('python', ['scripts/prepare-dataset-benchmark.py'], 'Dataset preparation');

  const tscCommand = process.execPath;
  const tscScript = path.join(rootDir, 'node_modules', 'typescript', 'lib', 'tsc.js');
  runOrFail(
    tscCommand,
    [
      tscScript,
      'src/lib/analysis-types.ts',
      'src/lib/adaptive-logic.ts',
      '--resolveJsonModule',
      '--esModuleInterop',
      '--module',
      'commonjs',
      '--target',
      'es2020',
      '--moduleResolution',
      'node',
      '--skipLibCheck',
      '--outDir',
      '.codex-engine-test/runtime',
    ],
    'Engine compilation',
  );

  const payload = JSON.parse(fs.readFileSync(casesPath, 'utf8'));
  const { generateAdaptivePathway } = require(path.join(runtimeDir, 'adaptive-logic.js'));

  const evaluatedCases = payload.cases.map((testCase) => {
    const result = generateAdaptivePathway(testCase.analysis, testCase.domain_type);
    return {
      ...testCase,
      result,
    };
  });

  const alignedCases = evaluatedCases.filter((item) => item.label === 'aligned');
  const stressCases = evaluatedCases.filter((item) => item.label === 'stress');
  const alignedSummary = summarizeGroup(alignedCases);
  const stressSummary = summarizeGroup(stressCases);

  const report = {
    generated_at: new Date().toISOString(),
    dataset_summary: payload.dataset_summary,
    summary: {
      total_cases: evaluatedCases.length,
      aligned_cases: alignedCases.length,
      stress_cases: stressCases.length,
      readiness_delta: round2(alignedSummary.avg_readiness - stressSummary.avg_readiness),
      coverage_delta: round2(alignedSummary.avg_coverage - stressSummary.avg_coverage),
      catalog_grounding_rate: average(
        evaluatedCases.map((item) => (item.result.pathway.every((module) => module.grounding === 'catalog') ? 1 : 0)),
      ),
    },
    groups: {
      aligned: alignedSummary,
      stress: stressSummary,
    },
    examples: evaluatedCases.slice(0, 6).map((item) => ({
      case_id: item.case_id,
      label: item.label,
      resume_category: item.resume_category,
      job_title: item.job_title,
      readiness: item.result.gap_summary.role_readiness_score,
      coverage: item.result.gap_summary.coverage_ratio,
      missing_skills: item.analysis.missing_skills,
      unmatched_missing_skills: item.result.gap_summary.unmatched_missing_skills,
      modules: item.result.pathway.map((module) => module.id),
    })),
  };

  fs.mkdirSync(benchmarkDir, { recursive: true });
  fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(reportMdPath, buildMarkdownReport(report));

  console.log(`Benchmark report written to ${reportJsonPath}`);
  console.log(JSON.stringify(report.summary, null, 2));
}

main();
