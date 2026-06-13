import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { awardXp, checkAndAwardBadges } from '@/lib/xp'

export async function POST(request: NextRequest) {
  try {
    // 1. Dapatkan user session dari auth cookie
    const supabase = await createServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse request payload
    const { quizId, answers } = (await request.json()) as {
      quizId: string
      answers: Array<{ questionId: string; selectedIndex: number }>
    }

    if (!quizId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Payload tidak valid' }, { status: 400 })
    }

    // 3. Inisialisasi Supabase client dengan service role key untuk bypass RLS
    const serviceClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    ) as any

    // Dapatkan data kuis untuk validasi tipe & level
    const { data: quiz, error: quizErr } = await serviceClient
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single() as any

    if (quizErr || !quiz) {
      return NextResponse.json({ error: 'Kuis tidak ditemukan' }, { status: 404 })
    }

    // Dapatkan semua jawaban benar dari server-side database
    const questionIds = answers.map((a) => a.questionId)
    const { data: answersData, error: answersErr } = await serviceClient
      .from('answers')
      .select(`
        question_id,
        answer_index,
        explanation_correct,
        explanation_wrong,
        related_vocab,
        review_activity,
        questions (
          prompt,
          topic
        )
      `)
      .in('question_id', questionIds) as any

    if (answersErr || !answersData) {
      console.error('Error fetching correct answers:', answersErr)
      return NextResponse.json({ error: 'Gagal mengambil kunci jawaban' }, { status: 500 })
    }

    // 4. Hitung skor & bentuk feedback detail
    let correctCount = 0
    const feedbackList = answers.map((studentAns) => {
      const dbAns = answersData.find((a: any) => a.question_id === studentAns.questionId)
      if (!dbAns) {
        return {
          questionId: studentAns.questionId,
          correct: false,
          explanationCorrect: '',
          explanationWrong: 'Pertanyaan tidak valid.',
          correctAnswer: -1,
          relatedVocab: null,
          reviewActivity: null,
          prompt: '',
          topic: '',
        }
      }

      const isCorrect = dbAns.answer_index === studentAns.selectedIndex
      if (isCorrect) correctCount++

      return {
        questionId: studentAns.questionId,
        correct: isCorrect,
        explanationCorrect: dbAns.explanation_correct,
        explanationWrong: dbAns.explanation_wrong,
        correctAnswer: dbAns.answer_index,
        relatedVocab: dbAns.related_vocab,
        reviewActivity: dbAns.review_activity,
        prompt: dbAns.questions?.prompt || '',
        topic: dbAns.questions?.topic || '',
      }
    })

    // 5. Logika spesifik jika ini adalah Placement Quiz
    let calculatedLevel: 'beginner' | 'intermediate' | null = null
    let newlyAwardedBadges: string[] = []

    if (quiz.level === 'placement' || quizId === '22222222-0001-0001-0001-000000000001') {
      calculatedLevel = correctCount >= 6 ? 'intermediate' : 'beginner'

      // Cek limitasi 30 hari di database
      const { data: studentProfile, error: studentFetchErr } = await serviceClient
        .from('students')
        .select('placement_date')
        .eq('id', user.id)
        .single() as any

      if (studentFetchErr && studentFetchErr.code !== 'PGRST116') {
        console.error('Error fetching student placement_date:', studentFetchErr)
      }

      if (studentProfile?.placement_date) {
        const lastPlacementDate = new Date(studentProfile.placement_date)
        const daysSinceLast = (Date.now() - lastPlacementDate.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceLast < 30) {
          const nextAvailableDate = new Date(lastPlacementDate.getTime() + 30 * 24 * 60 * 60 * 1000)
          return NextResponse.json({
            error: `Limitasi 30 hari aktif. Anda baru bisa mengikuti Placement Quiz lagi setelah tanggal ${nextAvailableDate.toLocaleDateString('id-ID')}`,
          }, { status: 400 })
        }
      }

      // Update level siswa di tabel students & users
      const { error: studentUpdateErr } = await serviceClient
        .from('students')
        .update({
          level: calculatedLevel,
          placement_score: correctCount,
          placement_date: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (studentUpdateErr) {
        console.error('Error updating student placement data:', studentUpdateErr)
        return NextResponse.json({ error: 'Gagal memperbarui profil siswa' }, { status: 500 })
      }

      const { error: userUpdateErr } = await serviceClient
        .from('users')
        .update({
          level: calculatedLevel,
        })
        .eq('id', user.id)

      if (userUpdateErr) {
        console.error('Error updating user level:', userUpdateErr)
      }

      // Berikan +10 XP (sesuai FR07.1)
      await awardXp({
        userId: user.id,
        xpAmount: 10,
        event: 'placement_quiz',
      }, serviceClient)

      // Cek dan berikan badge baru
      newlyAwardedBadges = await checkAndAwardBadges(user.id, serviceClient)
    } else {
      // Logika kuis modul reguler
      const correctAnswersXp = correctCount * 5
      let totalQuizXp = correctAnswersXp

      // Cek apakah skor sempurna
      const hasPerfectQuiz = correctCount === answers.length && answers.length > 0

      // Ambil data profil student
      const { data: studentProfile, error: studentFetchErr } = await serviceClient
        .from('students')
        .select('modules_completed')
        .eq('id', user.id)
        .single() as any

      if (studentFetchErr) {
        console.error('Error fetching student completed modules:', studentFetchErr)
      }

      const completedModules: string[] = studentProfile?.modules_completed || []
      const moduleId = quiz.module_id

      let isNewModuleCompleted = false
      if (moduleId && !completedModules.includes(moduleId)) {
        completedModules.push(moduleId)
        isNewModuleCompleted = true
        // Tambahkan XP penyelesaian modul (+10 XP)
        totalQuizXp += 10

        // Simpan pembaruan modul selesai ke tabel students
        const { error: updateModulesErr } = await serviceClient
          .from('students')
          .update({
            modules_completed: completedModules,
          })
          .eq('id', user.id)

        if (updateModulesErr) {
          console.error('Error updating modules completed:', updateModulesErr)
        }
      }

      // Tambahkan XP yang diperoleh ke siswa
      if (totalQuizXp > 0) {
        await awardXp({
          userId: user.id,
          xpAmount: totalQuizXp,
          event: isNewModuleCompleted ? 'module_complete' : 'correct_answer',
        }, serviceClient)
      }

      // Cek dan berikan badge baru
      newlyAwardedBadges = await checkAndAwardBadges(user.id, serviceClient, hasPerfectQuiz)
    }

    // 6. Simpan hasil jawaban ke tabel feedback
    const feedbackInserts = feedbackList.map((item) => ({
      user_id: user.id,
      question_id: item.questionId,
      correct: item.correct,
      shown_at: new Date().toISOString(),
    }))

    const { error: feedbackInsErr } = await serviceClient
      .from('feedback')
      .insert(feedbackInserts)

    if (feedbackInsErr) {
      console.error('Error inserting quiz feedback logs:', feedbackInsErr)
    }

    // 7. Kembalikan data respon sukses
    return NextResponse.json({
      score: correctCount,
      totalQuestions: answers.length,
      level: calculatedLevel,
      newBadges: newlyAwardedBadges,
      feedback: feedbackList,
    })

  } catch (err: any) {
    console.error('Error in /api/grade-quiz route:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
