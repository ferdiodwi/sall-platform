'use client'

import { useState } from 'react'
import { QuizQuestion, AnswerPayload } from '@/types/app'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BookOpen, ArrowRight, HelpCircle } from 'lucide-react'

interface QuizEngineProps {
  questions: QuizQuestion[]
  onComplete: (answers: AnswerPayload[]) => void
  submitting?: boolean
}

export default function QuizEngine({ questions, onComplete, submitting = false }: QuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerPayload[]>([])
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null)

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-rose-100 shadow-sm text-center">
        <HelpCircle className="w-12 h-12 text-rose-300 mb-3 animate-pulse" />
        <p className="text-gray-500 font-medium">Kuis tidak memiliki pertanyaan yang valid.</p>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  // Ambil opsi jawaban. Pastikan aman jika null / undefined
  let parsedOptions: string[] = []
  if (currentQuestion.options) {
    try {
      parsedOptions = typeof currentQuestion.options === 'string' 
        ? JSON.parse(currentQuestion.options) 
        : currentQuestion.options
    } catch (e) {
      parsedOptions = currentQuestion.options
    }
  }

  const progressPercentage = ((currentIndex) / questions.length) * 100

  const handleOptionClick = (index: number) => {
    if (submitting) return
    setSelectedOptionIndex(index)
  }

  const handleNext = () => {
    if (selectedOptionIndex === null) return

    const newAnswer: AnswerPayload = {
      questionId: currentQuestion.id,
      selectedIndex: selectedOptionIndex,
    }

    const updatedAnswers = [...answers, newAnswer]
    setAnswers(updatedAnswers)
    setSelectedOptionIndex(null)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      onComplete(updatedAnswers)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header Progress & Status */}
      <div className="bg-white rounded-2xl border border-rose-100/80 p-5 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
            Soal {currentIndex + 1} dari {questions.length}
          </span>
          <span className="text-xs font-semibold text-gray-400">
            {Math.round(((currentIndex + 1) / questions.length) * 100)}% Selesai
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2.5 bg-rose-50" />
      </div>

      {/* Main Panel: Passage + Question */}
      <div className={`grid grid-cols-1 ${currentQuestion.passage ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
        
        {/* Left Side: Passage (untuk soal Reading / True-False dengan bacaan) */}
        {currentQuestion.passage && (
          <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center gap-2 pb-3 border-b border-rose-50 text-rose-600 font-semibold">
              <BookOpen size={18} />
              <span>Tekstual / Bacaan</span>
            </div>
            <div className="overflow-y-auto max-h-[350px] pr-2 text-sm text-gray-700 leading-relaxed font-normal whitespace-pre-line bg-rose-50/30 p-4 rounded-xl border border-rose-100/50">
              {currentQuestion.passage}
            </div>
          </div>
        )}

        {/* Right Side / Full Width: Question prompt & Options */}
        <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm flex flex-col justify-between min-h-[400px]">
          <div>
            {/* Topic Badge */}
            <div className="mb-4">
              <span className="text-xs font-medium uppercase tracking-wider bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md">
                Topic: {currentQuestion.topic.replace('_', ' ')}
              </span>
            </div>

            {/* Prompt */}
            <h3 className="text-lg md:text-xl font-bold text-gray-800 leading-snug mb-6">
              {currentQuestion.prompt}
            </h3>

            {/* Options List */}
            <div className="flex flex-col gap-3.5">
              {parsedOptions.map((option, index) => {
                const isSelected = selectedOptionIndex === index
                return (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(index)}
                    disabled={submitting}
                    className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all duration-200 min-h-[52px] flex items-center gap-3 cursor-pointer select-none
                      ${isSelected 
                        ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20' 
                        : 'border-gray-200 bg-white text-gray-700 hover:border-rose-200 hover:bg-rose-50/20'
                      }`}
                  >
                    {/* Circle Indicator */}
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-xs font-semibold shrink-0 transition-colors
                      ${isSelected 
                        ? 'border-rose-600 bg-rose-600 text-white' 
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
          </div>

          {/* Action Button */}
          <div className="mt-8 pt-4 border-t border-rose-50 flex justify-end">
            <Button
              onClick={handleNext}
              disabled={selectedOptionIndex === null || submitting}
              className="px-6 py-5 rounded-xl font-semibold bg-rose-500 hover:bg-rose-600 text-white text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Memproses...
                </>
              ) : currentIndex === questions.length - 1 ? (
                <>
                  Kirim Jawaban
                  <ArrowRight size={16} />
                </>
              ) : (
                <>
                  Lanjut
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
