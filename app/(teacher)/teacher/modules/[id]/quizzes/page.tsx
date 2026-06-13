'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { QuizBuilder } from '@/components/teacher/QuizBuilder'
import { ArrowLeft } from 'lucide-react'

interface QuizzesPageProps {
  params: Promise<{ id: string }>
}

export default function ModuleQuizzesPage({ params }: QuizzesPageProps) {
  const { id: moduleId } = React.use(params)
  const supabase = createClient()
  const [moduleTitle, setModuleTitle] = useState('')
  const [moduleNumber, setModuleNumber] = useState(0)

  useEffect(() => {
    fetchModuleMeta()
  }, [moduleId])

  const fetchModuleMeta = async () => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('title, number')
        .eq('id', moduleId)
        .single() as any

      if (error) throw error
      if (data) {
        setModuleTitle(data.title)
        setModuleNumber(data.number)
      }
    } catch (err) {
      console.error('Error fetching module meta:', err)
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/teacher/modules"
          className="p-2 hover:bg-rose-50 text-gray-500 hover:text-rose-500 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border border-rose-100"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'var(--font-playfair)' }}>
            Kelola Soal Kuis
          </h2>
          <p className="text-sm text-gray-500">
            Modul {moduleNumber}: {moduleTitle}
          </p>
        </div>
      </div>

      {/* Quiz Builder */}
      <QuizBuilder moduleId={moduleId} />
    </div>
  )
}
