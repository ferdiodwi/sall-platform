import { SupabaseClient } from '@supabase/supabase-js'
import { XPEventType, XP_AWARDS } from '@/types/app'

interface AwardXpParams {
  userId: string
  xpAmount: number
  event: XPEventType
}

/**
 * Mendapatkan format week_id untuk leaderboard (misal: "2026-W24")
 */
export function getISOWeekId(): string {
  const now = new Date()
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  
  const year = d.getUTCFullYear()
  const weekStr = weekNo.toString().padStart(2, '0')
  return `${year}-W${weekStr}`
}

/**
 * Menambahkan XP ke data siswa dan memperbarui tabel leaderboard mingguan secara atomic.
 */
export async function awardXp(params: AwardXpParams, supabase: SupabaseClient): Promise<void> {
  const { userId, xpAmount } = params

  // 1. Ambil data user profile (class_id) dan student XP
  const { data: userProfile, error: userErr } = await supabase
    .from('users')
    .select('class_id, students(xp)')
    .eq('id', userId)
    .single() as any

  if (userErr) {
    console.error('Error fetching user profile for XP award:', userErr)
    throw userErr
  }

  const currentXp = userProfile?.students?.xp || 0
  const newXp = currentXp + xpAmount

  // 2. Update total XP siswa
  const { error: updateXpErr } = await supabase
    .from('students')
    .update({ xp: newXp })
    .eq('id', userId)

  if (updateXpErr) {
    console.error('Error updating student XP:', updateXpErr)
    throw updateXpErr
  }

  // 3. Update leaderboard mingguan
  const weekId = getISOWeekId()
  const classId = userProfile?.class_id || 'Belum memilih kelas'

  const { data: lbEntry, error: lbErr } = await supabase
    .from('leaderboards')
    .select('xp')
    .eq('user_id', userId)
    .eq('week_id', weekId)
    .single()

  if (lbErr && lbErr.code !== 'PGRST116') { // PGRST116 is single row not found
    console.error('Error checking leaderboard entry:', lbErr)
    throw lbErr
  }

  if (lbEntry) {
    const { error: updateLbErr } = await supabase
      .from('leaderboards')
      .update({ xp: lbEntry.xp + xpAmount })
      .eq('user_id', userId)
      .eq('week_id', weekId)

    if (updateLbErr) {
      console.error('Error updating leaderboard:', updateLbErr)
      throw updateLbErr
    }
  } else {
    const { error: insertLbErr } = await supabase
      .from('leaderboards')
      .insert({
        user_id: userId,
        class_id: classId,
        week_id: weekId,
        xp: xpAmount,
      })

    if (insertLbErr) {
      console.error('Error inserting leaderboard:', insertLbErr)
      throw insertLbErr
    }
  }
}

/**
 * Memperbarui streak harian siswa. Dipanggil saat login atau pengerjaan kuis.
 */
export async function updateStreak(userId: string, supabase: SupabaseClient): Promise<number> {
  const { data: student, error: studentErr } = await supabase
    .from('students')
    .select('streak, last_active')
    .eq('id', userId)
    .single() as any

  if (studentErr || !student) {
    console.error('Error fetching student for streak update:', studentErr)
    return 0
  }

  const now = new Date()
  const lastActiveStr = student.last_active
  let newStreak = student.streak || 0

  if (!lastActiveStr) {
    newStreak = 1
  } else {
    const lastActiveDate = new Date(lastActiveStr)
    const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const lastActiveDateOnly = new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate())
    
    const diffTime = todayDateOnly.getTime() - lastActiveDateOnly.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      newStreak += 1
      // Streak hari ke-7 bonus +50 XP!
      if (newStreak === 7) {
        await awardXp({ userId, xpAmount: 50, event: 'streak_bonus' }, supabase)
        // Notifikasi in-app
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: 'Bonus Streak 7 Hari! 🔥',
            body: 'Selamat! Kamu aktif selama 7 hari berturut-turut. Dapatkan +50 XP bonus!',
          })
      }
    } else if (diffDays > 1) {
      newStreak = 1
    }
    // Jika diffDays === 0, biarkan streak tetap sama (siswa sudah aktif hari ini)
  }

  const { error: updateErr } = await supabase
    .from('students')
    .update({
      streak: newStreak,
      last_active: now.toISOString(),
    })
    .eq('id', userId)

  if (updateErr) {
    console.error('Error updating streak:', updateErr)
  }

  return newStreak;
}

/**
 * Memeriksa seluruh syarat kelayakan badge dan memberikan badge baru jika siswa memenuhinya.
 * Mengembalikan daftar nama badge baru yang diperoleh.
 */
export async function checkAndAwardBadges(userId: string, supabase: SupabaseClient, hasPerfectQuiz?: boolean): Promise<string[]> {
  // 1. Ambil data profil student
  const { data: student, error: studentErr } = await supabase
    .from('students')
    .select('badges, streak, placement_date, modules_completed')
    .eq('id', userId)
    .single() as any

  if (studentErr) {
    console.error('Error fetching student for badge checking:', studentErr)
    throw studentErr
  }

  const currentBadges: string[] = student.badges || []
  const newBadges: string[] = [...currentBadges]

  const addBadgeIfEligible = (badgeName: string) => {
    if (!newBadges.includes(badgeName)) {
      newBadges.push(badgeName)
    }
  }

  // Badge 1: first_step (Placement quiz dikerjakan)
  if (student.placement_date) {
    addBadgeIfEligible('first_step')
  }

  // Badge 2: on_fire (Streak >= 7)
  if (student.streak >= 7) {
    addBadgeIfEligible('on_fire')
  }

  // Badge 3: bookworm (Modul selesai >= 3)
  if (student.modules_completed && student.modules_completed.length >= 3) {
    addBadgeIfEligible('bookworm')
  }

  // Badge 4: vocabulary_master (Word wall count >= 50)
  const { count: wordCount, error: wordErr } = await supabase
    .from('word_wall')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (!wordErr && wordCount !== null && wordCount >= 50) {
    addBadgeIfEligible('vocabulary_master')
  }

  // Badge 5: journaling_pro (Jurnal count >= 10)
  const { count: journalCount, error: journalErr } = await supabase
    .from('journals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (!journalErr && journalCount !== null && journalCount >= 10) {
    addBadgeIfEligible('journaling_pro')
  }

  // Badge 6: quiz_champion (skor sempurna di kuis)
  if (hasPerfectQuiz) {
    addBadgeIfEligible('quiz_champion')
  }

  // Simpan jika ada badge baru
  const newlyAwarded = newBadges.filter(b => !currentBadges.includes(b))

  if (newlyAwarded.length > 0) {
    const { error: updateBadgesErr } = await supabase
      .from('students')
      .update({ badges: newBadges })
      .eq('id', userId)

    if (updateBadgesErr) {
      console.error('Error updating student badges:', updateBadgesErr)
      throw updateBadgesErr
    }

    // Insert in-app notifications untuk masing-masing badge baru
    for (const badge of newlyAwarded) {
      const readableBadge = badge.replace('_', ' ').toUpperCase()
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Pencapaian Baru! 🏆',
          body: `Selamat! Kamu berhasil mendapatkan lencana baru: "${readableBadge}".`,
        })
    }
  }

  // Kembalikan badge baru saja
  return newlyAwarded
}
