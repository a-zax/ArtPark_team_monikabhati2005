"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { AlertCircle, ArrowRight, FileCheck2, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

import FileUploadZone from "@/components/ui/FileUploadZone";
import { GapAnalysis, PathwayResult } from "@/lib/analysis-types";

const AICrystal = dynamic(() => import("@/components/ui/AICrystal"), { ssr: false });
const RoadmapVisualizer = dynamic(() => import("@/components/ui/RoadmapVisualizer"), { ssr: false });

type AnalyzeResponse = {
  analysis: GapAnalysis;
} & PathwayResult;

export default function UploadPage() {
  const [resume, setResume] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const handleGenerate = async () => {
    if (!resume || !jdText) return;

    setError(null);
    setIsLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("jd", jdText);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Analysis failed. Please try again.");
        return;
      }

      if (json.success) {
        setResult(json.data as AnalyzeResponse);
      } else {
        setError("The analysis service returned an unexpected response.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error while generating the pathway.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full pt-4 relative">
      <AICrystal />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Initialize <span className="text-gradient">Analysis</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Upload a resume, paste the role description, and we will extract proficiency levels, detect grounded skill gaps,
          and build a catalog-backed onboarding sequence.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                1
              </span>
              Candidate Resume
            </h2>
            {resume && <FileCheck2 className="w-5 h-5 text-green-400 animate-in-fade" />}
          </div>
          <FileUploadZone accept=".pdf,.docx,.txt" onFileSelect={setResume} selectedFile={resume} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/20 border border-accent/30 text-accent text-sm shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                2
              </span>
              Job Description
            </h2>
            {jdText.length > 50 && <FileCheck2 className="w-5 h-5 text-green-400 animate-in-fade" />}
          </div>
          <div className="p-1 glass-panel rounded-2xl h-[300px] border-slate-700 hover:border-slate-500 transition-colors focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the target job description requirements here..."
              className="w-full h-full bg-transparent border-none resize-none px-6 py-5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-0 rounded-2xl leading-relaxed"
            />
          </div>
        </motion.div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 max-w-3xl mx-auto glass-panel rounded-2xl border border-red-500/20 px-5 py-4 flex items-start gap-3 text-red-300"
        >
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm leading-relaxed">{error}</p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-14 flex justify-center"
      >
        <button
          onClick={handleGenerate}
          disabled={!resume || jdText.length < 50 || isLoading}
          className="group flex items-center gap-3 bg-white text-black disabled:bg-slate-800 disabled:text-slate-500 px-10 py-4 rounded-full font-extrabold text-lg transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(255,255,255,0.2)] disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" /> Analyzing profile...
            </>
          ) : (
            <>
              Formulate Pathway <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </>
          )}
        </button>
      </motion.div>

      <div id="roadmap-section" className="scroll-mt-32">
        <AnimatePresence>
          {result && (
            <RoadmapVisualizer
              pathway={result.pathway}
              analysis={result.analysis}
              gap_summary={result.gap_summary}
              roi_metrics={result.roi_metrics}
              mentorship_match={result.mentorship_match}
              sandbox_project={result.sandbox_project}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
