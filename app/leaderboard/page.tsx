"use client";

import { motion } from "framer-motion";
import { useUserStore } from "@/lib/store";
import { leaderboardSeed } from "@/data/content";
import { PageHeader, Card, Pill } from "@/components/ui";
import { Trophy, Medal, Award } from "lucide-react";

export default function LeaderboardPage() {
  const user = useUserStore();

  const board = [
    ...leaderboardSeed,
    { name: user.name, xp: user.xp, avatar: "🧑‍🎓" },
  ].sort((a, b) => b.xp - a.xp);

  const podiumIcons = [
    <Trophy key="1" className="text-amber-500" size={24} />,
    <Medal key="2" className="text-slate-400" size={22} />,
    <Award key="3" className="text-amber-700" size={20} />,
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader
        emoji="🏆"
        title="Leaderboard"
        subtitle="Peringkat XP siswa kelas XI Tata Busana."
      />

      {/* Podium Top 3 */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {board.slice(0, 3).map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            <Card
              className={`p-5 text-center ${
                i === 0
                  ? "bg-gradient-to-br from-amber-50 to-yellow-100 ring-2 ring-amber-200"
                  : i === 1
                  ? "bg-gradient-to-br from-slate-50 to-slate-100 ring-1 ring-slate-200"
                  : "bg-gradient-to-br from-orange-50 to-amber-100 ring-1 ring-amber-200"
              }`}
            >
              <div className="flex justify-center mb-2">
                {podiumIcons[i]}
              </div>
              <div className="text-3xl mb-1">{p.avatar}</div>
              <p className="font-extrabold text-slate-900 text-sm">{p.name}</p>
              <p className="text-lg font-extrabold text-rose-600">{p.xp} XP</p>
              <Pill
                color={i === 0 ? "amber" : i === 1 ? "slate" : "amber"}
                className="mt-1"
              >
                #{i + 1}
              </Pill>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Full ranking */}
      <Card className="p-5">
        <div className="space-y-2">
          {board.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 rounded-2xl p-3 transition-all ${
                p.name === user.name
                  ? "bg-rose-50 ring-2 ring-rose-200"
                  : "bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <span className="w-8 text-center text-lg font-extrabold text-slate-400">
                {i + 1}
              </span>
              <span className="text-2xl">{p.avatar}</span>
              <div className="flex-1">
                <span className="font-bold text-slate-800">{p.name}</span>
                {p.name === user.name && (
                  <Pill color="rose" className="ml-2">
                    Kamu
                  </Pill>
                )}
              </div>
              <span className="font-extrabold text-rose-600">{p.xp} XP</span>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
