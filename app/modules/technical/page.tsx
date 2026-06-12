"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { modules, readingQuiz } from "@/data/content";
import { useUserStore } from "@/lib/store";
import { PageHeader, Card, Button, SectionTitle, Pill } from "@/components/ui";
import { QuizEngine } from "@/components/quiz/quiz-engine";
import { ResourceList } from "@/components/resource-list";
import { ReviewSection } from "@/components/review-section";
import { LevelTabs } from "@/components/level-tabs";
import type { Level } from "@/types";
import { CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

const mod = modules[4];

const sewingSteps = [
  { step: 1, en: "Gather your materials: fabric, thread, needle, pins, scissors.", id: "Siapkan bahan: kain, benang, jarum, peniti, gunting." },
  { step: 2, en: "Place the fabric pieces together with the right sides facing.", id: "Letakkan potongan kain bersama dengan sisi kanan berhadapan." },
  { step: 3, en: "Pin the edges to hold the fabric in place.", id: "Sematkan peniti di pinggiran untuk menahan kain." },
  { step: 4, en: "Thread the needle and tie a knot at the end.", id: "Masukkan benang ke jarum dan ikat simpul di ujungnya." },
  { step: 5, en: "Sew along the seam line with even stitches.", id: "Jahit sepanjang garis jahitan dengan tusukan yang rata." },
  { step: 6, en: "Remove the pins carefully as you sew.", id: "Lepaskan peniti dengan hati-hati sambil menjahit." },
  { step: 7, en: "Tie off the thread and cut the excess.", id: "Ikat benang dan potong sisanya." },
  { step: 8, en: "Press the seam open with an iron.", id: "Tekan jahitan terbuka dengan setrika." },
];

export default function TechnicalPage() {
  const user = useUserStore();
  const { completeModule } = useUserStore();
  const [level, setLevel] = useState<Level>(user.level ?? "beginner");
  const [showQuiz, setShowQuiz] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  function toggleStep(step: number) {
    setExpandedStep(expandedStep === step ? null : step);
  }

  function markComplete(step: number) {
    setCompletedSteps((prev) => new Set([...prev, step]));
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader emoji={mod.emoji} title={`Modul 5 · ${mod.title}`} subtitle={mod.tagline} />
      <LevelTabs level={level} setLevel={setLevel} />

      {!showQuiz ? (
        <>
          <Card className="p-5">
            <SectionTitle className="mb-4">🪡 Sewing a Straight Seam — Step by Step</SectionTitle>
            <Pill color="slate" className="mb-4">
              {completedSteps.size}/{sewingSteps.length} langkah selesai
            </Pill>
            <div className="space-y-2">
              {sewingSteps.map((s) => {
                const isCompleted = completedSteps.has(s.step);
                const isExpanded = expandedStep === s.step;
                return (
                  <div
                    key={s.step}
                    className={`rounded-2xl border-2 transition-all duration-200 ${
                      isCompleted
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-slate-200 hover:border-rose-200"
                    }`}
                  >
                    <button
                      onClick={() => toggleStep(s.step)}
                      className="flex w-full items-center gap-3 p-4 text-left"
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          isCompleted
                            ? "bg-emerald-500 text-white"
                            : "bg-rose-100 text-rose-600"
                        }`}
                      >
                        {isCompleted ? <CheckCircle size={16} /> : s.step}
                      </span>
                      <span className="flex-1 font-bold text-slate-800">
                        {s.en}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={18} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={18} className="text-slate-400" />
                      )}
                    </button>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="border-t border-slate-100 px-4 pb-4 pt-3"
                      >
                        <p className="text-sm text-slate-600 mb-3">
                          🇮🇩 <b>Terjemahan:</b> {s.id}
                        </p>
                        {!isCompleted && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => markComplete(s.step)}
                          >
                            <CheckCircle size={14} /> Tandai Selesai
                          </Button>
                        )}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Button className="mt-5" onClick={() => setShowQuiz(true)}>
            ❓ Mulai Technical Quiz
          </Button>
        </>
      ) : (
        <QuizEngine
          questions={readingQuiz.filter((q) => q.topic === "Technical" || q.topic === "Reading")}
          title="Technical Quiz"
          onFinish={() => completeModule(mod.id)}
        />
      )}

      <ResourceList resources={mod.resources} />
      <ReviewSection moduleId={mod.id} />
    </motion.div>
  );
}
