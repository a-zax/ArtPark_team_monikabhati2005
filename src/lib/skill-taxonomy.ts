import { RoleTrack, SKILL_LEVEL_WEIGHT, SkillLevel, SkillProfile, normalizeSkillName } from '@/lib/analysis-types';

type SkillDefinition = {
  canonical: string;
  aliases: string[];
  role_tracks: RoleTrack[];
};

type SkillSignal = {
  skill: string;
  level: SkillLevel;
  years?: number;
  evidence?: string;
  confidence: number;
};

const ADVANCED_HINTS = ['advanced', 'expert', 'architect', 'lead', 'own', 'deep expertise'];
const BEGINNER_HINTS = ['basic', 'exposure', 'familiarity', 'introductory', 'working knowledge'];
const INTERMEDIATE_HINTS = ['hands-on', 'solid', 'practical', 'experience with', 'proficient'];

export const SKILL_TAXONOMY: SkillDefinition[] = [
  { canonical: 'React', aliases: ['react', 'react.js'], role_tracks: ['engineering'] },
  { canonical: 'Next.js', aliases: ['next.js', 'nextjs'], role_tracks: ['engineering'] },
  { canonical: 'JavaScript', aliases: ['javascript', 'js'], role_tracks: ['engineering'] },
  { canonical: 'TypeScript', aliases: ['typescript', 'ts'], role_tracks: ['engineering'] },
  { canonical: 'Node.js', aliases: ['node.js', 'nodejs', 'node'], role_tracks: ['engineering'] },
  { canonical: 'API Integration', aliases: ['rest api', 'apis', 'api integration', 'graphql'], role_tracks: ['engineering', 'analytics', 'support'] },
  { canonical: 'Git', aliases: ['git', 'github', 'gitlab'], role_tracks: ['engineering', 'analytics', 'operations'] },
  { canonical: 'Testing', aliases: ['testing', 'unit testing', 'integration testing', 'qa'], role_tracks: ['engineering', 'operations'] },
  { canonical: 'Docker', aliases: ['docker', 'containerization', 'containers'], role_tracks: ['engineering', 'operations'] },
  { canonical: 'CI/CD', aliases: ['ci/cd', 'ci cd', 'continuous integration', 'continuous delivery'], role_tracks: ['engineering', 'operations'] },
  { canonical: 'AWS', aliases: ['aws', 'amazon web services'], role_tracks: ['engineering', 'operations'] },
  { canonical: 'Monitoring', aliases: ['monitoring', 'observability', 'alerts'], role_tracks: ['engineering', 'operations', 'support'] },
  { canonical: 'Python', aliases: ['python'], role_tracks: ['engineering', 'analytics', 'operations'] },
  { canonical: 'SQL', aliases: ['sql', 'mysql', 'postgresql', 'postgres'], role_tracks: ['analytics', 'engineering', 'finance'] },
  { canonical: 'Excel', aliases: ['excel', 'spreadsheets'], role_tracks: ['analytics', 'finance', 'operations'] },
  { canonical: 'Data Analysis', aliases: ['data analysis', 'analytics', 'analysis'], role_tracks: ['analytics', 'finance', 'operations'] },
  { canonical: 'Reporting', aliases: ['reporting', 'report creation', 'dashboards'], role_tracks: ['analytics', 'finance', 'operations'] },
  { canonical: 'Power BI', aliases: ['power bi', 'powerbi'], role_tracks: ['analytics', 'finance'] },
  { canonical: 'Machine Learning', aliases: ['machine learning', 'ml models', 'model training'], role_tracks: ['engineering', 'analytics'] },
  { canonical: 'Feature Engineering', aliases: ['feature engineering'], role_tracks: ['analytics', 'engineering'] },
  { canonical: 'Model Evaluation', aliases: ['model evaluation', 'evaluation metrics'], role_tracks: ['analytics', 'engineering'] },
  { canonical: 'LLMs', aliases: ['llm', 'llms', 'large language models'], role_tracks: ['engineering', 'analytics', 'support'] },
  { canonical: 'Prompt Engineering', aliases: ['prompt engineering', 'prompt design'], role_tracks: ['engineering', 'analytics', 'support'] },
  { canonical: 'Customer Support', aliases: ['customer support', 'customer service'], role_tracks: ['support'] },
  { canonical: 'Ticketing', aliases: ['ticketing', 'zendesk', 'freshdesk', 'service desk'], role_tracks: ['support'] },
  { canonical: 'Escalation Management', aliases: ['escalation management', 'escalations'], role_tracks: ['support', 'operations'] },
  { canonical: 'SLA Management', aliases: ['sla', 'service level agreement', 'sla management'], role_tracks: ['support', 'operations'] },
  { canonical: 'Sales', aliases: ['sales', 'selling'], role_tracks: ['sales'] },
  { canonical: 'Lead Qualification', aliases: ['lead qualification', 'lead scoring'], role_tracks: ['sales'] },
  { canonical: 'CRM', aliases: ['crm', 'hubspot', 'salesforce'], role_tracks: ['sales', 'support'] },
  { canonical: 'Negotiation', aliases: ['negotiation', 'closing deals'], role_tracks: ['sales'] },
  { canonical: 'Warehouse Operations', aliases: ['warehouse operations', 'warehouse'], role_tracks: ['operations'] },
  { canonical: 'Inventory Management', aliases: ['inventory management', 'inventory control'], role_tracks: ['operations'] },
  { canonical: 'Safety Compliance', aliases: ['safety compliance', 'safety'], role_tracks: ['operations'] },
  { canonical: 'Quality Control', aliases: ['quality control', 'quality assurance'], role_tracks: ['operations'] },
  { canonical: 'SOP Compliance', aliases: ['sop compliance', 'standard operating procedure', 'sops'], role_tracks: ['operations'] },
  { canonical: 'Root Cause Analysis', aliases: ['root cause analysis', 'rca'], role_tracks: ['operations', 'support'] },
  { canonical: 'Project Coordination', aliases: ['project coordination', 'project management', 'coordination'], role_tracks: ['operations', 'engineering', 'finance'] },
  { canonical: 'Documentation', aliases: ['documentation', 'technical writing'], role_tracks: ['engineering', 'operations', 'support'] },
  { canonical: 'Communication', aliases: ['communication', 'stakeholder communication'], role_tracks: ['operations', 'support', 'sales', 'finance'] },
  { canonical: 'Risk Tracking', aliases: ['risk tracking', 'risk management'], role_tracks: ['operations', 'finance'] },
  { canonical: 'Leadership', aliases: ['leadership', 'team management', 'people management'], role_tracks: ['operations', 'engineering', 'sales', 'support'] },
  { canonical: 'Coaching', aliases: ['coaching', 'mentoring'], role_tracks: ['operations', 'engineering', 'sales', 'support'] },
  { canonical: 'Financial Analysis', aliases: ['financial analysis', 'financial modelling', 'finance analysis'], role_tracks: ['finance'] },
  { canonical: 'Reconciliation', aliases: ['reconciliation', 'account reconciliation'], role_tracks: ['finance'] },
  { canonical: 'Compliance', aliases: ['compliance', 'regulatory compliance'], role_tracks: ['finance', 'operations'] },
];

