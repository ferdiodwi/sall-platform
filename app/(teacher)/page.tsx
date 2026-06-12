"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useReviewStore, useUserStore } from "@/lib/store";
import { modules, leaderboardSeed } from "@/data/content";
import { PageHeader, Card, Button, SectionTitle, Pill, ProgressBar, Input } from "@/components/ui";
import { LayoutDashboard, BookOpen, Upload, MessageSquare } from "lucide-react";

type Tab = "dashboard" | "modules" | "resources" | "reviews";

export default function TeacherPage() {
  const { reviews, replyReview, pinReview, deleteReview } = useReviewStore();
  const user = useUserStore();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { key: "modules", label: "Module Manager", icon: <BookOpen size={16} /> },
    { key: "resources", label: "Resource Manager", icon: <Upload size={16} /> },
    { key: "reviews", label: "Reviews", icon: <MessageSquare size={16} /> },
  ];

  const students = [...leaderboardSeed, { name: user.name, xp: user.xp, avatar: "🧑‍🎓" }];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader emoji="👩‍🏫" title="Teacher Portal (CMS)" subtitle="Kelola konten, pantau siswa, dan moderasi ulasan." />

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition-all ${tab === t.key ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <DashboardTab students={students} />}
      {tab === "modules" && <ModulesTab />}
      {tab === "resources" && <ResourcesTab />}
      {tab === "reviews" && <ReviewsTab reviews={reviews} replyDraft={replyDraft} setReplyDraft={setReplyDraft} replyReview={replyReview} pinReview={pinReview} deleteReview={deleteReview} />}
    </motion.div>
  );
}

function DashboardTab({ students }: { students: { name: string; xp: number; avatar: string }[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Siswa", value: students.length, emoji: "👥" },
          { label: "Siswa Aktif", value: Math.max(1, students.length - 1), emoji: "🟢" },
          { label: "Rata-rata XP", value: Math.round(students.reduce((s, p) => s + p.xp, 0) / students.length), emoji: "⭐" },
          { label: "Total Modul", value: modules.length, emoji: "📚" },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <div className="text-2xl">{s.emoji}</div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">{s.value}</div>
            <div className="text-xs font-semibold text-slate-500">{s.label}</div>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <SectionTitle className="mb-3">📈 Module Completion Rate</SectionTitle>
        {modules.map((m, i) => {
          const rate = [72, 65, 58, 45, 38][i];
          return (
            <div key={m.id} className="mb-3 flex items-center gap-3">
              <span>{m.emoji}</span>
              <span className="w-40 truncate text-sm font-bold text-slate-700">{m.title}</span>
              <div className="flex-1"><ProgressBar value={rate} color="blue" /></div>
              <span className="w-10 text-right text-sm font-bold text-slate-600">{rate}%</span>
            </div>
          );
        })}
      </Card>
      <Card className="p-5">
        <SectionTitle className="mb-3">👥 Progress Siswa</SectionTitle>
        <div className="space-y-2">
          {students.sort((a, b) => b.xp - a.xp).map((p) => (
            <div key={p.name} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <span className="text-xl">{p.avatar}</span>
              <span className="font-bold text-slate-800">{p.name}</span>
              <span className="ml-auto font-extrabold text-blue-600">{p.xp} XP</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ModulesTab() {
  return (
    <div className="space-y-4">
      <Card className="border-2 border-dashed border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        ℹ️ WYSIWYG Editor terhubung di produksi. Setiap perubahan otomatis tampil di Student Portal.
      </Card>
      {modules.map((m) => (
        <Card key={m.id} className="p-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{m.emoji}</span>
            <div>
              <p className="font-extrabold text-slate-900">Modul {m.number}: {m.title}</p>
              <p className="text-xs text-slate-500">{m.features.length} aktivitas · {m.resources.length} sumber</p>
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={() => alert(`Demo: Edit ${m.title}`)}>✏️ Edit</Button>
              <Button variant="outline" size="sm" className="border-red-200 text-red-600" onClick={() => alert("Demo: Hapus modul")}>🗑️</Button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {m.features.map((f) => <Pill key={f.name} color="slate">{f.icon} {f.name}</Pill>)}
          </div>
        </Card>
      ))}
      <Button onClick={() => alert("Demo: form buat modul baru")}>➕ Buat Modul Baru</Button>
    </div>
  );
}

function ResourcesTab() {
  return (
    <Card className="p-5">
      <SectionTitle className="mb-3">🎁 Upload Sumber Belajar</SectionTitle>
      <p className="mb-4 text-sm text-slate-600">Tambahkan video, audio, worksheet, atau bacaan.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { t: "🎬 Video", d: "YouTube, Vimeo, Google Drive" },
          { t: "🎧 Audio", d: "MP3" },
          { t: "📄 Worksheet", d: "PDF, DOCX, PPTX, HTML" },
          { t: "📖 Reading", d: "Teks bacaan" },
        ].map((r) => (
          <div key={r.t} className="rounded-2xl border-2 border-dashed border-slate-200 p-4 text-center">
            <p className="font-bold text-slate-800">{r.t}</p>
            <p className="text-xs text-slate-500">{r.d}</p>
            <Button variant="ghost" className="mt-2 bg-slate-100 text-slate-700 hover:bg-slate-200" size="sm" onClick={() => alert(`Demo: upload ${r.t}`)}>Upload</Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ReviewsTab({ reviews, replyDraft, setReplyDraft, replyReview, pinReview, deleteReview }: {
  reviews: import("@/types").Review[];
  replyDraft: Record<string, string>;
  setReplyDraft: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  replyReview: (id: string, reply: string) => void;
  pinReview: (id: string) => void;
  deleteReview: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <SectionTitle>💬 Moderasi Ulasan ({reviews.length})</SectionTitle>
      {reviews.map((r) => (
        <Card key={r.id} className="p-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{r.emoji}</span>
            <span className="font-bold text-slate-800">{r.author}</span>
            <span className="text-xs text-slate-400">· {modules.find((m) => m.id === r.moduleId)?.title}</span>
            <span className="ml-auto text-sm text-amber-500">{"⭐".repeat(r.rating)}</span>
          </div>
          <p className="mt-2 text-sm text-slate-700">{r.comment}</p>
          {r.teacherReply && <p className="mt-2 rounded-xl bg-blue-50 p-2 text-sm text-blue-800">👩‍🏫 {r.teacherReply}</p>}
          <div className="mt-3 flex gap-2 flex-wrap">
            <Input value={replyDraft[r.id] ?? ""} onChange={(e) => setReplyDraft((d) => ({ ...d, [r.id]: e.target.value }))} placeholder="Balas..." className="flex-1 !py-2 !text-sm" />
            <Button variant="outline" size="sm" onClick={() => { if (replyDraft[r.id]?.trim()) { replyReview(r.id, replyDraft[r.id]); setReplyDraft((d) => ({ ...d, [r.id]: "" })); } }}>Balas</Button>
            <Button variant="outline" size="sm" onClick={() => pinReview(r.id)}>{r.pinned ? "📌 Unpin" : "📌 Pin"}</Button>
            <Button variant="outline" size="sm" className="border-red-200 text-red-600" onClick={() => deleteReview(r.id)}>🗑️</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
