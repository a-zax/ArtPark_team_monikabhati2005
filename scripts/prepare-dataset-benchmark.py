from __future__ import annotations

import csv
import json
import random
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[1]
DATASETS_ROOT = ROOT / ".datasets" / "kagglehub" / "datasets"
OUTPUT_JSON = ROOT / ".codex-engine-test" / "benchmark-cases.json"

POSITIVE_CATEGORIES = {"INFORMATION-TECHNOLOGY", "ENGINEERING"}
NEGATIVE_CATEGORIES = {
    "ACCOUNTANT",
    "FINANCE",
    "SALES",
    "HR",
    "TEACHER",
    "CHEF",
    "ADVOCATE",
    "HEALTHCARE",
}
TARGET_SAMPLE_SIZE = 24
MINIMUM_SAMPLE_SIZE = 10
BENCHMARK_SKILLS = {
    "HTML",
    "CSS",
    "JavaScript",
    "Responsive Design",
    "React",
    "Component Architecture",
    "State Management",
    "Next.js",
    "SSR",
    "API Integration",
    "Python",
    "Scripting",
    "Data Processing",
    "SQL",
    "Data Analysis",
    "Reporting",
    "Machine Learning",
    "Feature Engineering",
    "Model Evaluation",
    "LLMs",
    "Prompt Engineering",
    "Docker",
    "CI/CD",
    "Deployment",
    "Git",
    "AWS",
    "Cloud Operations",
    "Monitoring",
    "Incident Management",
    "Documentation",
    "Project Coordination",
}


@dataclass(frozen=True)
class SkillRule:
    skill: str
    patterns: tuple[re.Pattern[str], ...]


