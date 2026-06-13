'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, BookOpen, Clock, Lightbulb } from 'lucide-react'

interface FeedbackData {
  weak_topic: string
  message: string
  recommended_activity: string
  est_time_minutes: number
}

interface FeedbackRecommendationCardProps {
  initialData?: FeedbackData | null
}

export default function FeedbackRecommendationCard({ initialData }: FeedbackRecommendationCardProps) {
  const supabase = createClient()
  const [data, setData] = useState<FeedbackData | null>(initialData || null)
  const [loading, setLoading] = useState(!initialData)

  useEffect(() => {
    if (initialData) return

    const fetchLatestFeedback = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: fbData, error } = await supabase
          .from('ai_feedback')
          .select('weak_topic, message, recommended_activity, est_time_minutes')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1) as any

        if (fbData && fbData.length > 0) {
          setData(fbData[0])
        }
      } catch (err) {
        console.error('Error fetching latest feedback:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestFeedback()
  }, [supabase, initialData])

  if (loading) {
    return (
      <div className="w-full h-32 rounded-3xl bg-rose-50/20 border border-rose-100 animate-pulse flex items-center justify-center text-xs text-rose-400 font-semibold">
        Memuat Rekomendasi Belajar...
      </div>
    )
  }

  if (!data || data.weak_topic === 'none') {
    return (
      <div className="w-full p-6 rounded-3xl bg-gradient-to-br from-rose-50/30 to-pink-50/30 border border-rose-100 flex flex-col gap-2 items-center text-center shadow-sm">
        <Lightbulb size={24} className="text-rose-400 animate-bounce-slow" />
        <h4 className="font-extrabold text-sm text-gray-800 uppercase tracking-wider">Rekomendasi Belajar</h4>
        <p className="text-xs text-gray-400 leading-relaxed font-semibold max-w-sm mt-1">
          Selesaikan kuis pertamamu untuk mendapatkan rekomendasi belajar personal!
        </p>
      </div>
    )
  }

  return (
    <div className="w-full p-6 rounded-3xl bg-gradient-to-br from-rose-500/5 via-pink-500/5 to-rose-500/10 border border-rose-100 shadow-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center">
          <Sparkles size={16} />
        </div>
        <div>
          <h4 className="font-extrabold text-sm text-gray-800 uppercase tracking-wider leading-none">Rekomendasi Belajar</h4>
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-1 block">
            Topik: {data.weak_topic.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Message */}
      <p className="text-sm text-gray-700 leading-relaxed font-medium italic">
        "{data.message}"
      </p>

      {/* Suggested Activity Card */}
      <div className="bg-white/90 border border-rose-100/50 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <BookOpen size={18} />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Aktivitas Terpilih</span>
            <h5 className="font-extrabold text-xs md:text-sm text-gray-800 leading-snug mt-0.5">
              {data.recommended_activity}
            </h5>
          </div>
        </div>

        {/* Time Badge */}
        {data.est_time_minutes && (
          <div className="flex items-center gap-1.5 bg-rose-50/50 text-rose-600 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 self-stretch sm:self-auto justify-center">
            <Clock size={13} />
            <span>~{data.est_time_minutes} menit</span>
          </div>
        )}
      </div>
    </div>
  )
}
