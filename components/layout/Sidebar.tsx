'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getXpLevelInfo } from '../shared/XpLevelBadge'
import { Progress } from '../ui/progress'
import { 
  ClipboardCheck, 
  BookOpen, 
  BookText, 
  Trophy, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Flame, 
  Sparkles,
  LayoutDashboard,
  Compass
} from 'lucide-react'

interface SidebarProps {
  studentData: {
    name: string
    xp: number
    streak: number
    level: string | null
    class_id: string
  } | null
  loading: boolean
}

export function Sidebar({ studentData, loading }: SidebarProps) {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [modulesExpanded, setModulesExpanded] = useState(true)

  if (loading || !studentData) {
    return (
      <aside className="w-64 h-full bg-white/95 border-r border-rose-100/50 p-6 flex flex-col gap-6 animate-pulse">
        <div className="h-16 bg-rose-50 rounded-xl" />
        <div className="h-24 bg-rose-50 rounded-xl" />
        <div className="flex-1 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-11 bg-rose-50 rounded-lg" />
          ))}
        </div>
      </aside>
    )
  }

  const { name, xp, streak, level, class_id } = studentData
  const { levelName, emoji, nextLevelXp, prevLevelXp } = getXpLevelInfo(xp)
  const xpNeededForNext = nextLevelXp - prevLevelXp
  const currentXpInLevel = xp - prevLevelXp
  const xpPercentage = Math.min(Math.max((currentXpInLevel / xpNeededForNext) * 100, 0), 100)

  const menuItems = [
    { name: 'Dashboard', href: '/home', icon: LayoutDashboard },
    {
      name: 'Modul Pembelajaran',
      href: '/modules',
      icon: BookOpen,
      hasSub: true,
      subItems: [
        { name: 'Modul 1: Vocab Builder', href: '/modules/1' },
        { name: 'Modul 2: Reading Station', href: '/modules/2' },
        { name: 'Modul 3: Label Reader', href: '/modules/3' },
        { name: 'Modul 4: Catalogue Reader', href: '/modules/4' },
        { name: 'Modul 5: Sewing Instructions', href: '/modules/5' },
      ],
    },
    { name: 'Jurnal Digital', href: '/journal', icon: BookText },
    { name: 'My Word Wall', href: '/word-wall', icon: Compass },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Progress Tracker', href: '/progress', icon: Sparkles },
    { name: 'Pusat Bantuan', href: '/help', icon: HelpCircle },
  ]

  return (
    <aside className="w-64 h-full bg-white border-r border-rose-100 flex flex-col shrink-0 shadow-sm">
      {/* Profile Header */}
      <div className="p-5 border-b border-rose-50 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-rose-200">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-800 truncate">{name}</h2>
            <p className="text-xs text-rose-500 font-medium truncate">{class_id}</p>
          </div>
        </div>

        {/* Level and gamification stats */}
        <div className="bg-rose-50/50 rounded-2xl p-3 border border-rose-100/50">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-rose-800 flex items-center gap-1">
              <span>{emoji}</span> {levelName}
            </span>
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">
              Level {level === 'intermediate' ? 'Intermediate' : 'Beginner'}
            </span>
          </div>

          <Progress value={xpPercentage} className="h-2 bg-rose-100 [&>div]:bg-gradient-to-r [&>div]:from-rose-500 [&>div]:to-pink-500" />
          
          <div className="flex justify-between items-center mt-1 text-[10px] text-rose-600 font-medium">
            <span>{xp} XP</span>
            {nextLevelXp < 999999 ? (
              <span>{nextLevelXp} XP</span>
            ) : (
              <span>MAX Level</span>
            )}
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center justify-center gap-2 py-1.5 px-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl text-white shadow-sm shadow-rose-150">
          <Flame size={16} className="animate-pulse" />
          <span className="text-xs font-bold">{streak} HARI STREAK</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-rose-100">
        {menuItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href))
          const Icon = item.icon

          if (item.hasSub) {
            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => setModulesExpanded(!modulesExpanded)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer min-h-[44px] ${
                    isActive 
                      ? 'bg-rose-50 text-rose-600' 
                      : 'text-gray-600 hover:bg-rose-50/30 hover:text-rose-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-rose-500' : 'text-gray-400'} />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight 
                    size={16} 
                    className={`text-gray-400 transition-transform duration-200 ${modulesExpanded ? 'rotate-90' : ''}`} 
                  />
                </button>

                {modulesExpanded && (
                  <div className="pl-9 space-y-0.5 border-l border-rose-100/70 ml-5 py-1">
                    {item.subItems?.map(sub => {
                      const isSubActive = pathname === sub.href
                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={`block px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 min-h-[40px] flex items-center ${
                            isSubActive 
                              ? 'text-rose-600 font-semibold bg-rose-50/50' 
                              : 'text-gray-500 hover:text-rose-500 hover:bg-rose-50/20'
                          }`}
                        >
                          {sub.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] ${
                isActive 
                  ? 'bg-rose-50 text-rose-600 font-semibold border-l-4 border-rose-500 pl-2' 
                  : 'text-gray-600 hover:bg-rose-50/30 hover:text-rose-500'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-rose-500' : 'text-gray-400'} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-rose-50">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-500 transition-all duration-200 min-h-[44px] cursor-pointer"
        >
          <LogOut size={18} className="text-gray-400 group-hover:text-red-500" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  )
}
