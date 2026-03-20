"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SKILL_LEVEL_WEIGHT = void 0;
exports.normalizeSkillName = normalizeSkillName;
exports.SKILL_LEVEL_WEIGHT = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
};
function normalizeSkillName(skill) {
    return skill.trim().toLowerCase();
}
