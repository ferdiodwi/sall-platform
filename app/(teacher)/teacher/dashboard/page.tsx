'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import { 
  Users, 
  Award, 
  BookOpen, 
  Download, 
  TrendingUp, 
  AlertCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react'

// Warna untuk Recharts
const COLORS = ['#f43f5e', '#ec4899', '#f472b6', '#fda4af', '#fecdd3']

export default function TeacherDashboard() {
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  // Stats State
  const [totalStudents, setTotalStudents] = useState(0)
  const [activeStudents, setActiveStudents] = useState(0)
  const [averageScore, setAverageScore] = useState(0)
  const [mostCompletedModule, setMostCompletedModule] = useState('-')
  const [levelDistribution, setLevelDistribution] = useState<any[]>([])

  // Tables State
  const [moduleStats, setModuleStats] = useState<any[]>([])
  const [hardVocab, setHardVocab] = useState<string[]>([])
  const [hardTexts, setHardTexts] = useState<string[]>([])

  // Sorting Table
  const [sortField, setSortField] = useState<string>('avg_score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Export Loading
  const [exporting, setExporting] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // 1. Fetch Students
      const { data: studentsData, error: sErr } = await supabase
        .from('students')
        .select(`
          id,
          xp,
          last_active,
          level,
          modules_completed
        `) as any

      if (sErr) throw sErr

      const students = (studentsData || []) as any[]
      setTotalStudents(students.length)

      // Hitung siswa aktif (last_active >= 7 hari yang lalu)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const active = students.filter(s => {
        if (!s.last_active) return false
        return new Date(s.last_active) >= sevenDaysAgo
      }).length
      setActiveStudents(active)

      // Distribusi Level
      const beginnerCount = students.filter(s => s.level === 'beginner').length
      const intermediateCount = students.filter(s => s.level === 'intermediate').length
      const unassignedCount = students.length - beginnerCount - intermediateCount
      
      setLevelDistribution([
        { name: 'Beginner', value: beginnerCount },
        { name: 'Intermediate', value: intermediateCount },
        ...(unassignedCount > 0 ? [{ name: 'Belum Kuis', value: unassignedCount }] : [])
      ])

      // 2. Fetch Modules
      const { data: modulesData, error: mErr } = await supabase
        .from('modules')
        .select('id, number, title') as any

      if (mErr) throw mErr
      const modules = (modulesData || []) as any[]

      // 3. Fetch Feedback untuk hitung rata-rata kuis
      const { data: feedbacks, error: fErr } = await supabase
        .from('feedback')
        .select('correct, question_id') as any

      if (fErr) throw fErr
      const feedbackLogs = (feedbacks || []) as any[]
      
      // Rata-rata skor kelas
      if (feedbackLogs.length > 0) {
        const correctCount = feedbackLogs.filter(f => f.correct).length
        const avg = Math.round((correctCount / feedbackLogs.length) * 100)
        setAverageScore(avg)
      } else {
        setAverageScore(0)
      }

      // 4. Hitung statistik per modul
      // Kita hitung penyelesaian per modul dari arrays `modules_completed` milik siswa
      const completedCounts: { [key: string]: number } = {}
      students.forEach(s => {
        const completed = s.modules_completed || []
        completed.forEach((modId: string) => {
          completedCounts[modId] = (completedCounts[modId] || 0) + 1
        })
      })

      // Cari modul paling populer
      let maxCompleted = 0
      let maxModTitle = '-'
      
      // Ambil kuis per modul untuk menghitung rata-rata skor per modul
      const { data: quizzes, error: qErr } = await supabase
        .from('quizzes')
        .select('id, module_id') as any

      if (qErr) throw qErr
      const quizList = (quizzes || []) as any[]

      const { data: questions, error: questErr } = await supabase
        .from('questions')
        .select('id, quiz_id') as any

      if (questErr) throw questErr
      const questionList = (questions || []) as any[]

      const stats = modules.map(m => {
        // Cari kuis yang termasuk ke modul ini
        const moduleQuizzes = quizList.filter(q => q.module_id === m.id)
        const moduleQuizIds = moduleQuizzes.map(q => q.id)
        const moduleQuestionIds = questionList.filter(q => moduleQuizIds.includes(q.quiz_id)).map(q => q.id)

        // Hitung rata-rata skor modul
        const moduleFeedbacks = feedbackLogs.filter(f => moduleQuestionIds.includes(f.question_id))
        let modAvg = 0
        if (moduleFeedbacks.length > 0) {
          const correct = moduleFeedbacks.filter(f => f.correct).length
          modAvg = Math.round((correct / moduleFeedbacks.length) * 100)
        }

        const countCompleted = completedCounts[m.id] || 0
        const rate = students.length > 0 ? Math.round((countCompleted / students.length) * 100) : 0

        if (countCompleted > maxCompleted) {
          maxCompleted = countCompleted
          maxModTitle = `Modul ${m.number}: ${m.title}`
        }

        return {
          id: m.id,
          number: m.number,
          title: `Modul ${m.number}: ${m.title}`,
          avg_score: modAvg,
          completed_count: countCompleted,
          completion_rate: rate
        }
      })

      setModuleStats(stats)
      setMostCompletedModule(maxModTitle)

      // 5. Fetch Analitik Kosakata dan Teks (analytics table)
      const { data: analyticsData, error: aErr } = await supabase
        .from('analytics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(1) as any

      if (aErr) throw aErr
      const analytics = analyticsData?.[0] as any

      if (analytics) {
        setHardVocab(analytics.hard_vocab || [])
        setHardTexts(analytics.hard_texts || [])
      } else {
        // Fallback dummy jika analitik belum direkam cron job database
        setHardVocab(['sewing machine', 'pattern drafting', 'measurement', 'seam allowance', 'fabric bias'])
        setHardTexts(['Teks 1: Drafting the Bodice', 'Teks 3: Sewing the Zipper'])
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: string) => {
    const isAsc = sortField === field && sortOrder === 'asc'
    setSortOrder(isAsc ? 'desc' : 'asc')
    setSortField(field)
  }

  const sortedModuleStats = [...moduleStats].sort((a, b) => {
    const valA = a[sortField as keyof typeof a]
    const valB = b[sortField as keyof typeof b]
    
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA
    }
    return 0
  })

  // Export Handler
  const handleExport = async (format: 'pdf' | 'xlsx' | 'csv') => {
    try {
      setExporting(format)
      const res = await fetch('/api/export-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, classId: 'XI Tata Busana' })
      })

      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Laporan_Kelas_${new Date().toISOString().slice(0, 10)}.${format === 'xlsx' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv'}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed exporting report:', err)
    } finally {
      setExporting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-3xl border border-rose-100/40" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-96 bg-white rounded-3xl border border-rose-100/40" />
          <div className="h-96 bg-white rounded-3xl border border-rose-100/40" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header with Export buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'var(--font-playfair)' }}>
            Statistik dan Analitik Kelas
          </h2>
          <p className="text-sm text-gray-500">
            Pantau keaktifan belajar siswa kelas XI Tata Busana secara real-time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold shadow-sm transition-all min-h-[44px] cursor-pointer disabled:opacity-50"
          >
            <Download size={14} />
            {exporting === 'csv' ? 'Mengekspor...' : 'Ekspor CSV'}
          </button>
          <button
            onClick={() => handleExport('xlsx')}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold shadow-sm transition-all min-h-[44px] cursor-pointer disabled:opacity-50"
          >
            <Download size={14} />
            {exporting === 'xlsx' ? 'Mengekspor...' : 'Ekspor Excel'}
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all min-h-[44px] cursor-pointer disabled:opacity-50"
          >
            <Download size={14} />
            {exporting === 'pdf' ? 'Mengekspor...' : 'Ekspor PDF'}
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Siswa Terdaftar</p>
            <h3 className="text-xl font-bold text-gray-800 mt-0.5">{totalStudents} Siswa</h3>
          </div>
        </div>

        <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500 shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Siswa Aktif (7 Hari)</p>
            <h3 className="text-xl font-bold text-gray-800 mt-0.5">{activeStudents} Siswa</h3>
          </div>
        </div>

        <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Rata-rata Skor Kuis</p>
            <h3 className="text-xl font-bold text-gray-800 mt-0.5">{averageScore}%</h3>
          </div>
        </div>

        <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600 shrink-0">
            <BookOpen size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium">Terpopuler</p>
            <h3 className="text-sm font-bold text-gray-800 mt-1 truncate">{mostCompletedModule}</h3>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module Performance Table */}
        <div className="md:col-span-2 bg-white border border-rose-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'var(--font-playfair)' }}>
            Analitik Performa per Modul
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600 border-collapse">
              <thead>
                <tr className="border-b border-rose-50 text-gray-400 font-medium">
                  <th className="py-3 px-4">Nama Modul</th>
                  <th className="py-3 px-4 cursor-pointer hover:text-rose-500" onClick={() => handleSort('avg_score')}>
                    <div className="flex items-center gap-1">
                      Rerata Skor {sortField === 'avg_score' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null}
                    </div>
                  </th>
                  <th className="py-3 px-4 cursor-pointer hover:text-rose-500" onClick={() => handleSort('completed_count')}>
                    <div className="flex items-center gap-1">
                      Siswa Selesi {sortField === 'completed_count' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null}
                    </div>
                  </th>
                  <th className="py-3 px-4 cursor-pointer hover:text-rose-500" onClick={() => handleSort('completion_rate')}>
                    <div className="flex items-center gap-1">
                      Completion Rate {sortField === 'completion_rate' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedModuleStats.map(mod => (
                  <tr key={mod.id} className="border-b border-rose-50/50 hover:bg-rose-50/20 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-gray-700">{mod.title}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        mod.avg_score >= 80 ? 'bg-green-50 text-green-600' :
                        mod.avg_score >= 60 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {mod.avg_score}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-800">{mod.completed_count} siswa</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-rose-500 h-full" style={{ width: `${mod.completion_rate}%` }} />
                        </div>
                        <span className="font-bold text-xs text-gray-700">{mod.completion_rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Level Distribution Pie Chart */}
        <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'var(--font-playfair)' }}>
            Distribusi Level Siswa
          </h3>
          <div className="flex-1 min-h-[220px] flex items-center justify-center">
            {mounted && (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={levelDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {levelDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Siswa`, 'Jumlah']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-center gap-4 text-xs">
            {levelDistribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-gray-500">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vocabulary Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hard Vocabularies */}
        <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertCircle size={20} />
            <h3 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'var(--font-playfair)' }}>
              Top 5 Kosakata Paling Sering Salah
            </h3>
          </div>
          <p className="text-xs text-gray-400 -mt-2">
            Kosakata bahasa Inggris busana yang membutuhkan review intensif di kelas.
          </p>
          <div className="flex flex-col gap-2.5 mt-2">
            {hardVocab.map((word, i) => (
              <div key={word} className="flex items-center justify-between p-3.5 bg-rose-50/20 border border-rose-100/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-600">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-sm text-gray-700 capitalize">{word}</span>
                </div>
                <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-lg">
                  Butuh Ulasan
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hard Texts */}
        <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertCircle size={20} />
            <h3 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'var(--font-playfair)' }}>
              Top 5 Teks Bacaan Paling Sulit
            </h3>
          </div>
          <p className="text-xs text-gray-400 -mt-2">
            Bacaan instruksi kerja/deskripsi tata busana dengan persentase kegagalan menjawab kuis tertinggi.
          </p>
          <div className="flex flex-col gap-2.5 mt-2">
            {hardTexts.map((text, i) => (
              <div key={text} className="flex items-center justify-between p-3.5 bg-rose-50/20 border border-rose-100/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-600">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-sm text-gray-700">{text}</span>
                </div>
                <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-lg">
                  Tingkat Error Tinggi
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
