import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { awardXp, updateStreak, checkAndAwardBadges } from '@/lib/xp'
import { XP_AWARDS, XP_LEVELS, XPEventType } from '@/types/app'
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

    const { userId, event } = (await request.json()) as {
      userId: string
      event: XPEventType
    }

    if (!userId || !event || userId !== user.id) {
      return NextResponse.json({ error: 'Payload tidak valid' }, { status: 400 })
    }

    const xpAmount = XP_AWARDS[event]
    if (xpAmount === undefined) {
      return NextResponse.json({ error: 'Event XP tidak valid' }, { status: 400 })
    }

    // 2. Buat Service Role Client untuk bypass RLS
    const serviceClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    ) as any

    // 3. Update Streak & Last Active
    await updateStreak(userId, serviceClient)

    // 4. Tambahkan XP ke siswa
    await awardXp({ userId, xpAmount, event }, serviceClient)

    // 5. Cek Badge & Award
    // Pastikan jika event adalah correct_answer, kita bisa menyetel hasPerfectQuiz jika memang sudah selesai kuis penuh
    const badgesAwarded = await checkAndAwardBadges(userId, serviceClient)

    // 6. Ambil data terbaru untuk menghitung level
    const { data: student } = await serviceClient
      .from('students')
      .select('xp')
      .eq('id', userId)
      .single() as any

    const newXp = student?.xp || 0
    
    // Resolve level
    let newLevel: any = XP_LEVELS.pemula
    if (newXp >= 1000) newLevel = XP_LEVELS.master
    else if (newXp >= 600) newLevel = XP_LEVELS.ahli
    else if (newXp >= 300) newLevel = XP_LEVELS.mahir
    else if (newXp >= 100) newLevel = XP_LEVELS.pelajar

    return NextResponse.json({
      newXp,
      newLevel: newLevel.label,
      newLevelEmoji: newLevel.emoji,
      badgesAwarded,
    })
  } catch (err: any) {
    console.error('Error in award-xp api route:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
