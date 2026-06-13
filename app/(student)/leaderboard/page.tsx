'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trophy, Medal, Crown, Star, Sparkles } from 'lucide-react'
import { getISOWeekId } from '@/lib/xp'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface LeaderboardEntry {
  id: string
  user_id: string
  xp: number
  week_id: string
  users: {
    name: string
    photo_url: string | null
  } | null
}

export default function LeaderboardPage() {
  const supabase = createClient()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const weekId = getISOWeekId()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parallelkan fetch user + leaderboard
        const [{ data: { session } }, { data, error }] = await Promise.all([
          supabase.auth.getSession(),
          supabase.from('leaderboards')
            .select('id, user_id, xp, week_id, users(name, photo_url)')
            .eq('week_id', weekId)
            .order('xp', { ascending: false })
            .limit(20) as any,
        ])

        setCurrentUser(session?.user ?? null)

        if (error) throw error
        if (data) {
          setLeaderboard(data)
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // 3. Realtime subscription to reload leaderboard on any update
    const channel = supabase
      .channel('leaderboards-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboards',
          filter: `week_id=eq.${weekId}`,
        },
        async () => {
          const { data } = await supabase
            .from('leaderboards')
            .select('id, user_id, xp, week_id, users(name, photo_url)')
            .eq('week_id', weekId)
            .order('xp', { ascending: false })
            .limit(20) as any
          if (data) {
            setLeaderboard(data)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, weekId])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-rose-50/10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
          <span className="text-sm font-bold text-rose-500 uppercase tracking-widest animate-pulse">Memuat Leaderboard...</span>
        </div>
      </div>
    )
  }

  // Split Top 3 and Ranks 4-20
  const topThree = leaderboard.slice(0, 3)
  const remaining = leaderboard.slice(3)

  // Find current user's rank
  const currentUserIndex = leaderboard.findIndex((item) => item.user_id === currentUser?.id)
  const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : null
  const currentUserEntry = currentUserIndex !== -1 ? leaderboard[currentUserIndex] : null

  // Helper colors/icons for ranks
  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="text-amber-500 fill-amber-500" size={20} />
    if (rank === 2) return <Medal className="text-slate-400 fill-slate-400" size={20} />
    if (rank === 3) return <Medal className="text-amber-700 fill-amber-700" size={20} />
    return <span className="font-extrabold text-xs text-gray-400">#{rank}</span>
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-rose-50/10 via-white to-rose-50/5 p-6 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute -right-10 -bottom-10 opacity-10 text-white">
            <Trophy size={200} />
          </div>
          <div className="flex flex-col gap-2 text-center md:text-left z-10">
            <span className="bg-white/20 text-white border border-white/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest self-center md:self-start">
              Week: {weekId}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">Leaderboard Mode Fashion</h2>
            <p className="text-xs md:text-sm font-semibold text-rose-50 leading-relaxed max-w-md">
              Kumpulkan XP dari kuis, worksheet, jurnal, dan word wall untuk naik ke peringkat teratas kelasmu!
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 p-4 rounded-2xl backdrop-blur-sm shadow-inner z-10 shrink-0">
            <Trophy className="text-yellow-300 animate-pulse" size={28} />
            <div className="text-left">
              <span className="text-[10px] font-extrabold uppercase text-rose-100">Peringkatmu</span>
              <p className="text-lg font-black leading-none mt-0.5">
                {currentUserRank ? `#${currentUserRank}` : 'Belum Terdaftar'}
              </p>
            </div>
          </div>
        </div>

        {/* Podium Top 3 */}
        {topThree.length > 0 && (
          <div className="flex flex-col md:flex-row justify-center items-end gap-6 mt-4">
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="w-full md:w-1/3 order-2 md:order-1 flex flex-col items-center">
                <div className="relative group flex flex-col items-center p-6 bg-white border border-rose-100 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 w-full text-center">
                  <div className="absolute -top-5 w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center font-black text-sm">
                    2
                  </div>
                  <Avatar className="w-16 h-16 ring-4 ring-slate-100 mt-2">
                    <AvatarFallback className="bg-gradient-to-br from-slate-300 to-slate-400 text-white font-extrabold text-lg">
                      {topThree[1].users?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="font-extrabold text-sm text-gray-800 mt-3 truncate w-full">
                    {topThree[1].users?.name}
                  </h4>
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-3 py-1 rounded-xl text-xs font-bold text-slate-600 mt-2">
                    <Star size={12} className="text-slate-400 fill-slate-400" />
                    <span>{topThree[1].xp} XP</span>
                  </div>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <div className="w-full md:w-1/3 order-1 md:order-2 flex flex-col items-center relative -top-3 md:-top-6">
                <div className="relative group flex flex-col items-center p-8 bg-gradient-to-b from-amber-50/50 via-white to-white border-2 border-amber-200 rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 w-full text-center">
                  <div className="absolute -top-7 w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-md animate-bounce-slow">
                    <Crown size={28} className="fill-white" />
                  </div>
                  <Avatar className="w-20 h-20 ring-4 ring-amber-100 mt-4">
                    <AvatarFallback className="bg-gradient-to-br from-amber-400 to-yellow-500 text-white font-extrabold text-2xl">
                      {topThree[0].users?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="font-black text-base text-gray-800 mt-4 truncate w-full">
                    {topThree[0].users?.name}
                  </h4>
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-4 py-1.5 rounded-xl text-xs font-black text-amber-600 mt-2.5">
                    <Sparkles size={13} className="text-amber-500 fill-amber-500" />
                    <span>{topThree[0].xp} XP</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div className="w-full md:w-1/3 order-3 flex flex-col items-center">
                <div className="relative group flex flex-col items-center p-6 bg-white border border-rose-100 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 w-full text-center">
                  <div className="absolute -top-5 w-10 h-10 rounded-2xl bg-amber-50/50 border border-amber-700/20 text-amber-800 flex items-center justify-center font-black text-sm">
                    3
                  </div>
                  <Avatar className="w-16 h-16 ring-4 ring-amber-50 mt-2">
                    <AvatarFallback className="bg-gradient-to-br from-amber-600 to-amber-700 text-white font-extrabold text-lg">
                      {topThree[2].users?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="font-extrabold text-sm text-gray-800 mt-3 truncate w-full">
                    {topThree[2].users?.name}
                  </h4>
                  <div className="flex items-center gap-1 bg-rose-50/30 border border-rose-100/50 px-3 py-1 rounded-xl text-xs font-bold text-amber-750 mt-2">
                    <Star size={12} className="text-amber-700 fill-amber-700" />
                    <span>{topThree[2].xp} XP</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* List of remaining ranks */}
        <div className="bg-white border border-rose-100/80 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-rose-50 bg-rose-50/10 flex justify-between items-center">
            <h3 className="font-extrabold text-xs text-gray-500 uppercase tracking-widest">Peringkat 4 - 20</h3>
            <div className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Realtime Active</span>
            </div>
          </div>

          <div className="flex flex-col divide-y divide-rose-50">
            {remaining.length === 0 && topThree.length === 0 ? (
              <p className="text-center text-xs text-gray-400 font-bold py-16">
                Belum ada siswa yang mendapatkan XP minggu ini. Jadilah yang pertama!
              </p>
            ) : remaining.length === 0 ? (
              <p className="text-center text-[11px] text-gray-400 font-bold py-8">
                Hanya top 3 yang terdaftar saat ini.
              </p>
            ) : (
              remaining.map((item, index) => {
                const rank = index + 4
                const isSelf = item.user_id === currentUser?.id

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between px-6 py-4 transition-all ${
                      isSelf ? 'bg-rose-500/5 font-semibold' : 'hover:bg-rose-50/10'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-8 flex justify-center shrink-0">
                        {getRankBadge(rank)}
                      </div>
                      <Avatar className="w-9 h-9 ring-1 ring-rose-100 shrink-0">
                        <AvatarFallback className="bg-rose-500 text-white font-bold text-xs">
                          {item.users?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs md:text-sm text-gray-800 font-bold truncate max-w-[150px] sm:max-w-[300px]">
                        {item.users?.name}
                      </span>
                      {isSelf && (
                        <span className="text-[9px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider scale-90">
                          Kamu
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-extrabold text-gray-700">
                      <span>{item.xp} XP</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Display Current User rank card if not in top 20 */}
        {currentUserRank && currentUserRank > 20 && currentUserEntry && (
          <div className="bg-rose-500/10 border-2 border-rose-400/30 rounded-3xl p-5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4 min-w-0">
              <span className="font-extrabold text-xs text-rose-500 shrink-0">#{currentUserRank}</span>
              <Avatar className="w-10 h-10 ring-2 ring-rose-300 shrink-0">
                <AvatarFallback className="bg-rose-500 text-white font-bold text-xs">
                  {currentUserEntry.users?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <h4 className="font-black text-xs md:text-sm text-gray-800 leading-snug">{currentUserEntry.users?.name}</h4>
                <p className="text-[10px] text-gray-400 font-bold mt-0.5">Berada di luar top 20</p>
              </div>
            </div>
            <span className="text-xs font-black text-rose-600 bg-white border border-rose-200 px-4 py-1.5 rounded-xl">
              {currentUserEntry.xp} XP
            </span>
          </div>
        )}

      </div>
    </div>
  )
}
