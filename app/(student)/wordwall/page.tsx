"use client";

import { motion } from "framer-motion";
import { useWordWallStore } from "@/lib/store";
import { PageHeader, Card, Button, Pill, EmptyState } from "@/components/ui";
import { Trash2 } from "lucide-react";

export default function WordWallPage() {
  const { words, setWordStatus, removeWord } = useWordWallStore();

  const statusColors = {
    new: { bg: "bg-blue-50", ring: "ring-blue-200", text: "text-blue-700", label: "🆕 Baru" },
    learning: { bg: "bg-amber-50", ring: "ring-amber-200", text: "text-amber-700", label: "📖 Sedang Dipelajari" },
    mastered: { bg: "bg-emerald-50", ring: "ring-emerald-200", text: "text-emerald-700", label: "✅ Dikuasai" },
  };

  const statusCycle: Record<string, "new" | "learning" | "mastered"> = {
    new: "learning",
    learning: "mastered",
    mastered: "new",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader
        emoji="🧱"
        title="My Word Wall"
        subtitle="Koleksi kosakata pribadi kamu. Klik status untuk mengubah."
      />

      {words.length === 0 ? (
        <EmptyState
          emoji="🧱"
          title="Word Wall kosong"
          description="Tambahkan kata dari modul Vocabulary Builder!"
        />
      ) : (
        <>
          <div className="mb-4 flex gap-2 flex-wrap">
            <Pill color="slate">{words.length} kata</Pill>
            <Pill color="blue">{words.filter((w) => w.status === "new").length} baru</Pill>
            <Pill color="amber">{words.filter((w) => w.status === "learning").length} dipelajari</Pill>
            <Pill color="emerald">{words.filter((w) => w.status === "mastered").length} dikuasai</Pill>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {words.map((w) => {
              const sc = statusColors[w.status];
              return (
                <motion.div
                  key={w.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className={`p-4 ${sc.bg} ring-1 ${sc.ring}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-2xl mr-2">{w.emoji}</span>
                        <span className="text-lg font-extrabold text-slate-900">
                          {w.word}
                        </span>
                      </div>
                      <button
                        onClick={() => removeWord(w.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="mt-1 text-sm font-bold text-rose-600">{w.meaning}</p>
                    <p className="mt-1 text-xs italic text-slate-500">
                      &quot;{w.example}&quot;
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        onClick={() => setWordStatus(w.id, statusCycle[w.status])}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition-all hover:scale-105 ${sc.bg} ${sc.text} ring-1 ${sc.ring}`}
                      >
                        {sc.label}
                      </button>
                      <span className="text-[10px] text-slate-400">
                        {w.addedAt}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </motion.div>
  );
}
