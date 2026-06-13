'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from './Sidebar'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import NotificationBell from '@/components/shared/NotificationBell'
import { 
  Menu, 
  User as UserIcon, 
  LogOut, 
  ChevronDown,
  X 
} from 'lucide-react'

interface TopBarProps {
  studentData: {
    name: string
    email: string
    xp: number
    streak: number
    level: string | null
    class_id: string
  } | null
  loading: boolean
}

export function TopBar({ studentData, loading }: TopBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { signOut, user } = useAuth()
  const supabase = createClient()

  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Ambil judul halaman dinamis
  const getPageTitle = () => {
    if (pathname === '/home') return 'Dashboard'
    if (pathname.startsWith('/placement-quiz')) return 'Placement Quiz'
    if (pathname.startsWith('/modules')) {
      const match = pathname.match(/\/modules\/(\d+)/)
      if (match) return `Modul ${match[1]}`
      return 'Modul Pembelajaran'
    }
    if (pathname.startsWith('/journal')) return 'Jurnal Digital'
    if (pathname.startsWith('/word-wall')) return 'My Word Wall'
    if (pathname.startsWith('/leaderboard')) return 'Leaderboard Mingguan'
    if (pathname.startsWith('/progress')) return 'Progress Tracker'
    if (pathname.startsWith('/help')) return 'Pusat Bantuan'
    return 'SALL Platform'
  }

  // Tutup drawer saat pathname ganti
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  return (
    <header className="h-16 border-b border-rose-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Drawer */}
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden text-gray-500 hover:text-rose-500 min-h-[44px] min-w-[44px]">
                <Menu size={20} />
              </Button>
            }
          />
          <SheetContent side="left" className="p-0 w-64 border-r border-rose-100 bg-white">
            <Sidebar studentData={studentData} loading={loading} />
          </SheetContent>
        </Sheet>

        <h1 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'var(--font-playfair)' }}>
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <NotificationBell userId={user?.id || null} />

        <Separator orientation="vertical" className="h-6 bg-rose-150 hidden md:block" />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown)
            }}
            className="flex items-center gap-2 hover:bg-rose-50/50 p-1.5 rounded-xl transition-all duration-200 cursor-pointer min-h-[44px]"
          >
            <Avatar className="w-8 h-8 ring-2 ring-rose-100">
              <AvatarFallback className="bg-rose-500 text-white font-bold text-xs">
                {studentData?.name ? studentData.name.charAt(0).toUpperCase() : '?'}
              </AvatarFallback>
            </Avatar>
            <ChevronDown size={14} className="text-gray-400 hidden md:block" />
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-rose-50 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-rose-50">
                <p className="text-xs font-semibold text-gray-800 truncate">{studentData?.name}</p>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">{studentData?.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowProfileDropdown(false)
                  router.push('/progress')
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-600 hover:bg-rose-50/40 hover:text-rose-600 transition-colors text-left min-h-[44px]"
              >
                <UserIcon size={14} />
                <span>Profil saya</span>
              </button>
              <button
                onClick={signOut}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 transition-colors text-left min-h-[44px]"
              >
                <LogOut size={14} />
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
