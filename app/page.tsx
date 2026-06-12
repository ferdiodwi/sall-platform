"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useUserStore } from "@/lib/store";
import { useReviewStore } from "@/lib/store";
import { getAIRecommendation } from "@/lib/ai-engine";
import { modules, leaderboardSeed, menuItems, badges } from "@/data/content";
import {
  Card,
  Button,
  ProgressBar,
  Pill,
  SectionTitle,
  StatCard,
} from "@/components/ui";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const moduleHref = ["vocabulary", "reading", "label", "catalogue", "technical"];

export default function HomePage() {
  const user = useUserStore();
  const { reviews } = useReviewStore();
  const ai = getAIRecommendation(user.attempts);

  const vocabMasteryPct = Math.min(
    100,
    Math.round((user.vocabMastered / 20) * 100)
  );
  const modulePct = Math.round(
    (user.modulesCompleted.length / modules.length) * 100
  );

  const board = [
    ...leaderboardSeed,
    { name: user.name, xp: user.xp, avatar: "🧑‍🎓" },
  ]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 5);

  const recentReviews = [...reviews].slice(0, 3);

  return (
    <motion.div
      className="space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Hero */}
      <motion.div variants={item}>
        <Card className="overflow-hidden bg-gradient-to-br from-rose-500 via-pink-600 to-fuchsia-600 p-6 text-white sm:p-8 border-0">
          <Pill color="rose" className="bg-white/20 text-white">
            SMKN 2 Bondowoso · Tata Busana · Kelas XI
          </Pill>
          <h1 className="mt-3 text-2xl font-extrabold sm:text-4xl">
            Selamat datang di SALL 🪡
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/90 sm:text-base">
            Belajar Bahasa Inggris Fashion secara mandiri: kosakata, membaca
            label, katalog produk, dan instruksi teknis. Yuk mulai dari
            Placement Quiz!
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {!user.placementDone ? (
              <Link href="/placement">
                <Button variant="ghost" className="bg-white/20 text-white hover:bg-white/30">
                  🎯 Mulai Placement Quiz
                </Button>
              </Link>
            ) : (
              <Link href="/modules/vocabulary">
                <Button variant="ghost" className="bg-white/20 text-white hover:bg-white/30">
                  🚀 Lanjut Belajar
                </Button>
              </Link>
            )}
            <Link href="/progress">
              <Button variant="ghost" className="bg-white/10 text-white hover:bg-white/20">
                <TrendingUp size={16} /> Lihat Progress
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>

      {/* MY LEARNING PROGRESS */}
      <motion.div variants={item}>
        <SectionTitle className="mb-4">📊 My Learning Progress</SectionTitle>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="XP" value={user.xp} emoji="⭐" />
          <StatCard label="Streak" value={`${user.streak} hari`} emoji="🔥" />
          <StatCard label="Badges" value={user.badges.length} emoji="🏅" />
          <StatCard
            label="Modul Selesai"
            value={`${user.modulesCompleted.length}/5`}
            emoji="✅"
          />
        </div>

        <Card className="mt-4 p-5">
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm font-bold text-slate-700">
                <span>Penguasaan Kosakata</span>
                <span>{vocabMasteryPct}%</span>
              </div>
              <ProgressBar value={vocabMasteryPct} color="rose" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm font-bold text-slate-700">
                <span>Penyelesaian Modul</span>
                <span>{modulePct}%</span>
              </div>
              <ProgressBar value={modulePct} color="emerald" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* PERSONAL AI FEEDBACK CARD */}
      <motion.div variants={item}>
        <Card className="border-2 border-rose-100 p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="text-rose-500" size={24} />
            <SectionTitle>Personal Feedback (AI)</SectionTitle>
          </div>
          <p className="mt-2 text-lg font-extrabold text-slate-900">
            Halo {user.name}! 👋
          </p>
          <div className="mt-3 space-y-1 text-sm text-slate-700">
            <p>
              ✓ Total XP minggu ini: <b>{user.xp}</b>
            </p>
            <p>
              ✓ Modul selesai: <b>{user.modulesCompleted.length}</b>
            </p>
            <p>
              ✓ Kosakata dikuasai: <b>{user.vocabMastered} kata</b>
            </p>
            {ai.weakTopic && (
              <p className="text-amber-700">
                ⚠ Perlu ditingkatkan: <b>{ai.weakTopic}</b>
              </p>
            )}
          </div>
          <div className="mt-4 rounded-2xl bg-rose-50 p-4">
            <p className="text-sm font-bold text-rose-800">💡 {ai.message}</p>
            <p className="mt-2 text-sm text-slate-700">
              Rekomendasi: <b>{ai.activity}</b> · ⏱️ ~{ai.estTime} menit
            </p>
            <Link href="/modules/vocabulary">
              <Button className="mt-3" size="sm">
                Mulai Latihan <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>

      {/* Modules quick access */}
      <motion.div variants={item}>
        <SectionTitle className="mb-4">📚 Modul Pembelajaran</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, idx) => {
            const done = user.modulesCompleted.includes(m.id);
            return (
              <Link key={m.id} href={`/modules/${moduleHref[idx]}`}>
                <Card hover className="p-5 text-left h-full">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{m.emoji}</span>
                    {done && <Pill color="emerald">✓ Selesai</Pill>}
                  </div>
                  <p className="mt-3 text-xs font-bold text-rose-600">
                    MODUL {m.number}
                  </p>
                  <p className="font-extrabold text-slate-900">{m.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{m.tagline}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Two column: leaderboard + badges */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <SectionTitle>🏆 Leaderboard</SectionTitle>
            <Link
              href="/leaderboard"
              className="text-sm font-bold text-rose-600"
            >
              Lihat semua →
            </Link>
          </div>
          <div className="space-y-2">
            {board.map((p, i) => (
              <div
                key={p.name + i}
                className={`flex items-center gap-3 rounded-2xl p-3 ${
                  p.name === user.name
                    ? "bg-rose-50 ring-2 ring-rose-200"
                    : "bg-slate-50"
                }`}
              >
                <span className="w-6 text-center font-extrabold text-slate-400">
                  {i + 1}
                </span>
                <span className="text-xl">{p.avatar}</span>
                <span className="font-bold text-slate-800">{p.name}</span>
                <span className="ml-auto font-extrabold text-rose-600">
                  {p.xp} XP
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle className="mb-3">🏅 Badges</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {badges.map((b) => {
              const earned = user.badges.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`rounded-2xl p-3 text-center transition-all duration-200 ${
                    earned
                      ? "bg-amber-50 ring-2 ring-amber-200"
                      : "bg-slate-50 opacity-50"
                  }`}
                >
                  <div className="text-2xl">{earned ? b.emoji : "🔒"}</div>
                  <p className="mt-1 text-xs font-bold text-slate-800">
                    {b.name}
                  </p>
                  <p className="text-[10px] text-slate-500">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Recent reviews */}
      <motion.div variants={item}>
        <SectionTitle className="mb-3">
          💬 Ulasan Terbaru Siswa
        </SectionTitle>
        <div className="grid gap-4 sm:grid-cols-3">
          {recentReviews.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{r.emoji}</span>
                <span className="font-bold text-slate-800">{r.author}</span>
                <span className="ml-auto text-xs text-amber-500">
                  {"⭐".repeat(r.rating)}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                &quot;{r.comment}&quot;
              </p>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* quick links footer */}
      <motion.div
        variants={item}
        className="grid grid-cols-3 gap-3 sm:grid-cols-5"
      >
        {menuItems.slice(6).map((m) => (
          <Link key={m.key} href={m.href}>
            <Card
              hover
              className="p-4 text-center"
            >
              <div className="text-2xl">{m.emoji}</div>
              <p className="mt-1 text-[11px] font-bold text-slate-600">
                {m.label}
              </p>
            </Card>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
}
