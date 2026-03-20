import courseCatalog from './course-catalog.json';
import laborCatalogData from './labor-catalog.json';
import { CatalogCourse, normalizeSkillName } from './analysis-types';

const knowledgeCatalog = courseCatalog as CatalogCourse[];
const laborCatalog = laborCatalogData as CatalogCourse[];

const KNOWLEDGE_ALIASES: Record<string, string> = {
  'react.js': 'React',
  reactjs: 'React',
  redux: 'State Management',
  'context api': 'State Management',
  'next js': 'Next.js',
  'nextjs': 'Next.js',
  'server side rendering': 'SSR',
  'rest api': 'API Integration',
  'rest apis': 'API Integration',
  'api development': 'API Integration',
  automation: 'Scripting',
  etl: 'Data Processing',
  mysql: 'SQL',
  postgresql: 'SQL',
  postgres: 'SQL',
  oracle: 'SQL',
  dashboards: 'Reporting',
  'business intelligence': 'Data Analysis',
  ai: 'LLMs',
  'generative ai': 'LLMs',
  'large language models': 'LLMs',
  containerization: 'Docker',
  containers: 'Docker',
  'continuous integration': 'CI/CD',
  'continuous deployment': 'CI/CD',
  github: 'Git',
  gitlab: 'Git',
  bitbucket: 'Git',
  'amazon web services': 'AWS',
  observability: 'Monitoring',
  oncall: 'Incident Management',
  'on-call': 'Incident Management',
  'incident response': 'Incident Management',
  'customer service': 'Customer Support',
  zendesk: 'Ticketing',
  freshdesk: 'Ticketing',
  jira: 'Ticketing',
  escalation: 'Escalation Management',
  sla: 'SLA Management',
  salesforce: 'CRM',
  hubspot: 'CRM',
};

const LABOR_ALIASES: Record<string, string> = {
  osha: 'OSHA Standard',
  'hazard recognition': 'Hazard Recognition',
  forklift: 'Forklift Operation',
  machinery: 'Heavy Machinery',
  inspection: 'Inspection',
  defects: 'Defect Tracking',
  inventory: 'Inventory Management',
  rfid: 'RFID Scanning',
  logistics: 'Logistics Software',
  sop: 'SOP Compliance',
  maintenance: 'Maintenance',
  troubleshooting: 'Troubleshooting',
  repair: 'Equipment Repair',
  handoff: 'Shift Handoff',
  hazmat: 'HAZMAT',
  chemicals: 'Chemical Safety',
  ergonomics: 'Ergonomics',
  fatigue: 'Fatigue Management',
  receiving: 'Receiving',
  dispatch: 'Dispatching',
};

export function getActiveCatalog(domainType: string) {
  return domainType === 'labor' ? laborCatalog : knowledgeCatalog;
}

export function getAllowedSkills(domainType: string) {
  return Array.from(
    new Set(getActiveCatalog(domainType).flatMap((course) => course.skills_covered)),
  );
}

function getAliasMap(domainType: string) {
  return domainType === 'labor' ? LABOR_ALIASES : KNOWLEDGE_ALIASES;
}

export function canonicalizeSkillName(skill: string, domainType: string) {
  const allowedSkills = getAllowedSkills(domainType);
  const normalized = normalizeSkillName(skill);

  const exact = allowedSkills.find(
    (allowedSkill) => normalizeSkillName(allowedSkill) === normalized,
  );
  if (exact) return exact;

  const alias = getAliasMap(domainType)[normalized];
  if (!alias) return null;

  return allowedSkills.find(
    (allowedSkill) => normalizeSkillName(allowedSkill) === normalizeSkillName(alias),
  ) ?? null;
}

export function buildSkillVocabularyPrompt(domainType: string) {
  const allowedSkills = getAllowedSkills(domainType);
  return allowedSkills.join(', ');
}
