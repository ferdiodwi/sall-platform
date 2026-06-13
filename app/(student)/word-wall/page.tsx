'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Plus, Search, Tag, Eye, Heart, HelpCircle, Sparkles, X, Award, Check } from 'lucide-react'
import WordWallItem from '@/components/student/WordWallItem'

interface WordWallWord {
  id: string
  word: string
  meaning: string
  example: string | null
  image_url: string | null
  status: string
  review_history: any
  created_at: string
}

export default function WordWallPage() {
  const supabase = createClient()
  const { user } = useAuth()

  // State Management
  const [items, setItems] = useState<WordWallWord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'semua' | 'baru' | 'sedang dipelajari' | 'dikuasai'>('semua')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal Form States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [wordInput, setWordInput] = useState('')
  const [meaningInput, setMeaningInput] = useState('')
  const [exampleInput, setExampleInput] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Fetch Word Wall Items
  useEffect(() => {
    if (!user) return

    const fetchWordWall = async () => {
      try {
        setLoading(true)
        const { data, error } = await (supabase
          .from('word_wall') as any)
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        if (data) {
          setItems(data)
        }
      } catch (err) {
        console.error('Error fetching word wall:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWordWall()
  }, [user, supabase])

  // Handle word status change
  const handleStatusChange = async (id: string, newStatus: string, currentHistory: any[]) => {
    try {
      const { error } = await (supabase
        .from('word_wall') as any)
        .update({
          status: newStatus,
          review_history: currentHistory,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus, review_history: currentHistory } : item
        )
      )

      // Trigger badge check on status change
      await checkVocabularyMasterBadge(items.length)
    } catch (err) {
      console.error('Error changing word status:', err)
      alert('Gagal memperbarui status kata.')
    }
  }

  // Handle word delete
  const handleDelete = async (id: string) => {
    try {
      const { error } = await (supabase
        .from('word_wall') as any)
        .delete()
        .eq('id', id)

      if (error) throw error

      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      console.error('Error deleting word:', err)
      alert('Gagal menghapus kata dari Word Wall.')
    }
  }

  // Check and trigger badge Vocabulary Master if word count >= 50
  const checkVocabularyMasterBadge = async (currentCount: number) => {
    if (!user || currentCount < 50) return
    try {
      // Call secure award-xp with badge_check event to trigger badge award
      await fetch('/api/award-xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          event: 'badge_check',
        }),
      })
    } catch (err) {
      console.error('Error awarding Vocabulary Master badge:', err)
    }
  }

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || submitting) return

    if (!wordInput.trim() || !meaningInput.trim()) {
      alert('Harap isi kata bahasa Inggris dan artinya.')
      return
    }

    // Duplicate Check (case insensitive)
    const isDuplicate = items.some(
      (item) => item.word.toLowerCase().trim() === wordInput.toLowerCase().trim()
    )
    if (isDuplicate) {
      alert('Kosakata ini sudah ada di Word Wall kamu!')
      return
    }

    try {
      setSubmitting(true)
      let imageUrl: string | null = null

      // Upload Image to Supabase Storage if selected
      if (imageFile) {
        // Validate file size (max 5 MB)
        if (imageFile.size > 5 * 1024 * 1024) {
          alert('Ukuran gambar melebihi batas maksimal 5 MB.')
          setSubmitting(false)
          return
        }

        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        try {
          let { error: uploadErr } = await supabase.storage
            .from('word-wall-images')
            .upload(fileName, imageFile)

          // If bucket doesn't exist, create it (defensive check)
          if (uploadErr && uploadErr.message.toLowerCase().includes('not found')) {
            await supabase.storage.createBucket('word-wall-images', { public: true })
            const { error: retryErr } = await supabase.storage
              .from('word-wall-images')
              .upload(fileName, imageFile)
            if (retryErr) throw retryErr
            uploadErr = null
          } else if (uploadErr) {
            throw uploadErr
          }

          const { data: urlData } = supabase.storage
            .from('word-wall-images')
            .getPublicUrl(fileName)
          
          imageUrl = urlData?.publicUrl || null
        } catch (err) {
          console.error('Storage upload failed, saving without image:', err)
        }
      }

      // Insert to Database
      const { data, error } = await (supabase
        .from('word_wall') as any)
        .insert({
          user_id: user.id,
          word: wordInput.trim(),
          meaning: meaningInput.trim(),
          example: exampleInput.trim() || null,
          image_url: imageUrl,
          status: 'baru',
          review_history: [{ reviewedAt: new Date().toISOString(), status: 'baru' }],
        })
        .select()
        .single() as any

      if (error) throw error

      if (data) {
        const updatedList = [data, ...items]
        setItems(updatedList)
        setIsModalOpen(false)

        // Reset inputs
        setWordInput('')
        setMeaningInput('')
        setExampleInput('')
        setImageFile(null)

        // Trigger badge check on new count
        await checkVocabularyMasterBadge(updatedList.length)
      }
    } catch (err: any) {
      console.error('Error inserting word:', err)
      alert(err.message || 'Gagal menyimpan kosakata baru.')
    } finally {
      setSubmitting(false)
    }
  }

  // Filter & Search Items
  const filteredItems = items.filter((item) => {
    const matchesFilter = filter === 'semua' || item.status === filter
    const matchesSearch =
      item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meaning.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Stats Counters
  const totalCount = items.length
  const baruCount = items.filter((i) => i.status === 'baru').length
  const belajarCount = items.filter((i) => i.status === 'sedang dipelajari').length
  const dikuasaiCount = items.filter((i) => i.status === 'dikuasai').length

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
        <span className="text-sm font-bold text-rose-500 uppercase tracking-widest animate-pulse">Memuat Word Wall...</span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute -right-10 -bottom-10 opacity-10 text-white text-9xl">💎</div>
        <div className="flex flex-col gap-2 text-center md:text-left z-10">
          <span className="bg-white/20 text-white border border-white/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest self-center md:self-start">
            Vocabulary SRS
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">My Word Wall</h2>
          <p className="text-xs md:text-sm font-semibold text-rose-50 leading-relaxed max-w-md">
            Kumpulkan kosakata bahasa Inggris fashion di sini. Atur status belajarmu untuk mencapai penguasaan kata yang sempurna!
          </p>
        </div>
        <div className="z-10 shrink-0">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-white hover:bg-rose-50 text-rose-600 border-0 font-bold px-6 py-5 rounded-2xl shadow-lg cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>Tambah Kata</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-rose-100 rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-sm">
          <BookOpen className="text-rose-500 mb-1" size={20} />
          <span className="text-xl font-bold text-gray-800">{totalCount}</span>
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Total Kata</span>
        </div>

        <div className="bg-white border border-rose-100 rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-sm">
          <HelpCircle className="text-purple-500 mb-1" size={20} />
          <span className="text-xl font-bold text-gray-800">{baruCount}</span>
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Baru</span>
        </div>

        <div className="bg-white border border-rose-100 rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-sm">
          <Tag className="text-amber-500 mb-1" size={20} />
          <span className="text-xl font-bold text-gray-800">{belajarCount}</span>
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Dipakai Belajar</span>
        </div>

        <div className="bg-white border border-rose-100 rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-sm">
          <Award className="text-emerald-500 mb-1" size={20} />
          <span className="text-xl font-bold text-gray-800">{dikuasaiCount}</span>
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Dikuasai</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Tabs Filter */}
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-rose-100/50 w-full md:w-auto font-bold text-xs">
          {(['semua', 'baru', 'sedang dipelajari', 'dikuasai'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl transition-all capitalize whitespace-nowrap cursor-pointer
                ${filter === tab 
                  ? 'bg-white text-rose-600 shadow-sm font-black' 
                  : 'text-gray-500 hover:text-gray-850'
                }`}
            >
              {tab === 'sedang dipelajari' ? 'Mempelajari' : tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kata atau arti..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-250 focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 text-xs font-normal"
          />
          <Search className="absolute left-3.5 top-3.5 text-gray-400" size={14} />
        </div>
      </div>

      {/* Vocabulary Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-rose-100/80 rounded-3xl p-16 text-center flex flex-col items-center gap-3">
          <p className="text-sm text-gray-400 font-bold">Tidak ada kosakata yang cocok ditemukan.</p>
          {items.length === 0 && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-5 py-3 rounded-xl shadow-md cursor-pointer mt-1 text-xs"
            >
              Tambah Kata Pertamamu!
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <WordWallItem
              key={item.id}
              item={item}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add Word Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-rose-100 rounded-3xl w-full max-w-lg shadow-2xl p-6 overflow-hidden flex flex-col gap-6 animate-in scale-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-rose-50 pb-4">
              <h3 className="font-extrabold text-base text-gray-800 flex items-center gap-1.5">
                <Sparkles size={18} className="text-rose-500 animate-pulse" />
                <span>Tambah Kosakata Baru</span>
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </Button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Kata Bahasa Inggris (EN) *
                </label>
                <input
                  type="text"
                  required
                  value={wordInput}
                  onChange={(e) => setWordInput(e.target.value)}
                  placeholder="Misal: Fabric, Sewing, Velvet..."
                  className="w-full p-3.5 rounded-xl border border-gray-250 focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 text-xs font-normal"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Arti Bahasa Indonesia (ID) *
                </label>
                <input
                  type="text"
                  required
                  value={meaningInput}
                  onChange={(e) => setMeaningInput(e.target.value)}
                  placeholder="Misal: Kain, Menjahit, Beludru..."
                  className="w-full p-3.5 rounded-xl border border-gray-250 focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 text-xs font-normal"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Contoh Kalimat (Optional)
                </label>
                <textarea
                  value={exampleInput}
                  onChange={(e) => setExampleInput(e.target.value)}
                  placeholder="Misal: Velvet is a type of woven tufted fabric..."
                  rows={2}
                  className="w-full p-3.5 rounded-xl border border-gray-255 focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 text-xs font-normal leading-relaxed italic placeholder:not-italic"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex justify-between">
                  <span>Upload Gambar (Optional)</span>
                  <span className="text-[10px] text-gray-400 lowercase">Maksimal 5 MB</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setImageFile(file)
                  }}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-50 file:text-rose-600 hover:file:bg-rose-100 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-rose-50/50">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-4 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-4 rounded-xl shadow-md cursor-pointer text-xs"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Kata'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
