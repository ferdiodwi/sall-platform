'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  MessageSquare, 
  Star, 
  Pin, 
  Trash2, 
  Send, 
  Filter, 
  Sparkles,
  CheckCircle2
} from 'lucide-react'

interface ReviewItem {
  id: string
  module_id: string
  author_id: string
  rating: number
  comment: string | null
  emoji: string | null
  pinned: boolean
  teacher_reply: string | null
  created_at: string
  // Calculated / Joined fields
  student_name: string
  module_title: string
  module_number: number
}

export default function TeacherReviewsPage() {
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [modules, setModules] = useState<any[]>([])

  // Statistics
  const [avgRating, setAvgRating] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [starBreakdown, setStarBreakdown] = useState<number[]>([0, 0, 0, 0, 0])

  // Filters
  const [filterModule, setFilterModule] = useState('all')
  const [filterRating, setFilterRating] = useState('all')

  // Reply States (buffer per review id)
  const [replies, setReplies] = useState<{ [key: string]: string }>({})
  const [savingReplies, setSavingReplies] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Parallelkan fetch modules + reviews
      const [{ data: modulesData }, { data: reviewsData, error: rErr }] = await Promise.all([
        supabase.from('modules').select('id, number, title') as any,
        supabase.from('reviews').select('*').order('created_at', { ascending: false }) as any,
      ])

      const mods = modulesData || []
      setModules(mods)

      if (rErr) throw rErr
      const rawReviews = reviewsData || []

      // Fetch student names (depends on review author IDs)
      const authorIds = rawReviews.map((r: any) => r.author_id)
      let studentsList: any[] = []
      if (authorIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, name')
          .in('id', authorIds) as any
        studentsList = usersData || []
      }

      const formattedReviews = rawReviews.map((r: any) => {
        const mod = mods.find((m: any) => m.id === r.module_id)
        const student = studentsList.find((u: any) => u.id === r.author_id)
        return {
          ...r,
          student_name: student?.name || 'Siswa SALL',
          module_title: mod?.title || 'Modul',
          module_number: mod?.number || 0
        }
      })

      setReviews(formattedReviews)
      calculateStats(formattedReviews)
    } catch (err) {
      console.error('Error fetching reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (items: ReviewItem[]) => {
    setTotalCount(items.length)
    if (items.length === 0) {
      setAvgRating(0)
      setStarBreakdown([0, 0, 0, 0, 0])
      return
    }

    const sum = items.reduce((acc, curr) => acc + curr.rating, 0)
    setAvgRating(Math.round((sum / items.length) * 10) / 10)

    const breakdown = [0, 0, 0, 0, 0]
    items.forEach(item => {
      const starIndex = 5 - item.rating
      if (starIndex >= 0 && starIndex < 5) {
        breakdown[starIndex]++
      }
    })
    setStarBreakdown(breakdown)
  }

  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    try {
      const { error } = await (supabase.from('reviews') as any)
        .update({ pinned: !currentPinned })
        .eq('id', id)

      if (error) throw error

      setReviews(prev => prev.map(r => 
        r.id === id ? { ...r, pinned: !currentPinned } : r
      ))
    } catch (err) {
      console.error('Error toggling pin:', err)
    }
  }

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus review ini?')) return

    try {
      const { error } = await (supabase.from('reviews') as any)
        .delete()
        .eq('id', id)

      if (error) throw error

      setReviews(prev => {
        const updated = prev.filter(r => r.id !== id)
        calculateStats(updated)
        return updated
      })
    } catch (err) {
      console.error('Error deleting review:', err)
    }
  }

  const handleSendReply = async (id: string) => {
    const replyText = replies[id]
    if (!replyText || !replyText.trim()) return

    try {
      setSavingReplies(prev => ({ ...prev, [id]: true }))

      const { error } = await (supabase.from('reviews') as any)
        .update({
          teacher_reply: replyText.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      setReviews(prev => prev.map(r => 
        r.id === id ? { ...r, teacher_reply: replyText.trim() } : r
      ))

      // Clear buffer
      setReplies(prev => ({ ...prev, [id]: '' }))
    } catch (err) {
      console.error('Error sending reply:', err)
      alert('Gagal mengirim balasan.')
    } finally {
      setSavingReplies(prev => ({ ...prev, [id]: false }))
    }
  }

  const filteredReviews = reviews.filter(r => {
    const matchesModule = filterModule === 'all' || r.module_id === filterModule
    const matchesRating = filterRating === 'all' || r.rating.toString() === filterRating
    return matchesModule && matchesRating
  })

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full animate-pulse">
        <div className="h-8 w-48 bg-rose-50 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-white rounded-3xl border border-rose-100/40" />
          <div className="h-32 bg-white rounded-3xl border border-rose-100/40" />
          <div className="h-32 bg-white rounded-3xl border border-rose-100/40" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'var(--font-playfair)' }}>
          Review & Umpan Balik Siswa
        </h2>
        <p className="text-sm text-gray-500">
          Moderasilah tanggapan dan komentar siswa, beri pin review terpenting, atau balas pertanyaan mereka.
        </p>
      </div>

      {/* Review Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rating Rata-rata */}
        <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Rating Rata-rata</h4>
          <div className="flex items-baseline gap-2.5">
            <span className="text-5xl font-black text-gray-800">{avgRating}</span>
            <span className="text-base font-bold text-gray-400">/ 5.0</span>
          </div>
          <div className="flex gap-1.5 mt-3 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} fill={i < Math.round(avgRating) ? 'currentColor' : 'none'} />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2 font-medium">Dari total {totalCount} ulasan</p>
        </div>

        {/* Breakdown bar */}
        <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm md:col-span-2 flex flex-col gap-2.5">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Rincian Bintang</h4>
          {starBreakdown.map((count, index) => {
            const stars = 5 - index
            const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
            return (
              <div key={stars} className="flex items-center gap-3 text-xs font-medium">
                <span className="w-12 text-gray-500 flex items-center gap-1">
                  {stars} <Star size={12} fill="currentColor" className="text-amber-400" />
                </span>
                <div className="flex-1 h-2 bg-rose-50/50 border border-rose-100/10 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full" style={{ width: `${percentage}%` }} />
                </div>
                <span className="w-10 text-right text-gray-400">{count} ulasan</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Toolbar filters */}
      <div className="bg-white border border-rose-100 rounded-3xl p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-rose-600">
          <Filter size={18} />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-800">Filter Ulasan</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold">Modul:</span>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="px-3.5 py-1.5 border border-rose-100 rounded-xl text-xs bg-rose-50/10 focus:outline-none min-h-[36px]"
            >
              <option value="all">Semua Modul</option>
              {modules.map(m => (
                <option key={m.id} value={m.id}>Modul {m.number}: {m.title}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold">Rating:</span>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-3.5 py-1.5 border border-rose-100 rounded-xl text-xs bg-rose-50/10 focus:outline-none min-h-[36px]"
            >
              <option value="all">Semua Rating</option>
              <option value="5">5 Bintang</option>
              <option value="4">4 Bintang</option>
              <option value="3">3 Bintang</option>
              <option value="2">2 Bintang</option>
              <option value="1">1 Bintang</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews feed */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white border border-rose-100 rounded-3xl p-12 text-center text-xs text-gray-400 font-medium flex flex-col items-center justify-center gap-3">
          <MessageSquare className="w-8 h-8 text-rose-300 animate-pulse" />
          Tidak ada review siswa yang cocok dengan kriteria filter.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className={`bg-white border rounded-3xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden transition-all hover:shadow-md ${
                rev.pinned ? 'border-rose-300 ring-2 ring-rose-500/10' : 'border-rose-100'
              }`}
            >
              {/* Pin ribbon indicator */}
              {rev.pinned && (
                <div className="absolute top-0 right-0 bg-rose-500 text-white py-1 px-4 text-[9px] font-black uppercase tracking-wider rounded-bl-2xl flex items-center gap-1">
                  <Pin size={10} fill="currentColor" /> Pinned
                </div>
              )}

              {/* Reviewer Meta */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-800">{rev.student_name}</h4>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    Modul {rev.module_number}: {rev.module_title} | Dikirim: {new Date(rev.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>

                {/* Rating stars */}
                <div className="flex gap-0.5 text-amber-400 shrink-0 pr-12 md:pr-0">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < rev.rating ? 'currentColor' : 'none'} />
                  ))}
                </div>
              </div>

              {/* Comment text & emoji */}
              <div className="flex items-start gap-3 bg-rose-50/20 border border-rose-100/50 p-4 rounded-2xl">
                {rev.emoji && <span className="text-2xl shrink-0">{rev.emoji}</span>}
                <p className="text-xs text-gray-700 leading-normal font-normal">
                  {rev.comment || <span className="text-gray-400 italic">Siswa hanya memberikan rating.</span>}
                </p>
              </div>

              {/* Reply section */}
              {rev.teacher_reply ? (
                <div className="bg-rose-50/10 border border-rose-100/30 p-4 rounded-2xl ml-4 md:ml-8 flex flex-col gap-1.5 relative">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-rose-500 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Balasan Guru (Admin)
                  </span>
                  <p className="text-xs text-gray-650 leading-relaxed font-normal">
                    {rev.teacher_reply}
                  </p>
                </div>
              ) : (
                <div className="ml-4 md:ml-8 flex gap-2">
                  <input
                    type="text"
                    value={replies[rev.id] || ''}
                    onChange={(e) => setReplies({ ...replies, [rev.id]: e.target.value })}
                    placeholder="Tulis balasan atau penjelasan di sini..."
                    className="flex-1 px-4 py-2 border border-rose-100 rounded-xl text-xs bg-rose-50/10 focus:outline-none focus:border-rose-400 focus:bg-white font-normal min-h-[38px]"
                  />
                  <button
                    onClick={() => handleSendReply(rev.id)}
                    disabled={savingReplies[rev.id]}
                    className="px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1 min-h-[38px] cursor-pointer"
                  >
                    <Send size={12} /> Kirim
                  </button>
                </div>
              )}

              {/* Control Actions */}
              <div className="flex items-center justify-between border-t border-rose-50 pt-3 mt-1 text-[11px] font-semibold text-gray-500">
                <button
                  onClick={() => handleTogglePin(rev.id, rev.pinned)}
                  className={`flex items-center gap-1 hover:text-rose-600 cursor-pointer ${
                    rev.pinned ? 'text-rose-500' : ''
                  }`}
                >
                  <Pin size={12} fill={rev.pinned ? 'currentColor' : 'none'} />
                  {rev.pinned ? 'Lepas Sematan' : 'Sematkan Review'}
                </button>

                <button
                  onClick={() => handleDeleteReview(rev.id)}
                  className="flex items-center gap-1 hover:text-red-500 text-red-400 cursor-pointer"
                >
                  <Trash2 size={12} />
                  Hapus Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
