"use client";

import { useRouter } from "next/navigation";
import { placementQuestions } from "@/data/content";
import { useUserStore } from "@/lib/store";
import { QuizEngine } from "@/components/quiz/quiz-engine";
import { PageHeader, Card, Button } from "@/components/ui";
import { motion } from "framer-motion";

export default function PlacementPage() {
  const router = useRouter();
  const { placementDone, level, completePlacement } = useUserStore();

  function handleFinish(score: number, total: number) {
    const assignedLevel = score >= 6 ? "intermediate" : "beginner";
    completePlacement(assignedLevel, score * 15);
  }

  if (placementDone) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PageHeader
          emoji="🎯"
          title="Placement Quiz"
          subtitle="Tes penempatan level kamu."
        />
        <Card className="p-8 text-center">
          <div className="text-6xl">✅</div>
          <h3 className="mt-4 text-2xl font-extrabold text-slate-900">
            Placement Quiz Selesai!
          </h3>
          <p className="mt-2 text-slate-500">
            Level kamu:{" "}
            <span className="font-bold text-rose-600">
              {level === "beginner" ? "🟢 Beginner" : "🔵 Intermediate"}
            </span>
          </p>
          <Button className="mt-5" onClick={() => router.push("/modules/vocabulary")}>
            🚀 Mulai Belajar
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <PageHeader
        emoji="🎯"
        title="Placement Quiz"
        subtitle="Jawab 10 soal untuk menentukan level belajar kamu. Skor ≥ 6 = Intermediate."
      />
      <QuizEngine
        questions={placementQuestions}
        xpPerCorrect={15}
        title="Placement"
        onFinish={handleFinish}
      />
    </motion.div>
  );
}
