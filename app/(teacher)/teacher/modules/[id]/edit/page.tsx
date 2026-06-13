'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import DOMPurify from 'dompurify'
import { ArrowLeft, Save, Sparkles, Plus, Trash2, GripVertical, BookOpen } from 'lucide-react'
import Link from 'next/link'

const WysiwygEditor = dynamic(
  () => import('@/components/teacher/WysiwygEditor').then(mod => mod.WysiwygEditor),
  { ssr: false, loading: () => <div className="h-48 border border-rose-100 rounded-xl bg-rose-50/20 animate-pulse flex items-center justify-center text-sm text-rose-400">Memuat Editor Teks...</div> }
)

interface EditModuleProps {
  params: Promise<{ id: string }>
}

interface VocabWord {
  id: string
  word: string
  meaning: string
  example: string
  emoji: string
  category: string
  order: number
  level: 'beginner' | 'intermediate'
}

const EMPTY_WORD: Omit<VocabWord, 'id' | 'order'> = { word: '', meaning: '', example: '', emoji: '✨', category: 'General', level: 'beginner' }

export default function EditModulePage({ params }: EditModuleProps) {
  const router = useRouter()
  const supabase = createClient()
  const { id: moduleId } = React.use(params)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [number, setNumber] = useState('')
  const [title, setTitle] = useState('')
  const [tagline, setTagline] = useState('')
  const [emoji, setEmoji] = useState('')
  const [order, setOrder] = useState('')
  const [activeTab, setActiveTab] = useState<'beginner' | 'intermediate' | 'vocab_beginner' | 'vocab_intermediate'>('beginner')
  const [beginnerContent, setBeginnerContent] = useState('')
  const [intermediateContent, setIntermediateContent] = useState('')
  const [vocabBeginner, setVocabBeginner] = useState<VocabWord[]>([])
  const [vocabIntermediate, setVocabIntermediate] = useState<VocabWord[]>([])
  const [newWord, setNewWord] = useState({ ...EMPTY_WORD })
  const [addingVocab, setAddingVocab] = useState(false)
  const [savingVocab, setSavingVocab] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const currentVocabLevel = activeTab === 'vocab_beginner' ? 'beginner' : 'intermediate'
  const vocabList = activeTab === 'vocab_beginner' ? vocabBeginner : vocabIntermediate
  const setVocabList = activeTab === 'vocab_beginner' ? setVocabBeginner : setVocabIntermediate

  const fetchModuleData = useCallback(async () => {
    try {
      setLoading(true)
      const [{ data: moduleData, error: modErr }, { data: levelsData }, { data: vocabData }] = await Promise.all([
        supabase.from('modules').select('*').eq('id', moduleId).single() as any,
        supabase.from('levels').select('*').eq('module_id', moduleId) as any,
        supabase.from('vocab_words').select('*').eq('module_id', moduleId).order('order', { ascending: true }) as any,
      ])
      if (modErr) throw modErr
      setNumber(moduleData.number.toString())
      setTitle(moduleData.title)
      setTagline(moduleData.tagline || '')
      setEmoji(moduleData.emoji || '📖')
      setOrder(moduleData.order.toString())
      const beg = levelsData?.find((l: any) => l.level === 'beginner')
      const int = levelsData?.find((l: any) => l.level === 'intermediate')
      if (beg) setBeginnerContent(beg.content_html || '')
      if (int) setIntermediateContent(int.content_html || '')
      setVocabBeginner((vocabData || []).filter((v: any) => v.level === 'beginner'))
      setVocabIntermediate((vocabData || []).filter((v: any) => v.level === 'intermediate'))
    } catch (err) { console.error(err); alert('Gagal mengambil data modul.') }
    finally { setLoading(false) }
  }, [moduleId])

  useEffect(() => { fetchModuleData() }, [fetchModuleData])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!number || !title || !order) { alert('Nomor modul, Judul, dan Urutan wajib diisi!'); return }
    try {
      setSaving(true)
      await Promise.all([
        (supabase.from('modules') as any).update({ number: parseInt(number), title, tagline: tagline || null, emoji: emoji || '📖', order: parseInt(order), updated_at: new Date().toISOString() }).eq('id', moduleId),
        (supabase.from('levels') as any).upsert({ module_id: moduleId, level: 'beginner', content_html: DOMPurify.sanitize(beginnerContent), updated_at: new Date().toISOString() }, { onConflict: 'module_id,level' }),
        (supabase.from('levels') as any).upsert({ module_id: moduleId, level: 'intermediate', content_html: DOMPurify.sanitize(intermediateContent), updated_at: new Date().toISOString() }, { onConflict: 'module_id,level' }),
      ])
      router.push('/teacher/modules')
      router.refresh()
    } catch (err) { console.error(err); alert('Gagal menyimpan pembaruan modul.') }
    finally { setSaving(false) }
  }

  const handleAddVocab = async () => {
    if (!newWord.word.trim() || !newWord.meaning.trim() || !newWord.example.trim()) { alert('Kata, arti, dan contoh kalimat wajib diisi!'); return }
    try {
      setSavingVocab(true)
      const { data, error } = await (supabase.from('vocab_words') as any).insert({
        module_id: moduleId, level: currentVocabLevel, word: newWord.word.trim(),
        meaning: newWord.meaning.trim(), example: newWord.example.trim(),
        emoji: newWord.emoji || '✨', category: newWord.category || 'General',
        order: vocabList.length,
      }).select().single()
      if (error) throw error
      setVocabList((prev: VocabWord[]) => [...prev, data])
      setNewWord({ ...EMPTY_WORD })
      setAddingVocab(false)
    } catch (err) { console.error(err); alert('Gagal menambahkan kosakata.') }
    finally { setSavingVocab(false) }
  }

  const handleDeleteVocab = async (id: string) => {
    if (!confirm('Hapus kosakata ini?')) return
    try {
      setDeletingId(id)
      const { error } = await (supabase.from('vocab_words') as any).delete().eq('id', id)
      if (error) throw error
      setVocabList((prev: VocabWord[]) => prev.filter(v => v.id !== id))
    } catch (err) { console.error(err); alert('Gagal menghapus kosakata.') }
    finally { setDeletingId(null) }
  }

  if (loading) return (
    <div className="flex flex-col gap-8 w-full animate-pulse">
      <div className="flex items-center gap-3"><div className="h-11 w-11 bg-rose-50 rounded-xl" /><div className="flex-1 space-y-2"><div className="h-7 w-48 bg-rose-50 rounded-lg" /><div className="h-4 w-72 bg-rose-50 rounded-lg" /></div></div>
      <div className="bg-white rounded-3xl h-64 border border-rose-100/40" />
    </div>
  )

  const tabs = [
    { key: 'beginner', label: '🟢 Materi Beginner' },
    { key: 'intermediate', label: '🔵 Materi Intermediate' },
    { key: 'vocab_beginner', label: '📖 Kosakata Beginner' },
    { key: 'vocab_intermediate', label: '📖 Kosakata Intermediate' },
  ] as const

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/teacher/modules" className="p-2 hover:bg-rose-50 text-gray-500 hover:text-rose-500 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border border-rose-100">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'var(--font-playfair)' }}>Edit Modul Pembelajaran</h2>
            <p className="text-sm text-gray-500">Modifikasi metadata, isi materi, dan daftar kosakata interaktif.</p>
          </div>
        </div>
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold shadow-sm transition-all min-h-[44px] cursor-pointer disabled:opacity-50">
          <Save size={16} />
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

      {/* Metadata */}
      <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Nomor Modul *', value: number, setter: setNumber, type: 'number' },
          { label: 'Urutan Tampil *', value: order, setter: setOrder, type: 'number' },
          { label: 'Emoji *', value: emoji, setter: setEmoji, type: 'text' },
        ].map(f => (
          <div key={f.label}>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{f.label}</label>
            <input type={f.type} value={f.value} onChange={e => f.setter(e.target.value)} className="w-full px-4 py-3 border border-rose-100 rounded-xl text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 bg-rose-50/10 min-h-[44px]" required />
          </div>
        ))}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Judul Modul *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 border border-rose-100 rounded-xl text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 bg-rose-50/10 min-h-[44px]" required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Tagline Deskripsi</label>
          <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} className="w-full px-4 py-3 border border-rose-100 rounded-xl text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 bg-rose-50/10 min-h-[44px]" />
        </div>
      </div>

      {/* Content / Vocab Tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-1 bg-white p-1 rounded-2xl border border-rose-100 w-fit shadow-sm">
          {tabs.map(t => (
            <button key={t.key} type="button" onClick={() => setActiveTab(t.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[38px] ${activeTab === t.key ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-500 hover:text-rose-500 hover:bg-rose-50/30'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* WYSIWYG tabs */}
        {(activeTab === 'beginner' || activeTab === 'intermediate') && (
          <div className="space-y-4">
            <p className="text-xs text-gray-400 font-medium px-1">
              {activeTab === 'beginner' ? 'Tulis bahan ajar dan instruksi kosakata dasar busana untuk pemula.' : 'Tulis panduan kerja atau teks detail tata busana menengah.'}
            </p>
            <WysiwygEditor
              content={activeTab === 'beginner' ? beginnerContent : intermediateContent}
              onChange={activeTab === 'beginner' ? setBeginnerContent : setIntermediateContent}
            />
          </div>
        )}

        {/* Vocab tabs */}
        {(activeTab === 'vocab_beginner' || activeTab === 'vocab_intermediate') && (
          <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><BookOpen size={18} className="text-rose-500" /> Daftar Kosakata — {currentVocabLevel === 'beginner' ? '🟢 Beginner' : '🔵 Intermediate'}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Kosakata ini digunakan otomatis untuk Flashcards, Kamus Visual, Word Matching, dan Fill in Blank.</p>
              </div>
              <button type="button" onClick={() => setAddingVocab(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold transition-colors min-h-[40px]">
                <Plus size={16} /> Tambah Kata
              </button>
            </div>

            {/* Add form */}
            {addingVocab && (
              <div className="bg-rose-50/40 border border-rose-200 rounded-2xl p-5 space-y-4">
                <p className="text-sm font-bold text-rose-600">✏️ Tambah Kosakata Baru</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { label: 'Kata (Bahasa Inggris) *', key: 'word', placeholder: 'cotton' },
                    { label: 'Arti (Bahasa Indonesia) *', key: 'meaning', placeholder: 'kapas, kain katun' },
                    { label: 'Kategori', key: 'category', placeholder: 'Fabric' },
                    { label: 'Emoji', key: 'emoji', placeholder: '🧵' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">{f.label}</label>
                      <input type="text" placeholder={f.placeholder} value={(newWord as any)[f.key]}
                        onChange={e => setNewWord(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-rose-200 rounded-xl text-sm focus:outline-none focus:border-rose-400 bg-white min-h-[40px]" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Contoh Kalimat * <span className="normal-case text-gray-400 font-normal">(harus mengandung kata di atas — digunakan untuk Fill in Blank)</span></label>
                  <input type="text" placeholder='The shirt is made of cotton.' value={newWord.example}
                    onChange={e => setNewWord(prev => ({ ...prev, example: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-rose-200 rounded-xl text-sm focus:outline-none focus:border-rose-400 bg-white min-h-[40px]" />
                  {newWord.example && newWord.word && (
                    <p className="mt-2 text-xs text-gray-500">Preview Fill in Blank: <span className="font-semibold text-rose-600">{newWord.example.replace(new RegExp(newWord.word, 'i'), '_____')}</span></p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={handleAddVocab} disabled={savingVocab}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 min-h-[40px]">
                    <Save size={14} />{savingVocab ? 'Menyimpan...' : 'Simpan Kata'}
                  </button>
                  <button type="button" onClick={() => { setAddingVocab(false); setNewWord({ ...EMPTY_WORD }) }}
                    className="px-4 py-2 border border-gray-200 text-gray-500 rounded-xl text-sm font-semibold hover:bg-gray-50 min-h-[40px]">
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Vocab list */}
            {vocabList.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-3">📭</div>
                <p className="font-medium">Belum ada kosakata untuk level ini.</p>
                <p className="text-sm mt-1">Klik &quot;Tambah Kata&quot; untuk mulai mengisi.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {vocabList.map((v, idx) => (
                  <div key={v.id} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 group">
                    <GripVertical size={16} className="text-gray-300 shrink-0" />
                    <span className="text-2xl shrink-0">{v.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-bold text-gray-800 text-sm">{v.word}</span>
                        <span className="text-gray-400 text-xs">→</span>
                        <span className="text-rose-600 text-sm font-medium">{v.meaning}</span>
                        <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-md font-medium">{v.category}</span>
                      </div>
                      {v.example && <p className="text-xs text-gray-400 mt-0.5 italic truncate">&quot;{v.example}&quot;</p>}
                    </div>
                    <button type="button" onClick={() => handleDeleteVocab(v.id)} disabled={deletingId === v.id}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </form>
  )
}
