'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Flame, Star, Award, BookOpen, BarChart3, Sparkles, LayoutGrid, CheckCircle2, ChevronRight } from 'lucide-react'
import BadgeGrid from '@/components/student/BadgeGrid'
import ProgressBar from '@/components/student/ProgressBar'
import FeedbackRecommendationCard from '@/components/shared/FeedbackRecommendationCard'

// Recharts imports
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const LEVEL_THRESHOLDS = [
  { min: 0, max: 99, label: 'Pemula', emoji: '🌱' },
  { min: 100, max: 299, label: 'Pelajar', emoji: '📚' },
  { min: 300, max: 599, label: 'Mahir', emoji: '⭐' },
  { min: 600, max: 999, label: 'Ahli', emoji: '🏆' },
  { min: 1000, max: Infinity, label: 'Master Fashion', emoji: '👑' },
]

export default function ProgressPage() {
  const supabase = createClient()
  const { user } = useAuth()

  // State Management
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<any>(null)
  
  // Stats
  const [wordWallStats, setWordWallStats] = useState({ total: 0, baru: 0, belajar: 0, dikuasai: 0 })
  const [journalStats, setJournalStats] = useState({ total: 0, streak: 0, thisMonth: 0 })
  const [moduleProgress, setModuleProgress] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [latestAiFeedback, setLatestAiFeedback] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!user) return

    const fetchProgressData = async () => {
      try {
        setLoading(true)

        // 1. Fetch Student Profile
        const { data: studentData, error: studentErr } = await (supabase
          .from('students') as any)
          .select('xp, streak, badges, placement_date')
          .eq('id', user.id)
          .single()

        if (studentErr) throw studentErr
        setStudent(studentData)

        // 2. Fetch Word Wall Stats
        const { data: words, error: wordsErr } = await (supabase
          .from('word_wall') as any)
          .select('status')
          .eq('user_id', user.id)

        if (!wordsErr && words) {
          const formattedWords = words as any[]
          const stats = {
            total: formattedWords.length,
            baru: formattedWords.filter((w) => w.status === 'baru').length,
            belajar: formattedWords.filter((w) => w.status === 'sedang dipelajari').length,
            dikuasai: formattedWords.filter((w) => w.status === 'dikuasai').length,
          }
          setWordWallStats(stats)
        }

        // 3. Fetch Journals & calculate streak
        const { data: journals, error: journalErr } = await (supabase
          .from('journals') as any)
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (!journalErr && journals) {
          const formattedJournals = journals as any[]
          // Calculate streak
          let streak = 0
          if (formattedJournals.length > 0) {
            const uniqueDates = Array.from(
              new Set(formattedJournals.map((j) => new Date(j.created_at).toLocaleDateString('en-CA')))
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

            if (diffDays <= 1) {
              streak = 1
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
            }
          }

          const currentMonth = new Date().getMonth()
          const currentYear = new Date().getFullYear()
          const entriesThisMonth = formattedJournals.filter((j) => {
            const d = new Date(j.created_at)
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth
          }).length

          setJournalStats({
            total: formattedJournals.length,
            streak,
            thisMonth: entriesThisMonth,
          })
        }

        // 4. Fetch Modules & Progress
        // Get published modules
        const { data: modules, error: modErr } = await (supabase
          .from('modules') as any)
          .select('id, number, title')
          .eq('published', true)
          .order('number', { ascending: true })

        if (!modErr && modules) {
          const formattedModules = modules as any[]
          // Get all questions in quizzes of these modules
          const { data: questions, error: qErr } = await (supabase
            .from('questions') as any)
            .select('id, topic, quizzes!inner(module_id)')

          // Get all answered questions in feedback
          const { data: feedbackData, error: fErr } = await (supabase
            .from('feedback') as any)
            .select('question_id')
            .eq('user_id', user.id)

          if (!qErr && questions && !fErr && feedbackData) {
            const formattedQuestions = questions as any[]
            const formattedFeedback = feedbackData as any[]
            const answeredIds = new Set(formattedFeedback.map((f) => f.question_id))

            const progresses = formattedModules.map((mod) => {
              // Filter questions belonging to this module
              const modQuestions = formattedQuestions.filter(
                (q: any) => q.quizzes?.module_id === mod.id
              )
              const totalCount = modQuestions.length
              const completedCount = modQuestions.filter((q: any) => answeredIds.has(q.id)).length

              return {
                id: mod.id,
                number: mod.number,
                title: mod.title,
                completed: completedCount,
                total: totalCount,
              }
            })
            setModuleProgress(progresses)
          }
        }

        // 5. Fetch Weekly Activity Chart Data (last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
        sevenDaysAgo.setHours(0, 0, 0, 0)

        const { data: recentFeedback, error: rfErr } = await (supabase
          .from('feedback') as any)
          .select('shown_at')
          .eq('user_id', user.id)
          .gte('shown_at', sevenDaysAgo.toISOString())

        if (!rfErr && recentFeedback) {
          const formattedRecent = recentFeedback as any[]
          // Group by weekday
          const weekdayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
          const chartMap: Record<string, number> = {}

          // Initialize last 7 days
          for (let i = 0; i < 7; i++) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dayName = weekdayNames[d.getDay()]
            chartMap[dayName] = 0
          }

          // Populate with actual feedback counts
          formattedRecent.forEach((f) => {
            const d = new Date(f.shown_at)
            const dayName = weekdayNames[d.getDay()]
            if (chartMap[dayName] !== undefined) {
              chartMap[dayName] += 1
            }
          })

          // Transform to recharts format in chronological order
          const formattedChartData = []
          for (let i = 6; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dayName = weekdayNames[d.getDay()]
            formattedChartData.push({
              name: dayName,
              soal: chartMap[dayName] || 0,
            })
          }
          setChartData(formattedChartData)
        }

        // 6. Fetch Latest AI Feedback
        const { data: aiFeedback, error: aiFeedbackErr } = await (supabase
          .from('ai_feedback') as any)
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (!aiFeedbackErr && aiFeedback) {
          setLatestAiFeedback(aiFeedback)
        }

      } catch (err) {
        console.error('Error fetching progress data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProgressData()
  }, [user, supabase])

  // Resolve XP Level details
  const getLevelInfo = (xp: number) => {
    const currentLvl = LEVEL_THRESHOLDS.find((l) => xp >= l.min && xp <= l.max) || LEVEL_THRESHOLDS[0]
    const nextLvlIndex = LEVEL_THRESHOLDS.indexOf(currentLvl) + 1
    const nextLvl = nextLvlIndex < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[nextLvlIndex] : null

    return {
      label: currentLvl.label,
      emoji: currentLvl.emoji,
      min: currentLvl.min,
      max: currentLvl.max,
      nextMin: nextLvl ? nextLvl.min : null,
      nextLabel: nextLvl ? nextLvl.label : null,
      nextEmoji: nextLvl ? nextLvl.emoji : null,
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
        <span className="text-sm font-bold text-rose-500 uppercase tracking-widest animate-pulse">Memuat Progress...</span>
      </div>
    )
  }

  const xp = student?.xp || 0
  const lvl = getLevelInfo(xp)

  // Progress to next level
  const nextTarget = lvl.nextMin || lvl.max
  const levelMin = lvl.min
  const levelRange = nextTarget - levelMin
  const levelProgress = levelRange > 0 ? Math.min(Math.round(((xp - levelMin) / levelRange) * 100), 100) : 100

  // Vocabulary Master badge progress
  const wordCount = wordWallStats.total
  const vocabBadgeProgress = Math.min(Math.round((wordCount / 50) * 100), 100)

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-md">
        <div className="absolute -right-10 -bottom-10 opacity-10 text-white text-9xl">📈</div>
        <div className="flex flex-col gap-2 text-center md:text-left z-10">
          <span className="bg-white/20 text-white border border-white/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest self-center md:self-start">
            Statistik Belajar
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">Progress Tracker</h2>
          <p className="text-xs md:text-sm font-semibold text-rose-50 leading-relaxed max-w-md">
            Pantau pertumbuhan XP, koleksi lencana pencapaian, progress modul belajar, dan grafik keaktifanmu di sini.
          </p>
        </div>
      </div>

      {/* SECTION 1: XP, LEVEL & STREAK CARD */}
      <Card className="border-rose-100 bg-white shadow-sm rounded-3xl p-6 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Level Badge Circle */}
          <div className="flex flex-col items-center text-center p-4 border-b md:border-b-0 md:border-r border-rose-50">
            <div className="w-20 h-20 rounded-full bg-rose-50 text-5xl flex items-center justify-center shadow-inner relative">
              <span>{lvl.emoji}</span>
              <span className="absolute -bottom-1.5 bg-rose-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Level
              </span>
            </div>
            <h3 className="text-base font-black text-gray-800 mt-4 leading-none">
              {lvl.label}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">
              {xp} Total XP
            </p>
          </div>

          {/* Level Progress Bar */}
          <div className="flex flex-col justify-center gap-3 px-0 md:px-4">
            <div className="flex justify-between items-end text-xs font-semibold text-gray-500">
              <span className="font-bold text-gray-700">Progress Level</span>
              {lvl.nextLabel ? (
                <span>
                  {xp} / {lvl.nextMin} XP ke <span className="text-rose-500 font-extrabold">{lvl.nextLabel} {lvl.nextEmoji}</span>
                </span>
              ) : (
                <span className="text-rose-500 font-black">Level Maksimal! 👑</span>
              )}
            </div>
            
            <Progress value={levelProgress} className="h-3 bg-gray-100 [&>div]:bg-gradient-to-r [&>div]:from-rose-500 [&>div]:to-pink-500" />
            
            {lvl.nextLabel && (
              <p className="text-[10px] text-gray-400 font-semibold">
                Butuh {lvl.nextMin! - xp} XP lagi untuk naik tingkat. Selesaikan kuis dan kumpulkan kosakata!
              </p>
            )}
          </div>

          {/* Streak Card */}
          <div className="flex items-center gap-4 bg-rose-50/25 border border-rose-100/40 p-5 rounded-2xl md:ml-4 shadow-inner justify-center">
            <div className="w-12 h-12 rounded-xl bg-orange-100/50 text-orange-500 flex items-center justify-center shrink-0">
              <Flame className="fill-orange-500/10 animate-bounce" size={24} />
            </div>
            <div className="text-left">
              <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Streak Belajar</span>
              <h4 className="text-lg font-black text-gray-850 leading-tight">
                {student?.streak || 0} Hari Aktif
              </h4>
              <p className="text-[10px] text-gray-500 leading-normal font-medium mt-0.5">
                Pertahankan keaktifan harianmu untuk streak bonus +50 XP!
              </p>
            </div>
          </div>

        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Progress Modul & Grafik (Kolom 1 & 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECTION 4: GRAFIK AKTIVITAS MINGGUAN */}
          <Card className="border-rose-100 bg-white shadow-sm rounded-3xl p-6">
            <CardHeader className="p-0 pb-6 border-b border-rose-50">
              <CardTitle className="text-sm font-extrabold text-gray-700 flex items-center gap-2">
                <BarChart3 size={16} className="text-rose-500" />
                <span>Grafik Aktivitas Mingguan</span>
              </CardTitle>
              <CardDescription className="text-xs text-gray-400">
                Jumlah soal kuis yang berhasil dijawab siswa dalam 7 hari terakhir.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-6">
              {mounted && chartData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FFF1F2" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FFF', 
                          border: '1px solid #FFE4E6', 
                          borderRadius: '16px', 
                          fontSize: '11px',
                          fontWeight: 'bold',
                          color: '#4B5563'
                        }} 
                      />
                      <Bar 
                        dataKey="soal" 
                        fill="#F43F5E" 
                        radius={[10, 10, 0, 0]} 
                        maxBarSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-xs text-gray-400 font-semibold italic">
                  Belum ada aktivitas pengerjaan kuis minggu ini.
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 3: PROGRESS PER MODUL */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-450 uppercase tracking-widest pl-1">
              Progress Modul Belajar
            </h3>
            
            {moduleProgress.length === 0 ? (
              <div className="bg-white border border-rose-100 rounded-3xl p-8 text-center text-xs text-gray-450 italic">
                Belum ada modul yang terbit.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {moduleProgress.map((mod) => (
                  <ProgressBar
                    key={mod.id}
                    moduleNumber={mod.number}
                    moduleTitle={mod.title}
                    completedActivitiesCount={mod.completed}
                    totalActivitiesCount={mod.total}
                  />
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: BADGE COLLECTION */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-450 uppercase tracking-widest pl-1">
              Koleksi Lencana
            </h3>
            <BadgeGrid earnedBadges={student?.badges || []} />
          </div>

        </div>

        {/* Kolom Kanan: Rekomendasi AI & Jurnal/Word Wall Stats (Kolom 3) */}
        <div className="space-y-8">
          
          {/* SECTION 5: REKOMENDASI AI TERBARU */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-450 uppercase tracking-widest pl-1">
              Rekomendasi AI
            </h3>
            <FeedbackRecommendationCard initialData={latestAiFeedback} />
          </div>

          {/* SECTION 6: STATISTIK DETAIL PERSONAL */}
          <Card className="border-rose-100 bg-white shadow-sm rounded-3xl p-6">
            <CardHeader className="p-0 pb-4 border-b border-rose-50">
              <CardTitle className="text-sm font-extrabold text-gray-700 flex items-center gap-1.5">
                <LayoutGrid size={16} className="text-rose-500" />
                <span>Statistik Fitur Personal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-4 space-y-5">
              
              {/* Journal Stats */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Jurnal Digital
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-rose-50/20 border border-rose-100/40 p-3 rounded-xl text-center">
                    <span className="text-lg font-black text-rose-500">{journalStats.thisMonth}</span>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Entri Bulan Ini</p>
                  </div>
                  <div className="bg-rose-50/20 border border-rose-100/40 p-3 rounded-xl text-center">
                    <span className="text-lg font-black text-rose-500">{journalStats.streak} Hari</span>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Streak Menulis</p>
                  </div>
                </div>
              </div>

              {/* Word Wall Stats */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  My Word Wall (SRS)
                </h5>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-purple-50/30 border border-purple-100/40 p-2 rounded-xl text-center">
                    <span className="text-sm font-black text-purple-600">{wordWallStats.baru}</span>
                    <p className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">Baru</p>
                  </div>
                  <div className="bg-amber-50/30 border border-amber-100/40 p-2 rounded-xl text-center">
                    <span className="text-sm font-black text-amber-600">{wordWallStats.belajar}</span>
                    <p className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">Belajar</p>
                  </div>
                  <div className="bg-emerald-50/30 border border-emerald-100/40 p-2 rounded-xl text-center">
                    <span className="text-sm font-black text-emerald-600">{wordWallStats.dikuasai}</span>
                    <p className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">Kuasai</p>
                  </div>
                </div>
              </div>

              {/* Badge Progress Tracker */}
              <div className="pt-2 border-t border-rose-50/60 space-y-2">
                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  <span>Progres Lencana Master 💎</span>
                  <span>{wordCount} / 50 Kata</span>
                </div>
                <Progress value={vocabBadgeProgress} className="h-2 bg-gray-100 [&>div]:bg-rose-500" />
                <p className="text-[9px] text-gray-400 font-semibold leading-normal">
                  Selesaikan 50 kosa kata di Word Wall untuk mengaktifkan Lencana Master Kosakata!
                </p>
              </div>

            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  )
}
