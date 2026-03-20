# Submission Checklist

Use this before final submission.

## A. Public GitHub Repository

- [x] Source code present and runnable
- [x] README present with setup instructions
- [x] README includes dependencies and tech stack
- [x] README explains skill-gap analysis at a high level
- [x] Dockerfile included
- [x] Benchmark scripts included for reproducibility

Key files:

- [README.md](./README.md)
- [Dockerfile](./Dockerfile)
- [package.json](./package.json)
- [scripts/prepare-dataset-benchmark.py](./scripts/prepare-dataset-benchmark.py)
- [scripts/run-dataset-benchmark.js](./scripts/run-dataset-benchmark.js)

## B. Video Demonstration

- [x] Demo structure documented
- [x] 2-3 minute script prepared
- [x] End-to-end user flow covered
- [x] Adaptation behavior explicitly called out

Key file:

- [DEMO_VIDEO_SCRIPT.md](./DEMO_VIDEO_SCRIPT.md)

## C. Technical Presentation

- [x] 5-slide content prepared
- [x] Solution overview covered
- [x] Architecture and workflow covered
- [x] Tech stack and model transparency covered
- [x] Algorithms and adaptive logic covered
- [x] Datasets and metrics covered

Key file:

- [PRESENTATION_5_SLIDE_DECK.md](./PRESENTATION_5_SLIDE_DECK.md)

## Data & Model Compliance

- [x] Public datasets cited
- [x] External model usage disclosed
- [x] Original adaptive logic clearly described as custom
- [x] Benchmark outputs generated locally from public data

## Evaluation Criteria Coverage

- [x] Technical sophistication: structured analysis plus adaptive pathing
- [x] Grounding and reliability: catalog-only modules and unmatched-gap handling
- [x] Reasoning trace: exposed in roadmap UI
- [x] Product impact: readiness and ROI metrics
- [x] User experience: animated interface, radar, quiz, timeline, export
- [x] Cross-domain scalability: knowledge and labor catalogs
- [x] Communication and documentation: README, teammate guide, demo script, deck outline

## Final Pre-Submission Run

- [ ] `npm install`
- [ ] `npm run lint`
- [ ] `npm run dev`
- [ ] `npm run benchmark:datasets`
- [ ] `docker build -t cognisync-ai .`
