"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveCatalog = getActiveCatalog;
exports.getAllowedSkills = getAllowedSkills;
exports.canonicalizeSkillName = canonicalizeSkillName;
exports.buildSkillVocabularyPrompt = buildSkillVocabularyPrompt;
const course_catalog_json_1 = __importDefault(require("./course-catalog.json"));
const labor_catalog_json_1 = __importDefault(require("./labor-catalog.json"));
const analysis_types_1 = require("./analysis-types");
const knowledgeCatalog = course_catalog_json_1.default;
const laborCatalog = labor_catalog_json_1.default;
const KNOWLEDGE_ALIASES = {
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
const LABOR_ALIASES = {
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
function getActiveCatalog(domainType) {
    return domainType === 'labor' ? laborCatalog : knowledgeCatalog;
}
function getAllowedSkills(domainType) {
    return Array.from(new Set(getActiveCatalog(domainType).flatMap((course) => course.skills_covered)));
}
function getAliasMap(domainType) {
    return domainType === 'labor' ? LABOR_ALIASES : KNOWLEDGE_ALIASES;
}
function canonicalizeSkillName(skill, domainType) {
    const allowedSkills = getAllowedSkills(domainType);
    const normalized = (0, analysis_types_1.normalizeSkillName)(skill);
    const exact = allowedSkills.find((allowedSkill) => (0, analysis_types_1.normalizeSkillName)(allowedSkill) === normalized);
    if (exact)
        return exact;
    const alias = getAliasMap(domainType)[normalized];
    if (!alias)
        return null;
    return allowedSkills.find((allowedSkill) => (0, analysis_types_1.normalizeSkillName)(allowedSkill) === (0, analysis_types_1.normalizeSkillName)(alias)) ?? null;
}
function buildSkillVocabularyPrompt(domainType) {
    const allowedSkills = getAllowedSkills(domainType);
    return allowedSkills.join(', ');
}
