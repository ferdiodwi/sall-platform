"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useJournalStore } from "@/lib/store";
import { PageHeader, Card, Button, SectionTitle, Textarea, EmptyState } from "@/components/ui";
import { Send, CalendarDays } from "lucide-react";

export default function JournalPage() {
  const { entries, addEntry } = useJournalStore();
  const [learned, setLearned] = useState("");
  const [difficult, setDifficult] = useState("");
  const [goal, setGoal] = useState("");

  function submit() {
    if (!learned.trim() && !difficult.trim() && !goal.trim()) return;
    addEntry({ learned: learned.trim(), difficult: difficult.trim(), goal: goal.trim() });
    setLearned("");
    setDifficult("");
    setGoal("");
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader emoji="📔" title="Digital Journal" subtitle="Catat refleksi belajar kamu setiap hari." />

      <Card className="p-6 mb-6">
        <SectionTitle className="mb-4">📝 Tulis Jurnal Hari Ini</SectionTitle>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              ✅ Apa yang kamu pelajari hari ini?
            </label>
            <Textarea
              value={learned}
              onChange={(e) => setLearned(e.target.value)}
              placeholder="Contoh: Saya belajar tentang jenis-jenis kain..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              🤔 Apa yang masih sulit?
            </label>
            <Textarea
              value={difficult}
              onChange={(e) => setDifficult(e.target.value)}
              placeholder="Contoh: Saya masih bingung membedakan polyester dan rayon..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              🎯 Target belajar selanjutnya?
            </label>
            <Textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Contoh: Menghafal 5 kosakata baru..."
              rows={3}
            />
          </div>
          <Button onClick={submit}>
            <Send size={16} /> Simpan Jurnal
          </Button>
        </div>
      </Card>

      <SectionTitle className="mb-3">📅 Jurnal Sebelumnya</SectionTitle>
      {entries.length === 0 ? (
        <EmptyState
          emoji="📔"
          title="Belum ada jurnal"
          description="Mulai tulis refleksi belajar pertamamu!"
        />
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays size={16} className="text-rose-500" />
                  <span className="text-sm font-bold text-rose-600">{e.date}</span>
                </div>
                {e.learned && (
                  <div className="mb-2">
                    <p className="text-xs font-bold text-emerald-600">✅ Yang dipelajari:</p>
                    <p className="text-sm text-slate-700">{e.learned}</p>
                  </div>
                )}
                {e.difficult && (
                  <div className="mb-2">
                    <p className="text-xs font-bold text-amber-600">🤔 Yang masih sulit:</p>
                    <p className="text-sm text-slate-700">{e.difficult}</p>
                  </div>
                )}
                {e.goal && (
                  <div>
                    <p className="text-xs font-bold text-blue-600">🎯 Target:</p>
                    <p className="text-sm text-slate-700">{e.goal}</p>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