const aliasMap = new Map<string, SkillDefinition>();
for (const definition of SKILL_TAXONOMY) {
  aliasMap.set(normalizeSkillName(definition.canonical), definition);
  for (const alias of definition.aliases) {
    aliasMap.set(normalizeSkillName(alias), definition);
  }
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function captureSnippet(text: string, index: number) {
  const start = Math.max(0, index - 90);
  const end = Math.min(text.length, index + 90);
  return text
    .slice(start, end)
    .replace(/\s+/g, ' ')
    .trim();
}

function inferYears(snippet: string): number | undefined {
  const yearsMatch = snippet.match(/(\d+)\+?\s*(?:years?|yrs?)/i);
  if (!yearsMatch) {
    return undefined;
  }

  const years = Number(yearsMatch[1]);
  return Number.isNaN(years) ? undefined : years;
}

function inferLevelFromContext(snippet: string, source: 'resume' | 'jd', years?: number): SkillLevel {
  const normalized = normalizeSkillName(snippet);
  if (ADVANCED_HINTS.some((hint) => normalized.includes(hint))) {
    return 'advanced';
  }
  if (BEGINNER_HINTS.some((hint) => normalized.includes(hint))) {
    return 'beginner';
  }
  if (years !== undefined) {
    if (years >= 4) return 'advanced';
    if (years >= 2) return 'intermediate';
    return 'beginner';
  }
  if (source === 'jd' && INTERMEDIATE_HINTS.some((hint) => normalized.includes(hint))) {
    return 'intermediate';
  }
  return source === 'resume' ? 'intermediate' : 'beginner';
}

function strongestLevel(current: SkillLevel | undefined, next: SkillLevel): SkillLevel {
  if (!current) return next;
  return SKILL_LEVEL_WEIGHT[next] > SKILL_LEVEL_WEIGHT[current] ? next : current;
}

function roleTrackFromSignals(signals: SkillSignal[], fallbackText: string): RoleTrack {
  const counts = new Map<RoleTrack, number>();

  for (const signal of signals) {
    const definition = getSkillDefinition(signal.skill);
    for (const track of definition?.role_tracks ?? []) {
      counts.set(track, (counts.get(track) ?? 0) + 1);
    }
  }

  if (counts.size > 0) {
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0];
  }

  const lowered = normalizeSkillName(fallbackText);
  if (lowered.includes('warehouse') || lowered.includes('operations')) return 'operations';
  if (lowered.includes('support') || lowered.includes('customer')) return 'support';
  if (lowered.includes('finance') || lowered.includes('accounting')) return 'finance';
  if (lowered.includes('sales')) return 'sales';
  if (lowered.includes('analyst') || lowered.includes('dashboard')) return 'analytics';
  if (lowered.includes('engineer') || lowered.includes('developer')) return 'engineering';

  return 'general';
}

