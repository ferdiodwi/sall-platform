import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { getRuleBasedFeedback } from '@/lib/feedback-engine'
import type { Database } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    // 1. Verifikasi Session
    const supabase = await createServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quizId, userId } = (await request.json()) as {
      quizId: string
      userId: string
    }

    if (!quizId || !userId || userId !== user.id) {
      return NextResponse.json({ error: 'Payload tidak valid' }, { status: 400 })
    }

    // 2. Buat Service Role Client untuk bypass RLS
    const serviceClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    ) as any

    // 3. Ambil daftar question yang tergabung di kuis ini
    const { data: questions, error: qErr } = await serviceClient
      .from('questions')
      .select('id, topic')
      .eq('quiz_id', quizId) as any

    if (qErr || !questions || questions.length === 0) {
      return NextResponse.json({ error: 'Pertanyaan kuis tidak ditemukan' }, { status: 404 })
    }

    const questionIds = questions.map((q: any) => q.id)

    // 4. Ambil feedback jawaban salah untuk question kuis ini
    const { data: wrongFeedbacks, error: fbErr } = await serviceClient
      .from('feedback')
      .select('question_id')
      .eq('user_id', userId)
      .in('question_id', questionIds)
      .eq('correct', false) as any

    if (fbErr) {
      return NextResponse.json({ error: 'Gagal memproses feedback' }, { status: 500 })
    }

    // Petakan ke format { topic }
    const wrongAnswers = wrongFeedbacks.map((f: any) => {
      const question = questions.find((q: any) => q.id === f.question_id)
      return { topic: question?.topic || 'vocabulary_general' }
    })

    // 5. Hitung feedback dengan engine rule-based
    const feedbackResult = getRuleBasedFeedback(wrongAnswers)

    // Cek apakah baru saja di-insert dalam 15 detik terakhir untuk mencegah spam double request
    const fifteenSecondsAgo = new Date(Date.now() - 15000).toISOString()
    const { data: recentFeedback } = await serviceClient
      .from('ai_feedback')
      .select('id, weak_topic, message, recommended_activity, est_time_minutes')
      .eq('user_id', userId)
      .gt('created_at', fifteenSecondsAgo)
      .order('created_at', { ascending: false })
      .limit(1) as any

    if (recentFeedback && recentFeedback.length > 0) {
      return NextResponse.json(feedbackResult)
    }

    // 6. Simpan hasil rekomendasi ke tabel ai_feedback
    const { error: insertErr } = await serviceClient
      .from('ai_feedback')
      .insert({
        user_id: userId,
        weak_topic: feedbackResult.weakTopic,
        message: feedbackResult.message,
        recommended_activity: feedbackResult.recommendedActivity,
        est_time_minutes: feedbackResult.estTimeMinutes,
      }) as any

    if (insertErr) {
      console.error('Error inserting ai_feedback:', insertErr)
    }

    return NextResponse.json(feedbackResult)
  } catch (err: any) {
    console.error('Error in quiz-feedback api route:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
