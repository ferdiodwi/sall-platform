"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { modules, products, readingQuiz } from "@/data/content";
import { useUserStore } from "@/lib/store";
import { PageHeader, Card, Button, SectionTitle, Pill } from "@/components/ui";
import { QuizEngine } from "@/components/quiz/quiz-engine";
import { ResourceList } from "@/components/resource-list";
import { ReviewSection } from "@/components/review-section";
import { LevelTabs } from "@/components/level-tabs";
import type { Level } from "@/types";
import { ShoppingBag, Search } from "lucide-react";

const mod = modules[3];

export default function CataloguePage() {
  const user = useUserStore();
  const { completeModule } = useUserStore();
  const [level, setLevel] = useState<Level>(user.level ?? "beginner");
  const [showQuiz, setShowQuiz] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader emoji={mod.emoji} title={`Modul 4 · ${mod.title}`} subtitle={mod.tagline} />
      <LevelTabs level={level} setLevel={setLevel} />

      {!showQuiz ? (
        <>
          <SectionTitle className="mb-4">
            <ShoppingBag className="inline mr-2 text-rose-500" size={20} />
            Product Catalogue
          </SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Card
                key={p.id}
                hover
                className={`p-5 cursor-pointer ${
                  selected === p.id ? "ring-2 ring-rose-400" : ""
                }`}
              >
                <button onClick={() => setSelected(selected === p.id ? null : p.id)} className="w-full text-left">
                  <div className="text-4xl mb-3">{p.emoji}</div>
                  <h3 className="font-extrabold text-slate-900">{p.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{p.desc}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Pill color="rose">{p.price}</Pill>
                    <Pill color="slate">{p.material}</Pill>
                  </div>
                  {selected === p.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 space-y-1 text-sm text-slate-600 border-t border-slate-100 pt-3"
                    >
                      <p><b>Colors:</b> {p.color}</p>
                      <p><b>Sizes:</b> {p.sizes}</p>
                      <p><b>Material:</b> {p.material}</p>
                    </motion.div>
                  )}
                </button>
              </Card>
            ))}
          </div>

          <Card className="mt-5 p-5">
            <SectionTitle className="mb-3">
              <Search className="inline mr-2 text-rose-500" size={18} />
              Latihan: Identifikasi Informasi Produk
            </SectionTitle>
            <p className="text-sm text-slate-600 mb-3">
              Klik setiap kartu produk di atas dan jawab: Apa warna yang tersedia? Berapa harganya? Bahan apa?
            </p>
            <Button onClick={() => setShowQuiz(true)}>
              ❓ Mulai Catalogue Quiz
            </Button>
          </Card>
        </>
      ) : (
        <QuizEngine
          questions={readingQuiz.filter((q) => q.topic === "Catalogue" || q.topic === "Reading")}
          title="Catalogue Quiz"
          onFinish={() => completeModule(mod.id)}
        />
      )}

      <ResourceList resources={mod.resources} />
      <ReviewSection moduleId={mod.id} />
    </motion.div>
  );
}
