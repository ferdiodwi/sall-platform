'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Edit3, 
  Plus, 
  Compass, 
  Check, 
  X, 
  BookOpen, 
  Bookmark, 
  Eye,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface VocabWord {
  id: string
  word: string
  meaning: string
  example: string
  emoji: string
  category: string
  level: 'beginner' | 'intermediate'
}

interface VocabPageProps {
  params: Promise<{ id: string }>
}

export default function ManageVocabPage({ params }: VocabPageProps) {
  const router = useRouter()
  const supabase = createClient()
  const { id: moduleId } = React.use(params)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [moduleTitle, setModuleTitle] = useState('')
  const [moduleEmoji, setModuleEmoji] = useState('👗')

  // Vocabulary List State
  const [vocabList, setVocabList] = useState<VocabWord[]>([])
  const [activeTab, setActiveTab] = useState<'beginner' | 'intermediate'>('beginner')

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')
  const [example, setExample] = useState('')
  const [emoji, setEmoji] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    fetchModuleAndVocab()
  }, [moduleId])

  const fetchModuleAndVocab = async () => {
    try {
      setLoading(true)

      // Fetch Module details
      const { data: moduleData, error: modErr } = await supabase
        .from('modules')
        .select('title, emoji')
        .eq('id', moduleId)
        .single() as any

      if (modErr) throw modErr
      setModuleTitle(moduleData.title)
      setModuleEmoji(moduleData.emoji || '👗')

      // Fetch Vocab words
      const { data: vocabData, error: vocabErr } = await supabase
        .from('vocab_words')
        .select('*')
        .eq('module_id', moduleId)
        .order('created_at', { ascending: true }) as any

      if (vocabErr) throw vocabErr
      setVocabList(vocabData || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      alert('Gagal memuat data kosakata.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetForm = () => {
    setEditingId(null)
    setWord('')
    setMeaning('')
    setExample('')
    setEmoji('')
    setCategory('')
  }

  const handleEditClick = (v: VocabWord) => {
    setEditingId(v.id)
    setWord(v.word)
    setMeaning(v.meaning)
    setExample(v.example)
    setEmoji(v.emoji)
    setCategory(v.category)
  }

  const handleSaveVocab = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!word.trim() || !meaning.trim() || !example.trim() || !category.trim()) {
      alert('Semua kolom formulir harus diisi!')
      return
    }

    // Validasi sederhana untuk memastikan kata ada di dalam contoh kalimat
    const isWordInExample = example.toLowerCase().includes(word.toLowerCase().trim())
    if (!isWordInExample) {
      alert(`Peringatan: Contoh kalimat harus mengandung kata "${word}" agar kuis Fill-in-the-Blank dapat digenerate otomatis!`)
      return
    }

    try {
      setSaving(true)

      if (editingId) {
        // Mode Update
        const { error } = await (supabase.from('vocab_words') as any)
          .update({
            word: word.trim(),
            meaning: meaning.trim(),
            example: example.trim(),
            emoji: emoji.trim() || '🏷️',
            category: category.trim(),
            level: activeTab
          })
          .eq('id', editingId)

        if (error) throw error

        setVocabList(prev => prev.map(item => item.id === editingId ? {
          ...item,
          word: word.trim(),
          meaning: meaning.trim(),
          example: example.trim(),
          emoji: emoji.trim() || '🏷️',
          category: category.trim(),
          level: activeTab
        } : item))
      } else {
        // Mode Insert
        const { data, error } = await (supabase.from('vocab_words') as any)
          .insert({
            module_id: moduleId,
            word: word.trim(),
            meaning: meaning.trim(),
            example: example.trim(),
            emoji: emoji.trim() || '🏷️',
            category: category.trim(),
            level: activeTab
          })
          .select()
          .single()

        if (error) throw error
        if (data) {
          setVocabList(prev => [...prev, data as any])
        }
      }

      handleResetForm()
    } catch (err) {
      console.error('Error saving vocab:', err)
      alert('Gagal menyimpan kosakata.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteVocab = async (id: string, wordText: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kata "${wordText}"?`)) return

    try {
      const { error } = await (supabase.from('vocab_words') as any)
        .delete()
        .eq('id', id)

      if (error) throw error

      setVocabList(prev => prev.filter(item => item.id !== id))
      if (editingId === id) handleResetForm()
    } catch (err) {
      console.error('Error deleting vocab:', err)
      alert('Gagal menghapus kosakata.')
    }
  }

  // Generate blank preview (auto-replace kata dengan garis bawah)
  const getBlankPreview = (text: string, w: string) => {
    if (!text || !w) return ''
    const regex = new RegExp(`\\b${w}\\b`, 'gi')
    return text.replace(regex, '_______')
  }

  const filteredVocab = vocabList.filter(v => v.level === activeTab)

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white rounded-3xl h-64 border border-rose-100/40" />
          <div className="lg:col-span-2 bg-white rounded-3xl h-96 border border-rose-100/40" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full">
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
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2" style={{ fontFamily: 'var(--font-playfair)' }}>
              <span>{moduleEmoji}</span>
              <span>Kelola Kosakata Modul</span>
            </h2>
            <p className="text-sm text-gray-500">
              Modul {moduleTitle}
            </p>
          </div>
        </div>

        <div className="flex border-b border-rose-100 gap-1 bg-white p-1 rounded-2xl border w-fit shadow-sm">
          <button
            onClick={() => { setActiveTab('beginner'); handleResetForm(); }}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
              activeTab === 'beginner'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-rose-500 hover:bg-rose-50/30'
            }`}
          >
             Beginner Level
          </button>
          <button
            onClick={() => { setActiveTab('intermediate'); handleResetForm(); }}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
              activeTab === 'intermediate'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-rose-500 hover:bg-rose-50/30'
            }`}
          >
             Intermediate Level
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-1 bg-white border border-rose-100 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
          <div>
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
              <Compass size={18} className="text-rose-500" />
              <span>{editingId ? 'Edit Kosakata' : 'Tambah Kosakata Baru'}</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Level aktif: <span className="font-semibold text-rose-500 uppercase">{activeTab}</span>
            </p>
          </div>

          <form onSubmit={handleSaveVocab} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Kata (Word) *</label>
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Misal: Hemline, Seam, Cotton"
                className="w-full px-4 py-2.5 border border-rose-100 rounded-xl text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 bg-rose-50/10"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Emoji</label>
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  placeholder="👕"
                  className="w-full text-center px-2 py-2.5 border border-rose-100 rounded-xl text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 bg-rose-50/10"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Kategori *</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Misal: Fabric, Part, Tools"
                  className="w-full px-4 py-2.5 border border-rose-100 rounded-xl text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 bg-rose-50/10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Arti (Meaning) *</label>
              <input
                type="text"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                placeholder="Misal: Garis keliman bawah pakaian"
                className="w-full px-4 py-2.5 border border-rose-100 rounded-xl text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 bg-rose-50/10"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Contoh Kalimat *</label>
              <textarea
                value={example}
                onChange={(e) => setExample(e.target.value)}
                placeholder="Misal: She adjusted the hemline of the skirt to make it shorter."
                rows={3}
                className="w-full px-4 py-2.5 border border-rose-100 rounded-xl text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 bg-rose-50/10 resize-none"
                required
              />
            </div>

            {/* Live Fill-in-Blank Preview */}
            {word.trim() && example.trim() && (
              <div className="bg-rose-50/45 border border-rose-100 p-3.5 rounded-2xl flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-rose-500 uppercase flex items-center gap-1">
                  <Eye size={12} />
                  <span>Preview Soal Rumpang (Fill in Blank)</span>
                </span>
                <p className="text-xs text-gray-600 font-medium italic">
                  "{getBlankPreview(example, word.trim())}"
                </p>
                {!example.toLowerCase().includes(word.toLowerCase().trim()) && (
                  <p className="text-[9px] text-red-500 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle size={10} />
                    Contoh kalimat harus memuat kata "{word.trim()}"!
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                <Save size={14} />
                {saving ? 'Menyimpan...' : editingId ? 'Simpan' : 'Tambah'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2.5 border border-rose-100 hover:bg-rose-50 text-gray-500 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 bg-white border border-rose-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4 min-h-[400px]">
          <div>
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
              <Bookmark size={18} className="text-rose-500" />
              <span>Daftar Kosakata ({filteredVocab.length})</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Daftar kosakata terdaftar untuk level ini yang akan muncul di aktivitas belajar siswa.
            </p>
          </div>

          {filteredVocab.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-3">
                <Compass size={28} />
              </div>
              <h4 className="text-sm font-bold text-gray-700">Belum Ada Kosakata</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-[280px]">
                Silakan tambahkan beberapa kosakata baru di formulir sebelah kiri untuk memulai modul ini.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredVocab.map((v) => (
                <div 
                  key={v.id}
                  className={`p-4 border rounded-2xl transition-all flex flex-col gap-2 relative ${
                    editingId === v.id 
                      ? 'border-rose-300 bg-rose-50/20 ring-1 ring-rose-300' 
                      : 'border-rose-100/60 bg-rose-50/5 hover:bg-rose-50/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl w-10 h-10 rounded-xl bg-white border border-rose-100 flex items-center justify-center shadow-sm">
                        {v.emoji || '🏷️'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-800">{v.word}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-500 border border-rose-100/50">
                            {v.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{v.meaning}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditClick(v)}
                        className="p-1.5 hover:bg-rose-50 text-gray-500 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                        title="Edit Kosakata"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteVocab(v.id, v.word)}
                        className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Kosakata"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-rose-100/40 pt-2 flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Contoh Kalimat:</span>
                    <p className="text-xs text-gray-600 italic">"{v.example}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
