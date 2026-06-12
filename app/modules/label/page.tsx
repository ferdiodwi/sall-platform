"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { modules, washingSymbols, sizeChart, readingQuiz } from "@/data/content";
import { useUserStore } from "@/lib/store";
import { PageHeader, Card, Button, SectionTitle, Pill } from "@/components/ui";
import { QuizEngine } from "@/components/quiz/quiz-engine";
import { ResourceList } from "@/components/resource-list";
import { ReviewSection } from "@/components/review-section";
import { LevelTabs } from "@/components/level-tabs";
import type { Level } from "@/types";
import { Tag, Droplets, Ruler } from "lucide-react";

const mod = modules[2];

export default function LabelPage() {
  const user = useUserStore();
  const { completeModule } = useUserStore();
  const [level, setLevel] = useState<Level>(user.level ?? "beginner");
  const [tab, setTab] = useState<"symbols" | "composition" | "size" | "quiz">("symbols");

  const tabs = [
    { key: "symbols" as const, label: "Simbol Cuci", icon: <Droplets size={16} /> },
    { key: "composition" as const, label: "Komposisi", icon: <Tag size={16} /> },
    { key: "size" as const, label: "Size Chart", icon: <Ruler size={16} /> },
    { key: "quiz" as const, label: "Label Quiz", icon: <>❓</> },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader emoji={mod.emoji} title={`Modul 3 · ${mod.title}`} subtitle={mod.tagline} />
      <LevelTabs level={level} setLevel={setLevel} />

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition-all duration-200 ${
              tab === t.key
                ? "bg-rose-600 text-white shadow-md shadow-rose-200"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-rose-50"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "symbols" && (
        <Card className="p-5">
          <SectionTitle className="mb-4">🧼 Washing Care Symbols</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {washingSymbols.map((s) => (
              <div
                key={s.name}
                className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 transition-all hover:bg-rose-50"
              >
                <span className="text-3xl">{s.symbol}</span>
                <div>
                  <p className="font-bold text-slate-800">{s.name}</p>
                  <p className="text-sm text-slate-500">{s.meaning}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "composition" && (
        <Card className="p-5">
          <SectionTitle className="mb-4">🧪 Fabric Composition Label</SectionTitle>
          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="mx-auto max-w-sm rounded-2xl border-2 border-dashed border-slate-300 bg-white p-5 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Care Label</p>
              <p className="mt-2 text-lg font-extrabold text-slate-800">80% Cotton / 20% Polyester</p>
              <div className="mt-3 space-y-1 text-sm text-slate-600">
                <p>🌡️ Machine wash cold (30°C)</p>
                <p>🚫 Do not bleach</p>
                <p>♨️ Iron on low heat</p>
                <p>🔁 Tumble dry low</p>
              </div>
              <p className="mt-3 text-xs text-slate-400">Made in Indonesia 🇮🇩</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p>📌 <b>Cotton (Katun)</b> = serat alami, lembut, menyerap keringat</p>
            <p>📌 <b>Polyester (Poliester)</b> = serat sintetis, cepat kering, tahan kusut</p>
            <p>📌 <b>80% / 20%</b> = bahan utama (cotton) lebih banyak</p>
          </div>
        </Card>
      )}

      {tab === "size" && (
        <Card className="p-5">
          <SectionTitle className="mb-4">📊 Understanding Size Charts</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 text-left font-bold text-slate-800">Size</th>
                  <th className="py-3 px-4 text-left font-bold text-slate-800">Chest</th>
                  <th className="py-3 px-4 text-left font-bold text-slate-800">Length</th>
                </tr>
              </thead>
              <tbody>
                {sizeChart.map((row) => (
                  <tr key={row.size} className="border-b border-slate-100 hover:bg-rose-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-rose-600">{row.size}</td>
                    <td className="py-3 px-4 text-slate-700">{row.chest}</td>
                    <td className="py-3 px-4 text-slate-700">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "quiz" && (
        <QuizEngine
          questions={readingQuiz.filter((q) => q.topic === "Reading")}
          title="Label Quiz"
          onFinish={() => completeModule(mod.id)}
        />
      )}

      <ResourceList resources={mod.resources} />
      <ReviewSection moduleId={mod.id} />
    </motion.div>
  );
}
