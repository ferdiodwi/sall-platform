"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, Card, SectionTitle } from "@/components/ui";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

const faqs = [
  { q: "Bagaimana cara memulai belajar?", a: "Kerjakan Placement Quiz terlebih dahulu. Setelah itu, kamu akan mendapatkan level (Beginner/Intermediate) dan bisa mulai belajar dari Modul 1." },
  { q: "Apa itu XP dan bagaimana cara mendapatkannya?", a: "XP adalah poin pengalaman. Setiap jawaban benar = 10 XP. XP menentukan peringkat di Leaderboard." },
  { q: "Bagaimana cara mendapatkan badge?", a: "Badge otomatis diberikan saat kamu mencapai target tertentu: menyelesaikan quiz, menguasai kosakata, atau mendapatkan streak." },
  { q: "Apa perbedaan Beginner dan Intermediate?", a: "Beginner = konten sederhana, kosakata dasar. Intermediate = teks autentik lebih panjang, kosakata kompleks." },
  { q: "Bagaimana cara menggunakan Word Wall?", a: "Klik 'Simpan ke Word Wall' di modul Vocabulary. Ubah status kata di halaman Word Wall." },
  { q: "Apa itu Digital Journal?", a: "Tempat menulis refleksi belajar harian: apa yang dipelajari, yang masih sulit, dan target selanjutnya." },
  { q: "Bagaimana sistem feedback AI bekerja?", a: "AI menganalisis jawaban quiz dan menemukan topik terlemah, lalu memberikan rekomendasi latihan." },
  { q: "Apakah data saya tersimpan?", a: "Ya! Progress tersimpan di browser (localStorage). Versi produksi menggunakan Supabase cloud." },
  { q: "Siapa yang bisa mengakses Teacher Portal?", a: "Hanya guru. Di versi demo, semua bisa melihat. Produksi dikontrol via role-based auth." },
  { q: "Bagaimana cara menghubungi guru?", a: "Tulis ulasan di setiap modul. Guru akan membaca dan membalas melalui Teacher Portal." },
];

export default function HelpPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const filtered = faqs.filter((f) => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader emoji="❓" title="Help Center" subtitle="Pertanyaan yang sering ditanyakan (FAQ)." />
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari pertanyaan..." className="w-full rounded-2xl border-2 border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100" />
      </div>
      <div className="space-y-2">
        {filtered.map((f, i) => (
          <Card key={i} className="overflow-hidden">
            <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="flex w-full items-center gap-3 p-4 text-left">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-600">{i + 1}</span>
              <span className="flex-1 font-bold text-slate-800">{f.q}</span>
              {openIdx === i ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
            </button>
            <AnimatePresence>
              {openIdx === i && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border-t border-slate-100 px-4 pb-4 pt-3">
                  <p className="text-sm leading-relaxed text-slate-600">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <div className="text-5xl">🔍</div>
          <p className="mt-3 font-extrabold text-slate-700">Tidak ditemukan</p>
        </div>
      )}
    </motion.div>
  );
}
