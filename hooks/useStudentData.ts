'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface StudentData {
  id: string
  name: string
  email: string
  class_id: string
  xp: number
  streak: number
  level: 'beginner' | 'intermediate' | null
  placement_score: number | null
  vocab_mastered: number
  badges: string[]
  modules_completed: string[]
}

export function useStudentData() {
  const [data, setData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const refreshData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setData(null)
        setLoading(false)
        return
      }

      // Fetch user profile
      const { data: userProfile, error: userErr } = await supabase
        .from('users')
        .select('name, email, class_id')
        .eq('id', user.id)
        .single() as any

      if (userErr) throw userErr

      // Fetch student details
      const { data: studentProfile, error: studentErr } = await supabase
        .from('students')
        .select('xp, streak, level, placement_score, vocab_mastered, badges, modules_completed')
        .eq('id', user.id)
        .single() as any

      if (studentErr) throw studentErr

      setData({
        id: user.id,
        name: userProfile.name,
        email: userProfile.email,
        class_id: userProfile.class_id ?? 'Belum memilih kelas',
        xp: studentProfile.xp,
        streak: studentProfile.streak,
        level: studentProfile.level as 'beginner' | 'intermediate' | null,
        placement_score: studentProfile.placement_score,
        vocab_mastered: studentProfile.vocab_mastered ?? 0,
        badges: studentProfile.badges ?? [],
        modules_completed: studentProfile.modules_completed ?? [],
      })
    } catch (err: any) {
      console.error('Error fetching student data:', err)
      setError(err.message || 'Gagal mengambil data siswa')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refreshData }
}
