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
  linux: 'Linux',
  'distributed systems': 'Distributed Systems',
  microservices: 'Distributed Systems',
  'microservices architecture': 'Distributed Systems',
  concurrency: 'Concurrency Control',
  'concurrency control': 'Concurrency Control',
  multithreading: 'Concurrency Control',
  'multi-threading': 'Concurrency Control',
  mutex: 'Concurrency Control',
  semaphores: 'Concurrency Control',
  locks: 'Concurrency Control',
  'race conditions': 'Concurrency Control',
  optimization: 'Performance Optimization',
  'performance tuning': 'Performance Optimization',
  'modern c++': 'Modern C++',
  'c++17': 'Modern C++',
  'c++20': 'Modern C++',
  'low latency': 'Low-Latency Systems',
  'low-latency': 'Low-Latency Systems',
  'ultra-low-latency': 'Low-Latency Systems',
  hft: 'HFT Infrastructure',
  'high-frequency trading': 'HFT Infrastructure',
  'computer architecture': 'Computer Architecture',
  'cpu caches': 'CPU Caches',
  numa: 'NUMA',
  'branch prediction': 'Branch Prediction',
  'simd/avx': 'SIMD/AVX',
  simd: 'SIMD/AVX',
  avx: 'SIMD/AVX',
  'memory models': 'Memory Models',
  'memory ordering': 'Memory Models',
  'lock-free programming': 'Lock-Free Programming',
  'wait-free data structures': 'Lock-Free Programming',
  'atomic operations': 'Lock-Free Programming',
  'tcp/ip': 'TCP/IP Networking',
  'tcp/ip networking': 'TCP/IP Networking',
  'linux network stack': 'Linux Network Stack',
  'linux performance tools': 'Linux Performance',
  perf: 'Linux Performance',
  flamegraphs: 'Linux Performance',
  vtune: 'Linux Performance',
  valgrind: 'Linux Performance',
  strace: 'Linux Performance',
  'kernel bypass': 'Kernel Bypass Networking',
  'kernel-bypass': 'Kernel Bypass Networking',
  openonload: 'Kernel Bypass Networking',
  solarflare: 'Kernel Bypass Networking',
  exablaze: 'Kernel Bypass Networking',
  dpdk: 'DPDK',
  rdma: 'RDMA',
  oms: 'Order Management Systems',
  'order management system': 'Order Management Systems',
  'order management systems': 'Order Management Systems',
  'market data handler': 'Market Data Handlers',
  'market data handlers': 'Market Data Handlers',
  fix: 'FIX',
  itch: 'ITCH',
  ouch: 'OUCH',
  sbe: 'SBE',
  'co-location': 'Co-Location Infrastructure',
  'co location': 'Co-Location Infrastructure',
  'market microstructure': 'Quantitative Finance',
  'quantitative finance': 'Quantitative Finance',
  'execution algorithms': 'Quantitative Finance',
  'alpha signals': 'Quantitative Finance',
  fpga: 'FPGA Trading Pipelines',
  'fpga-assisted trading pipelines': 'FPGA Trading Pipelines',
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
