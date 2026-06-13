'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getXpLevelInfo } from '@/components/shared/XpLevelBadge'
import { 
  Users, 
  Search, 
  Filter, 
  Flame, 
  Sparkles, 
  Award, 
  BookOpen, 
  ArrowLeft,
  X,
  FileText
} from 'lucide-react'

interface StudentListItem {
  id: string
  name: string
  email: string
  class_id: string
  xp: number
  streak: number
  level: 'beginner' | 'intermediate' | null
  modules_completed: string[]
  badges: string[]
}

interface QuizHistoryItem {
  quiz_title: string
  level: string
  score: number
  total: number
  date: string
}

export default function TeacherStudentsPage() {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<StudentListItem[]>([])
  
  // Selected Student for Detail Panel
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null)
  const [studentDetailsLoading, setStudentDetailsLoading] = useState(false)
  const [completedModulesTitles, setCompletedModulesTitles] = useState<string[]>([])
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([])

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('all')
  const [filterLevel, setFilterLevel] = useState('all')

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)

      // Parallelkan fetch users + students
      const [
        { data: usersData, error: uErr },
        { data: studentsData, error: sErr },
      ] = await Promise.all([
        supabase.from('users').select('*').eq('role', 'student') as any,
        supabase.from('students').select('*') as any,
      ])

      if (uErr) throw uErr
      if (sErr) throw sErr

      const rawUsers = usersData || []
      const rawStudents = studentsData || []

      const list = rawUsers.map((u: any) => {
        const studentMeta = rawStudents.find((s: any) => s.id === u.id) || {}
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          class_id: u.class_id || 'XI Tata Busana',
          xp: studentMeta.xp || 0,
          streak: studentMeta.streak || 0,
          level: studentMeta.level || u.level || null,
          modules_completed: studentMeta.modules_completed || [],
          badges: studentMeta.badges || []
        }
      })

      setStudents(list)
    } catch (err) {
      console.error('Error fetching students list:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load detailed progress when clicking a student
  const handleSelectStudent = async (student: StudentListItem) => {
    setSelectedStudent(student)
    try {
      setStudentDetailsLoading(true)
      setCompletedModulesTitles([])
      setQuizHistory([])

      // 1. Fetch completed modules titles
      if (student.modules_completed.length > 0) {
        const { data: modulesData } = await supabase
          .from('modules')
          .select('title, number')
          .in('id', student.modules_completed) as any

        const titles = (modulesData || []).map((m: any) => `Modul ${m.number}: ${m.title}`)
        setCompletedModulesTitles(titles)
      }

      // 2. Fetch quiz history from feedback
      const { data: feedbacks, error: fbErr } = await supabase
        .from('feedback')
        .select(`
          correct,
          shown_at,
          questions (
            quiz_id,
            quizzes (
              title,
              level,
              module_id
            )
          )
        `)
        .eq('user_id', student.id) as any

      if (fbErr) throw fbErr

      const logs = feedbacks || []

      // Group feedback by quiz_id
      const quizAttempts: { [key: string]: { correct: number; total: number; title: string; level: string; date: string } } = {}
      
      logs.forEach((log: any) => {
        const quiz = log.questions?.quizzes
        const qId = log.questions?.quiz_id

        if (qId && quiz) {
          if (!quizAttempts[qId]) {
            quizAttempts[qId] = {
              correct: 0,
              total: 0,
              title: quiz.title,
              level: quiz.level,
              date: log.shown_at
            }
          }
          quizAttempts[qId].total++
          if (log.correct) {
            quizAttempts[qId].correct++
          }
        }
      })

      const historyList = Object.values(quizAttempts).map(item => ({
        quiz_title: item.title,
        level: item.level,
        score: item.correct,
        total: item.total,
        date: new Date(item.date).toLocaleDateString('id-ID')
      }))

      setQuizHistory(historyList)
    } catch (err) {
      console.error('Error fetching student details:', err)
    } finally {
      setStudentDetailsLoading(false)
    }
  }

  // Filter students list
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = filterClass === 'all' || s.class_id === filterClass
    const matchesLevel = filterLevel === 'all' || s.level === filterLevel
    return matchesSearch && matchesClass && matchesLevel
  })

  // List of unique classes for filter dropdown
  const classesList = Array.from(new Set(students.map(s => s.class_id)))

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'var(--font-playfair)' }}>
          Pemantauan Progres Siswa
        </h2>
        <p className="text-sm text-gray-500">
          Lihat statistik level, XP, keaktifan streak, dan detail riwayat pengerjaan kuis siswa secara personal.
        </p>
      </div>

      {/* Main layout: Table List & Details modal/panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Table Column */}
        <div className={`flex flex-col gap-6 ${selectedStudent ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {/* Filters Toolbar */}
          <div className="bg-white border border-rose-100 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari siswa berdasarkan nama atau email..."
                className="w-full pl-10 pr-4 py-2.5 border border-rose-100 rounded-xl text-xs focus:outline-none focus:border-rose-400 bg-rose-50/10 min-h-[40px] font-normal"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-semibold">Kelas:</span>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="px-3.5 py-1.5 border border-rose-100 rounded-xl text-xs bg-rose-50/10 focus:outline-none min-h-[36px]"
                >
                  <option value="all">Semua Kelas</option>
                  {classesList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-semibold">Level:</span>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="px-3.5 py-1.5 border border-rose-100 rounded-xl text-xs bg-rose-50/10 focus:outline-none min-h-[36px]"
                >
                  <option value="all">Semua Level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col gap-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600 border-collapse">
                <thead>
                  <tr className="border-b border-rose-50 text-gray-400 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4 text-center">XP</th>
                    <th className="py-3 px-4 text-center">Streak</th>
                    <th className="py-3 px-4 text-center">Modul Selesai</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => {
                    const isSelected = selectedStudent?.id === student.id
                    return (
                      <tr
                        key={student.id}
                        onClick={() => handleSelectStudent(student)}
                        className={`border-b border-rose-50/50 hover:bg-rose-50/20 transition-all cursor-pointer ${
                          isSelected ? 'bg-rose-50/30 font-semibold text-rose-700' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-800">{student.name}</div>
                          <div className="text-[10px] text-gray-400 font-normal mt-0.5">{student.email}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-600">{student.class_id}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            student.level === 'intermediate'
                              ? 'bg-rose-100 text-rose-700'
                              : student.level === 'beginner'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-150 text-gray-500'
                          }`}>
                            {student.level || 'Belum Kuis'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-gray-750">{student.xp} XP</td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 font-bold text-rose-500">
                            <Flame size={14} />
                            <span>{student.streak}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-gray-700">
                          {student.modules_completed.length} Modul
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Details Column (Drawer-like overlay) */}
        {selectedStudent && (
          <div className="lg:col-span-1 bg-white border border-rose-200 rounded-3xl p-6 shadow-xl flex flex-col gap-6 relative animate-in slide-in-from-right-5 duration-200 min-h-[500px]">
            {/* Close Button */}
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Title / Name Header */}
            <div className="border-b border-rose-50 pb-4">
              <span className="text-[10px] uppercase font-bold tracking-wider bg-rose-50 text-rose-500 px-2 py-0.5 rounded">
                Detail Progres Belajar
              </span>
              <h3 className="font-bold text-gray-800 text-lg mt-2 line-clamp-1">{selectedStudent.name}</h3>
              <p className="text-xs text-gray-400 truncate mt-0.5">{selectedStudent.email}</p>
            </div>

            {studentDetailsLoading ? (
              <div className="flex-1 flex items-center justify-center text-xs text-gray-400 animate-pulse font-medium">
                Memuat detail data progres...
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
                {/* XP Badge & Streak stats */}
                <div className="grid grid-cols-2 gap-4 bg-rose-50/20 border border-rose-50/50 rounded-2xl p-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-semibold text-gray-400">Total XP / Level</span>
                    <span className="text-base font-black text-gray-800 mt-1">{selectedStudent.xp} XP</span>
                    <span className="text-[10px] text-rose-600 font-bold mt-0.5">
                      {getXpLevelInfo(selectedStudent.xp).levelName}
                    </span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-semibold text-gray-400">Streak Aktif</span>
                    <span className="text-base font-black text-rose-500 mt-1 flex items-center gap-1">
                      <Flame size={18} /> {selectedStudent.streak} Hari
                    </span>
                  </div>
                </div>

                {/* Badge Collector Showcase */}
                <div className="flex flex-col gap-2.5">
                  <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Award size={14} className="text-rose-500" /> Badge Koleksi ({selectedStudent.badges.length})
                  </h4>
                  {selectedStudent.badges.length === 0 ? (
                    <p className="text-[11px] text-gray-400 font-medium italic pl-1">Belum ada lencana didapatkan.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2.5">
                      {selectedStudent.badges.map(badge => (
                        <span
                          key={badge}
                          className="bg-white border border-rose-100 text-[10px] font-bold text-gray-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm capitalize"
                        >
                          🎯 {badge.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Completed Modules list */}
                <div className="flex flex-col gap-2.5">
                  <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <BookOpen size={14} className="text-rose-500" /> Modul Diselesaikan ({completedModulesTitles.length})
                  </h4>
                  {completedModulesTitles.length === 0 ? (
                    <p className="text-[11px] text-gray-400 font-medium italic pl-1">Belum ada modul yang diselesaikan.</p>
                  ) : (
                    <div className="flex flex-col gap-2 pl-1">
                      {completedModulesTitles.map(title => (
                        <div key={title} className="text-xs font-semibold text-gray-650 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>{title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quiz History log */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 border-b border-rose-50 pb-2">
                    <FileText size={14} className="text-rose-500" /> Riwayat Kuis Modul ({quizHistory.length})
                  </h4>
                  {quizHistory.length === 0 ? (
                    <p className="text-[11px] text-gray-400 font-medium italic pl-1">Belum ada riwayat kuis.</p>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {quizHistory.map((q, qIdx) => {
                        const scorePercentage = q.total > 0 ? Math.round((q.score / q.total) * 100) : 0
                        return (
                          <div key={qIdx} className="bg-rose-50/10 border border-rose-100/30 p-3 rounded-2xl flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <h5 className="font-bold text-xs text-gray-700 truncate">{q.quiz_title}</h5>
                              <p className="text-[9px] text-gray-400 font-medium mt-0.5">Tanggal kuis: {q.date}</p>
                            </div>

                            <span className={`px-2.5 py-1 rounded-xl text-xs font-black shrink-0 ${
                              scorePercentage >= 80 ? 'bg-green-50 text-green-600' :
                              scorePercentage >= 60 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                            }`}>
                              {q.score}/{q.total}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
