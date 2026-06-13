import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { TeacherSidebar } from '@/components/layout/TeacherSidebar'
import { TeacherTopBar } from '@/components/layout/TeacherTopBar'

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerClient()

  // Gunakan getSession (baca cookie) — TIDAK ada network call ke Supabase
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    redirect('/login')
  }

  // Middleware sudah menjamin role = teacher, jadi tidak perlu cek role lagi
  // Fetch profil saja untuk kebutuhan UI (nama & email di sidebar/topbar)
  const { data: userProfile } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', session.user.id)
    .single() as any

  const teacherData = userProfile ? {
    name: userProfile.name,
    email: userProfile.email,
  } : null

  return (
    <div className="flex h-screen w-screen bg-rose-50/20 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <TeacherSidebar teacherData={teacherData} loading={false} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TeacherTopBar teacherData={teacherData} loading={false} />
        <main className="flex-1 overflow-y-auto bg-rose-50/10 p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
