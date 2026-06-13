'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Users, 
  Award,
  Sparkles,
  BookMarked
} from 'lucide-react'

interface ModuleItem {
  id: string
  number: number
  title: string
  tagline: string | null
  emoji: string | null
  order: number
  published: boolean
  updated_at: string
  // Calculated stats
  completed_count: number
  avg_score: number
}

export default function TeacherModulesPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [modules, setModules] = useState<ModuleItem[]>([])

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      setLoading(true)

      // Jalankan SEMUA query paralel
      const [
        { data: modulesData, error: mErr },
        { data: studentsData },
        { data: feedbackData },
        { data: quizzesData },
        { data: questionsData },
      ] = await Promise.all([
        supabase.from('modules').select('*').order('order', { ascending: true }) as any,
        supabase.from('students').select('modules_completed') as any,
        supabase.from('feedback').select('correct, question_id') as any,
        supabase.from('quizzes').select('id, module_id') as any,
        supabase.from('questions').select('id, quiz_id') as any,
      ])

      if (mErr) throw mErr
      const rawModules = (modulesData || []) as any[]
      const students = (studentsData || []) as any[]
      const feedbackLogs = (feedbackData || []) as any[]
      const quizList = (quizzesData || []) as any[]
      const questionList = (questionsData || []) as any[]

      const formattedModules = rawModules.map(m => {
        // Completion count
        const completedCount = students.filter(s => 
          (s.modules_completed || []).includes(m.id)
        ).length

        // Average score calculation
        const moduleQuizIds = quizList.filter(q => q.module_id === m.id).map(q => q.id)
        const moduleQuestionIds = questionList.filter(q => moduleQuizIds.includes(q.quiz_id)).map(q => q.id)
        const moduleFeedbacks = feedbackLogs.filter(f => moduleQuestionIds.includes(f.question_id))

        let avgScore = 0
        if (moduleFeedbacks.length > 0) {
          const correctCount = moduleFeedbacks.filter(f => f.correct).length
          avgScore = Math.round((correctCount / moduleFeedbacks.length) * 100)
        }

        return {
          ...m,
          completed_count: completedCount,
          avg_score: avgScore
        }
      })

      setModules(formattedModules)
    } catch (err) {
      console.error('Error fetching modules list:', err)
    } finally {
      setLoading(false)
    }
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase.from('modules') as any)
        .update({ published: !currentStatus })
        .eq('id', id)

      if (error) throw error

      setModules(prev => prev.map(m => 
        m.id === id ? { ...m, published: !currentStatus } : m
      ))
    } catch (err) {
      console.error('Error toggling publish status:', err)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${title}"? Tindakan ini akan menghapus permanen semua level kuis dan data terkait.`)) {
      return
    }

    try {
      const { error } = await (supabase.from('modules') as any)
        .delete()
        .eq('id', id)

      if (error) throw error

      setModules(prev => prev.filter(m => m.id !== id))
    } catch (err) {
      console.error('Error deleting module:', err)
      alert('Gagal menghapus modul.')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-rose-50 rounded-lg" />
          <div className="h-11 w-36 bg-rose-50 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-3xl border border-rose-100/40" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'var(--font-playfair)' }}>
            Manajemen Modul Pembelajaran
          </h2>
          <p className="text-sm text-gray-500">
            Unggah modul baru, susun isi bacaan, atau kelola soal kuis.
          </p>
        </div>
        <Link
          href="/teacher/modules/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold shadow-sm transition-all min-h-[44px] cursor-pointer"
        >
          <Plus size={16} />
          Tambah Modul
        </Link>
      </div>

      {/* Grid List Modul */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((m) => (
          <div
            key={m.id}
            className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 relative overflow-hidden"
          >
            {/* Top Indicator */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{m.emoji || '📖'}</span>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">
                    Modul {m.number}
                  </span>
                  <h3 className="font-bold text-gray-800 text-base mt-1 line-clamp-1">{m.title}</h3>
                </div>
              </div>

              {/* Status Badge */}
              <button
                onClick={() => togglePublish(m.id, m.published)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition-colors cursor-pointer ${
                  m.published 
                    ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                    : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                }`}
              >
                {m.published ? <Eye size={12} /> : <EyeOff size={12} />}
                {m.published ? 'Published' : 'Draft'}
              </button>
            </div>

            {/* Tagline */}
            <p className="text-xs text-gray-400 line-clamp-2 italic min-h-[32px]">
              {m.tagline || 'Tidak ada deskripsi singkat.'}
            </p>

            {/* Quick Statistics */}
            <div className="grid grid-cols-2 gap-4 bg-rose-50/20 border border-rose-50/50 rounded-2xl p-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                  <Users size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-medium">Siswa Selesai</p>
                  <p className="text-xs font-bold text-gray-700">{m.completed_count} Siswa</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500">
                  <Award size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-medium">Rerata Kuis</p>
                  <p className="text-xs font-bold text-gray-700">{m.avg_score}%</p>
                </div>
              </div>
            </div>

            {/* Actions Buttons */}
            <div className="flex items-center justify-between border-t border-rose-50 pt-4 mt-1 gap-2">
              <div className="flex items-center gap-2">
                <Link
                  href={`/teacher/modules/${m.id}/edit`}
                  className="flex items-center gap-1.5 px-3.5 py-2 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold transition-colors min-h-[38px]"
                >
                  <Edit size={14} />
                  Edit Konten
                </Link>
                <Link
                  href={`/teacher/modules/${m.id}/quizzes`}
                  className="flex items-center gap-1.5 px-3.5 py-2 hover:bg-pink-50 text-pink-600 rounded-xl text-xs font-semibold transition-colors min-h-[38px]"
                >
                  <BookMarked size={14} />
                  Kelola Kuis
                </Link>
              </div>

              <button
                onClick={() => handleDelete(m.id, m.title)}
                className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                title="Hapus Modul"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
