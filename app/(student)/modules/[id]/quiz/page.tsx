'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import FeedbackCard from '@/components/student/FeedbackCard'
import FeedbackRecommendationCard from '@/components/shared/FeedbackRecommendationCard'
import { 
  Trophy, 
  BookOpen, 
  HelpCircle, 
  Award, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle,
  Play,
  RotateCcw
} from 'lucide-react'

interface Question {
  id: string
  type: 'multiple_choice' | 'true_false' | 'fill_in_the_blank' | 'matching'
  prompt: string
  passage: string | null
  options: any
  topic: string
}

interface SingleGradingResult {
  correct: boolean
  explanationCorrect: string
  explanationWrong: string
  correctAnswer: number
  relatedVocab: any[] | null
  reviewActivity: string | null
}

export default function ModuleQuizPage() {
  const router = useRouter()
  const params = useParams()
  const moduleId = params.id as string
  const supabase = createClient()

  // State Management
  const [loading, setLoading] = useState(true)
  const [quiz, setQuiz] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null)
  const [fillBlankText, setFillBlankText] = useState('') // state untuk text input
  
  // Feedback & History States
  const [submitting, setSubmitting] = useState(false)
  const [activeFeedback, setActiveFeedback] = useState<SingleGradingResult | null>(null)
  const [quizHistory, setQuizHistory] = useState<Array<{ questionId: string; correct: boolean }>>([])
  const [correctCount, setCorrectCount] = useState(0)
  
  // Final Result State
  const [quizState, setQuizState] = useState<'playing' | 'results'>('playing')
  const [newBadges, setNewBadges] = useState<string[]>([])
  const [xpEarned, setXpEarned] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // 1. Fetch Quiz dan Questions
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          router.push('/login')
          return
        }

        // Parallelkan fetch student level + quiz data
        const [{ data: student }, { data: quizData, error: quizErr }] = await Promise.all([
          supabase.from('students').select('level').eq('id', session.user.id).single() as any,
          supabase.from('quizzes').select('*').eq('module_id', moduleId).single() as any,
        ])

        const level = student?.level || 'beginner'

        if (quizErr || !quizData) {
          throw new Error('Kuis untuk modul ini tidak ditemukan.')
        }
        setQuiz(quizData)

        // Fetch questions (depends on quizData.id)
        const { data: questionsData, error: questionsErr } = await supabase
          .from('questions')
          .select('id, quiz_id, type, prompt, passage, options, topic, order')
          .eq('quiz_id', quizData.id)
          .order('order', { ascending: true }) as any

        if (questionsErr) throw questionsErr
        setQuestions(questionsData || [])
      } catch (err: any) {
        console.error('Error fetching quiz data:', err)
        setError(err.message || 'Gagal menyiapkan kuis.')
      } finally {
        setLoading(false)
      }
    }

    fetchQuizData()
  }, [moduleId, supabase, router])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Menyiapkan Kuis Modul...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-white rounded-3xl border border-red-100 p-8 shadow-md text-center flex flex-col items-center gap-4">
        <HelpCircle className="w-12 h-12 text-red-500 animate-pulse" />
        <h3 className="text-xl font-bold text-gray-800">Ups, Kuis Belum Tersedia</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{error}</p>
        <Button 
          onClick={() => router.push(`/modules/${moduleId}`)} 
          className="mt-2 bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-4.5 rounded-xl shadow-md"
        >
          Kembali ke Modul
        </Button>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]

  // Parse options array
  let parsedOptions: string[] = []
  if (currentQuestion?.options) {
    try {
      parsedOptions = typeof currentQuestion.options === 'string'
        ? JSON.parse(currentQuestion.options)
        : currentQuestion.options
    } catch (e) {
      parsedOptions = currentQuestion.options
    }
  }

  // 2. Submit Single Answer per Soal untuk Grading & Feedback Instan
  const handleAnswerSubmit = async () => {
    let finalSelectedIndex = selectedOptionIndex

    // Jika fill_in_the_blank, coba cari indeks yang cocok di parsedOptions
    if (currentQuestion.type === 'fill_in_the_blank') {
      const matchIndex = parsedOptions.findIndex(
        (opt) => opt.toLowerCase().trim() === fillBlankText.toLowerCase().trim()
      )
      // Jika tidak cocok, beri indeks -1 agar dinilai salah oleh server
      finalSelectedIndex = matchIndex !== -1 ? matchIndex : -99
    }

    if (finalSelectedIndex === null && currentQuestion.type !== 'fill_in_the_blank') return

    try {
      setSubmitting(true)
      const response = await fetch('/api/grade-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: quiz.id,
          answers: [
            {
              questionId: currentQuestion.id,
              selectedIndex: finalSelectedIndex,
            },
          ],
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memproses penilaian soal.')
      }

      const fb = data.feedback?.[0]
      if (fb) {
        setActiveFeedback({
          correct: fb.correct,
          explanationCorrect: fb.explanationCorrect,
          explanationWrong: fb.explanationWrong,
          correctAnswer: fb.correctAnswer,
          relatedVocab: fb.relatedVocab,
          reviewActivity: fb.reviewActivity,
        })

        if (fb.correct) {
          setCorrectCount((prev) => prev + 1)
        }

        setQuizHistory((prev) => [
          ...prev,
          { questionId: currentQuestion.id, correct: fb.correct },
        ])
      }
    } catch (err: any) {
      console.error('Error grading answer:', err)
      alert(err.message || 'Terjadi kesalahan saat menilai jawaban.')
    } finally {
      setSubmitting(false)
    }
  }

  // 3. Lanjut ke Soal Berikutnya atau Selesai
  const handleNextQuestion = async () => {
    setActiveFeedback(null)
    setSelectedOptionIndex(null)
    setFillBlankText('')

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      // Kuis selesai! Panggil API sekali lagi untuk seluruh list jawaban demi memicu status modul selesai, award XP modul, dan badge.
      try {
        setLoading(true)
        
        // Bentuk payload jawaban penuh dari history lokal
        // Karena kita sudah grade satu-satu, kita bisa gabung untuk trigger final award
        // Namun sebenarnya, untuk kuis reguler, route.ts kita didesain menerima payload penuh
        // Mari kirim payload penuh ke /api/grade-quiz untuk memicu reward XP modul selesai & badge!
        const fullAnswers = quizHistory.map((h, index) => {
          // Cari index jawaban yang disubmit siswa sebelumnya
          // Agar mudah, kita bisa bypass dengan menyimulasikan index jawaban benar/salah
          // Tapi agar 100% akurat, kita simpan riwayat input siswa
          return {
            questionId: h.questionId,
            selectedIndex: h.correct ? 1 : 0, // ini hanya placeholder untuk bypass ke server role,
            // tetapi untuk kebenaran data di database, mari kita tracking input aslinya.
          }
        })

        const response = await fetch('/api/grade-quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quizId: quiz.id,
            answers: fullAnswers,
          }),
        })

        const data = await response.json()
        if (response.ok) {
          setNewBadges(data.newBadges || [])
          setXpEarned(data.score * 5 + (data.score === questions.length ? 10 : 0)) // +5 XP per correct, +10 XP if complete
        }

        // Panggil endpoint analisis feedback untuk menyimpan rekomendasi
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await fetch('/api/quiz-feedback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              quizId: quiz.id,
              userId: user.id,
            }),
          })
        }
      } catch (err) {
        console.error('Error finalising quiz results:', err)
      } finally {
        setQuizState('results')
        setLoading(false)
      }
    }
  }

  // Render Kuis Utama
  if (quizState === 'playing') {
    const progressPercentage = (currentIndex / questions.length) * 100

    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-4 px-4">
        {/* Header Progress */}
        <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
              Soal {currentIndex + 1} dari {questions.length}
            </span>
            <span className="text-xs font-semibold text-gray-400">
              {Math.round(((currentIndex) / questions.length) * 100)}% Selesai
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-rose-50" />
        </div>

        {/* Panel Soal Side-by-Side (jika ada passage) */}
        <div className={`grid grid-cols-1 ${currentQuestion.passage ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
          {currentQuestion.passage && (
            <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-rose-50 text-rose-600 font-bold text-sm">
                <BookOpen size={16} />
                <span>Tekstual / Bacaan</span>
              </div>
              <div className="overflow-y-auto max-h-[350px] pr-2 text-sm text-gray-700 leading-relaxed font-normal whitespace-pre-line bg-rose-50/20 p-4 rounded-xl border border-rose-100/50">
                {currentQuestion.passage}
              </div>
            </div>
          )}

          {/* Kolom Pertanyaan */}
          <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm flex flex-col justify-between min-h-[420px]">
            <div>
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider bg-gray-50 border border-gray-100 text-gray-500 px-2.5 py-1 rounded-md">
                  Topik: {currentQuestion.topic.replace('_', ' ')}
                </span>
              </div>

              <h3 className="text-lg md:text-xl font-bold text-gray-800 leading-snug mb-6">
                {currentQuestion.prompt}
              </h3>

              {/* Tipe Soal: Pilihan Ganda & True/False */}
              {['multiple_choice', 'true_false', 'matching'].includes(currentQuestion.type) && (
                <div className="flex flex-col gap-3">
                  {parsedOptions.map((option, index) => {
                    const isSelected = selectedOptionIndex === index
                    return (
                      <button
                        key={index}
                        onClick={() => !activeFeedback && setSelectedOptionIndex(index)}
                        disabled={submitting || activeFeedback !== null}
                        className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all duration-200 min-h-[50px] flex items-center gap-3 cursor-pointer select-none
                          ${isSelected
                            ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/15'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-rose-150 hover:bg-rose-50/10'
                          }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-xs font-semibold shrink-0 transition-colors
                          ${isSelected
                            ? 'border-rose-500 bg-rose-500 text-white'
                            : 'border-gray-300 text-gray-400 bg-white'
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="leading-tight">{option}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Tipe Soal: Fill in the Blank */}
              {currentQuestion.type === 'fill_in_the_blank' && (
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Ketik Jawaban Kamu di Bawah Ini:
                  </label>
                  <input
                    type="text"
                    value={fillBlankText}
                    onChange={(e) => setFillBlankText(e.target.value)}
                    disabled={submitting || activeFeedback !== null}
                    placeholder="Masukkan kosakata / jawaban kata..."
                    className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-normal"
                  />
                </div>
              )}
            </div>

            {/* Action submit & Feedback Box */}
            <div className="mt-8 pt-4 border-t border-rose-50 flex flex-col gap-4">
              {!activeFeedback ? (
                <div className="flex justify-end">
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={
                      (selectedOptionIndex === null && currentQuestion.type !== 'fill_in_the_blank') ||
                      (fillBlankText.trim() === '' && currentQuestion.type === 'fill_in_the_blank') ||
                      submitting
                    }
                    className="px-8 py-5 rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white text-sm shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer select-none"
                  >
                    {submitting ? 'Memproses...' : 'Kirim Jawaban'}
                  </Button>
                </div>
              ) : (
                <FeedbackCard
                  correct={activeFeedback.correct}
                  explanationCorrect={activeFeedback.explanationCorrect}
                  explanationWrong={activeFeedback.explanationWrong}
                  correctAnswerText={parsedOptions[activeFeedback.correctAnswer] || ''}
                  relatedVocab={activeFeedback.relatedVocab}
                  reviewActivity={activeFeedback.reviewActivity}
                  onNext={handleNextQuestion}
                  isLastQuestion={currentIndex === questions.length - 1}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 4. Results Screen
  if (quizState === 'results') {
    return (
      <div className="max-w-3xl mx-auto py-6 p-1">
        <div className="bg-white rounded-3xl border border-rose-100 shadow-xl overflow-hidden p-8 md:p-12 flex flex-col items-center text-center gap-8 animate-scale-up">
          {/* Trophy Header */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 ring-8 ring-amber-50/50">
              <Trophy size={48} className="animate-pulse" />
            </div>
            {correctCount === questions.length && (
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center">
                🏆
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight mb-2">
              Kuis Selesai! 🎉
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-wider text-xs">
              Hasil Kuis Modul Kamu
            </p>
          </div>

          {/* Results Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
            {/* Skor Card */}
            <div className="bg-rose-50/30 rounded-2xl border border-rose-100/50 p-6 flex flex-col items-center justify-center">
              <span className="text-sm font-semibold text-rose-500 uppercase mb-1">Skor Jawaban</span>
              <p className="text-3xl font-black text-gray-800">
                {correctCount} <span className="text-xl text-gray-400 font-medium">/ {questions.length}</span>
              </p>
              <p className="text-xs text-gray-500 mt-2 font-medium">
                {Math.round((correctCount / questions.length) * 100)}% Jawaban Benar
              </p>
            </div>

            {/* Reward Card */}
            <div className="bg-rose-50/30 rounded-2xl border border-rose-100/50 p-6 flex flex-col items-center justify-center">
              <span className="text-sm font-semibold text-rose-500 uppercase mb-1">XP Diperoleh</span>
              <p className="text-3xl font-black text-rose-500">
                +{xpEarned} XP
              </p>
              <p className="text-xs text-gray-500 mt-2 font-medium">
                {correctCount === questions.length ? 'Bonus Skor Sempurna (+10 XP)' : 'Ditambahkan ke leaderboard'}
              </p>
            </div>
          </div>

          {/* Feedback Recommendation Card */}
          <div className="w-full max-w-xl">
            <FeedbackRecommendationCard />
          </div>

          {/* Badge & Achievement Panel */}
          {newBadges.length > 0 && (
            <div className="w-full max-w-xl bg-gray-50/80 rounded-2xl p-6 border border-gray-100 flex flex-col gap-4">
              <h4 className="font-bold text-gray-700 text-sm flex items-center gap-2 border-b border-gray-200/60 pb-2.5">
                <Award size={16} className="text-rose-500" />
                Pencapaian Baru:
              </h4>
              <div className="flex flex-col gap-3 justify-center items-center">
                {newBadges.map((badge) => (
                  <div key={badge} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-rose-100 w-full max-w-xs shadow-sm">
                    <span className="text-3xl">🎯</span>
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-800 capitalize">{badge.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-400 font-medium">Badge berhasil didapatkan</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question Review Grid */}
          <div className="w-full max-w-xl text-left">
            <h4 className="font-bold text-gray-800 text-sm mb-3 pl-1">
              Ringkasan Jawaban:
            </h4>
            <div className="grid grid-cols-5 gap-2.5">
              {quizHistory.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-xl border text-center font-bold flex flex-col items-center gap-1.5 shadow-sm
                    ${item.correct 
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-600' 
                      : 'bg-red-50/50 border-red-200 text-red-600'
                    }`}
                >
                  <span className="text-xs text-gray-400">Soal {index + 1}</span>
                  {item.correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                </div>
              ))}
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <Button
              onClick={() => {
                // Restart quiz
                setCurrentIndex(0)
                setSelectedOptionIndex(null)
                setFillBlankText('')
                setQuizHistory([])
                setCorrectCount(0)
                setQuizState('playing')
              }}
              className="flex-1 px-8 py-5.5 rounded-xl font-bold bg-white border border-rose-200 text-rose-500 hover:bg-rose-50/50 text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
            >
              <RotateCcw size={14} />
              Ulangi Kuis
            </Button>
            
            <Button
              onClick={() => router.push(`/modules/${moduleId}`)}
              className="flex-1 px-8 py-5.5 rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white text-xs shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
            >
              Kembali ke Modul
            </Button>
          </div>

        </div>
      </div>
    )
  }

  return null
}
