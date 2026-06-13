'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Flame, Star, Calendar as CalendarIcon, ArrowLeft, ArrowRight, BookOpen, AlertCircle, Goal, Sparkles, CheckCircle2 } from 'lucide-react'
import JournalEntry from '@/components/student/JournalEntry'

interface Journal {
  id: string
  learned: string | null
  difficult: string | null
  goal: string | null
  created_at: string
}

export default function JournalPage() {
  const supabase = createClient()
  const { user } = useAuth()

  // State Management
  const [journals, setJournals] = useState<Journal[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [todayJournal, setTodayJournal] = useState<Journal | null>(null)

  // Form States
  const [learned, setLearned] = useState('')
  const [difficult, setDifficult] = useState('')
  const [goal, setGoal] = useState('')

  // Calendar States
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDateEntry, setSelectedDateEntry] = useState<Journal | null>(null)

  // Helper calculation for start & end of today in local time
  const getTodayRange = () => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }

  // Fetch journal entries
  useEffect(() => {
    if (!user) return

    const fetchJournals = async () => {
      try {
        setLoading(true)
        const { data, error } = await (supabase
          .from('journals') as any)
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        if (data) {
          const formattedData = data as Journal[]
          setJournals(formattedData)

          // Cek apakah ada entri jurnal hari ini
          const { start, end } = getTodayRange()
          const todayEnt = formattedData.find(
            (j) => {
              const d = new Date(j.created_at)
              return d >= start && d <= end
            }
          )
          if (todayEnt) {
            setTodayJournal(todayEnt)
            setSelectedDateEntry(todayEnt)
          }
        }
      } catch (err) {
        console.error('Error fetching journals:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchJournals()
  }, [user, supabase])

  // Handle Journal Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || submitting) return

    if (!learned.trim() || !difficult.trim() || !goal.trim()) {
      alert('Harap isi semua prompt refleksi jurnal.')
      return
    }

    try {
      setSubmitting(true)

      // 1. Insert ke tabel journals
      const { data, error } = await (supabase
        .from('journals') as any)
        .insert({
          user_id: user.id,
          learned: learned.trim(),
          difficult: difficult.trim(),
          goal: goal.trim(),
        })
        .select()
        .single() as any

      if (error) throw error

      if (data) {
        setTodayJournal(data)
        setJournals((prev) => [data, ...prev])
        setSelectedDateEntry(data)

        // 2. Tambah +10 XP via secure route
        await fetch('/api/award-xp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            event: 'journal_write',
          }),
        })
      }
    } catch (err: any) {
      console.error('Error saving journal:', err)
      alert(err.message || 'Gagal menyimpan entri jurnal.')
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate Streak
  const getStreak = () => {
    if (journals.length === 0) return 0
    
    // Ambil tanggal unik (Format: YYYY-MM-DD)
    const uniqueDates = Array.from(
      new Set(journals.map((j) => new Date(j.created_at).toLocaleDateString('en-CA')))
    )
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime())

    const today = new Date()
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const firstEntryDate = uniqueDates[0]
    const firstEntryDateOnly = new Date(
      firstEntryDate.getFullYear(),
      firstEntryDate.getMonth(),
      firstEntryDate.getDate()
    )

    const diffTime = todayDateOnly.getTime() - firstEntryDateOnly.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 1) {
      return 0 // Streak terputus
    }

    let streak = 1
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const current = new Date(
        uniqueDates[i].getFullYear(),
        uniqueDates[i].getMonth(),
        uniqueDates[i].getDate()
      )
      const next = new Date(
        uniqueDates[i + 1].getFullYear(),
        uniqueDates[i + 1].getMonth(),
        uniqueDates[i + 1].getDate()
      )
      const dayDiff = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24))
      if (dayDiff === 1) {
        streak++
      } else if (dayDiff > 1) {
        break
      }
    }
    return streak
  }

  // Calendar Helpers
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayIndex = new Date(year, month, 1).getDay()

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // Get Journal Entry for specific calendar day
  const getEntryForDay = (dayNum: number) => {
    return journals.find((j) => {
      const date = new Date(j.created_at)
      return (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === dayNum
      )
    })
  }

  // Current Month Stats
  const entriesThisMonth = journals.filter((j) => {
    const d = new Date(j.created_at)
    return d.getFullYear() === year && d.getMonth() === month
  }).length

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
        <span className="text-sm font-bold text-rose-500 uppercase tracking-widest animate-pulse">Memuat Jurnal...</span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute -right-10 -bottom-10 opacity-10 text-white text-9xl">📖</div>
        <div className="flex flex-col gap-2 text-center md:text-left z-10">
          <span className="bg-white/20 text-white border border-white/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest self-center md:self-start">
            Refleksi Harian
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">Jurnal Digital</h2>
          <p className="text-xs md:text-sm font-semibold text-rose-50 leading-relaxed max-w-md">
            Luangkan waktu 5 menit setiap hari untuk menulis progres, kendala, dan target belajarmu. Dapatkan +10 XP setiap hari!
          </p>
        </div>
        
        {/* Streak & Count Stats */}
        <div className="flex gap-4 shrink-0 z-10">
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 p-4 rounded-2xl backdrop-blur-sm shadow-inner">
            <Flame className="text-amber-300 animate-pulse" size={24} />
            <div className="text-left">
              <span className="text-[10px] font-extrabold uppercase text-rose-100">Streak Menulis</span>
              <p className="text-lg font-black leading-none mt-0.5">{getStreak()} Hari</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 p-4 rounded-2xl backdrop-blur-sm shadow-inner">
            <Star className="text-yellow-300" size={24} />
            <div className="text-left">
              <span className="text-[10px] font-extrabold uppercase text-rose-100">Total Jurnal</span>
              <p className="text-lg font-black leading-none mt-0.5">{journals.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Tulis Jurnal Baru (Kiri / Kolom 1-2) */}
        <div className="lg:col-span-2 space-y-8">
          {todayJournal ? (
            <div className="bg-rose-50/20 border border-rose-100 rounded-3xl p-6 md:p-8 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shadow-inner">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-800">Catatan Hari Ini Selesai!</h3>
                <p className="text-xs text-gray-400 font-semibold mt-1">
                  Kamu telah menyelesaikan refleksi jurnal kamu hari ini. Kembali lagi besok!
                </p>
              </div>
              <div className="w-full text-left mt-4">
                <JournalEntry entry={todayJournal} />
              </div>
            </div>
          ) : (
            <Card className="border-rose-100 bg-white shadow-sm rounded-3xl p-6">
              <CardHeader className="p-0 pb-6 border-b border-rose-50">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Sparkles size={20} className="text-rose-500 animate-pulse" />
                  <span>Refleksi Belajar Hari Ini</span>
                </CardTitle>
                <CardDescription className="text-xs text-gray-400">
                  Tuliskan refleksi singkat tentang proses belajarmu hari ini (Maksimal 300 karakter per bagian).
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6 pt-6">
                
                {/* Learned Prompt */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-rose-500 uppercase tracking-wider flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={14} />
                      1. Hari ini saya belajar tentang...
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold">{learned.length}/300</span>
                  </label>
                  <textarea
                    value={learned}
                    onChange={(e) => setLearned(e.target.value.slice(0, 300))}
                    placeholder="Misal: Saya belajar kosakata jenis kain seperti Silk, Cotton, dan Velvet di modul 2..."
                    rows={3}
                    className="w-full p-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 text-sm font-normal leading-relaxed italic placeholder:not-italic"
                  />
                </div>

                {/* Difficult Prompt */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-amber-600 uppercase tracking-wider flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle size={14} />
                      2. Yang masih saya bingungkan adalah...
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold">{difficult.length}/300</span>
                  </label>
                  <textarea
                    value={difficult}
                    onChange={(e) => setDifficult(e.target.value.slice(0, 300))}
                    placeholder="Misal: Saya masih bingung membedakan penyebutan pola jahitan stripes dan plaid..."
                    rows={3}
                    className="w-full p-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 text-sm font-normal leading-relaxed italic placeholder:not-italic"
                  />
                </div>

                {/* Goal Prompt */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-emerald-600 uppercase tracking-wider flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <Goal size={14} />
                      3. Target saya minggu depan adalah...
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold">{goal.length}/300</span>
                  </label>
                  <textarea
                    value={goal}
                    onChange={(e) => setGoal(e.target.value.slice(0, 300))}
                    placeholder="Misal: Saya ingin menguasai minimal 20 kosakata baru tentang pola busana..."
                    rows={3}
                    className="w-full p-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-normal leading-relaxed italic placeholder:not-italic"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-8 py-5 rounded-2xl shadow-md cursor-pointer"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Jurnal & Dapatkan +10 XP'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Viewer Detil Hari yang Diklik dari Kalender */}
          {selectedDateEntry && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider pl-1">
                Catatan Terpilih:
              </h3>
              <JournalEntry entry={selectedDateEntry} />
            </div>
          )}
        </div>

        {/* Kalender Riwayat Jurnal & Statistik (Kanan / Kolom 3) */}
        <div className="space-y-8">
          <Card className="border-rose-100 bg-white shadow-sm rounded-3xl p-6">
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-extrabold text-gray-700 flex items-center gap-1.5">
                <CalendarIcon size={16} className="text-rose-500" />
                <span>Riwayat Kalender</span>
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={prevMonth} className="h-7 w-7 rounded-lg">
                  <ArrowLeft size={14} />
                </Button>
                <span className="text-xs font-bold text-gray-800 min-w-[70px] text-center">
                  {monthNames[month]} {year}
                </span>
                <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7 rounded-lg">
                  <ArrowRight size={14} />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Days Grid Header */}
              <div className="grid grid-cols-7 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                <span>M</span><span>S</span><span>S</span><span>R</span><span>K</span><span>J</span><span>S</span>
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {/* Empty columns for first week offset */}
                {Array.from({ length: firstDayIndex }).map((_, idx) => (
                  <div key={`empty-${idx}`} />
                ))}
                
                {/* Month Days */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1
                  const entry = getEntryForDay(dayNum)
                  const isSelected = selectedDateEntry?.id === entry?.id && entry !== undefined

                  return (
                    <button
                      key={`day-${dayNum}`}
                      onClick={() => entry && setSelectedDateEntry(entry)}
                      disabled={!entry}
                      className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all relative
                        ${entry 
                          ? isSelected
                            ? 'bg-rose-500 text-white ring-2 ring-rose-500/35 cursor-pointer font-black'
                            : 'bg-rose-100/70 text-rose-700 hover:bg-rose-200/50 cursor-pointer'
                          : 'text-gray-400 hover:bg-rose-50/10 cursor-default'
                        }`}
                    >
                      {dayNum}
                      {entry && !isSelected && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-rose-500" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Calendar stats info */}
              <div className="mt-6 pt-4 border-t border-rose-50/70 flex justify-between items-center text-[11px] font-semibold text-gray-500">
                <span>Catatan Bulan Ini:</span>
                <span className="bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded-full font-bold">
                  {entriesThisMonth} Entri
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
