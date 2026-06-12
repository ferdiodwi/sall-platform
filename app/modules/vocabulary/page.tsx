"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { vocabWords, vocabQuiz, modules } from "@/data/content";
import { useUserStore, useWordWallStore } from "@/lib/store";
import { PageHeader, Card, Button, SectionTitle, Pill, Input } from "@/components/ui";
import { QuizEngine } from "@/components/quiz/quiz-engine";
import { ResourceList } from "@/components/resource-list";
import { ReviewSection } from "@/components/review-section";
import { LevelTabs } from "@/components/level-tabs";
import type { Level, VocabWord } from "@/types";
import { Layers, BookOpen, Shuffle, PenLine, HelpCircle, Plus, ChevronLeft, ChevronRight } from "lucide-react";

const mod = modules[0];

type Activity = "flashcards" | "dictionary" | "matching" | "fillblank" | "quiz";

const activities: { key: Activity; name: string; icon: React.ReactNode }[] = [
  { key: "flashcards", name: "Flashcards", icon: <Layers size={16} /> },
  { key: "dictionary", name: "Visual Dictionary", icon: <BookOpen size={16} /> },
  { key: "matching", name: "Word Matching", icon: <Shuffle size={16} /> },
  { key: "fillblank", name: "Fill in Blank", icon: <PenLine size={16} /> },
  { key: "quiz", name: "Vocabulary Quiz", icon: <HelpCircle size={16} /> },
];

