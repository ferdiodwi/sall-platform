'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Star, BookOpen, CheckCircle, ChevronRight, Lock } from 'lucide-react'

interface Module {
  id: string
  number: number
  title: string
  tagline: string | null
  emoji: string | null
  order: number
  published: boolean
}

interface Review {
  module_id: string
  rating: number
}

interface ModulesListClientProps {
  initialModules: Module[]
  reviews: Review[]
}

export default function ModulesListClient({ initialModules, reviews }: ModulesListClientProps) {
  const supabase = createClient()
  const [studentProfile, setStudentProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch student progress client-side
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: student, error } = await supabase
          .from('students')
          .select('level, modules_completed')
          .eq('id', user.id)
          .single() as any

        if (!error && student) {
          setStudentProfile(student)
        }
      } catch (err) {
        console.error('Error fetching student progress:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [supabase])

  // Hitung rating rata-rata per modul
  const getAverageRating = (moduleId: string) => {
    const moduleReviews = reviews.filter((r) => r.module_id === moduleId)
    if (moduleReviews.length === 0) return 0
    const total = moduleReviews.reduce((sum, r) => sum + r.rating, 0)
    return parseFloat((total / moduleReviews.length).toFixed(1))
  }

  // Tentukan status penyelesaian siswa
  const getCompletionStatus = (moduleId: string) => {
    if (!studentProfile) return 'belum mulai'
    const completedList = studentProfile.modules_completed || []
    if (completedList.includes(moduleId)) {
      return 'selesai'
    }
    // Jika belum di-completed tapi kuis / materi sudah dibuka, bisa 'sedang'. Untuk saat ini, jika profile ada tapi belum di completed list, kita anggap belum mulai / sedang dipelajari.
    // Sederhanakan: jika belum ada di list completed, tapi level cocok, status 'belum mulai'.
    return 'belum mulai'
  }

  const studentLevel = studentProfile?.level || 'beginner'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {initialModules.map((module) => {
        const avgRating = getAverageRating(module.id)
        const status = getCompletionStatus(module.id)
        const ratingCount = reviews.filter((r) => r.module_id === module.id).length

        return (
          <div
            key={module.id}
            className="group relative bg-white rounded-3xl border border-rose-100/80 shadow-sm hover:shadow-md hover:border-rose-200 transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            {/* Top Section */}
            <div className="p-6">
              {/* Module Header */}
              <div className="flex justify-between items-start mb-4">
                <span className="text-4xl p-2 bg-rose-50/50 rounded-2xl border border-rose-100/40">
                  {module.emoji || '📖'}
                </span>
                
                {/* Status Badge */}
                {status === 'selesai' ? (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-100/50">
                    <CheckCircle size={13} />
                    Selesai
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                    Belum Mulai
                  </span>
                )}
              </div>

              {/* Module Info */}
              <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">
                Modul {module.number}
              </span>
              <h3 className="text-lg font-extrabold text-gray-800 tracking-tight mt-1 mb-2 group-hover:text-rose-600 transition-colors">
                {module.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed font-normal mb-4">
                {module.tagline || 'Pelajari materi bahasa Inggris fashion terbaik.'}
              </p>

              {/* Rating Star Preview */}
              <div className="flex items-center gap-1.5 text-amber-500 text-sm font-semibold mb-4">
                <Star size={16} fill="currentColor" />
                <span>{avgRating > 0 ? avgRating : 'Belum ada rating'}</span>
                {ratingCount > 0 && (
                  <span className="text-xs text-gray-400 font-normal">({ratingCount} ulasan)</span>
                )}
              </div>
            </div>

            {/* Bottom Section */}
            <div className="px-6 py-4 bg-gray-50/50 border-t border-rose-50/50 flex justify-between items-center">
              {/* Level indicator */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-500">Materi:</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 
                  ${studentLevel === 'intermediate' 
                    ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}
                >
                  {studentLevel === 'intermediate' ? '🔵 Intermediate' : '🟢 Beginner'}
                </span>
              </div>

              {/* Action Button */}
              <Link href={`/modules/${module.id}`}>
                <button className="flex items-center gap-1 text-sm font-bold text-rose-500 hover:text-rose-600 cursor-pointer select-none">
                  Pelajari
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
