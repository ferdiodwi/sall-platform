import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { XpLevelBadge, getXpLevelInfo } from '@/components/shared/XpLevelBadge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Flame, 
  BookOpen, 
  Award, 
  Lightbulb, 
  TrendingUp, 
  ArrowRight,
  Star,
  Trophy
} from 'lucide-react'

// Helper to get current ISO Week (Format: YYYY-Www)
function getCurrentISOWeek(): string {
  const today = new Date()
  const target = new Date(today.valueOf())
  const dayNumber = (today.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNumber + 3)
  const firstThursday = target.valueOf()
  target.setMonth(0, 1)
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7)
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000)
  const year = new Date(firstThursday).getFullYear()
  const weekString = weekNumber < 10 ? `0${weekNumber}` : `${weekNumber}`
  return `${year}-W${weekString}`
}

export default async function StudentHomePage() {
  const supabase = await createServerClient()

  // Get current user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 1. Fetch user & student profiles
  const { data: userProfile } = await supabase
    .from('users')
    .select('name, class_id')
    .eq('id', user.id)
    .single() as any

  const { data: studentProfile } = await supabase
    .from('students')
    .select('xp, streak, level, modules_completed, badges')
    .eq('id', user.id)
    .single() as any

  if (!userProfile || !studentProfile) {
    redirect('/login')
  }

  const { name } = userProfile
  const { xp, streak, level: studentLevel, modules_completed = [], badges = [] } = studentProfile
  const { levelName, emoji, nextLevelXp, prevLevelXp } = getXpLevelInfo(xp)

  // 2. Fetch AI / Smart Feedback
  const { data: latestFeedback } = await supabase
    .from('ai_feedback')
    .select('weak_topic, message, recommended_activity, est_time_minutes')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle() as any

  // 3. Fetch All Modules
  const { data: dbModules } = await supabase
    .from('modules')
    .select('id, number, title, tagline, emoji, published')
    .order('number', { ascending: true }) as any

  // 4. Fetch Reviews (to get average rating)
  const { data: allReviews } = await supabase
    .from('reviews')
    .select('module_id, rating') as any

  // Calculate ratings per module
  const ratingMap: Record<string, { total: number; count: number }> = {}
  allReviews?.forEach((rev: any) => {
    if (!ratingMap[rev.module_id]) {
      ratingMap[rev.module_id] = { total: 0, count: 0 }
    }
    ratingMap[rev.module_id].total += rev.rating
    ratingMap[rev.module_id].count += 1
  })

  // 5. Fetch Weekly Leaderboard
  const currentWeek = getCurrentISOWeek()
  const { data: leaderboardData } = await supabase
    .from('leaderboards')
    .select('user_id, xp, users(name)')
    .eq('week_id', currentWeek)
    .order('xp', { ascending: false })
    .limit(3) as any

  // Find next target module
  const incompleteModules = dbModules?.filter((m: any) => !modules_completed.includes(m.id.toString()) && m.published) || []
  const nextModule = incompleteModules[0] || dbModules?.find((m: any) => m.number === 1)

  // XP progress calculations
  const xpNeeded = nextLevelXp - prevLevelXp
  const currentXpInLevel = xp - prevLevelXp
  const progressPercent = Math.min(Math.max((currentXpInLevel / xpNeeded) * 100, 0), 100)

  return (
    <div className="space-y-8 pb-12">
      {/* SECTION 1: HERO CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-rose-500 to-pink-600 text-white shadow-xl shadow-rose-200/50 p-6 md:p-8">
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 text-9xl">👗</div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Kelas XI Tata Busana
              </span>
              <XpLevelBadge xp={xp} className="bg-white/10 border-white/20 text-white shadow-none" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold font-playfair leading-tight">
              Selamat datang, {name}! 👋
            </h2>
            
            <p className="text-sm text-rose-100 max-w-xl">
              Siap melatih kemampuan bahasa Inggris fashion kamu hari ini? Dapatkan XP dan jaga streak belajarmu!
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-start md:items-end gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
              <Flame className="text-amber-400 fill-amber-400" size={20} />
              <span className="font-bold text-sm tracking-wide">{streak} HARI STREAK</span>
            </div>
            
            {nextModule && (
              <Link href={`/modules/${nextModule.number}`}>
                <Button className="bg-white hover:bg-rose-50 text-rose-600 border-0 font-bold px-6 py-5 rounded-2xl shadow-lg cursor-pointer">
                  <span>Lanjut Belajar</span>
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* SECTION 2: PROGRESS SAYA */}
          <Card className="border-rose-100 bg-white/50 backdrop-blur-sm shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-rose-500" />
                <span>Progress Belajar</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* XP Bar */}
                <div className="md:col-span-2 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-gray-600">
                    <span>Level: {levelName}</span>
                    <span>{xp} / {nextLevelXp < 999999 ? `${nextLevelXp} XP` : 'MAX'}</span>
                  </div>
                  <Progress value={progressPercent} className="h-3 bg-rose-50 [&>div]:bg-gradient-to-r [&>div]:from-rose-500 [&>div]:to-pink-500" />
                  <p className="text-[10px] text-gray-400 font-medium">
                    {nextLevelXp < 999999 ? `${nextLevelXp - xp} XP lagi untuk naik level berikutnya.` : 'Kamu telah meraih level tertinggi!'}
                  </p>
                </div>

                {/* Modules Completed Count */}
                <div className="bg-rose-50/30 rounded-2xl p-4 border border-rose-100/30 flex flex-col justify-center items-center text-center">
                  <BookOpen className="text-rose-500 mb-1.5" size={24} />
                  <span className="text-2xl font-bold text-gray-800">
                    {modules_completed.length} / 5
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">Modul Selesai</span>
                </div>
              </div>

              {/* Badges Earned */}
              {badges.length > 0 && (
                <div className="border-t border-rose-50/50 pt-4">
                  <h4 className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-1.5">
                    <Award size={16} className="text-rose-500" />
                    <span>Badge Terbaru</span>
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {badges.slice(-4).map((badgeName: string) => (
                      <span 
                        key={badgeName}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-100 text-xs font-semibold text-gray-700 shadow-sm"
                      >
                        <span className="text-sm">🏆</span>
                        <span className="capitalize">{badgeName.replace('_', ' ')}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 3: REKOMENDASI AI / SMART ENGINE */}
          <Card className="border-rose-100 bg-white/50 backdrop-blur-sm shadow-sm rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Lightbulb size={20} className="text-rose-500 animate-pulse" />
                <span>Rekomendasi Belajar</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestFeedback ? (
                <div className="space-y-4">
                  <div className="bg-rose-50/50 border border-rose-100/50 rounded-2xl p-4 flex gap-4">
                    <div className="text-3xl shrink-0">💡</div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wide">
                        Fokus Utama: {latestFeedback.weak_topic}
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {latestFeedback.message}
                      </p>
                    </div>
                  </div>

                  {latestFeedback.recommended_activity && (
                    <div className="flex justify-between items-center bg-white border border-rose-50/50 rounded-xl p-3 shadow-sm">
                      <div className="text-xs font-medium text-gray-600">
                        Aktivitas: <span className="font-semibold text-gray-800">{latestFeedback.recommended_activity}</span>
                        {latestFeedback.est_time_minutes && (
                          <span className="text-rose-500 ml-2">({latestFeedback.est_time_minutes} menit)</span>
                        )}
                      </div>
                      <Link href="/modules">
                        <Button size="sm" variant="ghost" className="text-rose-500 hover:bg-rose-50 text-xs font-semibold">
                          <span>Mulai</span>
                          <ArrowRight size={12} className="ml-1" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <p className="text-sm text-gray-500">
                    Selesaikan kuis pertamamu agar sistem dapat merekomendasikan bahan belajar terbaik!
                  </p>
                  <Link href="/placement-quiz">
                    <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white border-0 rounded-xl mt-1.5 cursor-pointer">
                      Mulai Placement Quiz
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* SECTION 5: LEADERBOARD PREVIEW */}
        <div className="space-y-6">
          <Card className="border-rose-100 bg-white shadow-sm rounded-2xl h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Trophy size={20} className="text-amber-500" />
                  <span>Leaderboard</span>
                </CardTitle>
                <Link href="/leaderboard" className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors">
                  Lihat Semua →
                </Link>
              </div>
              <CardDescription className="text-xs text-rose-400">
                Peringkat XP Kelas Minggu Ini
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {leaderboardData && leaderboardData.length > 0 ? (
                  leaderboardData.map((row: any, index: number) => {
                    const isCurrentUser = row.user_id === user.id
                    const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
                    return (
                      <div 
                        key={row.user_id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isCurrentUser 
                            ? 'bg-rose-50/70 border-rose-200 shadow-sm shadow-rose-100' 
                            : 'bg-rose-50/10 border-rose-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{rankEmoji}</span>
                          <span className={`text-xs font-semibold ${isCurrentUser ? 'text-rose-700 font-bold' : 'text-gray-700'}`}>
                            {row.users?.name || 'Siswa SALL'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-rose-600">{row.xp} XP</span>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center text-xs text-gray-400 py-6">Belum ada aktivitas minggu ini</p>
                )}
              </div>

              {/* Weekly Challenge Banner */}
              <div className="bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-2xl p-4 space-y-2.5 shadow-md">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-amber-300" />
                  <h4 className="text-xs font-bold tracking-wide uppercase">Challenge Minggu Ini</h4>
                </div>
                <p className="text-[11px] text-rose-100 leading-relaxed font-medium">
                  Selesaikan Placement Quiz dan raih 100 XP untuk bonus +50 XP ekstra!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SECTION 4: GRID MODUL */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 font-playfair">
          <BookOpen size={20} className="text-rose-500" />
          <span>Modul Pembelajaran</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dbModules?.map((m: any) => {
            const isCompleted = modules_completed.includes(m.id.toString())
            // Calculate ratings
            const ratings = ratingMap[m.id.toString()]
            const averageRating = ratings ? (ratings.total / ratings.count).toFixed(1) : '5.0'

            return (
              <Card 
                key={m.id}
                className={`border-rose-100 bg-white hover:shadow-md hover:border-rose-200 transition-all duration-200 rounded-2xl flex flex-col justify-between ${
                  !m.published ? 'opacity-60 select-none' : ''
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <span className="text-3xl">{m.emoji || '📚'}</span>
                    {m.published ? (
                      isCompleted ? (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Selesai ✅
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Aktif 📖
                        </span>
                      )
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Segera Hadir
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 mt-3">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                      Modul {m.number}
                    </span>
                    <CardTitle className="text-base font-bold text-gray-800 leading-snug">
                      {m.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col justify-between pt-0">
                  <p className="text-xs text-gray-500 leading-relaxed mt-1">
                    {m.tagline}
                  </p>

                  <div className="flex justify-between items-center border-t border-rose-50/50 pt-3 mt-4">
                    {/* Level Tag & Rating */}
                    <div className="flex items-center gap-2">
                      <span className="bg-sky-50 text-sky-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                        <span>Intermediate</span>
                      </span>
                      <div className="flex items-center gap-0.5 text-amber-500 text-[11px] font-semibold">
                        <Star size={12} className="fill-amber-500" />
                        <span>{averageRating}</span>
                      </div>
                    </div>

                    {m.published ? (
                      <Link href={`/modules/${m.number}`}>
                        <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold px-4 cursor-pointer">
                          Belajar
                        </Button>
                      </Link>
                    ) : (
                      <Button size="sm" disabled className="bg-gray-100 text-gray-400 rounded-xl text-xs font-semibold px-4">
                        Kunci
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
