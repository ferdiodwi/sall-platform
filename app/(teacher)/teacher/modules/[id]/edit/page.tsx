'use client'

import React, { useState, useEffect } from 'react'
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

interface EditModuleProps {
  params: Promise<{ id: string }>
}

export default function EditModulePage({ params }: EditModuleProps) {
  const router = useRouter()
  const supabase = createClient()
  const { id: moduleId } = React.use(params)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form Fields
  const [number, setNumber] = useState('')
  const [title, setTitle] = useState('')
  const [tagline, setTagline] = useState('')
  const [emoji, setEmoji] = useState('')
  const [order, setOrder] = useState('')

  // Level Contents
  const [activeTab, setActiveTab] = useState<'beginner' | 'intermediate'>('beginner')
  const [beginnerContent, setBeginnerContent] = useState('')
  const [intermediateContent, setIntermediateContent] = useState('')

  useEffect(() => {
    fetchModuleData()
  }, [moduleId])

  const fetchModuleData = async () => {
    try {
      setLoading(true)

      // 1. Fetch module
      const { data: moduleData, error: modErr } = await supabase
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .single() as any

      if (modErr) throw modErr

      setNumber(moduleData.number.toString())
      setTitle(moduleData.title)
      setTagline(moduleData.tagline || '')
      setEmoji(moduleData.emoji || '📖')
      setOrder(moduleData.order.toString())

      // 2. Fetch levels
      const { data: levelsData, error: levelsErr } = await supabase
        .from('levels')
        .select('*')
        .eq('module_id', moduleId) as any

      if (levelsErr) throw levelsErr

      const beginner = levelsData.find((l: any) => l.level === 'beginner')
      const intermediate = levelsData.find((l: any) => l.level === 'intermediate')

      if (beginner) setBeginnerContent(beginner.content_html || '')
      if (intermediate) setIntermediateContent(intermediate.content_html || '')

    } catch (err) {
      console.error('Error fetching module data:', err)
      alert('Gagal mengambil data modul.')
    } finally {
      setLoading(false)
    }
  }

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

      // 1. Update metadata modul
      const { error: modError } = await (supabase.from('modules') as any)
        .update({
          number: parseInt(number),
          title,
          tagline: tagline || null,
          emoji: emoji || '📖',
          order: parseInt(order),
          updated_at: new Date().toISOString()
        })
        .eq('id', moduleId)

      if (modError) throw modError

      // 2. Upsert/Update level content (beginner)
      const { error: begError } = await (supabase.from('levels') as any)
        .upsert({
          module_id: moduleId,
          level: 'beginner',
          content_html: sanitizedBeginner,
          updated_at: new Date().toISOString()
        }, { onConflict: 'module_id,level' })

      if (begError) throw begError

      // Upsert/Update level content (intermediate)
      const { error: intError } = await (supabase.from('levels') as any)
        .upsert({
          module_id: moduleId,
          level: 'intermediate',
          content_html: sanitizedIntermediate,
          updated_at: new Date().toISOString()
        }, { onConflict: 'module_id,level' })

      if (intError) throw intError

      router.push('/teacher/modules')
      router.refresh()
    } catch (err) {
      console.error('Error updating module:', err)
      alert('Gagal menyimpan pembaruan modul.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 bg-rose-50 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="h-7 w-48 bg-rose-50 rounded-lg" />
            <div className="h-4 w-72 bg-rose-50 rounded-lg" />
          </div>
        </div>
        <div className="bg-white rounded-3xl h-64 border border-rose-100/40" />
      </div>
    )
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
              Edit Modul Pembelajaran
            </h2>
            <p className="text-sm text-gray-500">
              Modifikasi metadata modul atau isi materi bacaan level beginner/intermediate.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold shadow-sm transition-all min-h-[44px] cursor-pointer disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
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
