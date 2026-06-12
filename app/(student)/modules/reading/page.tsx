"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { modules, readingPassages, readingQuiz } from "@/data/content";
import { useUserStore } from "@/lib/store";
import { PageHeader, Card, Button, SectionTitle, Pill } from "@/components/ui";
import { QuizEngine } from "@/components/quiz/quiz-engine";
import { ResourceList } from "@/components/resource-list";
import { ReviewSection } from "@/components/review-section";
import { LevelTabs } from "@/components/level-tabs";
import type { Level } from "@/types";
import { Highlighter } from "lucide-react";

const mod = modules[1];

export default function ReadingPage() {
  const user = useUserStore();
  const { completeModule } = useUserStore();
  const [level, setLevel] = useState<Level>(user.level ?? "beginner");
  const [showQuiz, setShowQuiz] = useState(false);

  const passage = level === "beginner" ? readingPassages.beginner : readingPassages.intermediate;

  function highlightText(text: string, highlights: string[]) {
    let result = text;
    highlights.forEach((h) => {
      result = result.replace(
        new RegExp(`\\b(${h})\\b`, "gi"),
        `<mark class="bg-rose-200/60 px-1 rounded font-bold">$1</mark>`
      );
    });
    return result;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader emoji={mod.emoji} title={`Modul 2 · ${mod.title}`} subtitle={mod.tagline} />
      <LevelTabs level={level} setLevel={setLevel} />

      {!showQuiz ? (
        <>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Highlighter className="text-rose-500" size={20} />
              <SectionTitle>{passage.title}</SectionTitle>
            </div>
            <Pill color="slate" className="mb-4">
              {level === "beginner" ? "🟢 Simplified" : "🔵 Authentic"}
            </Pill>
            <div
              className="text-base leading-relaxed text-slate-700 rounded-2xl bg-slate-50 p-5"
              dangerouslySetInnerHTML={{
                __html: highlightText(passage.text, passage.highlights),
              }}
            />
            <div className="mt-4">
              <p className="text-sm font-bold text-slate-600 mb-2">📝 Kosakata yang disorot:</p>
              <div className="flex flex-wrap gap-2">
                {passage.highlights.map((h) => (
                  <Pill key={h} color="rose">{h}</Pill>
                ))}
              </div>
            </div>
            <Button className="mt-5" onClick={() => setShowQuiz(true)}>
              ❓ Mulai Reading Quiz
            </Button>
          </Card>
        </>
      ) : (
        <QuizEngine
          questions={readingQuiz}
          title="Reading Quiz"
          onFinish={() => completeModule(mod.id)}
        />
      )}

      <ResourceList resources={mod.resources} />
      <ReviewSection moduleId={mod.id} />
    </motion.div>
  );
}
