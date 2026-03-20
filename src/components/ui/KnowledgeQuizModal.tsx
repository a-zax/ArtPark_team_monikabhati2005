"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Question {
  question: string;
  options: string[];
  answer: number;
}

interface QuizModalProps {
  skill: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (score: number) => void;
}

export default function KnowledgeQuizModal({
  skill,
  isOpen,
  onClose,
  onComplete,
}: QuizModalProps) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuestions([]);
      setCurrentIndex(0);
      setScore(0);
      setShowResults(false);
      setSelectedOption(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchQuiz() {
      setLoading(true);
      try {
        const response = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skill }),
        });

        const data = await response.json();
        if (!cancelled && Array.isArray(data.questions)) {
          setQuestions(data.questions);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchQuiz();
    return () => {
      cancelled = true;
    };
  }, [isOpen, skill]);

  const handleClose = (finalScore?: number) => {
    if (typeof finalScore === "number" && onComplete) {
      onComplete(finalScore);
    }
    onClose();
  };

  const handleAnswer = (index: number) => {
    setSelectedOption(index);

    window.setTimeout(() => {
      const isCorrect = index === questions[currentIndex].answer;
      const nextScore = isCorrect ? score + 1 : score;

      if (isCorrect) {
        setScore(nextScore);
      }

      setSelectedOption(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((current) => current + 1);
        return;
      }

      setScore(nextScore);
      setShowResults(true);
    }, 850);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            onClick={() => handleClose()}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            className="relative w-full max-w-xl overflow-hidden rounded-[28px] border border-white/10 bg-slate-950 p-6 shadow-2xl md:p-8"
          >
            <button
              type="button"
              onClick={() => handleClose()}
              className="absolute right-5 top-5 text-slate-400 transition-colors hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
                <h3 className="text-xl font-bold text-white">Preparing the micro-assessment</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Building three quick checks for {skill} so the mentor can validate understanding.
                </p>
              </div>
            ) : showResults ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                {score === questions.length ? (
                  <CheckCircle2 className="mb-4 h-16 w-16 text-green-400" />
                ) : (
                  <AlertCircle className="mb-4 h-16 w-16 text-amber-300" />
                )}
                <h3 className="text-2xl font-extrabold text-white">Assessment complete</h3>
                <p className="mt-3 text-slate-300">
                  You scored <span className="font-bold text-primary">{score}</span> out of {questions.length} on {skill}.
                </p>
                <div className="mt-5 rounded-2xl border border-white/8 bg-white/5 p-4 text-sm leading-relaxed text-slate-300">
                  {score === 3
                    ? "Strong signal. This topic can probably move faster in the onboarding plan."
                    : score === 2
                      ? "Solid baseline. A focused review plus sandbox practice should be enough."
                      : "The gap is still material. Keep the full learning step before assigning independent work."}
                </div>
                <button
                  type="button"
                  onClick={() => handleClose(score)}
                  className="mt-6 rounded-full bg-primary px-8 py-3 font-bold text-slate-950 transition-colors hover:bg-sky-300"
                >
                  Continue
                </button>
              </div>
            ) : questions.length > 0 ? (
              <div className="py-3">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    {skill}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                </div>

                <h3 className="mb-7 text-xl font-semibold leading-relaxed text-white">
                  {questions[currentIndex].question}
                </h3>

                <div className="space-y-3">
                  {questions[currentIndex].options.map((option, index) => {
                    const isSelected = selectedOption === index;
                    const isCorrect = index === questions[currentIndex].answer;

                    let classes = "border-white/8 bg-white/5 hover:bg-white/8";
                    if (selectedOption !== null) {
                      if (isCorrect) {
                        classes = "border-green-400/40 bg-green-500/15 text-green-100";
                      } else if (isSelected) {
                        classes = "border-red-400/35 bg-red-500/15 text-red-100";
                      } else {
                        classes = "border-white/5 bg-white/[0.03] text-slate-500";
                      }
                    }

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleAnswer(index)}
                        disabled={selectedOption !== null}
                        className={`w-full rounded-2xl border px-4 py-4 text-left text-sm font-medium transition-colors ${classes}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-14 text-center text-slate-400">
                The quiz could not be loaded right now.
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
