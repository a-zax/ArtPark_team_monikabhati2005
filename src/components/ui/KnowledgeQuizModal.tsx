"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  answer: number;
}

interface QuizModalProps {
  skill: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function KnowledgeQuizModal({ skill, isOpen, onClose }: QuizModalProps) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill })
      });
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // Fetch when opened
  if (isOpen && questions.length === 0 && !loading && !showResults) {
    fetchQuiz();
  }

  const handleAnswer = (index: number) => {
    setSelectedOpt(index);
    setTimeout(() => {
      if (index === questions[currentQ].answer) {
        setScore(s => s + 1);
      }
      setSelectedOpt(null);
      if (currentQ < questions.length - 1) {
         setCurrentQ(q => q + 1);
      } else {
         setShowResults(true);
      }
    }, 1000);
  };

  const handleClose = () => {
     setQuestions([]);
     setCurrentQ(0);
     setScore(0);
     setShowResults(false);
     setSelectedOpt(null);
     onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden"
          >
            <button onClick={handleClose} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Generating Micro-Assessment</h3>
                <p className="text-slate-400 text-sm text-center">Llama 3.3 is creating a custom evaluation for {skill}...</p>
              </div>
            ) : showResults ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                {score === questions.length ? (
                   <CheckCircle2 className="w-16 h-16 text-green-400 mb-4" />
                ) : (
                   <AlertCircle className="w-16 h-16 text-amber-400 mb-4" />
                )}
                <h3 className="text-2xl font-extrabold text-white mb-2">Assessment Complete</h3>
                <p className="text-slate-300 mb-6">You scored <span className="font-bold text-primary">{score}</span> out of {questions.length} on {skill}.</p>
                <button onClick={handleClose} className="bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-blue-600 transition-colors">
                  Continue Pathway
                </button>
              </div>
            ) : questions.length > 0 ? (
              <div className="flex flex-col py-4">
                <div className="flex items-center justify-between mb-6">
                   <span className="text-xs font-bold tracking-wider text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">{skill}</span>
                   <span className="text-xs font-bold text-slate-400">Question {currentQ + 1} of {questions.length}</span>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-8 leading-relaxed">
                  {questions[currentQ].question}
                </h3>
                
                <div className="space-y-3">
                  {questions[currentQ].options.map((opt, i) => {
                    const isSelected = selectedOpt === i;
                    const isCorrect = i === questions[currentQ].answer;
                    
                    let bgClass = "bg-slate-800/50 hover:bg-slate-800 border-white/5";
                    if (selectedOpt !== null) {
                       if (isCorrect) bgClass = "bg-green-500/20 border-green-500/50 text-green-300";
                       else if (isSelected) bgClass = "bg-red-500/20 border-red-500/50 text-red-300";
                       else bgClass = "opacity-50 pointer-events-none";
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        disabled={selectedOpt !== null}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${bgClass}`}
                      >
                        <span className="font-medium">{opt}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">Failed to load quiz.</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
