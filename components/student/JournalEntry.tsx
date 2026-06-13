'use client'

import React from 'react'
import { Calendar, AlertCircle, Goal, Award } from 'lucide-react'

interface JournalEntryProps {
  entry: {
    id: string
    learned: string | null
    difficult: string | null
    goal: string | null
    created_at: string
  }
}

export default function JournalEntry({ entry }: JournalEntryProps) {
  const formattedDate = new Date(entry.created_at).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3 pb-4 border-b border-rose-50">
        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
          <Calendar size={18} />
        </div>
        <div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tanggal Catatan</span>
          <h4 className="font-extrabold text-sm text-gray-800 leading-snug">{formattedDate}</h4>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Learned Prompt */}
        <div className="space-y-2">
          <h5 className="text-xs font-black text-rose-500 uppercase tracking-wide flex items-center gap-1.5">
            <Award size={14} className="fill-rose-500/10" />
            <span>Hari ini saya belajar tentang...</span>
          </h5>
          <div className="p-4 bg-rose-50/20 border border-rose-100/30 rounded-2xl text-xs md:text-sm text-gray-700 leading-relaxed font-normal italic">
            "{entry.learned || 'Tidak diisi'}"
          </div>
        </div>

        {/* Difficult Prompt */}
        <div className="space-y-2">
          <h5 className="text-xs font-black text-amber-600 uppercase tracking-wide flex items-center gap-1.5">
            <AlertCircle size={14} className="fill-amber-500/10" />
            <span>Yang masih saya bingungkan adalah...</span>
          </h5>
          <div className="p-4 bg-amber-50/20 border border-amber-100/20 rounded-2xl text-xs md:text-sm text-gray-700 leading-relaxed font-normal italic">
            "{entry.difficult || 'Tidak diisi'}"
          </div>
        </div>

        {/* Goal Prompt */}
        <div className="space-y-2">
          <h5 className="text-xs font-black text-emerald-600 uppercase tracking-wide flex items-center gap-1.5">
            <Goal size={14} className="fill-emerald-500/10" />
            <span>Target saya minggu depan adalah...</span>
          </h5>
          <div className="p-4 bg-emerald-50/20 border border-emerald-100/20 rounded-2xl text-xs md:text-sm text-gray-700 leading-relaxed font-normal italic">
            "{entry.goal || 'Tidak diisi'}"
          </div>
        </div>
      </div>
    </div>
  )
}
