'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QuizQuestion, AnswerPayload } from '@/types/app'
import QuizEngine from '@/components/student/QuizEngine'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Sparkles, 
  Compass, 
  Lock, 
  Calendar, 
  ArrowRight, 
  Award,
  AlertCircle
} from 'lucide-react'

interface QuizResult {
  score: number
  totalQuestions: number
  level: 'beginner' | 'intermediate'
  newBadges: string[]
  feedback: Array<{
    questionId: string
    correct: boolean
    explanationCorrect: string
    explanationWrong: string
    correctAnswer: number
    prompt: string
    topic: string
  }>
}

export default function PlacementQuizPage() {
  const router = useRouter()
  const supabase = createClient()

  // State Management
  const [loading, setLoading] = useState(true)
  const [checkingEligibility, setCheckingEligibility] = useState(true)
  const [isEligible, setIsEligible] = useState(false)
  const [nextAvailableDate, setNextAvailableDate] = useState<string | null>(null)
  
  const [quizId, setQuizId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [quizState, setQuizState] = useState<'welcome' | 'playing' | 'results'>('welcome')
  
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 1. Periksa Kelayakan Siswa (Limitasi 30 Hari & Level Awal)
  useEffect(() => {
    const checkEligibility = async () => {
      try {
        setCheckingEligibility(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        // Fetch data profil student
        const { data: student, error: studentErr } = await supabase
          .from('students')
          .select('level, placement_date')
          .eq('id', user.id)
          .single() as any

        if (studentErr) throw studentErr

        if (student.placement_date) {
          const lastDate = new Date(student.placement_date)
          const daysSinceLast = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
          if (daysSinceLast < 30) {
            // Belum boleh mengulang
            setIsEligible(false)
            const nextDate = new Date(lastDate.getTime() + 30 * 24 * 60 * 60 * 1000)
            setNextAvailableDate(nextDate.toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }))
            setLoading(false)
            setCheckingEligibility(false)
            return
          }
        }

        // Siswa eligible untuk mengambil kuis
        setIsEligible(true)
        
        // Ambil placement quiz ID
        const { data: quizData, error: quizErr } = await supabase
          .from('quizzes')
          .select('id')
          .eq('level', 'placement')
          .single() as any

        if (quizErr || !quizData) {
          throw new Error('Placement quiz tidak ditemukan di database.')
        }

        setQuizId(quizData.id)

        // Ambil 10 pertanyaan tanpa kunci jawaban (anti-cheat)
        const { data: questionsData, error: questionsErr } = await supabase
          .from('questions')
          .select('id, quiz_id, type, prompt, passage, options, topic, order')
          .eq('quiz_id', quizData.id)
          .order('order', { ascending: true })

        if (questionsErr) throw questionsErr
        setQuestions(questionsData as QuizQuestion[])

      } catch (err: any) {
        console.error('Error checking quiz eligibility:', err)
        setError(err.message || 'Gagal memeriksa status kuis.')
      } finally {
        setLoading(false)
        setCheckingEligibility(false)
      }
    }

    checkEligibility()
  }, [supabase, router])

  // 2. Submit Jawaban ke API Server-Side Grading
  const handleQuizComplete = async (answers: AnswerPayload[]) => {
    if (!quizId) return
    try {
      setSubmitting(true)
      setError(null)

      const response = await fetch('/api/grade-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId,
          answers,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memproses penilaian kuis.')
      }

      setResult(data as QuizResult)
      setQuizState('results')
    } catch (err: any) {
      console.error('Error submitting quiz answers:', err)
      setError(err.message || 'Terjadi kesalahan saat menilai kuis.')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading Screen
  if (loading || checkingEligibility) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Menyiapkan Placement Quiz...</p>
      </div>
    )
  }

  // 1. Lock Screen (Sudah Ambil Kuis & < 30 Hari)
  if (!isEligible && nextAvailableDate) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-1">
        <div className="bg-white rounded-3xl border border-rose-100 shadow-xl overflow-hidden p-8 md:p-10 flex flex-col items-center text-center gap-6 animate-scale-up">
          <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2 ring-8 ring-rose-50/50">
            <Lock size={40} className="animate-bounce-slow" />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight">
            Kuis Terkunci
          </h2>
          
          <p className="text-gray-600 leading-relaxed text-sm md:text-base max-w-md">
            Kamu sudah menyelesaikan Placement Quiz sebelumnya. Untuk menjaga objektivitas hasil belajar, kuis ini hanya dapat diulang sekali setiap 30 hari.
          </p>

          <div className="bg-rose-50/50 border border-rose-100/50 rounded-2xl p-4 w-full max-w-md flex items-center gap-3.5 text-left">
            <Calendar className="text-rose-500 shrink-0" size={24} />
            <div>
              <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider">Tersedia Kembali Pada</p>
              <p className="text-sm font-bold text-gray-700">{nextAvailableDate}</p>
            </div>
          </div>

          <Button
            onClick={() => router.push('/home')}
            className="mt-4 px-8 py-6 rounded-2xl font-bold bg-rose-500 hover:bg-rose-600 text-white text-base shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    )
  }

  // Error State
  if (error && quizState !== 'results') {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-white rounded-2xl border border-red-100 p-8 shadow-md text-center flex flex-col items-center gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h3 className="text-xl font-bold text-gray-800">Ups, Terjadi Kesalahan</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-2 bg-rose-500 hover:bg-rose-600 text-white">
          Coba Lagi
        </Button>
      </div>
    )
  }

  // 2. Welcome / Start Screen
  if (quizState === 'welcome') {
    return (
      <div className="max-w-3xl mx-auto mt-6 p-1">
        <div className="bg-white rounded-3xl border border-rose-100 shadow-xl overflow-hidden p-8 md:p-12 flex flex-col items-center text-center gap-8 animate-scale-up">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white mb-2 shadow-md rotate-3 hover:rotate-12 transition-transform duration-300">
            <Compass size={48} className="animate-spin-slow" />
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight mb-3">
              Placement Quiz
            </h1>
            <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto font-medium">
              Evaluasi kemampuan Bahasa Inggris Fashion kamu untuk menentukan tingkat pembelajaran yang paling tepat.
            </p>
          </div>

          {/* Quiz Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mt-2">
            <div className="p-4 bg-rose-50/30 rounded-2xl border border-rose-100/50 flex flex-col items-center">
              <span className="text-2xl font-extrabold text-rose-500">10</span>
              <span className="text-xs font-semibold text-gray-500 uppercase mt-1">Total Soal</span>
            </div>
            <div className="p-4 bg-rose-50/30 rounded-2xl border border-rose-100/50 flex flex-col items-center">
              <span className="text-2xl font-extrabold text-rose-500">20 mnt</span>
              <span className="text-xs font-semibold text-gray-500 uppercase mt-1">Estimasi Waktu</span>
            </div>
            <div className="p-4 bg-rose-50/30 rounded-2xl border border-rose-100/50 flex flex-col items-center">
              <span className="text-2xl font-extrabold text-rose-500">+10 XP</span>
              <span className="text-xs font-semibold text-gray-500 uppercase mt-1">Hadiah XP</span>
            </div>
          </div>

          {/* Guide Section */}
          <div className="text-left w-full max-w-2xl bg-gray-50/80 rounded-2xl p-6 border border-gray-100 text-sm text-gray-600 flex flex-col gap-3">
            <h4 className="font-bold text-gray-700 flex items-center gap-2">
              <Sparkles size={16} className="text-rose-500" />
              Petunjuk Pengisian:
            </h4>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 font-medium">
              <li>Soal terdiri dari gabungan kosakata mode dan pemahaman teks instruksi jahit.</li>
              <li>Pilihlah satu jawaban yang paling tepat untuk setiap soal.</li>
              <li>Kamu tidak dapat kembali ke soal sebelumnya setelah menekan tombol "Lanjut".</li>
              <li>Tingkat kesulitan modul pembelajaran berikutnya akan disesuaikan dengan hasil kuis ini.</li>
            </ul>
          </div>

          <Button
            onClick={() => setQuizState('playing')}
            className="px-10 py-7 rounded-2xl font-extrabold bg-rose-500 hover:bg-rose-600 text-white text-lg shadow-lg hover:shadow-xl transition-all duration-200 w-full max-w-sm flex items-center justify-center gap-2.5"
          >
            Mulai Kuis Sekarang
            <ArrowRight size={20} />
          </Button>
        </div>
      </div>
    )
  }

  // 3. Quiz Mode
  if (quizState === 'playing') {
    return (
      <div className="py-6">
        <QuizEngine
          questions={questions}
          onComplete={handleQuizComplete}
          submitting={submitting}
        />
      </div>
    )
  }

  // 4. Results Screen
  if (quizState === 'results' && result) {
    const isIntermediate = result.level === 'intermediate'
    const hasFirstStepBadge = result.newBadges.includes('first_step')

    return (
      <div className="max-w-3xl mx-auto py-6 p-1">
        <div className="bg-white rounded-3xl border border-rose-100 shadow-xl overflow-hidden p-8 md:p-12 flex flex-col items-center text-center gap-8 animate-scale-up">
          
          {/* Trophy Header */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 ring-8 ring-amber-50/50">
              <Trophy size={48} className="animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight mb-2">
              Kuis Selesai! 🎉
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-wider text-xs">
              Hasil Placement Quiz Kamu
            </p>
          </div>

          {/* Results Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
            {/* Score Card */}
            <div className="bg-rose-50/30 rounded-2xl border border-rose-100/50 p-6 flex flex-col items-center justify-center">
              <span className="text-sm font-semibold text-rose-500 uppercase mb-1">Skor Jawaban</span>
              <p className="text-3xl font-black text-gray-800">
                {result.score} <span className="text-xl text-gray-400 font-medium">/ {result.totalQuestions}</span>
              </p>
              <p className="text-xs text-gray-500 mt-2 font-medium">
                {Math.round((result.score / result.totalQuestions) * 100)}% Jawaban Benar
              </p>
            </div>

            {/* Level Card */}
            <div className="bg-rose-50/30 rounded-2xl border border-rose-100/50 p-6 flex flex-col items-center justify-center">
              <span className="text-sm font-semibold text-rose-500 uppercase mb-1">Level Kompetensi</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {isIntermediate ? '🔵' : '🟢'}
                </span>
                <p className={`text-2xl font-black ${isIntermediate ? 'text-blue-600' : 'text-emerald-600'}`}>
                  {isIntermediate ? 'Intermediate' : 'Beginner'}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium max-w-[200px]">
                {isIntermediate 
                  ? 'Siap untuk materi tata busana dengan instruksi & deskripsi produk kompleks!' 
                  : 'Memulai dengan pengenalan pola kalimat mode & kosakata dasar pakaian.'
                }
              </p>
            </div>
          </div>

          {/* Gamification Awards Panel */}
          <div className="w-full max-w-xl bg-gray-50/80 rounded-2xl p-6 border border-gray-100 flex flex-col gap-4">
            <h4 className="font-bold text-gray-700 text-sm flex items-center gap-2 border-b border-gray-200/60 pb-2.5">
              <Award size={16} className="text-rose-500 animate-bounce-slow" />
              Pencapaian Baru:
            </h4>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-around items-center">
              {/* XP Awarded */}
              <div className="flex items-center gap-3">
                <span className="text-3xl">✨</span>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-800">+10 XP Diterima</p>
                  <p className="text-xs text-gray-400 font-medium">Hadiah Pengerjaan Kuis</p>
                </div>
              </div>

              {/* Badge Awarded (first_step) */}
              <div className="flex items-center gap-3">
                <span className="text-3xl animate-bounce-slow">🎯</span>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-800">Badge "Langkah Pertama"</p>
                  <p className="text-xs text-gray-400 font-medium">Selamat! Badge pertama didapatkan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Action */}
          <Button
            onClick={() => router.push('/home')}
            className="px-10 py-7 rounded-2xl font-extrabold bg-rose-500 hover:bg-rose-600 text-white text-lg shadow-lg hover:shadow-xl transition-all duration-200 w-full max-w-sm flex items-center justify-center gap-2.5"
          >
            Mulai Belajar Sekarang
            <ArrowRight size={20} />
          </Button>

        </div>
      </div>
    )
  }

  return null
}
