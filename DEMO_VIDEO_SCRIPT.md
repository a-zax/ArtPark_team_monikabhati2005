# Demo Video Script

Use this for the required 2-3 minute hackathon demo.

## Target duration

- `2:15` to `2:45`

## Demo structure

### 1. Problem and hook - `0:00` to `0:20`

Say:

> Corporate onboarding is usually static. Experienced hires waste time, while beginners get overloaded. CogniSync AI fixes that by turning a resume and job description into a grounded, role-specific onboarding roadmap.

Show:

- landing page
- hero section
- one quick scroll over the value proposition

### 2. Upload flow - `0:20` to `0:45`

Say:

> The user uploads a resume, pastes a target job description, and selects the role domain. Our backend validates the file, extracts text, sanitizes it, and sends it for structured skill analysis.

Show:

- `/upload` page
- upload a resume
- paste the JD
- highlight the domain toggle
- click the analyze button

### 3. AI analysis output - `0:45` to `1:15`

Say:

> The model returns candidate and required skill profiles with inferred proficiency. We normalize that output, compute the real skill gap, and pass it into our original adaptive pathing engine.

Show:

- candidate profile card
- required profile card
- missing skills summary
- confidence bars and proficiency levels

### 4. Personalized roadmap - `1:15` to `1:50`

Say:

> The roadmap is fully grounded in our verified catalog. We never invent fake modules. If a skill is outside the catalog, we flag it as an unmatched gap instead of hallucinating content.

Show:

- roadmap timeline
- reasoning trace
- readiness score
- ROI card
- standard vs personalized toggle

### 5. UX differentiators - `1:50` to `2:20`

Say:

> To make the output practical and easy to act on, we visualize competency gaps with a radar chart, generate module-level knowledge checks, and export the sequence as a calendar plan.

Show:

- skill radar
- quiz modal
- ICS export button

### 6. Close - `2:20` to `2:40`

Say:

> We also benchmarked the engine against public Kaggle resume and job-description datasets. The benchmark confirms full catalog grounding and a measurable readiness advantage for aligned technical candidate-role pairs.

Show:

- benchmark report snippet from `.codex-engine-test/benchmark-report.md`
- final roadmap screen

## Recording tips

- Use one polished resume/JD pair that produces a clean roadmap.
- Open the app once before recording so the first-load compile delay is already gone.
- If time is tight, show the quiz opening without answering every question.