export function getSkillDefinition(skill: string): SkillDefinition | undefined {
  return aliasMap.get(normalizeSkillName(skill));
}

export function canonicalizeSkill(skill: string): string {
  return getSkillDefinition(skill)?.canonical ?? skill.trim();
}

export function extractSkillSignals(text: string, source: 'resume' | 'jd'): SkillSignal[] {
  const found = new Map<string, SkillSignal>();

  for (const definition of SKILL_TAXONOMY) {
    for (const alias of definition.aliases) {
      const matcher = new RegExp(`(?<![a-z0-9])${escapeRegex(alias)}(?![a-z0-9])`, 'gi');
      const match = matcher.exec(text);
      if (!match || match.index === undefined) {
        continue;
      }

      const snippet = captureSnippet(text, match.index);
      const years = inferYears(snippet);
      const level = inferLevelFromContext(snippet, source, years);
      const confidence = years !== undefined ? 0.92 : source === 'jd' ? 0.82 : 0.76;
      const existing = found.get(definition.canonical);

      found.set(definition.canonical, {
        skill: definition.canonical,
        level: strongestLevel(existing?.level, level),
        years: existing?.years ?? years,
        evidence: existing?.evidence ?? snippet,
        confidence: Math.max(existing?.confidence ?? 0, confidence),
      });

      break;
    }
  }

  return [...found.values()].sort((a, b) => a.skill.localeCompare(b.skill));
}

export function normalizeProfile(profile: SkillProfile[]): SkillProfile[] {
  const normalized = new Map<string, SkillProfile>();

  for (const item of profile) {
    const canonical = canonicalizeSkill(item.skill);
    const existing = normalized.get(normalizeSkillName(canonical));

    normalized.set(normalizeSkillName(canonical), {
      skill: canonical,
      level: strongestLevel(existing?.level, item.level),
      years: existing?.years ?? item.years,
      evidence: existing?.evidence ?? item.evidence,
      confidence: Math.max(existing?.confidence ?? 0, item.confidence ?? 0),
    });
  }

  return [...normalized.values()].sort((a, b) => a.skill.localeCompare(b.skill));
}

export function inferRoleTrackFromProfiles(requiredProfile: SkillProfile[], fallbackText: string): RoleTrack {
  return roleTrackFromSignals(
    requiredProfile.map((item) => ({
      skill: item.skill,
      level: item.level,
      years: item.years,
      evidence: item.evidence,
      confidence: item.confidence ?? 0.5,
    })),
    fallbackText,
  );
}
