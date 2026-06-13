import { createServerClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ModuleDetailClient from '@/components/student/ModuleDetailClient'

export const revalidate = 3600 // ISR revalidate 1 hour

interface ModuleDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ModuleDetailPage({ params }: ModuleDetailPageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  // Fetch modul yang diminta + semua modul untuk validasi urutan (paralel)
  const [
    { data: moduleData },
    { data: allModules },
    { data: { session } },
  ] = await Promise.all([
    supabase.from('modules').select('*').eq('id', id).single() as any,
    supabase.from('modules').select('id, order').eq('published', true).order('order', { ascending: true }) as any,
    supabase.auth.getSession(),
  ])

  if (!moduleData) {
    notFound()
  }

  // Cek apakah modul ini terkunci (sequential locking)
  if (session?.user && allModules && allModules.length > 0) {
    // Ambil profil siswa untuk modules_completed
    const { data: studentProfile } = await supabase
      .from('students')
      .select('modules_completed')
      .eq('id', session.user.id)
      .single() as any

    const completedIds: string[] = studentProfile?.modules_completed || []

    // Temukan index modul yang diminta dalam daftar urutan
    const sortedModules = [...allModules].sort((a: any, b: any) => a.order - b.order)
    const moduleIndex = sortedModules.findIndex((m: any) => m.id === id)

    // Jika bukan modul pertama, cek apakah modul sebelumnya sudah selesai
    if (moduleIndex > 0) {
      const prevModule = sortedModules[moduleIndex - 1]
      const isPrevCompleted = completedIds.includes(prevModule.id)

      if (!isPrevCompleted) {
        // Modul terkunci — redirect kembali ke daftar modul
        redirect('/modules')
      }
    }
  }

  // Fetch konten modul secara PARALEL
  const [{ data: levels }, { data: worksheets }, { data: resources }, { data: reviews }] = await Promise.all([
    supabase.from('levels').select('level, content_html').eq('module_id', id) as any,
    supabase.from('worksheets').select('*').eq('module_id', id) as any,
    supabase.from('resources').select('*').eq('module_id', id) as any,
    supabase.from('reviews').select(`
      id, module_id, author_id, rating, comment, emoji, pinned, teacher_reply, created_at,
      users:author_id ( name )
    `).eq('module_id', id) as any,
  ])

  const formattedReviews = reviews?.map((r: any) => ({
    ...r,
    author_name: r.users?.name || 'Siswa ALIP',
  })) || []

  return (
    <ModuleDetailClient
      module={moduleData}
      levels={levels || []}
      worksheets={worksheets || []}
      resources={resources || []}
      reviews={formattedReviews}
    />
  )
}
