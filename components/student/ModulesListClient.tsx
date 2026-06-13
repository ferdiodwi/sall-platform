'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Star, CheckCircle, ChevronRight, Lock, Flame } from 'lucide-react'

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

  // Urutkan modul berdasarkan `order`
  const sortedModules = [...initialModules].sort((a, b) => a.order - b.order)

  const completedIds: string[] = studentProfile?.modules_completed || []
  const studentLevel: string = studentProfile?.level || 'beginner'

  // Tentukan apakah sebuah modul terbuka (unlocked)
  const isModuleUnlocked = (module: Module, index: number): boolean => {
    if (index === 0) return true // Modul pertama selalu terbuka
    const prevModule = sortedModules[index - 1]
    return completedIds.includes(prevModule.id)
  }

  const getAverageRating = (moduleId: string) => {
    const moduleReviews = reviews.filter((r) => r.module_id === moduleId)
    if (moduleReviews.length === 0) return 0
    const total = moduleReviews.reduce((sum, r) => sum + r.rating, 0)
    return parseFloat((total / moduleReviews.length).toFixed(1))
  }

  // Hitung berapa modul yang sudah selesai untuk progress bar
  const completedCount = sortedModules.filter(m => completedIds.includes(m.id)).length
  const totalCount = sortedModules.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Overall Progress Bar */}
      {!loading && (
        <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-gray-700">Progress Keseluruhan</p>
              <p className="text-xs text-gray-400 mt-0.5">{completedCount} dari {totalCount} modul selesai</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-rose-500">{progressPercent}%</span>
              <p className={`text-xs font-bold mt-0.5 ${studentLevel === 'intermediate' ? 'text-blue-500' : 'text-emerald-500'}`}>
                {studentLevel === 'intermediate' ? '🔵 Intermediate' : '🟢 Beginner'}
              </p>
            </div>
          </div>
          <div className="w-full bg-rose-50 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-pink-400 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedModules.map((module, index) => {
          const avgRating = getAverageRating(module.id)
          const ratingCount = reviews.filter((r) => r.module_id === module.id).length
          const isCompleted = completedIds.includes(module.id)
          const unlocked = loading ? false : isModuleUnlocked(module, index)
          const isActive = unlocked && !isCompleted // Modul yang sedang bisa dikerjakan
          const prevModule = index > 0 ? sortedModules[index - 1] : null

          return (
            <div
              key={module.id}
              className={`group relative rounded-3xl border shadow-sm flex flex-col justify-between overflow-hidden transition-all duration-300 ${
                unlocked
                  ? 'bg-white border-rose-100/80 hover:shadow-md hover:border-rose-200'
                  : 'bg-gray-50/80 border-gray-200/80'
              } ${isActive ? 'ring-2 ring-rose-400 ring-offset-2' : ''}`}
            >
              {/* Lock Overlay untuk modul terkunci */}
              {!unlocked && !loading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-100/60 backdrop-blur-[1px] rounded-3xl gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gray-200/80 flex items-center justify-center shadow-inner">
                    <Lock size={28} className="text-gray-400" />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-sm font-bold text-gray-500">Modul Terkunci</p>
                    {prevModule && (
                      <p className="text-xs text-gray-400 mt-1 leading-snug">
                        Selesaikan <span className="font-semibold">Modul {prevModule.number}</span> terlebih dahulu
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Loading skeleton overlay */}
              {loading && (
                <div className="absolute inset-0 z-10 bg-white/60 rounded-3xl animate-pulse" />
              )}

              {/* Top Section */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-4xl p-2 rounded-2xl border transition-all ${
                    unlocked
                      ? 'bg-rose-50/50 border-rose-100/40'
                      : 'bg-gray-100 border-gray-200/50 grayscale opacity-60'
                  }`}>
                    {module.emoji || '📖'}
                  </span>

                  {/* Status Badge */}
                  {isCompleted ? (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-100/50">
                      <CheckCircle size={13} />
                      Selesai
                    </span>
                  ) : isActive ? (
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-rose-200 animate-pulse">
                      <Flame size={13} />
                      Sedang Aktif
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200 flex items-center gap-1.5">
                      <Lock size={12} />
                      Terkunci
                    </span>
                  )}
                </div>

                <span className={`text-xs font-bold uppercase tracking-widest ${unlocked ? 'text-rose-500' : 'text-gray-400'}`}>
                  Modul {module.number}
                </span>
                <h3 className={`text-lg font-extrabold tracking-tight mt-1 mb-2 transition-colors ${
                  unlocked ? 'text-gray-800 group-hover:text-rose-600' : 'text-gray-400'
                }`}>
                  {module.title}
                </h3>
                <p className={`text-sm leading-relaxed font-normal mb-4 ${unlocked ? 'text-gray-500' : 'text-gray-400'}`}>
                  {module.tagline || 'Pelajari materi bahasa Inggris fashion terbaik.'}
                </p>

                {/* Rating */}
                <div className={`flex items-center gap-1.5 text-sm font-semibold mb-1 ${unlocked ? 'text-amber-500' : 'text-gray-400'}`}>
                  <Star size={16} fill="currentColor" />
                  <span>{avgRating > 0 ? avgRating : 'Belum ada rating'}</span>
                  {ratingCount > 0 && (
                    <span className="text-xs text-gray-400 font-normal">({ratingCount} ulasan)</span>
                  )}
                </div>
              </div>

              {/* Bottom Section */}
              <div className={`px-6 py-4 border-t flex justify-between items-center ${
                unlocked ? 'bg-gray-50/50 border-rose-50/50' : 'bg-gray-100/40 border-gray-200/40'
              }`}>
                {/* Level indicator */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-500">Level:</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    !unlocked
                      ? 'bg-gray-100 text-gray-400 border border-gray-200'
                      : studentLevel === 'intermediate'
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}>
                    {!unlocked ? '🔒 Terkunci' : studentLevel === 'intermediate' ? '🔵 Intermediate' : '🟢 Beginner'}
                  </span>
                </div>

                {/* Action Button */}
                {unlocked ? (
                  <Link href={`/modules/${module.id}`}>
                    <button className="flex items-center gap-1 text-sm font-bold text-rose-500 hover:text-rose-600 cursor-pointer select-none transition-colors">
                      {isCompleted ? 'Lihat Ulang' : 'Pelajari'}
                      <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 text-sm font-bold text-gray-400 cursor-not-allowed select-none">
                    <Lock size={14} />
                    Terkunci
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