export default function VocabularyPage() {
  const user = useUserStore();
  const { completeModule } = useUserStore();
  const [level, setLevel] = useState<Level>(user.level ?? "beginner");
  const [activity, setActivity] = useState<Activity>("flashcards");
  const words = level === "beginner" ? vocabWords.slice(0, 12) : vocabWords;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader emoji={mod.emoji} title={`Modul 1 · ${mod.title}`} subtitle={mod.tagline} />
      <LevelTabs level={level} setLevel={setLevel} />

      {/* Activity tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {activities.map((a) => (
          <button
            key={a.key}
            onClick={() => setActivity(a.key)}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition-all duration-200 ${
              activity === a.key
                ? "bg-rose-600 text-white shadow-md shadow-rose-200"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-rose-50"
            }`}
          >
            {a.icon} {a.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activity}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activity === "flashcards" && <Flashcards words={words} />}
          {activity === "dictionary" && <VisualDictionary words={words} />}
          {activity === "matching" && <WordMatching words={words} />}
          {activity === "fillblank" && <FillBlank words={words} />}
          {activity === "quiz" && (
            <QuizEngine
              questions={vocabQuiz}
              title="Vocabulary Quiz"
              onFinish={() => completeModule(mod.id)}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <ResourceList resources={mod.resources} />
      <ReviewSection moduleId={mod.id} />
    </motion.div>
  );
}

// ---------- Flashcards ----------
function Flashcards({ words }: { words: VocabWord[] }) {
  const { masterVocab } = useUserStore();
  const { addWord } = useWordWallStore();
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const w = words[i];

  return (
    <Card className="p-6 text-center">
      <p className="mb-3 text-sm font-bold text-slate-500">
        Kartu {i + 1}/{words.length}
      </p>
      <button
        onClick={() => setFlipped((f) => !f)}
        className="mx-auto flex min-h-56 w-full max-w-sm flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-rose-50 to-pink-100 p-6 ring-2 ring-rose-100 transition-all duration-300 active:scale-95 hover:shadow-lg"
      >
        {!flipped ? (
          <>
            <span className="text-6xl">{w.emoji}</span>
            <span className="mt-4 text-3xl font-extrabold text-slate-900">
              {w.word}
            </span>
            <span className="mt-2 text-xs text-slate-400">
              (ketuk untuk arti)
            </span>
          </>
        ) : (
          <>
            <span className="text-2xl font-extrabold text-rose-600">
              {w.meaning}
            </span>
            <span className="mt-3 text-sm italic text-slate-600">
              &quot;{w.example}&quot;
            </span>
            <Pill color="slate" className="mt-2">
              {w.category}
            </Pill>
          </>
        )}
      </button>
      <div className="mt-5 flex justify-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setI((n) => (n - 1 + words.length) % words.length);
            setFlipped(false);
          }}
        >
          <ChevronLeft size={16} /> Sebelumnya
        </Button>
        <Button
          variant="success"
          size="sm"
          onClick={() => {
            addWord({
              word: w.word,
              meaning: w.meaning,
              example: w.example,
              emoji: w.emoji,
            });
            masterVocab(1);
          }}
        >
          <Plus size={16} /> Simpan
        </Button>
        <Button
          size="sm"
          onClick={() => {
            setI((n) => (n + 1) % words.length);
            setFlipped(false);
          }}
        >
          Berikutnya <ChevronRight size={16} />
        </Button>
      </div>
    </Card>
  );
}

// ---------- Visual Dictionary ----------
function VisualDictionary({ words }: { words: VocabWord[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {words.map((w) => (
        <Card key={w.id} hover className="p-4 text-center">
          <div className="text-4xl">{w.emoji}</div>
          <p className="mt-2 font-extrabold text-slate-900">{w.word}</p>
          <p className="text-sm text-rose-600">{w.meaning}</p>
          <p className="mt-1 text-xs italic text-slate-400">
            &quot;{w.example}&quot;
          </p>
        </Card>
      ))}
    </div>
  );
}

// ---------- Word Matching ----------
function WordMatching({ words }: { words: VocabWord[] }) {
  const pairs = useMemo(() => words.slice(0, 6), [words]);
  const [shuffledMeanings] = useState(() =>
    [...pairs].sort(() => Math.random() - 0.5)
  );
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, boolean>>({});
  const { addXp } = useUserStore();
  const [feedback, setFeedback] = useState("");

  function tryMatch(meaningId: string) {
    if (!selectedWord) return;
    if (selectedWord === meaningId) {
      setMatched((m) => ({ ...m, [meaningId]: true }));
      addXp(5);
      setFeedback("✅ Cocok! +5 XP");
    } else {
      setFeedback("❌ Belum cocok, coba lagi.");
    }
    setSelectedWord(null);
    setTimeout(() => setFeedback(""), 1500);
  }

  return (
    <Card className="p-5">
      <SectionTitle className="mb-3">🔤 Cocokkan kata dengan artinya</SectionTitle>
      {feedback && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-3 text-sm font-bold text-slate-700"
        >
          {feedback}
        </motion.p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {pairs.map((w) => (
            <button
              key={w.id}
              disabled={matched[w.id]}
              onClick={() => setSelectedWord(w.id)}
              className={`flex w-full items-center gap-2 rounded-2xl border-2 px-3 py-3 text-left text-sm font-bold transition-all duration-200 ${
                matched[w.id]
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : selectedWord === w.id
                  ? "border-rose-400 bg-rose-50"
                  : "border-slate-200 hover:border-rose-300"
              }`}
            >
              {w.emoji} {w.word} {matched[w.id] && "✅"}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {shuffledMeanings.map((w) => (
            <button
              key={w.id}
              disabled={matched[w.id]}
              onClick={() => tryMatch(w.id)}
              className={`w-full rounded-2xl border-2 px-3 py-3 text-left text-sm font-bold transition-all duration-200 ${
                matched[w.id]
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 hover:border-rose-300"
              }`}
            >
              {w.meaning}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ---------- Fill in Blank ----------
function FillBlank({ words }: { words: VocabWord[] }) {
  const items = useMemo(() => words.slice(0, 5), [words]);
  const [i, setI] = useState(0);
  const [val, setVal] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const { addXp } = useUserStore();
  const w = items[i];
  const sentence = w.example.replace(new RegExp(w.word, "i"), "_____");

  function check() {
    if (val.trim().toLowerCase() === w.word.toLowerCase()) {
      setStatus("correct");
      addXp(10);
    } else setStatus("wrong");
  }

  function next() {
    setI((n) => (n + 1) % items.length);
    setVal("");
    setStatus("idle");
  }

  return (
    <Card className="p-6">
      <SectionTitle className="mb-3">
        ✏️ Lengkapi kalimat ({i + 1}/{items.length})
      </SectionTitle>
      <div className="rounded-2xl bg-slate-50 p-4 text-lg font-semibold text-slate-800">
        {w.emoji} {sentence}
      </div>
      <p className="mt-2 text-sm text-slate-500">
        Petunjuk: artinya &quot;<b>{w.meaning}</b>&quot;
      </p>
      <Input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Ketik kata bahasa Inggris..."
        className="mt-3"
      />
      {status === "idle" && (
        <Button className="mt-3 w-full" onClick={check}>
          Periksa
        </Button>
      )}
      {status === "correct" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4"
        >
          <p className="font-bold text-emerald-700">
            ✅ Benar! Jawabannya &quot;{w.word}&quot;. +10 XP
          </p>
          <Button className="mt-2 w-full" onClick={next}>
            Lanjut →
          </Button>
        </motion.div>
      )}
      {status === "wrong" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4"
        >
          <p className="font-bold text-amber-700">💡 Belum tepat.</p>
          <p className="text-sm text-slate-700">
            Jawaban benar: <b>{w.word}</b>
          </p>
          <p className="text-sm text-slate-600">
            Sumber: &quot;{w.example}&quot;
          </p>
          <Button className="mt-2 w-full" onClick={next}>
            Lanjut →
          </Button>
        </motion.div>
      )}
    </Card>
  );
}
