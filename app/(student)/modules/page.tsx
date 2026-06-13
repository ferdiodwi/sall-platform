import { createServerClient } from '@/lib/supabase/server'
import ModulesListClient from '@/components/student/ModulesListClient'

export const revalidate = 3600 // ISR revalidate 1 hour

export default async function ModulesPage() {
  const supabase = await createServerClient()
  
  // Ambil semua modul yang dipublikasikan (published = true)
  const { data: modules } = (await supabase
    .from('modules')
    .select('*')
    .eq('published', true)
    .order('order', { ascending: true })) as any

  // Ambil semua review untuk perhitungan rating rata-rata
  const { data: reviews } = (await supabase
    .from('reviews')
    .select('module_id, rating')) as any

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">
          Modul Pembelajaran 👗
        </h1>
        <p className="mt-2 text-sm text-gray-500 font-medium">
          Daftar materi Bahasa Inggris Fashion terstruktur kelas XI Tata Busana SMKN 2 Bondowoso.
        </p>
      </div>

      {/* Client List Wrapper */}
      <ModulesListClient 
        initialModules={modules || []} 
        reviews={reviews || []} 
      />
    </div>
  )
}
