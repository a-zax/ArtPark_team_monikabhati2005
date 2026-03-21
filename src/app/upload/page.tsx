'use client';

import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { startTransition, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  FileCheck2,
  Info,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import FileUploadZone from '@/components/ui/FileUploadZone';
import { AnalysisMeta, GapAnalysis, PathwayResult } from '@/lib/analysis-types';
import { demoScenarios } from '@/lib/demo-scenarios';

const AICrystal = dynamic(() => import('@/components/ui/AICrystal'), { ssr: false });
const RoadmapVisualizer = dynamic(() => import('@/components/ui/RoadmapVisualizer'), {
  ssr: false,
});

type AnalyzeResponse = {
  analysis: GapAnalysis;
} & PathwayResult;

function getModeLabel(meta: AnalysisMeta | null) {
  if (!meta) {
    return null;
  }

  if (meta.analysis_mode === 'hybrid') {
    return 'Hybrid parsing';
  }

  if (meta.analysis_mode === 'heuristic') {
    return 'Deterministic parsing';
  }

  return 'Demo fallback';
}

export default function UploadPage() {
  const [resume, setResume] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [meta, setMeta] = useState<AnalysisMeta | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const hasResumeInput = Boolean(resume || resumeText.trim().length >= 80);
  const canAnalyze = hasResumeInput && jdText.trim().length >= 80 && !isLoading;
  const modeLabel = getModeLabel(meta);
  const headerNote = meta && modeLabel ? `${modeLabel} | ${meta.role_track} track` : null;

  const handleResumeFileSelect = (file: File | null) => {
    setResume(file);
    if (file) {
      setResumeText('');
    }
    setActiveScenarioId(null);
  };

  const handleResumeTextChange = (value: string) => {
    setResumeText(value);
    if (value.trim()) {
      setResume(null);
    }
    setActiveScenarioId(null);
  };

  const handleJdTextChange = (value: string) => {
    setJdText(value);
    setActiveScenarioId(null);
  };

  const handleGenerate = async () => {
    if (!canAnalyze) {
      return;
    }

    setError(null);
    setIsLoading(true);
    setResult(null);
    setMeta(null);

    const formData = new FormData();
    if (resume) {
      formData.append('resume', resume);
    }
    if (resumeText.trim()) {
      formData.append('resumeText', resumeText.trim());
    }
    formData.append('jd', jdText.trim());

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();
      if (!response.ok) {
        setError(typeof json.error === 'string' ? json.error : 'Analysis failed. Please try again.');
        return;
      }

      if (json.success) {
        startTransition(() => {
          setResult(json.data as AnalyzeResponse);
          setMeta((json.meta ?? null) as AnalysisMeta | null);
        });
        return;
      }

      setError('The analysis service returned an unexpected response.');
    } catch (requestError) {
      console.error(requestError);
      setError('Network error while generating the pathway.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadScenario = (scenarioId: string) => {
    const scenario = demoScenarios.find((item) => item.id === scenarioId);
    if (!scenario) {
      return;
    }

    setResume(null);
    setResumeText(scenario.resumeText);
    setJdText(scenario.jdText);
    setActiveScenarioId(scenario.id);
    setError(null);
    setResult(null);
    setMeta(null);
  };

  return (
    <div className="relative mx-auto w-full max-w-6xl pt-4">
      <AICrystal />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mb-12 max-w-4xl text-center"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
          <Sparkles className="h-4 w-4" />
          Adaptive onboarding studio
        </div>
        <h1 className="mb-4 text-4xl font-extrabold md:text-5xl">
          Build a <span className="text-gradient">grounded ramp-up plan</span> for every new hire
        </h1>
        <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-300">
          Upload a resume or paste the candidate profile, add the target job description, and
          generate a role-aware learning roadmap that only recommends catalog-backed training.
        </p>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="glass-panel panel-outline mb-10 rounded-[28px] p-6"
      >
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-2xl border border-accent/25 bg-accent/10 p-2 text-accent">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Demo presets for the 2-minute walkthrough</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">
              Use a preset when you want to show quick adaptation during judging, then switch back
              to real uploads for the live evaluation flow.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {demoScenarios.map((scenario) => {
            const isActive = activeScenarioId === scenario.id;

            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => loadScenario(scenario.id)}
                className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                  isActive
                    ? 'border-primary/40 bg-primary/10'
                    : 'border-white/8 bg-white/5 hover:border-white/15 hover:bg-white/8'
                }`}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {scenario.roleTrack}
                </p>
                <h3 className="mt-2 text-lg font-bold text-white">{scenario.label}</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Loads a realistic resume and JD pair to show adaptive pathing.
                </p>
              </button>
            );
          })}
        </div>
      </motion.section>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <motion.section
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel panel-outline rounded-[28px] p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-3 text-xl font-bold text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-sm text-primary">
                  1
                </span>
                Candidate Material
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Preferred for judging: upload the resume file. For quick demos, you can also paste
                resume text.
              </p>
            </div>
            {hasResumeInput && <FileCheck2 className="h-5 w-5 text-emerald-400" />}
          </div>

          <FileUploadZone
            accept=".pdf,.docx,.txt"
            onFileSelect={handleResumeFileSelect}
            selectedFile={resume}
          />

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-4">
            <label htmlFor="resumeText" className="mb-2 block text-sm font-semibold text-slate-200">
              Or paste resume text
            </label>
            <textarea
              id="resumeText"
              value={resumeText}
              onChange={(event) => handleResumeTextChange(event.target.value)}
              placeholder="Paste a raw resume or candidate summary here when you do not want to upload a file."
              className="h-44 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4 text-slate-200 placeholder:text-slate-500 focus:border-primary/40 focus:outline-none"
            />
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.18 }}
          className="glass-panel panel-outline rounded-[28px] p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-3 text-xl font-bold text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-sm text-accent">
                  2
                </span>
                Target Job Description
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Include core responsibilities, tools, collaboration expectations, and required
                experience depth.
              </p>
            </div>
            {jdText.trim().length >= 80 && <FileCheck2 className="h-5 w-5 text-emerald-400" />}
          </div>

          <textarea
            value={jdText}
            onChange={(event) => handleJdTextChange(event.target.value)}
            placeholder="Paste the target job description requirements here..."
            className="h-[392px] w-full resize-none rounded-[24px] border border-white/10 bg-slate-950/45 px-5 py-5 text-slate-200 placeholder:text-slate-500 focus:border-accent/40 focus:outline-none"
          />
        </motion.section>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-8 flex max-w-4xl items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-200"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm leading-relaxed">{error}</p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26 }}
        className="mt-10 flex flex-col items-center gap-4"
      >
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canAnalyze}
          className="group inline-flex items-center gap-3 rounded-full bg-white px-10 py-4 text-lg font-extrabold text-slate-950 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating pathway...
            </>
          ) : (
            <>
              Formulate Pathway
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
        <p className="max-w-2xl text-center text-sm text-slate-400">
          The engine is grounded to the internal course catalog. Unmatched gaps are surfaced for
          manual review instead of being hallucinated.
        </p>
      </motion.div>

      <div id="roadmap-section" className="scroll-mt-32">
        <AnimatePresence>
          {result && meta && (
            <RoadmapVisualizer
              pathway={result.pathway}
              stages={result.stages}
              skill_gap_details={result.skill_gap_details}
              pathway_overview={result.pathway_overview}
              analysis={result.analysis}
              gap_summary={result.gap_summary}
              roi_metrics={result.roi_metrics}
              mentorship_match={result.mentorship_match}
              sandbox_project={result.sandbox_project}
              meta={meta}
            />
          )}
        </AnimatePresence>
      </div>

      {headerNote && (
        <div className="mx-auto mt-6 flex max-w-4xl items-center justify-center gap-2 text-sm text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>{headerNote}</span>
        </div>
      )}
    </div>
  );
}
