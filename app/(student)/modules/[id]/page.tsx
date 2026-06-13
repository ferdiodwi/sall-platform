import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ModuleDetailClient from '@/components/student/ModuleDetailClient'

export const revalidate = 3600 // ISR revalidate 1 hour

interface ModuleDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ModuleDetailPage({ params }: ModuleDetailPageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  // 1. Ambil data modul
  const { data: moduleData } = (await supabase
    .from('modules')
    .select('*')
    .eq('id', id)
    .single()) as any

  if (!moduleData) {
    notFound()
  }

  // 2. Ambil data konten level (beginner & intermediate)
  const { data: levels } = (await supabase
    .from('levels')
    .select('level, content_html')
    .eq('module_id', id)) as any

  // 3. Ambil worksheets
  const { data: worksheets } = (await supabase
    .from('worksheets')
    .select('*')
    .eq('module_id', id)) as any

  // 4. Ambil resources
  const { data: resources } = (await supabase
    .from('resources')
    .select('*')
    .eq('module_id', id)) as any

  // 5. Ambil reviews joined with users to get reviewer name
  const { data: reviews } = (await supabase
    .from('reviews')
    .select(`
      id,
      module_id,
      author_id,
      rating,
      comment,
      emoji,
      pinned,
      teacher_reply,
      created_at,
      users:author_id (
        name
      )
    `)
    .eq('module_id', id)) as any

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
