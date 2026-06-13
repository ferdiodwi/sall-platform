'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'

const WysiwygEditor = dynamic(
  () => import('@/components/teacher/WysiwygEditor').then(mod => mod.WysiwygEditor),
  { ssr: false, loading: () => <div className="h-48 border border-rose-100 rounded-xl bg-rose-50/20 animate-pulse flex items-center justify-center text-sm text-rose-400">Memuat Editor Teks...</div> }
)
import DOMPurify from 'dompurify'
import { ArrowLeft, Save, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function NewModulePage() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  // Form Fields
  const [number, setNumber] = useState('')
  const [title, setTitle] = useState('')
  const [tagline, setTagline] = useState('')
  const [emoji, setEmoji] = useState('📖')
  const [order, setOrder] = useState('')

  // Level Contents
  const [activeTab, setActiveTab] = useState<'beginner' | 'intermediate'>('beginner')
  const [beginnerContent, setBeginnerContent] = useState('')
  const [intermediateContent, setIntermediateContent] = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!number || !title || !order) {
      alert('Nomor modul, Judul, dan Urutan wajib diisi!')
      return
    }

    try {
      setSaving(true)

      // Sanitasi konten menggunakan DOMPurify sebelum disimpan
      const sanitizedBeginner = DOMPurify.sanitize(beginnerContent)
      const sanitizedIntermediate = DOMPurify.sanitize(intermediateContent)

      // 1. Simpan Modul Baru
      const { data: moduleData, error: modError } = await (supabase.from('modules') as any)
        .insert({
          number: parseInt(number),
          title,
          tagline: tagline || null,
          emoji: emoji || '📖',
          order: parseInt(order),
          published: false // Default draft
        })
        .select()
        .single()

      if (modError) {
        if (modError.message.includes('unique')) {
          alert('Nomor modul sudah terdaftar. Silakan pilih nomor lain.')
        } else {
          throw modError
        }
        return
      }

      const newModuleId = moduleData.id

      // 2. Simpan konten per level ke tabel levels
      const levelInserts = [
        {
          module_id: newModuleId,
          level: 'beginner',
          content_html: sanitizedBeginner
        },
        {
          module_id: newModuleId,
          level: 'intermediate',
          content_html: sanitizedIntermediate
        }
      ]

      const { error: levelsError } = await (supabase.from('levels') as any)
        .insert(levelInserts)

      if (levelsError) throw levelsError

      router.push('/teacher/modules')
      router.refresh()
    } catch (err) {
      console.error('Error saving new module:', err)
      alert('Gagal menyimpan modul baru.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/teacher/modules"
            className="p-2 hover:bg-rose-50 text-gray-500 hover:text-rose-500 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border border-rose-100"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'var(--font-playfair)' }}>
              Tambah Modul Baru
            </h2>
            <p className="text-sm text-gray-500">
              Buat metadata modul dan susun konten materi belajarnya.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold shadow-sm transition-all min-h-[44px] cursor-pointer disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Menyimpan...' : 'Simpan Modul'}
        </button>
      </div>

      {/* Metadata Fields Card */}
      <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Nomor Modul *</label>
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full px-4 py-3 border border-rose-100 rounded-xl text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 bg-rose-50/10 min-h-[44px]"
            placeholder="Contoh: 6"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Urutan Tampil (Order) *</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="w-full px-4 py-3 border border-rose-100 rounded-xl text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 bg-rose-50/10 min-h-[44px]"
            placeholder="Contoh: 6"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Emoji *</label>
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            className="w-full px-4 py-3 border border-rose-100 rounded-xl text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 bg-rose-50/10 min-h-[44px]"
            placeholder="Contoh: 📖"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Judul Modul *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-rose-100 rounded-xl text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 bg-rose-50/10 min-h-[44px]"
            placeholder="Contoh: Fabric Selection and Classification"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Tagline Deskripsi</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full px-4 py-3 border border-rose-100 rounded-xl text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 bg-rose-50/10 min-h-[44px]"
            placeholder="Mengenal serat kain dan perawatannya."
          />
        </div>
      </div>

      {/* Editor Tabs Section */}
      <div className="flex flex-col gap-4">
        {/* Tabs switcher */}
        <div className="flex border-b border-rose-100 gap-1 bg-white p-1 rounded-2xl border w-fit shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('beginner')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[38px] ${
              activeTab === 'beginner'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-rose-500 hover:bg-rose-50/30'
            }`}
          >
            <Sparkles size={14} />
            Beginner Level Content
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('intermediate')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[38px] ${
              activeTab === 'intermediate'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-rose-500 hover:bg-rose-50/30'
            }`}
          >
            <Sparkles size={14} />
            Intermediate Level Content
          </button>
        </div>

        {/* Content Editors */}
        <div>
          {activeTab === 'beginner' ? (
            <div className="space-y-4">
              <p className="text-xs text-gray-400 font-medium px-1">
                Tulis bahan ajar dan instruksi kosakata dasar busana untuk pemula (Beginner).
              </p>
              <WysiwygEditor content={beginnerContent} onChange={setBeginnerContent} />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-gray-400 font-medium px-1">
                Tulis panduan kerja, SOP, atau teks detail tata busana menengah untuk intermediate.
              </p>
              <WysiwygEditor content={intermediateContent} onChange={setIntermediateContent} />
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
