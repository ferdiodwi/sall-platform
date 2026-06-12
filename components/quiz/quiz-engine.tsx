"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { QuizQuestion } from "@/types";
import { Card, Button, ProgressBar, Pill } from "@/components/ui";
import { useUserStore } from "@/lib/store";
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from "lucide-react";

export function QuizEngine({
  questions,
  xpPerCorrect = 10,
  onFinish,
  title,
}: {
  questions: QuizQuestion[];
  xpPerCorrect?: number;
  onFinish?: (score: number, total: number) => void;
  title?: string;
}) {
  const { addXp, recordAttempt } = useUserStore();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[index];
  const isCorrect = selected === q?.answerIndex;

  function choose(i: number) {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    const correct = i === q.answerIndex;
    if (correct) {
      setScore((s) => s + 1);
      addXp(xpPerCorrect);
    }
    recordAttempt({ topic: q.topic, correct });
  }

  function next() {
    if (index + 1 >= questions.length) {
      setDone(true);
      onFinish?.(score, questions.length);
      return;
    }
    setIndex((n) => n + 1);
    setSelected(null);
    setAnswered(false);
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setDone(false);
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-8 text-center">
          <div className="text-6xl">{pct >= 70 ? "🎉" : "💪"}</div>
          <h3 className="mt-4 text-3xl font-extrabold text-slate-900">
            Selesai!
          </h3>
          <p className="mt-2 text-slate-500">
            Skor kamu:{" "}
            <span className="font-bold text-rose-600">
              {score}/{questions.length}
            </span>{" "}
            ({pct}%)
          </p>
          <p className="mt-1 text-sm font-bold text-emerald-600">
            +{score * xpPerCorrect} XP
          </p>
          <Button className="mt-6" onClick={restart}>
            <RotateCcw size={16} /> Ulangi
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-500">
          {title ? `${title} · ` : ""}Soal {index + 1}/{questions.length}
        </span>
        <Pill color="amber">⭐ {score * xpPerCorrect} XP</Pill>
      </div>
      <ProgressBar
        value={((index + (answered ? 1 : 0)) / questions.length) * 100}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {q.passage && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 ring-1 ring-slate-100">
              📄 <span className="italic">&quot;{q.passage}&quot;</span>
            </div>
          )}

          <h3 className="mt-5 text-lg font-extrabold text-slate-900">
            {q.prompt}
          </h3>

          <div className="mt-4 grid gap-3">
            {q.options.map((opt, i) => {
              const correctOpt = i === q.answerIndex;
              const chosen = i === selected;
              let style =
                "border-slate-200 hover:border-rose-300 hover:bg-rose-50";
              if (answered && correctOpt)
                style = "border-emerald-400 bg-emerald-50";
              else if (answered && chosen && !correctOpt)
                style = "border-red-400 bg-red-50";
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={answered}
                  className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-base font-semibold text-slate-800 transition-all duration-200 ${style}`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold ring-1 ring-slate-200">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                  {answered && correctOpt && (
                    <CheckCircle
                      className="ml-auto text-emerald-500"
                      size={20}
                    />
                  )}
                  {answered && chosen && !correctOpt && (
                    <XCircle className="ml-auto text-red-500" size={20} />
                  )}
                </button>
              );
            })}
          </div>

          {/* IMMEDIATE FEEDBACK PANEL */}
          <AnimatePresence>
            {answered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className={`mt-5 overflow-hidden rounded-2xl border-2 p-4 ${
                  isCorrect
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <p className="text-base font-extrabold">
                  {isCorrect ? "✅ Jawaban Benar!" : "💡 Belum tepat"}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {isCorrect ? q.explanationCorrect : q.explanationWrong}
                </p>
                {!isCorrect && (
                  <p className="mt-2 text-sm text-slate-700">
                    <span className="font-bold">Jawaban benar:</span>{" "}
                    {q.options[q.answerIndex]}
                  </p>
                )}
                {!isCorrect && q.passage && (
                  <p className="mt-1 text-sm text-slate-600">
                    <span className="font-bold">Sumber kalimat:</span> &quot;
                    {q.passage}&quot;
                  </p>
                )}
                {q.relatedVocab && (
                  <p className="mt-2 text-sm text-rose-700">
                    📚 Kosakata terkait: <b>{q.relatedVocab}</b>
                  </p>
                )}
                {!isCorrect && q.reviewActivity && (
                  <p className="mt-2 text-sm text-blue-700">
                    🔁 Saran latihan ulang: <b>{q.reviewActivity}</b>
                  </p>
                )}
                <Button className="mt-4 w-full" onClick={next}>
                  {index + 1 >= questions.length
                    ? "Lihat Hasil"
                    : "Lanjut"}{" "}
                  <ArrowRight size={16} />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </Card>
  );
}
