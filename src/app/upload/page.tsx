"use client";

import { motion, AnimatePresence } from "framer-motion";
import FileUploadZone from "@/components/ui/FileUploadZone";
import RoadmapVisualizer from "@/components/ui/RoadmapVisualizer";
import { useState } from "react";
import { ArrowRight, FileCheck2, Loader2 } from "lucide-react";
import AICrystal from "@/components/ui/AICrystal";

export default function UploadPage() {
  const [resume, setResume] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!resume || !jdText) return;
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("jd", jdText);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      if(json.success) {
        setResult(json.data);
        setTimeout(() => {
          document.getElementById('roadmap-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full pt-4 relative">
      <AICrystal />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Initialize <span className="text-gradient">Analysis</span></h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">Provide the candidate&apos;s resume and target job description. Our engine will synthesize skill gaps and formulate an optimized curriculum.</p>
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
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm shadow-[0_0_10px_rgba(59,130,246,0.3)]">1</span> 
              Candidate Resume
            </h2>
            {resume && <FileCheck2 className="w-5 h-5 text-green-400 animate-in-fade" />}
          </div>
          <FileUploadZone 
            accept=".pdf,.docx,.txt" 
            onFileSelect={(file) => setResume(file)} 
            selectedFile={resume}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/20 border border-accent/30 text-accent text-sm shadow-[0_0_10px_rgba(139,92,246,0.3)]">2</span> 
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
             <><Loader2 className="w-6 h-6 animate-spin" /> Abstracting & Generating...</>
          ) : (
             <>Formulate Pathway <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" /></>
          )}
        </button>
      </motion.div>

      <div id="roadmap-section">
        <AnimatePresence>
          {result && (
            <RoadmapVisualizer 
               pathway={result.pathway} 
               analysis={result.analysis} 
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
