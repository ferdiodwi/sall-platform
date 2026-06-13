'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardCheck,
  MessageSquare,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react'

interface TeacherSidebarProps {
  teacherData: {
    name: string
    email: string
  } | null
  loading: boolean
}

export function TeacherSidebar({ teacherData, loading }: TeacherSidebarProps) {
  const pathname = usePathname()
  const { signOut } = useAuth()

  if (loading || !teacherData) {
    return (
      <aside className="w-64 h-full bg-white/95 border-r border-rose-100/50 p-6 flex flex-col gap-6 animate-pulse">
        <div className="h-16 bg-rose-50 rounded-xl" />
        <div className="flex-1 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-11 bg-rose-50 rounded-lg" />
          ))}
        </div>
      </aside>
    )
  }

  const { name } = teacherData

  const menuItems = [
    { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Kelola Modul', href: '/teacher/modules', icon: BookOpen },
    { name: 'Data Siswa', href: '/teacher/students', icon: Users },
    { name: 'Worksheet', href: '/teacher/worksheets', icon: ClipboardCheck },
    { name: 'Review Modul', href: '/teacher/reviews', icon: MessageSquare },
    { name: 'Pengaturan AI', href: '/teacher/settings', icon: Settings },
  ]

  return (
    <aside className="w-64 h-full bg-white border-r border-rose-100 flex flex-col shrink-0 shadow-sm">
      {/* Profile Header */}
      <div className="p-5 border-b border-rose-50 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-rose-200">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-800 truncate">{name}</h2>
            <p className="text-xs text-rose-600 font-medium truncate flex items-center gap-1">
              <Sparkles size={12} className="text-rose-500" /> Guru / Admin
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-rose-100">
        {menuItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/teacher/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon

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
