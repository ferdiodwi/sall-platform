import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // 1. Verify that user is authenticated and is a teacher
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single() as any

    if (!profile || profile.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden. Guru Only.' }, { status: 403 })
    }

    // 2. Fetch data for reports
    // Sheet 1: Students data
    const { data: usersData } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'student') as any
    const rawUsers = usersData || []

    const { data: studentsData } = await supabase
      .from('students')
      .select('*') as any
    const rawStudents = studentsData || []

    const studentsReport = rawUsers.map((u: any) => {
      const s = rawStudents.find((st: any) => st.id === u.id) || {}
      return {
        'Nama Siswa': u.name,
        'Email': u.email,
        'Kelas': u.class_id || 'XI Tata Busana',
        'Level': s.level || 'Beginner',
        'Total XP': s.xp || 0,
        'Streak Aktif (Hari)': s.streak || 0,
        'Modul Selesai': (s.modules_completed || []).length,
        'Jumlah Badge': (s.badges || []).length,
        'Badge List': (s.badges || []).join(', ')
      }
    })

    // Sheet 2: Modules Performance
    const { data: modulesData } = await supabase
      .from('modules')
      .select('*')
      .order('order', { ascending: true }) as any
    const rawModules = modulesData || []

    const { data: feedbackData } = await supabase
      .from('feedback')
      .select('correct, question_id') as any
    const { data: quizzesData } = await supabase
      .from('quizzes')
      .select('id, module_id') as any
    const { data: questionsData } = await supabase
      .from('questions')
      .select('id, quiz_id') as any

    const feedbackLogs = feedbackData || []
    const quizList = quizzesData || []
    const questionList = questionsData || []

    const modulesReport = rawModules.map((m: any) => {
      // Completion count
      const completedCount = rawStudents.filter((s: any) => 
        (s.modules_completed || []).includes(m.id)
      ).length

      // Average score calculation
      const moduleQuizIds = quizList.filter((q: any) => q.module_id === m.id).map((q: any) => q.id)
      const moduleQuestionIds = questionList.filter((q: any) => moduleQuizIds.includes(q.quiz_id)).map((q: any) => q.id)
      const moduleFeedbacks = feedbackLogs.filter((f: any) => moduleQuestionIds.includes(f.question_id))

      let avgScore = 0
      if (moduleFeedbacks.length > 0) {
        const correctCount = moduleFeedbacks.filter((f: any) => f.correct).length
        avgScore = Math.round((correctCount / moduleFeedbacks.length) * 100)
      }

      return {
        'Nomor Modul': m.number,
        'Judul Modul': m.title,
        'Tagline': m.tagline || '-',
        'Status Tampil': m.published ? 'Published' : 'Draft',
        'Jumlah Siswa Selesai': completedCount,
        'Rata-rata Nilai Kuis (%)': avgScore
      }
    })

    // Sheet 3: Review Logs
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false }) as any
    const rawReviews = reviewsData || []

    const reviewsReport = rawReviews.map((r: any) => {
      const mod = rawModules.find((m: any) => m.id === r.module_id)
      const student = rawUsers.find((u: any) => u.id === r.author_id)
      return {
        'Nama Siswa': student?.name || 'Siswa SALL',
        'Modul Terkait': mod ? `Modul ${mod.number}: ${mod.title}` : '-',
        'Bintang (Rating)': r.rating,
        'Komentar': r.comment || '-',
        'Emoji': r.emoji || '-',
        'Status Pin': r.pinned ? 'Ya' : 'Tidak',
        'Balasan Guru': r.teacher_reply || '-',
        'Tanggal Ulasan': new Date(r.created_at).toLocaleDateString('id-ID')
      }
    })

    // 3. Create Workbook & Sheets
    const wb = XLSX.utils.book_new()

    const wsStudents = XLSX.utils.json_to_sheet(studentsReport)
    const wsModules = XLSX.utils.json_to_sheet(modulesReport)
    const wsReviews = XLSX.utils.json_to_sheet(reviewsReport)

    // Append sheets
    XLSX.utils.book_append_sheet(wb, wsStudents, 'Daftar Siswa')
    XLSX.utils.book_append_sheet(wb, wsModules, 'Kinerja Modul')
    XLSX.utils.book_append_sheet(wb, wsReviews, 'Ulasan & Feedback')

    // 4. Write to Buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })

    // 5. Send Response attachment
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=SALL_Laporan_Pembelajaran.xlsx'
      }
    })

  } catch (err: any) {
    console.error('Error generating report:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
