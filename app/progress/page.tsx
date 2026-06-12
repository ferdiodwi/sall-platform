"use client";

import { motion } from "framer-motion";
import { useUserStore, badges } from "@/lib/store";
import { getAIRecommendation } from "@/lib/ai-engine";
import { modules } from "@/data/content";
import { PageHeader, Card, SectionTitle, ProgressBar, Pill, StatCard } from "@/components/ui";
import { Sparkles } from "lucide-react";

export default function ProgressPage() {
  const user = useUserStore();
  const ai = getAIRecommendation(user.attempts);

  const vocabPct = Math.min(100, Math.round((user.vocabMastered / 20) * 100));
  const modulePct = Math.round((user.modulesCompleted.length / modules.length) * 100);
  const quizAccuracy =
    user.attempts.length > 0
      ? Math.round(
          (user.attempts.filter((a) => a.correct).length / user.attempts.length) * 100
        )
      : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader
        emoji="📈"
        title="Progress Tracker"
        subtitle="Pantau kemajuan belajar Fashion English kamu."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <StatCard label="Total XP" value={user.xp} emoji="⭐" />
        <StatCard label="Streak" value={`${user.streak} hari`} emoji="🔥" />
        <StatCard label="Akurasi Quiz" value={`${quizAccuracy}%`} emoji="🎯" />
        <StatCard label="Total Soal" value={user.attempts.length} emoji="📝" />
      </div>

      {/* Progress bars */}
      <Card className="p-5 mb-6">
        <SectionTitle className="mb-4">📊 Detail Progress</SectionTitle>
        <div className="space-y-5">
          <div>
            <div className="mb-1 flex justify-between text-sm font-bold text-slate-700">
              <span>Penguasaan Kosakata</span>
              <span>{user.vocabMastered}/20 kata ({vocabPct}%)</span>
            </div>
            <ProgressBar value={vocabPct} color="rose" />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm font-bold text-slate-700">
              <span>Penyelesaian Modul</span>
              <span>{user.modulesCompleted.length}/5 ({modulePct}%)</span>
            </div>
            <ProgressBar value={modulePct} color="emerald" />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm font-bold text-slate-700">
              <span>Akurasi Quiz</span>
              <span>{quizAccuracy}%</span>
            </div>
            <ProgressBar value={quizAccuracy} color="blue" />
          </div>
        </div>
      </Card>

      {/* Module completion */}
      <Card className="p-5 mb-6">
        <SectionTitle className="mb-4">📚 Status Modul</SectionTitle>
        <div className="space-y-2">
          {modules.map((m) => {
            const done = user.modulesCompleted.includes(m.id);
            return (
              <div
                key={m.id}
                className={`flex items-center gap-3 rounded-2xl p-3 ${
                  done ? "bg-emerald-50" : "bg-slate-50"
                }`}
              >
                <span className="text-xl">{m.emoji}</span>
                <span className="flex-1 font-bold text-slate-800">
                  Modul {m.number}: {m.title}
                </span>
                <Pill color={done ? "emerald" : "slate"}>
                  {done ? "✅ Selesai" : "⏳ Belum"}
                </Pill>
              </div>
            );
          })}
        </div>
      </Card>

      {/* AI Feedback */}
      <Card className="p-5 mb-6 border-2 border-rose-100">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="text-rose-500" size={20} />
          <SectionTitle>Rekomendasi AI</SectionTitle>
        </div>
        <div className="rounded-2xl bg-rose-50 p-4">
          <p className="text-sm font-bold text-rose-800">💡 {ai.message}</p>
          <p className="mt-2 text-sm text-slate-700">
            Aktivitas: <b>{ai.activity}</b> · ⏱️ ~{ai.estTime} menit
          </p>
        </div>
      </Card>

      {/* Badges */}
      <Card className="p-5">
        <SectionTitle className="mb-4">🏅 Badges Kamu</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {badges.map((b) => {
            const earned = user.badges.includes(b.id);
            return (
              <div
                key={b.id}
                className={`rounded-2xl p-4 text-center transition-all duration-200 ${
                  earned
                    ? "bg-amber-50 ring-2 ring-amber-200"
                    : "bg-slate-50 opacity-40"
                }`}
              >
                <div className="text-3xl">{earned ? b.emoji : "🔒"}</div>
                <p className="mt-2 text-xs font-bold text-slate-800">{b.name}</p>
                <p className="text-[10px] text-slate-500">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
