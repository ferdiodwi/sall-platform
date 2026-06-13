import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerClient()

  // Ambil user dari auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch profil & student details secara server-side
  const { data: userProfile } = await supabase
    .from('users')
    .select('name, email, class_id, role')
    .eq('id', user.id)
    .single() as any

  // Pastikan user adalah student, jika teacher redirect ke teacher dashboard
  if (userProfile?.role === 'teacher') {
    redirect('/teacher/dashboard')
  }

  const { data: studentProfile } = await supabase
    .from('students')
    .select('xp, streak, level')
    .eq('id', user.id)
    .single() as any

  const studentData = userProfile && studentProfile ? {
    name: userProfile.name,
    email: userProfile.email,
    class_id: userProfile.class_id ?? 'Belum memilih kelas',
    xp: studentProfile.xp,
    streak: studentProfile.streak,
    level: studentProfile.level,
  } : null

  return (
    <div className="flex h-screen w-screen bg-rose-50/20 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar studentData={studentData} loading={false} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar studentData={studentData} loading={false} />
        <main className="flex-1 overflow-y-auto bg-rose-50/10 p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