SKILL_ALIASES: dict[str, tuple[str, ...]] = {
    "HTML": (r"\bhtml5?\b",),
    "CSS": (r"\bcss3?\b", r"\btailwind\b", r"\bsass\b"),
    "JavaScript": (r"\bjavascript\b", r"\bjs\b", r"\bes6\b", r"\becmascript\b"),
    "Responsive Design": (r"responsive (?:design|web)", r"mobile[- ]first"),
    "React": (r"\breact(?:\.js)?\b", r"\breactjs\b"),
    "Component Architecture": (r"component architecture", r"reusable components?"),
    "State Management": (r"state management", r"\bredux\b", r"context api"),
    "Next.js": (r"next\.?js", r"next js"),
    "SSR": (r"\bssr\b", r"server[- ]side rendering"),
    "API Integration": (r"api integration", r"rest(?:ful)? apis?", r"api development"),
    "Python": (r"\bpython\b",),
    "Scripting": (r"\bscripting\b", r"automation scripts?"),
    "Data Processing": (r"data processing", r"\betl\b", r"data pipelines?"),
    "SQL": (r"\bsql\b", r"\bmysql\b", r"\bpostgres(?:ql)?\b", r"\boracle\b"),
    "Excel": (r"\bexcel\b", r"microsoft excel", r"ms excel"),
    "Data Analysis": (r"data analys(?:is|tics)", r"data visualization", r"business intelligence"),
    "Reporting": (r"\breporting\b", r"dashboards?", r"report generation"),
    "Machine Learning": (r"machine learning", r"\bml\b", r"predictive models?"),
    "Feature Engineering": (r"feature engineering",),
    "Model Evaluation": (r"model evaluation", r"model validation", r"cross[- ]validation"),
    "LLMs": (r"\bllms?\b", r"large language models?", r"generative ai"),
    "Prompt Engineering": (r"prompt engineering", r"prompt design"),
    "Docker": (r"\bdocker\b", r"\bcontaineri[sz]ation\b"),
    "CI/CD": (r"ci/cd", r"continuous integration", r"continuous deployment"),
    "Deployment": (r"\bdeployment\b", r"\brelease management\b"),
    "Git": (r"\bgit\b", r"\bgithub\b", r"\bgitlab\b", r"\bbitbucket\b"),
    "AWS": (r"\baws\b", r"amazon web services"),
    "Cloud Operations": (r"cloud operations", r"cloud infrastructure", r"cloud administration"),
    "Monitoring": (r"\bmonitoring\b", r"observability", r"application monitoring"),
    "Incident Management": (r"incident management", r"incident response", r"on[- ]call"),
    "Customer Support": (r"customer support", r"customer service"),
    "Ticketing": (r"ticketing", r"\bzendesk\b", r"\bfreshdesk\b", r"\bjira\b"),
    "Escalation Management": (r"\bescalation\b", r"escalation handling"),
    "SLA Management": (r"\bsla\b", r"service level"),
    "Sales": (r"\bsales\b", r"inside sales", r"outside sales"),
    "Lead Qualification": (r"lead qualification", r"lead generation"),
    "CRM": (r"\bcrm\b", r"\bsalesforce\b", r"\bhubspot\b"),
    "Negotiation": (r"\bnegotiation\b", r"contract negotiation"),
    "Warehouse Operations": (r"warehouse operations", r"\bwarehouse\b"),
    "Inventory Management": (r"inventory management", r"inventory control"),
    "Safety Compliance": (r"safety compliance", r"\bosha\b", r"safety protocols?"),
    "Quality Control": (r"quality control", r"quality assurance", r"\bqa\b"),
    "SOP Compliance": (r"sop compliance", r"standard operating procedures?", r"\bsop\b"),
    "Root Cause Analysis": (r"root cause analysis", r"\brca\b"),
    "Project Coordination": (r"project coordination", r"project management"),
    "Communication": (r"stakeholder communication", r"cross-functional communication", r"client communication"),
    "Documentation": (r"technical documentation", r"documentation", r"process documentation"),
    "Risk Tracking": (r"risk tracking", r"risk register"),
    "Leadership": (r"team leadership", r"\bleadership\b"),
    "Coaching": (r"\bcoaching\b", r"\bmentoring\b"),
    "Feedback": (r"performance feedback", r"peer feedback"),
    "Financial Analysis": (r"financial analysis", r"financial modeling"),
    "Reconciliation": (r"\breconciliation\b", r"account reconciliations?"),
    "Compliance": (r"regulatory compliance", r"\bcompliance\b"),
}


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def read_rows(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8", errors="ignore", newline="") as handle:
        return list(csv.DictReader(handle))


def first_existing_path(*candidates: Path) -> Path:
    for candidate in candidates:
        if candidate.exists():
            return candidate
    tried = "\n".join(f"- {candidate}" for candidate in candidates)
    raise FileNotFoundError(f"Could not find a matching dataset file. Tried:\n{tried}")


RESUME_CSV = first_existing_path(
    DATASETS_ROOT / "snehaanbhawal" / "Resume" / "Resume.csv",
    DATASETS_ROOT / "snehaanbhawal" / "resume-dataset" / "versions" / "1" / "Resume" / "Resume.csv",
)
JOBS_CSV = first_existing_path(
    DATASETS_ROOT / "kshitizregmi" / "job_title_des.csv",
    DATASETS_ROOT / "kshitizregmi" / "jobs-and-job-description" / "versions" / "2" / "job_title_des.csv",
)


def build_skill_rules() -> list[SkillRule]:
    return [
        SkillRule(skill=skill, patterns=tuple(re.compile(pattern, re.IGNORECASE) for pattern in patterns))
        for skill, patterns in SKILL_ALIASES.items()
    ]


SKILL_RULES = build_skill_rules()


def detect_skills(text: str, *, mode: str, category: str | None = None, title: str | None = None) -> list[dict[str, object]]:
    normalized_text = re.sub(r"\s+", " ", text)
    lowered_title = (title or "").lower()
    category_bonus = 0.1 if category in POSITIVE_CATEGORIES and mode == "candidate" else 0.0
    profiles: list[dict[str, object]] = []

    for rule in SKILL_RULES:
        hits = 0
        evidence = None

        for pattern in rule.patterns:
            matches = pattern.findall(normalized_text)
            if matches:
                hits += len(matches)
                evidence = pattern.pattern
                break

        if mode == "required" and title:
            skill_name = rule.skill.lower()
            if skill_name in lowered_title:
                hits += 1
                evidence = evidence or f"title:{skill_name}"

        if hits == 0:
            continue

        level = "advanced" if hits >= 3 else "intermediate" if hits == 2 else "beginner"
        confidence = min(0.95, round(0.38 + hits * 0.17 + category_bonus, 2))

        profiles.append(
            {
                "skill": rule.skill,
                "level": level,
                "confidence": confidence,
                "evidence": evidence,
            }
        )

    profiles.sort(key=lambda item: (-float(item["confidence"]), item["skill"]))
    return profiles


def keep_benchmark_skills(profile: list[dict[str, object]]) -> list[dict[str, object]]:
    return [item for item in profile if str(item["skill"]) in BENCHMARK_SKILLS]


def choose_jobs(rows: Iterable[dict[str, str]]) -> list[dict[str, object]]:
    candidates: list[dict[str, object]] = []

    for row in rows:
        title = (row.get("Job Title") or "").strip()
        description = (row.get("Job Description") or "").strip()
        title_text = title.lower()

        if not any(
            keyword in title_text
            for keyword in (
                "developer",
                "engineer",
                "administrator",
                "machine learning",
                "full stack",
                "backend",
                "devops",
            )
        ):
            continue

        required_profile = keep_benchmark_skills(detect_skills(f"{title}\n{description}", mode="required", title=title))
        required_skills = [item["skill"] for item in required_profile]

        if len(required_skills) < 3:
            continue

        candidates.append(
            {
                "title": title,
                "description": description,
                "required_profile": required_profile,
                "required_skills": required_skills,
            }
        )

    candidates.sort(key=lambda item: (item["title"], -len(item["required_skills"])))
    deduped: list[dict[str, object]] = []
    seen_titles: set[str] = set()

    for item in candidates:
        title = str(item["title"])
        if title in seen_titles:
            continue
        seen_titles.add(title)
        deduped.append(item)

    return deduped


def choose_resumes(
    rows: Iterable[dict[str, str]],
    allowed_categories: set[str],
    *,
    minimum_skills: int,
    maximum_skills: int | None = None,
) -> list[dict[str, object]]:
    selected: list[dict[str, object]] = []

    for row in rows:
        category = (row.get("Category") or "").strip()
        if category not in allowed_categories:
            continue

        resume_id = (row.get("ID") or "").strip()
        text = (row.get("Resume_str") or "").strip()
        candidate_profile = keep_benchmark_skills(detect_skills(text, mode="candidate", category=category))
        candidate_skills = [item["skill"] for item in candidate_profile]

        if len(candidate_skills) < minimum_skills:
            continue
        if maximum_skills is not None and len(candidate_skills) > maximum_skills:
            continue

        selected.append(
            {
                "resume_id": resume_id,
                "category": category,
                "candidate_profile": candidate_profile,
                "candidate_skills": candidate_skills,
            }
        )

    selected.sort(key=lambda item: (item["category"], item["resume_id"]))
    return selected


def build_cases() -> dict[str, object]:
    resumes = read_rows(RESUME_CSV)
    jobs = read_rows(JOBS_CSV)

    tech_jobs = choose_jobs(jobs)
    positive_resumes = choose_resumes(resumes, POSITIVE_CATEGORIES, minimum_skills=2)
    negative_resumes = choose_resumes(resumes, NEGATIVE_CATEGORIES, minimum_skills=0, maximum_skills=1)

    random.seed(7)
    random.shuffle(positive_resumes)
    random.shuffle(negative_resumes)

    actual_sample_size = min(TARGET_SAMPLE_SIZE, len(tech_jobs), len(positive_resumes), len(negative_resumes))
    if actual_sample_size < MINIMUM_SAMPLE_SIZE:
        raise RuntimeError("Not enough benchmark-ready dataset rows were found to produce a meaningful evaluation.")

    selected_positive = positive_resumes[:actual_sample_size]
    selected_negative = negative_resumes[:actual_sample_size]

    cases: list[dict[str, object]] = []

    def add_case(resume: dict[str, object], job: dict[str, object], label: str) -> None:
        candidate_skills = list(resume["candidate_skills"])
        required_skills = list(job["required_skills"])
        missing_skills = [skill for skill in required_skills if skill not in candidate_skills]

        if not missing_skills:
            return

        case_id = f"{label}-{resume['category'].lower()}-{slugify(str(job['title']))}-{resume['resume_id']}"
        cases.append(
            {
                "case_id": case_id,
                "label": label,
                "domain_type": "knowledge",
                "resume_id": resume["resume_id"],
                "resume_category": resume["category"],
                "job_title": job["title"],
                "analysis": {
                    "candidate_profile": resume["candidate_profile"],
                    "required_profile": job["required_profile"],
                    "candidate_skills": candidate_skills,
                    "required_skills": required_skills,
                    "missing_skills": missing_skills,
                },
            }
        )

    for index, resume in enumerate(selected_positive):
        add_case(resume, tech_jobs[index % len(tech_jobs)], "aligned")

    for index, resume in enumerate(selected_negative):
        add_case(resume, tech_jobs[index % len(tech_jobs)], "stress")

    return {
        "dataset_summary": {
            "resume_csv": str(RESUME_CSV),
            "jobs_csv": str(JOBS_CSV),
            "resume_rows": len(resumes),
            "job_rows": len(jobs),
            "positive_categories": sorted(POSITIVE_CATEGORIES),
            "negative_categories": sorted(NEGATIVE_CATEGORIES),
            "usable_tech_jobs": len(tech_jobs),
            "usable_positive_resumes": len(positive_resumes),
            "usable_negative_resumes": len(negative_resumes),
            "actual_sample_size": actual_sample_size,
        },
        "cases": cases,
    }


def main() -> None:
    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    payload = build_cases()
    OUTPUT_JSON.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote benchmark cases to {OUTPUT_JSON}")
    print(json.dumps(payload["dataset_summary"], indent=2))
    print(f"Generated {len(payload['cases'])} benchmark cases.")


if __name__ == "__main__":
    main()
