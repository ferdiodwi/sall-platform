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

// Baca role dari cookie browser (di-set saat login) — tanpa query DB
function getRoleFromCookie(): UserRole | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)user-role=([^;]+)/)
  return (match?.[1] as UserRole) ?? null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  })

  const supabase = createClient()

  useEffect(() => {
    // Ambil session awal — role dari cookie, tidak ada query DB
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const role = getRoleFromCookie() ?? 'student'
        setState({ user, role, loading: false })
      } else {
        setState({ user: null, role: null, loading: false })
      }
    })

    // Subscribe ke perubahan auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          const role = getRoleFromCookie() ?? 'student'
          setState({ user: session.user, role, loading: false })
        } else {
          setState({ user: null, role: null, loading: false })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    // Hapus cookie role saat logout
    document.cookie = 'user-role=; max-age=0; path=/'
    window.location.href = '/login'
  }, [supabase])

  return { ...state, signOut }
}
