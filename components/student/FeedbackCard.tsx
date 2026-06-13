'use client'

import { CheckCircle2, XCircle, BookOpen, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RelatedVocab {
  word: string
  meaning: string
}

interface FeedbackCardProps {
  correct: boolean
  explanationCorrect: string
  explanationWrong: string
  correctAnswerText: string
  relatedVocab: RelatedVocab[] | null
  reviewActivity: string | null
  onNext: () => void
  isLastQuestion: boolean
}

export default function FeedbackCard({
  correct,
  explanationCorrect,
  explanationWrong,
  correctAnswerText,
  relatedVocab,
  reviewActivity,
  onNext,
  isLastQuestion,
}: FeedbackCardProps) {
  return (
    <div className={`w-full rounded-2xl border p-6 shadow-md animate-slide-up transition-all duration-300
      ${correct 
        ? 'bg-emerald-50/70 border-emerald-100/80 text-emerald-800' 
        : 'bg-red-50/70 border-red-100/80 text-red-800'
      }`}
    >
      {/* Result Title */}
      <div className="flex items-center gap-2.5 pb-4 border-b border-gray-200/20 mb-4">
        {correct ? (
          <>
            <CheckCircle2 size={24} className="text-emerald-500 animate-bounce-slow" />
            <h4 className="text-lg font-black tracking-tight">Luar Biasa, Benar! 🎉</h4>
          </>
        ) : (
          <>
            <XCircle size={24} className="text-red-500 animate-pulse" />
            <h4 className="text-lg font-black tracking-tight">Kurang Tepat! 😢</h4>
          </>
        )}
      </div>

      {/* Explanation Text */}
      <div className="mb-5 text-sm md:text-base leading-relaxed font-medium">
        <p className="text-gray-700">
          {correct ? explanationCorrect : explanationWrong}
        </p>

        {!correct && correctAnswerText && (
          <div className="mt-3 bg-red-100/50 border border-red-200/50 rounded-xl p-3 text-sm text-red-900 flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">Jawaban yang Benar:</span>
            <p className="font-bold">{correctAnswerText}</p>
          </div>
        )}
      </div>

      {/* Related Vocab Panel */}
      {relatedVocab && relatedVocab.length > 0 && (
        <div className="mb-5 bg-white/70 border border-gray-100 rounded-xl p-4 text-gray-700">
          <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5 flex items-center gap-1.5">
            <BookOpen size={13} className="text-rose-500" />
            Kosakata Terkait:
          </h5>
          <div className="flex flex-wrap gap-2">
            {relatedVocab.map((vocab, index) => (
              <span 
                key={index} 
                className="text-xs bg-rose-50/50 border border-rose-100 text-rose-800 px-2.5 py-1 rounded-lg font-bold"
              >
                {vocab.word} <span className="font-normal text-gray-500">({vocab.meaning})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Review Activity Suggestion */}
      {reviewActivity && (
        <div className="mb-6 bg-white/70 border border-gray-100 rounded-xl p-4 text-gray-700">
          <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
            <Sparkles size={13} className="text-rose-500" />
            Saran Aktivitas Belajar:
          </h5>
          <p className="text-xs md:text-sm font-semibold text-gray-600 leading-relaxed">
            {reviewActivity}
          </p>
        </div>
      )}

      {/* Navigation CTA */}
      <div className="flex justify-end">
        <Button
          onClick={onNext}
          className="px-6 py-5 rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white text-sm shadow-md hover:shadow-lg flex items-center gap-1.5 transition-all cursor-pointer select-none"
        >
          {isLastQuestion ? 'Lihat Hasil Kuis' : 'Soal Berikutnya'}
          <ArrowRight size={15} />
        </Button>
      </div>

    </div>
  )
}
