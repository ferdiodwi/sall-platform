'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { UserRole } from '@/types/app'

interface AuthState {
  user: User | null
  role: UserRole | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  })

  const supabase = createClient()

  useEffect(() => {
    // Ambil session awal
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single<{ role: string }>()
        setState({ user, role: (profile?.role as UserRole) ?? 'student', loading: false })
      } else {
        setState({ user: null, role: null, loading: false })
      }
    })

    // Subscribe ke perubahan auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single<{ role: string }>()
          setState({
            user: session.user,
            role: (profile?.role as UserRole) ?? 'student',
            loading: false,
          })
        } else {
          setState({ user: null, role: null, loading: false })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }, [supabase])

  return { ...state, signOut }
}
